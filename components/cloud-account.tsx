"use client";
import { useEffect, useState } from "react";
import { cloudConfigured, supabase } from "@/lib/supabase";
import { backupGarden, cloudInfo, restoreGarden } from "@/lib/cloud";
import { privateGarden, type Garden } from "@/lib/cloud-schema";
import type { State } from "@/lib/data";
import { Field } from "./primitives";
export function CloudAccount({state,onRestore}:{state:State;onRestore:(garden:Garden)=>void}) {
  const [account,setAccount]=useState("");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [sent,setSent]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [revision,setRevision]=useState<number|null>(null);
  const [confirmRestore,setConfirmRestore]=useState(false);
  useEffect(()=>{
    if(!cloudConfigured)return;
    const client=supabase();
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
      setAccount(session?.user.email || "");setRevision(null);setConfirmRestore(false);
    });
    return ()=>subscription.unsubscribe();
  },[]);
  async function run(action:()=>Promise<void>){setBusy(true);setMessage("");try{await action();}catch(e){setMessage(e instanceof Error?e.message:"Could not complete this action.");}finally{setBusy(false);}}
  return <section className="panel margin-top">
    <h3>Your cloud garden</h3>
    {!cloudConfigured?<p className="body-copy muted">Cloud connection is being set up. Your plants and photos continue to save on this device.</p>:<>
      <p className="body-copy muted">Back up your plant records, reminders, profile and photos privately. Community posts and marketplace activity stay in the local demo. Backups are manual.</p>
      {!account?<form className="form" onSubmit={e=>{e.preventDefault();void run(async()=>{
        if(sent){const {error}=await supabase().auth.verifyOtp({email:email.trim(),token:code.trim(),type:"email"});if(error)throw new Error("Code could not be verified. Check it or request another.");setSent(false);setCode("");setMessage("Signed in. Check your existing backup before saving.");}
        else{const {error}=await supabase().auth.signInWithOtp({email:email.trim()});if(error)throw new Error("Could not send a code. Check your email and authentication setup, then try again.");setSent(true);setMessage("Check your email for the sign-in code.");}
      });}}>
        <Field label="Account email"><input type="email" autoComplete="email" required maxLength={254} value={email} disabled={sent||busy} onChange={e=>setEmail(e.target.value)}/></Field>
        {sent&&<Field label="Email code"><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" required value={code} onChange={e=>setCode(e.target.value)}/></Field>}
        <button className="button primary" disabled={busy}>{busy?"Please wait…":sent?"Verify and sign in":"Email me a sign-in code"}</button>
        {sent&&<button type="button" className="text-button" disabled={busy} onClick={()=>{setSent(false);setCode("");}}>Use another email / request a new code</button>}
      </form>:<div className="form">
        <p>Signed in as <strong>{account}</strong></p>
        <button className="button secondary" disabled={busy} onClick={()=>void run(async()=>{const info=await cloudInfo();if(!info){setRevision(0);setMessage("No backup yet. You can save your first cloud garden.");}else{setMessage(`Cloud backup found (${new Date(info.updated_at).toLocaleString()}). Restore it before making changes on this device.`);}})}>Check cloud backup</button>
        <button className="button primary" disabled={busy||revision===null} onClick={()=>void run(async()=>{setRevision(await backupGarden(privateGarden(state),revision!));setMessage("Plant records and photos backed up privately.");})}>Back up this garden</button>
        <button className="button secondary" disabled={busy} onClick={()=>setConfirmRestore(true)}>Restore cloud garden</button>
        {confirmRestore&&<div><p>Replace this device’s plants, timeline, reminders and profile with your cloud backup? Export local records first if you want to keep them.</p><button className="button secondary" disabled={busy} onClick={()=>void run(async()=>{const result=await restoreGarden();onRestore(result.garden);setRevision(result.revision);setConfirmRestore(false);setMessage("Cloud garden restored on this device.");})}>Replace local garden</button><button className="text-button" disabled={busy} onClick={()=>setConfirmRestore(false)}>Cancel</button></div>}
        <button className="text-button" disabled={busy} onClick={()=>void run(async()=>{const {error}=await supabase().auth.signOut({scope:"local"});if(error)throw error;setMessage("Signed out. Local records remain on this device; use Reset demo workspace to clear them.");})}>Sign out</button>
      </div>}
      {message&&<p role="status" className="body-copy">{message}</p>}
    </>}
  </section>;
}
