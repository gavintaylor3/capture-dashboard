import { useCallback, useState } from "react";
import { Toast } from "./Toast";

export function useToast(){
  const [toasts,setToasts]=useState([]);
  const show=useCallback((msg,type='success')=>setToasts(t=>[...t,{id:Date.now()+Math.random(),msg,type}]),[]);
  const rm=useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  const TC=()=><div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:6}}>
    {toasts.map(t=><Toast key={t.id} message={t.msg} type={t.type} onDone={()=>rm(t.id)}/>)}
  </div>;
  return{show,TC};
}
