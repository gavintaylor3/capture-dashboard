import { B, S } from "../../config/theme";

export function PWinSlider({value,onChange}){
  const c=value>=60?B.refraction:value>=40?B.supernova:B.twilight;
  return <div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:5}}>
      <span style={S.lbl}>P-Win Score</span>
      <span className="mono" style={{fontSize:22,fontWeight:700,color:c}}>{value}%</span>
    </div>
    <input type="range" min={0} max={100} value={value} onChange={e=>onChange(+e.target.value)}/>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:B.silver,marginTop:3}}>
      <span style={{color:B.twilight}}>Low</span><span style={{color:B.supernova}}>Competitive</span><span style={{color:B.refraction}}>Favorable</span>
    </div>
  </div>;
}
