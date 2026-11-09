/* Shared public mentor chat ergonomics: keyboard and transparent source-status; no network calls. */
(()=>{"use strict";
const input=document.getElementById("aurora-message"),send=document.getElementById("aurora-ask"),answer=document.getElementById("aurora-answer");if(!input||!send||!answer)return;
input.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();send.click();}});
const indicator=document.createElement("p");indicator.setAttribute("role","status");indicator.id="aurora-knowledge-source-status";indicator.style.cssText="font:400 16px/1.6 Nunito,Arial,sans-serif;max-width:780px;margin:12px 0;color:inherit;";indicator.textContent="Checking public mentor question bank…";answer.insertAdjacentElement("afterend",indicator);
const mentor=window.AuroraConversation;
if(!mentor?.approved500Ready){indicator.textContent="Legacy public guidance is available; expanded bank status is unverified.";return;}
mentor.approved500Ready.then(()=>{const n=mentor.approved500Count?.()||0;indicator.textContent=n===500?"500 founder-approved public Q&As available · no messages uploaded.":"Using legacy public guidance; expanded Q&A bank unavailable.";}).catch(()=>{indicator.textContent="Using legacy public guidance; expanded Q&A bank unavailable.";});
})();
