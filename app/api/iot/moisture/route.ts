import { createClient } from '@supabase/supabase-js';
import { sensorInput } from '@/lib/sensor';
export const runtime='nodejs';
const reply=(body:unknown,status:number)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const secret=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9]{64}$/.test(secret))return reply({error:'Valid device key required.'},401);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return reply({error:'Sensor service is not configured.'},503);
 let input;
 try{
  const reader=request.body?.getReader();if(!reader)throw Error();let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return reply({error:'Request too large.'},413);}chunks.push(value);}
  input=sensorInput.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
 }catch{return reply({error:'Use deviceId, integer moisture 0–100 and source simulation.'},400);}
 try{
  const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.rpc('ingest_sensor_reading',{device:input.deviceId,secret,moisture:input.moisture});
  if(error)return reply({error:'Sensor storage is not ready. Apply migration 006.'},503);
  const status=data?.status;
  if(status===201)return reply({ok:true,source:'simulation',recordedAt:data.recordedAt},201);
  if(status===429)return reply({error:'Wait at least five seconds between readings.'},429);
  if(status===410)return reply({error:'The linked plant is no longer available.'},410);
  return reply({error:'Device key invalid, expired or revoked.'},401);
 }catch{return reply({error:'Sensor service unavailable.'},503);}
}
