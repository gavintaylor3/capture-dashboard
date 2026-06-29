import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { cparsColor } from "../../lib/format";
import { CPARS } from "../../config/methodology";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { exportToDoc, exportToPDF } from "../../lib/export";
import { ConfirmModal, FileList, ProofPointPicker, TagEditor, badge } from "../ui";

export function PastPerfLibrary({pastPerfs,setPastPerfs,proofPoints,fileStore,addFiles,removeFile,toast}){
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
