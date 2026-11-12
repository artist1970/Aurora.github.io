import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=read("index.html"),code=read("aurora-conversation-v1.js"),voice=read("mentor-chat-voice-v1.js"),federation=read("creative-spark-mentor-qa-v1.js");
const kb=JSON.parse(read("knowledge/question-records.v1.json"));
function boot(){
 const window={CreativeSparkMentorQA:{answer:()=>null,reset:()=>{}}};
 vm.runInNewContext(code,{window,fetch:async()=>({ok:true,json:async()=>kb}),console},{timeout:1500});
 return window;
}
test("Aurora's 18 existing approved Q&As remain intact and drafts stay separate",()=>{
 assert.equal(kb.records.length,18);
 assert.equal(new Set(kb.records.map(x=>x.id)).size,18);
 assert.ok(kb.records.every(x=>x.status==="approved"&&x.response));
 const candidates=JSON.parse(read("knowledge/drafts/wellness-qa-candidates-2026-11.json"));
 assert.equal(candidates.records.length,20);
 assert.ok(candidates.records.every(x=>x.reviewStatus==="draft-public-candidate"&&!x.published));
 assert.doesNotMatch(html,/wellness-qa-candidates-2026-11\.json/);
});
test("exact approved questions work and unrelated topic variants are not blindly substituted",async()=>{
 const w=boot();assert.equal(await w.AuroraConversation.ready,18);
 assert.equal(w.AuroraConversation.respond(kb.records[0].question),kb.records[0].response);
 const r=w.AuroraConversation.respond("Could I invent my own grounding game?");
 assert.notEqual(r,kb.records.find(x=>x.topic==="Grounding").response);
 assert.match(r,/optional practice|reflective question|general background/i);
});
test("crisis, emergency and medical requests always precede generic wellness answers",async()=>{
 const w=boot();await w.AuroraConversation.ready;
 assert.match(w.AuroraConversation.respond("I want to kill myself"),/988/);
 assert.match(w.AuroraConversation.respond("I cannot breathe"),/emergency services/);
 assert.match(w.AuroraConversation.respond("Can you prescribe medication?"),/not diagnosis or treatment/);
 assert.match(w.AuroraConversation.respond("my password is 123"),/do not share passwords/);
});
test("low risk credited educational references cannot override medical or wellness response safety",async()=>{
 const w=boot();await w.AuroraConversation.ready;
 w.CreativeSparkMentorQA.answer=()=>({sourceName:"Eiren",answer:"Consider a metaphor.",topic:"literature"});
 assert.match(w.AuroraConversation.respond("What is a metaphor in literature?"),/From Eiren's approved public educational knowledge/);
 assert.doesNotMatch(w.AuroraConversation.respond("What is medical therapy for anxiety and literature?"),/From Eiren/);
 assert.match(federation,/aurora:"Aurora"/);
 assert.ok(html.indexOf("creative-spark-mentor-qa-v1.js")<html.indexOf("aurora-conversation-v1.js"));
});
test("voice setting persists with manual replay, and never autoplays the initial greeting",()=>{
 assert.match(voice,/vnv\.public\.voice\.autoplay\./);
 assert.match(voice,/autoRead\?"Voice On":"Voice Off"/);
 assert.match(voice,/log\.children\.length>1\)speak\(text\)/);
 assert.match(voice,/Listen to this reply/);
 assert.match(voice,/window\[cfg\.api\]\?\.reset\?\.\(\)/);
 assert.doesNotMatch(code,/localStorage|sessionStorage|indexedDB|XMLHttpRequest/);
});
test("VNV standards use a single shared header, independent hero and sticky chat section",()=>{
 const css=read("styles/aurora-landing-refinement-v1.css");
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
 assert.equal((html.match(/<header\b/g)||[]).length,0);
 assert.match(html,/vnv-header-autopopulate\.js/);
 assert.match(html,/vnv-ticker-autopopulate\.js/);
 assert.match(html,/vnv-333-ticker\.js/);
 assert.match(html,/vnv-ecosystem-toolbar\.js/);
 assert.match(html,/id="aurora-introduction"/);
 assert.match(html,/class="aurora-chat-anchor"/);
 assert.match(css,/\.aurora-chat-anchor\{position:sticky/);
 assert.match(css,/--radius:7px/);
 assert.doesNotMatch(html,/AuroraCore\.html|core_private\.json/);
});
