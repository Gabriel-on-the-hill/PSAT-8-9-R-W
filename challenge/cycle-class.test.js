'use strict';
// cycle-class.test.js — the Session Plan Standard route (challenge/cycle-class.js).
//   node challenge/cycle-class.test.js
// Drives the real index.html scripts in jsdom against every account whose latest
// challenge set carries learningPath.cycles.
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const APP=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(APP,f),'utf8');
const html=read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
let count=0;
function ok(c,m){assert.ok(c,m);count++;}
const SCRIPTS=['config.js','progress.js','sheet-sync.js','session-responses.js','storage.js','timer.js','history.js','data-craft-structure.js','data-expression-of-ideas.js','data-info-ideas.js','data-conventions.js','eliminator.js','app.js','homework/assignments.js','challenge/challenge-core.js','challenge/structured-class.js','challenge/cycle-class.js','challenge/class-path.js','challenge/challenge.js'];
ok(SCRIPTS.filter(f=>f.startsWith('challenge/')||f.startsWith('homework/')).every(f=>read(f.startsWith('homework/')?'homework-hub.html':'index.html').includes('src="'+f+'?v=')),'the pages load every route script this test drives');
async function setup(account,saved){
 const errors=[];
 const dom=new JSDOM(html,{url:'http://localhost/index.html',runScripts:'dangerously',beforeParse(w){w.__posts=[];w.fetch=(u,o)=>{try{w.__posts.push(JSON.parse(o.body));}catch(e){}return Promise.resolve({ok:true});};w.alert=()=>{};w.confirm=()=>true;w.scrollTo=()=>{};w.addEventListener('error',e=>errors.push(e.message));}});
 const w=dom.window,$=id=>w.document.getElementById(id);
 if(saved)Object.entries(saved).forEach(([k,v])=>w.localStorage.setItem(k,v));
 function inject(s){const e=w.document.createElement('script');e.textContent=s;w.document.body.appendChild(e);}
 inject(read('challenge/sets.js'));
 if(!account)account=Object.keys(w.CHALLENGE_SETS).find(n=>w.CHALLENGE_SETS[n].at(-1).learningPath?.cycles);
 w.sessionStorage.setItem('psat89_user',account);
 for(const f of SCRIPTS)inject(read(f));
 inject('window.__peek=function(){return {questions:activeQuestions,mode:userMode,timer:countdownRemaining,timerMode:timerMode,bank:questionBank,answers:responses};};window.__expire=function(){countdownRemaining=0;handleTimeUp();};');
 if(w.document.readyState==='loading')await new Promise(r=>w.document.addEventListener('DOMContentLoaded',r));
 const set=w.CHALLENGE_SETS[account].at(-1),p=set.learningPath;
 const bank=id=>w.__peek().bank.find(q=>q.id===id);
 function reason(text){$('ccReason').value=text||'the exact relationship between them';$('ccReason').dispatchEvent(new w.Event('input'));$('ccCommit').click();}
 function choose(i){w.document.querySelector('#ccOptions [data-i="'+i+'"]').click();}
 function answer(ref,wrong){const q=bank(ref.bankId);reason();const right=q.answer.charCodeAt(0)-65;choose(wrong?(right+1)%4:right);$('ccLock').click();}
 function next(){$('ccNext').click();}
 function storage(){const out={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);out[k]=w.localStorage.getItem(k);}return out;}
 function close(){ok(errors.length===0,'no browser runtime errors: '+errors.join('; '));dom.window.close();}
 w.openChallenge();
 return {w,$,p,set,account,bank,reason,choose,answer,next,storage,close};
}
function text(t){return t.$('challengeScreen').textContent;}
async function main(){
 let t=await setup();
 if(!t.account||!t.p){console.log('SKIP — no account has a cycles route.');return;}
 let {w,$,p,set,account}=t;
 // ── Data contract ─────────────────────────────────────────────
 const parts=p.cycles.flatMap(c=>[c].concat(c.alternate?[c.alternate]:[]));
 const ids=parts.flatMap(c=>[c.model.bankId].concat(c.checks.map(q=>q.bankId),(c.reserves||[]).map(q=>q.bankId))).concat(p.transfer);
 ok(ids.every(id=>t.bank(id)),'every route id resolves in the bank');
 ok(new Set(ids).size===ids.length,'models, checks, reserves, alternates and the mixed check never share an item');
 ok(p.cycles.length<=2&&parts.every(c=>c.checks.length===3),'at most two parts, three checks each (Session Plan Standard)');
 ok(p.transfer.length===4&&set.ids.join()===p.transfer.join(),'the mixed check is four items and is the scored list');
 ok(p.protectedTransfer&&p.singleCredit&&p.mixedSeconds>0,'mixed check uses the protected single-credit runner');
 const prior=new Set(w.CHALLENGE_SETS[account].slice(0,-1).flatMap(s=>s.ids));
 ok(set.ids.every(id=>!prior.has(id)),'scored ids preserve earlier challenge denominators');
 // ── Gates before teaching ─────────────────────────────────────
 ok(!$('ccOff')&&!$('ccTimed'),'no mixed check before the first worked example');
 ok($('ccCycle0')&&!$('ccCycle1'),'part 2 waits for part 1');
 $('ccCycle0').click();
 ok($('ccOptions').style.display==='none'&&$('ccLock').style.display==='none','prediction precedes the choices');
 t.reason('x');ok($('ccOptions').style.display==='none'&&$('ccStatus').textContent.includes('at least two words'),'a one-word reason does not open the choices');
 t.answer(p.cycles[0].model);
 ok($('ccFeedback').textContent.includes(t.bank(p.cycles[0].model.bankId)?'Your prediction':'')&&$('ccFeedback').textContent.includes(p.cycles[0].model.explanation.slice(0,30)),'worked example shows its explanation straight after the answer');
 t.next();
 // ── Checks: right / not yet, no explanation until the third ───
 const c0=p.cycles[0].checks;
 t.answer(c0[0]);ok(/Right\./.test($('ccFeedback').textContent)&&!$('ccFeedback').textContent.includes('Your prediction'),'a right check shows Right at once, with no explanation');
 ok(w.document.querySelectorAll('#ccOptions .copt:disabled').length===4,'a locked answer cannot be changed');
 const saved=t.storage();t.close();
 t=await setup(account,saved);({w,$,p}=t);$('ccCycle0').click();
 ok(/Right\./.test($('ccFeedback').textContent)&&$('ccReason').disabled,'reload keeps the locked answer and its verdict');
 t.next();t.answer(c0[1],true);ok(/Not yet\./.test($('ccFeedback').textContent)&&!$('ccFeedback').textContent.includes('Your choice'),'a wrong check shows Not yet, with no explanation or hint');
 t.next();t.answer(c0[2]);t.next();
 ok(text(t).includes('2 of 3 right')&&text(t).includes('name the step')&&text(t).includes('Your prediction'),'after the third: score, the 2/3 routing rule, and every explanation');
 ok($('ccReserve')&&!$('ccSkip'),'2/3 offers a different example but no skip of part 2');
 $('ccReserve').click();t.answer(p.cycles[0].reserves[0]);ok($('ccFeedback').textContent.includes('Your choice'),'the repair example explains straight away');t.next();
 ok(text(t).includes('Different example'),'results list the repair example separately');
 {const post=w.__posts.filter(x=>x.type==='class-route'||x.source==='class-route');ok(post.length>=2&&post.some(x=>x.questions.length===3&&x.questions.every(q=>q.prediction)),'finished checks and repair post class-route rows with the typed predictions');}
 $('ccHome').click();
 ok($('ccOff')&&!$('ccTimed'),'clock-off mixed check is available; the clock is not while part 2 is untaught');
 ok(Object.keys(w.getProgress()).length===0,'worked examples, checks and repairs award no mastery');
 // ── Part 2: tutor chooses the alternate ───────────────────────
 $('ccCycle1').click();
 if(p.cycles[1].alternate){
  ok($('ccMain')&&$('ccAlt'),'a part with an alternate asks the tutor to choose first');$('ccAlt').click();
  ok($('challengeScreen').textContent.includes(t.bank(p.cycles[1].alternate.model.bankId).passage.slice(0,25)),'the alternate part serves its own worked example');
 }
 const part2=p.cycles[1].alternate||p.cycles[1];
 t.answer(part2.model);t.next();part2.checks.forEach(q=>{t.answer(q);t.next();});
 ok(text(t).includes('3 of 3 right'),'three right reads as 3 of 3');$('ccHome').click();
 ok($('ccTimed')&&$('ccTimed').textContent.includes('4 questions, 5 minutes'),'both parts at 2/3 or better offer the timed mixed check');
 $('ccTimed').click();let peek=w.__peek();
 ok(peek.mode==='exam'&&peek.timer===p.mixedSeconds&&peek.questions.map(q=>q.id).join()===p.transfer.join(),'the mixed check runs in the silent exam runner with its exact items and clock');
 w.handleOptionClick(null,peek.questions[0].answer,peek.questions[0]);w.saveSessionState();w.__expire();
 ok($('cReturnToRoute')&&$('cReturnToRoute').textContent==='Return to the class route','completion returns to the route');
 ok(w.getProgress()[p.transfer[0]].correct===1&&!w.getProgress()[p.transfer[1]],'one mixed answer is one credit; unanswered items earn none');
 $('cReturnToRoute').click();ok(!$('ccOff')&&!$('ccTimed')&&text(t).includes('Class route complete'),'a finished mixed check cannot be replayed and the close appears');
 const done=t.storage();t.close();
 t=await setup(account,done);ok(!t.$('ccOff')&&!t.$('ccTimed'),'reload cannot replay the mixed check');t.close();
 // ── 0–1 of 3: repair, skip part 2, no clock ───────────────────
 t=await setup(account);({w,$,p}=t);$('ccCycle0').click();t.answer(p.cycles[0].model);t.next();
 p.cycles[0].checks.forEach((q,i)=>{t.answer(q,i<2);t.next();});
 ok(text(t).includes('1 of 3 right')&&text(t).includes('repair this method'),'0–1 of 3 shows the stop-and-repair rule');
 ok($('ccSkip'),'the tutor can skip part 2 after a failed part 1');$('ccSkip').click();
 ok(!$('ccCycle1')&&text(t).includes('skipped today')&&$('ccOff')&&!$('ccTimed'),'a skipped part keeps the mixed check untimed (untimed before timed)');
 $('ccOff').click();peek=w.__peek();ok(peek.mode==='exam'&&peek.timerMode==='off'&&$('timerDisplay').classList.contains('hidden'),'clock-off mixed check hides the timer');
 t.close();
}
main().then(()=>console.log('ALL '+count+' ASSERTIONS PASSED')).catch(e=>{console.error(e);process.exit(1);});
