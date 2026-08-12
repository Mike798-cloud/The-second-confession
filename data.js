window.CASE17 = {
  meta:{
    title:"第二份口供",
    caseNo:"CASE 17",
    agency:"荔州市公安局",
    date:"2026-05-18"
  },
  people:{
    chen:{name:"陈默",role:"主动投案者 / 林夏弟弟",public:"28岁，网约车司机。案发后三天主动到案。",relation:"林夏的弟弟。少年时期由姐姐照顾长大。",later:"他并没有亲历最初冲突，但后来确实进入4-702，并主动承担了整起案件。"},
    lin:{name:"林夏",role:"迟夏书店经营者",public:"34岁。与死者邱承存在担保债务纠纷。",relation:"陈默姐姐，与赵序相识多年。",later:"她在最初冲突中造成伤害；之后曾尝试拨打120，却没有完成求助。"},
    zhao:{name:"赵序",role:"物业设备运维工程师",public:"40岁。负责西河公寓门禁、水表等设备维护。",relation:"与林家相识十余年。",later:"他没有篡改系统数据，但熟悉各套系统记录的边界，并参与了事后掩饰设计。"},
    qiu:{name:"邱承",role:"死者 / 民间债务中介",public:"38岁。长期处理私人债务，曾被投诉暴力催收。",relation:"与林夏存在债务纠纷。",later:"其个人品行与死亡过程需要分别评价。"},
    han:{name:"韩川",role:"原案主办侦查员",public:"45岁。陈默投案后负责原案证据闭环。",relation:"与涉案人员无私人关系。",later:"没有证据证明他伪造材料；原案错误来自对真实记录的过度解释。"},
    sun:{name:"孙岚",role:"行为分析顾问",public:"36岁。本次补充复核顾问。",relation:"未参与原案侦查。",later:"她坚持只记录可观察行为，不把停顿、平静等表现直接写成谎言。"},
    feng:{name:"冯越",role:"西河公寓夜班保安",public:"52岁。案发当晚值班。",relation:"与住户无私人关系。",later:"最初笔录因担心离岗抽烟被处罚而压缩了一段目击。"},
    zhong:{name:"钟嘉",role:"快递员",public:"25岁。案发夜在快递柜附近补柜。",relation:"与核心人物无私人关系。",later:"他只听到柜门开启，从未确认开柜人的脸。"}
  },
  evidence:{
    confession:{no:"E01",name:"第一次讯问录像转写",img:"ev_confession.jpg",kind:"讯问",stage:0,raw:"陈默称21:45左右到4-702，使用桌边黄铜书挡击打邱承；称后来把书挡放回书桌第二层抽屉。"},
    brass:{no:"E02",name:"黄铜书挡",img:"obj_brass.jpg",kind:"实物",stage:0,raw:"书挡表面检出邱承血迹。采集于4-702书桌区域。"},
    drawer:{no:"E03",name:"物证定位照片",img:"ev_drawer.jpg",kind:"现场",stage:1,raw:"现场采集记录：黄铜书挡位于书桌左侧第一层抽屉。"},
    phone:{no:"E04",name:"邱承手机",img:"obj_phone.jpg",kind:"实物",stage:2,raw:"手机在4-702桌边提取。设备在案发后仍有多次账户活动记录。"},
    payment:{no:"E05",name:"21:18移动支付流水",img:"ev_payment.jpg",kind:"数字记录",stage:2,raw:"21:18:43，便利店自助柜支付16元。付款账户：邱承；设备：邱承手机。"},
    card:{no:"E06",name:"Q-4702住户卡",img:"obj_card.jpg",kind:"实物",stage:2,raw:"住户卡编号Q-4702。卡片本身无生物识别信息。"},
    access:{no:"E07",name:"21:24门禁记录",img:"ev_access.jpg",kind:"数字记录",stage:2,raw:"21:24:05，Q-4702住户卡通过B座东门。"},
    water:{no:"E08",name:"21:31智能水表",img:"ev_water.jpg",kind:"设备记录",stage:2,raw:"21:31:17，4-702用水18.6L。"},
    parcel:{no:"E09",name:"21:38快递柜记录",img:"ev_parcel.jpg",kind:"设备记录",stage:2,raw:"21:38:22，7-14号柜门开启。"},
    taxi:{no:"E10",name:"21:52网约车订单",img:"ev_taxi.jpg",kind:"平台记录",stage:2,raw:"21:52:04，由邱承账户发起网约车订单。司机未在原笔录中确认乘客面部。"},
    cctv:{no:"E11",name:"B座电梯视频截图",img:"ev_cctv.jpg",kind:"影像",stage:2,raw:"20:36:14电梯轿厢画面可见邱承面部。20:44:51林夏从消防楼梯进入4层。"},
    call:{no:"E12",name:"120呼叫缓存",img:"ev_call.jpg",kind:"通信",stage:4,raw:"20:52，林夏手机拨打120；呼叫建立后约4秒结束。"},
    shoe:{no:"E13",name:"鞋底与雨水检材",img:"ev_shoe.jpg",kind:"现场",stage:3,raw:"走廊与鞋底均有当晚雨水、泥点残留。"},
    zhaolog:{no:"E14",name:"赵序设备访问日志",img:"ev_zhao_log.jpg",kind:"系统日志",stage:5,raw:"21:06登录物业终端；21:08查询4栋门禁；21:10查询4-702住户卡序列。审计记录未发现写入、删除或时间戳修改。"},
    arrival:{no:"E15",name:"陈默到场记录",img:"ev_chen_arrival.jpg",kind:"影像",stage:3,raw:"21:27陈默车辆进入车库；21:29消防梯画面记录其进入B座。"},
    message:{no:"E16",name:"林夏消息缓存",img:"ev_bookshop_msg.jpg",kind:"通信",stage:4,raw:"20:50，林夏发给赵序：‘他倒下了，还在喘。’"},
    autopsy:{no:"E17",name:"法医底稿摘要",img:"ev_autopsy.jpg",kind:"医疗",stage:6,raw:"头部损伤严重；结合现场与生理反应，受伤后仍可能存在短暂自主呼吸及可救治时间窗。"},
    voice:{no:"E18",name:"11秒自动录音索引",img:"ev_voice_note.jpg",kind:"音频索引",stage:5,optional:true,raw:"手机自动录音索引，长度11秒。转写：林夏‘我打120。’ 赵序‘先别——我过去。’"}
  },
  recordTags:{
    cctv:"person",
    payment:"carrier",
    access:"carrier",
    water:"environment",
    parcel:"carrier",
    taxi:"carrier"
  },
  films:{
    intake:[
      {img:"film_corridor_wide.jpg",ambient:"records",sfx:"door",caption:"21:12 / 荔州市公安局 · 讯问区",hold:900},
      {img:"film_interrogation_wide.jpg",ambient:"interrogation",sfx:"rec",hud:"REC 21:14:08",speaker:"韩川",line:"姓名。",hold:800},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",hud:"REC 21:14:14",speaker:"陈默",line:"陈默。",hold:700},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",hud:"REC 21:14:21",speaker:"韩川",line:"为什么来？",hold:900},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",hud:"REC 21:14:32",speaker:"陈默",line:"人是我杀的。",hold:1400},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"paper",caption:"原案卷宗随后进入移送程序。",hold:1100}
    ],
    transferPass:[
      {img:"film_records_detail.jpg",ambient:"records",sfx:"paper",caption:"讯问、凶器、倒地位置：材料互相对应。",hold:900},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"stamp",stamp:"移送核验通过",hold:1000},
      {img:"film_apartment_wide.jpg",ambient:"rain",caption:"程序最后一项：补核物证采集位置。",hold:750},
      {img:"film_apartment_window.jpg",ambient:"rain",caption:"4-702 / 原现场复核",hold:800}
    ],
    drawerBreak:[
      {img:"ev_confession.jpg",ambient:"records",sfx:"rec",speaker:"陈默 · 第一次讯问",line:"“擦了一下，放回书桌第二层抽屉。”",hold:1300},
      {img:"ev_drawer.jpg",ambient:"records",caption:"现场物证定位记录",hold:1300},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",sfx:"transition",hold:900},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"stamp",stamp:"移送暂缓",caption:"第17号案件转入补充复核。",hold:1400}
    ],
    recordsMontage:[
      {img:"ev_cctv.jpg",ambient:"records",caption:"20:36:14",hold:650},
      {img:"film_apartment_phone.jpg",ambient:"records",caption:"4-702 / 邱承手机",hold:500},
      {img:"ev_payment.jpg",ambient:"records",caption:"21:18:43",hold:550},
      {img:"ev_access.jpg",ambient:"records",caption:"21:24:05",hold:550},
      {img:"ev_water.jpg",ambient:"records",caption:"21:31:17",hold:550},
      {img:"ev_parcel.jpg",ambient:"records",caption:"21:38:22",hold:550},
      {img:"ev_taxi.jpg",ambient:"records",caption:"21:52:04",hold:750},
      {img:"film_records_detail.jpg",ambient:"records",speaker:"韩川",line:"把20:36以后的记录全部单独列出来。",hold:1200}
    ],
    arrivalBreak:[
      {img:"ev_chen_arrival.jpg",ambient:"records",caption:"21:29 / B座消防梯",hold:1100},
      {img:"film_interrogation_wide.jpg",ambient:"interrogation",sfx:"rec",speaker:"韩川",line:"你的车21:27才进车库。",hold:900},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默",line:"……那段监控可能时间不准。",hold:1500},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",caption:"原供述中，他对21:45—21:58的时间没有犹豫。",hold:1200}
    ],
    phoneFourSeconds:[
      {img:"film_bookstore_wide.jpg",ambient:"rain",caption:"20:50 / 迟夏书店",hold:800},
      {img:"ev_bookshop_msg.jpg",ambient:"rain",speaker:"林夏 · 消息缓存",line:"“他倒下了，还在喘。”",hold:1300},
      {img:"film_bookstore_counter.jpg",ambient:"rain",sfx:"phone",caption:"20:52 / 120呼叫建立",hold:750},
      {img:"film_bookstore_counter.jpg",ambient:"rain",caption:"4秒",hold:1200}
    ],
    propertyAudit:[
      {img:"film_records_wide.jpg",ambient:"records",caption:"21:06 / 物业设备终端",hold:700},
      {img:"ev_zhao_log.jpg",ambient:"records",sfx:"printer",caption:"审计记录",hold:1200},
      {img:"film_records_detail.jpg",ambient:"records",speaker:"审计员",line:"没有写入。没有删除。没有改时间。",hold:1300}
    ],
    rescueWindow:[
      {img:"ev_autopsy.jpg",ambient:"records",sfx:"paper",caption:"法医底稿 · 补充复核",hold:1100},
      {img:"ev_bookshop_msg.jpg",ambient:"records",speaker:"林夏 · 20:50",line:"“他倒下了，还在喘。”",hold:1100},
      {img:"film_bookstore_counter.jpg",ambient:"rain",sfx:"phone",caption:"20:52 / 120 / 4秒",hold:900},
      {img:"film_corridor_door.jpg",ambient:"rain",caption:"21:29 / 陈默进入B座",hold:900}
    ],
    secondConfession:[
      {img:"film_interrogation_wide.jpg",ambient:"interrogation",sfx:"door",caption:"补充讯问 / ROOM 03",hold:800},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",speaker:"韩川",line:"20:50她已经说‘他倒下了’。你21:29才进楼。",hold:1200},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默",line:"……我到的时候，他已经倒在那里。",hold:1600},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",speaker:"韩川",line:"那第一份口供里的细节，从哪来的？",hold:1200},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默",line:"有人告诉我，什么细节必须说对。",hold:1600}
    ],
    ending:[
      {img:"film_records_detail.jpg",ambient:"records",sfx:"printer",caption:"第17号案件补充复核意见生成中",hold:1000},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"stamp",stamp:"撤回原移送意见",hold:1100},
      {img:"film_interrogation_wide.jpg",ambient:"interrogation",sfx:"door",caption:"陈默 · 补充讯问",hold:800},
      {img:"film_interrogation_table.jpg",ambient:"interrogation",speaker:"韩川",line:"陈默。我们重新来。",hold:1000},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默",line:"我姐不知道我要来自首。",hold:1500},
      {img:"film_records_wide.jpg",ambient:"records",caption:"一个案件被重新拆成四段行为。",hold:1200}
    ],
    replayTruth:[
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“桌边那只黄铜书挡。”",caption:"真相标注：来自事后到场所见。",hold:1400},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“他倒在书桌右边。”",caption:"真相标注：来自事后现场。",hold:1400},
      {img:"film_interrogation_left.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“放回第二层抽屉。”",caption:"真相标注：转述在这里第一次出现偏差。",hold:1700}
    ]
  },
  hints:{
    transfer:["先按普通移送流程核对三类材料：讯问、现场、凶器。","讯问里至少听完“为什么来”和“凶器是什么”；现场至少检查书桌与倒地位置。","读完E01与E02后，回案卷室提交移送核验。"],
    drawer:["这一步只核对物证采集位置，不需要推测谁在撒谎。","把第一次供述里关于抽屉层数的原句和E03放在一起看。","供述写‘第二层’，现场定位写‘第一层’。"],
    records:["先给每条电子记录标注它直接确认的对象。不要先问它意味着什么。","能看到脸的影像与账户、卡片、设备记录不是同一证明层级。","E11=本人；支付/门禁/快递/网约车=凭证或设备；水表=环境行为。"],
    arrival:["在视频室找陈默车辆与消防梯片段，再回讯问室。","比较陈默口供中的到场时间与E15。","E15显示21:29进入B座。"],
    bookstore:["只排列三个时间：消息、120、陈默到场。","先看E16和E12，再对照E15。","20:50消息 → 20:52急救电话 → 21:29陈默到场。"],
    property:["先只读日志，判断发生的是查询、写入还是删除。","E14的审计记录会明确列出操作类型。","赵序只有查询，没有写入、删除或改时间。"],
    forensic:["把法医、20:50消息、20:52急救电话、21:29到场放到同一条时间线上。","先回答陈默是否可能参与最初冲突，再回答伤后是否还有另一个责任阶段。","陈默21:29才到；法医材料提示受伤后存在可救治窗口。"],
    final:["终局不是找一个‘凶手’，而是给四段行为分别归属。","初始伤害、救助中断、事后设计、虚假自首分别找人和材料。","初始伤害=林夏；救助中断=林夏/赵序；事后设计=赵序；虚假自首=陈默。"]
  }
};