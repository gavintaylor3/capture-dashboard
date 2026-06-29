import { B, S, ta } from "../../config/theme";
import { fmtTCVDisplay, parseTCVNum } from "../../lib/format";
import { TCVInput } from "../ui";

export function PriceToWin({opp,onChange,globalCompetitors,toast}){
  const ptw=opp.ptw||{igce:'',shouldCost:'',bidLow:'',bidHigh:'',strategy:'Competitive',notes:'',laborCats:[],compEstimates:[],overheadPct:30,gaPct:8,feePct:10,fringePct:35,topDown:{targetPrice:'',requiredMarginPct:10},mode:'bottomUp'};
  const upd=u=>onChange({...opp,ptw:{...ptw,...u}});
  const mode=ptw.mode||'bottomUp';

  // Labor cat operations
  const addLabor=()=>upd({laborCats:[...(ptw.laborCats||[]),{id:Date.now(),title:'',level:'',hours:0,rate:0,wrapRate:false}]});
  const updLabor=(id,f,v)=>upd({laborCats:(ptw.laborCats||[]).map(l=>l.id===id?{...l,[f]:v}:l)});
  const delLabor=id=>upd({laborCats:(ptw.laborCats||[]).filter(l=>l.id!==id)});

  // Comp estimate operations
  const addComp=()=>upd({compEstimates:[...(ptw.compEstimates||[]),{id:Date.now(),globalCompId:'',name:'',estimateLow:'',estimateHigh:'',basis:''}]});
  const updComp=(id,f,v)=>upd({compEstimates:(ptw.compEstimates||[]).map(c=>c.id===id?{...c,[f]:v}:c)});
  const delComp=id=>upd({compEstimates:(ptw.compEstimates||[]).filter(c=>c.id!==id)});

  // Calculations
  const laborCats=ptw.laborCats||[];
  const directLabor=laborCats.reduce((a,l)=>{const h=parseFloat(l.hours)||0;const r=parseFloat(l.rate)||0;return a+h*r;},0);
  const fringeCost=directLabor*((ptw.fringePct||35)/100);
  const overheadCost=(directLabor+fringeCost)*((ptw.overheadPct||30)/100);
  const totalDirect=directLabor+fringeCost+overheadCost;
  const gaCost=totalDirect*((ptw.gaPct||8)/100);
  const totalCost=totalDirect+gaCost;
  const fee=totalCost*((ptw.feePct||10)/100);
  const bottomUpTotal=totalCost+fee;

  // Top-down
  const td=ptw.topDown||{targetPrice:'',requiredMarginPct:10};
  const targetVal=parseTCVNum(td.targetPrice)*1e6;
  const marginPct=parseFloat(td.requiredMarginPct)||10;
  const impliedCostCeiling=targetVal>0?targetVal*(1-marginPct/100):0;
  const gap=bottomUpTotal>0?impliedCostCeiling-bottomUpTotal:0;
  const gapPct=bottomUpTotal>0?((gap/bottomUpTotal)*100):0;

  // IGCE val
  const igceVal=parseTCVNum(ptw.igce)*1e6;
  const discountPct=igceVal>0&&bottomUpTotal>0?((1-bottomUpTotal/igceVal)*100).toFixed(1):0;

  // Comp estimates for chart
  const comps=(ptw.compEstimates||[]).filter(c=>c.estimateLow||c.estimateHigh);
  const chartMax=Math.max(bottomUpTotal||1,igceVal||1,impliedCostCeiling||1,...comps.map(c=>Math.max(parseTCVNum(c.estimateHigh)*1e6||0,parseTCVNum(c.estimateLow)*1e6||0)))*1.15;

  const fmtDollar=v=>{if(v>=1e9)return`$${(v/1e9).toFixed(2)}B`;if(v>=1e6)return`$${(v/1e6).toFixed(1)}M`;if(v>=1e3)return`$${(v/1e3).toFixed(0)}K`;return`$${v.toFixed(0)}`;};

  const strategies=['Competitive','LPTA','Best Value','IDIQ/TO'];
  const stColor=s=>s==='LPTA'?B.twilight:s==='Best Value'?B.refraction:s==='IDIQ/TO'?B.sky:B.supernova;

  return <div>
    {/* Header Stats */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:8,marginBottom:14}}>
      {[
        {l:'IGCE',v:fmtTCVDisplay(ptw.igce)||'—',c:B.silver},
        {l:'Should-Cost',v:fmtTCVDisplay(ptw.shouldCost)||'—',c:B.sky},
        {l:'Bid Range',v:(ptw.bidLow||ptw.bidHigh)?`${fmtTCVDisplay(ptw.bidLow)||'?'}–${fmtTCVDisplay(ptw.bidHigh)||'?'}`:'—',c:B.supernova},
        {l:'Discount/IGCE',v:discountPct?discountPct+'%':'—',c:discountPct>10?B.refraction:B.silver},
        {l:'Bottom-Up',v:bottomUpTotal>0?fmtDollar(bottomUpTotal):'—',c:B.force},
        {l:'TD Gap',v:gap!==0?fmtDollar(Math.abs(gap)):'—',c:gap>=0?B.refraction:B.twilight},
      ].map((s,i)=><div key={i} style={{...S.card,marginBottom:0,textAlign:'center'}}><div style={S.lbl}>{s.l}</div><div className="mono" style={{fontSize:15,fontWeight:700,color:s.c}}>{s.v}</div></div>)}
    </div>

    {/* Mode Toggle */}
    <div style={{display:'flex',gap:8,marginBottom:14}}>
      {['bottomUp','topDown'].map(m=><button key={m} onClick={()=>upd({mode:m})} style={{flex:1,padding:'10px',borderRadius:9,border:`2px solid ${mode===m?B.force:B.border}`,background:mode===m?B.force+'22':B.cardBg,color:mode===m?B.sky:'#9090B8',fontWeight:700,fontSize:12,cursor:'pointer',transition:'all .15s',fontFamily:"'DM Sans',sans-serif"}}>{m==='bottomUp'?'⬆ Bottom-Up Build':'⬇ Top-Down Decomposition'}</button>)}
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {/* Left Column */}
      <div>
        {/* Key Inputs */}
        <div style={S.card}>
          <div style={S.hdg}>Key Estimates</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
            <div><span style={S.lbl}>IGCE / Govt Estimate</span><TCVInput value={ptw.igce} onChange={v=>upd({igce:v})}/></div>
            <div><span style={S.lbl}>Our Should-Cost</span><TCVInput value={ptw.shouldCost} onChange={v=>upd({shouldCost:v})}/></div>
            <div><span style={S.lbl}>Bid Range Low</span><TCVInput value={ptw.bidLow} onChange={v=>upd({bidLow:v})}/></div>
            <div><span style={S.lbl}>Bid Range High</span><TCVInput value={ptw.bidHigh} onChange={v=>upd({bidHigh:v})}/></div>
          </div>
          <div><span style={S.lbl}>Bid Strategy</span>
            <div style={{display:'flex',gap:6}}>{strategies.map(s=><button key={s} onClick={()=>upd({strategy:s})} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${ptw.strategy===s?stColor(s):B.border}`,background:ptw.strategy===s?stColor(s)+'22':'transparent',color:ptw.strategy===s?stColor(s):B.silver,fontSize:11,fontWeight:600,cursor:'pointer'}}>{s}</button>)}</div>
          </div>
        </div>

        {mode==='bottomUp'?<>
          {/* Labor Category Builder */}
          <div style={S.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={S.hdg}>Labor Categories</div>
              <button style={{...S.btn(B.force),padding:'4px 12px',fontSize:11}} onClick={addLabor}>+ Add Labor Cat</button>
            </div>
            {laborCats.length===0?<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:16}}>Add labor categories to build your cost estimate.</div>:
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr>{['Title','Level','Hours','Rate ($/hr)','Total',''].map(h=><th key={h} style={S.thd}>{h}</th>)}</tr></thead>
                <tbody>{laborCats.map(l=>{const t=(parseFloat(l.hours)||0)*(parseFloat(l.rate)||0);return<tr key={l.id}>
                  <td style={S.tdc}><input style={{...S.inp,padding:'4px 7px',fontSize:11}} value={l.title||''} onChange={e=>updLabor(l.id,'title',e.target.value)} placeholder="e.g. Sr. Engineer"/></td>
                  <td style={S.tdc}><input style={{...S.inp,padding:'4px 7px',fontSize:11,width:80}} value={l.level||''} onChange={e=>updLabor(l.id,'level',e.target.value)} placeholder="Sr/Mid/Jr"/></td>
                  <td style={S.tdc}><input className="mono" type="number" style={{...S.inp,padding:'4px 7px',fontSize:11,width:70,color:B.sky}} value={l.hours||''} onChange={e=>updLabor(l.id,'hours',e.target.value)}/></td>
                  <td style={S.tdc}><input className="mono" type="number" style={{...S.inp,padding:'4px 7px',fontSize:11,width:80,color:B.supernova}} value={l.rate||''} onChange={e=>updLabor(l.id,'rate',e.target.value)}/></td>
                  <td style={{...S.tdc,fontFamily:"'JetBrains Mono'",fontWeight:700,color:B.refraction}}>{fmtDollar(t)}</td>
                  <td style={S.tdc}><button onClick={()=>delLabor(l.id)} style={{background:'none',border:'none',color:B.twilight,cursor:'pointer',fontSize:12}}>✕</button></td>
                </tr>})}</tbody>
              </table>
            </div>}
          </div>

          {/* Cost Rollup */}
          <div style={S.card}>
            <div style={S.hdg}>Cost Rollup</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr auto',gap:'6px 12px',alignItems:'center',fontSize:12}}>
              {[
                ['Direct Labor',directLabor,null,null],
                ['Fringe',fringeCost,'fringePct',ptw.fringePct||35],
                ['Overhead',overheadCost,'overheadPct',ptw.overheadPct||30],
                ['G&A',gaCost,'gaPct',ptw.gaPct||8],
                ['Fee/Profit',fee,'feePct',ptw.feePct||10],
              ].map(([label,val,key,pct])=><React.Fragment key={label}>
                <div style={{color:B.silver,fontWeight:600}}>{label}</div>
                <div className="mono" style={{color:B.sky,fontWeight:700,textAlign:'right'}}>{fmtDollar(val)}</div>
                <div>{key?<input className="mono" type="number" style={{...S.inp,padding:'3px 6px',fontSize:11,width:60,color:B.supernova}} value={pct} onChange={e=>upd({[key]:parseFloat(e.target.value)||0})}/>:<span/>}</div>
                <div style={{color:B.silver,fontSize:10}}>{key?'%':''}</div>
              </React.Fragment>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',borderTop:`2px solid ${B.force}`,marginTop:10,paddingTop:10}}>
              <span style={{fontSize:14,fontWeight:700,color:'#F0F0FF'}}>Total Price</span>
              <span className="mono" style={{fontSize:18,fontWeight:700,color:B.refraction}}>{fmtDollar(bottomUpTotal)}</span>
            </div>
          </div>
        </>:<>
          {/* Top-Down Mode */}
          <div style={S.card}>
            <div style={S.hdg}>Top-Down Decomposition</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              <div><span style={S.lbl}>Target Price</span><TCVInput value={td.targetPrice} onChange={v=>upd({topDown:{...td,targetPrice:v}})}/></div>
              <div><span style={S.lbl}>Required Margin %</span><input className="mono" type="number" style={{...S.inp,color:B.supernova,fontWeight:700}} value={td.requiredMarginPct} onChange={e=>upd({topDown:{...td,requiredMarginPct:e.target.value}})}/></div>
            </div>
            {targetVal>0&&<>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Target</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.sky}}>{fmtDollar(targetVal)}</div></div>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Cost Ceiling</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.supernova}}>{fmtDollar(impliedCostCeiling)}</div></div>
                <div style={{textAlign:'center'}}><div style={S.lbl}>Bottom-Up Est.</div><div className="mono" style={{fontSize:15,fontWeight:700,color:B.force}}>{bottomUpTotal>0?fmtDollar(bottomUpTotal):'—'}</div></div>
              </div>
              {bottomUpTotal>0&&<div style={{padding:'12px 16px',borderRadius:8,border:`2px solid ${gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight}`,background:(gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight)+'11',textAlign:'center'}}>
                <div style={{fontSize:11,color:B.silver,marginBottom:4}}>Feasibility Gap</div>
                <div className="mono" style={{fontSize:22,fontWeight:700,color:gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight}}>{gap>=0?'+':''}{fmtDollar(gap)} ({gapPct>=0?'+':''}{gapPct.toFixed(1)}%)</div>
                <div style={{fontSize:11,fontWeight:600,color:gap>=0?B.refraction:gapPct>-10?B.supernova:B.twilight,marginTop:4}}>
                  {gap>=0?'✓ Feasible — room within ceiling':gapPct>-10?'⚠ Tight — cost optimization needed':'✕ Over ceiling — significant gap'}
                </div>
              </div>}
            </>}
          </div>
        </>}
      </div>

      {/* Right Column */}
      <div>
        {/* Competitor Estimates */}
        <div style={S.card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <div style={S.hdg}>Competitor Price Estimates</div>
            <button style={{...S.btn(B.force),padding:'4px 12px',fontSize:11}} onClick={addComp}>+ Add</button>
          </div>
          {(ptw.compEstimates||[]).length===0?<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:16}}>Link competitor pricing estimates.</div>:
          (ptw.compEstimates||[]).map(c=>{
            const gc=globalCompetitors.find(g=>g.id===c.globalCompId);
            return <div key={c.id} style={{background:'#1A1A32',borderRadius:8,padding:'10px 12px',marginBottom:8,border:`1px solid ${B.border}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <select style={{...S.inp,width:180,fontSize:11,padding:'4px 7px'}} value={c.globalCompId||''} onChange={e=>{const g=globalCompetitors.find(x=>x.id===e.target.value);updComp(c.id,'globalCompId',e.target.value);if(g)updComp(c.id,'name',g.name);}}>
                  <option value="">Select Competitor…</option>
                  {globalCompetitors.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <button onClick={()=>delComp(c.id)} style={{background:'none',border:'none',color:B.twilight,cursor:'pointer',fontSize:12}}>✕</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
                <div><span style={S.lbl}>Est. Low</span><TCVInput value={c.estimateLow} onChange={v=>updComp(c.id,'estimateLow',v)} placeholder="$40M"/></div>
                <div><span style={S.lbl}>Est. High</span><TCVInput value={c.estimateHigh} onChange={v=>updComp(c.id,'estimateHigh',v)} placeholder="$55M"/></div>
              </div>
              <div><span style={S.lbl}>Basis</span><input style={{...S.inp,fontSize:11,padding:'4px 7px'}} value={c.basis||''} onChange={e=>updComp(c.id,'basis',e.target.value)} placeholder="Source: prior award, FPDS, intel…"/></div>
            </div>;
          })}
        </div>

        {/* Positioning Chart */}
        <div style={S.card}>
          <div style={S.hdg}>PTW Positioning</div>
          {chartMax>1?<svg viewBox="0 0 400 180" style={{width:'100%',height:180}}>
            {/* IGCE */}
            {igceVal>0&&<><rect x={50} y={10} width={Math.max(2,(igceVal/chartMax)*320)} height={22} fill={B.silver} rx={4} opacity={.5}/>
            <text x={46} y={24} textAnchor="end" fill={B.silver} fontSize="9" fontFamily="'DM Sans'">IGCE</text>
            <text x={54+(igceVal/chartMax)*320} y={24} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(igceVal)}</text></>}
            {/* Bottom-Up */}
            {bottomUpTotal>0&&<><rect x={50} y={40} width={Math.max(2,(bottomUpTotal/chartMax)*320)} height={22} fill={B.force} rx={4}/>
            <text x={46} y={54} textAnchor="end" fill={B.force} fontSize="9" fontFamily="'DM Sans'">Ours</text>
            <text x={54+(bottomUpTotal/chartMax)*320} y={54} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(bottomUpTotal)}</text></>}
            {/* Top-Down Ceiling */}
            {impliedCostCeiling>0&&<><rect x={50} y={70} width={Math.max(2,(impliedCostCeiling/chartMax)*320)} height={22} fill={B.supernova} rx={4} opacity={.6}/>
            <text x={46} y={84} textAnchor="end" fill={B.supernova} fontSize="9" fontFamily="'DM Sans'">TD Ceil</text>
            <text x={54+(impliedCostCeiling/chartMax)*320} y={84} fill="#E0E0F0" fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{fmtDollar(impliedCostCeiling)}</text></>}
            {/* Competitor estimates */}
            {comps.map((c,i)=>{const lo=parseTCVNum(c.estimateLow)*1e6;const hi=parseTCVNum(c.estimateHigh)*1e6;const y2=100+i*28;const name=c.name||globalCompetitors.find(g=>g.id===c.globalCompId)?.name||'Comp';
              return <g key={c.id}><rect x={50+(lo/chartMax)*320} y={y2} width={Math.max(4,((hi-lo)/chartMax)*320)} height={18} fill={B.twilight} rx={3} opacity={.65}/>
              <text x={46} y={y2+13} textAnchor="end" fill={B.twilight} fontSize="8" fontFamily="'DM Sans'">{name.slice(0,12)}</text>
              <text x={54+((hi)/chartMax)*320} y={y2+13} fill="#D0D0E8" fontSize="8" fontFamily="'JetBrains Mono'">{fmtDollar(lo)}–{fmtDollar(hi)}</text></g>;})}
          </svg>:<div style={{color:B.silver,fontSize:12,textAlign:'center',padding:20}}>Enter pricing data to see positioning chart.</div>}
        </div>

        {/* Strategy & Notes */}
        <div style={S.card}>
          <div style={S.hdg}>PTW Rationale</div>
          <textarea style={{...ta,minHeight:100}} value={ptw.notes||''} onChange={e=>upd({notes:e.target.value})} placeholder="Pricing strategy rationale, win themes alignment, risk considerations…"/>
        </div>
      </div>
    </div>
  </div>;
}
