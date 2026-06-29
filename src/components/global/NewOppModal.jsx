import { useEffect, useState } from "react";
import { B, S } from "../../config/theme";
import { STAGES, blankOpp } from "../../config/methodology";
import { PWinSlider, TCVInput } from "../ui";

export function NewOppModal({onSave,onCancel}){
  const [d,setD]=useState({name:'',tcv:'',agency:'',rfpDate:'',incumbent:'',stage:'Gate A',pWinScore:50});
  useEffect(()=>{const h=e=>{if(e.key==='Escape')onCancel();};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h);},[]);
  const valid=d.name.trim().length>0;
  return <div style={{position:'fixed',inset:0,background:'rgba(6,6,16,.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
    <div style={{background:B.cardBg,border:`1px solid ${B.border}`,borderRadius:14,padding:'28px 32px',width:500,animation:'fadeIn .2s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{fontSize:17,fontWeight:800,color:'#F0F0FF',letterSpacing:'-.01em'}}>New Opportunity</div>
        <button onClick={onCancel} style={{...S.btn('transparent'),border:'none',color:B.silver,fontSize:18,cursor:'pointer',padding:'0 4px'}}>✕</button>
      </div>
      {[{k:'name',l:'Opportunity Name *',ph:'e.g. DISA IT Modernization'},{k:'agency',l:'Agency / Command',ph:'e.g. DISA'},{k:'incumbent',l:'Incumbent'}].map(({k,l,ph})=>(
        <div key={k} style={{marginBottom:11}}><span style={S.lbl}>{l}</span><input style={{...S.inp,borderColor:k==='name'&&!d.name.trim()?B.twilight+'66':B.border}} value={d[k]||''} placeholder={ph||''} onChange={e=>setD(p=>({...p,[k]:e.target.value}))}/></div>
      ))}
      <div style={{marginBottom:11}}><span style={S.lbl}>Total Contract Value</span><TCVInput value={d.tcv} onChange={v=>setD(p=>({...p,tcv:v}))}/></div>
      <div style={{marginBottom:11}}><span style={S.lbl}>RFP Date</span><input style={S.inp} type="month" value={d.rfpDate||''} onChange={e=>setD(p=>({...p,rfpDate:e.target.value}))}/></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:20}}>
        <div><span style={S.lbl}>Stage</span><select style={S.inp} value={d.stage} onChange={e=>setD(p=>({...p,stage:e.target.value}))}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
        <div><PWinSlider value={d.pWinScore} onChange={v=>setD(p=>({...p,pWinScore:v}))}/></div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver}} onClick={onCancel}>Cancel</button>
        <button style={{...S.btn(valid?B.force:B.border),opacity:valid?1:.5,cursor:valid?'pointer':'not-allowed'}} onClick={()=>{if(valid)onSave(blankOpp({...d,id:Date.now()}));}}>Create Opportunity →</button>
      </div>
    </div>
  </div>;
}
