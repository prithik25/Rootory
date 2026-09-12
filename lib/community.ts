import { supabase } from "./supabase";
import { z } from "zod";
import type { Post } from "./data";
const postDataSchema=z.object({author:z.string().max(5000),location:z.string().max(5000),crop:z.string().max(5000),type:z.string().max(100),body:z.string().min(1).max(5000),date:z.string().max(50),image:z.string().max(3000).refine(v=>v===""||/^\/assets\/[a-z-]+\.webp$/.test(v)||v.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-images/`))});
const checked=(error:unknown)=>{if(error)throw new Error("Community changes could not sync. Your local changes are retained; check your connection and community database setup.");};
const uploaded=new Map<string,string>();
export async function publicImage(image:string,owner:string){
 if(!image.startsWith('data:'))return image;
 const cacheKey=owner+image;if(uploaded.has(cacheKey))return uploaded.get(cacheKey)!;
 const bytes=Uint8Array.from(atob(image.split(',')[1]),c=>c.charCodeAt(0));
 if(bytes.length>2097152)throw Error('Community photo exceeds 2 MB.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
 const path=`${owner}/${hash}.jpg`;
 const {error}=await supabase().storage.from('community-images').upload(path,bytes,{contentType:'image/jpeg',upsert:false});
 if(error&&!("statusCode" in error&&String(error.statusCode)==='409'))checked(error);
 const {data}=supabase().storage.from('community-images').getPublicUrl(path);uploaded.set(cacheKey,data.publicUrl);return data.publicUrl;
}
export async function loadCommunity(owner:string):Promise<Post[]>{
 const db=supabase();const posts=await db.from('posts').select('id,owner_id,data').order('created_at',{ascending:false}).limit(100);checked(posts.error);
 const ids=(posts.data||[]).map(p=>p.id);if(!ids.length)return [];
 const [comments,likes,bookmarks]=await Promise.all([db.from('comments').select('id,post_id,author,body').in('post_id',ids).order('created_at').limit(2000),db.from('likes').select('post_id,owner_id').in('post_id',ids).limit(10000),db.from('bookmarks').select('post_id').in('post_id',ids)]);
 for(const r of [comments,likes,bookmarks])checked(r.error);
 return (posts.data||[]).filter(p=>postDataSchema.safeParse(p.data).success).map(p=>({...postDataSchema.parse(p.data),id:p.id,own:p.owner_id===owner,likes:(likes.data||[]).filter(l=>l.post_id===p.id).length,liked:(likes.data||[]).some(l=>l.post_id===p.id&&l.owner_id===owner),saved:(bookmarks.data||[]).some(b=>b.post_id===p.id),comments:(comments.data||[]).filter(c=>c.post_id===p.id).map(({id,author,body})=>({id,author,body}))} as Post));
}
export async function syncCommunity(before:Post[],after:Post[],owner:string){
 const db=supabase();
 for(const p of after){const old=before.find(x=>x.id===p.id);
 if(p.own&&(!old||['body','crop','type','image','location'].some(k=>p[k as keyof Post]!==old[k as keyof Post]))){
 const {id,own,likes,liked,saved,comments,...data}=p;data.image=await publicImage(p.image,owner);
 checked((await db.from('posts').upsert({id,owner_id:owner,data})).error);
 }
 for(const [table,flag] of [['likes','liked'],['bookmarks','saved']] as const){if(Boolean(old?.[flag])!==p[flag]){const result=p[flag]?await db.from(table).upsert({post_id:p.id,owner_id:owner}):await db.from(table).delete().eq('post_id',p.id).eq('owner_id',owner);checked(result.error);}}
 for(const c of p.comments){if(!old?.comments.some(x=>x.id===c.id))checked((await db.from('comments').upsert({id:c.id,post_id:p.id,owner_id:owner,body:c.body,author:c.author})).error);}
 }
 for(const old of before)if(old.own&&!after.some(p=>p.id===old.id))checked((await db.from('posts').delete().eq('id',old.id).eq('owner_id',owner)).error);
}
