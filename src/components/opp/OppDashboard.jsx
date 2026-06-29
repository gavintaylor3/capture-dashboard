import { B, S } from "../../config/theme";
import { cparsColor, fileIcon, fmtTCVDisplay, gateColor, stageColor } from "../../lib/format";
import { Avatar, HealthBar, PWinGauge, badge } from "../ui";

export function OppDashboard({opp,pastPerfs,onNav}){
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
