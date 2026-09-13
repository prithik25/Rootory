"use client";
import { Droplets, Radio } from 'lucide-react';
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
 const points=[...rows].reverse();
 const firstTime=points.length?Date.parse(points[0].recorded_at):0;
 const timeRange=points.length?Date.parse(points[points.length-1].recorded_at)-firstTime:0;
 const xy=points.map((r,i)=>({x:timeRange?12+(Date.parse(r.recorded_at)-firstTime)/timeRange*256:140,y:90-r.moisture_percent*.72,r}));
 const line=xy.map(p=>`${p.x},${p.y}`).join(' ');
 const expired=!device||Date.parse(device.expires_at)<=now;
 return <section className="panel margin-top sensor-card" aria-label="Simulated soil sensor">
  <div className="sensor-heading"><span className="sensor-icon"><Droplets size={20}/></span><div><h3>Soil moisture</h3><span className="sensor-source">SIMULATED IOT SENSOR</span></div><Radio size={17} aria-hidden="true"/></div>
  {!owner?<p>Sign in and save a plant to connect a simulator.</p>:<>
   {error&&<p role="status">{error}</p>}
   {latest?<><div className="sensor-reading"><div className="sensor-gauge" style={{background:`conic-gradient(${latest.moisture_percent<30?'#b28b42':'#658654'} ${latest.moisture_percent}%, #e7eddf 0)`}}><div><strong>{latest.moisture_percent}<small>%</small></strong><span>demo input</span></div></div><div><span className={`sensor-band ${latest.moisture_percent<30?'sensor-band-low':''}`}>{moistureBand(latest.moisture_percent)}</span><p className="sensor-freshness">{age>120?'Last reading is over 2 min old':`Updated ${age}s ago`}</p></div></div>
    {xy.length>1&&<div className="sensor-trend"><div className="row between"><strong>Moisture trend</strong><span>Last {rows.length} readings</span></div><svg viewBox="0 0 280 108" role="img" aria-label={`Simulated moisture history, from ${points[0].moisture_percent} to ${latest.moisture_percent} percent`}><path d="M12 18H268 M12 54H268 M12 90H268" stroke="#dee6d7" strokeDasharray="3 4" fill="none"/><polygon points={`12,90 ${line} ${xy[xy.length-1].x},90`} fill="#dce8c9" opacity=".65"/><polyline points={line} stroke="#587644" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>{xy.map(p=><circle key={p.r.id} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#587644" strokeWidth="1.5"><title>{new Date(p.r.recorded_at).toLocaleTimeString()}: {p.r.moisture_percent}% simulated</title></circle>)}</svg><div className="sensor-chart-times"><span>{new Date(points[0].recorded_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span><span>Latest</span></div></div>}
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
