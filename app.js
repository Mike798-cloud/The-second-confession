(()=>{
'use strict';
const D=window.CASE17;
const SAVE='second_confession_film_v4',META='second_confession_film_meta_v4';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const defaults=()=>({
  stage:0,location:'hall',asked:[],scene:[],viewed:[],facts:[],hintLevel:{},sound:true,expert:false,recordOrder:[],
  transferSubmitted:false,drawerMismatch:false,drawerReasked:false,drawerResolved:false,
  recordAnswers:{},lastSeenSolved:false,arrivalSeen:false,arrivalConfronted:false,
  bookstoreSeen:[],bookstoreOrder:[],sequenceSolved:false,propertyOps:[],propertySolved:false,voiceSeen:false,
  forensicSeen:[],forensicSolved:false,interrogationPins:[],secondAsked:false,
  hintUses:0,mistakes:0,sourceReplayDone:false,
  final:{initial:{person:null,evidence:[]},rescue:{person:null,evidence:[]},cover:{person:null,evidence:[]},confess:{person:null,evidence:[]},model:null},
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
function addFact(t){if(!state.facts.includes(t)){state.facts.push(t);playFx('pen');save()}}
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
  audio.loops={interrogation:loop('interrogation_room.wav',.20),rain:loop('rain_window.wav',.16),records:loop('records_room.wav',.14),fluorescent:loop('fluorescent_hum.wav',.09)};
  audio.fx={door:fx('door.wav',.65),paper:fx('paper_rustle.wav',.55),phone:fx('phone_beep.wav',.62),printer:fx('printer.wav',.55),rec:fx('rec_click.wav',.55),stamp:fx('stamp.wav',.62),transition:fx('transition_low.wav',.55),drawer:fx('drawer_slide.wav',.62),cctv:fx('cctv_beep.wav',.48),elevator:fx('elevator_ding.wav',.52),chair:fx('chair_scrape.wav',.42),pen:fx('pen_mark.wav',.30)};
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
  interrogation:['讯问室 03','第一次讯问录像与补充讯问','film_interrogation_v6.jpg'],
  scene:['西河公寓 4-702','现场勘验与物证位置','scene_apartment_v6.jpg'],
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
  if(state.stage===2)return [['核对20:36—21:52六条原始记录',state.lastSeenSolved]];
  if(state.stage===3)return [['核对陈默到场时间并补充讯问',state.arrivalConfronted]];
  if(state.stage===4)return [['核对迟夏书店时间记录',state.sequenceSolved]];
  if(state.stage===5)return [['核对物业终端实际操作',state.propertySolved]];
  if(state.stage===6)return [['核对法医与急救时间材料',state.forensicSolved]];
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
    {id:'why',q:'为什么主动投案？',a:'因为人是我杀的。事情到我这里就结束。',beh:'回答立即开始。双手一直交握在桌面。',shot:'film_interrogation_v6.jpg'},
    {id:'weapon',q:'凶器是什么？',a:'桌边那只黄铜书挡。我拿起来砸了他。',beh:'说到“黄铜书挡”时抬眼看向讯问人。',shot:'film_interrogation_hands_v6.jpg'}
  ];
  if(state.stage>=1)base.push({id:'drawer',q:'后来怎么处理凶器？',a:'擦了一下，放回书桌第二层抽屉。',beh:'“第二层”回答很快。',shot:'film_chen_close_v6.jpg'});
  if(state.stage===1&&state.drawerMismatch)base.push({id:'drawer_recheck',q:'再确认一次：哪一层？',a:'第二层。左边第二层，我记得很清楚。',beh:'重复回答时没有改口。',shot:'film_chen_close_v6.jpg'});
  if(state.stage>=3)base.push({id:'arrival',q:'你几点到、几点离开？',a:'21点45分左右到，21点58分左右离开。',beh:'时间表达完整，没有反复修正。',shot:'film_interrogation_over_v6.jpg'});
  if(state.stage>=7)base.push({id:'second',q:'20:50林夏已经知道邱承倒下。你那时在哪里？',a:'……我到的时候，他已经倒在那里。',beh:'回答前出现明显停顿；这是原话记录，不直接等同于说谎。',shot:'film_chen_close_v6.jpg'});
  return base;
}
function interrogationTray(){
  const cards=[];
  if(state.stage===1&&state.drawerMismatch&&state.drawerReasked&&!state.drawerResolved)cards.push('drawer');
  if(state.stage===3&&state.arrivalSeen&&state.asked.includes('arrival')&&!state.arrivalConfronted)cards.push('arrival');
  if(state.stage>=7&&state.asked.includes('second')&&!state.secondAsked){cards.push('message','arrival')}
  return cards.filter(id=>state.viewed.includes(id));
}
function renderInterrogation(){
  ambient('interrogation');
  const qs=availableQuestions();
  const cur=qs.find(q=>q.id===(state.currentQ||''))||qs[0];state.currentQ=cur.id;
  const tray=interrogationTray();
  $('#view').innerHTML=`<section class="interrogation-room">
    <img class="scene-bg interrogation-shot" src="assets/images/${cur.shot}" alt="讯问室现场">
    <div class="scene-shade"></div><div class="cam-time"><span class="rec">● REC</span>ROOM 03 / 21:14:${String(8+state.asked.length*7).padStart(2,'0')}</div>
    <div class="interrogation-console">
      <h2>${state.stage>=7?'补充讯问':'第一次讯问录像'}</h2><div class="mono">ROOM 03 / 原始回答与可观察行为</div>
      <div class="question-list">${qs.map(q=>`<button class="${state.asked.includes(q.id)?'asked':''}" data-q="${q.id}">${q.q}</button>`).join('')}</div>
      <div class="transcript"><div class="q">韩川：${esc(cur.q)}</div><div class="a">陈默：${esc(cur.a)}</div><div class="behaviour">观察记录：${esc(cur.beh)}</div></div>
      ${tray.length?`<div class="interrogation-evidence"><div class="mono">把已经阅过的原件放到讯问桌上</div><div class="interrogation-evidence-row">${tray.map(id=>`<button data-confront="${id}"><img src="assets/images/${ev(id).img}"><span>${ev(id).no} ${esc(ev(id).name)}</span></button>`).join('')}</div></div>`:''}
    </div>
  </section>`;
  $$('[data-q]').forEach(b=>b.onclick=()=>{
    state.currentQ=b.dataset.q;
    if(!state.asked.includes(b.dataset.q))state.asked.push(b.dataset.q);
    if(['why','weapon','drawer','drawer_recheck'].includes(b.dataset.q))markViewed('confession');
    if(b.dataset.q==='drawer_recheck')state.drawerReasked=true;
    save();playFx('rec');setTimeout(()=>playFx('chair'),120);renderInterrogation();
  });
  $$('[data-confront]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.confront;
    playFx('paper');
    if(state.stage===1&&id==='drawer'&&state.drawerMismatch&&state.drawerReasked){
      state.drawerResolved=true;setStage(2);addFact('第一次供述与现场采集位置对同一物证的层数记录不一致。');save();showFilm('drawerBreak');return;
    }
    if(state.stage===3&&id==='arrival'&&state.asked.includes('arrival')){
      state.arrivalConfronted=true;setStage(4);addFact('陈默到场记录显示其21:29进入B座。');save();playFx('elevator');showFilm('arrivalBreak');return;
    }
    if(state.stage>=7&&['message','arrival'].includes(id)){
      if(!state.interrogationPins.includes(id))state.interrogationPins.push(id);
      save();
      if(['message','arrival'].every(x=>state.interrogationPins.includes(x))){
        state.secondAsked=true;setStage(8);addFact('补充讯问中，陈默承认自己到场时邱承已经倒地。');save();showFilm('secondConfession');
      }else{toast('材料已放到桌上。再补上另一条时间材料。');renderInterrogation()}
    }
  });
}

/* ===== scene ===== */
const hotspots=[
  {id:'desk',label:'书桌区域',x:54,y:19,w:43,h:48,detail:'scene_desk_v6.jpg',ev:'brass'},
  {id:'floor',label:'倒地位置',x:12,y:43,w:57,h:42,detail:'scene_floor_v6.jpg'},
  {id:'drawer',label:'左侧抽屉柜',x:74,y:26,w:22,h:41,detail:'scene_drawers_v6.jpg',ev:'drawer',stage:1}
];
function renderScene(){
  ambient('rain');
  $('#view').innerHTML=`<section class="scene-screen">
    <img class="scene-bg" src="assets/images/scene_apartment_v6.jpg" alt="4-702原现场照片">
    <div class="scene-shade scene-shade-soft"></div>
    ${hotspots.filter(h=>(h.stage||0)<=state.stage).map(h=>`<button class="hotspot" data-hot="${h.id}" data-label="${h.label}" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%"></button>`).join('')}
    <div class="scene-tip">原现场照片 · 可检查区域不会发光；鼠标经过只改变指针</div>
    <div class="field-panel"><h3>西河公寓 B座4-702</h3><p>${state.stage<1?'先确认供述里提到的物件与倒地位置是否真的存在于现场。':'补核物证位置时，不要根据系统说明推断，只看原始图像与采集记录。'}</p><small class="mono">SCENE CHECK ${state.scene.length} / ${hotspots.filter(h=>(h.stage||0)<=state.stage).length}</small></div>
  </section>`;
  $$('[data-hot]').forEach(b=>b.onclick=()=>inspectHotspot(b.dataset.hot));
}
function inspectHotspot(id){
  const h=hotspots.find(x=>x.id===id);if(!h)return;
  if(!state.scene.includes(id))state.scene.push(id);
  save();
  if(id==='drawer'){playFx('drawer');drawerCompare();return}
  openModal(`<div class="scene-detail"><img src="assets/images/${h.detail}" alt="${h.label}"><div class="doc-meta"><div class="mono">4-702 / ORIGINAL SCENE</div><h2>${h.label}</h2>${id==='desk'?'<p>现场照片中可见书桌、左侧抽屉柜和桌边物品。</p><button id="extractBrass">调取E02黄铜书挡原件</button>':'<p>这里只登记空间位置，不对行为人作判断。</p>'}</div></div>`);
  if(id==='desk')$('#extractBrass').onclick=()=>{markViewed('brass');playFx('paper');openEvidence('brass')};
}
function drawerCompare(){
  markViewed('drawer');
  openModal(`<h2>物证采集位置补核</h2>
    <div class="compare-grid scene-compare">
      <div><img src="assets/images/scene_drawers_v6.jpg" alt="书桌左侧抽屉柜"><p>原现场的抽屉柜。</p></div>
      <div><img src="assets/images/ev_drawer.jpg" alt="物证定位记录"><p>物证采集定位原件。</p></div>
    </div>
    <p>与第一次讯问中陈默关于“放回哪一层”的原话相比，两份记录是否一致？</p>
    <div class="compare-actions"><button data-drawer="same">一致</button><button data-drawer="diff">不一致</button><button data-drawer="unknown">暂不能判断</button></div>`);
  $$('[data-drawer]').forEach(b=>b.onclick=()=>{
    if(b.dataset.drawer==='diff'){
      closeModal(false);state.drawerMismatch=true;addFact('两份原始材料对同一物证的层数记录不同。');save();
      toast('差异已登记。回讯问室再次确认原话。');render();
    }else{state.mistakes++;save();toast('先只比较两份原始记录中的层数。');}
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
const recordQuestions={
  cctv:{q:'这段影像直接记录到的主体是？',opts:[['person','邱承本人面部'],['card','Q-4702门卡'],['account','支付账户'],['room','室内用水']],correct:'person'},
  payment:{q:'这条流水直接记录到的是？',opts:[['account','账户与设备完成一笔交易'],['person','邱承本人面部'],['vehicle','一辆车进入车库'],['room','4-702发生用水']],correct:'account'},
  access:{q:'门禁系统直接记录到的是？',opts:[['card','Q-4702住户卡通过'],['person','邱承本人面部'],['account','邱承账户付款'],['room','室内有人']],correct:'card'},
  water:{q:'水表曲线直接记录到的是？',opts:[['room','4-702发生用水'],['person','邱承本人'],['card','门卡通过'],['vehicle','网约车乘客']],correct:'room'},
  parcel:{q:'快递柜后台直接记录到的是？',opts:[['event','7-14柜门被开启'],['person','邱承本人取件'],['card','门卡通过'],['account','手机支付']],correct:'event'},
  taxi:{q:'网约车平台直接记录到的是？',opts:[['order','邱承账户发起订单'],['person','邱承本人乘车'],['card','住户卡通过'],['room','室内用水']],correct:'order'}
};
function renderVideo(){
  ambient('records');playFx('cctv');
  const ids=currentRecordIds();
  const allCorrect=recordIds.every(id=>state.recordAnswers[id]===recordQuestions[id].correct);
  $('#view').innerHTML=`<section class="video-room"><div class="room-head"><div><h1>视频与系统记录复核</h1><p>20:36—21:52 / ORIGINAL SOURCE REVIEW</p></div><span class="mono">逐条回答“这条系统究竟直接记录了什么”</span></div>
  <div class="monitor-wall">${ids.map(id=>{const e=ev(id),rq=recordQuestions[id];return `<div class="monitor"><div class="monitor-id">${e.no}</div><img src="assets/images/${e.img}" alt="${esc(e.name)}"><h3>${esc(e.name)}</h3>
    <button data-open-record="${id}">打开原件</button>
    <div class="record-question"><p>${rq.q}</p><div class="tag-row">${rq.opts.map(([k,l])=>`<button data-record-answer="${id}:${k}" class="${state.recordAnswers[id]===k?'active':''}" ${state.viewed.includes(id)?'':'disabled'}>${l}</button>`).join('')}</div></div></div>`}).join('')}</div>
  ${allCorrect&&!state.lastSeenSolved?`<div class="video-question"><h3>现在只回答一个问题：现有材料中，最后一条直接确认邱承本人出现的记录是哪一条？</h3>
  <div class="compare-actions"><button data-last="cctv">20:36 电梯画面</button><button data-last="payment">21:18 支付</button><button data-last="taxi">21:52 叫车</button></div></div>`:''}
  ${state.stage===3&&!state.arrivalSeen?`<div class="video-question"><h3>补调另一组影像：陈默车辆与消防梯</h3><button id="openArrival">调取B2停车场 / 消防梯片段</button></div>`:''}
  </section>`;
  $$('[data-open-record]').forEach(b=>b.onclick=()=>openEvidence(b.dataset.openRecord));
  $$('[data-record-answer]').forEach(b=>b.onclick=()=>{
    const [id,k]=b.dataset.recordAnswer.split(':');const rq=recordQuestions[id];
    if(k===rq.correct){state.recordAnswers[id]=k;playFx('pen');save();renderVideo()}
    else{state.mistakes++;save();toast('原件本身并没有直接记录到这个主体。');}
  });
  $$('[data-last]').forEach(b=>b.onclick=()=>{
    if(b.dataset.last==='cctv'){
      state.lastSeenSolved=true;setStage(3);addFact('20:36电梯画面是现有材料中最后一条直接确认邱承面部的记录。');save();
      showFilm('recordsMontage');
    }else{state.mistakes++;save();toast('它记录了活动，但有没有直接看见人？');}
  });
  $('#openArrival')?.addEventListener('click',()=>{
    state.arrivalSeen=true;markViewed('arrival');save();playFx('elevator');openEvidence('arrival');renderVideo();
  });
}

/* ===== bookstore ===== */
function renderBookstore(){
  ambient('rain');
  const order=state.bookstoreOrder||[];
  const allSeen=state.bookstoreSeen.includes('message')&&state.bookstoreSeen.includes('call')&&state.viewed.includes('arrival');
  const items=[['message','E16 消息缓存'],['call','E12 急救缓存'],['arrival','E15 陈默到场']];
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/film_bookstore_wide_v6.jpg" alt="迟夏书店"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">迟夏书店 / 手机缓存与到场影像</div><h1>把三个记录放回同一条时间线</h1><p>先打开原件。这里不要求评价动机，只恢复发生顺序。</p>
  <div class="phone-card"><button data-book="message">打开E16消息缓存</button>${state.bookstoreSeen.includes('message')?'<img src="assets/images/ev_bookshop_msg.jpg">':''}</div>
  <div class="phone-card"><button data-book="call">打开E12急救缓存</button>${state.bookstoreSeen.includes('call')?'<img src="assets/images/ev_call.jpg">':''}</div>
  ${allSeen&&!state.sequenceSolved?`<div class="phone-card timeline-builder"><h3>按发生顺序把材料放入时间带</h3>
    <div class="timeline-source">${items.filter(([id])=>!order.includes(id)).map(([id,l])=>`<button data-seq-add="${id}">${l}</button>`).join('')||'<small>三条材料都已放入</small>'}</div>
    <div class="timeline-slots">${[0,1,2].map(i=>`<div class="timeline-slot"><small>${i+1}</small>${order[i]?`<b>${items.find(x=>x[0]===order[i])[1]}</b>`:'<span>等待放入</span>'}</div>`).join('')}</div>
    <div class="compare-actions"><button id="seqUndo">撤回最后一条</button><button id="checkSeq" class="primary">提交顺序</button></div></div>`:''}
  </div></section>`;
  $$('[data-book]').forEach(b=>b.onclick=()=>{const id=b.dataset.book;if(!state.bookstoreSeen.includes(id))state.bookstoreSeen.push(id);markViewed(id);save();playFx('phone');renderBookstore()});
  $$('[data-seq-add]').forEach(b=>b.onclick=()=>{if(!state.bookstoreOrder.includes(b.dataset.seqAdd))state.bookstoreOrder.push(b.dataset.seqAdd);playFx('paper');save();renderBookstore()});
  $('#seqUndo')?.addEventListener('click',()=>{state.bookstoreOrder.pop();save();renderBookstore()});
  $('#checkSeq')?.addEventListener('click',()=>{
    if(state.bookstoreOrder.join(',')==='message,call,arrival'){
      state.sequenceSolved=true;setStage(5);addFact('20:50林夏消息 → 20:52急救呼叫 → 21:29陈默进入B座。');save();showFilm('phoneFourSeconds');
    }else{state.mistakes++;save();toast('重新读取三份原件上的时间。');}
  });
}

/* ===== property ===== */
function renderProperty(){
  ambient('fluorescent');
  const ops=['LOGIN','QUERY','WRITE','DELETE','TIME_EDIT'];
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/scene_property_v6.jpg" alt="物业值班室"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">西河公寓 / PROPERTY TERMINAL</div><h1>设备终端审计</h1>
  <div class="terminal-card"><img src="assets/images/ev_zhao_log.jpg" alt="赵序设备日志"><button id="viewZhao">打开E14原始日志</button></div>
  ${state.viewed.includes('zhaolog')&&!state.propertySolved?`<div class="terminal-card"><h3>从日志里勾出“实际出现过”的操作类型</h3><div class="op-grid">${ops.map(op=>`<button data-op="${op}" class="${state.propertyOps.includes(op)?'active':''}">${op}</button>`).join('')}</div><button id="submitOps" class="primary">提交审计</button></div>`:''}
  ${state.propertySolved&&!state.voiceSeen?`<div class="terminal-card subtle"><small class="mono">UNFILED / PHONE AUTO-REC INDEX</small><p>设备审计结束后，你在关联手机缓存里看到一条11秒自动录音索引。</p><button id="openVoice">加入卷宗（可选）</button></div>`:''}
  </div></section>`;
  $('#viewZhao').onclick=()=>{markViewed('zhaolog');openEvidence('zhaolog')};
  $$('[data-op]').forEach(b=>b.onclick=()=>{const op=b.dataset.op;const i=state.propertyOps.indexOf(op);if(i>=0)state.propertyOps.splice(i,1);else state.propertyOps.push(op);playFx('cctv');save();renderProperty()});
  $('#submitOps')?.addEventListener('click',()=>{
    const set=[...state.propertyOps].sort().join(',');
    if(set==='LOGIN,QUERY'){
      state.propertySolved=true;setStage(6);addFact('E14中实际出现LOGIN与QUERY；未见WRITE、DELETE或TIME_EDIT。');save();showFilm('propertyAudit');
    }else{state.mistakes++;save();toast('只勾选原始日志里真正出现过的操作类型。');}
  });
  $('#openVoice')?.addEventListener('click',()=>{state.voiceSeen=true;markViewed('voice');save();openEvidence('voice')});
}

/* ===== forensic ===== */
function renderForensic(){
  ambient('records');
  const ready=state.forensicSeen.includes('autopsy')&&state.forensicSeen.includes('call')&&state.viewed.includes('message')&&state.viewed.includes('arrival');
  $('#view').innerHTML=`<section class="diegetic-screen"><img class="scene-bg" src="assets/images/scene_forensic_v6.jpg" alt="法医复核室"><div class="scene-shade"></div>
  <div class="prop-stack"><div class="mono">FORENSIC REVIEW / CASE 17</div><h1>把伤害与救助拆成两个时间阶段</h1>
  <div class="medical-file"><button data-forensic="autopsy">查看E17法医底稿</button>${state.forensicSeen.includes('autopsy')?'<img src="assets/images/ev_autopsy.jpg">':''}</div>
  <div class="medical-file"><button data-forensic="call">查看E12急救缓存</button>${state.forensicSeen.includes('call')?'<img src="assets/images/ev_call.jpg">':''}</div>
  ${ready&&!state.forensicSolved?`<div class="medical-file forensic-board"><h3>复核两项事实</h3>
    <p>① 哪份材料说明20:50时邱承仍有自主呼吸？</p>
    <div class="compare-actions"><button data-fact-a="message">E16消息</button><button data-fact-a="arrival">E15到场</button><button data-fact-a="call">E12急救</button></div>
    <p>② 陈默21:29才进入B座，这一时间与“20:50前的最初冲突”是否兼容？</p>
    <div class="compare-actions"><button data-fact-b="no">不兼容</button><button data-fact-b="yes">仍兼容</button></div>
    <p>③ 法医底稿是否允许把“最初伤害”和“之后是否及时救助”分开评价？</p>
    <div class="compare-actions"><button data-fact-c="yes">可以分开</button><button data-fact-c="no">不能分开</button></div>
    <button id="forensicSubmit" class="primary" disabled>提交复核</button></div>`:''}
  </div></section>`;
  $$('[data-forensic]').forEach(b=>b.onclick=()=>{const id=b.dataset.forensic;if(!state.forensicSeen.includes(id))state.forensicSeen.push(id);markViewed(id);save();playFx('paper');renderForensic()});
  let a=null,bv=null,c=null;
  $$('[data-fact-a]').forEach(btn=>btn.onclick=()=>{a=btn.dataset.factA;$$('[data-fact-a]').forEach(x=>x.classList.toggle('active',x===btn));if(a&&bv&&c)$('#forensicSubmit').disabled=false});
  $$('[data-fact-b]').forEach(btn=>btn.onclick=()=>{bv=btn.dataset.factB;$$('[data-fact-b]').forEach(x=>x.classList.toggle('active',x===btn));if(a&&bv&&c)$('#forensicSubmit').disabled=false});
  $$('[data-fact-c]').forEach(btn=>btn.onclick=()=>{c=btn.dataset.factC;$$('[data-fact-c]').forEach(x=>x.classList.toggle('active',x===btn));if(a&&bv&&c)$('#forensicSubmit').disabled=false});
  $('#forensicSubmit')?.addEventListener('click',()=>{
    if(a==='message'&&bv==='no'&&c==='yes'){
      state.forensicSolved=true;setStage(7);addFact('20:50仍有自主呼吸；陈默21:29才到场；最初伤害与之后的救助选择需要分开评价。');save();showFilm('rescueWindow');
    }else{state.mistakes++;save();toast('重新核对E16、E15与法医底稿。');}
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
  <p class="replay-note">${state.expert?'独立复核完成：本轮未显示程序清单与提示，电子记录顺序也经过打乱。':'通关后可从首页进入“独立复核二周目”，在无程序清单、无提示且记录顺序打乱的条件下重新证明案件。'}</p><div class="review-metrics"><span>主动提示：${state.hintUses}</span><span>错误判断：${state.mistakes}</span><span>E18补充录音：${state.voiceSeen?'已入卷':'未入卷'}</span><span>模式：${state.expert?'独立复核':'程序核验'}</span></div><div class="ending-actions"><button id="truthReplay" class="primary">重看第一份口供 · 真相标注</button><button id="sourceReplay">供述来源复盘</button><button id="restart">重新开始案件</button></div></div></section>`;
  $('#truthReplay').onclick=()=>showFilm('replayTruth');
  $('#sourceReplay').onclick=sourceReplay;
  $('#restart').onclick=()=>{reset();location.reload()};
}


function sourceReplay(){
  const rows=[
    ['brass','“桌边那只黄铜书挡。”','事后到场所见'],
    ['position','“他倒在书桌右边。”','事后到场所见'],
    ['drawer','“放回第二层抽屉。”','转述细节偏差'],
    ['arrival','“21点45分左右到。”','为配合口供编造的时间']
  ];
  openModal(`<div class="doc-meta"><div class="mono">POST-CASE / SOURCE TRACE</div><h2>供述来源复盘</h2><p>结案后再看第一次口供。为四句话标注它最可能的来源。</p>
    <div class="source-replay">${rows.map(([id,text])=>`<div class="source-row"><blockquote>${text}</blockquote><select data-source="${id}"><option value="">选择来源</option><option>亲历最初冲突</option><option>事后到场所见</option><option>转述细节偏差</option><option>为配合口供编造的时间</option></select></div>`).join('')}</div>
    <button id="checkSourceReplay" class="primary">提交复盘</button></div>`);
  $('#checkSourceReplay').onclick=()=>{
    let ok=true;
    for(const [id,,ans] of rows){if($(`[data-source="${id}"]`).value!==ans)ok=false}
    if(ok){state.sourceReplayDone=true;save();playFx('stamp');openModal(`<div class="doc-meta"><h2>复盘完成</h2><p>第一次口供里真正危险的不是“假细节太多”，而是大部分细节都是真的。唯一的小偏差，反而暴露了信息来源。</p><p class="mono">SOURCE TRACE / CLOSED</p></div>`)}
    else{state.mistakes++;save();toast('至少有一句话的来源仍不匹配。')}
  };
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
    const entries=Object.entries(D.people);
    const core=entries.filter(([id])=>['chen','lin','zhao','qiu','han','sun'].includes(id));
    const witness=entries.filter(([id])=>['feng','zhong'].includes(id));
    const renderPerson=([id,p])=>`<div class="person-file"><img class="person-portrait" src="assets/images/${p.portrait}" alt="${p.name}"><div class="person-copy"><b>${p.name}</b><small>${p.role}</small><p>${p.public}</p><p class="relation">${p.relation}</p>${p.mid&&state.stage>=p.midStage?`<p class="mid-note">${p.mid}</p>`:''}${state.stage>=8?`<p class="later-note">${p.later}</p>`:''}</div></div>`;
    body.innerHTML=`<h3 class="folder-group-title">核心人物</h3><div class="people-file">${core.map(renderPerson).join('')}</div><h3 class="folder-group-title">外围证人</h3><div class="people-file witness-file">${witness.map(renderPerson).join('')}</div>`;
  }
}
$$('[data-folder-tab]').forEach(b=>b.onclick=()=>renderFolder(b.dataset.folderTab));

/* ===== hint ===== */
function hintKey(){if(state.stage===0)return'transfer';if(state.stage===1)return'drawer';if(state.stage===2)return'records';if(state.stage===3)return'arrival';if(state.stage===4)return'bookstore';if(state.stage===5)return'property';if(state.stage===6)return'forensic';return'final'}
function openHint(){
  const k=hintKey();const lv=state.hintLevel[k]||0;$('#hintText').textContent=lv?D.hints[k][Math.min(lv-1,2)]:'提示只在你主动打开时出现，不会自动写到页面上。';$('#hintPanel').classList.remove('hidden');
}
function nextHint(){const k=hintKey();state.hintLevel[k]=Math.min(3,(state.hintLevel[k]||0)+1);state.hintUses++;save();$('#hintText').textContent=D.hints[k][state.hintLevel[k]-1]}

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