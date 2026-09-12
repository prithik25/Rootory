import { supabase } from "./supabase";
import { gardenSchema, photoPath, type Garden } from "./cloud-schema";
const bucket = "garden-photos";
async function owner() {
  const {data,error}=await supabase().auth.getUser();
  if(error || !data.user)throw new Error("Please sign in again before accessing your cloud garden.");
  return data.user.id;
}
export async function cloudInfo() {
  const user=await owner();
  const {data,error}=await supabase().from("gardens").select("revision,updated_at").eq("owner_id",user).maybeSingle();
  if(error)throw new Error("Could not read cloud backup. Check your connection and database setup.");
  return data as {revision:number;updated_at:string}|null;
}
async function encodePhotos(garden:Garden,user:string) {
  const copy=structuredClone(garden);
  const uploads = new Map<string,string>();
  for(const item of [...copy.plants,...copy.entries]) {
    if(!item.image.startsWith("data:")) { if(item.image.startsWith("private:"))photoPath(user,item.image); continue; }
    const previous=uploads.get(item.image);
    if(previous){item.image=previous;continue;}
    const raw=atob(item.image.split(",")[1]);
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
    if(bytes.length>2*1024*1024)throw new Error("A prepared photo exceeds the 2 MB cloud limit.");
    const digest=await crypto.subtle.digest("SHA-256",bytes);
    const hash=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,"0")).join("");
    const path=`${user}/${hash}.jpg`;
    const {error}=await supabase().storage.from(bucket).upload(path,bytes,{contentType:"image/jpeg",upsert:false});
    if(error && !("statusCode" in error && String(error.statusCode)==="409"))throw new Error("Photo upload failed. Your existing backup has not been replaced.");
    const ref=`private:${path}`;
    uploads.set(item.image,ref);item.image=ref;
  }
  return copy;
}
export async function backupGarden(garden:Garden,expectedRevision:number) {
  const user=await owner();
  const prepared=await encodePhotos(gardenSchema.parse(garden),user);
  const {data,error}=await supabase().rpc("save_garden",{document:prepared,expected_revision:expectedRevision});
  if(error){
    if(error.message.includes("GARDEN_CONFLICT"))throw new Error("A newer backup exists. Restore it before saving again; export your local records first if you need to keep both.");
    throw new Error("Cloud save failed. Your local records are still available. Check your connection and database setup.");
  }
  return data as number;
}
export async function restoreGarden():Promise<{garden:Garden;revision:number}> {
  const user=await owner();
  const {data,error}=await supabase().from("gardens").select("document,revision").eq("owner_id",user).single();
  if(error || !data)throw new Error("No cloud backup could be loaded. Your local records have not changed.");
  const garden=gardenSchema.parse(data.document);
  const downloaded=new Map<string,string>();
  for(const item of [...garden.plants,...garden.entries]) {
    if(!item.image.startsWith("private:"))continue;
    const path=photoPath(user,item.image);
    if(downloaded.has(path)){item.image=downloaded.get(path)!;continue;}
    const result=await supabase().storage.from(bucket).download(path);
    if(result.error)throw new Error("A backup photo could not be downloaded. Restore was cancelled; local records have not changed.");
    if(result.data.size>2*1024*1024)throw new Error("Backup photo exceeds the size limit.");
    const value=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Could not read a backup photo."));reader.readAsDataURL(new Blob([result.data],{type:"image/jpeg"}));});
    downloaded.set(path,value);item.image=value;
  }
  return {garden:gardenSchema.parse(garden),revision:data.revision};
}
