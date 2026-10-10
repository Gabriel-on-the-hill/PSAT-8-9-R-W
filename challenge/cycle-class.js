// Cycle class route — the house Session Plan Standard (10 Oct 2026) as an app route.
//
// Shape: up to two teaching cycles, then a protected mixed check, then the close.
//   cycle   = worked example (student attempts first, explanation straight after)
//           → three silent checks: "Right" / "Not yet" after each answer, no explanation,
//             no hint, until the third answer is in (house rule FS-1 with clean evidence)
//           → results with explanations and the routing rule (3/3, 2/3, 0–1/3)
//           → optional reserve items for repair (explanation straight after)
//   mixed   = path.transfer in the silent exam runner. The clock is offered only when
//             every cycle ran and each scored at least 2/3 today (house rule AS-5:
//             untimed competence before timed). Clock-off is always available once the
//             first worked example is done, so a slow cycle can never cut the mixed check.
//   cycle.alternate = a tutor-chosen replacement cycle (e.g. punctuation instead of
//             reading) picked before the cycle starts; its items stay unseen otherwise.
//
// Class answers earn no mastery credit (only the mixed check counts, one credit each,
// via the existing singleCredit / protectedTransfer runner hooks in challenge.js).
// Each finished block posts one `class-route` Sessions row, like structured-class.js.
(function () {
  'use strict';
  var memory = Object.create(null);
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function button(id,text,disabled) { return '<button type="button" class="cbtn" id="'+id+'"'+(disabled?' disabled':'')+'>'+esc(text)+'</button>'; }
  function wire(id,fn) { if(el(id)) el(id).onclick=fn; }
  function key(ctx) { return 'psat89_cycleroute_'+ctx.student+'_'+ctx.set.setId; }
  function fresh() { return {index:0,reasons:[],answers:[]}; }
  function state(ctx) {
    var k=key(ctx);
    if(memory[k]) return memory[k];
    try { memory[k]=JSON.parse(localStorage.getItem(k)); } catch(e) {}
    return memory[k] || (memory[k]={cycles:{},transferStarted:false,transferDone:false});
  }
  function save(ctx,s) { try { localStorage.setItem(key(ctx),JSON.stringify(s)); } catch(e) {} }
  function postBlock(ctx,qs,block,label) {
    try {
      if(typeof syncSessionToSheet!=='function')return;
      var L='ABCD',rows=qs.map(function(q,i){
        var a=block.answers[i],e=(typeof Eliminator!=='undefined')?Eliminator.report('cycle:'+ctx.student+':'+ctx.set.setId+':'+label,q.id,q.answer):{elim:'',elimAnswer:false};
        return {id:q.id,skill:q.skill,difficulty:q.psatDifficulty||q.difficulty,chosen:(a==null?null:L[a]),correct:q.answer,
          isCorrect:a===q.answerIndex,prediction:block.reasons[i]||'',stage:q.stage||'',elim:e.elim,elimAnswer:e.elimAnswer};
      });
      syncSessionToSheet({source:'class-route',student:ctx.student,focus:ctx.set.setId+' · '+label,
        score:rows.filter(function(r){return r.isCorrect;}).length,total:rows.length,questions:rows});
    } catch(e) {}
  }
  function completeTransfer(ctx) { var s=state(ctx);s.transferStarted=true;s.transferDone=true;save(ctx,s); }

  function render(ctx) {
    var path=ctx.set.learningPath,s=state(ctx);
    function resolve(ref) {
      var q=ref.bankId?ctx.bank.find(function(x){return x.id===ref.bankId;}):ref;
      if(!q || !q.id || !/^[ABCD]$/.test(q.answer) || !Array.isArray(q.options) || q.options.length!==4) throw new Error('Missing class question: '+(ref.bankId||ref.id));
      return Object.assign({},q,ref,{answerIndex:q.answer.charCodeAt(0)-65});
    }
    function plan(c) { return {title:c.title,model:resolve(c.model),checks:c.checks.map(resolve),reserves:(c.reserves||[]).map(resolve)}; }
    var cycles,transfer;
    function paint(body) { ctx.paint(ctx.header()+body+'<div class="crow">'+button('ccHub','Back to hub')+'</div>');wire('ccHub',ctx.back); }
    try {
      cycles=path.cycles.map(function(c){return {id:c.id,main:plan(c),alt:c.alternate?Object.assign(plan(c.alternate),{when:c.alternate.when}):null};});
      transfer=path.transfer.map(function(id){return resolve({bankId:id});});
    } catch(e) { paint('<div class="cbanner">The class question list is incomplete. Ask your tutor to check it before starting.</div>');return; }

    function cs(c) { return s.cycles[c.id] || (s.cycles[c.id]={variant:null,model:fresh(),checks:fresh(),reserve:null}); }
    function active(c) { var x=cs(c); return x.variant==='alt'&&c.alt?c.alt:c.main; }
    function score(c) { var x=cs(c),qs=active(c).checks; return x.checks.answers.filter(function(a,i){return a===qs[i].answerIndex;}).length; }
    function cycleDone(c) { return !!cs(c).checks.done; }
    function modelStarted() { var c=cycles[0]; return !!cs(c).model.done; }
    function clockReady() { return cycles.every(function(c){return cycleDone(c)&&score(c)>=2;}); }
    function rule(n,total) {
      if(n===total) return 'All three correct. Move on to the next part.';
      if(n===total-1) return 'Two of three. With your tutor, name the step that went wrong on the miss, then move on.';
      return 'Stop here and repair this method before anything new. Your tutor shows the step again, then you try a different example.';
    }

    function home() {
      var rows=cycles.map(function(c,i){
        var x=cs(c),p=active(c),label='Part '+(i+1)+' — '+p.title;
        if(x.skipped&&!x.model.done) return '<p class="cnote">'+esc(label)+': skipped today.</p>';
        if(!x.model.done) return (i===0||cycleDone(cycles[i-1])||cs(cycles[i-1]).skipped)?button('ccCycle'+i,label+': start'):'';
        if(!x.checks.done) return button('ccCycle'+i,label+': continue');
        return button('ccCycle'+i,label+': review ('+score(c)+' of '+p.checks.length+')');
      }).join('');
      var mixed='';
      if(!s.transferStarted && modelStarted()) {
        mixed=button('ccOff','When your tutor says: mixed check, no clock')+
          (clockReady()?button('ccTimed','Mixed check: '+transfer.length+' questions, '+Math.round(path.mixedSeconds/60)+' minutes'):'');
      }
      if(s.transferStarted&&!s.transferDone) mixed=button('ccResume','Resume the mixed check');
      paint('<div class="cbox"><p>'+esc(path.intro)+'</p><p>'+esc(path.order)+'</p></div>'+
        '<div class="crow">'+rows+mixed+'</div>'+
        '<p class="cnote">Predict before the choices appear. In each part you try the worked example first, then three questions on your own: you see Right or Not yet straight away, and the explanations come after the third. '+
        (clockReady()||s.transferStarted?'':'The mixed check runs without a clock unless every part ended with at least two of three right. ')+
        'Class answers earn no mastery; only the mixed check counts.</p>'+
        (s.transferDone?'<div class="cmsg"><b>Class route complete.</b> '+esc(path.close)+'</div>':''));
      cycles.forEach(function(c,i){wire('ccCycle'+i,function(){openCycle(c,i);});});
      wire('ccOff',function(){start(false);});wire('ccTimed',function(){start(true);});
      wire('ccResume',function(){if(!ctx.resume())paint('<div class="cmsg">The saved mixed check is unavailable. Ask your tutor before reopening these questions; they are now familiar.</div>'+button('ccHome','Return to route'));wire('ccHome',home);});
    }
    function start(timed) {
      if(s.transferStarted || !modelStarted() || (timed&&!clockReady())) return;
      if(ctx.transfer(transfer,timed?path.mixedSeconds:0)){s.transferStarted=true;s.clock=timed?'countdown':'off';save(ctx,s);}
    }
    function openCycle(c,i) {
      var x=cs(c);
      if(!x.variant && c.alt) {
        paint('<div class="cbox"><b>Part '+(i+1)+': your tutor chooses.</b><p>'+esc(c.alt.when)+'</p></div><div class="crow">'+
          button('ccMain',c.main.title)+button('ccAlt',c.alt.title)+'</div>');
        wire('ccMain',function(){x.variant='main';save(ctx,s);openCycle(c,i);});
        wire('ccAlt',function(){x.variant='alt';save(ctx,s);openCycle(c,i);});
        return;
      }
      if(!x.variant){x.variant='main';save(ctx,s);}
      var p=active(c);
      if(!x.model.done) return run([p.model],x.model,'Part '+(i+1)+' worked example',{immediate:true,heading:'Worked example — you go first'},function(){openCycle(c,i);});
      if(!x.checks.done) return run(p.checks,x.checks,'Part '+(i+1)+' check',{immediate:false,verdict:true,heading:'On your own · notes closed · no hints'},function(){openCycle(c,i);});
      if(x.reserve&&!x.reserve.done) return run(x.reserve.qs.map(function(id){return p.reserves.find(function(q){return q.id===id;});}),x.reserve,'Part '+(i+1)+' different example',{immediate:true,heading:'A different example'},function(){openCycle(c,i);});
      results(c,i);
    }
    function feedback(q,block,i) {
      return '<div class="cexpl"><b>'+esc(q.stage||q.skill)+' — '+(block.answers[i]===q.answerIndex?'right':'not yet')+'</b><p>Your prediction: '+esc(block.reasons[i])+'</p><p>Your choice: '+esc(q.options[block.answers[i]])+'</p><p>'+esc(q.explanation)+'</p></div>';
    }
    function results(c,i) {
      var x=cs(c),p=active(c),n=score(c),used=x.reserve?x.reserve.qs:[];
      var unused=p.reserves.filter(function(q){return used.indexOf(q.id)<0;});
      paint('<div class="cmsg"><b>Part '+(i+1)+' — '+esc(p.title)+': '+n+' of '+p.checks.length+' right.</b> '+esc(rule(n,p.checks.length))+'</div>'+
        p.checks.map(function(q,j){return feedback(q,x.checks,j);}).join('')+
        (x.reserve&&x.reserve.done?'<p class="cnote"><b>Different example</b></p>'+x.reserve.qs.map(function(id,j){return feedback(p.reserves.find(function(q){return q.id===id;}),x.reserve,j);}).join(''):'')+
        '<div class="crow">'+(n<p.checks.length&&unused.length&&!(x.reserve&&!x.reserve.done)?button('ccReserve','Try a different example (repair)'):'')+
        (i<cycles.length-1&&!cycleDone(cycles[i+1])&&!cs(cycles[i+1]).skipped&&n<=1?button('ccSkip','Tutor: skip Part '+(i+2)+' today'):'')+
        button('ccHome','Return to class route')+'</div>');
      wire('ccReserve',function(){x.reserve={qs:[unused[0].id],index:0,reasons:[],answers:[]};save(ctx,s);openCycle(c,i);});
      wire('ccSkip',function(){cs(cycles[i+1]).skipped=true;save(ctx,s);home();});
      wire('ccHome',home);
    }
    function validReason(value,q) {
      var words=value.match(/[A-Za-z][A-Za-z'-]*/g)||[];
      return words.length>=(q.minReasonWords||1) && words.some(function(w){return w.length>1;});
    }
    function passageText(value) { return esc(value).replace(/&lt;(\/?)(u|sub|sup|i|em|b|strong)&gt;/gi,'<$1$2>').replace(/\n/g,'<br>'); }
    function run(qs,block,label,opt,onDone) {
      if(block.done){onDone();return;}
      var i=block.index,q=qs[i],immediate=opt.immediate;
      function advance() {
        block.index++;if(block.index===qs.length){block.done=true;postBlock(ctx,qs,block,label);}
        save(ctx,s);run(qs,block,label,opt,onDone);
      }
      paint('<p class="cnote"><b>'+esc(opt.heading)+'</b> · '+(qs.length>1?'question '+(i+1)+' of '+qs.length:esc(q.stage||q.skill))+'</p>'+
        (immediate&&q.note?'<div class="cbox">'+passageText(q.note)+'</div>':'')+
        (q.image?'<div class="cq"><img src="'+esc(q.image)+'" alt="'+esc(q.alt||'Question figure')+'" style="display:block;max-width:100%;height:auto"></div>':'<div class="cq">'+passageText(q.passage)+'</div>')+
        '<div class="cq"><b>'+esc(q.question)+'</b></div>'+
        '<label for="ccReason">'+esc(q.reasonPrompt||'Predict the answer or the deciding relationship before choosing.')+'</label><textarea id="ccReason" rows="2" aria-describedby="ccStatus" style="width:100%;box-sizing:border-box;font:inherit;padding:.65rem;margin:.5rem 0"></textarea>'+button('ccCommit','Commit the prediction')+
        '<p id="ccStatus" class="cnote" role="status" aria-live="polite"></p><div id="ccOptions" style="display:none">'+q.options.map(function(o,j){return '<button type="button" class="copt" data-i="'+j+'">'+esc(o)+'</button>';}).join('')+'</div>'+
        '<div id="ccFeedback" aria-live="polite"></div><div class="crow">'+button('ccLock','Lock in this answer')+button('ccNext',i===qs.length-1?'Finish':'Next question')+'</div>');
      function locked() { return block.locked===i; }
      function predictionStatus() {
        el('ccStatus').textContent=validReason(el('ccReason').value.trim(),q)?'Prediction ready. Commit it to see the choices.':
          ((q.minReasonWords||1)>1?'Write a short deciding reason of at least two words, then commit it to see the choices.':'Write a predicted word or short phrase, then commit it to see the choices.');
      }
      function refresh() {
        var committed=block.reasons[i]!==undefined, chosen=block.answers[i]!==undefined, done=locked();
        el('ccReason').value=committed?block.reasons[i]:'';el('ccReason').disabled=committed;
        el('ccCommit').style.display=committed?'none':'';el('ccOptions').style.display=committed?'block':'none';
        el('ccLock').style.display=committed&&!done?'':'none';el('ccNext').style.display=done?'':'none';
        if(!committed)predictionStatus();
        else el('ccStatus').textContent=done?'Answer locked.':(chosen?'Choice '+('ABCD'[block.answers[i]])+' selected. Lock it in when you are sure.':'Prediction saved. Choose A, B, C, or D, then lock it in.');
        document.querySelectorAll('#ccOptions .copt').forEach(function(b){b.disabled=done;var on=Number(b.dataset.i)===block.answers[i];b.style.borderColor=on?'#7c3aed':'';b.classList.toggle('sel',on);b.setAttribute('aria-pressed',on?'true':'false');});
        if(done) el('ccFeedback').innerHTML=immediate?feedback(q,block,i):
          '<div class="cmsg"><b>'+(block.answers[i]===q.answerIndex?'Right.':'Not yet.')+'</b> Explanations come after the last question in this part.</div>';
        else el('ccFeedback').innerHTML='';
      }
      if(typeof Eliminator!=='undefined')Eliminator.decorate(el('ccOptions'),{ns:'cycle:'+ctx.student+':'+ctx.set.setId+':'+label,id:q.id,selector:'.copt'});
      el('ccReason').oninput=predictionStatus;el('ccReason').onchange=predictionStatus;
      wire('ccCommit',function(){var value=el('ccReason').value.trim();if(block.reasons[i]!==undefined)return;if(!validReason(value,q)){predictionStatus();el('ccReason').focus();return;}block.reasons[i]=value;save(ctx,s);refresh();});
      document.querySelectorAll('#ccOptions .copt').forEach(function(b){b.onclick=function(){if(block.reasons[i]===undefined||locked())return;block.answers[i]=Number(b.dataset.i);save(ctx,s);refresh();};});
      wire('ccLock',function(){
        if(block.answers[i]===undefined){el('ccStatus').textContent='Choose A, B, C, or D before locking in.';el('ccOptions').querySelector('.copt').focus();return;}
        block.locked=i;if(typeof recordExposure==='function')recordExposure(q.bankId||q.id,'class',block.answers[i]===q.answerIndex);save(ctx,s);refresh();
      });
      wire('ccNext',function(){if(!locked())return;delete block.locked;advance();});
      refresh();
    }
    home();
  }
  window.CycleClass={render:render,completeTransfer:completeTransfer};
})();
