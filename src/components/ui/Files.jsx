import { useRef, useState } from "react";
import { B, S } from "../../config/theme";
import { fileIcon, fileIsImage, fmtBytes } from "../../lib/format";

export function FileUploader({onUpload,compact,maxMB=10}){
  const [drag,setDrag]=useState(false);
  const ref=useRef();
  const MAX=maxMB*1024*1024;
  const ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg';
  const process=files=>Array.from(files).forEach(file=>{
    if(file.size>MAX){onUpload(null,`${file.name} exceeds ${maxMB}MB limit`);return;}
    const r=new FileReader();
    r.onload=e=>onUpload({id:Date.now()+Math.random(),name:file.name,type:file.type,size:file.size,data:e.target.result,uploadedAt:new Date().toISOString(),category:'Other',notes:''});
    r.readAsDataURL(file);
  });
  const onDrop=e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files);};
  if(compact)return <button style={{...S.btn('transparent'),border:`1px dashed ${B.border}`,color:B.silver,fontSize:11,padding:'5px 12px'}} onClick={()=>ref.current.click()}>
    <input ref={ref} type="file" multiple accept={ACCEPT} style={{display:'none'}} onChange={e=>process(e.target.files)}/>
    📎 Attach
  </button>;
  return <div className={`drop-zone${drag?' drag':''}`} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>ref.current.click()}>
    <input ref={ref} type="file" multiple accept={ACCEPT} style={{display:'none'}} onChange={e=>process(e.target.files)}/>
    <div style={{fontSize:26,marginBottom:6}}>📎</div>
    <div style={{fontSize:12,color:B.silver,fontWeight:500}}>Drop files or click to upload</div>
    <div style={{fontSize:10,color:B.border,marginTop:4}}>PDF · DOCX · XLSX · PPTX · Images · TXT · CSV — max {maxMB}MB each</div>
  </div>;
}

export function FileList({fileIds,fileStore,onRemove,onAdd,compact}){
  const files=(fileIds||[]).map(id=>fileStore[id]).filter(Boolean);
  const [preview,setPreview]=useState(null);
  const dl=f=>{const a=document.createElement('a');a.href=f.data;a.download=f.name;a.click();};
  return <div>
    {onAdd&&<FileUploader compact={compact} onUpload={(f)=>{if(f)onAdd(f);}}/>}
    {files.length>0&&<div style={{marginTop:8,display:'flex',flexDirection:'column',gap:4}}>
      {files.map(f=><div key={f.id} style={{display:'flex',alignItems:'center',gap:8,background:'#1A1A32',borderRadius:7,padding:'6px 10px',border:`1px solid ${B.border}`}}>
        <span style={{fontSize:16}}>{fileIcon(f.type)}</span>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:600,color:'#E0E0F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
          <div style={{fontSize:10,color:B.silver}}>{fmtBytes(f.size)}</div>
        </div>
        {fileIsImage(f.type)&&<button onClick={()=>setPreview(f)} style={{...S.btn('transparent'),border:'none',color:B.sky,fontSize:10,padding:'2px 6px'}}>View</button>}
        <button onClick={()=>dl(f)} style={{...S.btn('transparent'),border:'none',color:B.silver,fontSize:10,padding:'2px 6px'}}>↓</button>
        {onRemove&&<button onClick={()=>onRemove(f.id)} style={{...S.btn('transparent'),border:'none',color:B.twilight,fontSize:10,padding:'2px 6px'}}>✕</button>}
      </div>)}
    </div>}
    {preview&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={()=>setPreview(null)}>
      <img src={preview.data} alt={preview.name} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:10,boxShadow:'0 24px 80px rgba(0,0,0,.9)'}}/>
    </div>}
  </div>;
}
