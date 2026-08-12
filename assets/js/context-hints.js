(()=>{
'use strict';
const SAVE='second_confession_film_v4';
const STORE='second_confession_context_hints_v1';
const RESET_FLAG='second_confession_context_hint_reset_pending';
const $=s=>document.querySelector(s);
const arr=v=>Array.isArray(v)?v:[];
const has=(a,v)=>arr(a).includes(v);
const pageNames={hall:'案卷室',interrogation:'讯问室',scene:'4-702现场',evidence:'物证室',video:'视频复核室',witness:'证人补录室',bookstore:'迟夏书店',property:'物业值班室',forensic:'法医复核室',review:'案件复核会议'};
const buttonNames={hall:'提示·案卷',interrogation:'提示·讯问',scene:'提示·现场',evidence:'提示·物证',video:'提示·记录',witness:'提示·证人',bookstore:'提示·时间线',property:'提示·审计',forensic:'提示·法医',review:'提示·结案'};

function readState(){
  try{return JSON.parse(localStorage.getItem(SAVE)||'null')||{};}catch(_){return {};}
}
function emptyHistory(){return {version:1,unlockCount:0,entries:{},order:[]};}
function readHistory(){
  let h=emptyHistory();
  try{h={...h,...JSON.parse(localStorage.getItem(STORE)||'{}')};}catch(_){}
  if(!h.entries||typeof h.entries!=='object')h.entries={};
  if(!Array.isArray(h.order))h.order=[];
  const imported=readState().contextHintArchive;
  if(imported&&imported.entries&&Number(imported.version)>=1){
    for(const [k,ie] of Object.entries(imported.entries)){
      const le=h.entries[k];
      if(!le||Number(ie?.level||0)>Number(le?.level||0)||(Number(ie?.level||0)===Number(le?.level||0)&&Number(ie?.updatedAt||0)>Number(le?.updatedAt||0)))h.entries[k]=ie;
    }
    h.order=[...new Set([...(h.order||[]),...(imported.order||[])])];
    h.unlockCount=Math.max(Number(h.unlockCount)||0,Number(imported.unlockCount)||0);
    writeHistory(h,false);
  }
  return h;
}
function writeHistory(h,stamp=true){
  if(stamp)h.updatedAt=Date.now();
  try{localStorage.setItem(STORE,JSON.stringify(h));}catch(_){}
}
function clearHistory(){try{localStorage.removeItem(STORE);}catch(_){};}
function legacyKey(stage){return stage===0?'transfer':stage===1?'drawer':stage===2?'records':stage===3?'arrival':stage===4?'bookstore':stage===5?'property':stage===6?'forensic':'final';}
function plan(key,title,page,phase,hints,{warning=false}={}){return {key,title,page,phase,hints:hints.slice(0,3),warning};}
function missingRecord(s){
  const ids=['cctv','payment','access','water','parcel','taxi'];
  const legacy={cctv:'person',payment:'account',access:'card',water:'room',parcel:'event',taxi:'order'};
  return ids.find(id=>{const v=s.recordAnswers?.[id];return !(v===true||v===legacy[id]);})||null;
}
function allStage0(s){return has(s.asked,'why')&&has(s.asked,'weapon')&&has(s.scene,'desk')&&has(s.scene,'floor')&&has(s.viewed,'confession')&&has(s.viewed,'brass');}

function hallPlan(s){
  const st=Number(s.stage)||0;
  if(st===0){
    if(!has(s.asked,'why')||!has(s.asked,'weapon'))return plan('s0:hall:interrogation','移送核验 · 先补讯问','案卷室','前置未完成',[
      '程序清单里“讯问”这一项还没有完成。先去讯问室，只核对陈默为什么来、他说的凶器是什么。',
      '不用判断他是否撒谎；第一阶段只确认供述里是否真的出现“主动投案”和“黄铜书挡”这两个可核对事实。',
      '进入讯问室，至少听完“为什么主动投案？”和“凶器是什么？”两问，再回案卷室。'
    ],{warning:true});
    if(!has(s.scene,'desk')||!has(s.scene,'floor'))return plan('s0:hall:scene','移送核验 · 补现场','案卷室','前置未完成',[
      '讯问材料已经够了，但现场核验还缺一部分。先去4-702确认供述中提到的空间和物件是否真实存在。',
      '这一阶段只检查书桌区域与倒地位置，不需要推测行为人。热点不会主动发光。',
      '进入4-702，分别点击“书桌区域”和“倒地位置”；书桌里还能调取E02黄铜书挡原件。'
    ],{warning:true});
    if(!has(s.viewed,'confession')||!has(s.viewed,'brass'))return plan('s0:hall:evidence','移送核验 · 补原件','案卷室','前置未完成',[
      '现场与讯问都已经核过，但移送前还缺原始材料的亲自阅卷记录。',
      `现在缺的是${!has(s.viewed,'confession')?'E01第一次供述':''}${!has(s.viewed,'confession')&&!has(s.viewed,'brass')?' 和 ':''}${!has(s.viewed,'brass')?'E02黄铜书挡':''}。打开原件即可，不需要额外作答。`,
      '去物证室打开缺少的E01/E02；E02也可以从4-702书桌区域直接调取。随后回案卷室提交移送核验。'
    ],{warning:true});
    return plan('s0:hall:submit','移送核验 · 可以提交','案卷室','前置已齐',[
      '三类程序性材料已经齐了。现在应该做的是“提交移送核验”，而不是继续寻找新线索。',
      '此时系统只问：第一次讯问、现场与凶器材料是否能够相互对应。注意，“能够对应”不等于案件真相已经成立。',
      '点击案卷室程序清单下方“提交移送核验”，选择“可以对应”，主线会进入物证位置补核。'
    ]);
  }
  if(st===1){
    if(!s.drawerMismatch)return plan('s1:hall:drawer','抽屉位置 · 先发现矛盾','案卷室','前置未完成',[
      '这一阶段的关键不是找新嫌疑人，而是复核“同一件黄铜书挡到底从哪一层抽屉采集”。',
      '回4-702检查左侧抽屉柜。系统会把现场定位原件与陈默第一次供述里的“第二层”放在一起。',
      '在4-702点击“左侧抽屉柜”，比较后登记“不一致”：供述说第二层，采集定位原件写第一层。'
    ],{warning:true});
    if(!s.drawerReasked)return plan('s1:hall:reask','抽屉位置 · 回讯问室','案卷室','前置未完成',[
      '抽屉层数差异已经登记，下一步不是继续翻物证，而是确认陈默是否会改变原话。',
      '回讯问室会新增一次关于“哪一层”的再次确认。只记录他的原话，不先解释为什么。',
      '回讯问室点击“再确认一次：哪一层？”。他仍坚持第二层后，才能把E03摆上讯问桌。'
    ],{warning:true});
    return plan('s1:hall:confront','抽屉位置 · 完成质证','案卷室','前置已齐',[
      '你已经有了“现场定位不同”与“再次确认原话”两步。现在需要把两份材料在讯问室正面对照。',
      '讯问桌会出现已阅的物证定位材料。完成这一步后，案件才会正式从普通移送转入补充复核。',
      '进入讯问室，把E03抽屉定位材料放到桌上完成质证，随后进入视频与系统记录复核。'
    ]);
  }
  if(st===2)return plan('s2:hall:records','系统记录 · 去视频复核室','案卷室','当前主线',[
    '当前主线已经不在讯问或现场，而是20:36—21:52的六条电子记录。',
    '进入视频复核室，对每一份原件只回答“它直接记录了什么”，不要自动把账户、门卡、柜门事件补成“邱承本人”。',
    '六条都完成对象标注后，再回答“最后一条直接确认邱承面部的记录是哪条”。'
  ]);
  if(st===3)return plan('s3:hall:arrival','陈默到场 · 影像再质证','案卷室','当前主线',[
    '当前要核对的不是邱承的活动，而是陈默本人到底几点进入B座。',
    '先在视频复核室调取B2停车场/消防梯片段，再回讯问室让陈默陈述自己的到离时间。',
    '取得E15后，在讯问室问“你几点到、几点离开？”，再把E15到场记录放上讯问桌。'
  ]);
  if(st===4)return plan('s4:hall:bookstore','时间线 · 去迟夏书店','案卷室','当前主线',[
    '现在要把20:50消息、20:52急救电话、21:29陈默到场放到同一条时间线上。',
    '进入迟夏书店，先分别打开消息缓存与急救缓存；到场记录E15已经来自上一阶段。',
    '正确发生顺序是：20:50消息 → 20:52急救电话 → 21:29陈默到场。'
  ]);
  if(st===5)return plan('s5:hall:property','设备审计 · 去物业值班室','案卷室','当前主线',[
    '当前要区分“赵序查询过系统”与“赵序修改过系统”是不是同一件事。',
    '进入物业值班室，先打开E14原始日志，只勾日志里真实出现过的英文操作。',
    'E14实际出现的是 LOGIN 与 QUERY；没有 WRITE、DELETE、TIME_EDIT。审计完成后会出现一条可选11秒录音。'
  ]);
  if(st===6)return plan('s6:hall:forensic','救助窗口 · 去法医复核室','案卷室','当前主线',[
    '当前要把“最初伤害”和“之后是否及时救助”拆开，不是重新判断凶器。',
    '去法医复核室，需要同时看E17法医底稿、E12急救缓存，并已有E16消息与E15到场记录。',
    '核心事实是：20:50仍有自主呼吸；陈默21:29才进楼；法医允许把最初伤害与后续救助分别评价。'
  ]);
  if(st===7)return plan('s7:hall:second','第二份口供 · 回讯问室','案卷室','当前主线',[
    '法医时间窗已经成立。现在要让陈默面对“20:50之前就已发生的事实”。',
    '回讯问室完成补充讯问。前置材料是E16消息和E15到场记录，两条都要放到桌上。',
    '问“20:50林夏已经知道邱承倒下。你那时在哪里？”，再依次挂接E16与E15，取得第二份口供。'
  ]);
  if(st>=8&&!s.ending)return plan('s8:hall:review','责任链 · 去复核会议室','案卷室','当前主线',[
    '主线事实已经收齐，最后一步不是寻找“唯一凶手”，而是把四段行为分别归责。',
    '进入案件复核会议室，分别处理最初伤害、救助中断、事后时间线设计、虚假自首，并为每段挂两份材料。',
    '最终模型选择“四段行为分别认定”。如果某一段提交失败，优先检查该段行为人和两份证据是否真正对应。'
  ]);
  return plan('ending:hall','案件已结','案卷室','回看',[
    '案件已经完成。你可以用提示回看功能重新查看本局曾经解锁过的提示。',
    '“供述来源复盘”和“证词边界复盘”属于结案后的额外复盘，不影响主结局。',
    '如果想补齐完整复核结局，注意E18可选录音以及冯越、钟嘉两份外围证人补录。'
  ]);
}

function interrogationPlan(s){
  const st=Number(s.stage)||0;
  if(st===0){
    if(!has(s.asked,'why')||!has(s.asked,'weapon'))return plan('s0:interrogation:base','第一次讯问 · 只记原话','讯问室','当前页面',[
      '这一页先不要判断陈默是否可信，只把能与现场互相核对的原话记下来。',
      `还没完整听过：${!has(s.asked,'why')?'“为什么主动投案？” ':''}${!has(s.asked,'weapon')?'“凶器是什么？”':''}`.trim(),
      '至少完成“为什么主动投案？”与“凶器是什么？”两问。之后还要去4-702检查书桌、倒地位置，并阅E01/E02。'
    ]);
    return plan('s0:interrogation:done','第一次讯问 · 本页已够','讯问室','当前页面已完成',[
      '本阶段的讯问前置已经完成。继续留在这里不会推进移送核验。',
      '回案卷室看程序清单，通常还需要4-702现场检查或E01/E02原件阅卷。',
      '如果书桌、倒地位置和E01/E02也都完成，就回案卷室提交移送核验。'
    ]);
  }
  if(st===1){
    if(!s.drawerMismatch)return plan('s1:interrogation:locked','抽屉复问 · 前置尚未成立','讯问室','前置条件未满足',[
      '现在还不适合直接追问抽屉层数。你需要先证明现场采集位置与第一次供述存在差异。',
      '去4-702检查“左侧抽屉柜”，把现场定位原件和第一次供述只按层数作比较。',
      '先在现场登记“第二层供述 vs 第一层采集定位”的不一致，再回这里会出现“再确认一次：哪一层？”。'
    ],{warning:true});
    if(!s.drawerReasked)return plan('s1:interrogation:reask','抽屉复问 · 再确认原话','讯问室','前置已满足',[
      '现场差异已经成立，现在只需要确认陈默是否会修改第一次供述。',
      '选择新增问题“再确认一次：哪一层？”，观察他是否改变“第二层”的说法。',
      '完成复问后，把已阅的E03抽屉定位原件放到讯问桌上，完成这一轮质证。'
    ]);
    if(!s.drawerResolved)return plan('s1:interrogation:confront','抽屉复问 · 把原件放上桌','讯问室','最后一步',[
      '复问已经完成，但矛盾还没有正式闭合。需要把原件与口供放在同一张桌上。',
      '讯问桌下方会出现E03材料按钮；点击它不是“提交答案”，而是完成证据对照。',
      '点击E03抽屉定位材料。系统会确认第一次供述与现场采集位置对同一物证的层数记录不一致。'
    ]);
  }
  if(st===3){
    if(!s.arrivalSeen)return plan('s3:interrogation:need-arrival','到场时间 · 先补影像','讯问室','前置条件未满足',[
      '现在直接问陈默时间还缺一份外部基准。先取得他的真实进楼记录。',
      '去视频复核室，在六条记录完成后会出现“陈默车辆与消防梯”补调入口。',
      '先调取E15：21:29进入B座，再回讯问室问陈默自述到离时间。'
    ],{warning:true});
    if(!has(s.asked,'arrival'))return plan('s3:interrogation:ask-arrival','到场时间 · 先问本人','讯问室','前置已满足',[
      'E15已经有了。下一步先让陈默完整说出自己的到场与离开时间。',
      '选择“你几点到、几点离开？”，先保留他的原话，再做外部记录对照。',
      '陈默会说21:45左右到。回答后，把E15的21:29到场记录放到讯问桌。'
    ]);
    return plan('s3:interrogation:arrival-confront','到场时间 · 对照E15','讯问室','最后一步',[
      '本人自述与外部到场记录都已存在，现在只差正面对照。',
      '讯问桌里选择E15陈默到场记录。不要拿邱承的支付或门禁记录替代。',
      'E15显示陈默21:29进入B座，与其“21:45左右到”的说法不一致。完成后进入迟夏书店时间线。'
    ]);
  }
  if(st>=7&&!s.secondAsked){
    if(!has(s.viewed,'message')||!has(s.viewed,'arrival'))return plan('s7:interrogation:need-pins','第二份口供 · 材料未齐','讯问室','前置条件未满足',[
      '补充讯问需要两条时间材料同时在手：20:50的消息与21:29的到场记录。',
      `当前还缺：${!has(s.viewed,'message')?'E16消息缓存':''}${!has(s.viewed,'message')&&!has(s.viewed,'arrival')?'、':''}${!has(s.viewed,'arrival')?'E15到场记录':''}。先回对应页面打开原件。`,
      'E16在迟夏书店；E15在视频复核室的陈默车辆/消防梯片段。两条都阅过后再来。'
    ],{warning:true});
    if(!has(s.asked,'second'))return plan('s7:interrogation:ask-second','第二份口供 · 提出关键问题','讯问室','前置已满足',[
      '材料已经齐了，先让陈默面对“20:50时邱承已经倒下”这一事实。',
      '选择补充讯问问题“20:50林夏已经知道邱承倒下。你那时在哪里？”。',
      '问完后，讯问桌会允许你把E16消息和E15到场记录分别放上去。'
    ]);
    const need=['message','arrival'].filter(x=>!has(s.interrogationPins,x));
    return plan('s7:interrogation:pins','第二份口供 · 挂接两条时间材料','讯问室','最后一步',[
      '关键问题已经问出，现在要用两条相互独立的时间材料固定陈默的到场边界。',
      `讯问桌还需要：${need.map(x=>x==='message'?'E16消息':'E15到场').join('、')||'两条材料都已选择'}。`,
      '把E16和E15都放到讯问桌。两条齐全后会触发“第二份口供”，并开放最终责任链复核。'
    ]);
  }
  return plan(`s${st}:interrogation:side`,'讯问室 · 当前没有主线操作','讯问室','页面说明',[
    '当前阶段的主要推进点不在讯问室。这里可以回看已经出现过的回答，但不会自动生成新证据。',
    `回案卷室查看当前程序清单；当前阶段是 ${st}。`,
    '如果不知道下一站，返回案卷室再点提示，会按当前主线缺口直接给出方向。'
  ]);
}

function scenePlan(s){
  const st=Number(s.stage)||0;
  if(st===0){
    if(!has(s.scene,'desk'))return plan('s0:scene:desk','4-702现场 · 先看书桌','4-702现场','当前页面',[
      '供述提到了黄铜书挡，所以先确认这个物件与书桌区域是否真的存在。',
      '热点不会发光。移动指针检查画面右侧偏上的书桌区域。',
      '点击“书桌区域”，再点“调取E02黄铜书挡原件”。之后别忘了检查倒地位置。'
    ]);
    if(!has(s.viewed,'brass'))return plan('s0:scene:brass','4-702现场 · 调取E02','4-702现场','当前页面',[
      '书桌已经检查，但E02原件还没真正阅卷。',
      '重新打开书桌区域，现场详情里有“调取E02黄铜书挡原件”。',
      '点击调取E02。只有看见原始物证页，移送清单中的E02阅卷才算完成。'
    ]);
    if(!has(s.scene,'floor'))return plan('s0:scene:floor','4-702现场 · 补倒地位置','4-702现场','当前页面',[
      '书桌与凶器已经核过，现场还缺空间位置的一项。',
      '检查画面左下到中部的倒地区域。这一步只登记位置，不判断谁实施了行为。',
      '点击“倒地位置”。随后回案卷室检查是否还缺E01第一次供述。'
    ]);
    return plan('s0:scene:done','4-702现场 · 本页已完成','4-702现场','当前页面已完成',[
      '初次移送所需的现场检查已经完成。继续点击现场不会出现新的主线答案。',
      '回案卷室看程序清单；如果E01/E02也都阅过，就可以提交移送核验。',
      '下一阶段再次回到这里时，会新增“左侧抽屉柜”检查点。'
    ]);
  }
  if(st===1&&!s.drawerMismatch)return plan('s1:scene:drawer','4-702现场 · 抽屉定位补核','4-702现场','当前页面',[
    '现在新增的检查点是左侧抽屉柜。目标只是核对“物证从第几层采集”。',
    '点击左侧抽屉柜，系统会并排展示现场抽屉与E03物证定位记录。',
    '与第一次供述的“第二层”相比，E03写的是第一层，因此登记“不一致”。登记后回讯问室复问。'
  ]);
  return plan(`s${st}:scene:side`,'4-702现场 · 当前页暂无新主线','4-702现场','页面说明',[
    '当前阶段的现场原始照片仍可回看，但主线已经转移到其他复核地点。',
    st===1?'如果抽屉差异已经登记，下一步应回讯问室确认陈默是否改口。':'回案卷室查看当前程序清单能更快找到下一站。',
    '返回案卷室后再次点击提示，会根据当前缺失前置给出具体方向。'
  ]);
}

function evidencePlan(s){
  const st=Number(s.stage)||0;
  if(st===0){
    const miss=[];if(!has(s.viewed,'confession'))miss.push('E01第一次供述');if(!has(s.viewed,'brass'))miss.push('E02黄铜书挡');
    if(miss.length)return plan('s0:evidence:base','物证室 · 初次移送原件','物证室','当前页面',[
      `本阶段只要求亲自打开两份基础原件。当前还缺：${miss.join('、')}。`,
      '打开证物卡即可登记“已阅”。E02也可以从4-702书桌区域调取。',
      'E01和E02都阅过后，如果讯问与现场检查也完成，回案卷室提交移送核验。'
    ]);
  }
  if(st===1&&!has(s.viewed,'drawer'))return plan('s1:evidence:drawer','物证室 · E03前置','物证室','前置条件未满足',[
    'E03抽屉定位记录需要通过4-702的“左侧抽屉柜”进入对比流程，仅在这里浏览列表并不能替代现场补核。',
    '先去4-702点击左侧抽屉柜。打开对比后，E03会自动登记为已阅。',
    '登记层数不一致后回讯问室复问，再把E03放到桌上完成质证。'
  ],{warning:true});
  if(st>=5&&!s.voiceSeen)return plan(`s${st}:evidence:voice`,'物证室 · E18可选录音','物证室','可选支线',[
    '当前主线未必需要在物证室停留，但这里有一条可能影响“完整复核”结局的可选材料。',
    'E18是11秒自动录音。它在物业审计完成后通过关联手机缓存出现，文字转写足以完成判断，不强制听声音。',
    '如果物业审计已经完成，回物业值班室点击“加入卷宗（可选）”即可取得E18。'
  ]);
  return plan(`s${st}:evidence:side`,'物证室 · 原件回看','物证室','页面说明',[
    '这里适合回看已经入卷的原始材料，但当前阶段的主线操作通常在对应复核场所完成。',
    '如果你是在找下一步，而不是核对某份原件，先回案卷室看程序清单。',
    '返回案卷室后点提示，系统会按照当前阶段与缺失条件给出具体地点。'
  ]);
}

function videoPlan(s){
  const st=Number(s.stage)||0;
  if(st===2){
    const miss=missingRecord(s);
    if(miss){
      const names={cctv:'20:36电梯画面',payment:'21:18支付',access:'21:24门禁',water:'21:31水表',parcel:'21:38快递柜',taxi:'21:52叫车'};
      if(!has(s.viewed,miss))return plan(`s2:video:${miss}:open`,`系统记录 · 先打开${names[miss]}`,'视频复核室','前置条件未满足',[
        `当前这条记录还没打开原件：${names[miss]}。输入框在未阅原件前会保持禁用。`,
        '先点该卡片的“打开原件”，只阅读它真正记录的主体、设备或事件，不补主语。',
        `打开${names[miss]}后再登记“这份原件直接记录了什么”。六条都要逐一完成。`
      ],{warning:true});
      return plan(`s2:video:${miss}:answer`,`系统记录 · 标注${names[miss]}`,'视频复核室','当前页面',[
        `原件已经打开。现在只回答${names[miss]}直接记录到的对象/事件。`,
        '判断原则：影像可以直接看到人；支付是账户/设备；门禁是卡号；水表是用水变化；快递柜是柜门事件；叫车是订单/账户。',
        '依次完成六条：电梯画面=人物/面部；支付=账户/设备；门禁=门卡/卡号；水表=用水；快递柜=柜门开启；叫车=订单/账户。'
      ]);
    }
    if(!s.lastSeenSolved)return plan('s2:video:last','系统记录 · 找最后一次直接见人','视频复核室','六条标注已完成',[
      '六条系统记录的“直接记录对象”已经拆开。现在只问哪一条最后直接确认到了邱承本人。',
      '支付、门禁、用水、柜门、叫车都能说明“发生了活动”，但没有直接看见脸。',
      '选择20:36电梯画面。它是现有材料里最后一条直接确认邱承面部的记录。'
    ]);
  }
  if(st===3){
    if(!s.arrivalSeen)return plan('s3:video:arrival','视频复核 · 调取陈默到场','视频复核室','当前页面',[
      '当前阶段不再分析邱承六条记录，而要补调陈默本人的车辆与消防梯影像。',
      '页面下方会出现“调取B2停车场 / 消防梯片段”。',
      '点击该入口取得E15：陈默21:29进入B座。取得后回讯问室问他的自述到场时间。'
    ]);
    return plan('s3:video:arrival-done','视频复核 · E15已取得','视频复核室','当前页面已完成',[
      'E15到场记录已经取得，本页当前阶段的任务完成。',
      '下一步去讯问室，让陈默自己说出到场与离开时间，再把E15与口供对照。',
      '回讯问室选择“你几点到、几点离开？”，随后把E15放到讯问桌。'
    ]);
  }
  return plan(`s${st}:video:side`,'视频复核室 · 记录回看','视频复核室','页面说明',[
    '这间复核室仍可回看六条电子记录，但当前主线已经进入其他环节。',
    '不要因为系统记录上出现活动就自动把主体写成邱承本人，这是本案最重要的证据边界之一。',
    '若要找当前推进点，回案卷室查看程序清单并重新打开提示。'
  ]);
}

function witnessPlan(s){
  const done=arr(s.witnessSeen).length;
  if(done<2)return plan(`witness:${done}`,'证人补录 · 可选支线','证人补录室','不阻断主线',[
    '这里是可选支线，不会卡住主线。它的作用是确认“系统记录”与“亲眼看见本人”之间的边界。',
    done===0?'冯越能说明门禁时段自己并未看清脸；钟嘉只能证明柜门提示音发生，不能证明取件者身份。':'已经补录一人，还可以把另一名证人的“直接感知范围”固定进附件。',
    '想补齐“完整复核”结局，就完成冯越和钟嘉两份补录；不想做支线可以直接返回案卷室继续主线。'
  ]);
  return plan('witness:done','证人补录 · 两份已完成','证人补录室','可选支线已完成',[
    '两份外围证人补录都已经完成。它们不会改变电子记录本身，只限制这些记录能够证明到哪一步。',
    '这两份补录会参与“完整复核”结局的完成度，但不会替代任何主线证据。',
    '现在可以返回案卷室继续当前主线。'
  ]);
}

function bookstorePlan(s){
  const seen=arr(s.bookstoreSeen);
  if(!has(seen,'message'))return plan('s4:bookstore:message','迟夏书店 · 先看E16','迟夏书店','前置条件未满足',[
    '时间线还不能开始，因为20:50的消息原件尚未打开。',
    '先点击“打开E16消息缓存”。这里只读取时间和消息内容，不先判断责任。',
    '打开E16后再打开E12急救缓存；E15到场记录来自上一阶段的视频室。'
  ],{warning:true});
  if(!has(seen,'call'))return plan('s4:bookstore:call','迟夏书店 · 再看E12','迟夏书店','前置条件未满足',[
    'E16已经打开，但20:52急救呼叫原件还没进入本页时间带。',
    '点击“打开E12急救缓存”，记录呼叫发生时间。',
    'E16与E12都打开、且E15已阅后，页面会出现三条材料的手工排序。'
  ],{warning:true});
  if(!has(s.viewed,'arrival'))return plan('s4:bookstore:arrival','迟夏书店 · 缺E15','迟夏书店','前置条件未满足',[
    '书店里的两条手机记录已经齐了，但时间线仍缺陈默的外部到场基准。',
    'E15来自视频复核室的B2停车场/消防梯补调，不是在书店里取得。',
    '先回视频复核室取得E15，再回迟夏书店，三条时间记录会一起进入排序。'
  ],{warning:true});
  if(!s.sequenceSolved)return plan('s4:bookstore:order','迟夏书店 · 排列三条时间','迟夏书店','当前页面',[
    '三份原件已经齐全，现在只恢复发生顺序，不评价动机。',
    '逐个把E16消息、E12急救、E15到场放入时间带；如果顺序不对可以撤回。',
    '正确顺序：20:50 E16消息 → 20:52 E12急救电话 → 21:29 E15陈默到场。'
  ]);
  return plan('s4:bookstore:done','迟夏书店 · 时间线已完成','迟夏书店','当前页面已完成',[
    '三条时间记录已经恢复，本页主线完成。',
    '下一步转到物业值班室，核对赵序对设备系统究竟做过哪些操作。',
    '回案卷室或直接进入物业值班室；审计时只看E14中真实出现的操作词。'
  ]);
}

function propertyPlan(s){
  if(!has(s.viewed,'zhaolog'))return plan('s5:property:open','物业审计 · 先开E14','物业值班室','前置条件未满足',[
    '审计按钮不能凭记忆勾选，先打开E14原始日志。',
    '只看日志中实际出现过的英文操作，不把“他有权限做”当成“他真的做过”。',
    '点击“打开E14原始日志”，读完后页面会开放 LOGIN / QUERY / WRITE / DELETE / TIME_EDIT 五项选择。'
  ],{warning:true});
  if(!s.propertySolved)return plan('s5:property:ops','物业审计 · 只勾真实操作','物业值班室','当前页面',[
    '现在要判断的是“日志实际发生了什么”，不是赵序理论上能做什么。',
    '逐行找操作词。查询记录与修改记录要严格区分；没有出现的操作不要勾。',
    '只选择 LOGIN 与 QUERY，然后提交审计。WRITE、DELETE、TIME_EDIT都没有出现。'
  ]);
  if(!s.voiceSeen)return plan('s5:property:voice','物业审计 · 可选E18','物业值班室','主线已完成 · 可选',[
    '设备审计主线已经完成。页面现在会出现一条11秒自动录音索引，这是可选材料。',
    'E18不阻断进入法医复核，但会丰富完整复核结局；文字转写已经足够，不依赖声音。',
    '点击“加入卷宗（可选）”即可取得E18。之后回案卷室进入法医复核。'
  ]);
  return plan('s5:property:done','物业审计 · 本页已完成','物业值班室','当前页面已完成',[
    'E14审计和E18可选录音都已处理完。',
    '下一步在法医复核室把最初伤害与后续救助拆成两个时间阶段。',
    '进入法医复核室，查看E17与E12，并结合已经存在的E16和E15。'
  ]);
}

function forensicPlan(s){
  const seen=arr(s.forensicSeen);
  if(!has(seen,'autopsy'))return plan('s6:forensic:autopsy','法医复核 · 先看E17','法医复核室','前置条件未满足',[
    '复核板还不会出现，因为法医底稿尚未打开。',
    '先点击“查看E17法医底稿”，重点看伤后是否存在可救助时间窗。',
    '打开E17后再查看E12急救缓存，并确认E16消息、E15到场记录也已阅。'
  ],{warning:true});
  if(!has(seen,'call'))return plan('s6:forensic:call','法医复核 · 再看E12','法医复核室','前置条件未满足',[
    'E17已经看过，但复核板仍缺急救呼叫原件。',
    '点击“查看E12急救缓存”，确认曾经发起过120但很快中断。',
    'E17、E12、E16、E15四类材料齐全后，页面才会出现三问复核板。'
  ],{warning:true});
  if(!has(s.viewed,'message'))return plan('s6:forensic:message','法医复核 · 缺E16消息','法医复核室','前置条件未满足',[
    '法医和急救材料都在，但还缺一条能直接说明20:50状态的消息。',
    'E16在迟夏书店。它写明20:50时邱承仍在喘，是“仍有自主呼吸”的直接依据。',
    '回迟夏书店打开E16消息缓存，再回法医复核室。'
  ],{warning:true});
  if(!has(s.viewed,'arrival'))return plan('s6:forensic:arrival','法医复核 · 缺E15到场','法医复核室','前置条件未满足',[
    '还缺陈默真实到场时间，无法判断他是否可能参与20:50前的最初冲突。',
    'E15来自视频复核室的停车场/消防梯片段，记录陈默21:29进入B座。',
    '先取得E15，再回法医复核室完成三问。'
  ],{warning:true});
  if(!s.forensicSolved)return plan('s6:forensic:board','法医复核 · 三项事实','法医复核室','当前页面',[
    '四类前置材料已经齐全。三问分别对应“20:50状态”“陈默是否可能参与早期冲突”“伤害与救助能否拆分”。',
    '第一问找能直接写出“仍在喘”的材料；第二问比较20:50与21:29；第三问只按法医底稿是否允许分段评价。',
    '依次选择：E16消息 / 不兼容 / 可以分开。提交后主线进入陈默第二份口供。'
  ]);
  return plan('s6:forensic:done','法医复核 · 本页已完成','法医复核室','当前页面已完成',[
    '法医时间窗已经闭合。最初伤害和之后的救助选择现在可以分别评价。',
    '下一步回讯问室，用E16与E15逼近陈默真正的到场边界。',
    '在讯问室提出20:50关键问题，并把E16、E15两条时间材料都放上桌。'
  ]);
}

function reviewPlan(s){
  if((Number(s.stage)||0)<8)return plan('review:locked','案件复核会议 · 尚未开放','案件复核会议','前置条件未满足',[
    '终局责任链需要先完成第二份口供。当前材料还不足以进入最终归责。',
    '回案卷室看当前主线；通常需要先完成法医复核，再回讯问室挂接E16与E15。',
    '当陈默补充讯问完成、Stage进入8后，复核会议室才应作为最后一步。'
  ],{warning:true});
  const f=s.final||{};
  const sections=[['initial','最初伤害'],['rescue','救助中断'],['cover','事后时间线设计'],['confess','虚假自首']];
  const miss=sections.find(([id])=>!f[id]||!f[id].person||arr(f[id].evidence).length<2);
  if(miss)return plan(`s8:review:${miss[0]}`,`责任链 · 补“${miss[1]}”`,'案件复核会议','当前页面',[
    `“${miss[1]}”这一段还没有完整填写：需要一个主要行为人和两份能够共同解释该段行为的材料。`,
    '不要追求同一人解释全部案件。四张责任卡本来就允许不同的人承担不同阶段行为。',
    miss[0]==='initial'?'最初伤害指向林夏；可用E02黄铜书挡搭配E16消息或20:36影像。':miss[0]==='rescue'?'救助中断指向林夏/赵序；用E12急救或E16消息搭配E17法医底稿。':miss[0]==='cover'?'事后时间线设计指向赵序；E14设备日志要与门禁/支付/水表/快递柜/叫车中的一条搭配。':'虚假自首指向陈默；E01第一次供述可搭配E15到场或E03抽屉定位。'
  ]);
  if(f.model!=='layered')return plan('s8:review:model','责任链 · 选择案件模型','案件复核会议','最后前置',[
    '四段责任卡已经填写，但还需要选择能解释全部已确认事实的案件模型。',
    '单一凶手模型会把不同时间段强行归到一个人；共同预谋模型又要求目前没有证明的共同故意。',
    '选择“四段行为分别认定”，再生成补充复核意见。'
  ]);
  return plan('s8:review:submit','责任链 · 可以提交','案件复核会议','前置已齐',[
    '四段行为和案件模型都已填好。现在可以提交复核意见。',
    '如果仍提示“有一段行为无法解释”，说明某张责任卡虽然选满两份材料，但组合并不是有效的因果证据对。',
    '提交前快速核对：林夏=最初伤害；林夏/赵序=救助中断；赵序=事后时间线设计；陈默=虚假自首；模型=四段分别认定。'
  ]);
}

function currentPlan(s){
  if(s.ending)return plan('ending:review','结案后 · 提示回看',pageNames[s.location]||'结案','案件已结束',[
    '主案已经结案。此时提示不会再推进主线，只用于回看本局已经解锁过的内容。',
    '结案页的“供述来源复盘”和“证词边界复盘”是额外复盘内容。',
    '若要追求完整复核，二周目可补E18和两名外围证人的补录。'
  ]);
  switch(s.location){
    case'interrogation':return interrogationPlan(s);
    case'scene':return scenePlan(s);
    case'evidence':return evidencePlan(s);
    case'video':return videoPlan(s);
    case'witness':return witnessPlan(s);
    case'bookstore':return bookstorePlan(s);
    case'property':return propertyPlan(s);
    case'forensic':return forensicPlan(s);
    case'review':return reviewPlan(s);
    default:return hallPlan(s);
  }
}

function ensureHintUi(){
  const card=$('#hintPanel .hint-card');if(!card)return;
  let meta=$('#contextHintMeta');
  if(!meta){meta=document.createElement('div');meta.id='contextHintMeta';meta.className='context-hint-meta';const text=$('#hintText');text?.before(meta);}
  let progress=$('#contextHintProgress');
  if(!progress){
    progress=document.createElement('div');progress.id='contextHintProgress';progress.className='context-hint-progress';
    progress.innerHTML='<button type="button" data-context-review="1">回看1级</button><button type="button" data-context-review="2">回看2级</button><button type="button" data-context-review="3">回看3级</button><button type="button" data-context-review="all">全部回看</button>';
    const actions=$('#hintPanel .hint-actions');actions?.before(progress);
    const note=document.createElement('div');note.className='hint-review-note';note.textContent='回看不会增加提示使用次数；“下一层提示”只在首次解锁新层级时计数。';progress.after(note);
  }
  $('#hintText')?.classList.add('context-hint-text');
}
function saveEntry(p,level){
  const h=readHistory();
  let e=h.entries[p.key];
  const oldLevel=Number(e?.level)||0;
  if(!e){e={key:p.key,title:p.title,page:p.page,phase:p.phase,hints:p.hints,level:0,createdAt:Date.now()};h.entries[p.key]=e;h.order.push(p.key);}
  e.title=p.title;e.page=p.page;e.phase=p.phase;e.hints=p.hints;e.level=Math.max(oldLevel,level);e.updatedAt=Date.now();
  if(level>oldLevel)h.unlockCount=(Number(h.unlockCount)||0)+1;
  writeHistory(h);return {history:h,entry:e,unlocked:level>oldLevel};
}
function showLevel(p,level,review=false){
  ensureHintUi();
  const h=readHistory();const e=h.entries[p.key];const max=Number(e?.level)||0;
  const title=$('#hintPanel h2');if(title)title.textContent=p.title;
  const mono=$('#hintPanel .hint-card .mono');if(mono)mono.textContent=`SUN LAN / ${p.page} / REVIEW ASSIST`;
  const meta=$('#contextHintMeta');if(meta)meta.innerHTML=`<span class="context-hint-chip">当前页面：${p.page}</span><span class="context-hint-chip ${p.warning?'warn':''}">${p.phase}</span><span class="context-hint-chip">已解锁 ${max}/3</span>`;
  const text=$('#hintText');if(text){text.textContent=p.hints[Math.max(0,Math.min(2,level-1))]||'提示只在你主动打开时出现。';}
  $$('#contextHintProgress [data-context-review]').forEach(b=>{
    const v=b.dataset.contextReview;
    if(v==='all'){b.classList.remove('locked');b.disabled=false;b.classList.toggle('active',review&&v==='all');return;}
    const n=Number(v);b.disabled=n>max;b.classList.toggle('locked',n>max);b.classList.toggle('active',review&&n===level);
  });
  const next=$('#hintPanel [data-action="hint-next"]');
  if(next)next.textContent=max>=3?'三级已解锁 · 回看':'下一层提示';
  $('#hintPanel')?.classList.remove('hidden');
}
function openCurrent(){
  const s=readState();if(s.expert)return;
  const p=currentPlan(s);const h=readHistory();const lv=Number(h.entries[p.key]?.level)||0;
  if(lv>0)showLevel(p,lv,true);else{
    ensureHintUi();
    const title=$('#hintPanel h2');if(title)title.textContent=p.title;
    const mono=$('#hintPanel .hint-card .mono');if(mono)mono.textContent=`SUN LAN / ${p.page} / REVIEW ASSIST`;
    const meta=$('#contextHintMeta');if(meta)meta.innerHTML=`<span class="context-hint-chip">当前页面：${p.page}</span><span class="context-hint-chip ${p.warning?'warn':''}">${p.phase}</span><span class="context-hint-chip">已解锁 0/3</span>`;
    const text=$('#hintText');if(text)text.textContent='当前提示已经根据你所在页面和现有前置条件重新定位。点“下一层提示”只解锁这一页当前缺口的帮助。';
    $$('#contextHintProgress [data-context-review]').forEach(b=>{const all=b.dataset.contextReview==='all';b.disabled=!all;b.classList.toggle('locked',!all);b.classList.remove('active');});
    const next=$('#hintPanel [data-action="hint-next"]');if(next)next.textContent='下一层提示';
    $('#hintPanel')?.classList.remove('hidden');
  }
}
function unlockNext(){
  const s=readState();if(s.expert)return;
  const p=currentPlan(s);const h=readHistory();const old=Number(h.entries[p.key]?.level)||0;
  if(old>=3){showLevel(p,3,true);return;}
  const next=old+1;saveEntry(p,next);showLevel(p,next,false);patchEndingMetric();
}
function reviewOne(level){
  const p=currentPlan(readState());const h=readHistory();const e=h.entries[p.key];if(!e||level>e.level)return;showLevel(p,level,true);
}
function showArchive(){
  ensureHintUi();const h=readHistory();const keys=h.order.filter(k=>h.entries[k]?.level>0).slice().reverse();
  const title=$('#hintPanel h2');if(title)title.textContent='本局提示回看';
  const meta=$('#contextHintMeta');if(meta)meta.innerHTML=`<span class="context-hint-chip">已记录 ${keys.length} 个页面阶段</span><span class="context-hint-chip">首次解锁 ${h.unlockCount||0} 次</span>`;
  const text=$('#hintText');if(text){
    text.innerHTML=keys.length?`<span class="hint-archive">${keys.map(k=>{const e=h.entries[k];return `<span class="hint-archive-entry"><b>${e.page} · ${e.title}</b><small>${e.phase} · 已解锁${e.level}/3</small>${e.hints.slice(0,e.level).map((x,i)=>`<span class=\"hint-line\">${i+1}级：${escapeHtml(x)}</span>`).join('')}</span>`}).join('')}</span>`:'还没有解锁过任何提示。';
  }
  $$('#contextHintProgress [data-context-review]').forEach(b=>{b.classList.toggle('active',b.dataset.contextReview==='all')});
  $('#hintPanel')?.classList.remove('hidden');
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function patchButton(){
  const b=document.querySelector('[data-action="hint"]');if(!b)return;
  const s=readState();if(s.expert)return;
  b.textContent=buttonNames[s.location]||'提示';
  b.title=`查看${pageNames[s.location]||'当前页面'}提示（H）`;
}
function patchEndingMetric(){
  const h=readHistory();const spans=[...document.querySelectorAll('.review-metrics span')];const t=spans.find(x=>x.textContent.trim().startsWith('主动提示：'));if(t){const s=readState();t.textContent=`主动提示：${Math.max(Number(s.hintUses)||0,Number(h.unlockCount)||0)}`;}
}
function exportWithHints(){
  const state=readState();const h=readHistory();state.contextHintArchive=h;state.hintUses=Math.max(Number(state.hintUses)||0,Number(h.unlockCount)||0);
  const b=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='case17_save.json';a.click();URL.revokeObjectURL(a.href);
}
function pristine(s){return (Number(s.stage)||0)===0&&!arr(s.asked).length&&!arr(s.scene).length&&!arr(s.viewed).length&&!s.transferSubmitted;}
function checkResetPending(){
  if(sessionStorage.getItem(RESET_FLAG)!=='1')return;
  if(pristine(readState()))clearHistory();
  sessionStorage.removeItem(RESET_FLAG);
}
function init(){
  ensureHintUi();checkResetPending();patchButton();patchEndingMetric();
  const view=$('#view');if(view)new MutationObserver(()=>requestAnimationFrame(()=>{patchButton();patchEndingMetric();})).observe(view,{childList:true});
  const hud=$('#hudLocation');if(hud)new MutationObserver(()=>requestAnimationFrame(patchButton)).observe(hud,{childList:true,characterData:true});

  document.addEventListener('click',e=>{
    const review=e.target.closest('[data-context-review]');if(review){e.preventDefault();e.stopImmediatePropagation();const v=review.dataset.contextReview;if(v==='all')showArchive();else reviewOne(Number(v));return;}
    const hint=e.target.closest('[data-action="hint"]');if(hint){e.preventDefault();e.stopImmediatePropagation();openCurrent();return;}
    const next=e.target.closest('[data-action="hint-next"]');if(next){e.preventDefault();e.stopImmediatePropagation();unlockNext();return;}
    const exp=e.target.closest('#toolExport');if(exp){e.preventDefault();e.stopImmediatePropagation();exportWithHints();return;}
    if(e.target.closest('[data-action="new"]')||e.target.closest('#restart'))clearHistory();
    if(e.target.closest('#toolReset')){sessionStorage.setItem(RESET_FLAG,'1');setTimeout(()=>{sessionStorage.removeItem(RESET_FLAG);},500);}
  },true);
  document.addEventListener('change',e=>{
    if(e.target?.id==='importFile')setTimeout(()=>{const imported=readState().contextHintArchive;if(imported?.entries){writeHistory(imported);patchButton();}},120);
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key.toLowerCase()!=='h')return;
    const app=$('#app'),theatre=$('#theatre');if(!app||app.classList.contains('hidden'))return;
    const s=readState();
    if(s.expert|| (theatre&&!theatre.classList.contains('hidden'))){e.preventDefault();e.stopImmediatePropagation();return;}
    e.preventDefault();e.stopImmediatePropagation();openCurrent();
  },true);
}

window.CASE17_CONTEXT_HINTS={currentPlan,readHistory,clearHistory};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
