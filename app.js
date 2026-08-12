(()=>{
'use strict';
const D=window.CASE_DATA,V=D.v2||{};
const SAVE='second_confession_v2',LEGACY='second_confession_v1',META='second_confession_meta_v2';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ev=id=>D.evidence.find(x=>x[3]===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uniq=a=>[...new Set(a||[])];
const defaults=()=>({stage:0,solved:[],viewed:[],marked:[],tab:'case',theatreSeen:[],hintCount:{},ending:null,mode:'guided',asked:[],currentInterrogation:'why',sceneChecked:[],confrontSeen:[],timelineTags:{},reasonFocus:null,finalAnswers:{},failCount:{},sound:true,tabSeen:['case'],evFilter:'all',chainAnswers:{}});
let state=defaults();
let meta={completed:false,bestScore:0};
try{meta={...meta,...JSON.parse(localStorage.getItem(META)||'{}')}}catch(e){}

const tabs=[['case','案情卷宗'],['interrogation','讯问室'],['scene','现场勘查'],['people','关系人'],['evidence','物证台'],['timeline','时间轴'],['reason','推理桌'],['final','复核会议']];
const evidenceStage={confession:0,brass:0,drawer:1,cctv:1,shoe:1,phone:2,payment:2,card:2,access:2,water:3,parcel:3,taxi:3,zhaolog:4,arrival:4,message:5,call:5,autopsy:5,voice:7};
const personReveal={chen:1,lin:5,zhao:4,qiu:2,feng:3,zhong:3,sun:0,han:3};
const theatreByPuzzle={P02:'drawer',P03:'lastSeen',P08:'records',P09:'zhao',P11:'rescue',P13:'second',P14:'responsibility'};
const tabUnlockStage={case:0,interrogation:0,scene:0,people:0,evidence:0,timeline:3,reason:0,final:7};

/* ===== 存档与迁移 ===== */
function normalize(x){const d=defaults();const n={...d,...x};
  ['solved','viewed','marked','theatreSeen','asked','sceneChecked','confrontSeen','tabSeen'].forEach(k=>n[k]=uniq(n[k]));
  n.hintCount=n.hintCount||{};n.timelineTags=n.timelineTags||{};n.finalAnswers=n.finalAnswers||{};n.failCount=n.failCount||{};n.chainAnswers=n.chainAnswers||{};
  if(!['guided','independent'].includes(n.mode))n.mode='guided';return n;
}
function save(){localStorage.setItem(SAVE,JSON.stringify(state));}
function saveMeta(){localStorage.setItem(META,JSON.stringify(meta));}
function load(){try{let raw=localStorage.getItem(SAVE);if(raw){state=normalize(JSON.parse(raw));return true}raw=localStorage.getItem(LEGACY);if(raw){state=normalize(JSON.parse(raw));save();return true}}catch(e){console.warn(e)}return false}
function reset(mode='guided'){localStorage.removeItem(SAVE);state=defaults();state.mode=mode;save()}
function hasSave(){return !!(localStorage.getItem(SAVE)||localStorage.getItem(LEGACY))}

/* ===== 声音：全部本地、低存在感、可关闭 ===== */
const audio={current:null,currentKey:'',started:false,loops:{},sfx:{}};
function initAudio(){if(audio.started)return;audio.started=true;
  const mk=(src,loop=false,vol=.1)=>{const a=new Audio(src);a.loop=loop;a.volume=vol;a.preload='auto';return a};
  audio.loops.interrogation=mk('assets/audio/interrogation_room.wav',true,.10);
  audio.loops.rain=mk('assets/audio/rain_window.wav',true,.105);
  audio.loops.records=mk('assets/audio/records_room.wav',true,.085);
  audio.sfx.rec=mk('assets/audio/rec_click.wav',false,.24);
  audio.sfx.paper=mk('assets/audio/paper_rustle.wav',false,.17);
  audio.sfx.stamp=mk('assets/audio/stamp.wav',false,.22);
}
function playSfx(k){if(!state.sound)return;initAudio();const a=audio.sfx[k];if(!a)return;try{a.currentTime=0;a.play().catch(()=>{})}catch(e){}}
function ambientKey(){if(!state.sound)return'';if(!$('#theatre').classList.contains('hidden')){const src=$('#theatreImg').getAttribute('src')||'';return src.includes('apartment')||src.includes('bookstore')||src.includes('corridor')?'rain':'interrogation'}if(state.tab==='interrogation')return'interrogation';if(state.tab==='scene')return'rain';return'records'}
function syncAmbient(){initAudio();const key=ambientKey();if(key===audio.currentKey)return;if(audio.current){audio.current.pause();audio.current.currentTime=0}audio.currentKey=key;audio.current=key?audio.loops[key]:null;if(audio.current&&state.sound)audio.current.play().catch(()=>{})}
function toggleSound(){state.sound=!state.sound;save();if(!state.sound&&audio.current){audio.current.pause();audio.currentKey=''}syncAmbient();renderChrome()}

/* ===== 核心解锁 ===== */
const isEvAvailable=id=>(evidenceStage[id]??0)<=state.stage;
function unlocked(t){if(t==='final')return state.solved.includes('P14');return state.stage>=(tabUnlockStage[t]??0)}
function stageFromCount(n){let st=0;if(n>=1)st=1;if(n>=3)st=2;if(n>=5)st=3;if(n>=8)st=4;if(n>=10)st=5;if(n>=13)st=6;if(n>=14)st=7;return st}
function updateStage(){const st=stageFromCount(state.solved.length);if(st>state.stage)state.stage=st;save()}
function currentPuzzle(){return D.puzzles.find(p=>!state.solved.includes(p.id)&&p.stage<=state.stage)}
function objective(){if(state.ending)return'案件已完成复核。你可以回看卷宗，或开启独立复核二周目。';if(state.solved.includes('P14')&&!state.viewed.includes('voice'))return'责任链已经闭合。E18 自动录音索引已入卷；可先查看，也可以直接召开复核会议。';if(state.solved.includes('P14'))return'进入复核会议：逐项解释人、行为与记录，不再用一个“凶手”概括所有责任。';const p=currentPuzzle();if(state.mode==='independent')return p?`当前卷宗仍有未闭合事实。阶段：${D.chapters[Math.min(state.stage,D.chapters.length-1)]}。`:'检查现有材料。';return p?p.title:'检查现有材料。'}
function score(){const fails=Object.values(state.failCount||{}).reduce((a,b)=>a+(+b||0),0);const hintDepth=Object.values(state.hintCount||{}).reduce((a,b)=>a+(+b||0),0);const viewed=state.viewed.length;return Math.max(0,Math.round(100-fails*2.5-hintDepth*4+(viewed>=17?3:0)+(state.mode==='independent'?5:0)))}

/* ===== UI 壳层 ===== */
function newDotForTab(id){if(state.tabSeen.includes(id)||!unlocked(id))return'';return'<i class="new-dot" aria-label="新内容"></i>'}
function renderChrome(){
  $('#tabs').innerHTML=tabs.map(([id,n],i)=>`<button class="tab ${state.tab===id?'active':''} ${unlocked(id)?'':'locked'}" data-tab="${id}" data-index="${String(i+1).padStart(2,'0')}">${n}${newDotForTab(id)}</button>`).join('');
  $$('[data-tab]').forEach(b=>b.onclick=()=>{if(!unlocked(b.dataset.tab))return;state.tab=b.dataset.tab;state.tabSeen=uniq([...state.tabSeen,state.tab]);save();$('#tabs').classList.remove('open');render()});
  $('#chapterLabel').textContent=D.chapters[Math.min(state.stage,D.chapters.length-1)];
  $('#progressLabel').textContent=`事实 ${state.solved.length} / 14`;
  $('#soundToggle').textContent=`环境声：${state.sound?'开':'关'}`;$('#soundToggle').setAttribute('aria-pressed',String(state.sound));
  $('#objective').className='objective '+(state.mode==='independent'?'independent':'');$('#objective').innerHTML=`<b>当前复核目标</b>${esc(objective())}`;
  $('#facts').innerHTML=state.solved.slice(-7).reverse().map(id=>{const p=D.puzzles.find(x=>x.id===id);return `<div class="fact-mini">${esc(p.fact)}</div>`}).join('')||'<div class="side-note">尚未形成已确认事实。</div>';
  const p=currentPuzzle();$('#unresolved').innerHTML=p?`<div class="unres-mini">${esc(state.mode==='independent'?'还有一条事实链无法解释。':p.un)}</div>`:'<div class="side-note">核心事实已经闭合。</div>';
  const fails=Object.values(state.failCount).reduce((a,b)=>a+(+b||0),0);$('#reviewStats').innerHTML=`MODE ${state.mode==='guided'?'GUIDED':'INDEPENDENT'}<br>READ ${state.viewed.length}/18<br>ERROR ${fails}<br>SCORE ${score()}`;
}
function render(){state.tabSeen=uniq([...state.tabSeen,state.tab]);renderChrome();const f={case:renderCase,interrogation:renderInterrogation,scene:renderScene,people:renderPeople,evidence:renderEvidence,timeline:renderTimeline,reason:renderReason,final:renderFinal};(f[state.tab]||renderCase)();$('#view').classList.remove('view-enter');void $('#view').offsetWidth;$('#view').classList.add('view-enter');save();syncAmbient()}

/* ===== 案情卷宗 ===== */
function renderCase(){
  const p=currentPuzzle();
  $('#view').innerHTML=`<div class="case-desk">
    <section class="case-folder">
      <div class="case-title-row"><div><div class="reason-kicker">荔公刑复字〔2026〕017号</div><h2>第17号案件 · 二次复核</h2></div><div class="status-stamp">原结论待复核</div></div>
      <table class="case-data"><tr><th>死者</th><td>邱承，38岁，私人债务中介</td></tr><tr><th>原案嫌疑人</th><td>陈默，28岁，案发后第3天主动投案</td></tr><tr><th>现场</th><td>西河公寓 B座 4-702</td></tr><tr><th>原认定时间</th><td>21:45—21:58</td></tr><tr><th>复核起因</th><td>口供存在一处抽屉定位矛盾；21:18之后多条“生命证据”均来自账户、设备或凭证。</td></tr></table>
      <div class="case-photo-pinned"><img src="assets/images/scene_apartment.jpg" alt="4-702案发现场"><span>原案现场照 / 4-702 / 编号 17-04-01</span></div>
    </section>
    <aside class="case-memo-stack">
      <div class="memo-sheet"><h3>原案闭环为什么成立？</h3><p>主动认罪、真实凶器、准确现场细节，以及21:18—21:52连续电子活动共同构成了一个非常省解释成本的模型。</p><div class="memo-sign">原案复盘摘要</div></div>
      <div class="memo-sheet"><h3>复核规则</h3><p>原始事实与解释分开。系统不会把“账户活动”自动写成“本人活动”，也不会把“沉默”自动写成“说谎”。</p><div class="memo-sign">孙岚 · 行为分析</div></div>
      <div class="memo-sheet"><h3>当前问题</h3><p>${esc(state.mode==='independent'?(p?'还有一条事实链没有闭合。':'卷宗等待归档。'):(p?p.title:'卷宗等待归档。'))}</p></div>
    </aside></div>`;
}

/* ===== 讯问 ===== */
function availableQuestions(){return (V.interrogation||[]).filter(q=>q.stage<=state.stage)}
function renderInterrogation(){
  const qs=availableQuestions();if(!qs.some(q=>q.id===state.currentInterrogation))state.currentInterrogation=qs[0]?.id;
  const q=qs.find(x=>x.id===state.currentInterrogation)||qs[0];
  const asked=state.asked.includes(q.id);
  const confrontation=Object.entries(V.confront||{}).filter(([id,c])=>isEvAvailable(c.need));
  $('#view').innerHTML=`<div class="interrogation-layout">
    <section class="interrogation-feed">
      <img src="assets/images/scene_interrogation.jpg" alt="讯问室监控画面">
      <div class="cam-hud"><span class="rec">● REC / ROOM 03</span><span>CAM-B / 21:14:${String(8+state.asked.length*13).padStart(2,'0')}</span></div>
      <div class="interrogation-caption"><div class="who">${esc(q.speaker)}${asked?' · 已播放':' · 等待播放'}</div><div class="answer">${asked?esc(q.a):'选择右侧问题，播放对应讯问片段。'}</div>${asked?`<div class="behaviour">原始行为记录：${esc(q.behaviour)} <button class="mark ${state.marked.includes(q.mark)?'done':''}" data-mark-current>${state.marked.includes(q.mark)?'已标记':'标记原句'}</button></div>`:''}</div>
    </section>
    <aside class="interrogation-console">
      <div class="console-label">INTERROGATION PLAYBACK / 第一次讯问</div>
      <div class="question-list">${qs.map(x=>`<button class="question-btn ${state.asked.includes(x.id)?'asked':''} ${!state.asked.includes(x.id)&&x.stage===state.stage?'newq':''}" data-question="${x.id}">${esc(x.q)}</button>`).join('')}</div>
      <div class="recorder-deck"><div class="recorder-head"><span>SONY ICD / E01</span><span>${state.asked.length}/${qs.length}片段已阅</span></div><div class="wave-mini"></div><div class="recorder-actions"><button id="replayCurrent">播放当前</button><button id="showTranscript">已阅转写</button></div></div>
      <div class="interrogation-note">孙岚：停顿、眼神、语速都只能先记成观察事实。不要让心理解释跑到证据前面。</div>
      ${confrontation.length?`<div class="confront-tray"><h4>证据质询 · 仅显示已入卷材料</h4><div class="confront-grid">${confrontation.map(([id,c])=>{const ready=state.viewed.includes(c.need);return `<button class="confront-btn" data-confront="${id}" ${ready?'':'disabled'}>${esc(c.title)}${ready?'':' · 未阅证物'}</button>`}).join('')}</div><div id="confrontResult" class="confront-result">${state.confrontSeen.length?'你已经进行过证据质询。':'质询不会自动替你判定“说谎”。'}</div></div>`:''}
    </aside></div>`;
  $$('[data-question]').forEach(b=>b.onclick=()=>{state.currentInterrogation=b.dataset.question;const qq=qs.find(x=>x.id===b.dataset.question);if(!state.asked.includes(qq.id))state.asked.push(qq.id);if(!state.viewed.includes('confession'))state.viewed.push('confession');save();playSfx('rec');renderInterrogation()});
  const mark=$('[data-mark-current]');if(mark)mark.onclick=()=>{state.marked=state.marked.includes(q.mark)?state.marked.filter(x=>x!==q.mark):uniq([...state.marked,q.mark]);save();renderInterrogation()};
  $('#replayCurrent').onclick=()=>{if(!state.asked.includes(q.id))state.asked.push(q.id);if(!state.viewed.includes('confession'))state.viewed.push('confession');save();playSfx('rec');renderInterrogation()};
  $('#showTranscript').onclick=()=>openModal(`<div class="console-label">已阅讯问转写</div><h2>第一次讯问 · 片段记录</h2>${qs.filter(x=>state.asked.includes(x.id)).map(x=>`<div class="help-level"><b>韩川：${esc(x.q)}</b><p>陈默：${esc(x.a)}</p><small>${esc(x.behaviour)}</small></div>`).join('')||'<p>尚未播放任何片段。</p>'}`);
  $$('[data-confront]').forEach(b=>b.onclick=()=>{const c=V.confront[b.dataset.confront];if(!state.viewed.includes(c.need))return;state.confrontSeen=uniq([...state.confrontSeen,b.dataset.confront]);save();playSfx('rec');$('#confrontResult').textContent=c.text});
}

/* ===== 现场 ===== */
function renderScene(){
  const hs=V.sceneHotspots||[];
  $('#view').innerHTML=`<div class="scene-workspace">
    <section class="scene-hero"><img src="assets/images/scene_apartment.jpg" alt="西河公寓4-702现场全景"><div class="scene-header"><span>SCENE 17-04-01 / B座 4-702</span><span>原始现场复核</span></div>
      ${hs.map(h=>`<button class="hotspot ${state.sceneChecked.includes(h.id)?'checked':''}" data-hotspot="${h.id}" aria-label="检查${esc(h.name)}" style="left:${h.x}%;top:${h.y}%;width:${h.w}%;height:${h.h}%"></button>`).join('')}
      <div class="scene-instruction">场景不显示高亮框。移动鼠标寻找可检查区域；已检查位置只留下极轻的记录点。</div>
    </section>
    <div class="scene-findings">${hs.map(h=>`<div class="finding"><b>${state.sceneChecked.includes(h.id)?esc(h.name):'未记录区域'}</b><small>${state.sceneChecked.includes(h.id)?esc(h.text):'现场观察尚未写入复核笔记。'}</small></div>`).join('')}</div>
    <div class="scene-strip"><button class="scene-strip-card" data-secondary="bookstore"><img src="assets/images/scene_bookstore.jpg"><span>林夏书店后仓 / 背景现场</span></button><button class="scene-strip-card" data-secondary="corridor"><img src="assets/images/scene_corridor.jpg"><span>4层走廊 / 出入路径</span></button></div>
  </div>`;
  $$('[data-hotspot]').forEach(b=>b.onclick=()=>{const h=hs.find(x=>x.id===b.dataset.hotspot);state.sceneChecked=uniq([...state.sceneChecked,h.id]);(h.evidence||[]).forEach(id=>{if(isEvAvailable(id))state.viewed=uniq([...state.viewed,id])});save();playSfx('paper');openModal(`<h2>${esc(h.name)}</h2><p>${esc(h.text)}</p>${(h.evidence||[]).filter(isEvAvailable).map(id=>{const e=ev(id);return `<img src="assets/images/${e[2]}" alt="${esc(e[1])}"><p><b>${e[0]} · ${esc(e[1])}</b></p>`}).join('')}<div class="source-warning">这里只记录你实际检查到的内容。现场本身不会替你给出“凶手”“说谎”等结论。</div>`);renderChrome()});
  $$('[data-secondary]').forEach(b=>b.onclick=()=>{const isBook=b.dataset.secondary==='bookstore';openModal(`<h2>${isBook?'林夏书店后仓':'4层走廊'}</h2><img src="assets/images/${isBook?'scene_bookstore.jpg':'scene_corridor.jpg'}"><p>${isBook?'这里解释债务纠纷与林夏当晚行动的背景，但背景秘密不等于杀人。':'消防梯、电梯和B座入口共同构成20:36—21:29的人员移动路径。'}</p>`)});
}

/* ===== 人物 ===== */
function personImg(id){return (V.personImage||{})[id]||'scene_records.jpg'}
function renderPeople(){
  $('#view').innerHTML=`<section class="people-board"><div class="people-cards">${D.people.map(p=>`<button class="person-card" data-person="${p.id}"><i class="person-pin"></i><div class="person-photo"><img src="assets/images/${personImg(p.id)}" alt="${esc(p.name)}相关档案画面"></div><div class="person-card-body"><strong>${esc(p.name)}</strong><div class="role">${esc(p.role)}</div><p>${esc((V.peopleDetail?.[p.id]?.public)||p.text)}</p></div></button>`).join('')}</div></section>`;
  $$('[data-person]').forEach(b=>b.onclick=()=>showPerson(b.dataset.person));
}
function showPerson(id){const p=D.people.find(x=>x.id===id),d=V.peopleDetail?.[id]||{};const reveal=state.stage>=(personReveal[id]??4);const deep=state.stage>=Math.min(6,(personReveal[id]??4)+1);
  openModal(`<div class="person-detail"><div class="person-detail-photo"><img src="assets/images/${personImg(id)}" alt="${esc(p.name)}相关档案"><small>CASE 17 / ${esc(p.name)} / 档案截图</small></div><div><h2>${esc(p.name)}</h2><div class="roleline">${esc(p.role)}</div><section><h4>公开资料</h4><p>${esc(d.public||p.text)}</p></section><section><h4>关系</h4><p>${esc(d.relation||'待核验')}</p></section><section><h4>当前矛盾</h4><p>${reveal?esc(d.contradiction||'暂无已确认矛盾'):'当前阶段尚无足够材料形成矛盾。'}</p></section><section><h4>进一步核验</h4><p>${deep?esc(d.private||'暂无新增材料'):'随复核推进开放。'}</p></section>${d.note?`<div class="person-tape">${esc(d.note)}</div>`:''}</div></div>`)}

/* ===== 证物 ===== */
function evidenceCategory(id){return V.evidenceMeta?.[id]?.[3]||'其他'}
function renderEvidence(){const list=D.evidence.filter(e=>isEvAvailable(e[3]));const cats=['all',...uniq(list.map(e=>evidenceCategory(e[3])))];const visible=state.evFilter==='all'?list:list.filter(e=>evidenceCategory(e[3])===state.evFilter);
  $('#view').innerHTML=`<div class="evidence-lab"><div class="lab-head"><div><h2>物证台</h2><p>当前入卷 ${list.length}/18 项 · 图片与原始记录是资料本体，不把标题当答案</p></div><div class="lab-filters">${cats.map(c=>`<button data-filter="${esc(c)}" class="${state.evFilter===c?'active':''}">${c==='all'?'全部':esc(c)}</button>`).join('')}</div></div><div class="evidence-grid">${visible.map(e=>`<button class="evidence-card" data-ev="${e[3]}"><span class="ev-bag-label">${e[0]}</span>${state.viewed.includes(e[3])?'<span class="ev-read">已阅</span>':''}<img src="assets/images/${e[2]}" alt="${esc(e[1])}"><div class="ev-info"><b>${esc(e[1])}</b><small>${esc(evidenceCategory(e[3]))} · ${state.viewed.includes(e[3])?'已写入复核卷':'待检查'}</small></div></button>`).join('')}</div></div>`;
  $$('[data-filter]').forEach(b=>b.onclick=()=>{state.evFilter=b.dataset.filter;save();renderEvidence()});$$('[data-ev]').forEach(b=>b.onclick=()=>showEvidence(b.dataset.ev));
}
function showEvidence(id){if(!isEvAvailable(id))return;const e=ev(id),m=V.evidenceMeta?.[id]||['原始材料','案件卷宗','请自行判断材料能证明什么。','其他'];state.viewed=uniq([...state.viewed,id]);const upgraded=id==='voice'&&state.ending==='layered';if(upgraded)state.ending='complete';save();playSfx('paper');
  const voice=id==='voice'?`<div class="source-warning"><b>自动转写 / 11秒缓存</b><br>林夏：“我打120。”<br>赵序：“先别打。你只要现在报警，所有人都会把这当成你预谋的。”<br><small>关键内容同时提供文字，不依赖音频播放。</small></div>`:'';
  openModal(`<div class="evidence-modal"><div class="evidence-modal-image"><img src="assets/images/${e[2]}" alt="${esc(e[1])}"></div><div class="evidence-meta"><div class="reason-kicker">${e[0]} / EVIDENCE</div><h2>${esc(e[1])}</h2><dl><dt>材料类型</dt><dd>${esc(m[0])}</dd><dt>来源</dt><dd>${esc(m[1])}</dd><dt>原始观察</dt><dd>${esc(m[2])}</dd><dt>入卷状态</dt><dd>已查看 · 可用于推理</dd></dl><div class="source-warning">证物标题用于索引。真正结论必须由多份材料共同支持。</div>${voice}</div></div>`);if(upgraded){state.tab='final';render()}else renderChrome()}

/* ===== 时间轴 ===== */
function renderTimeline(){const tl=V.timeline||[];$('#view').innerHTML=`<section class="timeline-room"><h2>20:30—22:00 复核时间轴</h2><div class="timeline-legend"><span class="legend-dot">本人可确认</span><span class="legend-dot carrier">身份载体/账户</span><span class="legend-dot env">环境行为</span></div><div class="timeline-board">${tl.map((i,idx)=>{const tag=state.timelineTags[idx]||'';return `<div class="time-card ${tag}"><div class="tm">${i[0]}</div><div><strong>${esc(i[1])}</strong><small>${esc(i[2])}</small><div class="time-tag-controls"><button data-tidx="${idx}" data-tag="person" class="${tag==='person'?'active':''}">本人</button><button data-tidx="${idx}" data-tag="carrier" class="${tag==='carrier'?'active':''}">载体</button><button data-tidx="${idx}" data-tag="env" class="${tag==='env'?'active':''}">环境</button></div></div><div class="time-source">${tag?{person:'PERSON',carrier:'TOKEN',env:'ENV'}[tag]:'UNCLASSIFIED'}</div></div>`}).join('')}</div><button id="checkTimeline" class="reason-submit">校验我的证据类型标记</button><div id="timelineResult" class="result"></div><div class="timeline-explain">这不是排序题。真正的问题是：一条记录能证明“发生了什么”，和它能不能证明“是谁做的”，是两件事。</div></section>`;
  $$('[data-tidx]').forEach(b=>b.onclick=()=>{state.timelineTags[b.dataset.tidx]=b.dataset.tag;save();renderTimeline()});$('#checkTimeline').onclick=()=>{let n=0;tl.forEach((x,i)=>{if(state.timelineTags[i]===x[3])n++});const r=$('#timelineResult');r.className='result '+(n===tl.length?'good':'bad');r.textContent=n===tl.length?'分类成立：后半段多条记录属于“身份载体/环境”，不能独立确认邱承本人。':`当前 ${n}/${tl.length} 项分类与原始材料相符。重点区分“看见人”“看见凭证活动”“只知道环境发生变化”。`};
}

/* ===== 推理 ===== */
function firstAvailPuzzle(){return D.puzzles.find(p=>p.stage<=state.stage&&!state.solved.includes(p.id))||D.puzzles.filter(p=>p.stage<=state.stage).slice(-1)[0]}
function renderReason(){const avail=D.puzzles.filter(p=>p.stage<=state.stage);if(!state.reasonFocus||!avail.some(p=>p.id===state.reasonFocus))state.reasonFocus=(firstAvailPuzzle()||avail[0]).id;const p=D.puzzles.find(x=>x.id===state.reasonFocus);$('#view').innerHTML=`<div class="reason-room"><aside class="reason-index"><h2>事实链 / ${state.solved.length} 已成立</h2>${avail.map(x=>`<button class="reason-step ${x.id===p.id?'active':''} ${state.solved.includes(x.id)?'done':''}" data-reason="${x.id}">${x.id} ${esc(x.title)}</button>`).join('')}</aside><section class="reason-desk"><div class="reason-kicker">DEDUCTION / ${p.id}</div><h3>${esc(p.title)}</h3><div class="reason-question">${esc(state.solved.includes(p.id)?p.fact:p.un)}</div><div id="puzzleBody">${puzzleBody(p)}</div><div id="res-${p.id}" class="result"></div></section></div>`;$$('[data-reason]').forEach(b=>b.onclick=()=>{state.reasonFocus=b.dataset.reason;save();renderReason()});bindPuzzle(p)}
function puzzleBody(p){if(state.solved.includes(p.id))return `<div class="deduction-fact">${esc(p.fact)}</div>`;
  if(p.id==='P14')return responsibilityBody();
  const ready=id=>state.viewed.includes(id),card=id=>{const e=ev(id);return `<button class="pick ${ready(id)?'':'unread'}" data-pick="${id}" ${ready(id)?'':'disabled'}><b>${e[0]} · ${esc(e[1])}</b>${ready(id)?esc(V.evidenceMeta?.[id]?.[0]||'原始材料'):'未阅，先去物证台或现场检查'}</button>`};
  if(['P03','P10'].includes(p.id))return `<div class="choice-board">${p.choices.map(id=>{const e=ev(id);return `<button class="choice-card ${ready(id)?'':'unread'}" data-pick="${id}" ${ready(id)?'':'disabled'}><b>${e[0]} ${esc(e[1])}</b><div class="side-note">${ready(id)?esc(V.evidenceMeta?.[id]?.[2]||''): '材料未阅'}</div></button>`}).join('')}</div><button class="reason-submit" data-submit="${p.id}">确认这项事实</button>`;
  if(['P06','P07','P09','P11'].includes(p.id))return `<div class="strength-board">${p.choices.map(id=>{const e=ev(id);return `<button class="choice-card ${ready(id)?'':'unread'}" data-pick="${id}" ${ready(id)?'':'disabled'}><b>${e[0]} ${esc(e[1])}</b><div class="side-note">判断这份材料在问题中的证明作用。</div></button>`}).join('')}</div><button class="reason-submit" data-submit="${p.id}">提交比较</button>`;
  if(p.id==='P08')return `<div class="evidence-pick-board">${p.choices.map(card).join('')}</div><div class="timeline-explain">选择四种不同的“身份载体”，把它们视为同一类证据问题，而不是四个独立巧合。</div><button class="reason-submit" data-submit="${p.id}">建立错误生命时间线模型</button>`;
  return `<div class="evidence-pick-board">${p.choices.map(card).join('')}</div><button class="reason-submit" data-submit="${p.id}">提交 ${p.need} 项原始材料</button>`;
}
function responsibilityBody(){const choices={injury:['林夏','陈默','赵序'],rescue:['林夏与赵序','陈默','韩川'],design:['赵序','陈默','韩川'],confess:['陈默','林夏','赵序']};const labels={injury:'初始伤害',rescue:'救助中断',design:'事后时间线设计',confess:'虚假自首'};return `<div class="responsibility-chain">${Object.entries(choices).map(([k,arr])=>`<div class="chain-slot"><h4>${labels[k]}</h4>${arr.map(x=>`<button data-chain="${k}" data-value="${esc(x)}" class="${state.chainAnswers[k]===x?'active':''}">${esc(x)}</button>`).join('')}</div>`).join('')}</div><button class="reason-submit" id="submitResponsibility">建立责任链</button>`}
function bindPuzzle(p){let selections=[];$$('[data-pick]').forEach(b=>b.onclick=()=>{const id=b.dataset.pick;if(selections.includes(id)){selections=selections.filter(x=>x!==id);b.classList.remove('selected')}else{selections.push(id);b.classList.add('selected')}});$$('[data-submit]').forEach(b=>b.onclick=()=>solveBySelection(p,selections));$$('[data-chain]').forEach(b=>b.onclick=()=>{state.chainAnswers[b.dataset.chain]=b.dataset.value;save();renderReason()});const sr=$('#submitResponsibility');if(sr)sr.onclick=()=>{const ok=state.chainAnswers.injury==='林夏'&&state.chainAnswers.rescue==='林夏与赵序'&&state.chainAnswers.design==='赵序'&&state.chainAnswers.confess==='陈默';if(ok)solveSuccess(p);else failPuzzle(p,'责任链还没有解释全部四种行为。注意：造成最初伤害、没有及时救助、设计记录解释和替人认罪不是同一种行为。')};}
function solveBySelection(p,sel){sel=[...sel].sort();if(sel.length!==p.need)return failPuzzle(p,`需要选择 ${p.need} 项材料。`);const ok=p.sets.some(s=>[...s].sort().join('|')===sel.join('|'));if(ok)solveSuccess(p);else failPuzzle(p,'这组材料还不能完整证明该结论。检查：材料本身证明了什么？你是否额外假设了“操作者就是本人”？')}
function failPuzzle(p,msg){state.failCount[p.id]=(state.failCount[p.id]||0)+1;save();const r=$(`#res-${p.id}`);if(r){r.className='result bad';r.textContent=msg}playSfx('paper')}
function solveSuccess(p){if(!state.solved.includes(p.id))state.solved.push(p.id);updateStage();state.reasonFocus=(firstAvailPuzzle()||p).id;save();playSfx('stamp');const key=theatreByPuzzle[p.id];if(key&&!state.theatreSeen.includes(key)){setTimeout(()=>showTheatre(key,()=>render()),260)}else setTimeout(render,260)}

/* ===== 终局 ===== */
function renderFinal(){if(!state.solved.includes('P14')){$('#view').innerHTML='<div class="locked-block">复核会议尚未开始。先完成完整责任链。</div>';return}if(state.ending){renderEnding();return}const answered=Object.keys(state.finalAnswers).filter(k=>state.finalAnswers[k]).length;$('#view').innerHTML=`<section class="review-room"><div class="review-head"><div><h2>第17号案件 · 二次复核会议</h2><span>不是选择一个“凶手”，而是逐项解释每个行为。</span></div><span>${answered}/9 已作答</span></div><div class="review-body"><div class="review-questions">${D.final.map(q=>`<div class="final-q"><b>${q[0]} · ${esc(q[1])}</b><div class="final-options">${q[2].map(o=>`<button class="final-option ${state.finalAnswers[q[0]]===o?'selected':''}" data-q="${q[0]}" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div></div>`).join('')}<button class="review-submit" id="submitFinal">生成复核结论</button><div id="finalRes" class="result"></div></div><aside class="review-verdict"><h3>责任拆分</h3><div class="verdict-role"><b>林夏</b><small>初始冲突 / 救助行为</small></div><div class="verdict-role"><b>赵序</b><small>事后时间线设计</small></div><div class="verdict-role"><b>陈默</b><small>事后到场 / 虚假自首</small></div><div class="verdict-role"><b>原案</b><small>电子记录身份解释错误</small></div><div class="review-progress">READ ${state.viewed.length}/18<br>DEDUCTION 14/14<br>SCORE ${score()}</div></aside></div></section>`;$$('[data-q]').forEach(b=>b.onclick=()=>{state.finalAnswers[b.dataset.q]=b.dataset.answer;save();renderFinal()});$('#submitFinal').onclick=submitFinal}
function submitFinal(){let good=0;D.final.forEach(q=>{if(state.finalAnswers[q[0]]===q[3])good++});if(good===D.final.length){state.ending=state.viewed.includes('voice')?'complete':'layered';meta.completed=true;meta.bestScore=Math.max(meta.bestScore,score());saveMeta();save();playSfx('stamp');showTheatre('end',()=>{state.tab='final';render()})}else{state.failCount.FINAL=(state.failCount.FINAL||0)+1;save();const r=$('#finalRes');r.className='result bad';r.textContent=`目前 ${good}/9 项能与卷宗事实同时成立。至少还有一种责任或一条时间证据被错误合并。`}}
function renderEnding(){const complete=state.ending==='complete';const out=V.outcomes||{};$('#view').innerHTML=`<section class="ending-room"><div class="ending-projection"><img src="assets/images/scene_records.jpg" alt="案件复核会议"><div class="ending-copy"><div class="stamp-large">原结论撤回复核</div><h2>${complete?'结局 · 第二份口供':'结局 · 分层责任'}</h2><p>${complete?'你调取了E18的11秒自动转写。它没有改变谁造成最初伤害，却改变了“为什么120被中断”这一过程的理解。陈默的口供最终被归档为：一份为了替整个事件重新命名的口供。':'原“陈默单独故意杀人”结论被撤回。案件被拆成初始伤害、救助中断、事后掩饰设计和虚假自首四条责任链。真实记录继续保留，但不再被错误地当成人的身份证明。'}</p></div></div><div class="outcome-grid">${Object.values(out).map(x=>`<div class="outcome"><b>${esc(x[0])}</b><small>${esc(x[1])}</small><p>${esc(x[2])}</p></div>`).join('')}</div><div class="replay-panel"><h3>复核完成</h3><div class="score-line"><span>本次评分 ${score()}</span><span>错误提交 ${Object.values(state.failCount).reduce((a,b)=>a+(+b||0),0)}</span><span>证物阅读 ${state.viewed.length}/18</span><span>${state.mode==='independent'?'独立复核完成':'已解锁二周目独立复核'}</span></div>${complete?'':'<p class="tool-note">E18 已经入卷。回到物证台查看后，尾声会更新为完整版本。</p>'}<p><button id="startReplay">开始独立复核二周目</button> <button id="replayTheatre">回看最后讯问</button></p></div></section>`;$('#startReplay').onclick=()=>enterGame('independent',false);$('#replayTheatre').onclick=()=>showTheatre('second')}

/* ===== 演出 ===== */
function sceneLabel(src){if(src.includes('interrogation'))return'INTERROGATION ROOM 03';if(src.includes('apartment'))return'SCENE 4-702';if(src.includes('bookstore'))return'LATE RECORD / BOOKSTORE';if(src.includes('corridor'))return'CAMERA B4';return'REVIEW ROOM / ARCHIVE'}
function showTheatre(key,cb){const arr=D.theatre[key];if(!arr||!arr.length){cb&&cb();return}if(!state.theatreSeen.includes(key))state.theatreSeen.push(key);save();let i=0,done=false;$('#theatre').classList.remove('hidden');function draw(){const x=arr[i];$('#theatreImg').src='assets/images/'+x[0];$('#theatreSpeaker').textContent=x[1];$('#theatreLine').textContent=x[2];$('#theatreAside').textContent=x[3]||'';$('#theatreSceneLabel').textContent=sceneLabel(x[0]);$('#theatreTime').textContent=`00:${String(Math.floor(i*11/60)).padStart(2,'0')}:${String((i*11)%60).padStart(2,'0')}`;playSfx('rec');syncAmbient()}function finish(){if(done)return;done=true;$('#theatre').classList.add('hidden');syncAmbient();if(cb)cb();else render()}draw();$('#theatreNext').onclick=()=>{i++;if(i>=arr.length)finish();else draw()};$('#theatreSkip').onclick=finish}

/* ===== 弹窗/提示/工具 ===== */
function openModal(html){$('#modalBody').innerHTML=html;$('#modal').classList.remove('hidden');playSfx('paper')}
function closeModal(){$('#modal').classList.add('hidden')}
function showHelp(){const p=currentPuzzle();if(!p){openModal('<h2>提示</h2><p>核心推理已完成，请进入复核会议。</p>');return}if(state.mode==='independent'&&(state.failCount[p.id]||0)<2){openModal(`<h2>${p.id} · 独立复核</h2><p>独立复核不会立即开放提示。当前这道推理需要至少两次失败后才可查看一级方向提示。</p><p class="tool-note">这不会改变谜题答案，只减少二周目的界面引导。</p>`);return}const n=state.hintCount[p.id]||0,hs=D.hints[p.id];openModal(`<h2>${p.id} · 三级提示</h2>${hs.map((h,i)=>`<div class="help-level ${i>n?'lock':''}"><b>${['一级 · 方向','二级 · 关系','三级 · 接近答案'][i]}</b><p>${i<=n?esc(h):'先使用上一层，再开放本层。'}</p>${i===n&&n<2?`<button data-next-hint>开放下一层</button>`:''}</div>`).join('')}`);const b=$('[data-next-hint]');if(b)b.onclick=()=>{state.hintCount[p.id]=Math.min(2,n+1);save();showHelp()}}
function showTools(){openModal(`<h2>复核工具</h2><p class="tool-note">自动存档保存在当前浏览器。旧版 v1 存档会自动迁移，不会因为这次UI重构丢失核心进度。</p><div class="tools-grid"><button id="exportSave">导出JSON存档</button><button id="importSave">导入JSON存档</button><button id="toggleNotes">${$('#notesRail').classList.contains('open')?'关闭':'打开'}复核便笺</button><button id="resetCase">重置案件</button></div><input id="importFile" type="file" accept="application/json" class="hidden"><p class="tool-note">当前模式：${state.mode==='guided'?'标准复核':'独立复核'} / 评分 ${score()}</p>`);$('#exportSave').onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='第二份口供_存档_v2.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),600)};$('#importSave').onclick=()=>$('#importFile').click();$('#importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=normalize(JSON.parse(r.result));if(!Array.isArray(x.solved)||typeof x.stage!=='number')throw Error();state=x;save();closeModal();render()}catch(err){alert('存档无法识别')}};r.readAsText(f)};$('#toggleNotes').onclick=()=>{$('#notesRail').classList.toggle('open');closeModal()};$('#resetCase').onclick=()=>{if(confirm('确定清空当前案件进度？已完成二周目解锁不会清除。')){reset(state.mode);location.reload()}}}

/* ===== 启动/全局事件 ===== */
function enterGame(mode,fromSave=false){initAudio();if(!fromSave)reset(mode);$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');render();syncAmbient();if(!fromSave&&!state.theatreSeen.includes('prologue'))showTheatre('prologue')}
$$('[data-act="new"]').forEach(b=>b.onclick=()=>enterGame(b.dataset.mode||'guided',false));
$$('[data-act="continue"]').forEach(b=>b.onclick=()=>{if(load())enterGame(state.mode,true)});
$$('[data-act="save"]').forEach(b=>b.onclick=()=>{save();playSfx('stamp');openModal('<h2>已保存</h2><p>当前复核进度已写入本机浏览器。</p>')});
$$('[data-act="help"]').forEach(b=>b.onclick=showHelp);$$('[data-act="tools"]').forEach(b=>b.onclick=showTools);$$('[data-act="sound"]').forEach(b=>b.onclick=toggleSound);$$('[data-act="close"]').forEach(b=>b.onclick=closeModal);
$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal()};$('#mobileMenu').onclick=()=>$('#tabs').classList.toggle('open');$('#notesToggle').onclick=()=>$('#notesRail').classList.remove('open');
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#modal').classList.contains('hidden'))closeModal();else if(!$('#theatre').classList.contains('hidden'))$('#theatreSkip').click();else{$('#tabs').classList.remove('open');$('#notesRail').classList.remove('open')}}if(/^[1-8]$/.test(e.key)&&$('#modal').classList.contains('hidden')&&$('#theatre').classList.contains('hidden')){const t=tabs[+e.key-1]?.[0];if(t&&unlocked(t)){state.tab=t;render()}}});

const exists=hasSave();$$('[data-act="continue"]').forEach(b=>b.disabled=!exists);if(meta.completed)$('#independentBoot').classList.remove('hidden');
})();
