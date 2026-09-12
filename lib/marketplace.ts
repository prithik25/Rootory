import { supabase } from './supabase';
import { publicImage } from './community';
import type { Listing,Enquiry } from './data';
import { z } from 'zod';
const listingSchema=z.object({title:z.string().max(5000),category:z.enum(['Produce','Growing supplies']),price:z.number().nonnegative(),unit:z.string().max(100),quantity:z.string().max(5000),location:z.string().max(5000),delivery:z.string().max(5000),description:z.string().max(10000),seller:z.string().max(5000),available:z.boolean(),image:z.string().max(3000).refine(v=>v===''||/^\/assets\/[a-z-]+\.webp$/.test(v)||v.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-images/`))});
function check(error:unknown){if(error)throw Error('Marketplace sync failed. Local changes are retained; check the connection and marketplace migration.');}
export async function loadMarketplace(owner:string){
 const db=supabase();const l=await db.from('marketplace_listings').select('id,owner_id,data').order('created_at',{ascending:false}).limit(200);check(l.error);
 const e=await db.from('enquiries').select('id,listing_id,sender_id,seller_id,sender_name,body,created_at').order('created_at',{ascending:false}).limit(500);check(e.error);
 let savedSet=new Set<string>();
 try{const s=await db.from('saved_listings').select('listing_id').eq('owner_id',owner);if(s.data)savedSet=new Set(s.data.map((x:{listing_id:string})=>x.listing_id));}catch{}
 const listings:Listing[]=(l.data||[]).filter(x=>listingSchema.safeParse(x.data).success).map(x=>({...listingSchema.parse(x.data),id:x.id,own:x.owner_id===owner,saved:savedSet.has(x.id)}));
 const enquiries:Enquiry[]=(e.data||[]).map(x=>({id:x.id,listingId:x.listing_id,listingTitle:listings.find(l=>l.id===x.listing_id)?.title||'Listing',body:x.body,date:x.created_at,direction:x.sender_id===owner?'sent':'received',senderName:x.sender_name}));
 return {listings,enquiries};
}
export async function syncMarketplace(before:{listings:Listing[];enquiries:Enquiry[]},after:{listings:Listing[];enquiries:Enquiry[]},owner:string){
 const db=supabase();
 for(const l of after.listings){const old=before.listings.find(x=>x.id===l.id);if(l.own&&(!old||JSON.stringify({...old,saved:false})!==JSON.stringify({...l,saved:false}))){const {id,own,saved,...data}=l;data.image=await publicImage(l.image,owner);check((await db.from('marketplace_listings').upsert({id,owner_id:owner,data})).error);}}
 for(const old of before.listings)if(old.own&&!after.listings.some(l=>l.id===old.id))check((await db.from('marketplace_listings').delete().eq('id',old.id).eq('owner_id',owner)).error);
 for(const l of after.listings){
  const old=before.listings.find(x=>x.id===l.id);
  if(l.saved&&(!old||!old.saved)){try{await db.from('saved_listings').upsert({listing_id:l.id,owner_id:owner});}catch{}}
  else if(!l.saved&&old?.saved){try{await db.from('saved_listings').delete().eq('listing_id',l.id).eq('owner_id',owner);}catch{}}
 }
 for(const e of after.enquiries){if(e.direction==='received'||before.enquiries.some(x=>x.id===e.id))continue;
 // Immutable messages. Ignore a duplicate from a retry after a partial network failure.
 const r=await db.from('enquiries').insert({id:e.id,listing_id:e.listingId,sender_id:owner,body:e.body});if(r.error?.code!=='23505')check(r.error);}
}
