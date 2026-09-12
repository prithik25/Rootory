"use client";
import { useEffect,useState } from "react";
import { cloudConfigured,supabase } from "@/lib/supabase";
import Rootory from "./rootory";
export default function Workspace(){
 const [owner,setOwner]=useState<string|null>(null);
 useEffect(()=>{if(!cloudConfigured){setOwner("");return;}
 const {data:{subscription}}=supabase().auth.onAuthStateChange((event,session)=>{
   // Preserve the password-recovery form until updateUser completes.
   if(event==="PASSWORD_RECOVERY")return;
   setOwner(session?.user.id||"");
 });return ()=>subscription.unsubscribe();},[]);
 if(owner===null)return <main><p>Opening your growing world…</p></main>;
 return <Rootory key={owner||"demo"} owner={owner}/>;
}
