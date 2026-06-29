import { useEffect, useState } from "react";
import { B } from "../../config/theme";

export function Toast({message,type,onDone}){
  const [vis,setVis]=useState(true);
  useEffect(()=>{const t=setTimeout(()=>{setVis(false);setTimeout(onDone,280)},2800);return()=>clearTimeout(t)},[]);
  const bg=type==='error'?B.twilight:type==='warn'?B.supernova:B.refraction;
  return <div style={{background:B.cardBg,border:`1px solid ${bg}`,borderLeft:`4px solid ${bg}`,borderRadius:9,padding:'11px 16px',fontSize:12,fontWeight:600,boxShadow:'0 8px 32px rgba(0,0,0,.5)',animation:`${vis?'toastIn':'toastOut'} .28s ease forwards`,display:'flex',alignItems:'center',gap:10,maxWidth:340}}>
    <span style={{color:bg}}>{type==='error'?'✕':type==='warn'?'⚠':'✓'}</span>{message}
  </div>;
}
