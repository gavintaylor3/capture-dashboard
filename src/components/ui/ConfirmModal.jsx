import { useEffect } from "react";
import { B, S } from "../../config/theme";

export function ConfirmModal({title='Confirm',message,onConfirm,onCancel,confirmLabel='Delete',confirmColor=B.twilight}){
  useEffect(()=>{const h=e=>{if(e.key==='Escape')onCancel();if(e.key==='Enter')onConfirm();};window.addEventListener('keydown',h);return()=>window.removeEventListener('keydown',h)},[]);
  return <div style={{position:'fixed',inset:0,background:'rgba(6,6,16,.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={e=>e.target===e.currentTarget&&onCancel()}>
    <div style={{background:B.cardBg,border:`1px solid ${confirmColor}44`,borderRadius:14,padding:'28px 32px',width:420,animation:'fadeIn .2s ease'}}>
      <div style={{fontSize:16,fontWeight:700,color:'#F0F0FF',marginBottom:10}}>{title}</div>
      <div style={{fontSize:13,color:B.silver,marginBottom:24,lineHeight:1.7}}>{message}</div>
      <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
        <button style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver}} onClick={onCancel}>Cancel</button>
        <button style={S.btn(confirmColor)} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>;
}
