/* Aurora local wellness conversation: no uploads, accounts, or stored chat history. */
(function(global){"use strict";
let records=[],state="loading";
const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const ready=fetch("./knowledge/question-records.v1.json").then(r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(d=>{if(d.schema!=="aurora-public-qa-v1"||!Array.isArray(d.records))throw Error("schema");records=d.records.filter(x=>x.status==="approved"&&typeof x.response==="string");state="ready";return records.length}).catch(()=>{state="unavailable";return 0});
function respond(input){const s=norm(input).slice(0,900);if(!s)return "You may begin with a word, a question, or a quiet moment.";
if(["suicide","kill myself","end my life","hurt myself","self harm"].some(w=>s.includes(w)))return "Your safety matters. Please reach out to a trusted person nearby now. In the United States, call or text 988 for immediate crisis support. If danger is immediate, contact emergency services. Aurora cannot provide emergency care.";
if(["cannot breathe","cant breathe","overdose","severe bleeding","immediate danger"].some(w=>s.includes(w)))return "This may need urgent help. Please contact emergency services and a trusted person nearby. Do not use a breathing exercise instead of emergency care.";
if(["diagnose","prescription","medication","treatment","cure","symptoms"].some(w=>s.includes(w)))return "I can offer general wellness reflection, not diagnosis or treatment. A qualified healthcare professional can help with medical questions.";
if(["hi","hello","hey","good morning","good evening"].includes(s))return "Welcome. I am Aurora. Would you prefer a gentle grounding prompt, a quiet reflection, or help preparing for rest?";
const terms=[["breath","breathing"],["ground","grounding"],["rest","rest"],["sleep","rest"],["meditat","meditation"],["reflect","reflection"],["journal","journaling"],["affirm","affirmation"],["focus","focus"],["study","focus"],["nature","nature"],["privacy","privacy"],["poetry","writing"],["writing","writing"],["resource","community resources"],["music","music"],["art","art"]];
const hit=terms.find(([term])=>s.includes(term));const target=hit?.[1];const item=records.find(r=>norm(r.topic)===target||target&&norm(r.question).includes(target));if(item)return item.response;
if(s.includes("anxious")||s.includes("stressed")||s.includes("overwhelmed"))return "You do not have to solve everything in this moment. If comfortable, notice one thing around you that feels steady. Would you like a grounding prompt or simply a moment to reflect?";
return "Thank you for sharing. Would you like to explore a gentle grounding practice, a reflection question, or rest preparation? You may skip any suggestion.";
}
global.AuroraConversation=Object.freeze({ready,respond,status:()=>state,recordCount:()=>records.length});
})(window);
