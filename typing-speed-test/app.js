"use strict";
const STORAGE_KEY = "typing-speed-test.arnav.v1";
const TEXTS = [
  "Small habits make the greatest difference over time. A few minutes of steady practice each day can build lasting skill. Focus on the next word, then the next, and let your confidence grow naturally.",
  "The quiet morning offered space to think. Light reached the edge of the desk while the pages waited to be read. A gentle breeze moved through the window, and the work began without hurry.",
  "Good writing is often the result of careful attention. Simple words can carry clear ideas when they are placed with purpose. Read slowly, think deeply, and choose each sentence with care.",
  "Learning something new takes patience. Progress rarely arrives all at once, but every thoughtful attempt makes the next step easier. Stay curious, ask useful questions, and keep going.",
  "A calm mind notices details that a hurried mind might miss. Take your time with each task. When distractions fade, even difficult work can become a little more manageable.",
  "Every journey is shaped by ordinary moments. A short walk, a thoughtful conversation, or a quiet hour of study may change the direction of an entire day.",
  "The best tools make their work feel simple. A clear screen, a steady rhythm, and a comfortable place to sit can help people concentrate on what matters most.",
  "Practice is a form of patience. Accuracy comes before speed, and speed develops when good movements become familiar. Let each word settle before rushing toward the next."
];
const $ = id => document.getElementById(id);
const ui = {input:$("typingInput"),prompt:$("prompt"),surface:$("typingSurface"),hint:$("surfaceHint"),wpm:$("wpm"),accuracy:$("accuracy"),errors:$("errors"),time:$("timeLeft"),progress:$("timeProgress"),state:$("testState"),light:$("indicatorLight"),copy:$("progressCopy"),durations:$("durationButtons"),bestMode:$("bestMode"),bestWpm:$("bestWpm"),bestAccuracy:$("bestAccuracy"),history:$("historyList"),overlay:$("resultOverlay"),dialog:document.querySelector(".result-dialog")};
let saved = load();
let duration = [30,60,120].includes(saved.duration) ? saved.duration : 60;
let passageIndex = Math.floor(Math.random()*TEXTS.length);
let passage = TEXTS[passageIndex];
let running = false, finished = false, startedAt = 0, deadline = 0, remaining = duration, timerId = null, finishedElapsed = 0;
function load(){try{const x=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");return {theme:x.theme==="light"?"light":"dark",duration:x.duration,history:Array.isArray(x.history)?x.history.filter(v=>v&&typeof v.wpm==="number"&&[30,60,120].includes(v.duration)).slice(0,24):[]};}catch{return {theme:"dark",duration:60,history:[]};}}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));}catch{/* Storage may be disabled. */}}
function countCorrect(input){let correct=0;for(let i=0;i<input.length;i++){if(input[i]===passage[i])correct++;}return correct;}
function stats(){const input=ui.input.value;const correct=countCorrect(input);const elapsed=running?Math.max(0.001,(Date.now()-startedAt)/1000):finished?finishedElapsed:0;return {correct,mistakes:input.length-correct,accuracy:input.length?Math.round(correct/input.length*100):100,wpm:elapsed?Math.round(correct/5/elapsed*60):0,typed:input.length};}
function drawPrompt(){const text=ui.input.value;const fragment=document.createDocumentFragment();for(let i=0;i<passage.length;i++){const span=document.createElement("span");span.textContent=passage[i];span.className=i<text.length?(text[i]===passage[i]?"correct":"incorrect"):"pending";if(i===text.length&&!finished)span.classList.add("cursor");fragment.appendChild(span);}ui.prompt.replaceChildren(fragment);ui.copy.textContent=text.length+" / "+passage.length+" characters";ui.hint.classList.toggle("hidden",text.length>0);}
function drawMetrics(){const s=stats();ui.wpm.textContent=String(s.wpm);ui.accuracy.textContent=s.accuracy+"%";ui.errors.textContent=String(s.mistakes);ui.time.innerHTML=String(remaining)+'<span class="unit">s</span>';ui.progress.style.width=(remaining/duration*100)+"%";}
function renderDurations(){ui.durations.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(Number(b.dataset.duration)===duration)));ui.bestMode.textContent=duration+"s";}
function updateHistory(){const best=saved.history.filter(x=>x.duration===duration).sort((a,b)=>b.wpm-a.wpm||b.accuracy-a.accuracy)[0];ui.bestWpm.textContent=best?String(best.wpm):"—";ui.bestAccuracy.textContent=best?best.accuracy+"% accuracy · "+best.date:"Complete a test to set your record.";const items=saved.history.slice(0,3);ui.history.replaceChildren();if(!items.length){const p=document.createElement("p");p.className="empty-state";p.textContent="Your first result will appear here.";ui.history.appendChild(p);return;}for(const item of items){const row=document.createElement("div");row.className="history-row";for(const part of [item.date+" · "+item.duration+"s",String(item.wpm),item.accuracy+"%"]){const cell=document.createElement("span");cell.textContent=part;row.appendChild(cell);}ui.history.appendChild(row);}}
function state(text,mode){ui.state.textContent=text;ui.light.className="indicator-light"+(mode?" "+mode:"");}
function reset(keepFocus=false){if(timerId!==null)clearInterval(timerId);timerId=null;running=false;finished=false;startedAt=0;deadline=0;finishedElapsed=0;remaining=duration;ui.input.disabled=false;ui.input.value="";state("Ready to type","");ui.overlay.classList.remove("open");ui.overlay.setAttribute("aria-hidden","true");drawPrompt();drawMetrics();renderDurations();updateHistory();if(keepFocus)ui.input.focus();}
function timeTick(){if(!running)return;remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));drawMetrics();if(remaining===0)finish("time");}
function begin(){if(running||finished)return;startedAt=Date.now();deadline=startedAt+duration*1000;running=true;state("Typing in progress","running");timerId=setInterval(timeTick,100);}
function finish(reason){if(finished)return;finishedElapsed=running?Math.max(.001,(Date.now()-startedAt)/1000):duration;const s=stats();finished=true;running=false;if(timerId!==null)clearInterval(timerId);timerId=null;if(reason==="time")remaining=0;ui.input.disabled=true;state("Test complete","done");drawPrompt();drawMetrics();const record={wpm:s.wpm,accuracy:s.accuracy,mistakes:s.mistakes,duration,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})};if(s.typed){saved.history.unshift(record);saved.history=saved.history.slice(0,24);persist();}updateHistory();$("resultWpm").textContent=String(s.wpm);$("resultAccuracy").textContent=s.accuracy+"%";$("resultMistakes").textContent=String(s.mistakes);$("resultNote").textContent=s.accuracy>=95?"Excellent accuracy. Keep this steady pace.":"Focus on accuracy before increasing your speed.";previousFocus=document.activeElement;ui.overlay.classList.add("open");ui.overlay.setAttribute("aria-hidden","false");ui.dialog.focus();}
function updateInput(){if(finished)return;let value=ui.input.value.replace(/[\r\n\t]/g," ");if(value.length>passage.length)value=value.slice(0,passage.length);if(value!==ui.input.value)ui.input.value=value;if(!running&&value.length)begin();if(running&&Date.now()>=deadline){timeTick();return;}drawPrompt();drawMetrics();if(value.length===passage.length)finish("complete");}
ui.input.addEventListener("input",updateInput);
ui.input.addEventListener("paste",e=>e.preventDefault());
ui.input.addEventListener("drop",e=>e.preventDefault());
ui.input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();}});
ui.surface.addEventListener("click",()=>{if(!finished)ui.input.focus();});
$("restartButton").addEventListener("click",()=>reset(true));
$("newPassage").addEventListener("click",()=>{const old=passageIndex;passageIndex=(old+1+Math.floor(Math.random()*(TEXTS.length-1)))%TEXTS.length;passage=TEXTS[passageIndex];reset(true);});
ui.durations.addEventListener("click",e=>{const b=e.target.closest("button[data-duration]");if(!b)return;duration=Number(b.dataset.duration);saved.duration=duration;persist();reset();});
function setTheme(theme){saved.theme=theme;document.body.dataset.theme=theme;$("themeButton").setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");persist();}
$("themeButton").addEventListener("click",()=>setTheme(saved.theme==="dark"?"light":"dark"));
$("clearHistory").addEventListener("click",()=>{if(!saved.history.length)return;if(window.confirm("Clear all saved typing results on this device?")){saved.history=[];persist();updateHistory();}});
$("resultClose").addEventListener("click",()=>{ui.overlay.classList.remove("open");ui.overlay.setAttribute("aria-hidden","true");$("restartButton").focus();});
$("resultAgain").addEventListener("click",()=>reset(true));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(ui.overlay.classList.contains("open")){ui.overlay.classList.remove("open");ui.overlay.setAttribute("aria-hidden","true");}reset(true);}});
ui.overlay.addEventListener("keydown",e=>{if(e.key!=="Tab")return;const list=[$("resultClose"),$("resultAgain")];if(e.shiftKey&&document.activeElement===list[0]){e.preventDefault();list[1].focus();}else if(!e.shiftKey&&document.activeElement===list[1]){e.preventDefault();list[0].focus();}});
setTheme(saved.theme);reset();
