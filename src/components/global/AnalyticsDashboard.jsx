import { B, S } from "../../config/theme";
import { parseTCVNum, stageColor } from "../../lib/format";
import { STAGES, makeGates } from "../../config/methodology";

export function AnalyticsDashboard({opps,pastPerfs,proofPoints,globalCompetitors}){
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
