'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const APP=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(APP,f),'utf8');
const html=read('index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<link\b[^>]*>/gi,'');
let count=0;
function ok(c,m){assert.ok(c,m);count++;}
async function setup(saved){
 const errors=[];
 const dom=new JSDOM(html,{url:'http://localhost/index.html',runScripts:'dangerously',beforeParse(w){w.__posts=[];w.fetch=(u,o)=>{try{w.__posts.push(JSON.parse(o.body));}catch(e){}return Promise.resolve({ok:true});};w.alert=()=>{};w.confirm=()=>true;w.scrollTo=()=>{};w.addEventListener('error',e=>errors.push(e.message));}});
 const w=dom.window,$=id=>w.document.getElementById(id);
 if(saved)Object.entries(saved).forEach(([k,v])=>w.localStorage.setItem(k,v));
 function inject(s){const e=w.document.createElement('script');e.textContent=s;w.document.body.appendChild(e);}
 inject(read('challenge/sets.js'));
 const accounts=Object.keys(w.CHALLENGE_SETS);
 const account=accounts.find(n=>{const p=w.CHALLENGE_SETS[n].at(-1).learningPath;return p?.protectedTransfer&&p.steps.some(q=>q.followUp);})||accounts.find(n=>w.CHALLENGE_SETS[n].at(-1).learningPath?.protectedTransfer);
 const set=w.CHALLENGE_SETS[account].at(-1),p=set.learningPath;
 w.sessionStorage.setItem('psat89_user',account);
 for(const f of ['config.js','progress.js','sheet-sync.js','session-responses.js','storage.js','timer.js','history.js','data-craft-structure.js','data-expression-of-ideas.js','data-info-ideas.js','data-conventions.js','eliminator.js','app.js','homework/assignments.js','challenge/challenge-core.js','challenge/structured-class.js','challenge/class-path.js','challenge/challenge.js'])inject(read(f));
 inject('window.__peek=function(){return {questions:activeQuestions,mode:userMode,timer:countdownRemaining,timerMode:timerMode,bank:questionBank,answers:responses};};window.__expire=function(){countdownRemaining=0;handleTimeUp();};');
 if(w.document.readyState==='loading')await new Promise(resolve=>w.document.addEventListener('DOMContentLoaded',resolve));
 function reason(){ $('scReason').value='the exact relationship or sentence spine';$('scReason').dispatchEvent(new w.Event('input'));$('scCommit').click(); }
 function choose(index){w.document.querySelector('#scOptions [data-i="'+index+'"]').click();}
 function answer(ref,wrong=false){const q=ref.bankId?w.__peek().bank.find(q=>q.id===ref.bankId):ref;reason();choose(wrong?(q.answer.charCodeAt(0)-64)%4:q.answer.charCodeAt(0)-65);$('scNext').click();}
 function storage(){const out={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);out[k]=w.localStorage.getItem(k);}return out;}
 function close(){ok(errors.length===0,'no browser runtime errors: '+errors.join('; '));dom.window.close();}
 w.openChallenge();
 return {w,$,p,set,account,inject,reason,choose,answer,storage,close};
}
async function main(){
 let t=await setup();let {w,$,p,set,account}=t;
 ok(w.HOMEWORK[account].days.length===0&&w.HOMEWORK[account].classOnly===true,'class clears cards without resetting history keys');
 w.HW_USE_SHEET=true;w.SHEET_SYNC_ENDPOINT='https://example.invalid';let plan;w.hwLoadPlan(account,x=>plan=x);ok(plan===w.HOMEWORK[account],'class-only plan cannot be overridden by old sheet homework');
 const prior=new Set(w.CHALLENGE_SETS[account].slice(0,-1).flatMap(s=>s.ids));
 ok(set.ids.every(id=>!prior.has(id)),'scored class IDs preserve prior challenge denominators');
 const fresh=p.checks.concat(p.transfer.map(bankId=>({bankId})),p.exitChoices).map(q=>q.bankId||q.id);
 ok(new Set(fresh).size===14,'fresh checks, independent and exits do not overlap');
 ok(!$('scOff')&&!$('scTimed'),'no independent set is offered before the four checks');
 $('scLearn').click();ok($('scOptions').style.display==='none'&&$('scNext').style.display==='none','prediction precedes visible choices and Continue');
 for(const value of ['','_____','---','A']){$('scReason').value=value;$('scReason').dispatchEvent(new w.Event('input'));$('scCommit').click();ok($('scOptions').style.display==='none'&&w.document.activeElement===$('scReason')&&$('scStatus').textContent.includes('Write'),'invalid prediction gives guidance without opening choices');}
 $('scReason').value='melodic';$('scCommit').click();
 ok($('scOptions').style.display==='block'&&$('scReason').value==='melodic','a single-word vocabulary prediction commits even without an input event');
 $('scNext').click();ok($('challengeScreen').textContent.includes('Learning step 1')&&$('scStatus').textContent.includes('Choose A')&&w.document.activeElement===w.document.querySelector('#scOptions .copt'),'Continue explains a missing choice and stays on the same question');
 const saved=t.storage();t.close();
 t=await setup(saved);({w,$,p,set}=t);$('scLearn').click();
 ok($('scReason').disabled&&$('scOptions').style.display==='block','reload keeps the first committed prediction');
 const first=w.__peek().bank.find(q=>q.id===p.steps[0].bankId);t.choose(first.answer.charCodeAt(0)-65);$('scNext').click();
 $('scReason').value='helps';$('scCommit').click();ok($('scOptions').style.display==='none'&&$('scStatus').textContent.includes('at least two words'),'grammar requires a deciding reason with visible guidance');
 ok(w.document.querySelectorAll('#scOptions .elim-x').length===4&&w.document.querySelectorAll('#scOptions button').length===4,'route choices carry the cross-out control without adding buttons');
 p.steps.slice(1).forEach(q=>t.answer(q));
 {const post=w.__posts.find(x=>x.type==='class-route'&&/Learning steps/.test(x.focus));
  ok(post&&post.questions.length===p.steps.length,'finished learning steps post a class-route row, one question each');
  ok(post&&post.questions.slice(1).every(q=>q.prediction==='the exact relationship or sentence spine'),'the typed reasons reach the sheet as the prediction');}
 $('scHome').click();$('scGate').click();
 p.checks.forEach(q=>{t.reason();const item=q.bankId?w.__peek().bank.find(x=>x.id===q.bankId):q;t.choose(item.answer.charCodeAt(0)-65);ok(!$('scFeedback').textContent,'readiness feedback withheld before all four');$('scNext').click();});
 ok($('scReasons')&&$('challengeScreen').textContent.includes('Your prediction:'),'answer checks display original reasons for tutor review');
 $('scHome').click();ok(!$('scTimed'),'correct answers alone cannot enable the clock');ok($('scOff'),'clock-off independent set is offered once the four checks are done');
 $('scGate').click();$('scReasons').click();ok($('scTimed'),'tutor reason review enables seven-minute option');
 ok(Object.keys(w.getProgress()).length===0,'retrieval, repair and readiness checks award no mastery');
 const met=w.getExposure();
 ok(p.steps.concat(p.checks).every(q=>met[q.bankId||q.id]&&met[q.bankId||q.id].by.class&&met[q.bankId||q.id].by.class.result==='correct'),'every committed step and check is recorded as met, with its result, outside the ledger');
 $('scTimed').click();let peek=w.__peek();
 ok(peek.mode==='exam'&&peek.timer===420&&peek.questions.map(q=>q.id).join()===p.transfer.join(),'actual runner uses exact six and seven minutes');
 ok(!$('timerDisplay').classList.contains('hidden'),'ready transfer shows countdown');
 w.handleOptionClick(null,peek.questions[0].answer,peek.questions[0]);w.saveSessionState();w.goToHub();w.openChallenge();$('scResume').click();
 ok(w.__peek().answers[0].chosen===peek.questions[0].answer,'route resume preserves independent answer');
 ok($('app').style.display!=='none'&&$('challengeScreen').style.display==='none','route resume reopens the real question screen');
 $('modeSelect').value='assisted';$('modeSelect').dispatchEvent(new w.Event('change'));
 ok(w.__peek().mode==='exam'&&!$('feedbackContainer').classList.contains('visible'),'resume keeps no-hint mode and withholds feedback');
 w.__expire();ok($('cReturnToRoute'),'countdown expiry offers tutor review');
 ok(w.getProgress()[p.transfer[0]].correct===1,'one class answer is one credit, not instant exam mastery');
 ok(!w.getProgress()[p.transfer[1]],'unanswered items grant no answer credit');
 $('cReturnToRoute').click();ok($('scExit')&&!$('scTimed')&&!$('scOff'),'completed transfer has no immediate replay');
 $('scExit').click();const boxes=w.document.querySelectorAll('.scExitChoice');boxes[0].click();ok($('scBeginExits').disabled,'one exit cannot start');boxes[2].click();$('scBeginExits').click();
 t.answer(p.exitChoices[0]);ok(!$('scFeedback').textContent,'first exit receives no feedback before second commitment');t.answer(p.exitChoices[2]);$('scHome').click();
 ok($('challengeScreen').textContent.includes('Homework is decided after class'),'finish has no preassigned homework');
 const completed=t.storage();t.close();
 t=await setup(completed);ok(t.$('scExit')&&!t.$('scOff'),'reload cannot replay completed independent set');t.close();
 t=await setup();({w,$,p}=t);$('scLearn').click();p.steps.forEach(q=>t.answer(q));$('scHome').click();$('scGate').click();p.checks.forEach((q,i)=>t.answer(q,i===0));
 ok(!$('scReasons')&&$('challengeScreen').textContent.includes('Keep the clock off'),'failed check retains clock-off decision');$('scHome').click();
 ok($('scOff')&&!$('scTimed'),'failed readiness still preserves independent block');$('scOff').click();peek=w.__peek();
 ok(peek.mode==='exam'&&peek.timerMode==='off'&&$('timerDisplay').classList.contains('hidden'),'unready transfer runs silently without visible clock');
 w.applyTimerState();ok($('timerDisplay').classList.contains('hidden'),'timer remains hidden after mode refresh');
 w.skipQuestion();w.handleOptionClick(null,peek.questions[1].answer,peek.questions[1]);w.saveSessionState();const partial=t.storage();t.close();
 t=await setup(partial);({w,$,p}=t);$('scResume').click();
 ok(w.__peek().answers[1].chosen===peek.questions[1].answer&&$('timerDisplay').classList.contains('hidden'),'full reload resumes clock-off independent conditions');
 ok($('app').style.display!=='none','full reload resume displays questions');w.finalizeSession();$('cReturnToRoute').click();
 w.StructuredClass=undefined;w.openChallenge();ok($('challengeScreen').textContent.includes('did not load')&&!$('cBeginBtn'),'missing structured script fails closed');t.close();
 t=await setup();({w,$,p,set}=t);$('scLearn').click();t.answer(p.steps[0]);
 const q=w.__peek().bank.find(q=>q.id===p.steps[1].bankId);t.reason();t.choose((q.answer.charCodeAt(0)-64)%4);$('scNext').click();
 ok($('challengeScreen').textContent.includes('Different example'),'a teaching miss requires a different example before advancing');
 const repairSave=t.storage();t.close();t=await setup(repairSave);({w,$,p,set}=t);$('scLearn').click();
 ok($('challengeScreen').textContent.includes(p.steps[1].followUp.passage),'reload retains pending different-example repair');
 t.answer(p.steps[1].followUp);ok($('challengeScreen').textContent.includes('Learning step 3'),'repair returns to the next planned step');
 const routeRecord=JSON.parse(w.localStorage.getItem('psat89_classroute_'+t.account+'_'+set.setId));
 ok(routeRecord.lesson.answers[1]!==q.answer.charCodeAt(0)-65,'successful repair does not rewrite the original miss');t.close();
 t=await setup();({w,$,p}=t);$('scLearn').click();p.steps.slice(0,-1).forEach(q=>t.answer(q));
 ok($('challengeScreen').querySelector('u'),'the exact underlined sentence renders as underlined text');t.close();
 console.log('ALL '+count+' ASSERTIONS PASSED');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
