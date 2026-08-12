(()=>{
'use strict';
const D=window.CASE17;
const SAVE='second_confession_film_v4',META='second_confession_film_meta_v4';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const defaults=()=>({
  stage:0,location:'hall',asked:[],scene:[],viewed:[],facts:[],hintLevel:{},sound:true,expert:false,recordOrder:[],
  transferSubmitted:false,drawerMismatch:false,drawerReasked:false,drawerResolved:false,tags:{},lastSeenSolved:false,arrivalSeen:false,arrivalConfronted:false,
  bookstoreSeen:[],sequenceSolved:false,propertySolved:false,voiceSeen:false,forensicSeen:[],forensicSolved:false,
  secondAsked:false,final:{initial:{person:null,evidence:[]},rescue:{person:null,evidence:[]},cover:{person:null,evidence:[]},confess:{person:null,evidence:[]},model:null},
  ending:false,filmSeen:[]
});
let state=defaults();
let meta={completed:false};
try{meta={...meta,...JSON.parse(localStorage.getItem(META)||'{}')}}catch(e){}
function save(){localStorage.setItem(SAVE,JSON.stringify(state))}
function load(){try{const x=JSON.parse(localStorage.getItem(SAVE)||'null');if(x){state={...defaults(),...x,final:{...defaults().final,...(x.final||{})}};return true}}catch(e){}return false}
function reset(){state=defaults();save()}
function toast(t){const n=$('#toast');n.textContent=t;n.classList.remove('hidden');clearTimeout(toast.t);toast.t=setTimeout(()=>n.classList.add('hidden'),1800)}
function ev(id){return D.evidence[id]}
function markViewed(id){if(!state.viewed.includes(id)){state.viewed.push(id);save()}}
function addFact(t){if(!state.facts.includes(t)){state.facts.push(t);save()}}
function setStage(n){if(n>state.stage){state.stage=n;save()}}
function unlocked(loc){
  return ({hall:0,interrogation:0,scene:0,evidence:0,video:2,bookstore:4,property:5,forensic:6,review:8})[loc]<=state.stage;
}

/* ===== audio ===== */
const audio={ready:false,loops:{},fx:{},current:null,key:''};
function initAudio(){
  if(audio.ready)return;
  const loop=(file,vol)=>{const a=new Audio('assets/audio/'+file);a.loop=true;a.volume=vol;return a};
  const fx=(file,vol)=>{const a=new Audio('assets/audio/'+file);a.volume=vol;return a};
  audio.loops={interrogation:loop('interrogation_room.wav',.22),rain:loop('rain_window.wav',.18),records:loop('records_room.wav',.16)};
  audio.fx={door:fx('door.wav',.65),paper:fx('paper_rustle.wav',.55),phone:fx('phone_beep.wav',.62),printer:fx('printer.wav',.55),rec:fx('rec_click.wav',.55),stamp:fx('stamp.wav',.62),transition:fx('transition_low.wav',.55)};
  audio.ready=true;
}
function playFx(k){if(!state.sound)return;initAudio();const a=audio.fx[k];if(a){try{a.currentTime=0;a.play().catch(()=>{})}catch(e){}}}
function ambient(k){if(!state.sound){stopAmbient();return}initAudio();if(audio.key===k)return;stopAmbient();audio.key=k||'';audio.current=k?audio.loops[k]:null;if(audio.current)audio.current.play().catch(()=>{})}
function stopAmbient(){if(audio.current){audio.current.pause();audio.current.currentTime=0}audio.current=null;audio.key=''}
function toggleSound(){state.sound=!state.sound;save();$('#soundBtn').textContent='声音：'+(state.sound?'开':'关');if(!state.sound)stopAmbient();else syncAmbient()}
function syncAmbient(){
  if(!$('#theatre').classList.contains('hidden'))return;
  if(state.location==='interrogation')ambient('interrogation');
  else if(['scene','bookstore'].includes(state.location))ambient('rain');
  else ambient('records');
}

/* ===== film ===== */
let film={key:null,shots:[],i:0,done:null,timer:null};
function showFilm(key,done){
  const shots=D.films[key]||[];if(!shots.length){done?.();return}
  film={key,shots,i:0,done,timer:null};
  $('#theatre').classList.remove('hidden');$('#app').classList.add('cinema');
  stopAmbient();renderShot();
}
function renderShot(){
  clearTimeout(film.timer);
  const s=film.shots[film.i];
  const theatre=$('#theatre');theatre.classList.remove('shot-enter');void theatre.offsetWidth;theatre.classList.add('shot-enter');
  const img=$('#filmImg');img.className='motion-'+(s.motion||(['push','still','pan-left','pan-right'][film.i%4]));img.style.animation='none';void img.offsetWidth;img.style.animation='';
  img.src='assets/images/'+s.img;
  $('#filmHud').textContent=s.hud||'';
  $('#filmCaption').textContent=s.caption||'';
  $('#filmSpeaker').textContent=s.speaker||'';
  $('#filmLine').textContent=s.line||'';
  const st=$('#filmStamp');st.textContent=s.stamp||'';st.classList.toggle('hidden',!s.stamp);
  if(s.ambient)ambient(s.ambient);
  if(s.sfx)playFx(s.sfx);
  film.timer=setTimeout(()=>advanceFilm(),Math.max(2400,(s.hold||900)+1200));
}
function advanceFilm(){
  clearTimeout(film.timer);
  if(film.i<film.shots.length-1){film.i++;renderShot();return}
  $('#theatre').classList.add('hidden');$('#app').classList.remove('cinema');stopAmbient();
  if(!state.filmSeen.includes(film.key)){state.filmSeen.push(film.key);save()}
  const done=film.done;film={key:null,shots:[],i:0,done:null,timer:null};done?.();render();
}
$('#filmAdvance').onclick=advanceFilm;
$('#theatre').addEventListener('click',e=>{if(e.target.id!=='filmAdvance')advanceFilm()});

/* ===== boot ===== */
function enter(newGame=false){
  if(newGame)reset();else load();
  $('#boot').classList.add('hidden');$('#app').classList.remove('hidden');
  $('#soundBtn').textContent='声音：'+(state.sound?'开':'关');
  if(newGame&&!state.filmSeen.includes('intake'))showFilm('intake',()=>{state.location='hall';save();render()});else render();
}
$$('[data-action="new"]').forEach(b=>b.onclick=()=>enter(true));
$('#continueBtn').disabled=!localStorage.getItem(SAVE);
$('#continueBtn').onclick=()=>enter(false);
if(meta.completed){$('#truthReplayBoot').classList.remove('hidden');$('#independentBoot')?.classList.remove('hidden')}
$('#truthReplayBoot').onclick=()=>{state=defaults();$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');showFilm('replayTruth',()=>{$('#app').classList.add('hidden');$('#boot').classList.remove('hidden')})};
$('#independentBoot')?.addEventListener('click',()=>{reset();state.expert=true;state.recordOrder=[...recordIds].sort(()=>Math.random()-.5);save();$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');showFilm('intake',()=>{state.location='hall';save();render()})});

/* ===== diegetic hall ===== */
const locationInfo={
  interrogation:['讯问室 03','第一次讯问录像与补充讯问','film_interrogation_wide.jpg'],
  scene:['西河公寓 4-702','现场勘验与物证位置','film_apartment_wide.jpg'],
  evidence:['物证室','原始证物与导出材料','film_records_wide.jpg'],
  video:['视频复核室','20:36—21:52记录复核','film_corridor_wide.jpg'],
  bookstore:['迟夏书店','林夏手机缓存与当晚活动','film_bookstore_wide.jpg'],
  property:['物业值班室','设备终端与审计日志','film_records_detail.jpg'],
  forensic:['法医复核室','死亡过程与急救窗口','film_records_wide.jpg'],
  review:['案件复核会议室','分段责任链','film_records_wide.jpg']
};
function proceduralItems(){
  if(state.stage===0)return [
    ['听取第一次讯问关键问题',state.asked.includes('why')&&state.asked.includes('weapon')],
    ['检查4-702书桌与倒地位置',state.scene.includes('desk')&&state.scene.includes('floor')],
    ['核对E01与E02原始材料',state.viewed.includes('confession')&&state.viewed.includes('brass')]
  ];
  if(state.stage===1)return [['补核物证采集位置',state.drawerMismatch],['回讯问室复听并再次确认',state.drawerReasked],['决定是否暂缓移送',state.drawerResolved]];
  if(state.stage===2)return [['复核20:36—21:52记录来源',state.lastSeenSolved]];
  if(state.stage===3)return [['核对陈默到场时间并补充讯问',state.arrivalConfronted]];
  if(state.stage===4)return [['核对迟夏书店时间记录',state.sequenceSolved]];
  if(state.stage===5)return [['完成物业设备审计',state.propertySolved]];
  if(state.stage===6)return [['复核死亡过程与急救时间',state.forensicSolved]];
  if(state.stage===7)return [['完成陈默补充讯问',state.secondAsked]];
  if(state.stage>=8&&!state.ending)return [['完成案件责任链复核',false]];
  return [];
}
function renderHall(){
  ambient('records');
  const cards=Object.entries(locationInfo).map(([id,x])=>{
    const lock=!unlocked(id);
    return `<button class="location-card ${lock?'locked':''}" data-loc="${id}">
      <small>${lock?'SEALED':'OPEN'}</small><b>${x[0]}</b><p>${lock?'该场所尚未进入复核程序。':x[1]}</p>
    </button>`;
  }).join('');
  const items=proceduralItems();
  $('#view').innerHTML=`<section class="scene-screen">
    <img class="scene-bg" src="assets/images/film_corridor_wide.jpg" alt="">
    <div class="scene-shade"></div>
    <div class="scene-copy">
      <div class="kicker">${state.expert?'INDEPENDENT REVIEW':(state.stage<2?'TRANSFER CHECK':'SUPPLEMENTAL REVIEW')} / CASE 17</div>
      <h1>${state.stage<2?'案件移送核验':'第17号案件 · 补充复核'}</h1>
      <p>${state.stage<2?'先完成程序性核验。系统不会替你判断口供是否可信。':'从原始材料重新建立案件，不沿用原案对记录的解释。'}</p>
      <div class="location-grid">${cards}</div>
      ${items.length&&!state.expert?`<div class="procedure-slip"><b>程序清单</b><ul>${items.map(x=>`<li class="${x[1]?'done':''}">${x[0]}</li>`).join('')}</ul>
      ${state.stage===0&&items.every(x=>x[1])&&!state.transferSubmitted?'<button id="submitTransfer" class="primary">提交移送核验</button>':''}</div>`:''}
      ${state.expert&&state.stage===0&&items.every(x=>x[1])&&!state.transferSubmitted?'<div class="expert-submit"><button id="submitTransfer" class="primary">提交移送核验</button></div>':''}
    </div>
  </section>`;
  $$('[data-loc]').forEach(b=>b.onclick=()=>go(b.dataset.loc));
  const st=$('#submitTransfer');if(st)st.onclick=submitTransfer;
}
function submitTransfer(){
  openModal(`<div class="doc-meta"><h2>移送核验结论</h2><p>目前已核对的讯问、现场与凶器材料是否能够相互对应？</p>
  <div class="compare-actions"><button data-transfer="yes">可以对应</button><button data-transfer="no">材料不足</button></div></div>`);
  $$('[data-transfer]').forEach(b=>b.onclick=()=>{
    if(b.dataset.transfer==='yes'){
      closeModal(false);state.transferSubmitted=true;setStage(1);addFact('第一次讯问、凶器和倒地位置能够相互对应。');save();
      showFilm('transferPass');
    }else toast('继续核对随卷材料。');
  });
}
function go(loc){if(!unlocked(loc))return;state.location=loc;save();render()}

/* ===== interrogation ===== */
function availableQuestions(){
  const base=[
    {id:'why',q:'为什么主动投案？',a:'因为人是我杀的。事情到我这里就结束。',beh:'回答立即开始，无明显停顿。'},
    {id:'weapon',q:'凶器是什么？',a:'桌边那只黄铜书挡。我拿起来砸了他。',beh:'说到“黄铜书挡”时视线没有移开。'}
  ];
  if(state.stage>=1)base.push({id:'drawer',q:'后来怎么处理凶器？',a:'擦了一下，放回书桌第二层抽屉。',beh:'“第二层”回答很快。'});
  if(state.drawerMismatch)base.push({id:'drawer_recheck',q:'书挡到底放在哪一层？',a:'第二层。左边第二层，我记得很清楚。',beh:'重复询问后仍保持同一回答。'});
  if(state.stage>=3)base.push({id:'arrival',q:'你几点到、几点离开？',a:'21点45分左右到，21点58分左右离开。',beh:'时间表达完整，没有反复修正。'});
  if(state.stage>=7)base.push({id:'second',q:'20:50林夏已经知道邱承倒下。你那时在哪里？',a:'……我到的时候，他已经倒在那里。',beh:'这句话与第一次供述出现直接冲突。'});
  return base;
}
function renderInterrogation(){
  ambient('interrogation');
  const qs=availableQuestions();
  const cur=qs.find(q=>q.id===(state.currentQ||''))||qs[0];state.currentQ=cur.id;
  const qImage=['drawer_recheck','arrival','second'].includes(cur.id)?'film_interrogation_left.jpg':'film_interrogation_wide.jpg';
  $('#view').innerHTML=`<section class="interrogation-room">
    <img class="scene-bg" src="assets/images/${qImage}" alt="讯问室环境">
    <div class="scene-shade"></div><div class="cam-time"><span class="rec">● REC</span>ROOM 03 / 21:14:${String(8+state.asked.length*7).padStart(2,'0')}</div>
    <div class="interrogation-console">
      <h2>第一次讯问录像</h2><div class="mono">原案材料 / 未附行为结论</div>
      <div class="question-list">${qs.map(q=>`<button class="${state.asked.includes(q.id)?'asked':''}" data-q="${q.id}">${q.q}</button>`).join('')}</div>
      <div class="transcript"><div class="q">韩川：${esc(cur.q)}</div><div class="a">陈默：${esc(cur.a)}</div><div class="behaviour">观察记录：${esc(cur.beh)}</div></div>
      ${state.stage===1&&state.drawerMismatch&&state.drawerReasked&&!state.drawerResolved?'<div class="confront-row"><button id="pauseTransfer" class="primary">将两份原始记录并列，申请暂缓移送</button></div>':''}
      ${state.stage>=3&&state.arrivalSeen&&state.asked.includes('arrival')&&!state.arrivalConfronted?'<div class="confront-row"><button id="arrivalConfront" class="primary">把E15到场记录放到桌上</button></div>':''}
      ${state.stage>=7&&state.asked.includes('second')&&!state.secondAsked?'<div class="confront-row"><button id="secondConfront" class="primary">把时间材料放到桌上</button></div>':''}
    </div>
  </section>`;
  $$('[data-q]').forEach(b=>b.onclick=()=>{
    state.currentQ=b.dataset.q;
    if(!state.asked.includes(b.dataset.q))state.asked.push(b.dataset.q);
    if(['why','weapon','drawer','drawer_recheck'].includes(b.dataset.q))markViewed('confession');
    if(b.dataset.q==='drawer_recheck')state.drawerReasked=true;
    save();playFx('rec');renderInterrogation();
  });
  $('#pauseTransfer')?.addEventListener('click',()=>{
    state.drawerResolved=true;setStage(2);addFact('第一次供述与现场采集位置对同一物证的层数记录不一致。');save();
    showFilm('drawerBreak');
  });
  $('#arrivalConfront')?.addEventListener('click',()=>{
    state.arrivalConfronted=true;setStage(4);addFact('陈默到场记录显示其21:29进入B座。');save();
    showFilm('arrivalBreak');
  });
  $('#secondConfront')?.addEventListener('click',()=>{
    state.secondAsked=true;setStage(8);addFact('补充讯问中，陈默承认自己到场时邱承已经倒地。');save();
    showFilm('secondConfession');
  });
}

/* ===== scene ===== */
const hotspots=[
  {id:'desk',label:'书桌与抽屉柜',x:56,y:19,w:39,h:48,ev:'brass',text:'书桌与抽屉柜在原现场照片中清晰可见。'},
  {id:'floor',label:'倒地位置',x:10,y:42,w:55,h:53,text:'倒地位置位于书桌前方地面，现场编号牌与第一次供述描述可以核对。'},
  {id:'phone',label:'桌边手机',x:61,y:13,w:18,h:16,ev:'phone',stage:2,text:'邱承手机在书桌区域提取。'},
  {id:'drawer',label:'左侧抽屉柜',x:70,y:24,w:23,h:46,ev:'drawer',stage:1,text:'物证采集位置补录。'}
]
function renderScene(){
  ambient('rain');
  $('#view').innerHTML=`<section class="scene-screen">
    <img class="scene-bg" src="assets/images/film_apartment_wide.jpg" alt="4-702现场">
    <div class="scene-shade"></div>
    ${hotspots.filter(h=>(h.stage||0)<=state.stage).map(h=>`<button class="hotspot" data-hot="${h.id}" data-label="${h.label}" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%"></button>`).join('')}
    <div class="scene-tip">移动鼠标检查现场 · 编号牌是原勘验标记，热点不会发光</div>
    <div class="field-panel"><h3>4-702 · 原现场勘验照片</h3><p>${state.stage<1?'按移送程序核对供述中出现的物品与现场编号。':'打开原始定位材料时，只记录你真正看到的内容。'}</p><small class="mono">CHECKED ${state.scene.length} / ${hotspots.filter(h=>(h.stage||0)<=state.stage).length}</small></div>
  </section>`;
  $$('[data-hot]').forEach(b=>b.onclick=()=>inspectHotspot(b.dataset.hot));
}
function inspectHotspot(id){
  const h=hotspots.find(x=>x.id===id);if(!h)return;
  if(!state.scene.includes(id))state.scene.push(id);save();
  if(id==='drawer'){drawerCompare();return}
  if(h.ev){openEvidence(h.ev)}
  else openModal(`<div class="doc-meta"><h2>${h.label}</h2><p>${h.text}</p></div>`);
}
function drawerCompare(){
  markViewed('drawer');
  openModal(`<h2>物证采集位置核对</h2>
    <div class="compare-grid">
      <div><img src="assets/images/ev_confession.jpg" alt="第一次供述"><p>第一次供述原句可在录像转写中回看。</p></div>
      <div><img src="assets/images/ev_drawer.jpg" alt="现场定位记录"><p>现场采集位置记录。</p></div>
    </div>
    <p>两份材料关于“书挡放置层数”的记录是否一致？</p>
    <div class="compare-actions"><button data-drawer="same">一致</button><button data-drawer="diff">不一致</button><button data-drawer="unknown">无法判断</button></div>`);
  $$('[data-drawer]').forEach(b=>b.onclick=()=>{
    if(b.dataset.drawer==='diff'){
      closeModal(false);state.drawerMismatch=true;addFact('两份原始材料对同一物证的层数记录不同。');save();
      toast('差异已登记。回讯问室复听陈默关于抽屉位置的原话。');render();
    }else toast('再读一次两份原始材料。');
  });
}

/* ===== evidence ===== */
function evAvailable(id){
  const e=ev(id);if(!e)return false;
  if(id==='voice')return state.stage>=5;
  return e.stage<=state.stage;
}
function renderEvidence(){
  ambient('records');
  $('#view').innerHTML=`<section class="evidence-room"><div class="room-head"><div><h1>物证室</h1><p>CASE 17 / ORIGINAL MATERIALS</p></div><span class="mono">只展示当前已入卷材料</span></div>
    <div class="evidence-grid">${Object.entries(D.evidence).filter(([id,e])=>evAvailable(id)).map(([id,e])=>`<button class="ev-card" data-ev="${id}">
      <img src="assets/images/${e.img}" alt="${esc(e.name)}"><div class="ev-body"><strong>${e.no} · ${esc(e.name)}</strong><small>${esc(e.kind)} ${state.viewed.includes(id)?'· 已阅':''}</small></div></button>`).join('')}</div>
  </section>`;
  $$('[data-ev]').forEach(b=>b.onclick=()=>openEvidence(b.dataset.ev));
}
function openEvidence(id){
  const e=ev(id);if(!e)return;markViewed(id);
  if(id==='voice')state.voiceSeen=true;
  save();
  openModal(`<div class="document-view"><div><img src="assets/images/${e.img}" alt="${esc(e.name)}"></div><div class="doc-meta"><div class="mono">${e.no} / ${esc(e.kind)}</div><h2>${esc(e.name)}</h2><p>${esc(e.raw)}</p>${id==='voice'?'<p><b>文字转写已随卷保存，因此不需要依赖声音完成案件。</b></p>':''}</div></div>`);
}

/* ===== video room / record classification ===== */
const recordIds=['cctv','payment','access','water','parcel','taxi'];
function currentRecordIds(){return state.expert&&state.recordOrder?.length?state.recordOrder:recordIds}
const tagLabels={person:'画面确认到人',carrier:'只记录卡/账户/设备',environment:'只记录环境变化',unknown:'目前无法判断'};
function renderVideo(){
  ambient('records');
  const ids=currentRecordIds();const allCorrect=recordIds.every(id=>state.tags[id]===D.recordTags[id]);
  $('#view').innerHTML=`<section class="video-room"><div class="room-head"><div><h1>视频与系统记录复核</h1><p>20:36—21:52 / SOURCE CLASSIFICATION</p></div><span class="mono">先标注“记录直接确认了什么”</span></div>
  <div class="monitor-wall">${ids.map(id=>{const e=ev(id);return `<div class="monitor"><div class="monitor-id">${e.no}</div><img src="assets/images/${e.img}" alt="${esc(e.name)}"><p>${esc(e.raw)}</p>
    <button data-open-record="${id}">打开原件</button>
    <div class="tag-row">${Object.entries(tagLabels).map(([k,l])=>`<button data-tag="${id}:${k}" class="${state.tags[id]===k?'active':''}" ${state.viewed.includes(id)?'':'disabled'}>${l}</button>`).join('')}</div></div>`}).join('')}</div>
  ${allCorrect&&!state.lastSeenSolved?`<div class="video-question"><h3>在这些材料中，最后一条能直接确认邱承本人出现的是：</h3>
  <div class="compare-actions"><button data-last="cctv">20:36 电梯画面</button><button data-last="payment">21:18 支付</button><button data-last="taxi">21:52 叫车</button></div></div>`:''}
  ${state.stage===3&&!state.arrivalSeen?`<div class="video-question"><h3>补查：陈默车辆与消防梯画面</h3><button id="openArrival">调取B2停车场 / 消防梯片段</button></div>`:''}
  </section>`;
  $$('[data-open-record]').forEach(b=>b.onclick=()=>{openEvidence(b.dataset.openRecord);});
  $$('[data-tag]').forEach(b=>b.onclick=()=>{
    const [id,k]=b.dataset.tag.split(':');state.tags[id]=k;save();renderVideo();
  });
  $$('[data-last]').forEach(b=>b.onclick=()=>{
    if(b.dataset.last==='cctv'){
      state.lastSeenSolved=true;setStage(3);addFact('20:36电梯画面是现有材料中最后一条直接确认邱承面部的记录。');save();
      showFilm('recordsMontage');
    }else toast('这条材料记录了活动，但是否直接确认了本人？');
  });
  $('#openArrival')?.addEventListener('click',()=>{
    state.arrivalSeen=true;markViewed('arrival');save();openEvidence('arrival');renderVideo();
  });
}

/* ===== bookstore ===== */
function renderBookstore(){
  ambient('rain');
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/film_bookstore_wide.jpg" alt="迟夏书店"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">迟夏书店 / 补充调取</div><h1>林夏当晚手机缓存</h1><p>这里不评价动机，只核对三个时间点。</p>
  <div class="phone-card"><button data-book="message">打开20:50消息缓存</button>${state.bookstoreSeen.includes('message')?'<img src="assets/images/ev_bookshop_msg.jpg">':''}</div>
  <div class="phone-card"><button data-book="call">打开20:52急救缓存</button>${state.bookstoreSeen.includes('call')?'<img src="assets/images/ev_call.jpg">':''}</div>
  ${state.bookstoreSeen.length===2&&!state.sequenceSolved?`<div class="phone-card"><h3>按实际发生顺序排列：</h3><div class="sequence-row">
  <select id="seq1"><option value="">第一</option><option value="message">20:50消息</option><option value="call">20:52急救</option><option value="arrival">21:29陈默到场</option></select>
  <select id="seq2"><option value="">第二</option><option value="message">20:50消息</option><option value="call">20:52急救</option><option value="arrival">21:29陈默到场</option></select>
  <select id="seq3"><option value="">第三</option><option value="message">20:50消息</option><option value="call">20:52急救</option><option value="arrival">21:29陈默到场</option></select></div><button id="checkSeq">核对时间</button></div>`:''}
  </div></section>`;
  $$('[data-book]').forEach(b=>b.onclick=()=>{const id=b.dataset.book;if(!state.bookstoreSeen.includes(id))state.bookstoreSeen.push(id);markViewed(id);save();renderBookstore()});
  $('#checkSeq')?.addEventListener('click',()=>{
    const x=[$('#seq1').value,$('#seq2').value,$('#seq3').value];
    if(x.join(',')==='message,call,arrival'){
      state.sequenceSolved=true;setStage(5);addFact('20:50林夏已知道邱承倒地；20:52拨打120；陈默21:29才进入B座。');save();showFilm('phoneFourSeconds');
    }else toast('只按时间排序，不要加入推断。');
  });
}

/* ===== property ===== */
function renderProperty(){
  ambient('records');
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/film_records_detail.jpg" alt="物业终端"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">西河公寓 / PROPERTY TERMINAL</div><h1>物业设备审计</h1>
  <div class="terminal-card"><img src="assets/images/ev_zhao_log.jpg" alt="赵序设备日志"><button id="viewZhao">登记E14原件</button></div>
  ${state.viewed.includes('zhaolog')&&!state.propertySolved?`<div class="terminal-card"><h3>审计日志中能够确认的操作类型：</h3><div class="compare-actions"><button data-op="read">查询</button><button data-op="write">写入/修改</button><button data-op="delete">删除</button></div></div>`:''}
  ${state.propertySolved&&!state.voiceSeen?`<div class="terminal-card subtle"><small class="mono">未归档缓存 / PHONE AUTO-REC INDEX</small><p>赵序手机缓存中存在一条11秒自动录音索引。</p><button id="openVoice">加入卷宗（可选）</button></div>`:''}
  </div></section>`;
  $('#viewZhao').onclick=()=>{markViewed('zhaolog');openEvidence('zhaolog');renderProperty()};
  $$('[data-op]').forEach(b=>b.onclick=()=>{
    if(b.dataset.op==='read'){
      state.propertySolved=true;setStage(6);addFact('赵序21:06—21:10的设备日志仅包含查询操作。');save();showFilm('propertyAudit');
    }else toast('审计记录里没有对应操作。');
  });
  $('#openVoice')?.addEventListener('click',()=>{state.voiceSeen=true;markViewed('voice');save();openEvidence('voice');renderProperty()});
}

/* ===== forensic ===== */
function renderForensic(){
  ambient('records');
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/film_forensic_v5.jpg" alt="法医复核室"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">FORENSIC REVIEW / CASE 17</div><h1>死亡过程复核</h1>
  <div class="medical-file"><button data-forensic="autopsy">查看E17法医底稿</button>${state.forensicSeen.includes('autopsy')?'<img src="assets/images/ev_autopsy.jpg">':''}</div>
  <div class="medical-file"><button data-forensic="call">查看E12急救缓存</button>${state.forensicSeen.includes('call')?'<img src="assets/images/ev_call.jpg">':''}</div>
  ${state.forensicSeen.length===2&&!state.forensicSolved?`<div class="medical-file"><h3>仅根据已确认时间：</h3><p>陈默21:29进入B座；20:50林夏已发送“他倒下了，还在喘”。</p>
    <div class="compare-actions"><button data-fq="no">陈默不可能参与20:50前的最初冲突</button><button data-fq="yes">陈默仍可能参与最初冲突</button></div>
    <p>法医底稿是否显示受伤后仍存在独立的救助阶段？</p><div class="compare-actions"><button data-rq="yes">存在</button><button data-rq="no">不存在</button></div>
    <button id="forensicSubmit" disabled>提交复核</button></div>`:''}
  </div></section>`;
  $$('[data-forensic]').forEach(b=>b.onclick=()=>{const id=b.dataset.forensic;if(!state.forensicSeen.includes(id))state.forensicSeen.push(id);markViewed(id);save();renderForensic()});
  let fq=null,rq=null;
  $$('[data-fq]').forEach(b=>b.onclick=()=>{fq=b.dataset.fq;$$('[data-fq]').forEach(x=>x.classList.toggle('active',x===b));$('#forensicSubmit').disabled=!(fq&&rq)});
  $$('[data-rq]').forEach(b=>b.onclick=()=>{rq=b.dataset.rq;$$('[data-rq]').forEach(x=>x.classList.toggle('active',x===b));$('#forensicSubmit').disabled=!(fq&&rq)});
  $('#forensicSubmit')?.addEventListener('click',()=>{
    if(fq==='no'&&rq==='yes'){
      state.forensicSolved=true;setStage(7);addFact('陈默21:29才到场；法医材料显示受伤后仍存在可救治时间窗。');save();showFilm('rescueWindow');
    }else toast('重新核对20:50、21:29与法医底稿。');
  });
}

/* ===== final review ===== */
const responsibilityDefs={
  initial:{title:'最初伤害',people:[['lin','林夏'],['chen','陈默'],['zhao','赵序']],expectedPerson:'lin',evidence:['cctv','brass','message'],validEvidence:[['cctv','brass'],['message','brass']]},
  rescue:{title:'救助中断',people:[['linzhao','林夏 / 赵序'],['chen','陈默'],['han','韩川']],expectedPerson:'linzhao',evidence:['message','call','autopsy','arrival'],validEvidence:[['call','autopsy'],['message','autopsy']]},
  cover:{title:'事后时间线设计',people:[['zhao','赵序'],['chen','陈默'],['han','韩川']],expectedPerson:'zhao',evidence:['zhaolog','access','water','payment','parcel','taxi'],validEvidence:[['zhaolog','access'],['zhaolog','payment'],['zhaolog','water'],['zhaolog','parcel'],['zhaolog','taxi']]},
  confess:{title:'虚假自首',people:[['chen','陈默'],['lin','林夏'],['zhao','赵序']],expectedPerson:'chen',evidence:['confession','arrival','drawer','message'],validEvidence:[['confession','arrival'],['confession','drawer']]}
};
function renderReview(){
  ambient('records');
  const cards=Object.entries(responsibilityDefs).map(([id,d])=>{
    const s=state.final[id];
    return `<div class="responsibility-card"><h3>${d.title}</h3><div class="mono">主要行为人</div><div class="person-stamps">${d.people.map(([v,l])=>`<button data-person-pick="${id}:${v}" class="${s.person===v?'active':''}">${l}</button>`).join('')}</div>
      <div class="mono" style="margin-top:14px">挂接两份关键材料</div><div class="evidence-picks">${d.evidence.map(eid=>`<button data-ev-pick="${id}:${eid}" class="${s.evidence.includes(eid)?'active':''}">${ev(eid).no} ${ev(eid).name}</button>`).join('')}</div></div>`;
  }).join('');
  $('#view').innerHTML=`<section class="review-room"><div class="review-hero"><img src="assets/images/film_review_meeting.jpg" alt="案件复核会议"><div><div class="mono">CASE REVIEW MEETING / FINAL</div><h1>案件复核会议</h1><p>把已经确认的事实重新放回同一张桌面。终局只接受能够解释全部记录的责任链。</p></div></div><div class="review-table">
  <div class="responsibility-grid">${cards}</div>
  <div class="review-submit"><h3>案件模型</h3><div class="model-options">
    <button data-model="single" class="${state.final.model==='single'?'active':''}">陈默单独故意杀人</button>
    <button data-model="joint" class="${state.final.model==='joint'?'active':''}">三人共同预谋杀人</button>
    <button data-model="layered" class="${state.final.model==='layered'?'active':''}">四段行为分别认定</button>
  </div><button id="submitFinal" class="primary" style="margin-top:15px">生成补充复核意见</button></div></div></section>`;
  $$('[data-person-pick]').forEach(b=>b.onclick=()=>{const [id,v]=b.dataset.personPick.split(':');state.final[id].person=v;save();renderReview()});
  $$('[data-ev-pick]').forEach(b=>b.onclick=()=>{const [id,v]=b.dataset.evPick.split(':');const a=state.final[id].evidence;const i=a.indexOf(v);if(i>=0)a.splice(i,1);else{if(a.length>=2)a.shift();a.push(v)}save();renderReview()});
  $$('[data-model]').forEach(b=>b.onclick=()=>{state.final.model=b.dataset.model;save();renderReview()});
  $('#submitFinal').onclick=submitFinal;
}
function submitFinal(){
  let ok=true;
  for(const [id,d] of Object.entries(responsibilityDefs)){
    const s=state.final[id];if(s.person!==d.expectedPerson)ok=false;
    if(!d.validEvidence.some(set=>set.every(x=>s.evidence.includes(x))))ok=false;
  }
  if(state.final.model!=='layered')ok=false;
  if(!ok){toast('复核意见仍有一段行为无法被当前材料解释。');return}
  state.ending=true;meta.completed=true;localStorage.setItem(META,JSON.stringify(meta));save();
  showFilm('ending',renderEnding);
}
function renderEnding(){
  ambient('records');
  const complete=state.voiceSeen;
  $('#view').innerHTML=`<section class="ending-page"><div class="ending-sheet"><div class="mono">SUPPLEMENTAL REVIEW / CLOSED</div><h1>${complete?'结局 · 第二份口供':'结局 · 分层责任'}</h1>
  <p>原“陈默单独故意杀人”移送意见被撤回。案件重新拆分为最初伤害、救助中断、事后时间线设计与虚假自首。</p>
  ${complete?'<p>你还把E18的11秒自动录音纳入了卷宗。它没有改变最初伤害发生在谁手里，但使“为什么急救被中断”的决策过程获得了更完整的证据。</p>':''}
  <div class="outcomes">
    <div class="outcome"><b>陈默</b><small>虚假自首另案审查</small><p>主动认罪不再被当作最初行为的直接证明。</p></div>
    <div class="outcome"><b>林夏</b><small>初始伤害与救助行为复核</small><p>最初冲突与之后的救助选择分别评价。</p></div>
    <div class="outcome"><b>赵序</b><small>事后掩饰行为复核</small><p>没有篡改数据库，但其利用多系统记录形成错误身份时间线的行为被固定。</p></div>
    <div class="outcome"><b>韩川</b><small>原案质量复盘</small><p>真实记录被错误地写成了“本人持续活动”。</p></div>
  </div>
  <p class="replay-note">${state.expert?'独立复核完成：本轮未显示程序清单与提示，电子记录顺序也经过打乱。':'通关后可从首页进入“独立复核二周目”，在无程序清单、无提示且记录顺序打乱的条件下重新证明案件。'}</p><div class="ending-actions"><button id="truthReplay" class="primary">重看第一份口供 · 真相标注</button><button id="restart">重新开始案件</button></div></div></section>`;
  $('#truthReplay').onclick=()=>showFilm('replayTruth');
  $('#restart').onclick=()=>{reset();location.reload()};
}

/* ===== folder / people ===== */
function openFolder(tab='evidence'){$('#folder').classList.remove('hidden');renderFolder(tab);playFx('paper')}
function renderFolder(tab){
  $$('[data-folder-tab]').forEach(b=>b.classList.toggle('active',b.dataset.folderTab===tab));
  const body=$('#folderBody');
  if(tab==='evidence'){
    body.innerHTML=`<div class="folder-ev-grid">${Object.entries(D.evidence).filter(([id])=>state.viewed.includes(id)).map(([id,e])=>`<button class="folder-ev" data-folder-ev="${id}"><img src="assets/images/${e.img}"><b>${e.no}</b><div>${esc(e.name)}</div></button>`).join('')||'<p>还没有阅过的材料。</p>'}</div>`;
    $$('[data-folder-ev]').forEach(b=>b.onclick=()=>openEvidence(b.dataset.folderEv));
  }else if(tab==='facts'){
    body.innerHTML=state.facts.map(x=>`<div class="folder-fact">${esc(x)}</div>`).join('')||'<p>这里只记录你已经亲手确认的事实。</p>';
  }else{
    body.innerHTML=`<div class="people-file">${Object.values(D.people).map(p=>`<div class="person-file"><img class="person-portrait" src="assets/images/${p.portrait}" alt="${p.name}"><div class="person-copy"><b>${p.name}</b><small>${p.role}</small><p>${p.public}</p><p class="relation">${p.relation}</p>${p.mid&&state.stage>=p.midStage?`<p class="mid-note">${p.mid}</p>`:''}${state.stage>=8?`<p class="later-note">${p.later}</p>`:''}</div></div>`).join('')}</div>`;
  }
}
$$('[data-folder-tab]').forEach(b=>b.onclick=()=>renderFolder(b.dataset.folderTab));

/* ===== hint ===== */
function hintKey(){if(state.stage===0)return'transfer';if(state.stage===1)return'drawer';if(state.stage===2)return'records';if(state.stage===3)return'arrival';if(state.stage===4)return'bookstore';if(state.stage===5)return'property';if(state.stage===6)return'forensic';return'final'}
function openHint(){
  const k=hintKey();const lv=state.hintLevel[k]||0;$('#hintText').textContent=lv?D.hints[k][Math.min(lv-1,2)]:'提示只在你主动打开时出现，不会自动写到页面上。';$('#hintPanel').classList.remove('hidden');
}
function nextHint(){const k=hintKey();state.hintLevel[k]=Math.min(3,(state.hintLevel[k]||0)+1);save();$('#hintText').textContent=D.hints[k][state.hintLevel[k]-1]}

/* ===== modal ===== */
function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');playFx('paper')}
function closeModal(refresh=true){$('#modal').classList.add('hidden');if(refresh&&!$('#app').classList.contains('hidden')&&$('#theatre').classList.contains('hidden'))render()}
function tools(){
  openModal(`<div class="doc-meta"><h2>案件工具</h2><p><button id="toolSave">立即保存</button> <button id="toolExport">导出存档</button> <button id="toolImport">导入存档</button> <button id="toolReset">重置案件</button></p><input type="file" id="importFile" accept="application/json" class="hidden"></div>`);
  $('#toolSave').onclick=()=>{save();toast('已保存')};
  $('#toolExport').onclick=()=>{const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='case17_save.json';a.click();URL.revokeObjectURL(a.href)};
  $('#toolImport').onclick=()=>$('#importFile').click();
  $('#importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);state={...defaults(),...x,final:{...defaults().final,...(x.final||{})}};save();closeModal(false);render();toast('存档已导入')}catch(err){toast('存档格式无效')}};r.readAsText(f)};
  $('#toolReset').onclick=()=>{if(confirm('确定重置案件？')){reset();location.reload()}};
}

/* ===== render ===== */
function render(){
  if(state.ending){renderEnding();return}
  $('#hudLocation').textContent=state.location==='hall'?(state.stage<2?'案卷室':'补充复核走廊'):(locationInfo[state.location]?.[0]||'第17号案件');
  $('#hudStatus').textContent=state.expert?'INDEPENDENT REVIEW':(state.stage<2?'TRANSFER CHECK':'SUPPLEMENTAL REVIEW');
  $('.back-location').style.visibility=state.location==='hall'?'hidden':'visible';
  document.querySelector('[data-action="hint"]').style.display=state.expert?'none':'';
  if(state.location==='hall')renderHall();
  else if(state.location==='interrogation')renderInterrogation();
  else if(state.location==='scene')renderScene();
  else if(state.location==='evidence')renderEvidence();
  else if(state.location==='video')renderVideo();
  else if(state.location==='bookstore')renderBookstore();
  else if(state.location==='property')renderProperty();
  else if(state.location==='forensic')renderForensic();
  else if(state.location==='review')renderReview();
  syncAmbient();save();
}

/* global actions */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-action]');if(!a)return;
  const act=a.dataset.action;
  if(act==='hall'){state.location='hall';save();render()}
  else if(act==='folder')openFolder();
  else if(act==='folder-close')$('#folder').classList.add('hidden');
  else if(act==='hint')openHint();
  else if(act==='hint-next')nextHint();
  else if(act==='hint-close')$('#hintPanel').classList.add('hidden');
  else if(act==='sound')toggleSound();
  else if(act==='tools')tools();
  else if(act==='close-modal')closeModal();
});
document.addEventListener('keydown',e=>{
  if(!$('#theatre').classList.contains('hidden')&&(e.key===' '||e.key==='Enter')){e.preventDefault();advanceFilm();return}
  if(e.key==='Escape'){closeModal();$('#folder').classList.add('hidden');$('#hintPanel').classList.add('hidden');return}
  if($('#app').classList.contains('hidden'))return;
  if(e.key.toLowerCase()==='f'){openFolder();return}
  if(e.key.toLowerCase()==='h'&&!state.expert){openHint();return}
  if(e.key.toLowerCase()==='m'){toggleSound();return}
});

})();