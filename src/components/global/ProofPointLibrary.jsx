import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { DOC_TYPES, PP_CATEGORIES } from "../../config/methodology";
import { callClaude } from "../../lib/ai";
import { PROMPTS } from "../../config/prompts";
import { ConfirmModal, FileList, PastPerfPicker, TagEditor, badge } from "../ui";

export function ProofPointLibrary({proofPoints,setProofPoints,pastPerfs,fileStore,addFiles,removeFile,toast}){
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
