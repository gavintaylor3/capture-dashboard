import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { jsPDF as jsPDFLib } from "jspdf";
import PWinerator from "./components/PWinerator";
import { B, S, ta } from "./config/theme";
import { stageColor, threatColor, priorityC, gateColor, influenceC, cparsColor, tagColor,
         fmtBytes, parseTCVNum, fmtTCVDisplay, fileIcon, fileIsImage } from "./lib/format";
import { STAGES, COMP_SIZES, CONTRACT_TYPES, CPARS, DOC_TYPES, PP_CATEGORIES,
         OPP_DOC_CATEGORIES, makeGates, blankOpp } from "./config/methodology";
import { callClaude } from "./lib/ai";
import { PROMPTS } from "./config/prompts";
import { KEYS, exportFilePrefix } from "./config/keys";
import { exportToPDF, exportToDoc } from "./lib/export";
import { badge, TCVInput, TagEditor, useToast, ConfirmModal, FileList, PWinGauge,
         HealthBar, Avatar, PWinSlider, ProofPointPicker, PastPerfPicker } from "./components/ui";
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
function OppDashboard({opp,pastPerfs,onNav}){
  const today=new Date();
  const rfpMs=opp.rfpDate?new Date(opp.rfpDate+'-01')-today:null;
  const rfpD=rfpMs!=null?Math.ceil(rfpMs/864e5):null;
  const done=opp.gates.filter(g=>g.status==='Complete').length;
  const linked=pastPerfs.filter(p=>(opp.linkedPastPerfIds||[]).includes(p.id));
  const openActs=opp.actions.filter(a=>a.status!=='Complete').length;
  const activeRisks=opp.risks.filter(r=>r.status==='Active').length;
  const teamColors=[B.force,B.sky,'#B066FF',B.refraction,B.supernova,B.twilight,'#66CCFF','#FF88AA','#88FFCC'];
  const teamEntries=[
    {k:'bd',l:'BD Executive'},{k:'cm',l:'Capture Mgr'},{k:'jcm',l:'Jr. Capture Mgr'},
    {k:'sa',l:'Solutions Arch'},{k:'pm',l:'Proposal Mgr'},{k:'pricing',l:'Pricing Lead'},
    {k:'contracts',l:'Contracts'},{k:'ops',l:'Operations'},{k:'gm',l:'Division GM'},
  ].filter(e=>opp.team[e.k]);

  return <div style={{animation:'fadeIn .2s ease'}}>
    {/* Hero row */}
    <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:14,marginBottom:14}}>
      <div style={{...S.card,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'20px 24px',gap:10,background:`linear-gradient(135deg,#14142A,#1A1432)`}}>
        <PWinGauge value={opp.pWinScore}/>
        <div style={{textAlign:'center'}}>
          {badge(opp.stage,stageColor(opp.stage))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[
          {l:'Total Contract Value',v:fmtTCVDisplay(opp.tcv)||'TBD',c:B.sky,mono:true,big:true},
          {l:'Days to RFP',v:rfpD!=null?rfpD>0?rfpD+'d':'PAST':'TBD',c:rfpD!=null&&rfpD<60?B.twilight:rfpD!=null&&rfpD<120?B.supernova:B.sky,mono:true,big:true},
          {l:'Gates Complete',v:`${done}/${opp.gates.length}`,c:B.refraction,mono:true,big:true},
          {l:'Open Actions',v:openActs,c:openActs>5?B.twilight:openActs>2?B.supernova:B.refraction,mono:true},
          {l:'Active Risks',v:activeRisks,c:activeRisks>0?B.twilight:B.refraction,mono:true},
          {l:'Past Perfs Linked',v:linked.length,c:'#B066FF',mono:true},
        ].map(({l,v,c,mono,big},i)=><div key={i} style={{...S.card,marginBottom:0,display:'flex',flexDirection:'column',justifyContent:'center',cursor:i>=3?'pointer':undefined,transition:'all .15s'}}
          onMouseEnter={i>=3?e=>{e.currentTarget.style.borderColor=c;}:undefined}
          onMouseLeave={i>=3?e=>{e.currentTarget.style.borderColor=B.border;}:undefined}
          onClick={i===3?()=>onNav('actions'):i===4?()=>onNav('risks'):i===5?()=>onNav('pastperf'):undefined}>
          <div style={S.lbl}>{l}</div>
          <div className={mono?'mono':''} style={{fontSize:big?28:22,fontWeight:700,color:c,lineHeight:1}}>{v}</div>
        </div>)}
      </div>
    </div>

    {/* Gate timeline */}
    <div style={{...S.card,marginBottom:14}}>
      <div style={S.hdg}>Gate Timeline</div>
      <div style={{position:'relative',paddingTop:4,paddingBottom:8,overflowX:'auto'}}>
        <div style={{position:'absolute',top:21,left:'3%',right:'3%',height:2,background:B.border,zIndex:0}}/>
        <div style={{display:'flex',minWidth:600,position:'relative',zIndex:1}}>
          {opp.gates.map(g=>{
            const c=gateColor(g.status);
            const isDone=g.status==='Complete';
            const isActive=g.status==='In Progress'||g.status==='Upcoming';
            return <div key={g.id} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <div style={{width:26,height:26,borderRadius:'50%',background:isDone?c:B.darkBg,border:`2px solid ${c}`,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:isActive?`0 0 12px ${c}88`:'none',animation:isActive?'pulse 2s ease infinite':undefined}}>
                {isDone&&<span style={{color:'#0C0C18',fontSize:10,fontWeight:900}}>✓</span>}
                {isActive&&<span style={{width:8,height:8,borderRadius:'50%',background:c,display:'block'}}/>}
              </div>
              <div style={{fontSize:9,fontWeight:700,color:c,textAlign:'center',lineHeight:1.2}}>{g.label}</div>
              {g.date&&<div style={{fontSize:8,color:B.silver,textAlign:'center'}}>{g.date.slice(0,7)}</div>}
            </div>;
          })}
        </div>
      </div>
    </div>

    {/* Capture health + Team */}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
      <div style={S.card}>
        <div style={S.hdg}>Capture Health</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <HealthBar label="Customer Intelligence" value={opp.customers.length} max={5}/>
          <HealthBar label="Competitive Intel" value={opp.competitors.length} max={4}/>
          <HealthBar label="Teaming Partners" value={opp.partners.filter(p=>p.status==='Y').length} max={4}/>
          <HealthBar label="Solution Elements" value={opp.solutioning.length} max={5}/>
          <HealthBar label="Win Themes" value={opp.winThemes.length} max={5}/>
          <HealthBar label="Past Performances" value={linked.length} max={5} color='#B066FF'/>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.hdg}>Capture Team</div>
        {teamEntries.length===0
          ?<div style={{color:B.silver,fontSize:12,padding:'12px 0'}}>No team members assigned yet.</div>
          :<div style={{display:'flex',flexDirection:'column'}}>
            {teamEntries.map(({k,l},i)=>opp.team[k]?<Avatar key={k} name={opp.team[k]} role={l} color={teamColors[i%teamColors.length]}/>:null)}
          </div>}
        {!teamEntries.length&&<button style={{...S.btn(B.force),padding:'6px 14px',fontSize:11,marginTop:8}} onClick={()=>onNav('setup')}>Assign Team →</button>}
      </div>
    </div>

    {/* Recent files + Linked perfs */}
    {((opp.oppFiles||[]).length>0||linked.length>0)&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {(opp.oppFiles||[]).length>0&&<div style={S.card}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={S.hdg}>Recent Documents</div>
          <button onClick={()=>onNav('documents')} style={{...S.btn('transparent'),border:'none',color:B.sky,fontSize:11,padding:'2px 6px'}}>View all →</button>
        </div>
        {[...(opp.oppFiles||[])].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).slice(0,4).map(f=><div key={f.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${B.border}`}}>
          <span style={{fontSize:14}}>{fileIcon(f.type)}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
            <div style={{fontSize:9,color:B.silver}}>{f.category}</div>
          </div>
        </div>)}
      </div>}
      {linked.length>0&&<div style={S.card}>
        <div style={S.hdg}>Linked Past Performances</div>
        {linked.slice(0,4).map(pp=><div key={pp.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:`1px solid ${B.border}`}}>
          <span style={{fontSize:13}}>🏆</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pp.name}</div>
            <div style={{fontSize:9,color:B.silver}}>{pp.agency} · {pp.value}</div>
          </div>
          {pp.cparRating&&badge(pp.cparRating,cparsColor(pp.cparRating),true)}
        </div>)}
      </div>}
    </div>}
  </div>;
}

/* ═══════════════════ OPP SETUP ═══════════════════ */
function OppSetup({opp,onChange}){
  const upd=(f,v)=>onChange({...opp,[f]:v});
  const updT=(f,v)=>onChange({...opp,team:{...opp.team,[f]:v}});
  return <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
    <div>
      <div style={S.card}>
        <div style={S.hdg}>Opportunity Overview</div>
        {[{k:'name',l:'Opportunity Name'},{k:'govwin',l:'GovWin / SAM.gov ID'},{k:'naics',l:'NAICS Code'},{k:'agency',l:'Agency / Command'},{k:'incumbent',l:'Incumbent'}].map(({k,l})=>(
          <div key={k} style={{marginBottom:10}}><span style={S.lbl}>{l}</span><input style={S.inp} value={opp[k]||''} onChange={e=>upd(k,e.target.value)}/></div>
        ))}
        <div style={{marginBottom:10}}><span style={S.lbl}>Total Contract Value</span><TCVInput value={opp.tcv} onChange={v=>upd('tcv',v)}/></div>
        {[{k:'rfpDate',l:'RFP Date'},{k:'awardDate',l:'Award Date'},{k:'startDate',l:'PoP Start'}].map(({k,l})=>(
          <div key={k} style={{marginBottom:10}}><span style={S.lbl}>{l}</span><input style={S.inp} type="month" value={opp[k]||''} onChange={e=>upd(k,e.target.value)}/></div>
        ))}
        <div style={{marginBottom:10}}><span style={S.lbl}>Stage</span><select style={S.inp} value={opp.stage} onChange={e=>upd('stage',e.target.value)}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
        <PWinSlider value={opp.pWinScore} onChange={v=>upd('pWinScore',v)}/>
      </div>
      <div style={S.card}><div style={S.hdg}>Description</div><textarea style={ta} rows={4} value={opp.description||''} onChange={e=>upd('description',e.target.value)} placeholder="Scope, vehicle, customer mission…"/></div>
      <div style={S.card}><div style={S.hdg}>Tags</div><TagEditor tags={opp.tags||[]} onChange={v=>upd('tags',v)}/></div>
    </div>
    <div>
      <div style={S.card}>
        <div style={S.hdg}>Capture Team</div>
        {[
          {k:'bd',l:'BD Executive'},{k:'cm',l:'Capture Manager'},{k:'jcm',l:'Jr. Capture Manager'},
          {k:'sa',l:'Solutions Architect'},{k:'pm',l:'Proposal Manager'},
          {k:'pricing',l:'Pricing Lead'},{k:'contracts',l:'Contracts'},
          {k:'ops',l:'Operations Lead'},{k:'gm',l:'Division GM'},
        ].map(({k,l})=>(
          <div key={k} style={{marginBottom:9}}><span style={S.lbl}>{l}</span><input style={S.inp} value={opp.team[k]||''} onChange={e=>updT(k,e.target.value)} placeholder={l}/></div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.hdg}>Gate Status</div>
        {opp.gates.map((g,i)=>(
          <div key={g.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:7}}>
            <div style={{width:9,height:9,borderRadius:'50%',background:gateColor(g.status),flexShrink:0}}/>
            <span style={{fontSize:11,color:'#E8E8F0',flex:1}}>{g.label}</span>
            <input style={{...S.inp,width:130,padding:'3px 7px',fontSize:11}} type="date" value={g.date||''} onChange={e=>onChange({...opp,gates:opp.gates.map((gg,ii)=>ii===i?{...gg,date:e.target.value}:gg)})}/>
            <select style={{...S.inp,width:'auto',padding:'3px 7px',fontSize:11}} value={g.status} onChange={e=>onChange({...opp,gates:opp.gates.map((gg,ii)=>ii===i?{...gg,status:e.target.value}:gg)})}>
              {['Pending','Upcoming','In Progress','Complete'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  </div>;
}

/* ═══════════════════ OPP DOCUMENTS ═══════════════════ */
function OppDocuments({opp,onChange,toast}){
  const [drag,setDrag]=useState(false);
  const [filterCat,setFilterCat]=useState('All');
  const [search,setSearch]=useState('');
  const [preview,setPreview]=useState(null);
  const [editNote,setEditNote]=useState(null);
  const ref=useRef();
  const MAX=10*1024*1024;
  const ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg';

  const files=opp.oppFiles||[];
  const filtered=files.filter(f=>{
    const catOk=filterCat==='All'||f.category===filterCat;
    const qOk=!search||(f.name+f.category+(f.notes||'')).toLowerCase().includes(search.toLowerCase());
    return catOk&&qOk;
  });
  const totalSize=files.reduce((a,f)=>a+f.size,0);
  const usedCats=[...new Set(files.map(f=>f.category))];

  const process=rawFiles=>Array.from(rawFiles).forEach(file=>{
    if(file.size>MAX){toast(`${file.name} exceeds 10MB`,'warn');return;}
    const r=new FileReader();
    r.onload=e=>{
      const nf={id:Date.now()+Math.random(),name:file.name,type:file.type,size:file.size,data:e.target.result,uploadedAt:new Date().toISOString(),category:'Other',notes:''};
      onChange({...opp,oppFiles:[...(opp.oppFiles||[]),nf]});
      toast(`${file.name} uploaded`);
    };
    r.readAsDataURL(file);
  });
  const onDrop=e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files);};
  const updFile=(id,field,val)=>onChange({...opp,oppFiles:files.map(f=>f.id===id?{...f,[field]:val}:f)});
  const delFile=id=>{onChange({...opp,oppFiles:files.filter(f=>f.id!==id)});toast('File removed');};
  const dl=f=>{const a=document.createElement('a');a.href=f.data;a.download=f.name;a.click();};

  return <div>
    {preview&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={()=>setPreview(null)}>
      <img src={preview.data} alt={preview.name} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:10,boxShadow:'0 24px 80px rgba(0,0,0,.9)'}}/>
    </div>}

    {/* Stats bar */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
      {[{l:'Total Files',v:files.length,c:B.sky},{l:'Total Size',v:fmtBytes(totalSize),c:B.silver},{l:'Categories',v:usedCats.length,c:B.supernova},{l:'Latest Upload',v:files.length?new Date(Math.max(...files.map(f=>new Date(f.uploadedAt)))).toLocaleDateString():'—',c:B.refraction}]
        .map(({l,v,c})=><div key={l} style={S.card}><div style={S.lbl}>{l}</div><div className="mono" style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>)}
    </div>

    {/* Upload zone */}
    <div className={`drop-zone${drag?' drag':''}`} style={{marginBottom:14}} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>ref.current.click()}>
      <input ref={ref} type="file" multiple accept={ACCEPT} style={{display:'none'}} onChange={e=>process(e.target.files)}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
        <span style={{fontSize:28}}>📁</span>
        <div style={{textAlign:'left'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#E0E0F0'}}>Drop documents here or click to upload</div>
          <div style={{fontSize:11,color:B.silver,marginTop:2}}>PDF · DOCX · XLSX · PPTX · PNG/JPG · TXT · CSV — max 10 MB per file</div>
        </div>
      </div>
    </div>

    {/* Filters */}
    {files.length>0&&<div style={{display:'flex',gap:10,marginBottom:12,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{position:'relative',flex:'0 0 220px'}}>
        <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',fontSize:12,color:B.silver,pointerEvents:'none'}}>🔍</span>
        <input style={{...S.inp,paddingLeft:28,fontSize:12}} placeholder="Search files…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:B.silver,cursor:'pointer',fontSize:12}}>✕</button>}
      </div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
        {['All',...OPP_DOC_CATEGORIES].filter(c=>c==='All'||usedCats.includes(c)).map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{padding:'4px 11px',borderRadius:20,border:`1px solid ${filterCat===c?B.sky:B.border}`,background:filterCat===c?B.sky+'22':'transparent',color:filterCat===c?B.sky:B.silver,fontSize:10,fontWeight:600,cursor:'pointer'}}>{c}</button>)}
      </div>
    </div>}

    {/* File list */}
    {filtered.length===0&&files.length>0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:28,fontSize:12}}>No files match your search.</div>}
    {files.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:40,fontSize:13}}>
      <div style={{fontSize:32,marginBottom:10}}>📂</div>
      <div style={{fontWeight:600,marginBottom:6,color:'#C0C0E0'}}>Document Vault is empty</div>
      <div style={{fontSize:12}}>Upload RFP documents, past performance files, market research, and more.</div>
    </div>}
    {filtered.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6}}>
      {filtered.map(f=><div key={f.id} style={{...S.card,marginBottom:0,display:'flex',gap:12,alignItems:'flex-start',padding:'12px 16px'}}>
        <div style={{width:40,height:40,borderRadius:8,background:B.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{fileIcon(f.type)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#E8E8F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:320}}>{f.name}</div>
            <select style={{...S.inp,width:'auto',padding:'2px 7px',fontSize:10,flexShrink:0}} value={f.category} onChange={e=>updFile(f.id,'category',e.target.value)}>
              {OPP_DOC_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',fontSize:10,color:B.silver}}>
            <span className="mono">{fmtBytes(f.size)}</span>
            <span>·</span>
            <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
          </div>
          {editNote===f.id
            ?<input style={{...S.inp,fontSize:11,marginTop:6}} value={f.notes||''} onChange={e=>updFile(f.id,'notes',e.target.value)} onBlur={()=>setEditNote(null)} autoFocus placeholder="Add note…"/>
            :<div style={{fontSize:11,color:B.silver,marginTop:4,cursor:'pointer'}} onClick={()=>setEditNote(f.id)}>{f.notes||<span style={{color:B.border}}>+ Add note</span>}</div>
          }
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          {fileIsImage(f.type)&&<button onClick={()=>setPreview(f)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.sky,fontSize:11,padding:'4px 10px'}}>👁</button>}
          <button onClick={()=>dl(f)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}}>↓</button>
          <button onClick={()=>delFile(f.id)} style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'4px 10px'}}>✕</button>
        </div>
      </div>)}
    </div>}
  </div>;
}

/* ═══════════════════ COMPETITOR PICKER ═══════════════════ */

/* ═══════════════════ GLOBAL COMPETITOR LIBRARY ═══════════════════ */
function CompetitorLibrary({globalCompetitors,setGlobalCompetitors,blackHatSessions,opps,fileStore,addFiles,removeFile,toast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState('');
  const [confirmDel,setConfirmDel]=useState(null);
  const blank=()=>({id:Date.now(),name:'',size:'Large Business',naics:[],agencies:[],overview:'',strengths:'',weaknesses:'',discriminators:'',typicalPartners:'',recentWins:0,notes:'',fileIds:[],tags:[],createdAt:new Date().toISOString()});
  const add=()=>{const c=blank();setGlobalCompetitors(x=>[...x,c]);setSel(c.id);};
  const upd=(id,f,v)=>setGlobalCompetitors(x=>x.map(c=>c.id===id?{...c,[f]:v}:c));
  const del=id=>{setGlobalCompetitors(x=>x.filter(c=>c.id!==id));if(sel===id)setSel(null);setConfirmDel(null);toast('Competitor deleted');};
  const filtered=globalCompetitors.filter(c=>!q||(c.name+c.agencies?.join('')).toLowerCase().includes(q.toLowerCase()));
  const cur=globalCompetitors.find(c=>c.id===sel);
  // Gather all black hat sessions that reference this competitor
  const bhSessions=cur?blackHatSessions.filter(s=>s.entries?.some(e=>e.globalCompId===cur.id)):[];
  // Gather all opps where this competitor appears
  const oppsMentioned=cur?opps.filter(o=>o.competitors?.some(c=>c.globalCompId===cur.id)):[];
  return <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
    {confirmDel&&<ConfirmModal message={`Delete "${globalCompetitors.find(c=>c.id===confirmDel)?.name||'this competitor'}"? This will not remove them from existing opportunities.`} onConfirm={()=>del(confirmDel)} onCancel={()=>setConfirmDel(null)}/>}
    <div style={{width:280,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${B.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Competitor Profiles</div>
          <button style={{...S.btn(B.twilight),padding:'5px 12px',fontSize:11}} onClick={add}>+ Add</button>
        </div>
        <div style={{position:'relative'}}>
          <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:12,color:B.silver}}>🔍</span>
          <input style={{...S.inp,fontSize:11,paddingLeft:26}} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {filtered.length===0&&<div style={{textAlign:'center',color:B.silver,fontSize:12,padding:24}}>No competitors yet.</div>}
        {filtered.map(c=>{
          const sessions=blackHatSessions.filter(s=>s.entries?.some(e=>e.globalCompId===c.id)).length;
          return <div key={c.id} onClick={()=>setSel(c.id)} className="card-hover"
            style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,border:`1px solid ${sel===c.id?B.twilight:B.border}`,background:sel===c.id?B.twilight+'15':'transparent',transition:'all .12s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4,marginBottom:3}}>
              <div style={{fontSize:12,fontWeight:700,color:'#E8E8F0',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name||'Unnamed'}</div>
              {sessions>0&&badge(sessions+'× BH',B.twilight,true)}
            </div>
            <div style={{fontSize:10,color:B.silver}}>{c.size||'—'}</div>
            {c.agencies?.length>0&&<div style={{fontSize:10,color:B.sky,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.agencies.slice(0,3).join(' · ')}</div>}
          </div>;
        })}
      </div>
      <div style={{padding:'10px 12px',borderTop:`1px solid ${B.border}`,fontSize:10,color:B.silver}}>{globalCompetitors.length} competitor{globalCompetitors.length!==1?'s':''} · {blackHatSessions.length} black hat session{blackHatSessions.length!==1?'s':''}</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
      {!cur&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16}}>
        <div style={{fontSize:42}}>⚔</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#D0D0F0',marginBottom:6}}>Competitor Intelligence Library</div>
          <div style={{fontSize:12,color:B.silver,marginBottom:18,lineHeight:1.7,maxWidth:440}}>Build persistent competitor profiles that accumulate intelligence across all opportunities and black hat sessions. Reuse and grow your competitive knowledge over time.</div>
          <button style={{...S.btn(B.twilight),padding:'9px 22px'}} onClick={add}>+ Add First Competitor</button>
        </div>
      </div>}
      {cur&&<div style={{animation:'fadeIn .2s ease'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <input style={{...S.inp,fontSize:18,fontWeight:800,background:'transparent',border:'none',padding:'0 0 4px',color:'#F0F0FF',width:'100%',maxWidth:480}} value={cur.name} onChange={e=>upd(cur.id,'name',e.target.value)} placeholder="Competitor Name"/>
          <div style={{display:'flex',gap:8,flexShrink:0,marginLeft:12}}>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'5px 10px'}} onClick={()=>setConfirmDel(cur.id)}>🗑</button>
          </div>
        </div>
        {/* Stats row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Black Hat Appearances',v:bhSessions.length,c:B.twilight},{l:'Opps Tracked',v:oppsMentioned.length,c:B.sky},{l:'Recent Wins',v:cur.recentWins||0,c:B.supernova}].map(({l,v,c})=>(
            <div key={l} style={{...S.card,marginBottom:0,textAlign:'center'}}><div className="mono" style={{fontSize:22,fontWeight:700,color:c}}>{v}</div><div style={S.lbl}>{l}</div></div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div style={S.card}>
            <div style={S.hdg}>Profile</div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Business Size</span>
              <select style={S.inp} value={cur.size||'Large Business'} onChange={e=>upd(cur.id,'size',e.target.value)}>{COMP_SIZES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Typical Agencies (comma-separated)</span>
              <input style={S.inp} value={(cur.agencies||[]).join(', ')} onChange={e=>upd(cur.id,'agencies',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="DISA, Army, USAF…"/></div>
            <div style={{marginBottom:10}}><span style={S.lbl}>NAICS Codes</span>
              <input style={S.inp} value={(cur.naics||[]).join(', ')} onChange={e=>upd(cur.id,'naics',e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} placeholder="541512, 541330…"/></div>
            <div><span style={S.lbl}>Recent Wins (count)</span>
              <input style={S.inp} type="number" min={0} value={cur.recentWins||0} onChange={e=>upd(cur.id,'recentWins',+e.target.value)}/></div>
          </div>
          <div style={S.card}>
            <div style={S.hdg}>Intel Summary</div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Company Overview</span><textarea style={{...ta,minHeight:60}} value={cur.overview||''} onChange={e=>upd(cur.id,'overview',e.target.value)} placeholder="Background, revenue, key programs…"/></div>
            <div><span style={S.lbl}>Typical Partners</span><input style={S.inp} value={cur.typicalPartners||''} onChange={e=>upd(cur.id,'typicalPartners',e.target.value)} placeholder="Known teaming relationships…"/></div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div style={S.card}>
            <div style={S.hdg}>Recurring Strengths</div>
            <textarea style={ta} value={cur.strengths||''} onChange={e=>upd(cur.id,'strengths',e.target.value)} placeholder="Accumulated strengths observed across opportunities…"/>
          </div>
          <div style={S.card}>
            <div style={S.hdg}>Recurring Weaknesses</div>
            <textarea style={ta} value={cur.weaknesses||''} onChange={e=>upd(cur.id,'weaknesses',e.target.value)} placeholder="Recurring vulnerabilities…"/>
          </div>
        </div>
        <div style={{...S.card,marginBottom:12}}>
          <div style={S.hdg}>Ghosting Discriminators</div>
          <textarea style={{...ta,minHeight:72}} value={cur.discriminators||''} onChange={e=>upd(cur.id,'discriminators',e.target.value)} placeholder="Proven ghosting angles and counter-strategies that have worked against this competitor…"/>
        </div>
        {/* Black Hat history */}
        {bhSessions.length>0&&<div style={{...S.card,marginBottom:12,border:`1px solid ${B.twilight}33`}}>
          <div style={S.hdg}>Black Hat Session History</div>
          {bhSessions.map(s=>{const entry=s.entries?.find(e=>e.globalCompId===cur.id);return <div key={s.id} style={{padding:'10px 12px',borderRadius:8,background:'#181830',marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#E0E0F0'}}>{s.title||'Untitled Session'}</div>
                <div style={{fontSize:10,color:B.silver}}>{s.date||'—'} · {s.agency||'—'} · {badge(entry?.threat||'Unknown',threatColor(entry?.threat||'Medium'),true)}</div>
              </div>
              {entry?.role&&badge(entry.role,B.sky,true)}
            </div>
            {entry?.strengths&&<div style={{fontSize:11,color:'#C0C0E0',marginBottom:4}}><span style={{color:B.twilight,fontWeight:700}}>↑ Strengths: </span>{entry.strengths}</div>}
            {entry?.weaknesses&&<div style={{fontSize:11,color:'#C0C0E0',marginBottom:4}}><span style={{color:B.refraction,fontWeight:700}}>↓ Weaknesses: </span>{entry.weaknesses}</div>}
            {entry?.ghosting?.filter(g=>g.them||g.us).length>0&&<div style={{marginTop:6}}>
              <div style={{...S.lbl,fontSize:9}}>Ghosting Angles</div>
              {entry.ghosting.filter(g=>g.them||g.us).map((g,i)=><div key={i} style={{fontSize:11,color:B.silver,padding:'2px 0'}}>• {g.them} → <span style={{color:B.sky}}>{g.us}</span></div>)}
            </div>}
          </div>;})}
        </div>}
        {/* Linked opps */}
        {oppsMentioned.length>0&&<div style={{...S.card,marginBottom:12}}>
          <div style={S.hdg}>Tracked Across Opportunities ({oppsMentioned.length})</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {oppsMentioned.map(o=><div key={o.id} style={{padding:'4px 10px',borderRadius:6,background:'#1E1E38',border:`1px solid ${B.border}`,fontSize:11,color:'#D0D0E0'}}>{o.name||'Untitled'} {badge(o.stage,stageColor(o.stage),true)}</div>)}
          </div>
        </div>}
        <div style={S.card}>
          <div style={S.hdg}>Tags</div>
          <div style={{marginBottom:12}}><TagEditor tags={cur.tags||[]} onChange={v=>upd(cur.id,'tags',v)}/></div>
          <div style={S.hdg}>Notes &amp; Attached Files</div>
          <textarea style={{...ta,marginBottom:10}} value={cur.notes||''} onChange={e=>upd(cur.id,'notes',e.target.value)} placeholder="Free-form notes, source links, contacts…"/>
          <FileList fileIds={cur.fileIds||[]} fileStore={fileStore} onAdd={f=>{addFiles(f);upd(cur.id,'fileIds',[...(cur.fileIds||[]),f.id]);}} onRemove={fid=>{removeFile(fid);upd(cur.id,'fileIds',(cur.fileIds||[]).filter(x=>x!==fid));}}/>
        </div>
      </div>}
    </div>
  </div>;
}

/* ═══════════════════ BLACK HAT CENTER ═══════════════════ */
function BlackHatCenter({blackHatSessions,setBlackHatSessions,globalCompetitors,setGlobalCompetitors,opps,setOpps,fileStore,addFiles,removeFile,toast}){
  const [sel,setSel]=useState(null);
  const [subTab,setSubTab]=useState('sessions'); // 'sessions' | 'detail'
  const [confirmDel,setConfirmDel]=useState(null);
  const blankSession=()=>({
    id:Date.now(),title:'',date:new Date().toISOString().slice(0,10),
    agency:'',contractType:'',oppId:'',
    facilitator:'',participants:'',
    entries:[],keyTakeaways:'',winProbNote:'',
    fileIds:[],createdAt:new Date().toISOString()
  });
  const blankEntry=gcId=>({
    id:Date.now()+Math.random(),globalCompId:gcId||'',
    role:'Prime',threat:'Medium',
    strengths:'',weaknesses:'',
    ghosting:[{them:'',us:''}],notes:''
  });
  const addSession=()=>{const s=blankSession();setBlackHatSessions(x=>[...x,s]);setSel(s.id);setSubTab('detail');};
  const updSession=(id,f,v)=>setBlackHatSessions(x=>x.map(s=>s.id===id?{...s,[f]:v}:s));
  const delSession=id=>{setBlackHatSessions(x=>x.filter(s=>s.id!==id));if(sel===id){setSel(null);setSubTab('sessions');}setConfirmDel(null);toast('Session deleted');};
  const cur=blackHatSessions.find(s=>s.id===sel);
  const updEntry=(sid,eid,f,v)=>setBlackHatSessions(x=>x.map(s=>s.id===sid?{...s,entries:s.entries.map(e=>e.id===eid?{...e,[f]:v}:e)}:s));
  const delEntry=(sid,eid)=>setBlackHatSessions(x=>x.map(s=>s.id===sid?{...s,entries:s.entries.filter(e=>e.id!==eid)}:s));
  const addEntry=sid=>{
    setBlackHatSessions(x=>x.map(s=>s.id===sid?{...s,entries:[...s.entries,blankEntry()]}:s));
  };
  // Propagate intel from session entry back to global competitor profile
  const propagateToGlobal=(gcId,entry)=>{
    if(!gcId)return;
    setGlobalCompetitors(prev=>prev.map(c=>{
      if(c.id!==gcId)return c;
      const newStr=entry.strengths?(c.strengths?c.strengths+'\n• '+entry.strengths:'• '+entry.strengths):c.strengths;
      const newWk=entry.weaknesses?(c.weaknesses?c.weaknesses+'\n• '+entry.weaknesses:'• '+entry.weaknesses):c.weaknesses;
      return {...c,strengths:newStr||c.strengths,weaknesses:newWk||c.weaknesses};
    }));
    toast('Intel pushed to competitor profile');
  };
  const syncOppCompetitors=sessionId=>{
    const s=blackHatSessions.find(x=>x.id===sessionId);
    if(!s||!s.oppId)return;
    const oid=+s.oppId;
    setOpps(prev=>prev.map(o=>{
      if(o.id!==oid)return o;
      const newComps=[...o.competitors||[]];
      s.entries.forEach(e=>{
        if(!e.globalCompId)return;
        const gc=globalCompetitors.find(c=>c.id===e.globalCompId);
        if(!gc)return;
        const existing=newComps.find(c=>c.globalCompId===e.globalCompId);
        if(!existing){
          newComps.push({id:Date.now()+Math.random(),name:gc.name,globalCompId:e.globalCompId,threat:e.threat,role:e.role,info:e.notes,teammates:'',strengths:e.strengths,weaknesses:e.weaknesses,ghosting:e.ghosting||[]});
        }
      });
      return {...o,blackHatSessionIds:[...(o.blackHatSessionIds||[]),sessionId],competitors:newComps};
    }));
    toast('Competitors synced to opportunity');
  };
  const opp=cur&&cur.oppId?opps.find(o=>o.id===+cur.oppId):null;
  return <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
    {confirmDel&&<ConfirmModal title="Delete Session" message={`Delete "${blackHatSessions.find(s=>s.id===confirmDel)?.title||'this session'}"?`} onConfirm={()=>delSession(confirmDel)} onCancel={()=>setConfirmDel(null)}/>}
    {/* Left panel */}
    <div style={{width:280,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${B.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
          <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Black Hat Sessions</div>
          <button style={{...S.btn(B.twilight),padding:'5px 12px',fontSize:11}} onClick={addSession}>+ New</button>
        </div>
        <div style={{fontSize:11,color:B.silver,lineHeight:1.5}}>Structured competitive analysis sessions. Intel auto-accumulates in competitor profiles.</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {blackHatSessions.length===0&&<div style={{textAlign:'center',color:B.silver,fontSize:12,padding:24}}>No sessions yet. Run your first black hat.</div>}
        {[...blackHatSessions].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(s=>{
          const compCount=s.entries?.length||0;
          const hasDecks=(s.fileIds||[]).length>0;
          return <div key={s.id} onClick={()=>{setSel(s.id);setSubTab('detail');}} className="card-hover"
            style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,border:`1px solid ${sel===s.id?B.twilight:B.border}`,background:sel===s.id?B.twilight+'15':'transparent',transition:'all .12s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4,marginBottom:2}}>
              <div style={{fontSize:12,fontWeight:700,color:'#E8E8F0',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.title||'Untitled Session'}</div>
              {hasDecks&&<span style={{fontSize:12}}>📎</span>}
            </div>
            <div style={{fontSize:10,color:B.silver,marginBottom:3}}>{s.date||'—'} · {s.agency||'No agency'}</div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {compCount>0&&badge(compCount+' competitors',B.twilight,true)}
              {s.oppId&&opps.find(o=>o.id===+s.oppId)&&badge(opps.find(o=>o.id===+s.oppId).name.slice(0,18),B.sky,true)}
            </div>
          </div>;
        })}
      </div>
      <div style={{padding:'10px 12px',borderTop:`1px solid ${B.border}`,fontSize:10,color:B.silver}}>{blackHatSessions.length} session{blackHatSessions.length!==1?'s':''} · {blackHatSessions.reduce((a,s)=>a+(s.entries?.length||0),0)} competitor entries</div>
    </div>
    {/* Right panel */}
    <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
      {!cur&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16}}>
        <div style={{fontSize:42}}>🎯</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#D0D0F0',marginBottom:6}}>Black Hat Session Center</div>
          <div style={{fontSize:12,color:B.silver,marginBottom:18,lineHeight:1.7,maxWidth:460}}>Document competitive analysis sessions with structured competitor assessments, ghosting strategies, and deck uploads. Intel automatically feeds back to global competitor profiles for reuse on future opportunities.</div>
          <button style={{...S.btn(B.twilight),padding:'9px 22px'}} onClick={addSession}>+ Run First Black Hat</button>
        </div>
      </div>}
      {cur&&<div style={{animation:'fadeIn .2s ease'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <input style={{...S.inp,fontSize:18,fontWeight:800,background:'transparent',border:'none',padding:'0 0 4px',color:'#F0F0FF',width:'100%',maxWidth:500}} value={cur.title} onChange={e=>updSession(cur.id,'title',e.target.value)} placeholder="Black Hat Session Title"/>
          <div style={{display:'flex',gap:8,flexShrink:0,marginLeft:12}}>
            {cur.oppId&&<button style={{...S.btn(B.sky),padding:'5px 12px',fontSize:11}} onClick={()=>syncOppCompetitors(cur.id)}>⇄ Sync to Opp</button>}
            <button style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'5px 10px'}} onClick={()=>setConfirmDel(cur.id)}>🗑</button>
          </div>
        </div>
        {/* Session metadata */}
        <div style={{...S.card,marginBottom:12}}>
          <div style={S.hdg}>Session Details</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:10}}>
            <div><span style={S.lbl}>Date</span><input style={S.inp} type="date" value={cur.date||''} onChange={e=>updSession(cur.id,'date',e.target.value)}/></div>
            <div><span style={S.lbl}>Agency / Customer</span><input style={S.inp} value={cur.agency||''} onChange={e=>updSession(cur.id,'agency',e.target.value)} placeholder="e.g. DISA, Army…"/></div>
            <div><span style={S.lbl}>Contract Type</span><select style={S.inp} value={cur.contractType||'IDIQ/TO'} onChange={e=>updSession(cur.id,'contractType',e.target.value)}>{CONTRACT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <div><span style={S.lbl}>Facilitator</span><input style={S.inp} value={cur.facilitator||''} onChange={e=>updSession(cur.id,'facilitator',e.target.value)}/></div>
            <div><span style={S.lbl}>Participants</span><input style={S.inp} value={cur.participants||''} onChange={e=>updSession(cur.id,'participants',e.target.value)} placeholder="Names or roles…"/></div>
            <div><span style={S.lbl}>Linked Opportunity</span>
              <select style={S.inp} value={cur.oppId||''} onChange={e=>updSession(cur.id,'oppId',e.target.value)}>
                <option value="">— None —</option>
                {opps.map(o=><option key={o.id} value={o.id}>{o.name||'Untitled'}</option>)}
              </select>
            </div>
          </div>
        </div>
        {/* Deck upload */}
        <div style={{...S.card,marginBottom:12,border:`1px solid ${B.supernova}33`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={S.hdg}>Black Hat Decks &amp; Supporting Files</div>
            {badge((cur.fileIds||[]).length+' file'+(cur.fileIds||[]).length!==1?'s':'',B.supernova,true)}
          </div>
          <FileList fileIds={cur.fileIds||[]} fileStore={fileStore}
            onAdd={f=>{addFiles(f);updSession(cur.id,'fileIds',[...(cur.fileIds||[]),f.id]);}}
            onRemove={fid=>{removeFile(fid);updSession(cur.id,'fileIds',(cur.fileIds||[]).filter(x=>x!==fid));}}/>
          <div style={{fontSize:11,color:B.silver,marginTop:8}}>Upload your black hat deck (PPTX, PDF), pre-work docs, or reference materials. Files are stored locally in your browser.</div>
        </div>
        {/* Competitor entries */}
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={S.hdg}>Competitor Assessments</div>
            <button style={S.btn(B.twilight)} onClick={()=>addEntry(cur.id)}>+ Add Competitor</button>
          </div>
          {cur.entries?.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:24,fontSize:12}}>No competitors assessed yet. Add competitors to record black hat findings.</div>}
          {cur.entries?.map((entry,ei)=>{
            const gc=globalCompetitors.find(c=>c.id===entry.globalCompId);
            return <div key={entry.id} style={{...S.card,borderLeft:`3px solid ${threatColor(entry.threat)}`,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,gap:10}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8,flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:200}}>
                      <span style={S.lbl}>Competitor</span>
                      <select style={S.inp} value={entry.globalCompId||''} onChange={e=>updEntry(cur.id,entry.id,'globalCompId',e.target.value?+e.target.value:e.target.value)}>
                        <option value="">— Select from library —</option>
                        {globalCompetitors.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {!gc&&<div style={{fontSize:10,color:B.supernova,marginTop:3}}>⚠ Select from library or add competitor first.</div>}
                    </div>
                    <div><span style={S.lbl}>Role</span>
                      <select style={{...S.inp,width:'auto'}} value={entry.role||'Prime'} onChange={e=>updEntry(cur.id,entry.id,'role',e.target.value)}>
                        <option>Prime</option><option>Sub</option><option>JV</option><option>Unknown</option>
                      </select>
                    </div>
                    <div><span style={S.lbl}>Threat</span>
                      <select style={{...S.inp,width:'auto'}} value={entry.threat||'Medium'} onChange={e=>updEntry(cur.id,entry.id,'threat',e.target.value)}>
                        <option>High</option><option>Medium</option><option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div><span style={S.lbl}>Strengths Observed</span><textarea style={{...ta,minHeight:56}} value={entry.strengths||''} onChange={e=>updEntry(cur.id,entry.id,'strengths',e.target.value)}/></div>
                    <div><span style={S.lbl}>Weaknesses Observed</span><textarea style={{...ta,minHeight:56}} value={entry.weaknesses||''} onChange={e=>updEntry(cur.id,entry.id,'weaknesses',e.target.value)}/></div>
                  </div>
                  <div style={{marginBottom:10}}><span style={S.lbl}>Notes</span><textarea style={{...ta,minHeight:44}} value={entry.notes||''} onChange={e=>updEntry(cur.id,entry.id,'notes',e.target.value)} placeholder="Pricing intel, teaming rumors, key personnel, agency relationships…"/></div>
                  {/* Ghosting table */}
                  <div style={S.hdg}>Ghosting Strategies</div>
                  <table style={{width:'100%',borderCollapse:'collapse',marginBottom:8}}>
                    <thead><tr><th style={{...S.thd,borderRadius:'6px 0 0 0',width:'48%'}}>Their Claim / Strength</th><th style={{...S.thd,borderRadius:'0 6px 0 0'}}>Our Counter / Ghost</th></tr></thead>
                    <tbody>
                      {(entry.ghosting||[{them:'',us:''}]).map((g,gi)=><tr key={gi} style={{background:gi%2===0?'#1E1E38':'#18183A'}}>
                        <td style={{...S.tdc,padding:'6px 8px'}}><textarea style={{...ta,minHeight:40,fontSize:11}} value={g.them||''} onChange={e=>updEntry(cur.id,entry.id,'ghosting',(entry.ghosting||[]).map((gg,i)=>i===gi?{...gg,them:e.target.value}:gg))}/></td>
                        <td style={{...S.tdc,padding:'6px 8px'}}><textarea style={{...ta,minHeight:40,fontSize:11}} value={g.us||''} onChange={e=>updEntry(cur.id,entry.id,'ghosting',(entry.ghosting||[]).map((gg,i)=>i===gi?{...gg,us:e.target.value}:gg))}/></td>
                      </tr>)}
                      <tr><td colSpan={2} style={{...S.tdc,textAlign:'center'}}><button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.sky,fontSize:11}} onClick={()=>updEntry(cur.id,entry.id,'ghosting',[...(entry.ghosting||[]),{them:'',us:''}])}>+ Row</button></td></tr>
                    </tbody>
                  </table>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,flexShrink:0}}>
                  {entry.globalCompId&&<button style={{...S.btn(B.twilight),padding:'4px 10px',fontSize:10}} onClick={()=>propagateToGlobal(entry.globalCompId,entry)}>↑ Push to Profile</button>}
                  <button style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:10,padding:'4px 10px'}} onClick={()=>delEntry(cur.id,entry.id)}>✕ Remove</button>
                </div>
              </div>
            </div>;
          })}
        </div>
        {/* Key takeaways */}
        <div style={S.card}>
          <div style={S.hdg}>Session Conclusions</div>
          <div style={{marginBottom:10}}><span style={S.lbl}>Key Takeaways</span><textarea style={{...ta,minHeight:80}} value={cur.keyTakeaways||''} onChange={e=>updSession(cur.id,'keyTakeaways',e.target.value)} placeholder="Overall conclusions, differentiators identified, strategic shifts required…"/></div>
          <div><span style={S.lbl}>P-Win / Probability Note</span><textarea style={ta} value={cur.winProbNote||''} onChange={e=>updSession(cur.id,'winProbNote',e.target.value)} placeholder="Assessment of our competitive position after this analysis…"/></div>
        </div>
      </div>}
    </div>
  </div>;
}

/* ═══════════════════ COMPETITIVE INTEL (per-opp, enhanced) ═══════════════════ */
function CompetitiveIntel({opp,onChange,globalCompetitors,blackHatSessions,toast}){
  const [exp,setExp]=useState(null);
  const [showHistTab,setShowHistTab]=useState(false);
  const cs=opp.competitors||[];
  const add=()=>{const id=Date.now();onChange({...opp,competitors:[...cs,{id,name:'New Competitor',threat:'Medium',role:'Prime',globalCompId:'',info:'',teammates:'',strengths:'',weaknesses:'',ghosting:[{them:'',us:''}]}]});setExp(id);};
  const addFromLib=gcId=>{
    if(cs.some(c=>c.globalCompId===gcId))return;
    const gc=globalCompetitors.find(c=>c.id===gcId);if(!gc)return;
    const id=Date.now();
    onChange({...opp,competitors:[...cs,{id,name:gc.name,threat:'Medium',role:'Prime',globalCompId:gcId,info:gc.overview||'',teammates:gc.typicalPartners||'',strengths:gc.strengths||'',weaknesses:gc.weaknesses||'',ghosting:[{them:'',us:''}]}]});
    setExp(id);
  };
  const upd=(id,f,v)=>onChange({...opp,competitors:cs.map(c=>c.id===id?{...c,[f]:v}:c)});
  const del=id=>onChange({...opp,competitors:cs.filter(c=>c.id!==id)});
  // Find historical black hat intel for a given competitor across all sessions
  const getHistorical=gcId=>{
    if(!gcId)return[];
    return blackHatSessions.filter(s=>s.entries?.some(e=>e.globalCompId===gcId));
  };
  const linkedGcIds=cs.map(c=>c.globalCompId).filter(Boolean);
  const unlinkedGCs=globalCompetitors.filter(c=>!linkedGcIds.includes(c.id));
  return <div>
    {/* Tab bar */}
    <div style={{display:'flex',gap:6,marginBottom:14}}>
      {[{id:false,label:'⚔ Competitors ('+cs.length+')'},{id:true,label:'🕵 Historical Intel ('+blackHatSessions.filter(s=>cs.some(c=>c.globalCompId&&s.entries?.some(e=>e.globalCompId===c.globalCompId))).length+' sessions)'}].map(t=>(
        <button key={t.id} onClick={()=>setShowHistTab(t.id)}
          style={{padding:'7px 16px',borderRadius:8,border:`1px solid ${showHistTab===t.id?B.twilight:B.border}`,background:showHistTab===t.id?B.twilight+'22':'transparent',color:showHistTab===t.id?B.twilight:B.silver,fontWeight:700,fontSize:12,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
          {t.label}
        </button>
      ))}
    </div>
    {!showHistTab&&<>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <div style={{display:'flex',gap:10}}>{['High','Medium','Low'].map(t=><div key={t} style={{...S.card,marginBottom:0,padding:'8px 16px',textAlign:'center',borderColor:threatColor(t)+'44'}}>
          <div className="mono" style={{fontSize:20,fontWeight:700,color:threatColor(t)}}>{cs.filter(c=>c.threat===t).length}</div>
          <div style={{...S.lbl,textAlign:'center',marginBottom:0}}>{t}</div>
        </div>)}</div>
        <div style={{display:'flex',gap:8}}>
          {unlinkedGCs.length>0&&<div style={{position:'relative'}}>
            <select style={{...S.inp,fontSize:12,paddingRight:30}} onChange={e=>{if(e.target.value)addFromLib(+e.target.value);e.target.value='';}}>
              <option value="">⇄ Import from Library…</option>
              {unlinkedGCs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>}
          <button style={S.btn(B.force)} onClick={add}>+ Add Competitor</button>
        </div>
      </div>
      {cs.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>
        <div style={{fontSize:28,marginBottom:8}}>⚔</div>
        No competitors added yet. Add manually or import from your global Competitor Library.
      </div>}
      {cs.map(c=>{
        const gc=globalCompetitors.find(x=>x.id===c.globalCompId);
        const historical=getHistorical(c.globalCompId);
        return <div key={c.id} style={{...S.card,borderLeft:`3px solid ${threatColor(c.threat)}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}} onClick={()=>setExp(exp===c.id?null:c.id)}>
            <div>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                <input style={{...S.inp,fontSize:14,fontWeight:700,background:'transparent',border:'none',color:'#E8E8F8',padding:'0 0 3px',width:'auto',minWidth:200}} value={c.name} onChange={e=>upd(c.id,'name',e.target.value)} onClick={e=>e.stopPropagation()}/>
                {gc&&<span style={{fontSize:10,color:B.refraction,fontWeight:600}}>🔗 Library</span>}
              </div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{badge(c.threat,threatColor(c.threat),true)}{badge(c.role||'Prime',B.sky,true)}{historical.length>0&&badge(historical.length+' prior BH',B.twilight,true)}</div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <select style={{...S.inp,width:'auto',padding:'3px 8px',fontSize:11}} value={c.threat} onClick={e=>e.stopPropagation()} onChange={e=>upd(c.id,'threat',e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
              <button style={{...S.btn(B.twilight),padding:'4px 10px',fontSize:11}} onClick={e=>{e.stopPropagation();del(c.id);}}>✕</button>
              <span style={{color:B.sky,fontSize:13,fontWeight:700,minWidth:14,textAlign:'center'}}>{exp===c.id?'▲':'▼'}</span>
            </div>
          </div>
          {exp===c.id&&<div style={{marginTop:14,animation:'fadeIn .15s ease'}}>
            <div style={{marginBottom:10}}><span style={S.lbl}>Role</span><input style={S.inp} value={c.role||''} onChange={e=>upd(c.id,'role',e.target.value)} placeholder="Prime / Sub / JV…"/></div>
            {/* Historical intel banner */}
            {historical.length>0&&<div style={{...S.card,marginBottom:10,border:`1px solid ${B.twilight}44`,background:'#170F28',padding:'10px 14px'}}>
              <div style={{fontSize:11,fontWeight:700,color:B.twilight,marginBottom:6}}>🕵 {historical.length} Prior Black Hat Session{historical.length>1?'s':''} Found</div>
              {historical.slice(0,2).map(s=>{const e=s.entries?.find(x=>x.globalCompId===c.globalCompId);return<div key={s.id} style={{fontSize:11,color:B.silver,marginBottom:4,padding:'4px 8px',background:'#1E1438',borderRadius:6}}>
                <span style={{color:'#E0E0E8',fontWeight:600}}>{s.title||'Untitled'}</span> · {s.date||'—'}
                {e?.strengths&&<div style={{color:B.twilight,marginTop:2}}>↑ {e.strengths.slice(0,80)}{e.strengths.length>80?'…':''}</div>}
                {e?.weaknesses&&<div style={{color:B.refraction,marginTop:1}}>↓ {e.weaknesses.slice(0,80)}{e.weaknesses.length>80?'…':''}</div>}
              </div>;})}
              {historical.length>2&&<div style={{fontSize:10,color:B.silver}}>+{historical.length-2} more sessions. See Historical Intel tab.</div>}
            </div>}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div><span style={S.lbl}>Company Intel</span><textarea style={ta} rows={3} value={c.info||''} onChange={e=>upd(c.id,'info',e.target.value)} placeholder="Background, recent wins…"/>
                <span style={S.lbl}>Verified Teammates</span><input style={S.inp} value={c.teammates||''} onChange={e=>upd(c.id,'teammates',e.target.value)}/></div>
              <div><span style={S.lbl}>Strengths</span><textarea style={ta} rows={3} value={c.strengths||''} onChange={e=>upd(c.id,'strengths',e.target.value)} placeholder="Their advantages…"/>
                <span style={S.lbl}>Weaknesses</span><textarea style={ta} rows={3} value={c.weaknesses||''} onChange={e=>upd(c.id,'weaknesses',e.target.value)} placeholder="Areas to exploit…"/></div>
            </div>
            <div style={S.hdg}>Ghosting Strategy</div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={{...S.thd,borderRadius:'6px 0 0 0',width:'48%'}}>Their Claim</th><th style={{...S.thd,borderRadius:'0 6px 0 0'}}>Our Counter</th></tr></thead>
              <tbody>{c.ghosting.map((g,gi)=><tr key={gi} style={{background:gi%2===0?'#1E1E38':'#18183A'}}>
                <td style={{...S.tdc,padding:'6px 8px'}}><textarea style={{...ta,minHeight:44,fontSize:11}} value={g.them||''} onChange={e=>upd(c.id,'ghosting',c.ghosting.map((gg,i)=>i===gi?{...gg,them:e.target.value}:gg))}/></td>
                <td style={{...S.tdc,padding:'6px 8px'}}><textarea style={{...ta,minHeight:44,fontSize:11}} value={g.us||''} onChange={e=>upd(c.id,'ghosting',c.ghosting.map((gg,i)=>i===gi?{...gg,us:e.target.value}:gg))}/></td>
              </tr>)}
              <tr><td colSpan={2} style={{...S.tdc,textAlign:'center'}}><button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.sky,fontSize:11}} onClick={()=>upd(c.id,'ghosting',[...c.ghosting,{them:'',us:''}])}>+ Add Row</button></td></tr></tbody>
            </table>
          </div>}
        </div>;
      })}
    </>}
    {showHistTab&&<div>
      {/* Historical black hat intel across all sessions for competitors on this opp */}
      {cs.filter(c=>c.globalCompId).length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:36,fontSize:12}}>
        No linked competitors yet. Link competitors to your global library to see historical intel.
      </div>}
      {cs.filter(c=>c.globalCompId).map(c=>{
        const sessions=getHistorical(c.globalCompId);
        const gc=globalCompetitors.find(x=>x.id===c.globalCompId);
        if(sessions.length===0)return <div key={c.id} style={{...S.card,color:B.silver,fontSize:12}}>No black hat history for {c.name}.</div>;
        return <div key={c.id} style={{marginBottom:16}}>
          <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF',marginBottom:8,display:'flex',gap:8,alignItems:'center'}}>
            {c.name} {badge(sessions.length+' session'+(sessions.length>1?'s':''),B.twilight)}
          </div>
          {gc&&(gc.discriminators)&&<div style={{...S.card,border:`1px solid ${B.twilight}44`,marginBottom:8}}>
            <div style={{...S.lbl,color:B.twilight}}>📌 Proven Ghosting Discriminators (from profile)</div>
            <div style={{fontSize:12,color:'#C0C0E0',lineHeight:1.7}}>{gc.discriminators}</div>
          </div>}
          {sessions.map(s=>{const e=s.entries?.find(x=>x.globalCompId===c.globalCompId);return <div key={s.id} style={{...S.card,borderLeft:`3px solid ${threatColor(e?.threat||'Medium')}`,marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:'#E0E0F0'}}>{s.title||'Untitled Session'}</div>
                <div style={{fontSize:11,color:B.silver}}>{s.date||'—'} · {s.agency||'—'} · {s.contractType||'—'}</div>
              </div>
              <div style={{display:'flex',gap:4}}>
                {e&&badge(e.threat,threatColor(e.threat),true)}
                {e&&badge(e.role,B.sky,true)}
                {(s.fileIds||[]).length>0&&badge((s.fileIds||[]).length+' file'+(s.fileIds||[]).length>1?'s':'',B.supernova,true)}
              </div>
            </div>
            {e?.strengths&&<div style={{marginBottom:6}}><span style={{...S.lbl,color:B.twilight,fontSize:9}}>STRENGTHS OBSERVED</span><div style={{fontSize:12,color:'#D0D0E8',lineHeight:1.7}}>{e.strengths}</div></div>}
            {e?.weaknesses&&<div style={{marginBottom:6}}><span style={{...S.lbl,color:B.refraction,fontSize:9}}>WEAKNESSES OBSERVED</span><div style={{fontSize:12,color:'#D0D0E8',lineHeight:1.7}}>{e.weaknesses}</div></div>}
            {e?.ghosting?.filter(g=>g.them||g.us).length>0&&<div style={{marginBottom:6}}>
              <span style={{...S.lbl,fontSize:9}}>GHOSTING STRATEGIES</span>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <tbody>{e.ghosting.filter(g=>g.them||g.us).map((g,i)=><tr key={i} style={{background:i%2===0?'#1A1A34':'transparent'}}>
                  <td style={{...S.tdc,width:'48%',fontSize:11}}>{g.them}</td>
                  <td style={{...S.tdc,fontSize:11,color:B.sky}}>{g.us}</td>
                </tr>)}</tbody>
              </table>
            </div>}
            {e?.notes&&<div><span style={{...S.lbl,fontSize:9}}>NOTES</span><div style={{fontSize:11,color:B.silver,lineHeight:1.7}}>{e.notes}</div></div>}
            {s.keyTakeaways&&<div style={{marginTop:6,padding:'6px 10px',background:'#181830',borderRadius:6}}><span style={{...S.lbl,fontSize:9}}>SESSION TAKEAWAYS</span><div style={{fontSize:11,color:'#C0C0E0',lineHeight:1.7}}>{s.keyTakeaways}</div></div>}
          </div>;})}
        </div>;
      })}
    </div>}
  </div>;
}

