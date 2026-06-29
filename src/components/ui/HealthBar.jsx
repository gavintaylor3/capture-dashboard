import { B } from "../../config/theme";

export function HealthBar({label,value,max=5,color}){
  const pct=Math.min((value/max)*100,100);
  const c=color||(pct>=60?B.refraction:pct>=30?B.supernova:value===0?B.border:B.twilight);
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,marginBottom:4}}>
      <span style={{color:B.silver,fontWeight:600}}>{label}</span>
      <span className="mono" style={{color:c,fontWeight:700}}>{value}/{max}</span>
    </div>
    <div style={{height:4,background:B.border,borderRadius:2,overflow:'hidden'}}>
      <div style={{height:'100%',width:`${pct}%`,background:c,borderRadius:2,transition:'width .6s ease',boxShadow:pct>0?`0 0 6px ${c}66`:''}}/>
    </div>
  </div>;
}
