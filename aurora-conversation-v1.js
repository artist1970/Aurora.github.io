/* Aurora public wellness companion v2 · reviewed, optional and nonclinical.
   Session-only contextual guidance. No uploaded conversation or saved health data. */
(function(root){"use strict";
let records=[],state="loading",lastTopic="";
const norm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9' ]/g," ").replace(/\s+/g," ").trim();
const stop=new Set(["what","how","can","please","with","from","the","and","your","some","would","should","could","help","about","have","start","begin","want","this","that"]);
const words=s=>new Set(norm(s).split(" ").filter(w=>w.length>=3&&!stop.has(w)));
const sensitive=/\b(?:password|api key|bank account|credit card|social security|ssn|student record|home address|private record)\b/i;
const crisis=/\b(?:suicide|kill myself|end my life|hurt myself|self harm|self-harm|want to die)\b/i;
const emergency=/\b(?:cannot breathe|can't breathe|cant breathe|overdose|severe bleeding|immediate danger|being attacked|chest pain)\b/i;
const medical=/\b(?:diagnos\w*|prescri\w*|medicat\w*|treatment|cure|symptoms|stop taking|medical condition|therapy for|clinical advice)\b/i;
const topics=[
 ["breathing",["breath","breathing"]],["grounding",["ground","grounding"]],
 ["rest",["rest","sleep","bedtime"]],["meditation",["meditat","meditation"]],
 ["reflection",["reflect","reflection"]],["journaling",["journal","writing prompt"]],
 ["affirmation",["affirm","affirmations"]],["focus",["focus","study"]],
 ["nature",["nature","outdoors"]],["privacy",["privacy"]],
 ["writing",["poetry","writing"]],["community resources",["resource","support directory"]],
 ["music",["music"]],["art",["art","painting"]]
];
const ready=fetch("./knowledge/question-records.v1.json",{cache:"no-store",credentials:"same-origin"}).then(r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(data=>{
 if(!data||data.schema!=="aurora-public-qa-v1"||!Array.isArray(data.records)||data.records.length!==18)throw Error("schema");
 const ids=new Set(),seen=new Set();
 for(const r of data.records){
  if(!r||r.status!=="approved"||typeof r.id!=="string"||ids.has(r.id)||typeof r.question!=="string"||
    seen.has(norm(r.question))||typeof r.response!=="string"||!r.response.trim()||r.response.length>2300||
    typeof r.topic!=="string")throw Error("unapproved-or-malformed");
  ids.add(r.id);seen.add(norm(r.question));
 }
 records=data.records;state="ready";return records.length;
}).catch(()=>{records=[];state="unavailable";return 0});
function reset(){lastTopic="";root.CreativeSparkMentorQA?.reset?.({mentorId:"aurora",scope:"wellness-studio"});}
function lookup(q){
 if(state!=="ready")return null;
 const query=norm(q),qwords=words(query);
 const ranked=records.map(r=>{
  const target=norm(r.question),twords=words(target),common=[...qwords].filter(w=>twords.has(w)).length;
  const cov=common/Math.max(1,qwords.size);
  return {r,score:query===target?100:common>=2&&cov>=.72?Math.round(40+cov*35):0};
 }).sort((a,b)=>b.score-a.score);
 if(!ranked[0]||ranked[0].score<70)return null;
 if(ranked[1]&&ranked[0].score===ranked[1].score)return null;
 return ranked[0].r;
}
function respond(input){
 const raw=String(input||"").trim().slice(0,900),s=norm(raw);
 if(!s)return "You may begin with a word, a question, or a quiet moment.";
 if(crisis.test(raw))return "Your safety matters. Please reach out to a trusted person nearby now. In the United States, call or text 988 for immediate crisis support. If danger is immediate, contact emergency services. Aurora cannot provide emergency care.";
 if(emergency.test(raw))return "This may need urgent help. Please contact emergency services and a trusted person nearby. Do not use a breathing exercise instead of emergency care.";
 if(sensitive.test(raw))return "Please do not share passwords, private information, identity numbers, or personal records in this public wellness chat.";
 if(medical.test(raw))return "I can offer general wellness reflection, not diagnosis or treatment. A qualified healthcare professional can help with medical questions.";
 if(["hi","hello","hey","good morning","good evening"].includes(s))return "Welcome. I am Aurora. Would you prefer a gentle grounding prompt, a quiet reflection, or help preparing for rest?";
 if(["thank you","thanks"].includes(s))return "You're welcome. You're free to stop, skip, shorten, or return whenever you choose.";
 if(/^(tell me more|another idea|what next|continue|go on|something else)[.!? ]*$/.test(s)&&lastTopic)
  return "We were exploring "+lastTopic+". Would a gentler variation, a short reflection, or stopping for now feel better? You may choose.";
 const exact=lookup(raw);
 if(exact){lastTopic=norm(exact.topic);return exact.response;}
 if(/\b(anxious|stressed|overwhelmed|scared|worried|sad|lonely)\b/.test(s))
  return "If comfortable, you might notice one steady detail nearby. You do not need to force calm. Would you prefer a grounding idea or simply a moment to reflect?";
 const topic=topics.find(([_,terms])=>terms.some(t=>s.includes(t)))?.[0];
 if(topic){
  lastTopic=topic;
  const approved=records.find(r=>norm(r.topic)===topic);
  if(approved&&/\b(?:where (?:do|should) i start|how (?:do|can) i (?:start|begin)|first step|beginner)\b/.test(s))return approved.response;
  return "For "+topic+", would you prefer a short, optional practice, a reflective question, or general background? You may skip any part.";
 }
 // Public cross-mentor retrieval is only appropriate for an explicit low-stakes
 // creative or academic question, never wellness/medical/emotional support.
 const educational=/\b(?:poetry|poem|grammar|vocabulary|drawing|painting|art technique|literature|story writing|music theory|study technique)\b/i.test(raw);
 const unsafe=/\b(?:anxiet\w*|depress\w*|stres\w*|panic|trauma|ill|pain|health|medical|medication|emergency|unsafe|self harm|therapy|symptoms|suicide|housing|benefits|financial|legal)\b/i.test(raw);
 if(educational&&!unsafe){
  const ref=root.CreativeSparkMentorQA?.answer(raw,{mentorId:"aurora",scope:"wellness-studio"});
  if(ref)return "From "+ref.sourceName+"'s approved public educational knowledge: "+ref.answer+" (Source: "+ref.sourceName+" · "+ref.topic+".) You may explore it at your own pace.";
 }
 return "Thank you for sharing. Would you like to explore a gentle grounding practice, a reflection question, or rest preparation? You may skip any suggestion.";
}
root.AuroraConversation=Object.freeze({ready,respond,reset,status:()=>state,recordCount:()=>records.length});
})(window);
