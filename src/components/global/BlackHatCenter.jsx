import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { threatColor } from "../../lib/format";
import { CONTRACT_TYPES } from "../../config/methodology";
import { ConfirmModal, FileList, badge } from "../ui";

export function BlackHatCenter({blackHatSessions,setBlackHatSessions,globalCompetitors,setGlobalCompetitors,opps,setOpps,fileStore,addFiles,removeFile,toast}){
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
