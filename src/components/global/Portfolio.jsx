import { useRef, useState } from "react";
import { B, S } from "../../config/theme";
import { fmtTCVDisplay, gateColor, parseTCVNum, stageColor } from "../../lib/format";
import { STAGES } from "../../config/methodology";
import { badge } from "../ui";

export function Portfolio({opps,onSelect,onNew,onExport,onImport,pastPerfs,proofPoints,globalCompetitors,toast}){
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
