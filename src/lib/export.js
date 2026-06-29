/* ── EXPORT UTILITIES ──
   PDF (jsPDF via window.jspdf) and Word/HTML document export.
   Extracted verbatim from App.jsx (PR 4). */

export function exportToPDF(text,title,subtitle,footerNote){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF();
  doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(68,44,129);
  doc.text('ASTRION EDGE™ CAPTURE TOOL',14,12);
  doc.setDrawColor(41,170,225);doc.setLineWidth(0.5);doc.line(14,15,196,15);
  doc.setFontSize(16);doc.setTextColor(30,30,40);doc.text(title||'Document',14,26);
  if(subtitle){doc.setFontSize(10);doc.setTextColor(100,100,120);doc.text(subtitle,14,33);}
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(40,40,50);
  const lines=doc.splitTextToSize(text||'',175);
  let y=subtitle?40:34;
  const pageH=280;
  lines.forEach(line=>{
    if(y>pageH){doc.addPage();y=20;}
    doc.text(line,14,y);y+=5.5;
  });
  if(footerNote){
    if(y>pageH-10){doc.addPage();y=20;}
    y+=4;doc.setDrawColor(200,200,210);doc.line(14,y,196,y);y+=6;
    doc.setFontSize(8);doc.setTextColor(120,120,140);
    doc.splitTextToSize(footerNote,175).forEach(l=>{doc.text(l,14,y);y+=4;});
  }
  const pg=doc.internal.getNumberOfPages();
  for(let i=1;i<=pg;i++){doc.setPage(i);doc.setFontSize(7);doc.setTextColor(150,150,170);doc.text(`Astrion EDGE™ · ${new Date().toLocaleDateString()} · Page ${i}/${pg}`,14,292);}
  doc.save(`${(title||'document').replace(/[^a-zA-Z0-9]/g,'-')}-${new Date().toISOString().slice(0,10)}.pdf`);
}

export function exportToDoc(text,title,subtitle){
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>body{font-family:Verdana,sans-serif;color:#222;padding:20px 40px}h1{color:#442C81;border-bottom:2px solid #29AAE1;padding-bottom:6px;font-size:20px}h2{color:#555;font-size:13px;font-weight:normal;margin-top:-8px}pre{white-space:pre-wrap;font-size:12px;line-height:1.85}footer{margin-top:24px;padding-top:8px;border-top:1px solid #ccc;font-size:10px;color:#888}</style></head><body><h1>${title||'Document'}</h1>${subtitle?'<h2>'+subtitle+'</h2>':''}<pre>${(text||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre><footer>Astrion EDGE™ Capture Tool · ${new Date().toLocaleDateString()}</footer></body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`${(title||'document').replace(/[^a-zA-Z0-9]/g,'-')}-${new Date().toISOString().slice(0,10)}.doc`;a.click();URL.revokeObjectURL(url);
}
