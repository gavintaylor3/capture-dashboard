import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { ProofPointPicker, badge } from "../ui";

export function Solutioning({opp,onChange,proofPoints}){
  const items=opp.solutioning||[];
  const [loading,setLoading]=useState(null);
  const [adding,setAdding]=useState(false);
  const [nI,setNI]=useState({painPoint:'',feature:'',benefit:'',proof:'',discriminator:'',proofPointIds:[]});
  const upd=(id,f,v)=>onChange({...opp,solutioning:items.map(x=>x.id===id?{...x,[f]:v}:x)});
  const del=id=>onChange({...opp,solutioning:items.filter(x=>x.id!==id)});
  const addItem=()=>{onChange({...opp,solutioning:[...items,{...nI,id:Date.now(),aiGenerated:false}]});setNI({painPoint:'',feature:'',benefit:'',proof:'',discriminator:'',proofPointIds:[]});setAdding(false);};
  const gen=async id=>{
    setLoading(id);const item=items.find(x=>x.id===id);
    const linkedPPs=proofPoints.filter(p=>(item.proofPointIds||[]).includes(p.id));
    try{const r=await callClaude(PROMPTS.discriminators,
      `Opportunity: ${opp.name||'TBD'} (${opp.tcv||'TBD'}, ${opp.agency||'federal agency'})\nPain Point: ${item.painPoint}\nFeature: ${item.feature}\nBenefit: ${item.benefit}\nProof: ${item.proof}${linkedPPs.length?'\nProof Points:\n'+linkedPPs.map(p=>`- ${p.title}: ${p.metric}`).join('\n'):''}\n\nWrite a 2-3 sentence discriminator. Under 60 words. Lead with unique capability. Quantify.`);
      onChange({...opp,solutioning:items.map(x=>x.id===id?{...x,discriminator:r.trim(),aiGenerated:true}:x)});}catch(e){console.error(e);}
    setLoading(null);
  };
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <div style={{fontSize:12,color:B.silver}}>Feature → Benefit → Proof · {items.length} element{items.length!==1?'s':''}</div>
      <button style={S.btn(B.force)} onClick={()=>setAdding(!adding)}>+ Add Element</button>
    </div>
    {adding&&<div style={{...S.card,border:`1px solid ${B.sky}`,animation:'fadeIn .15s ease',marginBottom:12}}>
      <div style={S.hdg}>New Solution Element</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {[['painPoint','Customer Pain Point'],['feature','Feature / Capability'],['benefit','Benefit'],['proof','Proof']].map(([k,l])=>(
          <div key={k}><span style={S.lbl}>{l}</span><textarea style={ta} rows={3} value={nI[k]} onChange={e=>setNI(p=>({...p,[k]:e.target.value}))}/></div>
        ))}
      </div>
      <ProofPointPicker proofPoints={proofPoints} selectedIds={nI.proofPointIds||[]} onToggle={id=>setNI(p=>({...p,proofPointIds:(p.proofPointIds||[]).includes(id)?(p.proofPointIds||[]).filter(x=>x!==id):[...(p.proofPointIds||[]),id]}))}/>
      <div style={{display:'flex',gap:8,marginTop:10}}><button style={S.btn(B.sky)} onClick={addItem}>Add</button><button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver}} onClick={()=>setAdding(false)}>Cancel</button></div>
    </div>}
    {items.length===0&&!adding&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>No solution elements yet.</div>}
    {items.map(item=><div key={item.id} style={{...S.card,borderLeft:`3px solid ${B.sky}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div style={{flex:1}}><span style={S.lbl}>Pain Point</span><input style={{...S.inp,fontWeight:700,color:B.supernova}} value={item.painPoint||''} onChange={e=>upd(item.id,'painPoint',e.target.value)} placeholder="Customer hot button…"/></div>
        <div style={{display:'flex',gap:8,marginLeft:12,flexShrink:0}}>
          <button style={{...S.btn(loading===item.id?B.border:B.force),opacity:loading===item.id?0.6:1}} onClick={()=>gen(item.id)} disabled={!!loading}>{loading===item.id?<><span className="spinner"/> Generating…</>:'✦ AI Discriminator'}</button>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,cursor:'pointer'}} onClick={()=>del(item.id)}>✕</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
        {[['Feature',item.feature,'feature',B.sky],['Benefit',item.benefit,'benefit',B.refraction],['Proof',item.proof,'proof',B.supernova]].map(([t,v,f,c])=>(
          <div key={t} style={{background:'#1A1A32',borderRadius:7,padding:'9px 11px',borderTop:`2px solid ${c}`}}>
            <div style={{...S.lbl,color:c,marginBottom:5}}>{t}</div>
            <textarea style={{...ta,minHeight:50,fontSize:11,background:'transparent',border:'none',padding:0,color:'#C8C8E8'}} value={v||''} onChange={e=>upd(item.id,f,e.target.value)}/>
          </div>
        ))}
      </div>
      <ProofPointPicker proofPoints={proofPoints} selectedIds={item.proofPointIds||[]} onToggle={id=>upd(item.id,'proofPointIds',(item.proofPointIds||[]).includes(id)?(item.proofPointIds||[]).filter(x=>x!==id):[...(item.proofPointIds||[]),id])}/>
      {item.discriminator&&<div style={{background:'#1E1E40',borderRadius:7,padding:'9px 12px',borderLeft:`3px solid ${item.aiGenerated?B.sky:B.border}`,marginTop:10}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}><span style={S.lbl}>Discriminator</span>{item.aiGenerated&&badge('AI',B.sky,true)}</div>
        <textarea style={{...ta,minHeight:50,fontSize:12,fontStyle:'italic',color:'#C8C8E8',background:'transparent',border:'none',padding:0}} value={item.discriminator||''} onChange={e=>upd(item.id,'discriminator',e.target.value)}/>
      </div>}
    </div>)}
  </div>;
}
