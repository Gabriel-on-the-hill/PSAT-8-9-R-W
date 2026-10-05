// Optional class route: reason first, delayed check feedback, protected transfer.
(function () {
  'use strict';
  var memory = Object.create(null);
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function button(id,text,disabled) { return '<button class="cbtn" id="'+id+'"'+(disabled?' disabled':'')+'>'+esc(text)+'</button>'; }
  function wire(id,fn) { if(el(id)) el(id).onclick=fn; }
  function key(ctx) { return 'psat89_classroute_'+ctx.student+'_'+ctx.set.setId; }
  function state(ctx) {
    var k=key(ctx);
    if(memory[k]) return memory[k];
    try { memory[k]=JSON.parse(localStorage.getItem(k)); } catch(e) {}
    return memory[k] || (memory[k]={lesson:{index:0,reasons:[],answers:[]},gate:{index:0,reasons:[],answers:[]},reasonsReady:false,transferStarted:false,transferDone:false});
  }
  function save(ctx,s) { try { localStorage.setItem(key(ctx),JSON.stringify(s)); } catch(e) {} }
  function completeTransfer(ctx) { var s=state(ctx);s.transferStarted=true;s.transferDone=true;save(ctx,s); }
  function render(ctx) {
    var path=ctx.set.learningPath,s=state(ctx);
    function resolve(ref) {
      var q=ctx.bank.find(function(x){return x.id===ref.bankId;});
      if(!q) throw new Error('Missing class question: '+ref.bankId);
      return Object.assign({},q,ref,{answerIndex:q.answer.charCodeAt(0)-65});
    }
    var lesson,gate,exits,transfer;
    function paint(body) {
      ctx.paint(ctx.header()+body+'<div class="crow">'+button('scHub','Back to hub')+'</div>');wire('scHub',ctx.back);
    }
    try { lesson=path.steps.map(resolve);gate=path.checks.map(resolve);exits=path.exitChoices.map(resolve);transfer=path.transfer.map(function(id){return resolve({bankId:id});}); }
    catch(e) { paint('<div class="cbanner">The class question list is incomplete. Ask your tutor to check it before starting.</div>');return; }
    function ready() { return s.gate.done && s.gate.answers.every(function(a,i){return a===gate[i].answerIndex;}) && s.reasonsReady; }
    function home() {
      paint('<div class="cbox"><p>'+esc(path.intro)+'</p><p>'+esc(path.order)+'</p></div>'+
        '<div class="crow">'+button('scLearn',s.lesson.done?'Review the learning responses':'Retrieval and two methods')+
        (s.lesson.done?button('scGate',s.gate.done?'Review the four checks':'Four fresh checks'):'')+
        (!s.transferStarted?button('scOff','When your tutor says: independent set, clock off'):'')+
        (ready()&&!s.transferStarted?button('scTimed','Independent set: six questions, seven minutes'):'')+
        (s.transferStarted&&!s.transferDone?button('scResume','Resume the independent set'):'')+
        (s.transferDone&&!s.exit?button('scExit','Choose two exit checks'):'')+
        (s.exit?button('scExit',s.exit.done?'Review the exit responses':'Continue exit checks'):'')+'</div>'+
        '<p class="cnote">Give a short prediction before choices. Teaching and checks do not award mastery. Your tutor checks the reasons. The independent set still runs if a method needs repair; keep its clock off. Class responses are saved on this device.</p>'+
        (s.exit&&s.exit.done?'<div class="cmsg">Class route complete. Homework is decided after class, using today’s responses and discussion.</div>':''));
      wire('scLearn',function(){run(lesson,s.lesson,'Learning step',true);});
      wire('scGate',function(){run(gate,s.gate,'Fresh check',false);});
      wire('scOff',function(){start(false);});wire('scTimed',function(){start(true);});
      wire('scResume',function(){if(!ctx.resume())paint('<div class="cmsg">The saved independent session is unavailable. Ask your tutor before reopening these questions; they are now familiar.</div>'+button('scHome','Return to route'));wire('scHome',home);});
      wire('scExit',function(){if(s.exit)run(s.exit.ids.map(function(id){return exits.find(function(q){return q.id===id;});}),s.exit,'Exit check',false);else selectExits();});
    }
    function start(timed) {
      if(s.transferStarted || (timed&&!ready()))return;
      if(ctx.transfer(transfer,timed?420:0)){s.transferStarted=true;s.clock=timed?'countdown':'off';save(ctx,s);}
    }
    function feedback(q,block,i) {
      return '<div class="cexpl"><b>'+esc(q.stage||q.skill)+' — '+(block.answers[i]===q.answerIndex?'correct':'review')+'</b><p>Your prediction: '+esc(block.reasons[i])+'</p><p>Your choice: '+esc(q.options[block.answers[i]])+'</p><p>'+esc(q.explanation)+'</p></div>';
    }
    function results(qs,block,label) {
      var isGate=block===s.gate, all=block.answers.every(function(a,i){return a===qs[i].answerIndex;});
      paint('<div class="cmsg"><b>'+esc(label)+' complete.</b> '+(isGate?(all?'All four answers are correct. Your tutor must check the deciding reasons before using the clock.':'Keep the clock off. Repair the deciding step with your tutor, then take the protected independent set.'):'Review the deciding actions with your tutor.')+'</div>'+
        qs.map(function(q,i){return feedback(q,block,i);}).join('')+
        (isGate&&all&&!s.reasonsReady?button('scReasons','My tutor has checked these reasons'):'')+'<div class="crow">'+button('scHome','Return to class route')+'</div>');
      wire('scReasons',function(){s.reasonsReady=true;save(ctx,s);home();});wire('scHome',home);
    }
    function run(qs,block,label,immediate) {
      if(block.done){results(qs,block,label);return;}
      var i=block.index,q=qs[i];
      paint('<p class="cnote"><b>'+esc(label)+' '+(i+1)+' of '+qs.length+'</b>'+(immediate?' · '+esc(q.stage||q.skill):' · notes closed · no hints')+'</p>'+
        (q.image?'<div class="cq"><img src="'+esc(q.image)+'" alt="'+esc(q.alt||'Question figure')+'" style="display:block;max-width:100%;height:auto"></div>':'<div class="cq">'+esc(q.passage)+'</div>')+'<div class="cq"><b>'+esc(q.question)+'</b></div>'+
        '<label for="scReason">Predict the answer or deciding relationship before choosing.</label><textarea id="scReason" rows="2" style="width:100%;box-sizing:border-box;font:inherit;padding:.65rem;margin:.5rem 0"></textarea>'+button('scCommit','Commit the prediction',true)+
        '<div id="scOptions" style="display:none">'+q.options.map(function(o,j){return '<button class="copt" data-i="'+j+'">'+esc(o)+'</button>';}).join('')+'</div><div id="scFeedback" aria-live="polite"></div><div class="crow">'+button('scNext',i===qs.length-1?'Finish this block':'Commit and continue',true)+'</div>');
      function refresh() {
        var committed=block.reasons[i]!==undefined, chosen=block.answers[i]!==undefined;
        el('scReason').value=committed?block.reasons[i]:'';el('scReason').disabled=committed;
        el('scCommit').style.display=committed?'none':'';el('scOptions').style.display=committed?'block':'none';
        el('scNext').disabled=!chosen;
        document.querySelectorAll('#scOptions button').forEach(function(b){b.disabled=immediate&&chosen;b.style.borderColor=Number(b.dataset.i)===block.answers[i]?'#7c3aed':'';});
        if(immediate&&chosen)el('scFeedback').innerHTML=feedback(q,block,i);
      }
      el('scReason').oninput=function(){el('scCommit').disabled=el('scReason').value.trim().length<2;};
      wire('scCommit',function(){var value=el('scReason').value.trim();if(value.length<2||block.reasons[i]!==undefined)return;block.reasons[i]=value;save(ctx,s);refresh();});
      document.querySelectorAll('#scOptions button').forEach(function(b){b.onclick=function(){if(block.reasons[i]===undefined||(immediate&&block.answers[i]!==undefined))return;block.answers[i]=Number(b.dataset.i);save(ctx,s);refresh();};});
      wire('scNext',function(){if(block.answers[i]===undefined)return;if(typeof recordExposure==='function')recordExposure(q.bankId||q.id,'class',block.answers[i]===q.answerIndex);block.index++;if(block.index===qs.length)block.done=true;save(ctx,s);run(qs,block,label,immediate);});
      refresh();
    }
    function selectExits() {
      paint('<div class="cbox"><b>Select two with your tutor after review.</b><p>Choose the methods that need a different example.</p>'+exits.map(function(q){return '<label style="display:block;margin:.75rem 0"><input type="checkbox" class="scExitChoice" value="'+esc(q.id)+'"> '+esc(q.stage)+'</label>';}).join('')+'</div>'+button('scBeginExits','Start these two checks',true));
      document.querySelectorAll('.scExitChoice').forEach(function(b){b.onchange=function(){el('scBeginExits').disabled=document.querySelectorAll('.scExitChoice:checked').length!==2;};});
      wire('scBeginExits',function(){var ids=Array.prototype.map.call(document.querySelectorAll('.scExitChoice:checked'),function(b){return b.value;});if(ids.length!==2)return;s.exit={ids:ids,index:0,reasons:[],answers:[]};save(ctx,s);run(ids.map(function(id){return exits.find(function(q){return q.id===id;});}),s.exit,'Exit check',false);});
    }
    home();
  }
  window.StructuredClass={render:render,completeTransfer:completeTransfer};
})();
