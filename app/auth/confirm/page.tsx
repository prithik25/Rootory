"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PasswordReset } from "@/components/password-reset";

export default function ConfirmEmail() {
  const started=useRef(false);
  const [status,setStatus]=useState("Verifying your email link…");
  const [recovery,setRecovery]=useState(false);
  const [email,setEmail]=useState("");
  useEffect(()=>{
    if(started.current)return; started.current=true;
    const hash=new URLSearchParams(window.location.hash.slice(1));
    const query=new URLSearchParams(window.location.search);
    // Remove credentials before rendering links or allowing onward navigation.
    window.history.replaceState(null,"","/auth/confirm");
    void (async()=>{
      try {
        if(hash.has("error")||query.has("error"))throw Error("This email link has expired or was already used. Request a new email from Profile.");
        const client=supabase();
        const access=hash.get("access_token"),refresh=hash.get("refresh_token");
        if(!access||!refresh)throw Error("No valid confirmation was found. Open the newest email link, or enter its code in Profile.");
        const {data,error}=await client.auth.setSession({access_token:access,refresh_token:refresh});
        if(error||!data.session)throw Error("This email link is invalid or expired. Request a new one from Profile.");
        const verified=await client.auth.getUser();
        if(verified.error||!verified.data.user)throw Error("Your session could not be verified. Please sign in again.");
        if(hash.get("type")==="recovery") {setEmail(verified.data.user.email||"");setRecovery(true);setStatus("");}
        else {setStatus("Email confirmed. You are signed in.");}
      } catch(error) {setStatus(error instanceof Error?error.message:"Unable to verify this link. Please try again.");}
    })();
  },[]);
  return <main style={{maxWidth:560,margin:"64px auto",padding:24}}><section className="panel">
    <h1>Rootory</h1>
    {status&&<p role="status">{status}</p>}
    {recovery?<PasswordReset recovered initialEmail={email} onClose={()=>window.location.assign("/#profile")}/>:<a className="button primary" href="/#profile">Continue to profile</a>}
  </section></main>;
}
