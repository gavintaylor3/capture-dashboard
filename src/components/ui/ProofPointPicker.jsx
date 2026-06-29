import { useState } from "react";
import { B, S } from "../../config/theme";
import { badge } from "./badge";

export function ProofPointPicker({proofPoints,selectedIds,onToggle,label='Link Proof Points'}){
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState('');
  const filtered=proofPoints.filter(p=>!q||(p.title+p.metric+p.category).toLowerCase().includes(q.toLowerCase()));
  const sel=selectedIds||[];
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={S.lbl}>{label}</span>
      <button onClick={()=>setOpen(!open)} style={{...S.btn(open?B.border:B.force),padding:'3px 10px',fontSize:11}}>{open?'Close':'+ Link'}</button>
    </div>
    {sel.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:6}}>
      {sel.map(id=>{const p=proofPoints.find(x=>x.id===id);return p?<span key={id} style={{cursor:'pointer'}} onClick={()=>onToggle(id)}>{badge(p.title.slice(0,28)+(p.title.length>28?'…':''),B.sky,true)} <span style={{fontSize:9,color:B.twilight}}>✕</span></span>:null;})}
    </div>}
    {open&&<div style={{background:'#181830',border:`1px solid ${B.border}`,borderRadius:9,padding:10,marginBottom:8,animation:'fadeIn .15s ease'}}>
      <input style={{...S.inp,marginBottom:8,fontSize:11}} placeholder="Search proof points…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:3}}>
        {filtered.length===0&&<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:14}}>No proof points yet.</div>}
        {filtered.map(p=>{const on=sel.includes(p.id);return <div key={p.id} onClick={()=>onToggle(p.id)} style={{display:'flex',gap:8,alignItems:'center',padding:'7px 10px',borderRadius:7,cursor:'pointer',background:on?B.force+'22':'transparent',border:`1px solid ${on?B.force:B.border}`,transition:'all .1s'}}>
          <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${on?B.force:B.border}`,background:on?B.force:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff'}}>{on?'✓':''}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.title}</div>
            <div style={{fontSize:10,color:B.silver,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.metric}</div>
          </div>
          {badge(p.category,B.silver,true)}
        </div>;})}
      </div>
    </div>}
  </div>;
}
