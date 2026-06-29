import { jsPDF as jsPDFLib } from "jspdf";
import PWinerator from "./components/PWinerator";
import { useState, useEffect } from "react";
import { B, S } from "./config/theme";
import { gateColor, fmtTCVDisplay } from "./lib/format";
import { KEYS, exportFilePrefix } from "./config/keys";
import { OPP_NAV } from "./nav";
import { useToast, ConfirmModal } from "./components/ui";
import { OppDashboard, OppSetup, OppDocuments, CompetitiveIntel, CustomerMap, Teaming, Solutioning, WinThemes, GateBriefing, OppPastPerf, Risks, ActionItems, PriceToWin } from "./components/opp";
import { CompetitorLibrary, BlackHatCenter, PastPerfLibrary, ProofPointLibrary, DocumentGenerator, Portfolio, NewOppModal, AnalyticsDashboard, GlobalSearch } from "./components/global";
// Make jsPDF available the same way the original code expects it
window.jspdf = { jsPDF: jsPDFLib };

/* ── HELPERS ── */


/* ── TOAST ── */

/* ── CONFIRM ── */

/* ── FILE UPLOADER ── */


/* ── P-WIN GAUGE (SVG circular) ── */

/* ── HEALTH BAR ── */

/* ── TEAM AVATAR ── */

/* ── PWIN SLIDER ── */

/* ── PROOF POINT PICKER ── */

/* ── PAST PERF PICKER ── */

/* ═══════════════════ OPP DASHBOARD (redesigned) ═══════════════════ */

/* ═══════════════════ OPP SETUP ═══════════════════ */

/* ═══════════════════ OPP DOCUMENTS ═══════════════════ */

/* ═══════════════════ COMPETITOR PICKER ═══════════════════ */

/* ═══════════════════ GLOBAL COMPETITOR LIBRARY ═══════════════════ */

/* ═══════════════════ BLACK HAT CENTER ═══════════════════ */

/* ═══════════════════ COMPETITIVE INTEL (per-opp, enhanced) ═══════════════════ */

/* ═══════════════════ CUSTOMER MAP ═══════════════════ */

/* ═══════════════════ TEAMING ═══════════════════ */

/* ═══════════════════ SOLUTIONING ═══════════════════ */

/* ═══════════════════ WIN THEMES ═══════════════════ */

/* ═══════════════════ GATE BRIEFING ═══════════════════ */

/* ═══════════════════ OPP PAST PERF (linked) ═══════════════════ */

/* ═══════════════════ RISKS ═══════════════════ */

/* ═══════════════════ ACTION ITEMS ═══════════════════ */

/* ═══════════════════ PAST PERF LIBRARY ═══════════════════ */

/* ═══════════════════ PROOF POINTS LIBRARY ═══════════════════ */

/* ═══════════════════ DOCUMENT GENERATOR ═══════════════════ */

/* ═══════════════════ PORTFOLIO ═══════════════════ */

/* ═══════════════════ NEW OPP MODAL ═══════════════════ */

/* ═══════════════════ ROOT APP ═══════════════════ */
/* ═══════════════════ ANALYTICS DASHBOARD ═══════════════════ */

/* ═══════════════════ GLOBAL SEARCH ═══════════════════ */

/* ═══════════════════ PRICE TO WIN MODULE ═══════════════════ */

const GLOBAL_VIEWS=['portfolio','pastperfs','proofpoints','docgen','competitors','blackhats','analytics','search'];

