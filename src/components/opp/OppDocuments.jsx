import { useRef, useState } from "react";
import { B, S } from "../../config/theme";
import { fileIcon, fileIsImage, fmtBytes } from "../../lib/format";
import { OPP_DOC_CATEGORIES } from "../../config/methodology";

export function OppDocuments({opp,onChange,toast}){
  const [drag,setDrag]=useState(false);
  const [filterCat,setFilterCat]=useState('All');
  const [search,setSearch]=useState('');
  const [preview,setPreview]=useState(null);
  const [editNote,setEditNote]=useState(null);
  const ref=useRef();
  const MAX=10*1024*1024;
  const ACCEPT='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg';

  const files=opp.oppFiles||[];
  const filtered=files.filter(f=>{
    const catOk=filterCat==='All'||f.category===filterCat;
    const qOk=!search||(f.name+f.category+(f.notes||'')).toLowerCase().includes(search.toLowerCase());
    return catOk&&qOk;
  });
  const totalSize=files.reduce((a,f)=>a+f.size,0);
  const usedCats=[...new Set(files.map(f=>f.category))];

  const process=rawFiles=>Array.from(rawFiles).forEach(file=>{
    if(file.size>MAX){toast(`${file.name} exceeds 10MB`,'warn');return;}
    const r=new FileReader();
    r.onload=e=>{
      const nf={id:Date.now()+Math.random(),name:file.name,type:file.type,size:file.size,data:e.target.result,uploadedAt:new Date().toISOString(),category:'Other',notes:''};
      onChange({...opp,oppFiles:[...(opp.oppFiles||[]),nf]});
      toast(`${file.name} uploaded`);
    };
    r.readAsDataURL(file);
  });
  const onDrop=e=>{e.preventDefault();setDrag(false);process(e.dataTransfer.files);};
  const updFile=(id,field,val)=>onChange({...opp,oppFiles:files.map(f=>f.id===id?{...f,[field]:val}:f)});
  const delFile=id=>{onChange({...opp,oppFiles:files.filter(f=>f.id!==id)});toast('File removed');};
  const dl=f=>{const a=document.createElement('a');a.href=f.data;a.download=f.name;a.click();};

  return <div>
    {preview&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.92)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2000}} onClick={()=>setPreview(null)}>
      <img src={preview.data} alt={preview.name} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:10,boxShadow:'0 24px 80px rgba(0,0,0,.9)'}}/>
    </div>}

    {/* Stats bar */}
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
      {[{l:'Total Files',v:files.length,c:B.sky},{l:'Total Size',v:fmtBytes(totalSize),c:B.silver},{l:'Categories',v:usedCats.length,c:B.supernova},{l:'Latest Upload',v:files.length?new Date(Math.max(...files.map(f=>new Date(f.uploadedAt)))).toLocaleDateString():'—',c:B.refraction}]
        .map(({l,v,c})=><div key={l} style={S.card}><div style={S.lbl}>{l}</div><div className="mono" style={{fontSize:18,fontWeight:700,color:c}}>{v}</div></div>)}
    </div>

    {/* Upload zone */}
    <div className={`drop-zone${drag?' drag':''}`} style={{marginBottom:14}} onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>ref.current.click()}>
      <input ref={ref} type="file" multiple accept={ACCEPT} style={{display:'none'}} onChange={e=>process(e.target.files)}/>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
        <span style={{fontSize:28}}>📁</span>
        <div style={{textAlign:'left'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#E0E0F0'}}>Drop documents here or click to upload</div>
          <div style={{fontSize:11,color:B.silver,marginTop:2}}>PDF · DOCX · XLSX · PPTX · PNG/JPG · TXT · CSV — max 10 MB per file</div>
        </div>
      </div>
    </div>

    {/* Filters */}
    {files.length>0&&<div style={{display:'flex',gap:10,marginBottom:12,alignItems:'center',flexWrap:'wrap'}}>
      <div style={{position:'relative',flex:'0 0 220px'}}>
        <span style={{position:'absolute',left:9,top:'50%',transform:'translateY(-50%)',fontSize:12,color:B.silver,pointerEvents:'none'}}>🔍</span>
        <input style={{...S.inp,paddingLeft:28,fontSize:12}} placeholder="Search files…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:B.silver,cursor:'pointer',fontSize:12}}>✕</button>}
      </div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
        {['All',...OPP_DOC_CATEGORIES].filter(c=>c==='All'||usedCats.includes(c)).map(c=><button key={c} onClick={()=>setFilterCat(c)} style={{padding:'4px 11px',borderRadius:20,border:`1px solid ${filterCat===c?B.sky:B.border}`,background:filterCat===c?B.sky+'22':'transparent',color:filterCat===c?B.sky:B.silver,fontSize:10,fontWeight:600,cursor:'pointer'}}>{c}</button>)}
      </div>
    </div>}

    {/* File list */}
    {filtered.length===0&&files.length>0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:28,fontSize:12}}>No files match your search.</div>}
    {files.length===0&&<div style={{...S.card,textAlign:'center',color:B.silver,padding:40,fontSize:13}}>
      <div style={{fontSize:32,marginBottom:10}}>📂</div>
      <div style={{fontWeight:600,marginBottom:6,color:'#C0C0E0'}}>Document Vault is empty</div>
      <div style={{fontSize:12}}>Upload RFP documents, past performance files, market research, and more.</div>
    </div>}
    {filtered.length>0&&<div style={{display:'flex',flexDirection:'column',gap:6}}>
      {filtered.map(f=><div key={f.id} style={{...S.card,marginBottom:0,display:'flex',gap:12,alignItems:'flex-start',padding:'12px 16px'}}>
        <div style={{width:40,height:40,borderRadius:8,background:B.border,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{fileIcon(f.type)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4,flexWrap:'wrap'}}>
            <div style={{fontSize:13,fontWeight:600,color:'#E8E8F0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:320}}>{f.name}</div>
            <select style={{...S.inp,width:'auto',padding:'2px 7px',fontSize:10,flexShrink:0}} value={f.category} onChange={e=>updFile(f.id,'category',e.target.value)}>
              {OPP_DOC_CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center',fontSize:10,color:B.silver}}>
            <span className="mono">{fmtBytes(f.size)}</span>
            <span>·</span>
            <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
          </div>
          {editNote===f.id
            ?<input style={{...S.inp,fontSize:11,marginTop:6}} value={f.notes||''} onChange={e=>updFile(f.id,'notes',e.target.value)} onBlur={()=>setEditNote(null)} autoFocus placeholder="Add note…"/>
            :<div style={{fontSize:11,color:B.silver,marginTop:4,cursor:'pointer'}} onClick={()=>setEditNote(f.id)}>{f.notes||<span style={{color:B.border}}>+ Add note</span>}</div>
          }
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          {fileIsImage(f.type)&&<button onClick={()=>setPreview(f)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.sky,fontSize:11,padding:'4px 10px'}}>👁</button>}
          <button onClick={()=>dl(f)} style={{...S.btn('transparent'),border:`1px solid ${B.border}`,color:B.silver,fontSize:11,padding:'4px 10px'}}>↓</button>
          <button onClick={()=>delFile(f.id)} style={{...S.btn('transparent'),border:`1px solid ${B.twilight}44`,color:B.twilight,fontSize:11,padding:'4px 10px'}}>✕</button>
        </div>
      </div>)}
    </div>}
  </div>;
}
