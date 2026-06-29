import { B } from "../../config/theme";

export function Avatar({name,role,color}){
  const initials=(name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const c=color||B.force;
  return <div style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0'}}>
    <div style={{width:30,height:30,borderRadius:'50%',background:c+'33',border:`2px solid ${c}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:c,flexShrink:0}}>{initials}</div>
    <div style={{minWidth:0}}>
      <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name||'—'}</div>
      <div style={{fontSize:9,color:B.silver}}>{role}</div>
    </div>
  </div>;
}
