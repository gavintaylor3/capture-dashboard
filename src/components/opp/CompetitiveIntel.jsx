import { useState } from "react";
import { B, S, ta } from "../../config/theme";
import { threatColor } from "../../lib/format";
import { badge } from "../ui";

export function CompetitiveIntel({opp,onChange,globalCompetitors,blackHatSessions,toast}){
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
