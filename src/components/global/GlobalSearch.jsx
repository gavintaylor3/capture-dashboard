import { useState } from "react";
import { B, S } from "../../config/theme";
import { fmtTCVDisplay, stageColor, tagColor } from "../../lib/format";
import { badge } from "../ui";

export function GlobalSearch({opps,pastPerfs,proofPoints,globalCompetitors,onOpenOpp}){
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
