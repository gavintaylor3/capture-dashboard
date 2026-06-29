import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { ProofPointPicker, badge } from "../ui";

export function WinThemes({opp,onChange,proofPoints}){
  const ts=opp.winThemes||[];
  const [genId,setGenId]=useState(null);
  const [adding,setAdding]=useState(false);
  const [nT,setNT]=useState({hotButton:'',sectionM:'',feature:'',benefit:'',proof:'',narrative:'',proofPointIds:[]});
  const upd=(id,f,v)=>onChange({...opp,winThemes:ts.map(t=>t.id===id?{...t,[f]:v}:t)});
  const del=id=>onChange({...opp,winThemes:ts.filter(t=>t.id!==id)});
  const addTheme=()=>{onChange({...opp,winThemes:[...ts,{...nT,id:Date.now(),aiGenerated:false}]});setNT({hotButton:'',sectionM:'',feature:'',benefit:'',proof:'',narrative:'',proofPointIds:[]});setAdding(false);};
  const gen=async id=>{
    setGenId(id);const t=ts.find(x=>x.id===id);
    const pps=proofPoints.filter(p=>(t.proofPointIds||[]).includes(p.id));
    try{const r=await callClaude(PROMPTS.winThemes,
      `Win theme for ${opp.name||'this'} (${opp.tcv||'TBD'}, ${opp.agency||'federal agency'}).\nHot Button: ${t.hotButton}\nSection M: ${t.sectionM||'General'}\nFeature: ${t.feature}\nBenefit: ${t.benefit}\nProof: ${t.proof}${pps.length?'\nProof Points:\n'+pps.map(p=>`- ${p.title}: ${p.metric}`).join('\n'):''}\n\n4-5 sentences, under 120 words.`);
      onChange({...opp,winThemes:ts.map(t2=>t2.id===id?{...t2,narrative:r.trim(),aiGenerated:true}:t2)});}catch(e){console.error(e);}
    setGenId(null);
  };
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <div style={{fontSize:12,color:B.silver}}>{ts.length} win theme{ts.length!==1?'s':''}</div>
      <button style={S.btn(B.force)} onClick={()=>setAdding(!adding)}>+ Add Win Theme</button>
    </div>
    {adding&&<div style={{...S.card,border:`1px solid ${B.supernova}`,animation:'fadeIn .15s ease',marginBottom:12}}>
      <div style={S.hdg}>New Win Theme</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
        {[['hotButton','Hot Button'],['sectionM','Section M Ref'],['feature','Discriminating Feature'],['benefit','Benefit'],['proof','Proof']].map(([k,l])=>(
          <div key={k}><span style={S.lbl}>{l}</span>{k==='sectionM'?<input style={S.inp} value={nT[k]} onChange={e=>setNT(p=>({...p,[k]:e.target.value}))}/>:<textarea style={ta} rows={3} value={nT[k]} onChange={e=>setNT(p=>({...p,[k]:e.target.value}))}/>}</div>
        ))}
      </div>
      <ProofPointPicker proofPoints={proofPoints} selectedIds={nT.proofPointIds||[]} onToggle={id=>setNT(p=>({...p,proofPointIds:(p.proofPointIds||[]).includes(id)?(p.proofPointIds||[]).filter(x=>x!==id):[...(p.proofPointIds||[]),id]}))}/>
      <div style={{display:'flex',gap:8,marginTop:10}}><button style={S.btn(B.supernova)} onClick={addTheme}>Add</button><button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver}} onClick={()=>setAdding(false)}>Cancel</button></div>
    </div>}
    {ts.length===0&&!adding&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>No win themes yet.</div>}
    {ts.map(t=><div key={t.id} style={{...S.card,borderLeft:`3px solid ${B.supernova}`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
        <div style={{flex:1}}>
          <span style={S.lbl}>Hot Button</span>
          <input style={{...S.inp,fontWeight:700,color:B.supernova,fontSize:14}} value={t.hotButton||''} onChange={e=>upd(t.id,'hotButton',e.target.value)} placeholder="Hot button…"/>
          <input style={{...S.inp,marginTop:5,fontSize:11,color:B.sky}} value={t.sectionM||''} placeholder="Section M reference" onChange={e=>upd(t.id,'sectionM',e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:8,marginLeft:12,flexShrink:0}}>
          <button style={{...S.btn(genId===t.id?B.border:B.force),opacity:genId===t.id?0.6:1}} onClick={()=>gen(t.id)} disabled={!!genId}>{genId===t.id?<><span className="spinner"/> Writing…</>:'✦ Generate'}</button>
          <button style={{...S.btn('transparent'),border:'none',color:B.twilight,cursor:'pointer'}} onClick={()=>del(t.id)}>✕</button>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:10}}>
        {[['Feature',t.feature,'feature',B.sky],['Benefit',t.benefit,'benefit',B.refraction],['Proof',t.proof,'proof',B.supernova]].map(([l,v,f,c])=>(
          <div key={l} style={{background:'#1A1A32',borderRadius:7,padding:'9px 11px',borderTop:`2px solid ${c}`}}>
            <div style={{...S.lbl,color:c,marginBottom:5}}>{l}</div>
            <textarea style={{...ta,minHeight:50,fontSize:11,background:'transparent',border:'none',padding:0,color:'#C8C8E8'}} value={v||''} onChange={e=>upd(t.id,f,e.target.value)}/>
          </div>
        ))}
      </div>
      <ProofPointPicker proofPoints={proofPoints} selectedIds={t.proofPointIds||[]} onToggle={id=>upd(t.id,'proofPointIds',(t.proofPointIds||[]).includes(id)?(t.proofPointIds||[]).filter(x=>x!==id):[...(t.proofPointIds||[]),id])}/>
      {t.narrative&&<div style={{background:'#1E1E40',borderRadius:7,padding:'12px 14px',borderLeft:`3px solid ${t.aiGenerated?B.supernova:B.border}`,marginTop:10}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}><span style={S.lbl}>Win Narrative</span>{t.aiGenerated&&badge('AI',B.supernova,true)}</div>
        <textarea style={{...ta,minHeight:68,fontSize:12,color:'#D0D0E8',background:'transparent',border:'none',padding:0,lineHeight:1.75}} value={t.narrative||''} onChange={e=>upd(t.id,'narrative',e.target.value)}/>
      </div>}
    </div>)}
  </div>;
}
