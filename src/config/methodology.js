/* ── METHODOLOGY & TAXONOMIES ──
   Capture lifecycle, gate model, domain taxonomies, and the new-opportunity
   factory (with PTW defaults). Extracted verbatim from App.jsx (PR 2). */

import { B } from "./theme";

export const STAGES=['ID/Qualify','Gate A','Gate B','Gate C','Proposal','Won','Lost','No Bid'];
export const COMP_SIZES=['Large Business','Small Business','SDB','WOSB','SDVOSB','HUBZone','VOSB','8(a)','Other'];
export const CONTRACT_TYPES=['IDIQ/TO','FFP','CPFF','T&M','CPIF','LPTA','BPA','Other'];
export const INTEL_TAGS=['Past Performance','Pricing','Technical','Management','Key Personnel','Teaming','Incumbency','Clearances','Certifications','Agency Relationships'];
export const CPARS=['Exceptional','Very Good','Satisfactory','Marginal','Unsatisfactory'];
export const DOC_TYPES=[
  {id:'rfi',label:'RFI Response',icon:'🔍',color:B.sky},
  {id:'rfp',label:'Proposal (RFP Response)',icon:'📋',color:B.force},
  {id:'whitepaper',label:'White Paper',icon:'📄',color:B.supernova},
  {id:'capstat',label:'Capability Statement',icon:'⭐',color:B.refraction},
  {id:'relevance',label:'Relevance Narrative',icon:'🎯',color:B.twilight},
  {id:'pastperf',label:'Past Performance Volume',icon:'🏆',color:'#B066FF'},
  {id:'sources',label:'Sources Sought Response',icon:'📡',color:'#66CCFF'},
];
export const PP_CATEGORIES=['Technical','Management','Cost/Pricing','Past Performance','Innovation','Workforce','Security','Cybersecurity','Logistics','C2/SIGINT','ISR','Other'];
export const OPP_DOC_CATEGORIES=['RFP/Solicitation','Amendment','Q&A / Industry Day','SOW / PWS','Market Research / Intel','Solutioning Docs','Pricing / Finance','Past Performance','Proposal Artifacts','Other'];

export const makeGates=()=>[
  {id:'A',label:'Gate A',date:'',status:'Pending'},
  {id:'BT',label:'Blue Team',date:'',status:'Pending'},
  {id:'B',label:'Gate B',date:'',status:'Pending'},
  {id:'BH',label:'Black Hat',date:'',status:'Pending'},
  {id:'PTW',label:'PTW Initial',date:'',status:'Pending'},
  {id:'BU',label:'Gate B Update',date:'',status:'Pending'},
  {id:'RFP',label:'RFP Expected',date:'',status:'Pending'},
  {id:'C',label:'Gate C',date:'',status:'Pending'},
  {id:'P',label:'Proposal Due',date:'',status:'Pending'},
];
export const blankOpp=o=>({
  id:Date.now(),name:'',govwin:'',tcv:'',rfpDate:'',awardDate:'',startDate:'',incumbent:'',
  stage:'Gate A',agency:'',naics:'',description:'',pWinScore:50,tags:[],
  team:{bd:'',cm:'',jcm:'',sa:'',pm:'',pricing:'',contracts:'',ops:'',gm:''},
  gates:makeGates(),competitors:[],customers:[],partners:[],
  solutioning:[],winThemes:[],risks:[],actions:[],
  linkedPastPerfIds:[],fileIds:[],oppFiles:[],blackHatSessionIds:[],
  ptw:{igce:'',shouldCost:'',bidLow:'',bidHigh:'',strategy:'Competitive',notes:'',
    laborCats:[],compEstimates:[],overheadPct:30,gaPct:8,feePct:10,fringePct:35,
    topDown:{targetPrice:'',requiredMarginPct:10},mode:'bottomUp'},
  ...o,
});
export const ALL_TAGS=['Past Performance','Pricing','Technical','Management','Key Personnel','Teaming','Incumbency','Clearances','Certifications','Agency Relationships','SIGINT','ISR','C2','Cyber','Cloud','DevSecOps'];
