import { S, ta } from "../../config/theme";
import { gateColor } from "../../lib/format";
import { STAGES } from "../../config/methodology";
import { PWinSlider, TCVInput, TagEditor } from "../ui";

export function OppSetup({opp,onChange}){
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
