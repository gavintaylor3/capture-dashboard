export const badge=(txt,color,sm)=>(
  <span style={{background:color+'22',color,border:`1px solid ${color}44`,padding:sm?'1px 7px':'3px 9px',borderRadius:5,fontSize:sm?10:11,fontWeight:700,whiteSpace:'nowrap',display:'inline-flex',alignItems:'center',gap:3}}>{txt}</span>
);
