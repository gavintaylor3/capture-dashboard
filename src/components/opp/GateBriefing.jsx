import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { exportToDoc, exportToPDF } from "../../lib/export";
import { badge } from "../ui";

export function GateBriefing({opp,pastPerfs,toast}){
  const [sel,setSel]=useState('B');
  const [content,setContent]=useState({});
  const [loading,setLoading]=useState(false);
  const [ask,setAsk]=useState('');
  const GC={
    A:{label:'Gate A – Qualify',color:B.refraction,sections:['Opportunity Overview','Strategic Fit','Competitive Assessment','Customer Intelligence','Recommended Go/No-Go'],defaultAsk:'Approve pursuit and authorize initial capture budget.'},
    B:{label:'Gate B – Pursue',color:B.sky,sections:['Executive Summary','Customer Intelligence','Competitive Position & Ghosting','Teaming Strategy','Solution Approach','Risk Register','Price-to-Win Range','Ask of Leadership'],defaultAsk:'Authorize full capture resources and confirm bid intent.'},
    C:{label:'Gate C – Bid/No-Bid',color:B.supernova,sections:['Final P-Win Assessment','Competitive Update','Win Theme Summary','Solutioning Overview','Staffing','Pricing Confirmation','Risk Mitigation Status','Leadership Decision'],defaultAsk:'Authorize proposal submission with approved pricing.'},
  };
  const gen=async()=>{
    setLoading(true);const gc=GC[sel];
    const linked=pastPerfs.filter(p=>(opp.linkedPastPerfIds||[]).includes(p.id));
    try{const r=await callClaude(PROMPTS.gateBriefing,
      `Gate: ${gc.label}\nOpp: ${opp.name||'TBD'} — ${opp.tcv||'TBD'}\nAgency: ${opp.agency||'TBD'}\nIncumbent: ${opp.incumbent||'TBD'}\nRFP: ${opp.rfpDate||'TBD'}\nP-Win: ${opp.pWinScore}%\nPartners: ${(opp.partners||[]).filter(p=>p.status==='Y').map(p=>p.name).join(', ')||'None'}\nCompetitors: ${(opp.competitors||[]).map(c=>c.name).join(', ')||'TBD'}\nActive Risks: ${(opp.risks||[]).filter(r=>r.status==='Active').map(r=>r.name).join('; ')||'None'}\nWin Themes: ${(opp.winThemes||[]).map(t=>t.hotButton).join('; ')||'TBD'}\nPast Performances: ${linked.map(p=>p.name+' ('+p.cparRating+')').join(', ')||'None linked'}\nAsk: ${ask||gc.defaultAsk}\n\nSections:\n${gc.sections.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\nUnder 400 words.`);
      setContent(p=>({...p,[sel]:r}));toast('Brief generated');}catch(e){toast('Failed','error');}
    setLoading(false);
  };
  const gc=GC[sel];
  const printBrief=()=>{const w=window.open('','_blank','width=800,height=600');w.document.write(`<html><head><title>${gc.label}</title><style>body{font-family:'DM Sans',Verdana,sans-serif;padding:40px;color:#222}h1{color:#442C81;border-bottom:2px solid #29AAE1;padding-bottom:8px}pre{white-space:pre-wrap;font-size:13px;line-height:1.85}footer{margin-top:32px;padding-top:12px;border-top:1px solid #ccc;font-size:11px;color:#666}</style></head><body><h1>${gc.label} — Executive Brief</h1><h2>${opp.name||'Untitled'} · ${opp.tcv||'TBD'} · ${opp.agency||'TBD'}</h2><pre>${content[sel]}</pre><div style="margin-top:20px;padding:12px;background:#f5f5f5;border-left:4px solid #442C81"><strong>Ask:</strong> ${ask||gc.defaultAsk}</div><footer>Astrion EDGE™ Capture v5.1 · ${new Date().toLocaleDateString()}</footer></body></html>`);w.document.close();setTimeout(()=>w.print(),500);};
  return <div>
    <div style={{display:'flex',gap:10,marginBottom:14}}>{Object.entries(GC).map(([gid,gc2])=><button key={gid} style={{flex:1,padding:'10px',borderRadius:9,border:`2px solid ${sel===gid?gc2.color:B.border}`,background:sel===gid?gc2.color+'22':B.cardBg,color:sel===gid?gc2.color:'#9090B8',fontWeight:700,fontSize:12,cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif"}} onClick={()=>setSel(gid)}>{gc2.label}</button>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
      <div style={S.card}>
        <div style={S.hdg}>Auto-Populated Data</div>
        {[{l:'Opportunity',v:`${opp.name||'TBD'} · ${opp.tcv||'TBD'}`},{l:'Agency',v:opp.agency||'TBD'},{l:'P-Win',v:opp.pWinScore+'%'},{l:'Incumbent',v:opp.incumbent||'None'},{l:'Partners',v:(opp.partners||[]).filter(p=>p.status==='Y').map(p=>p.name).join(', ')||'None'},{l:'Past Perfs',v:pastPerfs.filter(p=>(opp.linkedPastPerfIds||[]).includes(p.id)).length+' linked'},{l:'Risks',v:(opp.risks||[]).filter(r=>r.status==='Active').length+' active'},{l:'Win Themes',v:(opp.winThemes||[]).length}].map(({l,v})=>(
          <div key={l} style={{display:'flex',gap:8,fontSize:11,padding:'4px 0',borderBottom:`1px solid ${B.border}`}}><span style={{color:B.silver,minWidth:110}}>{l}:</span><span style={{color:'#D0D0E8'}}>{v}</span></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.hdg}>Gate Sections</div>
        {gc.sections.map((s,i)=><div key={i} style={{display:'flex',gap:8,padding:'4px 0',borderBottom:`1px solid ${B.border}`}}><span style={{color:gc.color,fontSize:11,fontWeight:700,minWidth:18}}>{i+1}</span><span style={{color:'#C0C0E0',fontSize:11}}>{s}</span></div>)}
        <div style={{marginTop:10}}><span style={S.lbl}>Ask of Leadership</span><textarea style={ta} rows={3} value={ask||gc.defaultAsk} onChange={e=>setAsk(e.target.value)}/></div>
      </div>
    </div>
    <div style={{textAlign:'center',marginBottom:14}}>
      <button style={{...S.btn(loading?B.border:gc.color),opacity:loading?0.6:1,padding:'10px 28px',fontSize:13}} onClick={gen} disabled={loading}>{loading?<><span className="spinner"/> Generating…</>:`✦ Generate ${sel} Gate Brief`}</button>
    </div>
    {content[sel]&&<div style={{...S.card,border:`1px solid ${gc.color}44`}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{fontSize:14,fontWeight:700,color:gc.color}}>{gc.label} — Brief</div>
        <div style={{display:'flex',gap:8}}>
          {badge('AI-Generated',gc.color)}
          <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>navigator.clipboard.writeText(content[sel]).then(()=>toast('Copied'))}>📋 Copy</button>
          <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={printBrief}>🖨 Print</button>
          <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>{exportToPDF(content[sel],gc.label+' — Executive Brief',opp.name+' · '+(opp.tcv||'TBD')+' · '+(opp.agency||'TBD'),'Ask: '+(ask||gc.defaultAsk));toast('PDF downloaded');}}>↓ PDF</button>
          <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>{exportToDoc(content[sel]+'\n\n---\nAsk: '+(ask||gc.defaultAsk),gc.label+' — Executive Brief',opp.name+' · '+(opp.tcv||'TBD')+' · '+(opp.agency||'TBD'));toast('Word downloaded');}}>↓ Word</button>
        </div>
      </div>
      <div style={{background:'#0E0E22',borderRadius:8,padding:'14px 18px'}}>
        <pre style={{whiteSpace:'pre-wrap',color:'#D0D0E8',fontSize:12,margin:0,lineHeight:1.9}}>{content[sel]}</pre>
      </div>
    </div>}
  </div>;
}
