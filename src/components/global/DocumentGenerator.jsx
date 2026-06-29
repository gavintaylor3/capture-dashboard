import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { DOC_TYPES } from "../../config/methodology";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { exportToDoc, exportToPDF } from "../../lib/export";
import { PastPerfPicker, ProofPointPicker, badge } from "../ui";

export function DocumentGenerator({opps,pastPerfs,proofPoints,setProofPoints,toast}){
  const [docType,setDocType]=useState('capstat');
  const [selOpp,setSelOpp]=useState('');
  const [selPPs,setSelPPs]=useState([]);
  const [selPerfs,setSelPerfs]=useState([]);
  const [context,setContext]=useState('');
  const [audience,setAudience]=useState('');
  const [wordTarget,setWordTarget]=useState(500);
  const [output,setOutput]=useState('');
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);
  const dt=DOC_TYPES.find(d=>d.id===docType);
  const opp=opps.find(o=>o.id===+selOpp);
  const selPPObjs=proofPoints.filter(p=>selPPs.includes(p.id));
  const selPerfObjs=pastPerfs.filter(p=>selPerfs.includes(p.id));
  const recordUsage=(ppIds,dt2,oppName)=>{const date=new Date().toISOString();setProofPoints(pps=>pps.map(pp=>ppIds.includes(pp.id)?{...pp,usageHistory:[...(pp.usageHistory||[]),{docType:dt2,oppName:oppName||'',date}]}:pp));};
  const generate=async()=>{
    setLoading(true);
    const sys=PROMPTS.docGenerator;
    const ppBlock=selPPObjs.length?`\nPROOF POINTS:\n${selPPObjs.map(p=>`- ${p.title}: ${p.metric}${p.context?' ('+p.context+')':''}`).join('\n')}`:'';;
    const perfBlock=selPerfObjs.length?`\nPAST PERFORMANCES:\n${selPerfObjs.map(p=>`- ${p.name} | ${p.agency} | ${p.value} | ${p.role} | ${p.cparRating||'N/A'} | ${p.keyAchievements||p.description||''}`).join('\n')}`:'';;
    const oppBlock=opp?`\nOPP: ${opp.name} | ${opp.agency||'TBD'} | ${opp.tcv||'TBD'} | ${opp.stage}`:'';
    const prompts={
      rfi:`RFI Response (~${wordTarget} words). Audience: ${audience||'Contracting officer'}\n${ppBlock}${perfBlock}${oppBlock}\n${context||''}\nCover: company overview, capabilities, relevant experience, differentiators, call to action.`,
      rfp:`Technical Approach for RFP (~${wordTarget} words). Audience: ${audience||'Source selection board'}\n${ppBlock}${perfBlock}${oppBlock}\n${context||''}\nCover: approach, methodology, discriminators, past performance relevance, management approach.`,
      whitepaper:`White Paper (~${wordTarget} words). Topic: ${context||'Astrion technical capabilities'}\nAudience: ${audience||'Government decision-makers'}\n${ppBlock}${perfBlock}${oppBlock}\nCover: exec summary, problem, approach, evidence, recommendations, conclusion.`,
      capstat:`Capability Statement (~${wordTarget} words). Focus: ${context||'Core competencies'}\nCustomer: ${audience||'Federal agencies'}\n${ppBlock}${perfBlock}${oppBlock}\nCover: overview, core competencies, differentiators with proof, past performance, contact placeholder.`,
      relevance:`Relevance Narrative (~${wordTarget} words). Requirement: ${context||opp?.description||'Federal services'}\nCustomer: ${audience||opp?.agency||'Federal agency'}\n${ppBlock}${perfBlock}${oppBlock}\nDemonstrate why Astrion is uniquely relevant. Cite past performances, use proof points as evidence.`,
      pastperf:`Past Performance Volume (~${wordTarget} words). Requirement: ${context||'Federal services'}\n${ppBlock}${perfBlock}${oppBlock}\nFor each PP: contract name/number, customer, period, value, scope, Astrion role, achievements, relevance, POC.`,
      sources:`Sources Sought Response (~${wordTarget} words). Requirement: ${context||'Federal services'}\nAgency: ${audience||opp?.agency||'Federal agency'}\n${ppBlock}${perfBlock}${oppBlock}\nCover: company info, capability narrative, past performance summary, interest, questions for government.`,
    };
    try{const r=await callClaude(sys,prompts[docType]||prompts.capstat);
      setOutput(r);recordUsage(selPPs,docType,opp?.name||'');
      setHistory(h=>[{id:Date.now(),docType,label:dt.label,oppName:opp?.name||'',date:new Date().toISOString(),content:r},...h.slice(0,9)]);
      toast(`${dt.label} generated`);
    }catch(e){toast('Generation failed','error');}
    setLoading(false);
  };
  const dl=()=>{const b=new Blob([output],{type:'text/plain'});const url=URL.createObjectURL(b);const a=document.createElement('a');a.href=url;a.download=`${dt.label.replace(/\s+/g,'-')}-${new Date().toISOString().slice(0,10)}.txt`;a.click();URL.revokeObjectURL(url);toast('Downloaded');};
  return <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
    <div style={{width:340,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',overflowY:'auto'}}>
      <div style={{padding:'16px',borderBottom:`1px solid ${B.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF',marginBottom:14}}>Document Generator</div>
        <span style={S.lbl}>Document Type</span>
        <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:14}}>
          {DOC_TYPES.map(d=><button key={d.id} onClick={()=>setDocType(d.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,border:`1px solid ${docType===d.id?d.color:B.border}`,background:docType===d.id?d.color+'18':'transparent',cursor:'pointer',textAlign:'left',transition:'all .12s',fontFamily:"'DM Sans',sans-serif"}}>
            <span style={{fontSize:16}}>{d.icon}</span><span style={{fontSize:12,fontWeight:700,color:docType===d.id?d.color:'#9090B8'}}>{d.label}</span>
          </button>)}
        </div>
        <div style={{marginBottom:12}}><span style={S.lbl}>Opportunity (optional)</span><select style={S.inp} value={selOpp} onChange={e=>setSelOpp(e.target.value)}><option value="">None</option>{opps.map(o=><option key={o.id} value={o.id}>{o.name||'Untitled'} — {o.agency}</option>)}</select></div>
        <div style={{marginBottom:12}}><span style={S.lbl}>Target Audience</span><input style={S.inp} value={audience} onChange={e=>setAudience(e.target.value)} placeholder="e.g. DISA Contracting Officer"/></div>
        <div style={{marginBottom:12}}><span style={S.lbl}>Additional Context</span><textarea style={{...ta,minHeight:60,fontSize:12}} value={context} onChange={e=>setContext(e.target.value)} placeholder="Focus areas, specific requirements…"/></div>
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
            <span style={S.lbl}>Target Length</span><span className="mono" style={{fontSize:13,color:B.sky,fontWeight:700}}>{wordTarget} words</span>
          </div>
          <input type="range" min={150} max={1500} step={50} value={wordTarget} onChange={e=>setWordTarget(+e.target.value)}/>
        </div>
        <div style={{marginBottom:12,background:'#1A1A32',borderRadius:9,padding:'10px 12px'}}>
          <ProofPointPicker proofPoints={proofPoints} selectedIds={selPPs} onToggle={id=>setSelPPs(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])} label={`Proof Points (${selPPs.length} selected)`}/>
        </div>
        <div style={{marginBottom:14,background:'#1A1A32',borderRadius:9,padding:'10px 12px'}}>
          <PastPerfPicker pastPerfs={pastPerfs} selectedIds={selPerfs} onToggle={id=>setSelPerfs(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])} label={`Past Performances (${selPerfs.length} selected)`}/>
        </div>
        <button style={{...S.btn(loading?B.border:dt.color),width:'100%',padding:'10px',fontSize:13,opacity:loading?0.6:1}} onClick={generate} disabled={loading}>{loading?<><span className="spinner"/> Generating…</>:`${dt.icon} Generate ${dt.label}`}</button>
      </div>
      {history.length>0&&<div style={{padding:'12px 16px'}}>
        <div style={{...S.lbl,marginBottom:8}}>Recent</div>
        {history.map(h=><div key={h.id} onClick={()=>setOutput(h.content)} style={{padding:'7px 10px',borderRadius:7,cursor:'pointer',marginBottom:4,border:`1px solid ${B.border}`,transition:'all .1s'}} onMouseEnter={e=>e.currentTarget.style.background='#1A1A32'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0'}}>{DOC_TYPES.find(d=>d.id===h.docType)?.icon} {h.label}</div>
          {h.oppName&&<div style={{fontSize:10,color:B.silver}}>{h.oppName}</div>}
          <div style={{fontSize:10,color:B.border}}>{h.date?.slice(0,10)}</div>
        </div>)}
      </div>}
    </div>
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {!output&&<div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:B.silver}}>
        <div style={{fontSize:52}}>{dt.icon}</div>
        <div style={{fontSize:17,fontWeight:700,color:'#D0D0F0'}}>{dt.label}</div>
        <div style={{fontSize:12,color:B.silver,textAlign:'center',maxWidth:380,lineHeight:1.7}}>Select document type, choose proof points and past performances, then generate.</div>
      </div>}
      {output&&<>
        <div style={{padding:'12px 20px',borderBottom:`1px solid ${B.border}`,display:'flex',justifyContent:'space-between',alignItems:'center',background:B.cardBg,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{fontSize:20}}>{dt.icon}</span>
            <div><div style={{fontSize:14,fontWeight:700,color:dt.color}}>{dt.label}</div>{opp&&<div style={{fontSize:11,color:B.silver}}>{opp.name}</div>}</div>
            {badge('AI-Generated',dt.color)}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px'}} onClick={()=>navigator.clipboard.writeText(output).then(()=>toast('Copied'))}>📋 Copy</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px'}} onClick={dl}>↓ .txt</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px'}} onClick={()=>{exportToPDF(output,dt.label,opp?opp.name+' · '+(opp.agency||''):'Astrion EDGE™');toast('PDF downloaded');}}>↓ PDF</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px'}} onClick={()=>{exportToDoc(output,dt.label,opp?opp.name+' · '+(opp.agency||''):'Astrion EDGE™');toast('Word downloaded');}}>↓ Word</button>
            <button style={{...S.btn(dt.color),fontSize:11,padding:'5px 14px'}} onClick={generate} disabled={loading}>{loading?'…':'↻ Regen'}</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          <textarea style={{...ta,minHeight:'calc(100vh - 220px)',fontSize:13,lineHeight:1.9,color:'#D0D0E8',background:'transparent',border:`1px solid ${B.border}`,borderRadius:9,padding:'16px 20px'}} value={output} onChange={e=>setOutput(e.target.value)}/>
        </div>
      </>}
    </div>
  </div>;
}
