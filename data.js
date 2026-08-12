window.CASE17 = {
  meta:{
    title:"第二份口供",
    caseNo:"CASE 17",
    agency:"荔州市公安局",
    date:"2026-05-18"
  },
  people:{
    chen:{name:"陈默",role:"主动投案者 / 林夏弟弟",portrait:"portrait_chen_v6.jpg",public:"28岁，网约车司机。案发后三天主动到案。",relation:"林夏的弟弟。少年时期由姐姐照顾长大。",midStage:3,mid:"补充影像确认：其车辆21:27进入车库，21:29才进入B座。",later:"他并没有亲历最初冲突，但后来确实进入4-702，并主动承担了整起案件。"},
    lin:{name:"林夏",role:"迟夏书店经营者",portrait:"portrait_lin_v6.jpg",public:"34岁。与死者邱承存在担保债务纠纷。",relation:"陈默姐姐，与赵序相识多年。",midStage:4,mid:"20:50消息缓存显示，她在陈默到场前已经知道邱承倒地且仍有呼吸。",later:"她在最初冲突中造成伤害；之后曾尝试拨打120，却没有完成求助。"},
    zhao:{name:"赵序",role:"物业设备运维工程师",portrait:"portrait_zhao_v6.jpg",public:"40岁。负责西河公寓门禁、水表等设备维护。",relation:"与林家相识十余年。",midStage:5,mid:"物业审计日志记录其21:06—21:10连续查询门禁与住户卡信息。",later:"他没有篡改系统数据，但熟悉各套系统记录的边界，并参与了事后掩饰设计。"},
    qiu:{name:"邱承",role:"死者 / 民间债务中介",portrait:"portrait_qiu_v6.jpg",public:"38岁。长期处理私人债务，曾被投诉暴力催收。",relation:"与林夏存在债务纠纷。",midStage:6,mid:"法医补充材料将“最初伤害”与“伤后救助窗口”拆成了两个时间阶段。",later:"其个人品行与死亡过程需要分别评价。"},
    han:{name:"韩川",role:"原案主办侦查员",portrait:"portrait_han_v6.jpg",public:"45岁。陈默投案后负责原案证据闭环。",relation:"与涉案人员无私人关系。",midStage:2,mid:"补充复核开始后，他同意把原案中的电子记录重新按来源拆开，而不是沿用旧结论。",later:"没有证据证明他伪造材料；原案错误来自对真实记录的过度解释。"},
    sun:{name:"孙岚",role:"行为分析顾问",portrait:"portrait_sun_v6.jpg",public:"36岁。本次补充复核顾问。",relation:"未参与原案侦查。",midStage:1,mid:"她要求讯问观察只写可见动作与停顿，不把“冷静”“沉默”直接判成谎言。",later:"她坚持只记录可观察行为，不把停顿、平静等表现直接写成谎言。"},
    feng:{name:"冯越",role:"西河公寓夜班保安",portrait:"scene_corridor.jpg",public:"52岁。案发当晚值班。",relation:"与住户无私人关系。",midStage:3,mid:"补录笔录承认自己20:30前后曾离岗抽烟，因此原笔录中的时间描述并不完整。",later:"最初笔录因担心离岗抽烟被处罚而压缩了一段目击。"},
    zhong:{name:"钟嘉",role:"快递员",portrait:"scene_bookstore.jpg",public:"25岁。案发夜在快递柜附近补柜。",relation:"与核心人物无私人关系。",midStage:2,mid:"补充说明：21:38只听见柜门开启声，没有看清开柜人的脸。",later:"他只听到柜门开启，从未确认开柜人的脸。"}
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
      {img:"film_interrogation_v6.jpg",ambient:"interrogation",sfx:"rec",hud:"REC 21:14:08",speaker:"韩川",line:"姓名。",hold:1000,motion:"still"},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",hud:"REC 21:14:14",speaker:"陈默",line:"陈默。",hold:1000,motion:"push"},
      {img:"film_interrogation_hands_v6.jpg",ambient:"interrogation",sfx:"paper",hud:"REC 21:14:21",speaker:"韩川",line:"为什么来？",hold:1100,motion:"pan-left"},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",sfx:"chair",hud:"REC 21:14:32",speaker:"陈默",line:"人是我杀的。",hold:1900,motion:"still"},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"paper",caption:"原案卷宗随后进入移送程序。",hold:1100}
    ],
    transferPass:[
      {img:"film_records_detail.jpg",ambient:"records",sfx:"paper",caption:"讯问、凶器、倒地位置：材料互相对应。",hold:900},
      {img:"film_records_wide.jpg",ambient:"records",sfx:"stamp",stamp:"移送核验通过",hold:1000},
      {img:"portrait_han_v6.jpg",ambient:"records",speaker:"韩川",line:"讯问、凶器、现场都能互相对应。按程序，把最后一项定位补完。",hold:1500,motion:"still"},
      {img:"scene_apartment_v6.jpg",ambient:"rain",caption:"程序最后一项：补核物证采集位置。",hold:1000,motion:"push"},
      {img:"scene_desk_v6.jpg",ambient:"rain",sfx:"drawer",caption:"4-702 / 原现场复核",hold:1000,motion:"pan-right"}
    ],
    drawerBreak:[
      {img:"ev_confession.jpg",ambient:"records",sfx:"rec",speaker:"陈默 · 第一次讯问",line:"“擦了一下，放回书桌第二层抽屉。”",hold:1300},
      {img:"scene_drawers_v6.jpg",ambient:"rain",sfx:"drawer",caption:"4-702 / 书桌左侧抽屉柜",hold:1400,motion:"push"},
      {img:"film_interrogation_over_v6.jpg",ambient:"interrogation",sfx:"transition",hold:1200,motion:"still"},
      {img:"portrait_sun_v6.jpg",ambient:"records",speaker:"孙岚",line:"先把两份原话并列。别急着给这个差异解释。",hold:1500,motion:"still"},
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
      {img:"portrait_han_v6.jpg",ambient:"records",speaker:"韩川",line:"把20:36以后的每一条都拆开。先写它记录了什么，再谈它意味着什么。",hold:1600,motion:"still"}
    ],
    arrivalBreak:[
      {img:"ev_chen_arrival.jpg",ambient:"records",caption:"21:29 / B座消防梯",hold:1100},
      {img:"film_interrogation_v6.jpg",ambient:"interrogation",sfx:"rec",speaker:"韩川",line:"你的车21:27才进车库。",hold:1100,motion:"still"},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",sfx:"chair",speaker:"陈默",line:"……那段监控可能时间不准。",hold:1800,motion:"push"},
      {img:"film_interrogation_hands_v6.jpg",ambient:"interrogation",caption:"原供述中，他对21:45—21:58的时间没有犹豫。",hold:1200}
    ],
    phoneFourSeconds:[
      {img:"portrait_lin_v6.jpg",ambient:"rain",caption:"20:50 / 迟夏书店",hold:1100,motion:"still"},
      {img:"ev_bookshop_msg.jpg",ambient:"rain",speaker:"林夏 · 消息缓存",line:"“他倒下了，还在喘。”",hold:1300},
      {img:"film_bookstore_counter_v6.jpg",ambient:"rain",sfx:"phone",caption:"20:52 / 120呼叫建立",hold:750},
      {img:"film_bookstore_counter_v6.jpg",ambient:"rain",caption:"4秒",hold:1200}
    ],
    propertyAudit:[
      {img:"scene_property_v6.jpg",ambient:"fluorescent",caption:"21:06 / 西河公寓物业值班室",hold:1000,motion:"still"},
      {img:"ev_zhao_log.jpg",ambient:"records",sfx:"printer",caption:"审计记录",hold:1200},
      {img:"film_records_detail.jpg",ambient:"records",speaker:"审计员",line:"没有写入。没有删除。没有改时间。",hold:1300},
      {img:"portrait_zhao_v6.jpg",ambient:"records",speaker:"赵序",line:"我查过门禁，也查过住户卡。系统里留下什么，我比谁都清楚。",hold:1700,motion:"push"}
    ],
    rescueWindow:[
      {img:"scene_forensic_v6.jpg",ambient:"records",sfx:"paper",caption:"法医底稿 · 补充复核",hold:1200,motion:"still"},
      {img:"portrait_sun_v6.jpg",ambient:"records",speaker:"孙岚",line:"法医给的是时间窗口。责任要回到每个人当时做了什么。",hold:1500,motion:"still"},
      {img:"ev_bookshop_msg.jpg",ambient:"records",speaker:"林夏 · 20:50",line:"“他倒下了，还在喘。”",hold:1100},
      {img:"film_bookstore_counter_v6.jpg",ambient:"rain",sfx:"phone",caption:"20:52 / 120 / 4秒",hold:900},
      {img:"film_corridor_door.jpg",ambient:"rain",caption:"21:29 / 陈默进入B座",hold:900}
    ],
    secondConfession:[
      {img:"film_interrogation_v6.jpg",ambient:"interrogation",sfx:"door",caption:"补充讯问 / ROOM 03",hold:1100,motion:"still"},
      {img:"film_interrogation_hands_v6.jpg",ambient:"interrogation",speaker:"韩川",line:"20:50她已经说‘他倒下了’。你21:29才进楼。",hold:1200},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",sfx:"chair",speaker:"陈默",line:"……我到的时候，他已经倒在那里。",hold:1900,motion:"push"},
      {img:"film_interrogation_hands_v6.jpg",ambient:"interrogation",speaker:"韩川",line:"那第一份口供里的细节，从哪来的？",hold:1200},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",speaker:"陈默",line:"有人告诉我，什么细节必须说对。",hold:2100,motion:"still"}
    ],
    ending:[
      {img:"film_review_meeting.jpg",ambient:"records",sfx:"printer",caption:"第17号案件补充复核会议",hold:1000},
      {img:"film_review_meeting.jpg",ambient:"records",sfx:"stamp",stamp:"撤回原移送意见",hold:1100},
      {img:"film_interrogation_v6.jpg",ambient:"interrogation",sfx:"door",caption:"陈默 · 补充讯问",hold:800},
      {img:"film_interrogation_hands_v6.jpg",ambient:"interrogation",speaker:"韩川",line:"陈默。我们重新来。",hold:1000},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",speaker:"陈默",line:"我姐不知道我要来自首。",hold:1500},
      {img:"portrait_lin_v6.jpg",ambient:"records",speaker:"林夏",line:"我拨了120。四秒以后，我挂了。",hold:1500},
      {img:"portrait_zhao_v6.jpg",ambient:"records",speaker:"赵序",line:"记录没被改过。被利用的是你们看记录的方式。",hold:1600},
      {img:"portrait_han_v6.jpg",ambient:"records",speaker:"韩川",line:"那就把原结论撤回来。每一段行为，重新写。",hold:1500},
      {img:"portrait_sun_v6.jpg",ambient:"records",speaker:"孙岚",line:"把行为写清楚，比给一个人贴上结论更重要。",hold:1600,motion:"still"},
      {img:"film_review_meeting.jpg",ambient:"records",caption:"原案的一句“人是我杀的”，被重新拆回四段可以分别证明的行为。",hold:1700,motion:"still"}
    ],
    replayTruth:[
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“桌边那只黄铜书挡。”",caption:"真相标注：来自事后到场所见。",hold:1400},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“他倒在书桌右边。”",caption:"真相标注：来自事后现场。",hold:1400},
      {img:"film_chen_close_v6.jpg",ambient:"interrogation",speaker:"陈默 · 第一次讯问",line:"“放回第二层抽屉。”",caption:"真相标注：转述在这里第一次出现偏差。",hold:1700}
    ]
  },
  hints:{
    transfer:["先按普通移送流程核对三类材料：讯问、现场、凶器。","讯问里至少听完“为什么来”和“凶器是什么”；现场至少检查书桌与倒地位置。","读完E01与E02后，回案卷室提交移送核验。"],
    drawer:["这一步只核对物证采集位置，不需要推测谁在撒谎。","把第一次供述里关于抽屉层数的原句和E03放在一起看。","供述写‘第二层’，现场定位写‘第一层’。"],
    records:["先逐条回答：这个系统本身到底记录了什么对象。暂时不要把六条合并。","例如门禁原件里记录的是卡号，支付原件里记录的是账户与设备。只有影像里能直接看见人。","六条都标完后，再找最后一条能直接确认邱承面部的记录。"],
    arrival:["在视频室找陈默车辆与消防梯片段，再回讯问室。","比较陈默口供中的到场时间与E15。","E15显示21:29进入B座。"],
    bookstore:["只排列三个时间：消息、120、陈默到场。","先看E16和E12，再对照E15。","20:50消息 → 20:52急救电话 → 21:29陈默到场。"],
    property:["只看E14里真正出现过的英文操作，不先推测赵序的目的。","逐行找 LOGIN / QUERY / WRITE / DELETE / TIME_EDIT 是否实际出现。","只勾选LOGIN与QUERY。"],
    forensic:["先找到一条能确认20:50仍有自主呼吸的材料，再与21:29陈默到场对照。","E16说明20:50仍在喘；E15说明陈默21:29才进楼；E17说明伤后存在救助窗口。","选择E16作为自主呼吸依据；陈默不可能参与20:50前冲突；伤害与救助可以分开评价。"],
    final:["终局不是找一个‘凶手’，而是给四段行为分别归属。","初始伤害、救助中断、事后设计、虚假自首分别找人和材料。","初始伤害=林夏；救助中断=林夏/赵序；事后设计=赵序；虚假自首=陈默。"]
  }
};