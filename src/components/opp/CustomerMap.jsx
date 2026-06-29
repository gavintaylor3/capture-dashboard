import { B, S, ta } from "../../config/theme";
import { influenceC } from "../../lib/format";

export function CustomerMap({opp,onChange}){
  const cs=opp.customers||[];
  const add=()=>onChange({...opp,customers:[...cs,{id:Date.now(),name:'',role:'',influence:'Med',sseb:false,lead:'',lastContact:'',notes:''}]});
  const upd=(id,f,v)=>onChange({...opp,customers:cs.map(c=>c.id===id?{...c,[f]:v}:c)});
  const del=id=>onChange({...opp,customers:cs.filter(c=>c.id!==id)});
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <div style={{display:'flex',gap:8}}>{['High','Med','Low'].map(l=><div key={l} style={{...S.card,marginBottom:0,padding:'8px 16px',textAlign:'center',borderColor:influenceC(l)+'44'}}>
        <div className="mono" style={{fontSize:20,fontWeight:700,color:influenceC(l)}}>{cs.filter(c=>c.influence===l).length}</div>
        <div style={{...S.lbl,textAlign:'center',marginBottom:0}}>{l}</div>
      </div>)}</div>
      <button style={S.btn(B.force)} onClick={add}>+ Add Stakeholder</button>
    </div>
    {cs.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>No stakeholders mapped yet.</div>}
    {cs.length>0&&<div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:750}}>
      <thead><tr>{['Name / Title','Influence','SSEB?','Relationship Lead','Last Contact','Notes'].map((h,i)=><th key={i} style={{...S.thd,borderRadius:i===0?'6px 0 0 0':i===5?'0 6px 0 0':0}}>{h}</th>)}</tr></thead>
      <tbody>{cs.map((c,i)=><tr key={c.id} style={{background:i%2===0?'#1E1E38':'#18183A'}}>
        <td style={S.tdc}><input style={{...S.inp,marginBottom:4}} value={c.name||''} onChange={e=>upd(c.id,'name',e.target.value)} placeholder="Full Name"/><input style={{...S.inp,fontSize:11}} value={c.role||''} onChange={e=>upd(c.id,'role',e.target.value)} placeholder="Role / Title"/></td>
        <td style={S.tdc}><select style={{...S.inp,width:'auto'}} value={c.influence} onChange={e=>upd(c.id,'influence',e.target.value)}><option>High</option><option>Med</option><option>Low</option></select></td>
        <td style={{...S.tdc,textAlign:'center'}}><input type="checkbox" checked={c.sseb||false} onChange={e=>upd(c.id,'sseb',e.target.checked)}/></td>
        <td style={S.tdc}><input style={S.inp} value={c.lead||''} onChange={e=>upd(c.id,'lead',e.target.value)}/></td>
        <td style={S.tdc}><input style={S.inp} type="date" value={c.lastContact||''} onChange={e=>upd(c.id,'lastContact',e.target.value)}/></td>
        <td style={S.tdc}><textarea style={{...ta,minHeight:44,fontSize:11}} value={c.notes||''} onChange={e=>upd(c.id,'notes',e.target.value)} placeholder="Intel…"/>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,fontSize:10,padding:'2px 0',cursor:'pointer'}} onClick={()=>del(c.id)}>✕ Remove</button></td>
      </tr>)}</tbody>
    </table></div>}
  </div>;
}