/* ═══════════════════ CUSTOMER MAP ═══════════════════ */
function CustomerMap({opp,onChange}){
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

/* ═══════════════════ TEAMING ═══════════════════ */
function Teaming({opp,onChange}){
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

/* ═══════════════════ SOLUTIONING ═══════════════════ */
function Solutioning({opp,onChange,proofPoints}){
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

/* ═══════════════════ WIN THEMES ═══════════════════ */
function WinThemes({opp,onChange,proofPoints}){
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

/* ═══════════════════ GATE BRIEFING ═══════════════════ */
function GateBriefing({opp,pastPerfs,toast}){
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

/* ═══════════════════ OPP PAST PERF (linked) ═══════════════════ */
function OppPastPerf({opp,onChange,pastPerfs,proofPoints}){
  const linked=pastPerfs.filter(p=>(opp.linkedPastPerfIds||[]).includes(p.id));
  const toggle=id=>onChange({...opp,linkedPastPerfIds:(opp.linkedPastPerfIds||[]).includes(id)?(opp.linkedPastPerfIds||[]).filter(x=>x!==id):[...(opp.linkedPastPerfIds||[]),id]});
  return <div>
    <div style={{...S.card,border:`1px solid ${'#B066FF'}44`,marginBottom:16}}>
      <div style={{fontSize:13,color:'#B066FF',fontWeight:600,marginBottom:4}}>🏆 Link Past Performance Records</div>
      <div style={{fontSize:12,color:B.silver,lineHeight:1.7}}>Link records from the global Past Performance Library. Linked records will be available in Gate Briefings and Document Generator.</div>
    </div>
    <PastPerfPicker pastPerfs={pastPerfs} selectedIds={opp.linkedPastPerfIds||[]} onToggle={toggle} label={`Past Performances (${linked.length} linked)`}/>
    {linked.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:32,fontSize:12,marginTop:8}}>No records linked. Use the picker above to link from your global library.</div>}
    {linked.map(pp=><div key={pp.id} style={{...S.card,borderLeft:`3px solid ${'#B066FF'}`,marginTop:8,animation:'fadeIn .2s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'#E8E8F0',marginBottom:5}}>{pp.name}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{badge(pp.role,pp.role==='Prime'?B.sky:B.supernova)}{pp.cparRating&&badge(pp.cparRating,cparsColor(pp.cparRating))}{badge(pp.agency||'—',B.silver,true)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="mono" style={{fontSize:18,fontWeight:700,color:'#B066FF'}}>{pp.value||'—'}</div>
          <div style={{fontSize:10,color:B.silver}}>{pp.periodStart?.slice(0,7)||''}{pp.periodEnd?' – '+pp.periodEnd?.slice(0,7):''}</div>
        </div>
      </div>
      {pp.relevance&&<div style={{background:'#1A1A32',borderRadius:7,padding:'8px 12px',marginBottom:8}}>
        <div style={{...S.lbl,fontSize:9,marginBottom:3}}>Relevance</div>
        <div style={{fontSize:12,color:'#C0C0E0',lineHeight:1.7}}>{pp.relevance}</div>
      </div>}
      {pp.generatedNarrative&&<div style={{background:'#181832',borderRadius:7,padding:'8px 12px',borderLeft:`2px solid ${'#B066FF'}`}}>
        <div style={{...S.lbl,fontSize:9,marginBottom:3}}>Generated Narrative (excerpt)</div>
        <div style={{fontSize:11,color:'#A0A0C8',lineHeight:1.75}}>{pp.generatedNarrative.slice(0,320)}{pp.generatedNarrative.length>320?'…':''}</div>
      </div>}
      <button onClick={()=>toggle(pp.id)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:10,padding:'4px 10px',marginTop:10}}>Unlink</button>
    </div>)}
  </div>;
}

/* ═══════════════════ RISKS ═══════════════════ */
function Risks({opp,onChange}){
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

/* ═══════════════════ ACTION ITEMS ═══════════════════ */
function ActionRow({a,onToggle,onUpd,onDel}){
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
function ActionItems({opp,onChange}){
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

/* ═══════════════════ PAST PERF LIBRARY ═══════════════════ */
function PastPerfLibrary({pastPerfs,setPastPerfs,proofPoints,fileStore,addFiles,removeFile,toast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState('');
  const [filterRole,setFilterRole]=useState('All');
  const [confirmDel,setConfirmDel]=useState(null);
  const [generating,setGenerating]=useState(false);
  const blank=()=>({id:Date.now(),name:'',contractNumber:'',agency:'',prime:'Astrion Group, LLC',value:'',role:'Prime',periodStart:'',periodEnd:'',naics:'',description:'',scope:'',relevance:'',keyAchievements:'',pocName:'',pocTitle:'',pocEmail:'',pocPhone:'',cparRating:'Very Good',categories:[],proofPointIds:[],fileIds:[],generatedNarrative:'',tags:[],createdAt:new Date().toISOString()});
  const addPP=()=>{const p=blank();setPastPerfs(x=>[...x,p]);setSel(p.id);};
  const updPP=(id,f,v)=>setPastPerfs(x=>x.map(p=>p.id===id?{...p,[f]:v}:p));
  const delPP=id=>{setPastPerfs(x=>x.filter(p=>p.id!==id));if(sel===id)setSel(null);setConfirmDel(null);toast('Past performance deleted');};
  const genNarrative=async id=>{
    const pp=pastPerfs.find(x=>x.id===id);if(!pp)return;
    setGenerating(true);
    try{const r=await callClaude(PROMPTS.pastPerfNarrative,
      `Generate a past performance narrative for a federal proposal.\n\nContract: ${pp.name}\nAgency: ${pp.agency}\nValue: ${pp.value}\nRole: ${pp.role}\nPeriod: ${pp.periodStart} – ${pp.periodEnd}\nCPARS: ${pp.cparRating}\nDescription: ${pp.description}\nScope: ${pp.scope}\nKey Achievements: ${pp.keyAchievements}\nRelevance: ${pp.relevance}\n\n3-4 paragraphs: (1) contract overview, (2) Astrion contributions with metrics, (3) relevance to new requirement. Under 300 words.`);
      updPP(id,'generatedNarrative',r.trim());toast('Narrative generated');}catch(e){toast('Generation failed','error');}
    setGenerating(false);
  };
  const filtered=pastPerfs.filter(p=>(!q||(p.name+p.agency+p.contractNumber).toLowerCase().includes(q.toLowerCase()))&&(filterRole==='All'||p.role===filterRole));
  const cur=pastPerfs.find(p=>p.id===sel);
  return <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
    {confirmDel&&<ConfirmModal message={`Delete "${pastPerfs.find(p=>p.id===confirmDel)?.name||'this record'}"?`} onConfirm={()=>delPP(confirmDel)} onCancel={()=>setConfirmDel(null)}/>}
    <div style={{width:300,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${B.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Past Performances</div>
          <button style={{...S.btn(B.force),padding:'5px 12px',fontSize:11}} onClick={addPP}>+ Add</button>
        </div>
        <div style={{position:'relative',marginBottom:8}}>
          <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:12,color:B.silver}}>🔍</span>
          <input style={{...S.inp,fontSize:11,paddingLeft:26}} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {['All','Prime','Sub'].map(r=><button key={r} onClick={()=>setFilterRole(r)} style={{padding:'3px 10px',borderRadius:20,border:`1px solid ${filterRole===r?B.force:B.border}`,background:filterRole===r?B.force+'22':'transparent',color:filterRole===r?B.sky:B.silver,fontSize:10,cursor:'pointer'}}>{r}</button>)}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {filtered.length===0&&<div style={{textAlign:'center',color:B.silver,fontSize:12,padding:24}}>No records yet.</div>}
        {filtered.map(pp=><div key={pp.id} onClick={()=>setSel(pp.id)} className="card-hover"
          style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,border:`1px solid ${sel===pp.id?B.force:B.border}`,background:sel===pp.id?B.force+'18':'transparent',transition:'all .12s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:6}}>
            <div style={{fontSize:12,fontWeight:700,color:'#E8E8F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{pp.name||'Untitled'}</div>
            {badge(pp.role,pp.role==='Prime'?B.sky:B.supernova,true)}
          </div>
          <div style={{fontSize:10,color:B.silver,marginTop:2}}>{pp.agency||'—'} · {pp.value||'TBD'}</div>
          {pp.cparRating&&<div style={{marginTop:4}}>{badge(pp.cparRating,cparsColor(pp.cparRating),true)}</div>}
        </div>)}
      </div>
      <div style={{padding:'10px 12px',borderTop:`1px solid ${B.border}`,fontSize:10,color:B.silver}}>{pastPerfs.length} record{pastPerfs.length!==1?'s':''} · {pastPerfs.filter(p=>p.role==='Prime').length} Prime · {pastPerfs.filter(p=>p.role==='Sub').length} Sub</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
      {!cur&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16}}>
        <div style={{fontSize:42}}>🏆</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#D0D0F0',marginBottom:6}}>Past Performance Library</div>
          <div style={{fontSize:12,color:B.silver,marginBottom:18,lineHeight:1.7,maxWidth:380}}>Track records and generate narrative sections for proposals, relevance statements, and capability statements.</div>
          <button style={{...S.btn(B.force),padding:'9px 22px'}} onClick={addPP}>+ Add First Record</button>
        </div>
      </div>}
      {cur&&<div style={{animation:'fadeIn .2s ease'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div>
            <input style={{...S.inp,fontSize:17,fontWeight:700,background:'transparent',border:'none',padding:'0 0 4px',color:'#F0F0FF',width:420}} value={cur.name} onChange={e=>updPP(cur.id,'name',e.target.value)} placeholder="Contract / Program Name"/>
            <div style={{display:'flex',gap:6,marginTop:4,flexWrap:'wrap',alignItems:'center'}}>
              {badge(cur.role,cur.role==='Prime'?B.sky:B.supernova)}{cur.cparRating&&badge(cur.cparRating,cparsColor(cur.cparRating))}{cur.value&&<span style={{fontSize:12,color:B.silver}}>· {cur.value}</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{...S.btn(generating?B.border:B.force),opacity:generating?0.6:1,padding:'7px 16px',fontSize:12}} onClick={()=>genNarrative(cur.id)} disabled={generating}>{generating?<><span className="spinner"/> Generating…</>:'✦ Generate Narrative'}</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'5px 10px'}} onClick={()=>setConfirmDel(cur.id)}>🗑</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={S.card}>
            <div style={S.hdg}>Contract Details</div>
            {[{k:'contractNumber',l:'Contract Number'},{k:'agency',l:'Agency / Customer'},{k:'value',l:'Contract Value'},{k:'naics',l:'NAICS Code'}].map(({k,l})=>(
              <div key={k} style={{marginBottom:10}}><span style={S.lbl}>{l}</span><input style={S.inp} value={cur[k]||''} onChange={e=>updPP(cur.id,k,e.target.value)}/></div>
            ))}
            <div style={{marginBottom:10}}><span style={S.lbl}>Astrion Role</span><select style={S.inp} value={cur.role} onChange={e=>updPP(cur.id,'role',e.target.value)}><option>Prime</option><option>Sub</option><option>JV Partner</option><option>Teaming Partner</option></select></div>
            <div style={{marginBottom:10}}><span style={S.lbl}>CPARS Rating</span><select style={{...S.inp,color:cparsColor(cur.cparRating)}} value={cur.cparRating||''} onChange={e=>updPP(cur.id,'cparRating',e.target.value)}><option value="">Not Rated</option>{CPARS.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              <div><span style={S.lbl}>Period Start</span><input style={S.inp} type="month" value={cur.periodStart||''} onChange={e=>updPP(cur.id,'periodStart',e.target.value)}/></div>
              <div><span style={S.lbl}>Period End</span><input style={S.inp} type="month" value={cur.periodEnd||''} onChange={e=>updPP(cur.id,'periodEnd',e.target.value)}/></div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.hdg}>POC &amp; References</div>
            {[{k:'pocName',l:'POC Full Name'},{k:'pocTitle',l:'POC Title'},{k:'pocEmail',l:'POC Email'},{k:'pocPhone',l:'POC Phone'}].map(({k,l})=>(
              <div key={k} style={{marginBottom:10}}><span style={S.lbl}>{l}</span><input style={S.inp} type={k==='pocEmail'?'email':k==='pocPhone'?'tel':'text'} value={cur[k]||''} onChange={e=>updPP(cur.id,k,e.target.value)}/></div>
            ))}
          </div>
        </div>
        <div style={S.card}>
          <div style={S.hdg}>Performance Description</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><span style={S.lbl}>Contract Scope</span><textarea style={{...ta,minHeight:90}} value={cur.description||''} onChange={e=>updPP(cur.id,'description',e.target.value)}/></div>
            <div><span style={S.lbl}>Key Achievements &amp; Metrics</span><textarea style={{...ta,minHeight:90}} value={cur.keyAchievements||''} onChange={e=>updPP(cur.id,'keyAchievements',e.target.value)}/></div>
            <div><span style={S.lbl}>Technical Scope</span><textarea style={ta} value={cur.scope||''} onChange={e=>updPP(cur.id,'scope',e.target.value)}/></div>
            <div><span style={S.lbl}>Relevance / Application</span><textarea style={ta} value={cur.relevance||''} onChange={e=>updPP(cur.id,'relevance',e.target.value)}/></div>
          </div>
        </div>
        {cur.generatedNarrative&&<div style={{...S.card,border:`1px solid ${'#B066FF'}44`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={S.hdg}>Generated Proposal Narrative</div>
            <div style={{display:'flex',gap:8}}>{badge('AI-Generated','#B066FF')}<button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>navigator.clipboard.writeText(cur.generatedNarrative).then(()=>toast('Copied!'))}>📋 Copy</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>{exportToPDF(cur.generatedNarrative,cur.name+' — Narrative',cur.agency+' · '+cur.value);toast('PDF downloaded');}}>↓ PDF</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}} onClick={()=>{exportToDoc(cur.generatedNarrative,cur.name+' — Narrative',cur.agency+' · '+cur.value);toast('Word downloaded');}}>↓ Word</button></div>
          </div>
          <textarea style={{...ta,minHeight:150,color:'#D0D0E8',fontSize:13,lineHeight:1.85}} value={cur.generatedNarrative} onChange={e=>updPP(cur.id,'generatedNarrative',e.target.value)}/>
        </div>}
        <div style={S.card}>
          <div style={S.hdg}>Tags</div>
          <TagEditor tags={cur.tags||[]} onChange={v=>updPP(cur.id,'tags',v)}/>
        </div>
        <div style={S.card}>
          <div style={S.hdg}>Linked Proof Points</div>
          <ProofPointPicker proofPoints={proofPoints} selectedIds={cur.proofPointIds||[]} onToggle={id=>updPP(cur.id,'proofPointIds',(cur.proofPointIds||[]).includes(id)?(cur.proofPointIds||[]).filter(x=>x!==id):[...(cur.proofPointIds||[]),id])}/>
        </div>
        <div style={S.card}>
          <div style={S.hdg}>Attached Files</div>
          <FileList fileIds={cur.fileIds||[]} fileStore={fileStore} onAdd={f=>{addFiles(f);updPP(cur.id,'fileIds',[...(cur.fileIds||[]),f.id]);}} onRemove={fid=>{removeFile(fid);updPP(cur.id,'fileIds',(cur.fileIds||[]).filter(x=>x!==fid));}}/>
        </div>
      </div>}
    </div>
  </div>;
}

/* ═══════════════════ PROOF POINTS LIBRARY ═══════════════════ */
function ProofPointLibrary({proofPoints,setProofPoints,pastPerfs,fileStore,addFiles,removeFile,toast}){
  const [sel,setSel]=useState(null);
  const [q,setQ]=useState('');
  const [filterCat,setFilterCat]=useState('All');
  const [confirmDel,setConfirmDel]=useState(null);
  const [enhancing,setEnhancing]=useState(false);
  const blank=()=>({id:Date.now(),title:'',metric:'',context:'',category:'Technical',source:'',tags:[],pastPerfIds:[],usageHistory:[],fileIds:[],enhanced:'',createdAt:new Date().toISOString()});
  const addPP=()=>{const p=blank();setProofPoints(x=>[...x,p]);setSel(p.id);};
  const upd=(id,f,v)=>setProofPoints(x=>x.map(p=>p.id===id?{...p,[f]:v}:p));
  const del=id=>{setProofPoints(x=>x.filter(p=>p.id!==id));if(sel===id)setSel(null);setConfirmDel(null);toast('Proof point deleted');};
  const enhance=async id=>{
    const pp=proofPoints.find(x=>x.id===id);if(!pp)return;
    setEnhancing(true);
    try{const r=await callClaude(PROMPTS.enhanceProofPoint,
      `Enhance this proof point:\nTitle: ${pp.title}\nMetric: ${pp.metric}\nContext: ${pp.context}\nCategory: ${pp.category}\n\nReturn JSON only: {"title":"...","metric":"...","narrative":"..."}`);
      try{const j=JSON.parse(r.replace(/```json|```/g,'').trim());upd(id,'enhanced',JSON.stringify(j));toast('Enhanced');}catch{upd(id,'enhanced',r);}
    }catch(e){toast('Enhancement failed','error');}
    setEnhancing(false);
  };
  const cats=['All',...[...new Set(proofPoints.map(p=>p.category))]];
  const filtered=proofPoints.filter(p=>(!q||(p.title+p.metric+p.category).toLowerCase().includes(q.toLowerCase()))&&(filterCat==='All'||p.category===filterCat));
  const cur=proofPoints.find(p=>p.id===sel);
  let eData=null;if(cur?.enhanced){try{eData=JSON.parse(cur.enhanced);}catch{}}
  return <div style={{display:'flex',height:'100%',overflow:'hidden'}}>
    {confirmDel&&<ConfirmModal message={`Delete "${proofPoints.find(p=>p.id===confirmDel)?.title||'this proof point'}"?`} onConfirm={()=>del(confirmDel)} onCancel={()=>setConfirmDel(null)}/>}
    <div style={{width:300,borderRight:`1px solid ${B.border}`,display:'flex',flexDirection:'column',flexShrink:0}}>
      <div style={{padding:'14px 16px',borderBottom:`1px solid ${B.border}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Proof Points</div>
          <button style={{...S.btn(B.force),padding:'5px 12px',fontSize:11}} onClick={addPP}>+ Add</button>
        </div>
        <div style={{position:'relative',marginBottom:8}}>
          <span style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',fontSize:12,color:B.silver}}>🔍</span>
          <input style={{...S.inp,fontSize:11,paddingLeft:26}} placeholder="Search…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
          {cats.slice(0,6).map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{padding:'2px 8px',borderRadius:20,border:`1px solid ${filterCat===c?B.sky:B.border}`,background:filterCat===c?B.sky+'22':'transparent',color:filterCat===c?B.sky:B.silver,fontSize:9,cursor:'pointer'}}>{c}</button>)}
        </div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'8px'}}>
        {filtered.length===0&&<div style={{textAlign:'center',color:B.silver,fontSize:12,padding:24}}>No proof points yet.</div>}
        {filtered.map(pp=><div key={pp.id} onClick={()=>setSel(pp.id)} className="card-hover"
          style={{padding:'10px 12px',borderRadius:8,cursor:'pointer',marginBottom:4,border:`1px solid ${sel===pp.id?B.sky:B.border}`,background:sel===pp.id?B.sky+'15':'transparent',transition:'all .12s'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:4,marginBottom:3}}>
            <div style={{fontSize:11,fontWeight:700,color:'#E8E8F0',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pp.title||'Untitled'}</div>
            {badge(pp.category,B.silver,true)}
          </div>
          <div style={{fontSize:10,color:B.silver,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pp.metric||'No metric'}</div>
          {pp.usageHistory?.length>0&&<div style={{fontSize:9,color:B.sky,marginTop:2}}>Used {pp.usageHistory.length}× in {[...new Set(pp.usageHistory.map(u=>u.docType))].length} doc types</div>}
        </div>)}
      </div>
      <div style={{padding:'10px 12px',borderTop:`1px solid ${B.border}`,fontSize:10,color:B.silver}}>{proofPoints.length} proof point{proofPoints.length!==1?'s':''} · {[...new Set(proofPoints.map(p=>p.category))].length} categories</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
      {!cur&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',gap:16}}>
        <div style={{fontSize:42}}>💡</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:16,fontWeight:700,color:'#D0D0F0',marginBottom:6}}>Proof Points Library</div>
          <div style={{fontSize:12,color:B.silver,marginBottom:18,lineHeight:1.7,maxWidth:400}}>Build a reusable bank of metrics and achievements for RFIs, proposals, white papers, capability statements, and relevance narratives.</div>
          <button style={{...S.btn(B.force),padding:'9px 22px'}} onClick={addPP}>+ Add First Proof Point</button>
        </div>
      </div>}
      {cur&&<div style={{animation:'fadeIn .2s ease'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
          <div style={{flex:1,marginRight:12}}>
            <input style={{...S.inp,fontSize:16,fontWeight:700,background:'transparent',border:'none',padding:'0 0 4px',color:'#F0F0FF',width:'100%'}} value={cur.title} onChange={e=>upd(cur.id,'title',e.target.value)} placeholder="Proof Point Title"/>
            {badge(cur.category,B.sky)}
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0}}>
            <button style={{...S.btn(enhancing?B.border:B.force),opacity:enhancing?0.6:1}} onClick={()=>enhance(cur.id)} disabled={enhancing}>{enhancing?<><span className="spinner"/> Enhancing…</>:'✦ AI Enhance'}</button>
            <button style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'5px 10px'}} onClick={()=>setConfirmDel(cur.id)}>🗑</button>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={S.card}>
            <div style={S.hdg}>Core Data</div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Headline Metric</span><input className="mono" style={{...S.inp,fontWeight:700,color:B.sky,fontSize:14}} value={cur.metric||''} onChange={e=>upd(cur.id,'metric',e.target.value)} placeholder="e.g. 99.97% uptime over 36 months"/></div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Category</span><select style={S.inp} value={cur.category} onChange={e=>upd(cur.id,'category',e.target.value)}>{PP_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div style={{marginBottom:10}}><span style={S.lbl}>Source / Attribution</span><input style={S.inp} value={cur.source||''} onChange={e=>upd(cur.id,'source',e.target.value)}/></div>
            <div><span style={S.lbl}>Context &amp; Supporting Detail</span><textarea style={ta} value={cur.context||''} onChange={e=>upd(cur.id,'context',e.target.value)}/></div>
          </div>
          <div style={S.card}>
            <div style={S.hdg}>Usage History</div>
            {(cur.usageHistory||[]).length===0&&<div style={{color:B.silver,fontSize:12,padding:'16px 0'}}>Not used in any documents yet.</div>}
            {(cur.usageHistory||[]).slice().reverse().map((u,i)=><div key={i} style={{display:'flex',gap:8,padding:'6px 0',borderBottom:`1px solid ${B.border}`,alignItems:'center'}}>
              <span style={{fontSize:13}}>{DOC_TYPES.find(d=>d.id===u.docType)?.icon||'📄'}</span>
              <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:'#E0E0F0'}}>{DOC_TYPES.find(d=>d.id===u.docType)?.label||u.docType}</div>{u.oppName&&<div style={{fontSize:10,color:B.silver}}>{u.oppName}</div>}</div>
              <div style={{fontSize:10,color:B.silver}}>{u.date?.slice(0,10)||''}</div>
            </div>)}
          </div>
        </div>
        {eData&&<div style={{...S.card,border:`1px solid ${B.sky}44`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}><div style={S.hdg}>AI-Enhanced Version</div>{badge('AI-Enhanced',B.sky)}</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
            <div><span style={S.lbl}>Enhanced Title</span><div style={{fontSize:13,color:'#E0E0F0',fontWeight:700,padding:'6px 0'}}>{eData.title}</div></div>
            <div><span style={S.lbl}>Enhanced Metric</span><div className="mono" style={{fontSize:13,color:B.sky,fontWeight:700,padding:'6px 0'}}>{eData.metric}</div></div>
          </div>
          {eData.narrative&&<><span style={S.lbl}>Proposal Narrative</span><div style={{background:'#181832',borderRadius:7,padding:'12px 14px',fontSize:13,color:'#C8C8E8',lineHeight:1.75}}>{eData.narrative}</div><button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px',marginTop:8}} onClick={()=>navigator.clipboard.writeText(eData.narrative).then(()=>toast('Copied!'))}>📋 Copy</button></>}
        </div>}
        <div style={S.card}><div style={S.hdg}>Linked Past Performances</div><PastPerfPicker pastPerfs={pastPerfs} selectedIds={cur.pastPerfIds||[]} onToggle={id=>upd(cur.id,'pastPerfIds',(cur.pastPerfIds||[]).includes(id)?(cur.pastPerfIds||[]).filter(x=>x!==id):[...(cur.pastPerfIds||[]),id])}/></div>
        <div style={S.card}><div style={S.hdg}>Tags</div><TagEditor tags={cur.tags||[]} onChange={v=>upd(cur.id,'tags',v)}/></div>
        <div style={S.card}><div style={S.hdg}>Attached Files</div><FileList fileIds={cur.fileIds||[]} fileStore={fileStore} onAdd={f=>{addFiles(f);upd(cur.id,'fileIds',[...(cur.fileIds||[]),f.id]);}} onRemove={fid=>{removeFile(fid);upd(cur.id,'fileIds',(cur.fileIds||[]).filter(x=>x!==fid));}}/></div>
      </div>}
    </div>
  </div>;
}

/* ═══════════════════ DOCUMENT GENERATOR ═══════════════════ */
function DocumentGenerator({opps,pastPerfs,proofPoints,setProofPoints,toast}){
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

/* ═══════════════════ PORTFOLIO ═══════════════════ */
function Portfolio({opps,onSelect,onNew,onExport,onImport,pastPerfs,proofPoints,globalCompetitors,toast}){
  const [search,setSearch]=useState('');
  const [filterStage,setFilterStage]=useState('All');
  const importRef=useRef();
  const today=new Date();
  const parseTCVM=o=>{const n=parseTCVNum(o.tcv);return n;};
  const totalM=opps.reduce((a,o)=>a+parseTCVM(o),0);
  const totalStr=totalM>=1000?`$${(totalM/1000).toFixed(1)}B`:totalM>0?`$${totalM.toFixed(0)}M`:'—';
  const stages=['All',...[...new Set(opps.map(o=>o.stage))]];
  const filtered=opps.filter(o=>(!search||(o.name+o.agency).toLowerCase().includes(search.toLowerCase()))&&(filterStage==='All'||o.stage===filterStage));
  const byStage=STAGES.reduce((a,s)=>{a[s]=opps.filter(o=>o.stage===s).length;return a},{});
  const handleImport=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);onImport(d);toast('Portfolio imported');}catch{toast('Invalid file','error');}};r.readAsText(f);e.target.value='';};
  return <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style={{background:B.cardBg,borderBottom:`1px solid ${B.border}`,padding:'14px 28px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <div>
        <div style={{fontSize:19,fontWeight:800,color:'#F0F0FF',letterSpacing:'-.01em'}}>Capture Portfolio</div>
        <div style={{fontSize:11,color:B.silver,marginTop:2}}>Astrion Growth Office · {opps.length} Opportunities · {pastPerfs.length} Past Performances · {proofPoints.length} Proof Points · {globalCompetitors.length} Competitor Profiles</div>
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <input ref={importRef} type="file" accept=".json" style={{display:'none'}} onChange={handleImport}/>
        {opps.length>0&&<button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'6px 12px'}} onClick={onExport}>↓ Export</button>}
        <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'6px 12px'}} onClick={()=>importRef.current.click()}>↑ Import</button>
        <button style={{...S.btn(B.force),padding:'8px 18px',fontSize:13}} onClick={onNew}>+ New Opportunity</button>
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'22px 28px'}}>
      {opps.length===0?<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'55vh',gap:16}}>
        <div style={{fontSize:52,opacity:.3}}>◈</div>
        <div style={{fontSize:17,fontWeight:700,color:'#D0D0F0'}}>No opportunities yet</div>
        <div style={{fontSize:12,color:B.silver,marginBottom:8}}>Create your first capture plan.</div>
        <button style={{...S.btn(B.force),padding:'10px 26px',fontSize:13}} onClick={onNew}>+ Create First Opportunity</button>
      </div>:<>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
          {[{l:'Total Pipeline',v:totalStr,c:B.sky},{l:'Active Opps',v:opps.length,c:B.force},{l:'Gate B+',v:opps.filter(o=>['Gate B','Gate C','Proposal'].includes(o.stage)).length,c:B.supernova},{l:'Avg P-Win',v:opps.length?Math.round(opps.reduce((a,o)=>a+o.pWinScore,0)/opps.length)+'%':'—',c:B.refraction},{l:'Open Actions',v:opps.reduce((a,o)=>a+o.actions.filter(ac=>ac.status!=='Complete').length,0),c:B.twilight}]
            .map((s,i)=><div key={i} style={{...S.card,marginBottom:0}}><div style={S.lbl}>{s.l}</div><div className="mono" style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div></div>)}
        </div>
        {/* Stage bar */}
        <div style={{...S.card,marginBottom:18}}>
          <div style={{fontSize:12,fontWeight:700,color:B.sky,marginBottom:10}}>Pipeline by Stage</div>
          <div style={{display:'flex',borderRadius:7,overflow:'hidden',height:28,marginBottom:10}}>
            {Object.entries(byStage).filter(([,v])=>v>0).map(([s,ct])=>(
              <div key={s} title={`${s}: ${ct}`} style={{width:`${(ct/opps.length)*100}%`,background:stageColor(s),display:'flex',alignItems:'center',justifyContent:'center',minWidth:26,cursor:'pointer',transition:'opacity .15s'}} onClick={()=>setFilterStage(s===filterStage?'All':s)} onMouseEnter={e=>e.currentTarget.style.opacity='.72'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                <span style={{color:'#fff',fontSize:10,fontWeight:700}}>{ct}</span>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
            {Object.entries(byStage).filter(([,v])=>v>0).map(([s])=>(
              <div key={s} style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer'}} onClick={()=>setFilterStage(s===filterStage?'All':s)}>
                <div style={{width:9,height:9,borderRadius:2,background:stageColor(s)}}/>
                <span style={{fontSize:10,color:filterStage===s?stageColor(s):B.silver}}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Filters */}
        <div style={{display:'flex',gap:10,marginBottom:14,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,maxWidth:280}}>
            <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',fontSize:13,color:B.silver,pointerEvents:'none'}}>🔍</span>
            <input style={{...S.inp,paddingLeft:30}} placeholder="Search by name or agency…" value={search} onChange={e=>setSearch(e.target.value)}/>
            {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:B.silver,cursor:'pointer'}}>✕</button>}
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {stages.map(s=><button key={s} onClick={()=>setFilterStage(s)} style={{padding:'4px 11px',borderRadius:20,border:`1px solid ${filterStage===s?stageColor(s):B.border}`,background:filterStage===s?stageColor(s)+'22':'transparent',color:filterStage===s?stageColor(s):B.silver,fontSize:10,fontWeight:600,cursor:'pointer'}}>{s}</button>)}
          </div>
        </div>
        {/* Opp cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
          {filtered.map(opp=>{
            const open=opp.actions.filter(a=>a.status!=='Complete').length;
            const risks=opp.risks.filter(r=>r.status==='Active').length;
            const done=opp.gates.filter(g=>g.status==='Complete').length;
            const rfpMs=opp.rfpDate?new Date(opp.rfpDate+'-01')-today:null;
            const rfpD=rfpMs?Math.ceil(rfpMs/864e5):null;
            const col=stageColor(opp.stage);
            const docs=(opp.oppFiles||[]).length;
            return <div key={opp.id} onClick={()=>onSelect(opp.id)} className="card-hover"
              style={{background:B.cardBg,border:`1px solid ${B.border}`,borderRadius:11,padding:'16px 18px',cursor:'pointer',borderLeft:`4px solid ${col}`,animation:'slideUp .3s ease'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                <div style={{flex:1,minWidth:0,marginRight:10}}>
                  <div style={{fontSize:14,fontWeight:700,color:'#F0F0FF',marginBottom:5,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{opp.name||'Untitled'}</div>
                  <div style={{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>{badge(opp.stage,col,true)}{opp.agency&&badge(opp.agency,B.sky,true)}</div>
                </div>
                <div style={{textAlign:'right',flexShrink:0}}>
                  <div className="mono" style={{fontSize:18,fontWeight:700,color:col}}>{fmtTCVDisplay(opp.tcv)||opp.tcv||'TBD'}</div>
                  <div style={{fontSize:9,color:B.silver}}>TCV</div>
                </div>
              </div>
              {/* Gate dots */}
              <div style={{display:'flex',gap:4,marginBottom:10,alignItems:'center'}}>
                {opp.gates.filter(g=>['A','B','C','P'].includes(g.id)).map(g=>{const gc=gateColor(g.status);return<div key={g.id} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
                  <div style={{width:18,height:18,borderRadius:'50%',background:g.status==='Complete'?gc:'transparent',border:`2px solid ${gc}`,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {g.status==='Complete'&&<span style={{color:'#0C0C18',fontSize:8,fontWeight:900}}>✓</span>}
                  </div>
                  <span style={{fontSize:7,color:gc}}>{g.id==='P'?'Prop':g.id}</span>
                </div>;})}
                <div style={{flex:1,height:1,background:B.border,margin:'0 4px'}}/>
                <span style={{fontSize:10,color:B.silver}}>{done}/{opp.gates.length}</span>
              </div>
              <div style={{display:'flex',borderTop:`1px solid ${B.border}`,paddingTop:8}}>
                {[{l:'P-Win',v:opp.pWinScore+'%',c:opp.pWinScore>=60?B.refraction:opp.pWinScore>=40?B.supernova:B.twilight},
                  {l:'RFP',v:rfpD!=null?rfpD>0?rfpD+'d':'PAST':'TBD',c:rfpD!=null&&rfpD<60?B.twilight:B.silver},
                  {l:'Docs',v:docs,c:docs>0?B.sky:B.border},
                  {l:'Perfs',v:(opp.linkedPastPerfIds||[]).length,c:'#B066FF'},
                  {l:'Actions',v:open,c:open>3?B.twilight:B.silver},
                  {l:'Risks',v:risks,c:risks>0?B.supernova:B.silver},
                ].map(({l,v,c},i,arr)=>(
                  <div key={l} style={{flex:1,textAlign:'center',borderRight:i<arr.length-1?`1px solid ${B.border}`:'none'}}>
                    <div className="mono" style={{fontSize:13,fontWeight:700,color:c}}>{v}</div>
                    <div style={{fontSize:8,color:B.silver}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>;
          })}
          <div onClick={onNew} style={{background:'transparent',border:`2px dashed ${B.border}`,borderRadius:11,padding:16,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8,minHeight:160,transition:'all .15s'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=B.force;e.currentTarget.style.background='rgba(68,44,129,.06)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=B.border;e.currentTarget.style.background='transparent';}}>
            <div style={{width:40,height:40,borderRadius:'50%',border:`2px solid ${B.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:B.silver}}>+</div>
            <div style={{fontSize:12,color:B.silver,fontWeight:600}}>Add Opportunity</div>
          </div>
        </div>
      </>}
    </div>
  </div>;
}

/* ═══════════════════ NEW OPP MODAL ═══════════════════ */
function NewOppModal({onSave,onCancel}){
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

/* ═══════════════════ ROOT APP ═══════════════════ */
/* ═══════════════════ ANALYTICS DASHBOARD ═══════════════════ */
function AnalyticsDashboard({opps,pastPerfs,proofPoints,globalCompetitors}){
  const totalTCV=opps.reduce((a,o)=>a+parseTCVNum(o.tcv),0);
  const totalStr=totalTCV>=1000?`$${(totalTCV/1000).toFixed(1)}B`:totalTCV>0?`$${totalTCV.toFixed(0)}M`:'—';
  const avgPWin=opps.length?Math.round(opps.reduce((a,o)=>a+o.pWinScore,0)/opps.length):0;
  const gateBPlus=opps.filter(o=>['Gate B','Gate C','Proposal','Won'].includes(o.stage)).length;
  const won=opps.filter(o=>o.stage==='Won').length;
  const lost=opps.filter(o=>o.stage==='Lost').length;
  const noBid=opps.filter(o=>o.stage==='No Bid').length;
  const active=opps.filter(o=>!['Won','Lost','No Bid'].includes(o.stage)).length;

  // P-Win distribution
  const pwBuckets=[{l:'0–20',lo:0,hi:20,c:B.twilight},{l:'20–40',lo:20,hi:40,c:'#FF8866'},{l:'40–60',lo:40,hi:60,c:B.supernova},{l:'60–80',lo:60,hi:80,c:B.sky},{l:'80–100',lo:80,hi:101,c:B.refraction}];
  const pwCounts=pwBuckets.map(b=>({...b,count:opps.filter(o=>o.pWinScore>=b.lo&&o.pWinScore<b.hi).length}));
  const maxPW=Math.max(1,...pwCounts.map(b=>b.count));

  // TCV by stage
  const stageData=STAGES.filter(s=>s!=='Won'&&s!=='Lost'&&s!=='No Bid').map(s=>({stage:s,tcv:opps.filter(o=>o.stage===s).reduce((a,o)=>a+parseTCVNum(o.tcv),0),c:stageColor(s)}));
  const maxTCV=Math.max(1,...stageData.map(d=>d.tcv));

  // Team workload
  const teamMap={};
  const roles=['bd','cm','jcm','sa','pm','pricing','contracts','ops','gm'];
  opps.filter(o=>!['Won','Lost','No Bid'].includes(o.stage)).forEach(o=>{
    roles.forEach(r=>{const n=o.team?.[r];if(n){teamMap[n]=(teamMap[n]||0)+1;}});
  });
  const teamWork=Object.entries(teamMap).sort((a,b)=>b[1]-a[1]).slice(0,15);

  // Open actions by owner
  const actionMap={};
  opps.forEach(o=>(o.actions||[]).filter(a=>a.status!=='Complete').forEach(a=>{const ow=a.owner||'Unassigned';actionMap[ow]=(actionMap[ow]||0)+1;}));
  const actionWork=Object.entries(actionMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const maxAct=Math.max(1,...actionWork.map(a=>a[1]));

  // Risk summary
  const risksByImpact={High:0,Medium:0,Low:0};
  opps.forEach(o=>(o.risks||[]).filter(r=>r.status==='Active').forEach(r=>{if(r.impact)risksByImpact[r.impact]=(risksByImpact[r.impact]||0)+1;}));
  const totalRisks=Object.values(risksByImpact).reduce((a,b)=>a+b,0);

  // Donut for win/loss
  const totalOutcome=won+lost+noBid+active||1;
  const donutData=[{l:'Active',c:B.sky,v:active},{l:'Won',c:B.refraction,v:won},{l:'Lost',c:B.twilight,v:lost},{l:'No Bid',c:'#555',v:noBid}];
  let donutOffset=0;

  const StatCard=({label,value,color,sub})=><div style={{...S.card,marginBottom:0,textAlign:'center'}}><div style={S.lbl}>{label}</div><div className="mono" style={{fontSize:26,fontWeight:700,color}}>{value}</div>{sub&&<div style={{fontSize:10,color:B.silver,marginTop:2}}>{sub}</div>}</div>;

  return <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
    <div style={{background:B.cardBg,borderBottom:`1px solid ${B.border}`,padding:'14px 22px',flexShrink:0}}>
      <div style={{fontSize:17,fontWeight:800,color:'#F0F0FF'}}>📊 Analytics Dashboard</div>
      <div style={{fontSize:11,color:B.silver,marginTop:2}}>{opps.length} opportunities · {pastPerfs.length} past performances · {globalCompetitors.length} competitors</div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'18px 22px'}}>
      {opps.length===0?<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'50vh',gap:14}}>
        <div style={{fontSize:48,opacity:.3}}>📊</div>
        <div style={{fontSize:15,fontWeight:700,color:'#D0D0F0'}}>No data yet</div>
        <div style={{fontSize:12,color:B.silver}}>Create opportunities to see analytics.</div>
      </div>:<>
        {/* Stat cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:18}}>
          <StatCard label="Total Pipeline" value={totalStr} color={B.sky}/>
          <StatCard label="Active Opps" value={active} color={B.force}/>
          <StatCard label="Avg P-Win" value={avgPWin+'%'} color={avgPWin>=60?B.refraction:avgPWin>=40?B.supernova:B.twilight}/>
          <StatCard label="Gate B+" value={gateBPlus} color={B.supernova}/>
          <StatCard label="Win Rate" value={won+lost>0?Math.round(won/(won+lost)*100)+'%':'—'} color={B.refraction} sub={`${won}W / ${lost}L`}/>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {/* P-Win Distribution */}
          <div style={S.card}>
            <div style={S.hdg}>P-Win Distribution</div>
            <svg viewBox="0 0 300 140" style={{width:'100%',height:140}}>
              {pwCounts.map((b,i)=>{const bw=48,x=12+i*(bw+10),h=b.count/maxPW*100;
                return <g key={i}><rect x={x} y={120-h} width={bw} height={h} fill={b.c} rx={4} opacity={.85}/>
                <text x={x+bw/2} y={135} textAnchor="middle" fill={B.silver} fontSize="9" fontFamily="'DM Sans'">{b.l}</text>
                {b.count>0&&<text x={x+bw/2} y={115-h} textAnchor="middle" fill="#E0E0F0" fontSize="11" fontWeight="700" fontFamily="'JetBrains Mono'">{b.count}</text>}
                </g>;})}
            </svg>
          </div>

          {/* Win/Loss Donut */}
          <div style={S.card}>
            <div style={S.hdg}>Outcome Tracking</div>
            <div style={{display:'flex',alignItems:'center',gap:20}}>
              <svg viewBox="0 0 120 120" style={{width:110,height:110}}>
                {donutData.map((d,i)=>{const pct=d.v/totalOutcome;const dashLen=pct*283;const r=<circle key={i} cx={60} cy={60} r={45} fill="none" stroke={d.c} strokeWidth={14} strokeDasharray={`${dashLen} ${283-dashLen}`} strokeDashoffset={-donutOffset} style={{transition:'all .6s ease'}}/>;donutOffset+=dashLen;return r;})}
                <text x={60} y={56} textAnchor="middle" fill="#E0E0F0" fontSize="20" fontWeight="700" fontFamily="'JetBrains Mono'">{opps.length}</text>
                <text x={60} y={70} textAnchor="middle" fill={B.silver} fontSize="8" fontFamily="'DM Sans'">TOTAL</text>
              </svg>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {donutData.map(d=><div key={d.l} style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:10,height:10,borderRadius:2,background:d.c}}/><span style={{fontSize:11,color:'#D0D0E8'}}>{d.l}</span><span className="mono" style={{fontSize:12,fontWeight:700,color:d.c,marginLeft:4}}>{d.v}</span></div>)}
              </div>
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {/* TCV by Stage */}
          <div style={S.card}>
            <div style={S.hdg}>TCV by Stage</div>
            {stageData.map(d=><div key={d.stage} style={{marginBottom:8}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:3}}>
                <span style={{color:B.silver}}>{d.stage}</span>
                <span className="mono" style={{color:d.c,fontWeight:700}}>{d.tcv>=1000?`$${(d.tcv/1000).toFixed(1)}B`:`$${d.tcv.toFixed(0)}M`}</span>
              </div>
              <div style={{height:6,background:B.border,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(d.tcv/maxTCV)*100}%`,background:d.c,borderRadius:3,transition:'width .6s ease'}}/>
              </div>
            </div>)}
          </div>

          {/* Risk Summary */}
          <div style={S.card}>
            <div style={S.hdg}>Active Risk Summary</div>
            {totalRisks===0?<div style={{color:B.silver,fontSize:12,padding:'18px 0',textAlign:'center'}}>No active risks.</div>:
            <div style={{display:'flex',gap:14,alignItems:'flex-end',justifyContent:'center',padding:'16px 0'}}>
              {[{l:'High',c:B.twilight,v:risksByImpact.High},{l:'Medium',c:B.supernova,v:risksByImpact.Medium},{l:'Low',c:B.silver,v:risksByImpact.Low}].map(r=><div key={r.l} style={{textAlign:'center'}}>
                <div className="mono" style={{fontSize:28,fontWeight:700,color:r.c}}>{r.v}</div>
                <div style={{fontSize:10,color:B.silver,marginTop:2}}>{r.l}</div>
              </div>)}
            </div>}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {/* Gate Completion Heatmap */}
          <div style={S.card}>
            <div style={S.hdg}>Gate Completion Heatmap</div>
            <div style={{overflowX:'auto'}}>
              <div style={{display:'grid',gridTemplateColumns:`140px repeat(${makeGates().length},1fr)`,gap:2,fontSize:9}}>
                <div/>
                {makeGates().map(g=><div key={g.id} style={{textAlign:'center',color:B.silver,fontWeight:700,padding:'3px 0'}}>{g.id}</div>)}
                {opps.filter(o=>!['Won','Lost','No Bid'].includes(o.stage)).slice(0,12).map(o=><React.Fragment key={o.id}>
                  <div style={{color:'#C8C8E8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',padding:'3px 4px'}}>{o.name||'Untitled'}</div>
                  {(o.gates||makeGates()).map(g=><div key={g.id} style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:g.status==='Complete'?B.refraction:g.status==='In Progress'?B.supernova+'88':g.status==='Upcoming'?B.sky+'44':B.border+'44'}}/>
                  </div>)}
                </React.Fragment>)}
              </div>
            </div>
          </div>

          {/* Team Workload */}
          <div style={S.card}>
            <div style={S.hdg}>Team Workload</div>
            {teamWork.length===0?<div style={{color:B.silver,fontSize:12,padding:'18px 0',textAlign:'center'}}>No team assignments yet.</div>:
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {teamWork.slice(0,10).map(([name,count])=><div key={name} style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:120,fontSize:11,color:'#D0D0E8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                <div style={{flex:1,height:6,background:B.border,borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(count/Math.max(...teamWork.map(t=>t[1])))*100}%`,background:count>=4?B.twilight:count>=2?B.supernova:B.sky,borderRadius:3}}/>
                </div>
                <span className="mono" style={{fontSize:11,fontWeight:700,color:count>=4?B.twilight:B.silver,minWidth:20,textAlign:'right'}}>{count}</span>
              </div>)}
            </div>}
          </div>
        </div>

        {/* Open Actions by Owner */}
        {actionWork.length>0&&<div style={S.card}>
          <div style={S.hdg}>Open Actions by Owner</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:6}}>
            {actionWork.map(([owner,count])=><div key={owner} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:'#1A1A32',borderRadius:7,border:`1px solid ${B.border}`}}>
              <div style={{width:120,fontSize:11,color:'#D0D0E8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{owner}</div>
              <div style={{flex:1,height:5,background:B.border,borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${(count/maxAct)*100}%`,background:count>=5?B.twilight:count>=3?B.supernova:B.sky,borderRadius:3}}/>
              </div>
              <span className="mono" style={{fontSize:12,fontWeight:700,color:count>=5?B.twilight:B.silver}}>{count}</span>
            </div>)}
          </div>
        </div>}
      </>}
    </div>
  </div>;
}

/* ═══════════════════ GLOBAL SEARCH ═══════════════════ */
function GlobalSearch({opps,pastPerfs,proofPoints,globalCompetitors,onOpenOpp}){
  const [q,setQ]=useState('');
  const [filter,setFilter]=useState('all');

  const hl=(text,query)=>{
    if(!query||!text)return text;
    const re=new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`,'gi');
    return String(text).split(re).map((part,i)=>re.test(part)?<mark key={i} style={{background:B.supernova+'44',color:B.supernova,borderRadius:2,padding:'0 2px'}}>{part}</mark>:part);
  };

  const search=q.toLowerCase().trim();
  const matchFields=(obj,fields)=>{
    if(!search)return false;
    return fields.some(f=>{
      const v=typeof f==='function'?f(obj):obj[f];
      return v&&String(v).toLowerCase().includes(search);
    })||(obj.tags||[]).some(t=>t.toLowerCase().includes(search));
  };

  const oppResults=(!filter||filter==='all'||filter==='opps')?opps.filter(o=>matchFields(o,['name','agency','incumbent','description','naics','govwin'])):[];
  const ppResults=(!filter||filter==='all'||filter==='pastperfs')?pastPerfs.filter(p=>matchFields(p,['name','agency','contractNumber','description','scope','keyAchievements','relevance'])):[];
  const compResults=(!filter||filter==='all'||filter==='competitors')?globalCompetitors.filter(c=>matchFields(c,['name','overview','strengths','weaknesses','discriminators','notes'])):[];
  const proofResults=(!filter||filter==='all'||filter==='proofpoints')?proofPoints.filter(p=>matchFields(p,['title','metric','context','source','category'])):[];
  const totalResults=oppResults.length+ppResults.length+compResults.length+proofResults.length;

  const filters=[{id:'all',l:'All',c:B.sky},{id:'opps',l:`Opps (${oppResults.length})`,c:B.force},{id:'pastperfs',l:`Past Perfs (${ppResults.length})`,c:'#B066FF'},{id:'competitors',l:`Competitors (${compResults.length})`,c:B.twilight},{id:'proofpoints',l:`Proof Points (${proofResults.length})`,c:B.refraction}];

  return <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
    <div style={{background:B.cardBg,borderBottom:`1px solid ${B.border}`,padding:'14px 22px',flexShrink:0}}>
      <div style={{fontSize:17,fontWeight:800,color:'#F0F0FF',marginBottom:10}}>🔍 Global Search</div>
      <div style={{position:'relative',marginBottom:10}}>
        <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:B.silver}}>🔍</span>
        <input autoFocus style={{...S.inp,fontSize:14,padding:'10px 14px 10px 36px',background:'#1A1A32'}} placeholder="Search opportunities, past performances, competitors, proof points…" value={q} onChange={e=>setQ(e.target.value)}/>
        {q&&<button onClick={()=>setQ('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:B.silver,fontSize:14,cursor:'pointer'}}>✕</button>}
      </div>
      <div style={{display:'flex',gap:6}}>
        {filters.map(f=><button key={f.id} onClick={()=>setFilter(f.id)} style={{padding:'4px 12px',borderRadius:20,border:`1px solid ${filter===f.id?f.c:B.border}`,background:filter===f.id?f.c+'22':'transparent',color:filter===f.id?f.c:B.silver,fontSize:10,fontWeight:600,cursor:'pointer',transition:'all .12s'}}>{f.l}</button>)}
      </div>
    </div>
    <div style={{flex:1,overflowY:'auto',padding:'16px 22px'}}>
      {!search&&<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'50vh',gap:14}}>
        <div style={{fontSize:48,opacity:.3}}>🔍</div>
        <div style={{fontSize:15,fontWeight:700,color:'#D0D0F0'}}>Search across everything</div>
        <div style={{fontSize:12,color:B.silver,maxWidth:340,textAlign:'center',lineHeight:1.7}}>Search by name, keyword, agency, metric, or tag across all opportunities, past performances, competitors, and proof points.</div>
      </div>}
      {search&&totalResults===0&&<div style={{textAlign:'center',padding:40}}><div style={{fontSize:32,opacity:.3,marginBottom:10}}>∅</div><div style={{color:B.silver,fontSize:13}}>No results for "{q}"</div></div>}

      {search&&oppResults.length>0&&<div style={{marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:700,color:B.force,marginBottom:8}}>◈ Opportunities ({oppResults.length})</div>
        {oppResults.map(o=><div key={o.id} className="card-hover" onClick={()=>onOpenOpp(o.id)} style={{...S.card,marginBottom:8,cursor:'pointer',borderLeft:`3px solid ${stageColor(o.stage)}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div><div style={{fontSize:13,fontWeight:700,color:'#F0F0FF'}}>{hl(o.name,q)}</div><div style={{fontSize:11,color:B.silver}}>{hl(o.agency,q)} · {o.stage} · P-Win: {o.pWinScore}%</div></div>
            <div className="mono" style={{color:B.sky,fontWeight:700}}>{fmtTCVDisplay(o.tcv)||'TBD'}</div>
          </div>
          {(o.tags||[]).length>0&&<div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:6}}>{o.tags.map(t=><span key={t}>{badge(t,tagColor(t),true)}</span>)}</div>}
        </div>)}
      </div>}

      {search&&ppResults.length>0&&<div style={{marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:700,color:'#B066FF',marginBottom:8}}>🏆 Past Performances ({ppResults.length})</div>
        {ppResults.map(p=><div key={p.id} style={{...S.card,marginBottom:8,borderLeft:`3px solid #B066FF`}}>
          <div style={{fontSize:13,fontWeight:700,color:'#F0F0FF'}}>{hl(p.name,q)}</div>
          <div style={{fontSize:11,color:B.silver}}>{hl(p.agency,q)} · {p.value} · {p.role}{p.cparRating?' · '+p.cparRating:''}</div>
          {p.description&&<div style={{fontSize:11,color:'#9090B8',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{hl(p.description,q)}</div>}
          {(p.tags||[]).length>0&&<div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:6}}>{p.tags.map(t=><span key={t}>{badge(t,tagColor(t),true)}</span>)}</div>}
        </div>)}
      </div>}

      {search&&compResults.length>0&&<div style={{marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:700,color:B.twilight,marginBottom:8}}>⚔ Competitors ({compResults.length})</div>
        {compResults.map(c=><div key={c.id} style={{...S.card,marginBottom:8,borderLeft:`3px solid ${B.twilight}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#F0F0FF'}}>{hl(c.name,q)}</div>
            {badge(c.size,B.silver,true)}
          </div>
          {c.overview&&<div style={{fontSize:11,color:'#9090B8',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{hl(c.overview,q)}</div>}
          {(c.tags||[]).length>0&&<div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:6}}>{c.tags.map(t=><span key={t}>{badge(t,tagColor(t),true)}</span>)}</div>}
        </div>)}
      </div>}

      {search&&proofResults.length>0&&<div style={{marginBottom:18}}>
        <div style={{fontSize:13,fontWeight:700,color:B.refraction,marginBottom:8}}>💡 Proof Points ({proofResults.length})</div>
        {proofResults.map(p=><div key={p.id} style={{...S.card,marginBottom:8,borderLeft:`3px solid ${B.refraction}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#F0F0FF'}}>{hl(p.title,q)}</div>
            {badge(p.category,B.sky,true)}
          </div>
          <div className="mono" style={{fontSize:12,color:B.sky,marginTop:4}}>{hl(p.metric,q)}</div>
          {(p.tags||[]).length>0&&<div style={{display:'flex',gap:3,flexWrap:'wrap',marginTop:6}}>{p.tags.map(t=><span key={t}>{badge(t,tagColor(t),true)}</span>)}</div>}
        </div>)}
      </div>}
    </div>
  </div>;
}

/* ═══════════════════ PRICE TO WIN MODULE ═══════════════════ */
function PriceToWin({opp,onChange,globalCompetitors,toast}){
  const ptw=opp.ptw||{igce:'',shouldCost:'',bidLow:'',bidHigh:'',strategy:'Competitive',notes:'',laborCats:[],compEstimates:[],overheadPct:30,gaPct:8,feePct:10,fringePct:35,topDown:{targetPrice:'',requiredMarginPct:10},mode:'bottomUp'};
  const upd=u=>onChange({...opp,ptw:{...ptw,...u}});
  const mode=ptw.mode||'bottomUp';

  // Labor cat operations
  const addLabor=()=>upd({laborCats:[...(ptw.laborCats||[]),{id:Date.now(),title:'',level:'',hours:0,rate:0,wrapRate:false}]});
  const updLabor=(id,f,v)=>upd({laborCats:(ptw.laborCats||[]).map(l=>l.id===id?{...l,[f]:v}:l)});
  const delLabor=id=>upd({laborCats:(ptw.laborCats||[]).filter(l=>l.id!==id)});

  // Comp estimate operations
  const addComp=()=>upd({compEstimates:[...(ptw.compEstimates||[]),{id:Date.now(),globalCompId:'',name:'',estimateLow:'',estimateHigh:'',basis:''}]});
  const updComp=(id,f,v)=>upd({compEstimates:(ptw.compEstimates||[]).map(c=>c.id===id?{...c,[f]:v}:c)});
  const delComp=id=>upd({compEstimates:(ptw.compEstimates||[]).filter(c=>c.id!==id)});

  // Calculations
  const laborCats=ptw.laborCats||[];
  const directLabor=laborCats.reduce((a,l)=>{const h=parseFloat(l.hours)||0;const r=parseFloat(l.rate)||0;return a+h*r;},0);
  const fringeCost=directLabor*((ptw.fringePct||35)/100);
  const overheadCost=(directLabor+fringeCost)*((ptw.overheadPct||30)/100);
  const totalDirect=directLabor+fringeCost+overheadCost;
  const gaCost=totalDirect*((ptw.gaPct||8)/100);
  const totalCost=totalDirect+gaCost;
  const fee=totalCost*((ptw.feePct||10)/100);
  const bottomUpTotal=totalCost+fee;

  // Top-down
  const td=ptw.topDown||{targetPrice:'',requiredMarginPct:10};
  const targetVal=parseTCVNum(td.targetPrice)*1e6;
  const marginPct=parseFloat(td.requiredMarginPct)||10;
  const impliedCostCeiling=targetVal>0?targetVal*(1-marginPct/100):0;
  const gap=bottomUpTotal>0?impliedCostCeiling-bottomUpTotal:0;
  const gapPct=bottomUpTotal>0?((gap/bottomUpTotal)*100):0;

  // IGCE val
  const igceVal=parseTCVNum(ptw.igce)*1e6;
  const discountPct=igceVal>0&&bottomUpTotal>0?((1-bottomUpTotal/igceVal)*100).toFixed(1):0;

  // Comp estimates for chart
  const comps=(ptw.compEstimates||[]).filter(c=>c.estimateLow||c.estimateHigh);
  const chartMax=Math.max(bottomUpTotal||1,igceVal||1,impliedCostCeiling||1,...comps.map(c=>Math.max(parseTCVNum(c.estimateHigh)*1e6||0,parseTCVNum(c.estimateLow)*1e6||0)))*1.15;

  const fmtDollar=v=>{if(v>=1e9)return`$${(v/1e9).toFixed(2)}B`;if(v>=1e6)return`$${(v/1e6).toFixed(1)}M`;if(v>=1e3)return`$${(v/1e3).toFixed(0)}K`;return`$${v.toFixed(0)}`;};

  const strategies=['Competitive','LPTA','Best Value','IDIQ/TO'];
  const stColor=s=>s==='LPTA'?B.twilight:s==='Best Value'?B.refraction:s==='IDIQ/TO'?B.sky:B.supernova;

  return <div>
    {/* Header Stats */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:14}}>
      {[
        {l:'IGCE',v:fmtTCVDisplay(ptw.igce)||'—',c:B.silver},
        {l:'Should-Cost',v:fmtTCVDisplay(ptw.shouldCost)||'—',c:B.sky},
        {l:'Bid Range',v:(ptw.bidLow||ptw.bidHigh)?`${fmtTCVDisplay(ptw.bidLow)||'?'}–${fmtTCVDisplay(ptw.bidHigh)||'?'}`:'—',c:B.supernova},
        {l:'Discount/IGCE',v:discountPct?discountPct+'%':'—',c:discountPct>10?B.refraction:B.silver},
        {l:'Bottom-Up',v:bottomUpTotal>0?fmtDollar(bottomUpTotal):'—',c:B.force},
        {l:'TD Gap',v:gap!==0?fmtDollar(Math.abs(gap)):'—',c:gap>=0?B.refraction:B.twilight},
      ].map((s,i)=><div key={i} style={{...S.card,marginBottom:0,textAlign:'center'}}><div style={S.lbl}>{s.l}</div><div className="mono" style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>)}
    </div>

    {/* Mode Toggle */}
    <div style={{display:'flex',gap:8,marginBottom:14}}>
      {['bottomUp','topDown'].map(m=><button key={m} onClick={()=>upd({mode:m})} style={{flex:1,padding:'10px',borderRadius:9,border:`2px solid ${mode===m?B.force:B.border}`,background:mode===m?B.force+'22':B.cardBg,color:mode===m?B.sky:'#9090B8',fontWeight:700,fontSize:12,cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif"}}>{m==='bottomUp'?'⬆ Bottom-Up Build':'⬇ Top-Down Decomposition'}</button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {/* Left Column */}
      <div>
        {/* Key Inputs */}
        <div style={S.card}>
          <div style={S.hdg}>Key Estimates</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            <div><span style={S.lbl}>IGCE / Govt Estimate</span><TCVInput value={ptw.igce} onChange={v=>upd({igce:v})}/></div>
            <div><span style={S.lbl}>Our Should-Cost</span><TCVInput value={ptw.shouldCost} onChange={v=>upd({shouldCost:v})}/></div>
            <div><span style={S.lbl}>Bid Range Low</span><TCVInput value={ptw.bidLow} onChange={v=>upd({bidLow:v})}/></div>
            <div><span style={S.lbl}>Bid Range High</span><TCVInput value={ptw.bidHigh} onChange={v=>upd({bidHigh:v})}/></div>
          </div>
          <div><span style={S.lbl}>Bid Strategy</span>
            <div style={{display:'flex',gap:6}}>{strategies.map(s=><button key={s} onClick={()=>upd({strategy:s})} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${ptw.strategy===s?stColor(s):B.border}`,background:ptw.strategy===s?stColor(s)+'22':'transparent',color:ptw.strategy===s?stColor(s):B.silver,fontSize:11,fontWeight:600,cursor:'pointer'}}>{s}</button>)}</div>
          </div>
        </div>

        {mode==='bottomUp'?<>
          {/* Labor Category Builder */}
          <div style={S.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={S.hdg}>Labor Categories</div>
              <button style={{...S.btn(B.force),padding:'4px 12px',fontSize:11}} onClick={addLabor}>+ Add Labor Cat</button>
            </div>
            {laborCats.length===0?<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:16}}>Add labor categories to build your cost estimate.</div>:
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Title','Level','Hours','Rate ($/hr)','Total',''].map(h=><th key={h} style={S.thd}>{h}</th>)}</tr></thead>
                <tbody>{laborCats.map(l=>{const t=(parseFloat(l.hours)||0)*(parseFloat(l.rate)||0);return<tr key={l.id}>
                  <td style={S.tdc}><input style={{...S.inp,padding:'4px 7px',fontSize:11}} value={l.title||''} onChange={e=>updLabor(l.id,'title',e.target.value)} placeholder="e.g. Sr. Engineer"/></td>
                  <td style={S.tdc}><input style={{...S.inp,padding:'4px 7px',fontSize:11,width:80}} value={l.level||''} onChange={e=>updLabor(l.id,'level',e.target.value)} placeholder="Sr/Mid/Jr"/></td>
                  <td style={S.tdc}><input className="mono" type="number" style={{...S.inp,padding:'4px 7px',fontSize:11,width:70,color:B.sky}} value={l.hours||''} onChange={e=>updLabor(l.id,'hours',e.target.value)}/></td>
                  <td style={S.tdc}><input className="mono" type="number" style={{...S.inp,padding:'4px 7px',fontSize:11,width:80,color:B.supernova}} value={l.rate||''} onChange={e=>updLabor(l.id,'rate',e.target.value)}/></td>
                  <td style={{...S.tdc,fontFamily:"'JetBrains Mono'",fontWeight:700,color:B.refraction}}>{fmtDollar(t)}</td>
                  <td style={S.tdc}><button onClick={()=>delLabor(l.id)} style={{background:'none',border:'none',color:B.twilight,cursor:'pointer',fontSize:12}}>✕</button></td>
                </tr>})}</tbody>
              </table>
            </div>}
          </div>

          {/* Cost Rollup */}
          <div style={S.card}>
            <div style={S.hdg}>Cost Rollup</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr auto',gap:'6px 12px',alignItems:'center',fontSize:12}}>
              {[
                ['Direct Labor',directLabor,null,null],
                ['Fringe',fringeCost,'fringePct',ptw.fringePct||35],
                ['Overhead',overheadCost,'overheadPct',ptw.overheadPct||30],
                ['G&A',gaCost,'gaPct',ptw.gaPct||8],
                ['Fee/Profit',fee,'feePct',ptw.feePct||10],
              ].map(([label,val,key,pct])=><React.Fragment key={label}>
                <div style={{color:B.silver,fontWeight:600}}>{label}</div>
                <div className="mono" style={{color:B.sky,fontWeight:700,textAlign:'right'}}>{fmtDollar(val)}</div>
                <div>{key?<input className="mono" type="number" style={{...S.inp,padding:'3px 6px',fontSize:11,width:60,color:B.supernova}} value={pct} onChange={e=>upd({[key]:parseFloat(e.target.value)||0})}/>:<span/>}</div>
                <div style={{color:B.silver,fontSize:10}}>{key?'%':''}</div>
              </React.Fragment>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',borderTop:`2px solid ${B.force}`,marginTop:10,paddingTop:10}}>
              <span style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Total Price</span>
              <span className="mono" style={{fontSize:18,fontWeight:700,color:B.refraction}}>{fmtDollar(bottomUpTotal)}</span>
            </div>
          </div>
        </>:<>
          {/* Top-Down Mode */}
          <div style={S.card}>
            <div style={S.hdg}>Top-Down Decomposition</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div><span style={S.lbl}>Target Price</span><TCVInput value={td.targetPrice} onChange={v=>upd({topDown:{...td,targetPrice:v}})}/></div>
              <div><span style={S.lbl}>Required Margin %</span><input className="mono" type="number" style={{...S.inp,color:B.supernova,fontWeight:700}} value={td.requiredMarginPct} onChange={e=>upd({topDown:{...td,requiredMarginPct:e.target.value}})}/></div>
            </div>
            {targetVal>0&&<>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Target</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.sky}}>{fmtDollar(targetVal)}</div></div>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Cost Ceiling</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.supernova}}>{fmtDollar(impliedCostCeiling)}</div></div>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Bottom-Up Est.</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.force}}>{bottomUpTotal>0?fmtDollar(bottomUpTotal):'—'}</div></div>
              </div>
              {bottomUpTotal>0&&<div style={{padding:'12px 16px',borderRadius:8,border:`2px solid ${gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight}`,background:(gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight)+'11',textAlign:'center'}}>
                <div style={{fontSize:11,color:B.silver,marginBottom:4}}>Feasibility Gap</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight}}>{gap>=0?'+':''}{fmtDollar(gap)} ({gapPct>=0?'+':''}{gapPct.toFixed(1)}%)</div>
                <div style={{fontSize:11,fontWeight:600,color:gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight,marginTop:4}}>
                  {gap>=0?'✓ Feasible — room within ceiling':gapPct>-10?'⚠ Tight — cost optimization needed':'✕ Over ceiling — significant gap'}
                </div>
              </div>}
            </>}
          </div>
        </>}
      </div>

      {/* Right Column */}
      <div>
        {/* Competitor Estimates */}
        <div style={S.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={S.hdg}>Competitor Price Estimates</div>
            <button style={{...S.btn(B.force),padding:'4px 12px',fontSize:11}} onClick={addComp}>+ Add</button>
          </div>
          {(ptw.compEstimates||[]).length===0?<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:16}}>Link competitor pricing estimates.</div>:
          (ptw.compEstimates||[]).map(c=>{
            const gc=globalCompetitors.find(g=>g.id===c.globalCompId);
            return <div key={c.id} style={{background:'#1A1A32',borderRadius:8,padding:'10px 12px',marginBottom:8,border:`1px solid ${B.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <select style={{...S.inp,width:180,fontSize:11,padding:'4px 7px'}} value={c.globalCompId||''} onChange={e=>{const g=globalCompetitors.find(x=>x.id===e.target.value);updComp(c.id,'globalCompId',e.target.value);if(g)updComp(c.id,'name',g.name);}}>
                  <option value="">Select Competitor…</option>
                  {globalCompetitors.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <button onClick={()=>delComp(c.id)} style={{background:'none',border:'none',color:B.twilight,cursor:'pointer',fontSize:12}}>✕</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
                <div><span style={S.lbl}>Est. Low</span><TCVInput value={c.estimateLow} onChange={v=>updComp(c.id,'estimateLow',v)} placeholder="$40M"/></div>
                <div><span style={S.lbl}>Est. High</span><TCVInput value={c.estimateHigh} onChange={v=>updComp(c.id,'estimateHigh',v)} placeholder="$55M"/></div>
              </div>
              <div><span style={S.lbl}>Basis</span><input style={{...S.inp,fontSize:11,padding:'4px 7px'}} value={c.basis||''} onChange={e=>updComp(c.id,'basis',e.target.value)} placeholder="Source: prior award, FPDS, intel…"/></div>
            </div>;
          })}
        </div>

        {/* Positioning Chart */}
        <div style={S.card}>
          <div style={S.hdg}>PTW Positioning</div>
          {chartMax>1?<svg viewBox="0 0 400 180" style={{width:'100%',height:180}}>
            {/* IGCE */}
            {igceVal>0&&<><rect x={50} y={10} width={Math.max(2,(igceVal/chartMax)*320)} height={22} fill={B.silver} rx={4} opacity={.5}/>
            <text x={46} y={24} textAnchor="end" fill={B.silver} fontSize="9" fontFamily="'DM Sans'">IGCE</text>
            <text x={54+(igceVal/chartMax)*320} y={24} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(igceVal)}</text></>}
            {/* Bottom-Up */}
            {bottomUpTotal>0&&<><rect x={50} y={40} width={Math.max(2,(bottomUpTotal/chartMax)*320)} height={22} fill={B.force} rx={4}/>
            <text x={46} y={54} textAnchor="end" fill={B.force} fontSize="9" fontFamily="'DM Sans'">Ours</text>
            <text x={54+(bottomUpTotal/chartMax)*320} y={54} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(bottomUpTotal)}</text></>}
            {/* Top-Down Ceiling */}
            {impliedCostCeiling>0&&<><rect x={50} y={70} width={Math.max(2,(impliedCostCeiling/chartMax)*320)} height={22} fill={B.supernova} rx={4} opacity={.6}/>
            <text x={46} y={84} textAnchor="end" fill={B.supernova} fontSize="9" fontFamily="'DM Sans'">TD Ceil</text>
            <text x={54+(impliedCostCeiling/chartMax)*320} y={84} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(impliedCostCeiling)}</text></>}
            {/* Competitor estimates */}
            {comps.map((c,i)=>{const lo=parseTCVNum(c.estimateLow)*1e6;const hi=parseTCVNum(c.estimateHigh)*1e6;const y2=100+i*28;const name=c.name||globalCompetitors.find(g=>g.id===c.globalCompId)?.name||'Comp';
              return <g key={c.id}><rect x={50+(lo/chartMax)*320} y={y2} width={Math.max(4,((hi-lo)/chartMax)*320)} height={18} fill={B.twilight} rx={3} opacity={.65}/>
              <text x={46} y={y2+13} textAnchor="end" fill={B.twilight} fontSize="8" fontFamily="'DM Sans'">{name.slice(0,12)}</text>
              <text x={54+((hi)/chartMax)*320} y={y2+13} fill="#D0D0E8" fontSize="8" fontFamily="'JetBrains Mono'">{fmtDollar(lo)}–{fmtDollar(hi)}</text></g>;})}
          </svg>:<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:20}}>Enter pricing data to see positioning chart.</div>}
        </div>

        {/* Strategy & Notes */}
        <div style={S.card}>
          <div style={S.hdg}>PTW Rationale</div>
          <textarea style={{...ta,minHeight:100}} value={ptw.notes||''} onChange={e=>upd({notes:e.target.value})} placeholder="Pricing strategy rationale, win themes alignment, risk considerations…"/>
        </div>
      </div>
    </div>
  </div>;
}

const GLOBAL_VIEWS=['portfolio','pastperfs','proofpoints','docgen','competitors','blackhats','analytics','search'];
const OPP_NAV=[
  {id:'dashboard',  label:'Dashboard',    icon:'◈'},
  {id:'setup',      label:'Opportunity',  icon:'✎'},
  {id:'pwinerator', label:'PWinerator 2.0',icon:'⚡'},
  {id:'competitive',label:'Competitive',  icon:'⚔'},
  {id:'customer',   label:'Customer Map', icon:'👥'},
  {id:'teaming',    label:'Teaming',      icon:'🤝'},
  {id:'solutioning',label:'Solutioning',  icon:'⚙'},
  {id:'winthemes',  label:'Win Themes',   icon:'★'},
  {id:'ptw',        label:'Price to Win', icon:'$'},
  {id:'briefing',   label:'Gate Briefing',icon:'📋'},
  {id:'pastperf',   label:'Past Perf',    icon:'🏆'},
  {id:'documents',  label:'Documents',    icon:'📁'},
  {id:'risks',      label:'Risks',        icon:'⚠'},
  {id:'actions',    label:'Actions',      icon:'✓'},
];

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
