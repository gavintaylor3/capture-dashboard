import { useState } from "react";
import { B, S } from "../../config/theme";
import { tagColor } from "../../lib/format";
import { ALL_TAGS } from "../../config/methodology";
import { badge } from "./badge";

export function TagEditor({tags,onChange,compact}){
  const [open,setOpen]=useState(false);
  const cur=tags||[];
  const toggle=t=>onChange(cur.includes(t)?cur.filter(x=>x!==t):[...cur,t]);
  return <div>
    <div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
      {cur.map(t=><span key={t} onClick={()=>toggle(t)} style={{cursor:'pointer'}}>{badge(t,tagColor(t),true)} <span style={{fontSize:8,color:B.twilight}}>✕</span></span>)}
      <button onClick={()=>setOpen(!open)} style={{...S.btn('transparent'),border:`1px dashed ${B.border}`,color:B.silver,fontSize:10,padding:'2px 8px'}}>{open?'Close':'+ Tag'}</button>
    </div>
    {open&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:6,padding:8,background:'#181830',borderRadius:8,border:`1px solid ${B.border}`,animation:'fadeIn .12s ease'}}>
      {ALL_TAGS.filter(t=>!cur.includes(t)).map(t=><span key={t} onClick={()=>toggle(t)} style={{cursor:'pointer'}}>{badge(t,tagColor(t),true)}</span>)}
      {ALL_TAGS.filter(t=>!cur.includes(t)).length===0&&<span style={{fontSize:11,color:B.silver}}>All tags applied</span>}
    </div>}
  </div>;
}
