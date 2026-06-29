import { B, S } from "../../config/theme";
import { priorityC } from "../../lib/format";

export function ActionRow({a,onToggle,onUpd,onDel}){
  return <div style={{...S.card,marginBottom:7,opacity:a.status==='Complete'?.5:1,borderLeft:`3px solid ${priorityC(a.priority)}`,transition:'opacity .2s'}}>
    <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
      <div onClick={()=>onToggle(a.id)} style={{width:18,height:18,borderRadius:4,border:`2px solid ${a.status==='Complete'?B.refraction:B.border}`,background:a.status==='Complete'?B.refraction:'transparent',cursor:'pointer',flexShrink:0,marginTop:2,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
        {a.status==='Complete'&&<span style={{color:'#0C0C18',fontSize:10,fontWeight:900}}>✓</span>}
      </div>
      <div style={{flex:1}}>
        <input style={{...S.inp,fontSize:12,fontWeight:600,background:'transparent',border:'none',padding:'0 0 4px',textDecoration:a.status==='Complete'?'line-through':'none',color:a.status==='Complete'?B.silver:'#E0E0F0'}} value={a.task||''} onChange={e=>onUpd(a.id,'task',e.target.value)} placeholder="Task…"/>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <input style={{...S.inp,width:120,fontSize:11,padding:'2px 7px'}} value={a.owner||''} onChange={e=>onUpd(a.id,'owner',e.target.value)} placeholder="Owner"/>
          <input style={{...S.inp,width:130,fontSize:11,padding:'2px 7px'}} type="date" value={a.due||''} onChange={e=>onUpd(a.id,'due',e.target.value)}/>
          <select style={{...S.inp,width:'auto',padding:'2px 7px',fontSize:11}} value={a.priority} onChange={e=>onUpd(a.id,'priority',e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
          <select style={{...S.inp,width:'auto',padding:'2px 7px',fontSize:11}} value={a.status} onChange={e=>onUpd(a.id,'status',e.target.value)}><option>Open</option><option>In Progress</option><option>Complete</option><option>Blocked</option></select>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,fontSize:10,padding:0,cursor:'pointer'}} onClick={()=>onDel(a.id)}>✕</button>
        </div>
      </div>
    </div>
  </div>;
}

export function ActionItems({opp,onChange}){
  const as=opp.actions||[];
  const toggle=id=>onChange({...opp,actions:as.map(a=>a.id===id?{...a,status:a.status==='Complete'?'Open':'Complete'}:a)});
  const add=()=>onChange({...opp,actions:[...as,{id:Date.now(),task:'',owner:'',due:'',status:'Open',priority:'High'}]});
  const upd=(id,f,v)=>onChange({...opp,actions:as.map(a=>a.id===id?{...a,[f]:v}:a)});
  const del=id=>onChange({...opp,actions:as.filter(a=>a.id!==id)});
  const open=as.filter(a=>a.status!=='Complete');
  const done=as.filter(a=>a.status==='Complete');
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
      {[{l:'Open',v:open.filter(a=>a.status==='Open').length,c:B.silver},{l:'In Progress',v:open.filter(a=>a.status==='In Progress').length,c:B.supernova},{l:'Blocked',v:open.filter(a=>a.status==='Blocked').length,c:B.twilight},{l:'Complete',v:done.length,c:B.refraction}]
        .map(({l,v,c})=><div key={l} style={{...S.card,marginBottom:0,textAlign:'center',borderColor:c+'44'}}><div className="mono" style={{fontSize:22,fontWeight:700,color:c}}>{v}</div><div style={{...S.lbl,textAlign:'center'}}>{l}</div></div>)}
    </div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button style={S.btn(B.force)} onClick={add}>+ Add Action</button></div>
    <div style={S.hdg}>Open &amp; In Progress</div>
    {open.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:18,fontSize:12}}>No open actions 🎉</div>}
    {open.map(a=><ActionRow key={a.id} a={a} onToggle={toggle} onUpd={upd} onDel={del}/>)}
    {done.length>0&&<><div style={{...S.hdg,marginTop:14,color:B.silver}}>Completed ({done.length})</div>{done.map(a=><ActionRow key={a.id} a={a} onToggle={toggle} onUpd={upd} onDel={del}/>)}</>}
  </div>;
}
