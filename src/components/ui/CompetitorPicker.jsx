import { useState } from "react";
import { B, S } from "../../config/theme";
import { badge } from "./badge";

export function CompetitorPicker({globalCompetitors,selectedIds,onToggle,label='Link Competitors'}){
  const [open,setOpen]=useState(false);
  const [q,setQ]=useState('');
  const filtered=globalCompetitors.filter(c=>!q||(c.name+c.agencies?.join('')).toLowerCase().includes(q.toLowerCase()));
  const sel=selectedIds||[];
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
      <span style={S.lbl}>{label}</span>
      <button onClick={()=>setOpen(!open)} style={{...S.btn(open?B.border:B.twilight),padding:'3px 10px',fontSize:11}}>{open?'Close':'+ Link from Library'}</button>
    </div>
    {sel.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:6}}>
      {sel.map(id=>{const c=globalCompetitors.find(x=>x.id===id);return c?<span key={id} style={{cursor:'pointer'}} onClick={()=>onToggle(id)}>{badge(c.name.slice(0,26)+(c.name.length>26?'…':''),B.twilight,true)} <span style={{fontSize:9,color:B.twilight}}>✕</span></span>:null;})}
    </div>}
    {open&&<div style={{background:'#181830',border:`1px solid ${B.border}`,borderRadius:9,padding:10,marginBottom:8,animation:'fadeIn .15s ease'}}>
      <input style={{...S.inp,marginBottom:8,fontSize:11}} placeholder="Search competitors…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:3}}>
        {filtered.length===0&&<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:14}}>No competitors in library yet. Add them in Competitor Intel.</div>}
        {filtered.map(c=>{const on=sel.includes(c.id);return <div key={c.id} onClick={()=>onToggle(c.id)} style={{display:'flex',gap:8,alignItems:'center',padding:'7px 10px',borderRadius:7,cursor:'pointer',background:on?B.twilight+'22':'transparent',border:`1px solid ${on?B.twilight:B.border}`,transition:'all .1s'}}>
          <div style={{width:14,height:14,borderRadius:3,border:`2px solid ${on?B.twilight:B.border}`,background:on?B.twilight:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff'}}>{on?'✓':''}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
            <div style={{fontSize:10,color:B.silver}}>{c.size||'—'} · {c.agencies?.slice(0,2).join(', ')||'No agencies listed'}</div>
          </div>
          {c.recentWins>0&&badge(c.recentWins+' wins',B.refraction,true)}
        </div>;})}
      </div>
    </div>}
  </div>;
}
