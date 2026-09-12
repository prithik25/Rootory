"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { authRedirectUrl } from "@/lib/auth-redirect";
import { Field } from "./primitives";
export function PasswordReset({initialEmail,onClose,recovered=false}:{initialEmail:string;onClose:()=>void;recovered?:boolean}) {
  const [email,setEmail]=useState(initialEmail);
  const [code,setCode]=useState("");
  const [password,setPassword]=useState("");
  const [confirm,setConfirm]=useState("");
  const [step,setStep]=useState<"email"|"code"|"password"|"done">(recovered?"password":"email");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(){
    setBusy(true);setMessage("");
    try{
      if(step==="email"){
        const {error}=await supabase().auth.resetPasswordForEmail(email.trim(),{redirectTo:authRedirectUrl()});
        if(error){if(error.status===429 || error.code==="over_email_send_rate_limit")throw new Error("Email limit reached. Try later; password sign-in still works if you remember it.");throw new Error(`Reset email could not be sent: ${error.message}`);}
        setStep("code");setMessage("If an account exists for this email, a reset email has been requested. Open its link, or enter the code below if included. Check your spam folder too.");
      }else if(step==="code"){
        const {error}=await supabase().auth.verifyOtp({email:email.trim(),token:code.trim(),type:"recovery"});
        if(error)throw new Error("This reset code is invalid or expired. Check the code or request a new one.");
        setCode("");setStep("password");
      }else if(step==="password"){
        if(password.length<12)throw new Error("Use at least 12 characters.");
        if(password!==confirm)throw new Error("The passwords do not match.");
        const {error}=await supabase().auth.updateUser({password});
        if(error)throw new Error(`Password could not be updated: ${error.message}`);
        setPassword("");setConfirm("");setStep("done");setMessage("Password updated. You are signed in.");
      }
    }catch(e){setMessage(e instanceof Error?e.message:"Could not reset the password.");}finally{setBusy(false);}
  }
  return <form className="form" onSubmit={e=>{e.preventDefault();void submit();}}>
    <h3>{step==="password"?"Choose a new password":"Reset your password"}</h3>
    {step==="email"&&<Field label="Account email"><input type="email" required autoComplete="email" value={email} disabled={busy} onChange={e=>setEmail(e.target.value)}/></Field>}
    {step==="code"&&<><p>Enter the reset code sent to {email}.</p><Field label="Password reset code"><input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6,10}" value={code} disabled={busy} onChange={e=>setCode(e.target.value)}/></Field><button type="button" className="text-button" disabled={busy} onClick={()=>{setStep("email");setCode("");setMessage("");}}>Change email or request another code</button></>}
    {step==="password"&&<><Field label="New password"><input type="password" required minLength={12} autoComplete="new-password" value={password} disabled={busy} onChange={e=>setPassword(e.target.value)}/></Field><Field label="Confirm new password"><input type="password" required minLength={12} autoComplete="new-password" value={confirm} disabled={busy} onChange={e=>setConfirm(e.target.value)}/></Field><p>Use at least 12 characters.</p></>}
    {message&&<p role="status">{message}</p>}
    {step!=="done"&&<button className="button primary" disabled={busy}>{busy?"Please wait…":step==="email"?"Send reset code":step==="code"?"Verify reset code":"Save new password"}</button>}
    <button type="button" className="text-button" disabled={busy} onClick={onClose}>{step==="done"?"Continue to my garden":"Cancel"}</button>
  </form>;
}
