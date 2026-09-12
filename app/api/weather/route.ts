import { z } from "zod";
export async function GET(request:Request){
 const q=new URL(request.url).searchParams;
 const parsed=z.object({latitude:z.coerce.number().min(-90).max(90),longitude:z.coerce.number().min(-180).max(180)}).safeParse({latitude:q.get("latitude")??undefined,longitude:q.get("longitude")??undefined});
 if(!parsed.success)return Response.json({error:"Choose a valid location."},{status:400});
 // Round to roughly kilometre precision; coordinates are never added to public profiles.
 const latitude=parsed.data.latitude.toFixed(2),longitude=parsed.data.longitude.toFixed(2);
 const params=new URLSearchParams({latitude,longitude,current:"temperature_2m,relative_humidity_2m,wind_speed_10m",hourly:"precipitation_probability",forecast_days:"1",timezone:"auto"});
 try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`,{signal:AbortSignal.timeout(10000),next:{revalidate:600}});if(!r.ok)throw Error();const b=await r.json();
 const current=z.object({time:z.string(),temperature_2m:z.number(),relative_humidity_2m:z.number(),wind_speed_10m:z.number()}).parse(b.current);
 const hour=current.time.slice(0,13);const index=(b.hourly?.time||[]).findIndex((t:string)=>t.startsWith(hour));const rain=index>=0?b.hourly.precipitation_probability[index]:null;
 return Response.json({temperature:current.temperature_2m,humidity:current.relative_humidity_2m,wind:current.wind_speed_10m,rainProbability:typeof rain==="number"?rain:null,time:current.time,timezone:b.timezone,source:"Open-Meteo"},{headers:{"Cache-Control":"private, max-age=300"}});
 }catch{return Response.json({error:"Live weather is unavailable. Please try again later."},{status:502});}
}
