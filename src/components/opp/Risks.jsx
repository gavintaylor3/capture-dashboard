import { B, S, ta } from "../../config/theme";

export function Risks({opp,onChange}){
  const rs=opp.risks||[];
  const add=()=>onChange({...opp,risks:[...rs,{id:Date.now(),name:'New Risk',likelihood:25,impact:'Medium',mitigation:'',actioner:'',status:'Active'}]});
  const upd=(id,f,v)=>onChange({...opp,risks:rs.map(r=>r.id===id?{...r,[f]:v}:r)});
  const del=id=>onChange({...opp,risks:rs.filter(r=>r.id!==id)});
  return <div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
      {['Active','Watch','Closed'].map(s=>{const c=s==='Active'?B.twilight:s==='Watch'?B.supernova:B.refraction;return<div key={s} style={{...S.card,marginBottom:0,textAlign:'center',borderColor:c+'44'}}>
        <div className="mono" style={{fontSize:24,fontWeight:700,color:c}}>{rs.filter(r=>r.status===s).length}</div>
        <div style={{...S.lbl,textAlign:'center'}}>{s}</div>
      </div>;})}
    </div>
    <div style={{display:'flex',justifyContent:'flex-end',marginBottom:10}}><button style={S.btn(B.force)} onClick={add}>+ Add Risk</button></div>
    {rs.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>No risks documented yet.</div>}
    {rs.map(r=>{const c=r.impact==='High'?B.twilight:r.impact==='Medium'?B.supernova:B.silver;const score=r.likelihood*(r.impact==='High'?3:r.impact==='Medium'?2:1);return<div key={r.id} style={{...S.card,borderLeft:`3px solid ${c}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{flex:1}}>
          <input style={{...S.inp,fontWeight:700,fontSize:13,color:'#E8E8F8',background:'transparent',border:'none',padding:'0 0 5px',width:'100%'}} value={r.name||''} onChange={e=>upd(r.id,'name',e.target.value)} placeholder="Risk description…"/>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            <select style={{...S.inp,width:'auto',padding:'3px 6px',fontSize:11}} value={r.impact} onChange={e=>upd(r.id,'impact',e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
            <select style={{...S.inp,width:'auto',padding:'3px 6px',fontSize:11}} value={r.status} onChange={e=>upd(r.id,'status',e.target.value)}><option>Active</option><option>Watch</option><option>Closed</option></select>
            <span style={{padding:'2px 8px',borderRadius:5,background:c+'22',color:c,fontSize:10,fontWeight:700}}>Score: {score}</span>
          </div>
        </div>
        <div style={{textAlign:'right',marginLeft:14,flexShrink:0}}>
          <div style={S.lbl}>Likelihood</div>
          <input className="mono" style={{...S.inp,width:68,textAlign:'center',fontWeight:700,fontSize:16,color:c}} type="number" min={0} max={100} value={r.likelihood} onChange={e=>upd(r.id,'likelihood',+e.target.value)}/>
          <div style={{fontSize:9,color:B.silver,textAlign:'center'}}>%</div>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,fontSize:10,cursor:'pointer',marginTop:4,padding:0}} onClick={()=>del(r.id)}>✕ Remove</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div><span style={S.lbl}>Mitigation</span><textarea style={{...ta,minHeight:50,fontSize:11}} value={r.mitigation||''} onChange={e=>upd(r.id,'mitigation',e.target.value)}/></div>
        <div><span style={S.lbl}>Actioner</span><input style={S.inp} value={r.actioner||''} onChange={e=>upd(r.id,'actioner',e.target.value)}/></div>
      </div>
    </div>;})}
  </div>;
}
