/* ── BRAND TOKENS ──
   Single source of truth for the EDGE™ palette + shared style primitives.
   Extracted from App.jsx (PR 1). */

export const B={
  force:'#442C81',sky:'#29AAE1',refraction:'#1ED872',
  supernova:'#FFAF2E',twilight:'#FC5442',silver:'#9090B8',
  darkBg:'#0C0C18',cardBg:'#14142A',sidebarBg:'#0A0A16',
  border:'#252545',borderL:'#1C1C38',
};

export const S={
  card:{background:B.cardBg,border:`1px solid ${B.border}`,borderRadius:10,padding:'16px 20px',marginBottom:12},
  lbl:{fontSize:10,color:B.silver,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4,display:'block'},
  hdg:{fontSize:13,fontWeight:700,color:B.sky,marginBottom:12,marginTop:0},
  inp:{background:'#1E1E38',border:`1px solid ${B.border}`,borderRadius:7,padding:'7px 11px',color:'#E8E8F0',fontSize:13,width:'100%',outline:'none',boxSizing:'border-box',transition:'border-color .12s'},
  btn:c=>({background:c,border:'none',borderRadius:7,padding:'7px 16px',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}),
  thd:{background:B.force,color:'#fff',fontSize:11,fontWeight:700,padding:'8px 10px',textAlign:'left'},
  tdc:{fontSize:12,color:'#D0D0E8',padding:'7px 10px',borderBottom:`1px solid ${B.border}`,verticalAlign:'top'},
};

export const ta={...S.inp,minHeight:68,resize:'vertical',lineHeight:1.65};
