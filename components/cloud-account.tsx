"use client";
import { useEffect, useState } from "react";
import { cloudConfigured, supabase } from "@/lib/supabase";
import { backupGarden, cloudInfo, restoreGarden } from "@/lib/cloud";
import { privateGarden, type Garden } from "@/lib/cloud-schema";
import type { State } from "@/lib/data";
import { PasswordReset } from "./password-reset";
import { Field } from "./primitives";
export function CloudAccount({state,onRestore,automatic=false}:{automatic?:boolean;state:State;onRestore:(garden:Garden,revision?:number)=>void}) {
  const [account,setAccount]=useState("");
  const [email,setEmail]=useState("");
  const [code,setCode]=useState("");
  const [passwordMode,setPasswordMode]=useState(true);
  const [resetting,setResetting]=useState(false);
  const [signingUp,setSigningUp]=useState(false);
  const [password,setPassword]=useState("");
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
      <p className="body-copy muted">Back up your plant records, reminders, profile and photos privately. {automatic ? "Community posts and photos are shared with other signed-in growers. Marketplace listings are public; enquiries go privately to the seller." : "Community posts and marketplace activity stay in the local demo."} {automatic ? "Plant changes save automatically to your account." : "Backups are manual."}</p>
      {resetting?<PasswordReset initialEmail={email} onClose={()=>setResetting(false)}/>:!account?<form className="form" onSubmit={e=>{e.preventDefault();void run(async()=>{
        if(passwordMode && signingUp){if(password.length<12)throw new Error("Use at least 12 characters for your password.");const {data,error}=await supabase().auth.signUp({email:email.trim(),password});if(error)throw new Error(`Account could not be created: ${error.message}`);setPassword("");if(!data.session){setPasswordMode(false);setSigningUp(false);setSent(true);setMessage("Check your email for the confirmation code. Email delivery limits may apply.");}return;}
        if(passwordMode){const {error}=await supabase().auth.signInWithPassword({email:email.trim(),password});if(error)throw new Error("Sign-in failed. Check the email and password of your existing account.");setPassword("");setMessage("Signed in. Check your cloud backup before saving.");return;}
        if(sent){const {error}=await supabase().auth.verifyOtp({email:email.trim(),token:code.trim(),type:"email"});if(error)throw new Error("Code could not be verified. Check it or request another.");setSent(false);setCode("");setMessage("Signed in. Check your existing backup before saving.");}
        else{const {error}=await supabase().auth.signInWithOtp({email:email.trim()});if(error){
          if(error.code === "over_email_send_rate_limit" || error.status === 429) throw new Error("Email sending limit reached. Wait before trying again, or configure a custom SMTP provider in Supabase.");
          if(error.code === "email_address_not_authorized") throw new Error("Supabase’s default email service only sends to authorized project-team addresses. Use your Supabase account email for this test, or configure custom SMTP.");
          throw new Error(`Email could not be sent: ${error.message} (${error.code || error.status || "unknown"}).`);
        }setSent(true);setMessage("Check your email for the sign-in code.");}
      });}}>
        <Field label="Account email"><input type="email" autoComplete="email" required maxLength={254} value={email} disabled={sent||busy} onChange={e=>setEmail(e.target.value)}/></Field>
        {passwordMode&&<Field label="Account password"><input type="password" autoComplete={signingUp?"new-password":"current-password"} minLength={signingUp?12:undefined} required value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></Field>}
        {!passwordMode&&sent&&<Field label="Email code"><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" required value={code} onChange={e=>setCode(e.target.value)}/></Field>}
        <button className="button primary" disabled={busy}>{busy?"Please wait…":passwordMode?(signingUp?"Create account":"Sign in with password"):sent?"Verify and sign in":"Email me a sign-in code"}</button>
        <button type="button" className="text-button" disabled={busy} onClick={()=>{setSigningUp(false);setPasswordMode(!passwordMode);setSent(false);setPassword("");setCode("");setMessage("");}}>{passwordMode?"Use an email code instead":"Use password sign-in instead"}</button>
        {passwordMode&&<button type="button" className="text-button" disabled={busy} onClick={()=>{setSigningUp(!signingUp);setPassword("");setMessage("");}}>{signingUp?"Already have an account? Sign in":"New here? Create an account"}</button>}
        <button type="button" className="text-button" disabled={busy} onClick={()=>{setResetting(true);setMessage("");setPassword("");}}>Forgot password?</button>
        {passwordMode&&<p className="body-copy muted">Use an existing account with a password. This option does not send an email.</p>}
        {!passwordMode&&sent&&<button type="button" className="text-button" disabled={busy} onClick={()=>{setSent(false);setCode("");}}>Use another email / request a new code</button>}
      </form>:<div className="form">
        <p>Signed in as <strong>{account}</strong></p>
        <button className="button secondary" disabled={busy} onClick={()=>void run(async()=>{const info=await cloudInfo();if(!info){setRevision(0);setMessage("No backup yet. You can save your first cloud garden.");}else{setMessage(`Cloud backup found (${new Date(info.updated_at).toLocaleString()}). Restore it before making changes on this device.`);}})}>Check cloud backup</button>
        <button className="button primary" disabled={automatic||busy||revision===null} onClick={()=>void run(async()=>{setRevision(await backupGarden(privateGarden(state),revision!));setMessage("Plant records and photos backed up privately.");})}>{automatic?"Automatic saving enabled":"Back up this garden"}</button>
        <button className="button secondary" disabled={busy} onClick={()=>setConfirmRestore(true)}>Restore cloud garden</button>
        {confirmRestore&&<div><p>Replace this device’s plants, timeline, reminders and profile with your cloud backup? Export local records first if you want to keep them.</p><button className="button secondary" disabled={busy} onClick={()=>void run(async()=>{const result=await restoreGarden();onRestore(result.garden,result.revision);setRevision(result.revision);setConfirmRestore(false);setMessage("Cloud garden restored on this device.");})}>Replace local garden</button><button className="text-button" disabled={busy} onClick={()=>setConfirmRestore(false)}>Cancel</button></div>}
        <button className="text-button" disabled={busy} onClick={()=>void run(async()=>{const {error}=await supabase().auth.signOut({scope:"local"});if(error)throw error;setMessage("Signed out. Local records remain on this device; use Reset demo workspace to clear them.");})}>Sign out</button>
      </div>}
      {message&&<p role="status" className="body-copy">{message}</p>}
    </>}
  </section>;
}
