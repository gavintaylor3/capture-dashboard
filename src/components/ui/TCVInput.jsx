import { useEffect, useState } from "react";
import { B, S } from "../../config/theme";
import { fmtTCVDisplay } from "../../lib/format";

export function TCVInput({value,onChange,placeholder='e.g. $50M',style={}}){
  const [editing,setEditing]=useState(false);
  const [raw,setRaw]=useState(value||'');
  useEffect(()=>{if(!editing)setRaw(value||'');},[value,editing]);
  const commit=()=>{
    setEditing(false);
    const fmt=fmtTCVDisplay(raw);
    onChange(fmt||raw);
    setRaw(fmt||raw);
  };
  return <input
    className="mono"
    style={{...S.inp,...style,color:B.sky,fontWeight:700,fontSize:14}}
    value={editing?raw:(fmtTCVDisplay(raw)||raw)}
    placeholder={placeholder}
    onFocus={()=>{setEditing(true);setRaw(value||'');}}
    onChange={e=>setRaw(e.target.value)}
    onBlur={commit}
    onKeyDown={e=>e.key==='Enter'&&commit()}
  />;
}
