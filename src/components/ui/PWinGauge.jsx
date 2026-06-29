import { B } from "../../config/theme";

export function PWinGauge({value,size=130}){
  const c=value>=60?B.refraction:value>=40?B.supernova:B.twilight;
  const r=48,cx=65,cy=65;
  const circ=2*Math.PI*r; // 301.6
  const offset=circ-(circ*value/100);
  return <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
    <svg width={size} height={size} viewBox="0 0 130 130" style={{transform:'rotate(-90deg)'}}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={B.border} strokeWidth="10"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{transition:'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1),stroke .4s ease',filter:`drop-shadow(0 0 6px ${c}88)`}}
      />
    </svg>
    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div className="mono" style={{fontSize:28,fontWeight:700,color:c,lineHeight:1}}>{value}%</div>
      <div style={{fontSize:9,color:B.silver,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginTop:2}}>P-Win</div>
    </div>
  </div>;
}
