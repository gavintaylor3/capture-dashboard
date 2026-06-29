/* ── AI CLIENT ──
   Anthropic Messages API call. Extracted verbatim from App.jsx.
   (Lifted ahead of the PR 4 module moves so every consumer imports one copy —
   operating-rule 4.) */

export async function callClaude(system,user){
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,system,messages:[{role:'user',content:user}]})});
  const d=await r.json();
  return d.content?.[0]?.text||'';
}
