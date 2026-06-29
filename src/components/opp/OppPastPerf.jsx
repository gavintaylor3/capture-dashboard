import { B, S } from "../../config/theme";
import { cparsColor } from "../../lib/format";
import { PastPerfPicker, badge } from "../ui";

export function OppPastPerf({opp,onChange,pastPerfs,proofPoints}){
  const linked=pastPerfs.filter(p=>(opp.linkedPastPerfIds||[]).includes(p.id));
  const toggle=id=>onChange({...opp,linkedPastPerfIds:(opp.linkedPastPerfIds||[]).includes(id)?(opp.linkedPastPerfIds||[]).filter(x=>x!==id):[...(opp.linkedPastPerfIds||[]),id]});
  return <div>
    <div style={{...S.card,border:`1px solid ${'#B066FF'}44`,marginBottom:16}}>
      <div style={{fontSize:13,color:'#B066FF',fontWeight:600,marginBottom:4}}>🏆 Link Past Performance Records</div>
      <div style={{fontSize:12,color:B.silver,lineHeight:1.7}}>Link records from the global Past Performance Library. Linked records will be available in Gate Briefings and Document Generator.</div>
    </div>
    <PastPerfPicker pastPerfs={pastPerfs} selectedIds={opp.linkedPastPerfIds||[]} onToggle={toggle} label={`Past Performances (${linked.length} linked)`}/>
    {linked.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:32,fontSize:12,marginTop:8}}>No records linked. Use the picker above to link from your global library.</div>}
    {linked.map(pp=><div key={pp.id} style={{...S.card,borderLeft:`3px solid ${'#B066FF'}`,marginTop:8,animation:'fadeIn .2s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'#E8E8F0',marginBottom:5}}>{pp.name}</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{badge(pp.role,pp.role==='Prime'?B.sky:B.supernova)}{pp.cparRating&&badge(pp.cparRating,cparsColor(pp.cparRating))}{badge(pp.agency||'—',B.silver,true)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className="mono" style={{fontSize:18,fontWeight:700,color:'#B066FF'}}>{pp.value||'—'}</div>
          <div style={{fontSize:10,color:B.silver}}>{pp.periodStart?.slice(0,7)||''}{pp.periodEnd?' – '+pp.periodEnd?.slice(0,7):''}</div>
        </div>
      </div>
      {pp.relevance&&<div style={{background:'#1A1A32',borderRadius:7,padding:'8px 12px',marginBottom:8}}>
        <div style={{...S.lbl,fontSize:9,marginBottom:3}}>Relevance</div>
        <div style={{fontSize:12,color:'#C0C0E0',lineHeight:1.7}}>{pp.relevance}</div>
      </div>}
      {pp.generatedNarrative&&<div style={{background:'#181832',borderRadius:7,padding:'8px 12px',borderLeft:`2px solid ${'#B066FF'}`}}>
        <div style={{...S.lbl,fontSize:9,marginBottom:3}}>Generated Narrative (excerpt)</div>
        <div style={{fontSize:11,color:'#A0A0C8',lineHeight:1.75}}>{pp.generatedNarrative.slice(0,320)}{pp.generatedNarrative.length>320?'…':''}</div>
      </div>}
      <button onClick={()=>toggle(pp.id)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:10,padding:'4px 10px',marginTop:10}}>Unlink</button>
    </div>)}
  </div>;
}
