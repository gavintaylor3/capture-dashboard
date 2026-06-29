/* ── FORMATTING HELPERS ──
   Value formatters (TCV, bytes, file icons) + domain→brand-color mappers.
   Extracted from App.jsx (PR 1). */

import { B } from "../config/theme";

/* Domain → brand color */
export const stageColor=g=>({'ID/Qualify':B.silver,'Gate A':B.supernova,'Gate B':B.force,'Gate C':B.sky,'Proposal':B.twilight,'Won':B.refraction,'Lost':'#555','No Bid':'#444'}[g]||B.silver);
export const threatColor=t=>t==='High'?B.twilight:t==='Medium'?B.supernova:B.refraction;
export const priorityC=p=>p==='High'?B.twilight:p==='Medium'?B.supernova:B.silver;
export const gateColor=s=>s==='Complete'?B.refraction:s==='In Progress'?B.supernova:s==='Upcoming'?B.sky:B.border;
export const influenceC=i=>i==='High'?B.twilight:i==='Med'?B.supernova:B.silver;
export const cparsColor=r=>({Exceptional:B.refraction,'Very Good':B.sky,Satisfactory:B.supernova,Marginal:B.twilight,Unsatisfactory:'#555'}[r]||B.silver);
export const tagColor=t=>{const m={'Past Performance':'#B066FF',Pricing:B.supernova,Technical:B.sky,Management:B.force,'Key Personnel':'#FF88AA',Teaming:B.refraction,Incumbency:'#66CCFF',Clearances:'#88FFCC',Certifications:'#FFDD66',SIGINT:B.twilight,ISR:'#FF9966',C2:'#66FF99',Cyber:'#FF6699',Cloud:'#6699FF',DevSecOps:'#99FF66','Agency Relationships':'#CC99FF'};return m[t]||B.silver;};

/* Byte size */
export const fmtBytes=b=>b>1048576?`${(b/1048576).toFixed(1)} MB`:b>1024?`${(b/1024).toFixed(0)} KB`:`${b} B`;

/* TCV Smart Format */
export const parseTCVNum=raw=>{
  if(!raw)return 0;
  const s=String(raw).replace(/[$,\s]/g,'').toUpperCase();
  const n=parseFloat(s);
  if(isNaN(n))return 0;
  if(s.endsWith('B'))return n*1000;
  if(s.endsWith('M'))return n;
  if(s.endsWith('K'))return n/1000;
  return n/1000000; // raw number assumed dollars → convert to M
};
export const fmtTCVDisplay=raw=>{
  if(!raw||raw==='')return '';
  const s=String(raw).replace(/[$,\s]/g,'').toUpperCase();
  const n=parseFloat(s);
  if(isNaN(n))return raw;
  if(s.endsWith('B'))return`$${n}B`;
  if(s.endsWith('M'))return`$${n}M`;
  if(s.endsWith('K'))return`$${n}K`;
  // raw dollar amount
  if(n>=1e9)return`$${(n/1e9).toFixed(n%1e9===0?0:2)}B`;
  if(n>=1e6)return`$${(n/1e6).toFixed(n%1e6===0?0:1)}M`;
  if(n>=1e3)return`$${n.toLocaleString()}`;
  return`$${n}`;
};

/* File icons */
const FILE_ICONS={'application/pdf':'📄','application/msword':'📝','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'📝','application/vnd.ms-excel':'📊','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'📊','application/vnd.ms-powerpoint':'📽','application/vnd.openxmlformats-officedocument.presentationml.presentation':'📽','image/png':'🖼','image/jpeg':'🖼','image/gif':'🖼','image/webp':'🖼','image/svg+xml':'🖼','text/plain':'📃','text/markdown':'📃','text/csv':'📋'};
export const fileIcon=t=>FILE_ICONS[t]||'📁';
export const fileIsImage=t=>t?.startsWith('image/');
