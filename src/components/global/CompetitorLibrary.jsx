import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { stageColor, threatColor } from "../../lib/format";
import { COMP_SIZES } from "../../config/methodology";
import { ConfirmModal, FileList, TagEditor, badge } from "../ui";

export function CompetitorLibrary({globalCompetitors,setGlobalCompetitors,blackHatSessions,opps,fileStore,addFiles,removeFile,toast}){
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
