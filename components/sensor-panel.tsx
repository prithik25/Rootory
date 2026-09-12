"use client";
import { useEffect,useState } from 'react';
import { supabase } from '@/lib/supabase';
import { moistureBand } from '@/lib/sensor';
type Reading={id:string;moisture_percent:number;recorded_at:string;source:string};
type Device={id:string;expires_at:string};
export function SensorPanel({plantId,owner}:{plantId:string;owner:string}){
 const [rows,setRows]=useState<Reading[]>([]),[device,setDevice]=useState<Device|null>(null);
 const [key,setKey]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 const [busy,setBusy]=useState(false),[value,setValue]=useState(68),[now,setNow]=useState(Date.now());
 const [controls,setControls]=useState(false);
 useEffect(()=>{
  if(!owner)return;let active=true,inFlight=false;
  async function load(){if(inFlight||document.hidden)return;inFlight=true;
   try{const db=supabase();const [readings,devices]=await Promise.all([
    db.from('sensor_readings').select('id,moisture_percent,recorded_at,source').eq('owner_id',owner).eq('plant_id',plantId).order('recorded_at',{ascending:false}).limit(10),
    db.from('sensor_devices').select('id,expires_at').eq('owner_id',owner).eq('plant_id',plantId).maybeSingle()]);
    if(!active)return;if(readings.error||devices.error){setError('Sensor connection unavailable. Check your connection and that migration 006 is applied.');return;}
    setRows(readings.data||[]);setDevice(devices.data);setError('');setNow(Date.now());
   }catch{if(active)setError('Could not refresh sensor readings.');}finally{inFlight=false;}}
  void load();const timer=setInterval(()=>void load(),5000);return()=>{active=false;clearInterval(timer);};
 },[plantId,owner]);
 async function run(fn:()=>Promise<void>){setBusy(true);setMessage('');try{await fn();}catch(e){setMessage(e instanceof Error?e.message:'Could not complete sensor action.');}finally{setBusy(false);}}
 const latest=rows[0],age=latest?Math.max(0,Math.floor((now-Date.parse(latest.recorded_at))/1000)):0;
 const expired=!device||Date.parse(device.expires_at)<=now;
 return <section className="panel margin-top" aria-label="Simulated soil sensor">
  <h3>Soil moisture simulation</h3><p className="small muted">Simulated IoT sensor · not a physical soil measurement</p>
  {!owner?<p>Sign in and save a plant to connect a simulator.</p>:<>
   {error&&<p role="status">{error}</p>}
   {latest?<><p style={{fontSize:38,fontWeight:700,margin:'12px 0'}}>{latest.moisture_percent}%</p><strong>{moistureBand(latest.moisture_percent)}</strong>
    <p className="small">{age>120?'Stale reading — simulator may be stopped.':`Received ${age} seconds ago`}</p>
    <p className="small muted">Demo thresholds: below 30 low; above 80 high. This is a simulated input scale, not calibrated moisture or watering advice.</p>
    <details><summary>Recent readings ({rows.length})</summary><ul>{rows.map(r=><li key={r.id}>{new Date(r.recorded_at).toLocaleTimeString()} — {r.moisture_percent}%</li>)}</ul></details>
   </>:<p>No readings yet. Connect a simulator below.</p>}
   <p className="small muted">Refreshes every 5 seconds while this page is visible.</p>
   <button className="button secondary" onClick={()=>setControls(!controls)} aria-expanded={controls}>{controls?'Hide simulator controls':'Connect / simulate sensor'}</button>
   {controls&&<div className="form margin-top">
    <p>Create a key for this plant. It expires in 24 hours and can only submit simulated readings. Creating another key disconnects the previous one.</p>
    <button className="button primary" disabled={busy} onClick={()=>void run(async()=>{const {data,error}=await supabase().rpc('create_sensor_device',{plant:plantId});if(error)throw Error(error.message);setDevice({id:data.deviceId,expires_at:data.expiresAt});setKey(data.deviceKey);setNow(Date.now());setMessage('Device connected. Copy its ID and key into the Wokwi serial monitor, or use the slider below.');})}>{device?'Create replacement device key':'Create device key'}</button>
    {device&&<><label>Device ID<input readOnly value={device.id}/></label><p className="small">Key expires: {new Date(device.expires_at).toLocaleString()}</p>
     <button className="text-button" disabled={busy||expired} onClick={()=>void run(async()=>{const {error}=await supabase().rpc('revoke_sensor_device',{device:device.id});if(error)throw Error(error.message);setKey('');setDevice({...device,expires_at:new Date().toISOString()});setNow(Date.now());setMessage('Device access revoked.');})}>Revoke device access</button></>}
    {key&&device&&!expired&&<><label>Temporary device key<input type="password" readOnly value={key} autoComplete="off"/></label>
     <button className="text-button" onClick={()=>void run(async()=>{await navigator.clipboard.writeText(key);setMessage('Device key copied. Keep it out of the recording and public project source.');})}>Copy device key</button>
     <p className="small muted">Key is shown only in this session. It cannot read your garden. Do not publish it.</p>
     <label>Browser simulation: {value}%<input aria-label="Simulated moisture" type="range" min="0" max="100" value={value} onChange={e=>setValue(Number(e.target.value))}/></label>
     <button className="button secondary" disabled={busy} onClick={()=>void run(async()=>{const r=await fetch('/api/iot/moisture',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({deviceId:device.id,moisture:value,source:'simulation'})});const body=await r.json();if(!r.ok)throw Error(body.error||'Reading rejected');setMessage('Reading stored. The panel updates within five seconds.');})}>Send simulated reading</button>
    </>}
   </div>}
   {message&&<p role="status">{message}</p>}
  </>}
 </section>;
}