function App(){
  const load=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
  const [opps,setOpps]                         = useState(()=>load(KEYS.opps)||[]);
  const [pastPerfs,setPastPerfs]               = useState(()=>load(KEYS.pastperfs)||[]);
  const [proofPoints,setProofPoints]           = useState(()=>load(KEYS.proofpoints)||[]);
  const [fileStore,setFileStore]               = useState(()=>load(KEYS.files)||{});
  const [globalCompetitors,setGlobalCompetitors] = useState(()=>load(KEYS.gcompetitors)||[]);
  const [blackHatSessions,setBlackHatSessions] = useState(()=>load(KEYS.blackhats)||[]);
  const [view,setView]                         = useState('portfolio');
  const [activeOppId,setActiveOppId]           = useState(null);
  const [activeModule,setModule]               = useState('dashboard');
  const [showNew,setShowNew]                   = useState(false);
  const [confirmDel,setConfirmDel]             = useState(null);
  const {show:toast,TC}                        = useToast();

  useEffect(()=>{try{localStorage.setItem(KEYS.opps,JSON.stringify(opps));}catch{}},[opps]);
  useEffect(()=>{try{localStorage.setItem(KEYS.pastperfs,JSON.stringify(pastPerfs));}catch{}},[pastPerfs]);
  useEffect(()=>{try{localStorage.setItem(KEYS.proofpoints,JSON.stringify(proofPoints));}catch{}},[proofPoints]);
  useEffect(()=>{try{localStorage.setItem(KEYS.files,JSON.stringify(fileStore));}catch{}},[fileStore]);
  useEffect(()=>{try{localStorage.setItem(KEYS.gcompetitors,JSON.stringify(globalCompetitors));}catch{}},[globalCompetitors]);
  useEffect(()=>{try{localStorage.setItem(KEYS.blackhats,JSON.stringify(blackHatSessions));}catch{}},[blackHatSessions]);

  const addFiles=f=>{if(!f)return;setFileStore(s=>({...s,[f.id]:f}));};
  const removeFile=id=>setFileStore(s=>{const n={...s};delete n[id];return n;});

  const opp=opps.find(o=>o.id===activeOppId);
  const updOpp=u=>setOpps(p=>p.map(o=>o.id===u.id?u:o));
  const delOpp=id=>{setOpps(p=>p.filter(o=>o.id!==id));setActiveOppId(null);setView('portfolio');setConfirmDel(null);toast('Opportunity deleted');};
  const openOpp=id=>{setActiveOppId(id);setModule('dashboard');setView('opp');};
  const saveNew=o=>{setOpps(p=>[...p,o]);setShowNew(false);openOpp(o.id);toast('Opportunity created');};
  const exportAll=()=>{
    const data=JSON.stringify({opps,pastPerfs,proofPoints,globalCompetitors,blackHatSessions},null,2);
    const b=new Blob([data],{type:'application/json'});
    const url=URL.createObjectURL(b);
    const a=document.createElement('a');a.href=url;a.download=`${exportFilePrefix}-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Exported');
  };
  const importAll=data=>{if(data.opps)setOpps(data.opps);if(data.pastPerfs)setPastPerfs(data.pastPerfs);if(data.proofPoints)setProofPoints(data.proofPoints);if(data.globalCompetitors)setGlobalCompetitors(data.globalCompetitors);if(data.blackHatSessions)setBlackHatSessions(data.blackHatSessions);};

  const openActs=opp?opp.actions.filter(a=>a.status!=='Complete').length:0;
  const activeRisk=opp?opp.risks.filter(r=>r.status==='Active').length:0;
  const linkedPerfs=opp?(opp.linkedPastPerfIds||[]).length:0;
  const oppDocs=opp?(opp.oppFiles||[]).length:0;

  const navTo=mod=>{setModule(mod);setView('opp');};

  const OPP_MODS=opp?{
    dashboard:   <OppDashboard opp={opp} pastPerfs={pastPerfs} onNav={navTo}/>,
    setup:       <OppSetup opp={opp} onChange={updOpp}/>,
    pwinerator:  <PWinerator opp={opp} onSave={updOpp}/>,
    competitive: <CompetitiveIntel opp={opp} onChange={updOpp} globalCompetitors={globalCompetitors} blackHatSessions={blackHatSessions} toast={toast}/>,
    customer:    <CustomerMap opp={opp} onChange={updOpp}/>,
    teaming:     <Teaming opp={opp} onChange={updOpp}/>,
    solutioning: <Solutioning opp={opp} onChange={updOpp} proofPoints={proofPoints}/>,
    winthemes:   <WinThemes opp={opp} onChange={updOpp} proofPoints={proofPoints}/>,
    briefing:    <GateBriefing opp={opp} pastPerfs={pastPerfs} toast={toast}/>,
    ptw:         <PriceToWin opp={opp} onChange={updOpp} globalCompetitors={globalCompetitors} toast={toast}/>,
    pastperf:    <OppPastPerf opp={opp} onChange={updOpp} pastPerfs={pastPerfs} proofPoints={proofPoints}/>,
    documents:   <OppDocuments opp={opp} onChange={updOpp} toast={toast}/>,
    risks:       <Risks opp={opp} onChange={updOpp}/>,
    actions:     <ActionItems opp={opp} onChange={updOpp}/>,
  }:{};

  const GLOBAL_MODS={
    pastperfs:   <PastPerfLibrary pastPerfs={pastPerfs} setPastPerfs={setPastPerfs} proofPoints={proofPoints} fileStore={fileStore} addFiles={addFiles} removeFile={removeFile} toast={toast}/>,
    proofpoints: <ProofPointLibrary proofPoints={proofPoints} setProofPoints={setProofPoints} pastPerfs={pastPerfs} fileStore={fileStore} addFiles={addFiles} removeFile={removeFile} toast={toast}/>,
    docgen:      <DocumentGenerator opps={opps} pastPerfs={pastPerfs} proofPoints={proofPoints} setProofPoints={setProofPoints} toast={toast}/>,
    competitors: <CompetitorLibrary globalCompetitors={globalCompetitors} setGlobalCompetitors={setGlobalCompetitors} blackHatSessions={blackHatSessions} opps={opps} fileStore={fileStore} addFiles={addFiles} removeFile={removeFile} toast={toast}/>,
    blackhats:   <BlackHatCenter blackHatSessions={blackHatSessions} setBlackHatSessions={setBlackHatSessions} globalCompetitors={globalCompetitors} setGlobalCompetitors={setGlobalCompetitors} opps={opps} setOpps={setOpps} fileStore={fileStore} addFiles={addFiles} removeFile={removeFile} toast={toast}/>,
    analytics:   <AnalyticsDashboard opps={opps} pastPerfs={pastPerfs} proofPoints={proofPoints} globalCompetitors={globalCompetitors}/>,
    search:      <GlobalSearch opps={opps} pastPerfs={pastPerfs} proofPoints={proofPoints} globalCompetitors={globalCompetitors} onOpenOpp={openOpp}/>,
  };

  return <div style={{display:'flex',height:'100vh',background:B.darkBg,overflow:'hidden'}}>
    <TC/>
    {showNew&&<NewOppModal onSave={saveNew} onCancel={()=>setShowNew(false)}/>}
    {confirmDel&&<ConfirmModal message={`Delete "${opps.find(o=>o.id===confirmDel)?.name||'this opportunity'}"? This cannot be undone.`} onConfirm={()=>delOpp(confirmDel)} onCancel={()=>setConfirmDel(null)}/>}

    {/* ── SIDEBAR ── */}
    <div style={{width:222,background:B.sidebarBg,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden'}}>
      <div style={{padding:'15px 14px 13px',borderBottom:`1px solid ${B.border}`,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${B.force},${B.sky})`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'#fff',boxShadow:`0 3px 12px ${B.force}66`,flexShrink:0}}>A</div>
          <div><div style={{fontSize:12,fontWeight:800,color:'#fff',letterSpacing:'.06em'}}>ASTRION</div><div style={{fontSize:8,color:B.sky,letterSpacing:'.14em',fontWeight:700}}>EDGE™ CAPTURE v5</div></div>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {[
          {id:'portfolio',    label:'Portfolio',          icon:'◈', count:opps.length},
          {id:'pastperfs',    label:'Past Performances',  icon:'🏆', count:pastPerfs.length},
          {id:'proofpoints',  label:'Proof Points',       icon:'💡', count:proofPoints.length},
          {id:'docgen',       label:'Doc Generator',      icon:'📄', count:null},
          {id:'analytics',    label:'Analytics',          icon:'📊', count:null},
          {id:'search',       label:'Search',             icon:'🔍', count:null},
        ].map(n=>{
          const active=(view===n.id||(!opp&&view==='portfolio'&&n.id==='portfolio'))&&!opp;
          const realActive=n.id==='portfolio'?!opp&&view==='portfolio':!opp&&view===n.id;
          return <button key={n.id} className="nav-btn" onClick={()=>{setActiveOppId(null);setView(n.id);}}
            style={{background:realActive?B.force+'33':'transparent',color:realActive?'#fff':'#7070A0',fontWeight:realActive?700:400}}>
            <span style={{fontSize:13}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.count!=null&&n.count>0&&<span style={{fontSize:9,background:realActive?'rgba(255,255,255,.2)':'#1E1E3A',color:realActive?'#fff':'#4A4A80',padding:'1px 6px',borderRadius:8}}>{n.count}</span>}
          </button>;
        })}
        <div style={{margin:'6px 6px 3px',height:1,background:B.border}}/>
        <div style={{padding:'2px 10px 4px'}}><div style={{fontSize:8,color:'#30306A',letterSpacing:'.12em',fontWeight:700,textTransform:'uppercase'}}>Competitive Intel</div></div>
        {[
          {id:'competitors', label:'Competitor Library', icon:'⚔', count:globalCompetitors.length},
          {id:'blackhats',   label:'Black Hat Center',   icon:'🎯', count:blackHatSessions.length},
        ].map(n=>{
          const realActive=!opp&&view===n.id;
          return <button key={n.id} className="nav-btn" onClick={()=>{setActiveOppId(null);setView(n.id);}}
            style={{background:realActive?B.twilight+'33':'transparent',color:realActive?'#fff':'#7070A0',fontWeight:realActive?700:400}}>
            <span style={{fontSize:13}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.count!=null&&n.count>0&&<span style={{fontSize:9,background:realActive?'rgba(255,255,255,.2)':'#1E1E3A',color:realActive?'#fff':'#4A4A80',padding:'1px 6px',borderRadius:8}}>{n.count}</span>}
          </button>;
        })}
        {opp&&<>
          <div style={{margin:'8px 6px 5px',height:1,background:B.border}}/>
          <div style={{padding:'2px 10px 6px'}}>
            <div style={{fontSize:8,color:'#30306A',letterSpacing:'.12em',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>Active Opportunity</div>
            <div style={{fontSize:11,fontWeight:700,color:'#C8C8E8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{opp.name||'Untitled'}</div>
            <div style={{fontSize:9,color:B.sky,marginTop:1,display:'flex',gap:5,alignItems:'center'}}>
              <span className="mono">{fmtTCVDisplay(opp.tcv)||'TBD'}</span>
              <span style={{color:B.border}}>·</span>
              <span>{opp.stage}</span>
            </div>
          </div>
          {OPP_NAV.map(n=>{
            const active=activeModule===n.id&&!!opp&&view==='opp';
            return <button key={n.id} className="nav-btn" onClick={()=>navTo(n.id)}
              style={{background:active?B.force+'33':'transparent',color:active?'#fff':'#7070A0',fontWeight:active?700:400}}>
              <span style={{fontSize:12}}>{n.icon}</span>
              <span style={{flex:1}}>{n.label}</span>
              {n.id==='actions'&&openActs>0&&<span style={{fontSize:9,background:B.twilight,color:'#fff',padding:'1px 5px',borderRadius:8}}>{openActs}</span>}
              {n.id==='risks'&&activeRisk>0&&<span style={{fontSize:9,background:B.supernova,color:'#0C0C18',padding:'1px 5px',borderRadius:8}}>{activeRisk}</span>}
              {n.id==='pastperf'&&linkedPerfs>0&&<span style={{fontSize:9,background:'#B066FF',color:'#fff',padding:'1px 5px',borderRadius:8}}>{linkedPerfs}</span>}
              {n.id==='documents'&&oppDocs>0&&<span style={{fontSize:9,background:B.sky,color:'#0C0C18',padding:'1px 5px',borderRadius:8}}>{oppDocs}</span>}
            </button>;
          })}
          <div style={{padding:'6px 8px'}}>
            <button onClick={()=>setConfirmDel(opp.id)} style={{...S.btn('transparent'),border:`1px solid ${B.twilight}33`,color:B.twilight,fontSize:10,width:'100%',padding:'6px'}}>🗑 Delete Opportunity</button>
          </div>
        </>}
      </div>
      <div style={{padding:'10px 14px',borderTop:`1px solid ${B.border}`,flexShrink:0}}>
        <div style={{fontSize:9,color:'#22224A',lineHeight:1.7}}>Astrion EDGE™ · v5.1 · Auto-saved<br/>{opps.length} opp{opps.length!==1?'s':''} · {pastPerfs.length} perfs · {proofPoints.length} proofs · {globalCompetitors.length} competitors</div>
      </div>
    </div>

    {/* ── MAIN CONTENT ── */}
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Portfolio */}
      {view==='portfolio'&&!opp&&<Portfolio opps={opps} onSelect={openOpp} onNew={()=>setShowNew(true)} onExport={exportAll} onImport={importAll} pastPerfs={pastPerfs} proofPoints={proofPoints} globalCompetitors={globalCompetitors} toast={toast}/>}

      {/* Opp view */}
      {opp&&view==='opp'&&<>
        <div style={{background:B.cardBg,borderBottom:`1px solid ${B.border}`,padding:'10px 22px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <button onClick={()=>{setActiveOppId(null);setView('portfolio');}} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,fontSize:10,padding:'3px 9px',marginBottom:5,color:B.silver,cursor:'pointer'}}>← Portfolio</button>
            <div style={{fontSize:15,fontWeight:700,color:'#F0F0FF'}}>{OPP_NAV.find(n=>n.id===activeModule)?.label}</div>
            <div style={{fontSize:10,color:B.silver,marginTop:1}}>{opp.name||'Untitled'}{opp.govwin?` · #${opp.govwin}`:''}</div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{display:'flex',gap:6}}>
              {opp.gates.filter(g=>['A','B','C'].includes(g.id)).map(g=><div key={g.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:gateColor(g.status)+(g.status==='Complete'?'':'20'),border:`2px solid ${gateColor(g.status)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:g.status==='Complete'?'#0C0C18':gateColor(g.status)}}>{g.status==='Complete'?'✓':g.id}</div>
                <div style={{fontSize:7,color:B.silver}}>Gate {g.id}</div>
              </div>)}
            </div>
            <div style={{width:1,height:32,background:B.border}}/>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:9,color:B.silver}}>P-Win</div>
              <div className="mono" style={{fontSize:16,fontWeight:700,color:opp.pWinScore>=60?B.refraction:opp.pWinScore>=40?B.supernova:B.twilight}}>{opp.pWinScore}%</div>
            </div>
            {opp.tcv&&<div style={{textAlign:'right',borderLeft:`1px solid ${B.border}`,paddingLeft:10}}>
              <div style={{fontSize:9,color:B.silver}}>TCV</div>
              <div className="mono" style={{fontSize:14,fontWeight:700,color:B.sky}}>{fmtTCVDisplay(opp.tcv)}</div>
            </div>}
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>{OPP_MODS[activeModule]}</div>
      </>}

      {/* Global library views */}
      {['pastperfs','proofpoints','docgen','competitors','blackhats'].map(gv=>view===gv&&!opp&&<div key={gv} style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',animation:'fadeIn .2s ease'}}>
        <div style={{background:B.cardBg,borderBottom:`1px solid ${B.border}`,padding:'12px 22px',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#F0F0FF'}}>
            {gv==='pastperfs'?'🏆 Past Performance Library':gv==='proofpoints'?'💡 Proof Points Library':gv==='docgen'?'📄 Document Generator':gv==='competitors'?'⚔ Competitor Intelligence Library':'🎯 Black Hat Session Center'}
          </div>
          <div style={{fontSize:10,color:B.silver,marginTop:2}}>
            {gv==='pastperfs'?`${pastPerfs.length} record${pastPerfs.length!==1?'s':''} · Track, manage, and generate proposal narratives`:
             gv==='proofpoints'?`${proofPoints.length} proof point${proofPoints.length!==1?'s':''} · Reusable across RFIs, proposals, white papers, capability statements, and more`:
             gv==='docgen'?'Generate proposal documents using proof points and past performances':
             gv==='competitors'?`${globalCompetitors.length} competitor profile${globalCompetitors.length!==1?'s':''} · ${blackHatSessions.length} black hat session${blackHatSessions.length!==1?'s':''} · Intel accumulates across all opportunities`:
             `${blackHatSessions.length} session${blackHatSessions.length!==1?'s':''} · Upload decks, record findings, sync intel to competitor profiles`}
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden'}}>{GLOBAL_MODS[gv]}</div>
      </div>)}
      {/* Analytics & Search have their own full-height layouts */}
      {view==='analytics'&&!opp&&<div style={{flex:1,overflow:'hidden',animation:'fadeIn .2s ease'}}>{GLOBAL_MODS.analytics}</div>}
      {view==='search'&&!opp&&<div style={{flex:1,overflow:'hidden',animation:'fadeIn .2s ease'}}>{GLOBAL_MODS.search}</div>}
    </div>
  </div>;
}

export default App;
