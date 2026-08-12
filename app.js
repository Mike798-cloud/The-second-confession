(()=>{
'use strict';
const D=window.CASE_DATA;
const SAVE='second_confession_v3', META='second_confession_meta_v3';
const LEGACY=['second_confession_v2','second_confession_v1'];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uniq=a=>[...new Set(a||[])];
const ev=id=>D.evidence.find(x=>x[3]===id);
const puzzle=id=>D.puzzles.find(x=>x.id===id);
const defaultState=()=>({
  version:3, stage:0, solved:[], viewed:[], sceneChecked:[], asked:[], marked:[],
  tab:'case', currentInterrogation:'why', theatreSeen:[], hintCount:{}, failures:{}, mode:'guided', sound:true,
  ending:null, recordTags:{}, intakeChecks:{}, compareAnswer:'', auditAnswer:'', arrivalAnswer:'',
  orderAnswer:'', rescueAnswer:'', knowledge:{}, responsibility:{}, finalRoles:{}, finalEvidence:{},
  finalModel:'', noteText:'', tabSeen:['case'], evFilter:'all', transitioned:false, replaySeed:Math.random()
});
let state=defaultState();
let meta={completed:false,bestScore:0,plays:0};
try{meta={...meta,...JSON.parse(localStorage.getItem(META)||'{}')}}catch(e){}

const evidenceStage={confession:0,brass:0,drawer:1,cctv:2,phone:2,payment:2,card:2,access:2,water:3,parcel:3,taxi:3,zhaolog:4,arrival:4,shoe:4,message:5,call:5,autopsy:5,voice:7};
const tabDefs=[['case','卷宗'],['interrogation','讯问'],['scene','现场'],['people','关系人'],['evidence','物证'],['timeline','时间轴'],['reason','核验台'],['final','复核会议']];
const tabStage={case:0,interrogation:0,scene:0,evidence:0,reason:0,people:2,timeline:2,final:7};

function normalize(x){
  const n={...defaultState(),...(x||{})};
  ['solved','viewed','sceneChecked','asked','marked','theatreSeen','tabSeen'].forEach(k=>n[k]=uniq(n[k]));
  ['hintCount','failures','recordTags','intakeChecks','knowledge','responsibility','finalRoles','finalEvidence'].forEach(k=>n[k]=n[k]||{});
  if(!['guided','independent'].includes(n.mode))n.mode='guided';
  n.version=3; return n;
}
function migrateLegacy(raw){
  const old=normalize(raw); old.version=3;
  // 旧存档保留已完成推理与已阅证物；新版界面状态重新建立。
  old.stage=stageFromSolved(old.solved);
  old.transitioned=old.solved.includes('P02');
  return old;
}
function save(){localStorage.setItem(SAVE,JSON.stringify(state));}
function saveMeta(){localStorage.setItem(META,JSON.stringify(meta));}
function load(){
  try{const raw=localStorage.getItem(SAVE); if(raw){state=normalize(JSON.parse(raw)); return true;}}
  catch(e){console.warn('save parse',e)}
  for(const key of LEGACY){try{const raw=localStorage.getItem(key);if(raw){state=migrateLegacy(JSON.parse(raw));save();return true}}catch(e){}}
  return false;
}
function reset(mode='guided'){localStorage.removeItem(SAVE);state=defaultState();state.mode=mode;meta.plays=(meta.plays||0)+1;saveMeta();save()}
function hasSave(){return !!(localStorage.getItem(SAVE)||LEGACY.some(k=>localStorage.getItem(k)))}

/* ---------- AUDIO ---------- */
const audio={started:false,current:null,currentKey:'',loops:{},sfx:{}};
function initAudio(){if(audio.started)return;audio.started=true;
  const mk=(src,loop=false,vol=.12)=>{const a=new Audio(src);a.loop=loop;a.volume=vol;a.preload='auto';return a};
  audio.loops.interrogation=mk('assets/audio/interrogation_room.wav',true,.10);
  audio.loops.rain=mk('assets/audio/rain_window.wav',true,.09);
  audio.loops.records=mk('assets/audio/records_room.wav',true,.075);
  audio.sfx.rec=mk('assets/audio/rec_click.wav',false,.24);
  audio.sfx.paper=mk('assets/audio/paper_rustle.wav',false,.20);
  audio.sfx.stamp=mk('assets/audio/stamp.wav',false,.25);
  audio.sfx.door=mk('assets/audio/door.wav',false,.20);
  audio.sfx.phone=mk('assets/audio/phone_beep.wav',false,.18);
  audio.sfx.printer=mk('assets/audio/printer.wav',false,.18);
  audio.sfx.low=mk('assets/audio/transition_low.wav',false,.22);
}
function playSfx(k){if(!state.sound)return;initAudio();const a=audio.sfx[k];if(!a)return;try{a.currentTime=0;a.play().catch(()=>{})}catch(e){}}
function ambientKey(){if(!state.sound)return'';if(!$('#theatre').classList.contains('hidden'))return'interrogation';if(state.tab==='interrogation')return'interrogation';if(state.tab==='scene')return'rain';return'records'}
function syncAmbient(){initAudio();const key=ambientKey();if(key===audio.currentKey)return;if(audio.current){audio.current.pause();audio.current.currentTime=0}audio.currentKey=key;audio.current=key?audio.loops[key]:null;if(audio.current&&state.sound)audio.current.play().catch(()=>{})}
function toggleSound(){state.sound=!state.sound;save();if(!state.sound&&audio.current){audio.current.pause();audio.current=null;audio.currentKey=''}renderChrome();syncAmbient()}

/* ---------- STATE / PROGRESSION ---------- */
function stageFromSolved(s){
  const has=(...ids)=>ids.every(id=>s.includes(id));
  if(has('P13','P14'))return 7;
  if(has('P11','P12'))return 6;
  if(has('P09','P10'))return 5;
  if(has('P06','P07','P08'))return 4;
  if(has('P03','P04','P05'))return 3;
  if(has('P02'))return 2;
  if(has('P01'))return 1;
  return 0;
}
function updateStage(){state.stage=stageFromSolved(state.solved);save()}
function currentPuzzle(){return D.puzzles.find(p=>!state.solved.includes(p.id)&&p.stage<=state.stage)}
function isEvAvailable(id){return (evidenceStage[id]??99)<=state.stage}
function unlocked(tab){if(tab==='final')return state.stage>=7;return state.stage>=(tabStage[tab]??0)}
function solve(id,{silent=false}={}){
  if(state.solved.includes(id))return;
  state.solved.push(id);updateStage();save();
  if(!silent)playSfx('stamp');
  const after=()=>{render();syncAmbient()};
  if(id==='P01')return showTheatre('intakePass',after);
  if(id==='P02')return showTheatre('drawer',()=>showTransition('移送暂缓','第17号案件 · 补充复核',()=>{state.transitioned=true;save();after()}));
  if(id==='P08')return showTheatre('lastSeen',after);
  if(id==='P09')return showTheatre('audit',after);
  if(id==='P12')return showTheatre('rescue',after);
  if(id==='P13')return showTheatre('second',after);
  after();
}
function fail(id,msg='这项判断还不能由当前材料支持。'){state.failures[id]=(state.failures[id]||0)+1;save();toast(msg,'bad')}
function score(){const fails=Object.values(state.failures).reduce((a,b)=>a+(+b||0),0);const hints=Object.values(state.hintCount).reduce((a,b)=>a+(+b||0),0);return Math.max(0,Math.round(100-fails*2-hints*4+(state.mode==='independent'?6:0)))}

/* ---------- CHROME ---------- */
function chapterName(){return D.chapters[Math.min(state.stage,D.chapters.length-1)]}
function procedureText(){
  if(state.mode==='independent')return'';
  const texts=[
    '程序：核对第一次讯问、现场与核心物证。',
    '程序：完成现场勘验册最后一项定位复核。',
    '程序：逐条复查20:36—21:24记录的来源与证明层级。',
    '程序：完成21:31—21:52记录复查，并形成批次意见。',
    '程序：核对物业设备访问与相关人员到场时间。',
    '程序：复核伤后处置记录与人员先后顺序。',
    '程序：整理供述细节来源与行为发生顺序。',
    '程序：召开案件复核会议。'
  ]; return texts[state.stage]||'';
}
function newDot(tab){return unlocked(tab)&&!state.tabSeen.includes(tab)?'<i class="new-dot" aria-label="新内容"></i>':''}
function renderChrome(){
  $('#casebarTitle').textContent=state.transitioned?'荔州市公安局 · 第17号案件补充复核':'荔州市公安局 · 第17号案件移送核验';
  $('#casebarSub').textContent=state.transitioned?'CASE 17 / SUPPLEMENTAL REVIEW':'CASE 17 / TRANSFER CHECK';
  $('#chapterLabel').textContent=chapterName();
  $('#progressLabel').textContent=`材料 ${state.solved.length} / 14`;
  $('#soundToggle').textContent=`声音：${state.sound?'开':'关'}`;$('#soundToggle').setAttribute('aria-pressed',String(state.sound));
  $('#procedure').textContent=procedureText();$('#procedure').classList.toggle('hidden',!procedureText());
  const visibleTabs=tabDefs.filter(([id])=>unlocked(id));$('#tabs').innerHTML=visibleTabs.map(([id,label],i)=>`<button class="tab ${state.tab===id?'active':''}" data-tab="${id}" data-index="${String(i+1).padStart(2,'0')}">${label}${newDot(id)}</button>`).join('');
  $$('[data-tab]').forEach(b=>b.onclick=()=>{if(!unlocked(b.dataset.tab))return;state.tab=b.dataset.tab;state.tabSeen=uniq([...state.tabSeen,state.tab]);save();render();});
  syncAmbient();
}
function render(){renderChrome();const m={case:renderCase,interrogation:renderInterrogation,scene:renderScene,people:renderPeople,evidence:renderEvidence,timeline:renderTimeline,reason:renderReason,final:renderFinal};(m[state.tab]||renderCase)()}

/* ---------- CASE VIEW ---------- */
function renderCase(){
  const pre=!state.solved.includes('P02');
  const facts=state.solved.map(id=>puzzle(id)?.fact).filter(Boolean);
  $('#view').innerHTML=pre?`
    <section class="case-folder transfer-view">
      <div class="folder-stamp neutral">待移送</div><div class="doc-kicker">CASE 17 / TRANSFER MATERIAL</div>
      <h2>案件移送卷</h2><p class="doc-sub">原案材料核验中</p>
      <div class="case-grid"><dl><dt>死者</dt><dd>邱承 / 38岁</dd><dt>到案人员</dt><dd>陈默 / 主动投案</dd><dt>地点</dt><dd>西河公寓B座4-702</dd></dl><dl><dt>拟移送事实</dt><dd>故意伤害致死相关材料</dd><dt>卷宗页数</dt><dd>214页 + 电子附件</dd><dt>当前程序</dt><dd>${state.stage===0?'基础一致性核验':'现场定位补充核验'}</dd></dl></div>
      <div class="case-photo"><img src="assets/images/scene_apartment.jpg" alt="4-702现场环境重建"></div>
      <div class="transfer-checks"><b>随卷核验</b><span class="${state.asked.includes('weapon')?'done':''}">讯问片段</span><span class="${state.sceneChecked.includes('brass')?'done':''}">现场材料</span><span class="${state.viewed.includes('brass')?'done':''}">物证登记</span></div>
    </section>`:`
    <section class="case-folder review-view">
      <div class="folder-stamp alert">补充复核</div><div class="doc-kicker">CASE 17 / SUPPLEMENTAL REVIEW</div>
      <h2>第17号案件</h2><p class="doc-sub">原移送程序已暂缓</p>
      <div class="case-grid"><dl><dt>死者</dt><dd>邱承 / 38岁</dd><dt>原到案人员</dt><dd>陈默</dd><dt>地点</dt><dd>西河公寓B座4-702</dd></dl><dl><dt>当前材料阶段</dt><dd>${esc(chapterName())}</dd><dt>已确认事实</dt><dd>${facts.length}项</dd><dt>复核原则</dt><dd>原始材料与推论分开记录</dd></dl></div>
      <div class="confirmed-facts">${facts.length?facts.map((f,i)=>`<article><span>${String(i+1).padStart(2,'0')}</span><p>${esc(f)}</p></article>`).join(''):'<p class="muted">尚未形成新的复核事实。</p>'}</div>
    </section>`;
}

/* ---------- INTERROGATION ---------- */
function availableQuestions(){return D.interrogation.filter(q=>q.stage<=state.stage)}
function renderInterrogation(){
  let id=state.currentInterrogation||availableQuestions()[0].id;let q=availableQuestions().find(x=>x.id===id)||availableQuestions()[0];state.currentInterrogation=q.id;
  const asked=state.asked.includes(q.id);
  $('#view').innerHTML=`<section class="interrogation-room">
    <div class="interrogation-monitor"><img src="assets/images/scene_interrogation.jpg" alt="讯问室环境重建"><div class="scanline"></div><div class="cam-hud"><span class="rec">● REC</span><span>ROOM 03 / CAM B</span><span>${asked?'PLAY':'PAUSE'}</span></div>
      <div class="caption"><b>${esc(q.q)}</b><p>${asked?esc(q.a).replace(/\n/g,'<br>'):'选择右侧问题播放对应讯问片段。'}</p>${asked?`<small>行为记录：${esc(q.behaviour)}</small>`:''}</div>
    </div>
    <aside class="interrogation-console"><div class="console-kicker">第一次讯问 / PLAYBACK</div><h2>陈默</h2><div class="question-bank">${availableQuestions().map(x=>`<button class="question ${x.id===q.id?'active':''} ${state.asked.includes(x.id)?'played':''}" data-question="${x.id}">${esc(x.q)}</button>`).join('')}</div>
      <div class="console-actions"><button class="primary" data-play-question>播放片段</button>${asked?`<button data-mark="${q.mark}" class="${state.marked.includes(q.mark)?'marked':''}">${state.marked.includes(q.mark)?'已记入笔记':'标记原句'}</button>`:''}</div>
      <p class="console-note">录像只呈现原话和可观察行为，不自动标注“真/假”。</p></aside>
  </section>`;
  $$('[data-question]').forEach(b=>b.onclick=()=>{state.currentInterrogation=b.dataset.question;save();renderInterrogation()});
  $('[data-play-question]').onclick=()=>{state.asked=uniq([...state.asked,q.id]);playSfx('rec');save();renderInterrogation()};
  $$('[data-mark]').forEach(b=>b.onclick=()=>{state.marked=uniq([...state.marked,b.dataset.mark]);save();renderInterrogation()});
}

/* ---------- SCENE ---------- */
function renderScene(){
  const hs=D.sceneHotspots.filter(h=>h.stage<=state.stage);
  $('#view').innerHTML=`<section class="scene-investigation"><div class="scene-head"><div><span>SCENE / 4-702</span><h2>现场勘查</h2></div><p>移动鼠标检查可交互区域；页面不显示发光轮廓。</p></div>
  <div class="scene-canvas"><img src="assets/images/scene_apartment.jpg" alt="4-702案发现场环境重建">${hs.map(h=>`<button class="hotspot ${state.sceneChecked.includes(h.id)?'checked':''}" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%" data-hotspot="${h.id}" aria-label="检查${esc(h.name)}"><span>${state.sceneChecked.includes(h.id)?'已检':'检查'}</span></button>`).join('')}<div class="scene-caption">4-702 / ENVIRONMENT RECONSTRUCTION</div></div>
  <div class="scene-mobile-list">${hs.map(h=>`<button data-hotspot="${h.id}" class="${state.sceneChecked.includes(h.id)?'checked':''}">${esc(h.name)}${state.sceneChecked.includes(h.id)?' · 已检':''}</button>`).join('')}</div></section>`;
  $$('[data-hotspot]').forEach(b=>b.onclick=()=>inspectHotspot(b.dataset.hotspot));
}
function inspectHotspot(id){const h=D.sceneHotspots.find(x=>x.id===id);if(!h||h.stage>state.stage)return;state.sceneChecked=uniq([...state.sceneChecked,id]);if(ev(id))state.viewed=uniq([...state.viewed,id]);save();playSfx('paper');openModal(`<div class="scene-detail"><div class="scene-detail-img"><img class="zoomable" src="assets/images/${h.img}" alt="${esc(h.name)}"></div><div><div class="doc-kicker">SCENE CHECK</div><h2>${esc(h.name)}</h2><p>${esc(h.text)}</p><p class="muted">点击图片可放大查看。</p></div></div>`);bindZoom()}

/* ---------- PEOPLE ---------- */
function renderPeople(){
  const list=D.people.filter(p=>p.stage<=state.stage);
  $('#view').innerHTML=`<section class="people-wall"><header><span>RELATION FILES / CASE 17</span><h2>关系人档案</h2><p>这里只显示已进入卷宗的身份资料。后续补充笔录会随调查开放。</p></header><div class="people-grid">${list.map((p,i)=>`<button class="person-file" data-person="${p.id}" style="--r:${[-.5,.35,.1,-.35,.45,-.2,.25,-.45][i]||0}deg"><div class="person-file-photo"><img src="assets/images/${p.scene}" alt="${esc(p.name)}关联环境照"></div><div class="person-file-tab">${p.file}</div><b>${esc(p.name)}</b><small>${esc(p.role)}</small><p>${esc(p.bio)}</p></button>`).join('')}</div></section>`;
  $$('[data-person]').forEach(b=>b.onclick=()=>showPerson(b.dataset.person));
}
function showPerson(id){const p=D.people.find(x=>x.id===id);if(!p)return;const reveal=(id==='chen'&&state.solved.includes('P13'))||(id==='lin'&&state.solved.includes('P12'))||(id==='zhao'&&state.solved.includes('P09'))||(id==='han'&&state.solved.includes('P08'));
  openModal(`<div class="person-detail"><div class="person-detail-photo"><img src="assets/images/${p.scene}" alt="${esc(p.name)}关联环境"><small>${p.file} / ARCHIVE IMAGE</small></div><div><div class="doc-kicker">PERSON FILE ${p.file}</div><h2>${esc(p.name)}</h2><p class="roleline">${esc(p.role)}</p><section><h4>基础资料</h4><p>${esc(p.bio)}</p></section><section><h4>已核实信息</h4><ul>${p.known.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section><section><h4>本人原话</h4><p class="quote">${esc(p.statement)}</p></section>${reveal?`<section><h4>补充复核后</h4><p>${esc(p.later)}</p></section>`:''}</div></div>`)}

/* ---------- EVIDENCE ---------- */
function renderEvidence(){const cats=['all','现场材料','电子记录','通信记录','实物','影像记录','系统日志','法医材料','讯问材料'];const list=D.evidence.filter(e=>isEvAvailable(e[3])&&(state.evFilter==='all'||e[4]===state.evFilter));
  $('#view').innerHTML=`<section class="evidence-lab"><div class="lab-head"><div><span>EVIDENCE TABLE / CASE 17</span><h2>物证与原始材料</h2><p>${D.evidence.filter(e=>isEvAvailable(e[3])).length}/18 项已入卷</p></div><div class="lab-filters">${cats.map(c=>`<button data-filter="${c}" class="${state.evFilter===c?'active':''}">${c==='all'?'全部':c}</button>`).join('')}</div></div><div class="evidence-grid">${list.map(e=>`<button class="evidence-card" data-ev="${e[3]}"><img src="assets/images/${e[2]}" alt="${esc(e[1])}"><span class="ev-bag-label">${e[0]}</span>${state.viewed.includes(e[3])?'<span class="ev-read">已阅</span>':''}<div class="ev-info"><b>${esc(e[1])}</b><small>${esc(e[4])}</small></div></button>`).join('')}</div></section>`;
  $$('[data-filter]').forEach(b=>b.onclick=()=>{state.evFilter=b.dataset.filter;save();renderEvidence()});$$('[data-ev]').forEach(b=>b.onclick=()=>showEvidence(b.dataset.ev));
}
function showEvidence(id){if(!isEvAvailable(id))return;const e=ev(id),m=D.evidenceMeta[id];state.viewed=uniq([...state.viewed,id]);if(id==='voice'&&state.ending==='standard')state.ending='complete';save();playSfx('paper');let extra='';
  if(id==='voice')extra=`<div class="voice-transcript"><b>辅助转写 / 11秒</b><p>林夏：“我打120。”</p><p>赵序：“先别打。你现在报警，所有人都会把这当成你预谋的。”</p><small>关键内容提供文字替代，不依赖音频。</small></div>`;
  openModal(`<div class="evidence-detail"><div class="evidence-large"><img class="zoomable" src="assets/images/${e[2]}" alt="${esc(e[1])}"></div><div class="evidence-sheet"><div class="doc-kicker">${e[0]} / ${esc(e[4])}</div><h2>${esc(e[1])}</h2><dl><dt>来源</dt><dd>${esc(m[1])}</dd><dt>原始记录</dt><dd>${esc(m[2])}</dd></dl>${extra}<p class="muted">点击左侧图片可放大；推论不会写在材料标题中。</p></div></div>`);bindZoom();
}


function shuffledForReplay(arr){
  if(state.mode!=='independent')return arr;
  const seed=Math.floor((state.replaySeed||.314159)*1000000);
  const h=x=>{const k=(x.id||x[3]||String(x));let n=seed;for(let i=0;i<k.length;i++)n=(n*33+k.charCodeAt(i))>>>0;return Math.sin(n)*10000%1};
  return [...arr].sort((a,b)=>h(a)-h(b));
}

/* ---------- TIMELINE / RECORD AUDIT ---------- */
const tagOptions=[['person','本人可确认'],['token','账户/凭证活动'],['environment','环境活动'],['unknown','无法判断']];
function renderTimeline(){
  const records=shuffledForReplay(D.records.filter(r=>r.stage<=state.stage));const inClassify=state.stage<=3;
  $('#view').innerHTML=`<section class="timeline-room"><header><div><span>TIME / SOURCE AUDIT</span><h2>${inClassify?'记录来源复核':'案件时间白板'}</h2></div><p>${inClassify?'给每条记录标注它本身能够确认到的层级。':'已确认时间与来源并列展示；人物身份需要单独证据。'}</p></header>
    ${inClassify?`<div class="record-board">${records.map(r=>recordCard(r)).join('')}</div>${state.solved.includes('P03')&&state.solved.includes('P04')&&state.solved.includes('P05')&&state.solved.includes('P06')&&state.solved.includes('P07')&&!state.solved.includes('P08')?synthesisPanel():''}`:fullTimeline()}
  </section>`;
  $$('[data-record-open]').forEach(b=>b.onclick=()=>showEvidence(b.dataset.recordOpen));$$('[data-record-tag]').forEach(b=>b.onclick=()=>classifyRecord(b.dataset.recordTag,b.dataset.tag));$$('[data-synth]').forEach(b=>b.onclick=()=>{if(b.dataset.synth==='correct')solve('P08');else fail('P08')});
}
function recordCard(r){const e=ev(r.id),read=state.viewed.includes(r.id);return `<article class="record-card ${state.recordTags[r.id]?'tagged':''}"><div class="record-time">${r.time}</div><button class="record-thumb" data-record-open="${r.id}" aria-label="查看${esc(r.title)}原始材料"><img src="assets/images/${e[2]}" alt="${esc(r.title)}"></button><div class="record-body"><b>${esc(r.title)}</b><small>来源：${esc(r.source)} · ${read?'已阅':'先查看原始材料'}</small><div class="record-tags">${tagOptions.map(([id,l])=>`<button data-record-tag="${r.id}" data-tag="${id}" class="${state.recordTags[r.id]===id?'selected':''}" ${read?'':'disabled'}>${l}</button>`).join('')}</div></div></article>`}
function classifyRecord(id,tag){state.recordTags[id]=tag;save();const r=D.records.find(x=>x.id===id);if(tag!==r.correct){fail(`record-${id}`,'这个标签与材料本身能够确认的范围不一致。');return renderTimeline()}
  const map={cctv:'P03',payment:'P04',access:'P05',taxi:'P07'};if(map[id]&&!state.solved.includes(map[id]))solve(map[id],{silent:true});
  if(state.recordTags.water==='environment'&&state.recordTags.parcel==='token'&&!state.solved.includes('P06'))solve('P06',{silent:true});
  render();
}
function synthesisPanel(){return `<div class="synthesis"><div class="doc-kicker">BATCH REVIEW / 20:36—21:52</div><h3>请选择这组记录能够共同支持的最强表述</h3><button data-synth="a">21:18—21:52持续存在邱承本人的直接活动。</button><button data-synth="correct">20:36后仍有多条真实活动记录，但没有再次直接确认本人。</button><button data-synth="c">后续电子记录均被人为伪造。</button></div>`}
function fullTimeline(){const items=[['20:36','邱承出现在电梯','面部可确认'],['20:44','林夏进入4层','消防梯视频'],['20:50','林夏发送消息','手机缓存'],['20:52','拨打120，4秒中断','通信缓存'],['21:06','赵序登录物业终端','设备日志'],['21:18','移动支付16元','账户/设备'],['21:24','Q-4702门卡通过','卡片'],['21:27','陈默车辆进入车库','车场影像'],['21:29','陈默进入B座','消防梯影像'],['21:31','4-702用水18.6L','水表'],['21:38','快递柜7-14开启','取件码'],['21:52','邱承账户下单网约车','账户']];return `<div class="whiteboard"><div class="whiteboard-line"></div>${items.map((x,i)=>`<article class="wb-event" style="--i:${i}"><time>${x[0]}</time><b>${x[1]}</b><small>${x[2]}</small></article>`).join('')}</div>`}

/* ---------- REASONING WORKBENCH ---------- */
function renderReason(){const p=currentPuzzle();if(!p){$('#view').innerHTML=`<section class="reason-desk"><div class="reason-empty">当前阶段没有待处理的核验项。</div></section>`;return}
  let html='';switch(p.type){
    case'intake':html=renderIntakePuzzle(p);break;case'compare':html=renderComparePuzzle(p);break;case'audit':html=renderAuditPuzzle(p);break;case'arrival':html=renderArrivalPuzzle(p);break;case'order':html=renderOrderPuzzle(p);break;case'rescue':html=renderRescuePuzzle(p);break;case'knowledge':html=renderKnowledgePuzzle(p);break;case'responsibility':html=renderResponsibilityPuzzle(p);break;default:html=`<div class="route-card"><h3>${esc(p.label)}</h3><p>这一核验项在“时间轴”页面完成。</p><button data-route="timeline">前往时间轴</button></div>`;}
  $('#view').innerHTML=`<section class="reason-desk"><header><span>WORKBENCH / ${p.id}</span><h2>${esc(p.label)}</h2></header>${html}</section>`;bindReason(p);
}
function renderIntakePuzzle(){const req={weapon:state.asked.includes('weapon'),body:state.asked.includes('body'),brass:state.sceneChecked.includes('brass'),floor:state.sceneChecked.includes('body')};const ready=Object.values(req).every(Boolean);return `<div class="intake-board"><div class="intake-row"><b>供述：凶器</b><span>${req.weapon?'已播放':'未播放'}</span><b>现场：书桌边缘</b><span>${req.brass?'已检查':'未检查'}</span></div><div class="intake-row"><b>供述：倒地位置</b><span>${req.body?'已播放':'未播放'}</span><b>现场：书桌右侧</b><span>${req.floor?'已检查':'未检查'}</span></div><button class="primary" data-intake-submit ${ready?'':'disabled'}>确认两项材料对应</button>${ready?'':'<p class="muted">先在讯问和现场页完成基础核验。</p>'}</div>`}
function renderComparePuzzle(){const ready=state.asked.includes('drawer')&&state.sceneChecked.includes('drawer');return `<div class="compare-desk"><article><span>讯问原句</span><blockquote>${state.asked.includes('drawer')?'“擦过以后，放回书桌左边第二层抽屉。”':'尚未播放“之后怎么处理书挡”片段。'}</blockquote></article><article><span>现场定位</span><blockquote>${state.sceneChecked.includes('drawer')?'“提取位置：书桌左侧第一层。”':'尚未完成补充定位检查。'}</blockquote></article>${ready?`<div class="binary"><button data-compare="same">两条记录一致</button><button data-compare="different">两条记录不一致</button></div>`:'<p class="muted">把两份原始记录都打开后再作判断。</p>'}</div>`}
function renderAuditPuzzle(){if(!state.viewed.includes('zhaolog'))return `<div class="route-card"><h3>需要E14原始日志</h3><p>先到物证页打开赵序设备访问日志，再回到这里复核。</p><button data-route="evidence">前往物证台</button></div>`;return `<div class="terminal-audit"><div class="terminal-screen"><p>21:06:14 LOGIN zhao_xu</p><p>21:07:02 QUERY ACCESS_LOG 20260518</p><p>21:08:31 QUERY WATER_METER 4702</p><p>21:09:10 EXPORT CSV / local</p><p>21:10:44 LOGOUT</p></div><h3>这段审计日志里是否出现WRITE / UPDATE / DELETE等写入或修改操作？</h3><div class="binary"><button data-audit="yes">出现</button><button data-audit="no">没有出现</button></div></div>`}
function renderArrivalPuzzle(){if(!state.viewed.includes('arrival'))return `<div class="route-card"><h3>需要E15到场记录</h3><p>先打开车库/消防梯联合记录。</p><button data-route="evidence">前往物证台</button></div>`;return `<div class="arrival-strip"><p>请选择能够最早直接确认陈默进入西河公寓范围的记录。</p><div class="arrival-options">${['20:44 林夏进入4层','21:06 赵序登录终端','21:27 陈默车辆入库','21:29 陈默进入B座'].map((x,i)=>`<button data-arrival="${i}">${x}</button>`).join('')}</div></div>`}
function renderOrderPuzzle(){if(!state.viewed.includes('message')||!state.viewed.includes('arrival'))return `<div class="route-card"><h3>需要E16与E15</h3><p>先分别查看林夏消息缓存和陈默到场记录。</p><button data-route="evidence">前往物证台</button></div>`;return `<div class="order-puzzle"><h3>只比较两份记录：哪一条先发生？</h3><button data-order="message"><time>20:50</time><b>林夏消息：“他倒下了，还在喘。”</b></button><button data-order="arrival"><time>21:27</time><b>陈默车辆进入西河公寓车库</b></button></div>`}
function renderRescuePuzzle(){if(!['message','call','autopsy'].every(x=>state.viewed.includes(x)))return `<div class="route-card"><h3>需要E16、E12、E17</h3><p>先查看消息缓存、急救号码缓存与法医底稿。</p><button data-route="evidence">前往物证台</button></div>`;const events=[['20:48','冲突后头部受伤'],['20:50','“他倒下了，还在喘”'],['20:52','拨打120 / 4秒'],['21:27','陈默到场']];return `<div class="rescue-band"><div class="medical-note">法医底稿：头部损伤后存在可救治时间窗。</div><div class="rescue-events">${events.map((x,i)=>`<button data-rescue="${i}"><time>${x[0]}</time><span>${x[1]}</span></button>`).join('')}</div><p>请选择“救助已经启动、但没有真正建立”的记录节点。</p></div>`}
function renderKnowledgePuzzle(){if(!['confession','arrival','message'].every(x=>state.viewed.includes(x)))return `<div class="route-card"><h3>需要E01、E15、E16</h3><p>先回看第一次供述、到场记录与林夏消息。</p><button data-route="evidence">前往物证台</button></div>`;const rows=[['body','尸体倒地位置',['亲历最初冲突','事后进入现场可见','只能来自口供脚本']],['weapon','黄铜书挡是涉案物',['亲历最初冲突','事后现场/他人转述可知','无法得知']],['drawer','书挡被放回“第二层”',['亲历最初冲突','事后现场可见','准备口供时被转述的细节']]];return `<div class="knowledge-matrix"><p>根据已经确认的到场时间，为三项供述细节选择最合理的信息来源。</p>${rows.map(r=>`<label><b>${r[1]}</b><select data-knowledge="${r[0]}"><option value="">请选择</option>${r[2].map((o,i)=>`<option value="${i}">${o}</option>`).join('')}</select></label>`).join('')}<button class="primary" data-knowledge-submit>提交来源矩阵</button></div>`}
function renderResponsibilityPuzzle(){if(!['brass','autopsy','call','zhaolog','confession'].every(x=>state.viewed.includes(x)))return `<div class="route-card"><h3>责任材料尚未阅齐</h3><p>至少需要E02、E17、E12、E14和E01。</p><button data-route="evidence">前往物证台</button></div>`;const rows=[['initial','20:48附近 / 初始伤害',['林夏','陈默','赵序']],['rescue','20:52 / 救助中断',['林夏 / 赵序','陈默','韩川']],['timeline','21:06后 / 记录利用',['赵序','陈默','韩川']],['confession','第三天 / 主动投案',['陈默','林夏','赵序']]];return `<div class="responsibility-chain"><p>先按发生顺序整理行为，不在这一页判断最终罪名。</p>${rows.map(r=>`<label><span>${r[1]}</span><select data-resp="${r[0]}"><option value="">选择主要行为人</option>${r[2].map(o=>`<option>${o}</option>`).join('')}</select></label>`).join('')}<button class="primary" data-resp-submit>形成行为链</button></div>`}
function bindReason(p){
  $$('[data-route]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.route;save();render()});
  const a=$('[data-intake-submit]');if(a)a.onclick=()=>solve('P01');
  $$('[data-compare]').forEach(b=>b.onclick=()=>b.dataset.compare==='different'?solve('P02'):fail('P02'));
  $$('[data-audit]').forEach(b=>b.onclick=()=>b.dataset.audit==='no'?solve('P09'):fail('P09'));
  $$('[data-arrival]').forEach(b=>b.onclick=()=>b.dataset.arrival==='2'?solve('P10'):fail('P10'));
  $$('[data-order]').forEach(b=>b.onclick=()=>b.dataset.order==='message'?solve('P11'):fail('P11'));
  $$('[data-rescue]').forEach(b=>b.onclick=()=>b.dataset.rescue==='2'?solve('P12'):fail('P12'));
  const ks=$('[data-knowledge-submit]');if(ks)ks.onclick=()=>{const v={};$$('[data-knowledge]').forEach(s=>v[s.dataset.knowledge]=s.value);if(v.body==='1'&&v.weapon==='1'&&v.drawer==='2')solve('P13');else fail('P13')};
  const rs=$('[data-resp-submit]');if(rs)rs.onclick=()=>{const v={};$$('[data-resp]').forEach(s=>v[s.dataset.resp]=s.value);if(v.initial==='林夏'&&v.rescue==='林夏 / 赵序'&&v.timeline==='赵序'&&v.confession==='陈默')solve('P14');else fail('P14')};
}

/* ---------- FINAL ---------- */
function renderFinal(){if(state.stage<7){$('#view').innerHTML='<section class="review-room"><div class="locked-room">复核会议尚未召开。</div></section>';return}if(state.ending)return renderEnding();
  const available=D.evidence.filter(e=>state.viewed.includes(e[3]));
  $('#view').innerHTML=`<section class="review-room"><header><span>CASE 17 / REVIEW MEETING</span><h2>案件复核会议</h2><p>为四段行为分别确定主要行为人，并挂接至少两份已经阅卷的材料。</p></header><div class="review-table">${D.final.roles.map(r=>`<article class="review-role"><h3>${r.label}</h3><select data-final-person="${r.id}"><option value="">选择主要行为人</option>${r.people.map(p=>`<option>${p}</option>`).join('')}</select><div class="review-evidence">${available.map(e=>`<label><input type="checkbox" data-final-ev="${r.id}" value="${e[3]}"><span>${e[0]} ${esc(e[1])}</span></label>`).join('')}</div></article>`).join('')}</div><div class="case-model"><h3>案件模型</h3>${D.final.models.map(m=>`<label><input type="radio" name="finalModel" value="${esc(m)}"><span>${esc(m)}</span></label>`).join('')}</div><button class="seal-button" id="submitFinal">生成复核结论</button><div id="finalResult" class="final-result"></div></section>`;
  $('#submitFinal').onclick=submitFinal;
}
function submitFinal(){let good=true;D.final.roles.forEach(r=>{const p=$(`[data-final-person="${r.id}"]`).value;const chosen=$$(`[data-final-ev="${r.id}"]:checked`).map(x=>x.value);if(p!==r.correct||!r.need.every(x=>chosen.includes(x)))good=false});const model=$('input[name="finalModel"]:checked')?.value||'';if(model!==D.final.correctModel)good=false;if(!good){state.failures.final=(state.failures.final||0)+1;save();$('#finalResult').textContent='当前责任配置仍有材料无法支撑。检查“谁做了什么”和对应证据。';$('#finalResult').className='final-result bad';return}
  state.ending=state.viewed.includes('voice')?'complete':'standard';meta.completed=true;meta.bestScore=Math.max(meta.bestScore||0,score());save();saveMeta();playSfx('printer');showTheatre('ending',()=>{render();});
}
function renderEnding(){const e=D.endings[state.ending]||D.endings.standard;const independent=state.mode==='independent';$('#view').innerHTML=`<section class="ending-room"><div class="ending-old"><span>原移送意见</span><b>陈默 · 故意杀人</b><div class="strike-stamp">撤回</div></div><div class="ending-paper"><div class="doc-kicker">CASE 17 / FINAL REVIEW</div><h2>${esc(independent?D.endings.independent.title:e.title)}</h2><p>${esc(independent?D.endings.independent.text:e.text)}</p><div class="ending-responsibilities"><span>林夏 · 初始伤害 / 救助处置</span><span>赵序 · 事后掩饰设计</span><span>陈默 · 虚假自首</span></div><div class="ending-score">复核评分 <b>${score()}</b> / 100 · 提示深度 ${Object.values(state.hintCount).reduce((a,b)=>a+b,0)} · 失败 ${Object.values(state.failures).reduce((a,b)=>a+b,0)}</div>${!state.viewed.includes('voice')?'<p class="epilogue-note">卷宗中还有一份新入卷材料未查看。</p>':''}<div class="ending-actions"><button data-act="new-independent">二周目 · 独立复核</button><button data-tab="case">回看卷宗</button></div></div></section>`;$$('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;save();render()});}

/* ---------- MODALS / TOOLS / HINTS ---------- */
function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');syncAmbient()}
function closeModal(){$('#modal').classList.add('hidden');render();syncAmbient()}
function bindZoom(){$$('.zoomable').forEach(img=>img.onclick=()=>img.classList.toggle('zoomed'))}
function toast(msg,type='good'){const t=$('#toast');t.textContent=msg;t.className=`toast ${type}`;setTimeout(()=>t.classList.add('hidden'),2200)}
function showNotebook(){const facts=state.solved.map(id=>puzzle(id)?.fact).filter(Boolean);$('#notebookBody').innerHTML=`<div class="notebook-facts">${facts.length?facts.map((f,i)=>`<p><span>${String(i+1).padStart(2,'0')}</span>${esc(f)}</p>`).join(''):'<p class="muted">尚无已确认事实。</p>'}</div><label class="free-note"><b>我的记录</b><textarea id="freeNote" placeholder="这里不会自动判断对错。">${esc(state.noteText)}</textarea></label>`;$('#notebook').classList.remove('hidden');$('#freeNote').oninput=e=>{state.noteText=e.target.value;save()}}
function closeNotebook(){$('#notebook').classList.add('hidden')}
function showHint(){const p=currentPuzzle();if(!p){return toast('当前没有待处理的核心核验项。')};const hs=D.hints[p.id]||[];let depth=Math.min((state.hintCount[p.id]||0)+1,3);state.hintCount[p.id]=depth;save();openModal(`<div class="hint-sheet"><div class="doc-kicker">主动提示 / ${p.id}</div><h2>第 ${depth} 级提示</h2><p>${esc(hs[depth-1]||'请重新查看原始材料。')}</p>${depth<3?'<button data-deeper-hint>再具体一点</button>':'<p class="muted">已到第三级。</p>'}</div>`);const b=$('[data-deeper-hint]');if(b)b.onclick=()=>{closeModal();showHint()}}
function tools(){const payload=()=>JSON.stringify({version:3,state},null,2);openModal(`<div class="tools-sheet"><div class="doc-kicker">LOCAL TOOLS</div><h2>存档与设置</h2><button id="exportSave">导出存档</button><label class="import-label">导入存档<input type="file" id="importSave" accept="application/json"></label><button id="restartCase" class="danger">重新开始当前模式</button><p class="muted">所有进度保存在本机浏览器 localStorage。</p></div>`);$('#exportSave').onclick=()=>{const blob=new Blob([payload()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='第二份口供_存档.json';a.click();URL.revokeObjectURL(a.href)};$('#importSave').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);state=normalize(x.state||x);save();closeModal();render();toast('存档已导入')}catch(err){toast('存档文件无法读取','bad')}};r.readAsText(f)};$('#restartCase').onclick=()=>{if(confirm('确定清空当前案件进度？')){reset(state.mode);location.reload()}}}

/* ---------- THEATRE ---------- */
function showTheatre(key,done){const seq=D.theatre[key];if(!seq||!seq.length){done?.();return}state.theatreSeen=uniq([...state.theatreSeen,key]);save();let i=0;const el=$('#theatre');el.classList.remove('hidden');playSfx('door');
  function frame(){const f=seq[i];$('#theatreImg').src=f.img.startsWith('ev_')||f.img.startsWith('scene_')?`assets/images/${f.img}`:`assets/images/${f.img}`;$('#theatreSceneLabel').textContent=f.scene||'';$('#theatreTime').textContent=f.time||'';$('#theatreSpeaker').textContent=f.speaker||'';$('#theatreLine').textContent=f.line||'';$('#theatreHud').classList.toggle('no-rec',!(f.scene||'').includes('ROOM'));}
  function next(){if(i<seq.length-1){i++;playSfx(i%2?'paper':'rec');frame()}else{el.classList.add('hidden');syncAmbient();done?.()}}
  frame();$('#theatreNext').onclick=next;$('#theatreSkip').onclick=()=>{el.classList.add('hidden');syncAmbient();done?.()};syncAmbient();
}
function showTransition(small,big,done){const t=$('#transition');$('#transitionSmall').textContent=small;$('#transitionBig').textContent=big;t.classList.remove('hidden');playSfx('low');setTimeout(()=>playSfx('stamp'),420);setTimeout(()=>{t.classList.add('hidden');done?.()},2200)}

/* ---------- GLOBAL EVENTS ---------- */
function start(mode){reset(mode);$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');state.tab='case';save();render();setTimeout(()=>showTheatre('prologue',()=>render()),250)}
function continueGame(){if(!load())return start('guided');$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');render()}
function bindGlobal(){
  $$('[data-act="new"]').forEach(b=>b.onclick=()=>start(b.dataset.mode||'guided'));$('[data-act="continue"]').onclick=continueGame;
  document.addEventListener('click',e=>{const a=e.target.closest('[data-act]');if(!a)return;const x=a.dataset.act;if(x==='sound')toggleSound();if(x==='help')showHint();if(x==='tools')tools();if(x==='notebook')showNotebook();if(x==='notebook-close')closeNotebook();if(x==='close')closeModal();if(x==='new-independent')start('independent')});
  $('#mobileMenu').onclick=()=>$('#tabs').classList.toggle('open');
  $('#notesToggle')?.addEventListener('click',()=>{});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeNotebook();$('#tabs').classList.remove('open')}});
}

bindGlobal();
const canContinue=hasSave();$('[data-act="continue"]').disabled=!canContinue;
if(meta.completed)$('#independentBoot').classList.remove('hidden');
})();
