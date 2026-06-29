import { B, S, ta } from "../../config/theme";

export function Teaming({opp,onChange}){
  const ps=opp.partners||[];
  const add=()=>onChange({...opp,partners:[...ps,{id:Date.now(),name:'',size:'Small',status:'In Progress',ndaFE:'',taStatus:'Pending',lead:'',capabilities:'',notes:'',wsLow:0,wsHigh:0}]});
  const upd=(id,f,v)=>onChange({...opp,partners:ps.map(p=>p.id===id?{...p,[f]:v}:p)});
  const del=id=>onChange({...opp,partners:ps.filter(p=>p.id!==id)});
  const conf=ps.filter(p=>p.status==='Y');
  const lo=conf.reduce((a,p)=>a+p.wsLow,0),hi=conf.reduce((a,p)=>a+p.wsHigh,0);
  const sc=s=>s==='Y'?B.refraction:s==='In Progress'?B.supernova:B.silver;
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
      {[{l:'Confirmed',v:conf.length,c:B.refraction},{l:'Partner WS Low',v:lo>0?lo+'%':'—',c:B.sky},{l:'Astrion WS Est.',v:hi>0?(100-hi)+'–'+(100-lo)+'%':'—',c:B.force}].map(({l,v,c})=>(
        <div key={l} style={{...S.card,marginBottom:0}}><div style={S.lbl}>{l}</div><div className="mono" style={{fontSize:20,fontWeight:700,color:c}}>{v}</div></div>
      ))}
    </div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button style={S.btn(B.force)} onClick={add}>+ Add Partner</button></div>
    {ps.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>No teaming partners added yet.</div>}
    {ps.map(p=><div key={p.id} style={{...S.card,borderLeft:`3px solid ${sc(p.status)}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
            <input style={{...S.inp,fontSize:13,fontWeight:700,background:'transparent',border:'none',color:'#E8E8F8',flex:1,padding:0,minWidth:150}} value={p.name||''} onChange={e=>upd(p.id,'name',e.target.value)} placeholder="Partner name"/>
            <select style={{...S.inp,width:'auto',padding:'3px 8px',fontSize:11}} value={p.size} onChange={e=>upd(p.id,'size',e.target.value)}><option>Large</option><option>Small</option><option>WOSB</option><option>SDB</option><option>SDVOSB</option><option>HUBZone</option></select>
            <select style={{...S.inp,width:'auto',padding:'3px 8px',fontSize:11}} value={p.status} onChange={e=>upd(p.id,'status',e.target.value)}><option value="Y">Confirmed</option><option>In Progress</option><option>Evaluating</option><option>Declined</option></select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:8}}>
            {[{f:'lead',l:'Lead POC'},{f:'ndaFE',l:'NDA Status'},{f:'taStatus',l:'TA Status'}].map(({f,l})=>(
              <div key={f}><div style={S.lbl}>{l}</div><input style={S.inp} value={p[f]||''} onChange={e=>upd(p.id,f,e.target.value)}/></div>
            ))}
          </div>
          <div><div style={S.lbl}>Capabilities</div><textarea style={{...ta,minHeight:44,fontSize:12}} value={p.capabilities||''} onChange={e=>upd(p.id,'capabilities',e.target.value)}/></div>
        </div>
        <div style={{marginLeft:14,flexShrink:0,textAlign:'right'}}>
          <div style={S.lbl}>Workshare %</div>
          <div style={{display:'flex',gap:4,alignItems:'center',justifyContent:'flex-end',marginBottom:4}}>
            <input style={{...S.inp,width:50,textAlign:'center',padding:'4px'}} type="number" min={0} max={100} value={p.wsLow} onChange={e=>upd(p.id,'wsLow',+e.target.value)}/><span style={{color:B.silver}}>–</span>
            <input style={{...S.inp,width:50,textAlign:'center',padding:'4px'}} type="number" min={0} max={100} value={p.wsHigh} onChange={e=>upd(p.id,'wsHigh',+e.target.value)}/>
          </div>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,fontSize:11,padding:'4px 0',cursor:'pointer',display:'block',marginTop:8}} onClick={()=>del(p.id)}>✕ Remove</button>
        </div>
      </div>
    </div>)}
  </div>;
}
