window.CASE_DATA = {
  version: 3,
  title: '第二份口供',
  chapters: ['移送核验','补充勘查','电子记录复核','人员与设备','伤后处置','第二份口供','责任复核','结案'],
  people: [
    {id:'chen',name:'陈默',file:'R-01',role:'主动投案者 / 林夏弟弟',stage:0,scene:'scene_interrogation.jpg',bio:'28岁，网约车司机。案发后第三天主动到案，提交完整书面供述。',known:['与林夏关系密切','有一次打架行政处罚记录'],statement:'“人是我杀的。该说的我都说。”',later:'他真正害怕的并不是刑罚，而是姐姐继续被追问。'},
    {id:'lin',name:'林夏',file:'R-02',role:'街角书店经营者',stage:3,scene:'scene_bookstore.jpg',bio:'34岁。与邱承存在长期债务纠纷及骚扰记录。',known:['案发当晚仍在经营书店','20:50发送过一条未纳入原案摘要的消息'],statement:'“我和他吵过很多次，但那晚我没有去找他。”',later:'她一直把“没有当场死亡”理解成“事情还有机会被遮过去”。'},
    {id:'zhao',name:'赵序',file:'R-03',role:'物业设备运维工程师',stage:4,scene:'scene_records.jpg',bio:'40岁。负责西河公寓门禁、水表与设备终端日常维护。',known:['与林家相识多年','21:06使用本人账号登录物业终端'],statement:'“系统记录不会因为我认识谁就改变。”',later:'他没有篡改系统；他利用的是系统只记录“发生了什么”，并不总记录“是谁做的”。'},
    {id:'qiu',name:'邱承',file:'R-04',role:'死者 / 私人债务中介',stage:2,scene:'scene_apartment.jpg',bio:'38岁。长期处理私人债务，曾因暴力催收被投诉。',known:['案发当天多次联系林夏','20:36有最后一段面部清晰的视频记录'],statement:'——',later:'围绕他的记录很多，但“记录属于他”和“本人当时出现”并不是同一句话。'},
    {id:'feng',name:'冯越',file:'R-05',role:'西河公寓夜班保安',stage:3,scene:'scene_corridor.jpg',bio:'52岁。负责B座夜间巡查。',known:['最初笔录只记了一名晚间来访男性','补充复核时承认当晚记忆并不完整'],statement:'“我记人靠脸，不记卡号。”',later:'他不是关键证人，但他的迟疑迫使复核组重新区分“人”和“凭证”。'},
    {id:'zhong',name:'钟嘉',file:'R-06',role:'快递员',stage:3,scene:'scene_corridor.jpg',bio:'25岁。21:30后在公寓快递柜附近补柜。',known:['听到7-14柜门开启','没有正面看清开柜人'],statement:'“有人取件，我只听见柜门响。”',later:'这是一条真实记录，但从一开始就没有提供身份信息。'},
    {id:'sun',name:'孙岚',file:'R-07',role:'行为分析顾问',stage:0,scene:'scene_interrogation.jpg',bio:'36岁。参与补充讯问观察。',known:['只记录停顿、视线、动作','拒绝把行为直接标记成“说谎”'],statement:'“我只能告诉你他停了多久，不能替你决定那意味着什么。”',later:'她在复核中一直提醒韩川：心理观察只能辅助证据，不能替代事实。'},
    {id:'han',name:'韩川',file:'R-08',role:'原案主办侦查员',stage:1,scene:'scene_records.jpg',bio:'45岁。负责原案侦查与移送材料整理。',known:['接受陈默主动投案','将多条电子记录纳入原时间线'],statement:'“如果每条记录都是真的，为什么还要把整案推倒重来？”',later:'重新签字不是承认自己“愚蠢”，而是承认原案把不同证据的证明力写成了同一个等级。'}
  ],
  interrogation: [
    {id:'why',speaker:'韩川 / 陈默',q:'为什么主动投案？',a:'韩川：“为什么现在来？”\n陈默：“人是我杀的。继续查下去也没有意义。”',behaviour:'陈默回答前停顿约2秒；声音稳定。',mark:'I01',stage:0},
    {id:'weapon',speaker:'韩川 / 陈默',q:'凶器是什么？',a:'韩川：“你用的什么？”\n陈默：“桌边那只黄铜书挡。我拿起来砸了一下。”',behaviour:'回答连贯，没有反问。',mark:'I02',stage:0},
    {id:'body',speaker:'韩川 / 陈默',q:'邱承倒在哪里？',a:'陈默：“书桌右边，肩膀靠着桌脚。我确认过他没动。”',behaviour:'描述空间位置时语速稍慢。',mark:'I03',stage:0},
    {id:'time',speaker:'韩川 / 陈默',q:'你什么时候到、什么时候走？',a:'陈默：“21点45分左右到，差不多21点58分走。”',behaviour:'时间回答没有查看任何材料。',mark:'I04',stage:0},
    {id:'drawer',speaker:'韩川 / 陈默',q:'之后怎么处理书挡？',a:'陈默：“擦过以后，放回书桌左边第二层抽屉。”',behaviour:'“第二层”说得很明确。',mark:'I05',stage:1},
    {id:'payment',speaker:'复核讯问',q:'21:18那笔支付是谁操作的？',a:'陈默：“我不知道。那天我没碰过他的手机。”',behaviour:'回答后看向桌面约4秒。',mark:'I06',stage:3},
    {id:'arrival',speaker:'复核讯问',q:'你第一次进入西河公寓是什么时候？',a:'陈默：“我记得很晚。车库记录应该比我记得准。”',behaviour:'主动建议核查客观记录。',mark:'I07',stage:4},
    {id:'source',speaker:'复核讯问',q:'你为什么能说出那么多现场细节？',a:'陈默：“有些是我后来看到的。有些……是他们让我记住的。”',behaviour:'说到“他们”时出现本段最长停顿。',mark:'I08',stage:6}
  ],
  evidence: [
    ['E01','陈默第一次供述','ev_confession.jpg','confession','讯问材料'],
    ['E02','黄铜书挡','obj_brass.jpg','brass','实物'],
    ['E03','现场定位照片','ev_drawer.jpg','drawer','现场材料'],
    ['E04','邱承手机','obj_phone.jpg','phone','实物'],
    ['E05','21:18移动支付流水','ev_payment.jpg','payment','电子记录'],
    ['E06','Q-4702住户门卡','obj_card.jpg','card','实物'],
    ['E07','21:24门禁记录','ev_access.jpg','access','电子记录'],
    ['E08','21:31智能水表曲线','ev_water.jpg','water','电子记录'],
    ['E09','21:38快递柜开箱记录','ev_parcel.jpg','parcel','电子记录'],
    ['E10','21:52网约车订单','ev_taxi.jpg','taxi','电子记录'],
    ['E11','20:36电梯视频截帧','ev_cctv.jpg','cctv','影像记录'],
    ['E12','20:52急救号码缓存','ev_call.jpg','call','通信记录'],
    ['E13','鞋底与雨水检验','ev_shoe.jpg','shoe','检验材料'],
    ['E14','赵序设备访问日志','ev_zhao_log.jpg','zhaolog','系统日志'],
    ['E15','陈默到场记录','ev_chen_arrival.jpg','arrival','影像/车场记录'],
    ['E16','林夏消息缓存','ev_bookshop_msg.jpg','message','通信记录'],
    ['E17','法医初检底稿','ev_autopsy.jpg','autopsy','法医材料'],
    ['E18','11秒环境录音索引','ev_voice_note.jpg','voice','音频材料']
  ],
  evidenceMeta: {
    confession:['讯问笔录','讯问室03','记录陈默本人陈述；真实性需与其他材料核对。'],
    brass:['现场提取实物','4-702','黄铜书挡表面发现擦拭痕迹及血迹。'],
    drawer:['现场定位照','4-702','物证标签记录提取位置为书桌左侧第一层。'],
    phone:['现场提取实物','4-702','设备归属邱承；设备可以被他人操作。'],
    payment:['平台账单','支付平台','21:18发生16元支付；记录账户与终端，不含人脸验证。'],
    card:['现场关联物','住户系统','Q-4702对应住户卡，可由持卡人刷门禁。'],
    access:['物业门禁日志','西河公寓','21:24 Q-4702卡通过B座门禁。'],
    water:['物业水表日志','4-702','21:31出现18.6L用水峰值。'],
    parcel:['快递柜后台','B座大厅','21:38 7-14柜使用取件码开启。'],
    taxi:['平台订单','网约车平台','21:52邱承账户发起订单；司机无法确认乘车人。'],
    cctv:['电梯视频','B座电梯','20:36画面可清晰辨认邱承面部。'],
    call:['运营商缓存','通信系统','20:52向120发起4秒呼叫，未形成完整通话。'],
    shoe:['检验记录','法医物证室','陈默鞋底雨水与21:20后降雨相符。'],
    zhaolog:['物业后台审计','设备终端','21:06起出现查询、导出操作；未发现写入/修改指令。'],
    arrival:['车库与消防梯','西河公寓','21:27陈默车辆入库，21:29本人进入B座。'],
    message:['手机缓存','林夏手机','20:50发送：“他倒下了，还在喘。”'],
    autopsy:['法医底稿','法医中心','头部损伤后仍存在可救治时间窗；死亡不是击打瞬间完成。'],
    voice:['自动缓存','赵序手机','11秒环境录音；有同步文字转写。']
  },
  sceneHotspots: [
    {id:'brass',name:'书桌边缘',x:45,y:55,w:20,h:19,stage:0,img:'obj_brass.jpg',text:'桌边采集到黄铜书挡；物证编号E02。'},
    {id:'body',name:'书桌右侧地面',x:23,y:62,w:25,h:22,stage:0,img:'scene_apartment.jpg',text:'原始勘验图标注倒地位置在书桌右侧。'},
    {id:'clock',name:'窗边电子钟',x:55,y:34,w:18,h:16,stage:0,img:'scene_apartment.jpg',text:'电子钟在现场拍摄时显示22:31；只用于确认勘验拍摄时间。'},
    {id:'drawer',name:'书桌左侧抽屉',x:56,y:56,w:18,h:18,stage:1,img:'ev_drawer.jpg',text:'打开补勘定位图：物证标签写“左侧第一层”。'},
    {id:'phone',name:'桌边手机',x:37,y:58,w:13,h:15,stage:2,img:'obj_phone.jpg',text:'邱承手机位于桌边，屏幕无明显损坏。'},
    {id:'door',name:'入户门',x:79,y:38,w:15,h:37,stage:2,img:'scene_corridor.jpg',text:'门锁无破坏；门禁只记录住户卡通过。'}
  ],
  records: [
    {id:'cctv',time:'20:36',title:'电梯视频',source:'画面',correct:'person',stage:2},
    {id:'payment',time:'21:18',title:'移动支付',source:'账户/设备',correct:'token',stage:2},
    {id:'access',time:'21:24',title:'住户卡门禁',source:'卡片',correct:'token',stage:2},
    {id:'water',time:'21:31',title:'4-702用水',source:'水表',correct:'environment',stage:3},
    {id:'parcel',time:'21:38',title:'快递柜开箱',source:'取件码',correct:'token',stage:3},
    {id:'taxi',time:'21:52',title:'网约车订单',source:'账户',correct:'token',stage:3}
  ],
  puzzles: [
    {id:'P01',stage:0,type:'intake',label:'移送核验表 A',fact:'供述中的凶器和倒地位置与原始现场材料能够对应。'},
    {id:'P02',stage:1,type:'compare',label:'补充勘查 07',fact:'供述写“第二层”，现场定位图写“第一层”。两份原始记录不能同时描述同一放置位置。'},
    {id:'P03',stage:2,type:'classify',record:'cctv',label:'记录复核 20:36',fact:'20:36电梯画面可以直接确认邱承本人。'},
    {id:'P04',stage:2,type:'classify',record:'payment',label:'记录复核 21:18',fact:'21:18支付记录确认账户和设备活动，不包含本人识别。'},
    {id:'P05',stage:2,type:'classify',record:'access',label:'记录复核 21:24',fact:'门禁记录确认Q-4702门卡通过，不确认持卡人身份。'},
    {id:'P06',stage:3,type:'doubleClassify',records:['water','parcel'],label:'记录复核 21:31—21:38',fact:'水表记录室内活动；快递柜记录取件码活动，两者都没有直接确认邱承本人。'},
    {id:'P07',stage:3,type:'classify',record:'taxi',label:'记录复核 21:52',fact:'网约车订单属于邱承账户，但司机未能确认实际乘车人。'},
    {id:'P08',stage:3,type:'synthesis',label:'电子记录批次结论',fact:'20:36之后仍有多条真实活动记录，但没有一条再次直接确认邱承本人。'},
    {id:'P09',stage:4,type:'audit',label:'物业终端审计',fact:'赵序的终端日志只有查询和导出，没有写入或修改系统记录。'},
    {id:'P10',stage:4,type:'arrival',label:'到场时间核验',fact:'21:27陈默车辆进入车库，21:29本人进入B座。'},
    {id:'P11',stage:5,type:'order',label:'通信与到场顺序',fact:'林夏20:50已经发出“他倒下了，还在喘”，早于陈默21:27到达公寓。'},
    {id:'P12',stage:5,type:'rescue',label:'伤后处置时间带',fact:'20:52曾拨打120但4秒后中断；法医底稿显示当时仍处于可救治窗口。'},
    {id:'P13',stage:6,type:'knowledge',label:'供述细节来源复核',fact:'陈默到场在事件发生之后；他的现场知识由事后所见与他人转述共同构成。'},
    {id:'P14',stage:6,type:'responsibility',label:'行为链整理',fact:'初始伤害、救助中断、事后时间线设计与虚假自首是四个不同事实。'}
  ],
  hints: {
    P01:['先完成第一次讯问中的“凶器”和“倒地位置”片段，再检查4-702对应位置。','把讯问里的两个现场细节分别与原始现场材料对照。','播放“凶器是什么”“邱承倒在哪里”，并检查现场的书桌边缘和书桌右侧地面。'],
    P02:['不要找新的理论，只把刚开放的补勘照片和原讯问原句并排看。','注意两份材料都出现了“第几层”。','讯问说第二层，定位照片写第一层。'],
    P03:['这一步只判断这条记录本身能确认到什么层级。','“画面里能看到脸”与“账户在活动”属于不同证明层级。','20:36电梯画面应标记为“本人可确认”。'],
    P04:['先看记录里有没有身份识别步骤。','支付流水能确认账户和终端，但页面没有人脸或实名操作人。','选择“账户/凭证活动”。'],
    P05:['门禁系统识别的是哪一种载体？','把门卡实物和门禁日志一起看。','选择“账户/凭证活动”。'],
    P06:['两条记录都是真的，但它们记录的对象不同。','水表记录房间用水；快递柜记录取件码。','水表标“环境活动”，快递柜标“账户/凭证活动”。'],
    P07:['司机没有确认乘车人。','订单账户属于邱承，不等于下单或乘车的人就是邱承。','选择“账户/凭证活动”。'],
    P08:['把已经分类过的六条记录按“是否能确认脸”重新看一遍。','注意20:36之后还有没有“本人可确认”。','选择“20:36后仍有真实活动，但没有再次直接确认本人”。'],
    P09:['不要根据赵序职业猜。看日志里实际执行了什么操作。','QUERY/EXPORT与WRITE/UPDATE不是一回事。','选择“没有写入或修改”。'],
    P10:['找能直接把陈默本人放进公寓范围的最早记录。','先看车库，再看消防梯。','21:27车库记录是最早可确认到场。'],
    P11:['只比较两个时间，不需要推测动机。','20:50消息和21:27到场谁更早？','林夏的消息早于陈默到场。'],
    P12:['把“还在喘”“拨120”“法医可救治窗口”放在同一条时间带。','异常点在救助是否真正建立。','标记20:52的4秒急救呼叫。'],
    P13:['分别问：陈默亲眼见过什么？哪些细节可能只能来自别人？','尸体位置可事后看见；抽屉“第二层”更像准备好的口供脚本。','把尸体位置归为“事后现场”，凶器与抽屉细节归为“转述/准备”。'],
    P14:['不要把所有行为压成“共同杀人”。先按发生顺序分四段。','20:48附近初伤、20:52救助中断、21:06后记录设计、第三天主动投案。','初伤=林夏；救助中断=林夏/赵序决策；时间线设计=赵序；虚假自首=陈默。']
  },
  theatre: {
    prologue:[
      {img:'shot_interrogation_wide.jpg',scene:'ROOM 03 / CAM A',time:'21:14:08',speaker:'韩川',line:'姓名。'},
      {img:'shot_interrogation_table.jpg',scene:'ROOM 03 / CAM B',time:'21:14:14',speaker:'陈默',line:'陈默。人是我杀的。'},
      {img:'shot_interrogation_left.jpg',scene:'ROOM 03 / CAM C',time:'21:15:02',speaker:'韩川',line:'凶器？'},
      {img:'shot_interrogation_table.jpg',scene:'ROOM 03 / CAM B',time:'21:15:05',speaker:'陈默',line:'桌边那只黄铜书挡。'},
      {img:'shot_apartment_wide.jpg',scene:'4-702 / SCENE PHOTO',time:'23:02:17',speaker:'',line:''}
    ],
    intakePass:[
      {img:'shot_records_detail.jpg',scene:'TRANSFER DESK',time:'09:42:10',speaker:'移送核验表',line:'凶器记录：对应。'},
      {img:'shot_apartment_desk.jpg',scene:'4-702 / SCENE PHOTO',time:'23:02:17',speaker:'移送核验表',line:'倒地位置：对应。'},
      {img:'shot_records_wide.jpg',scene:'TRANSFER DESK',time:'09:43:02',speaker:'韩川',line:'把最后一页现场定位也核一下。'}
    ],
    drawer:[
      {img:'ev_confession.jpg',scene:'INTERROGATION TRANSCRIPT',time:'21:18:41',speaker:'陈默',line:'“擦过以后，放回书桌左边第二层抽屉。”'},
      {img:'ev_drawer.jpg',scene:'SCENE LOCATION PHOTO',time:'23:06:12',speaker:'物证标签',line:'“提取位置：书桌左侧第一层。”'},
      {img:'shot_records_detail.jpg',scene:'TRANSFER DESK',time:'09:47:28',speaker:'韩川',line:'……先别送。把原讯问调回来。'}
    ],
    lastSeen:[
      {img:'ev_cctv.jpg',scene:'B座电梯',time:'20:36:11',speaker:'',line:''},
      {img:'ev_payment.jpg',scene:'平台流水',time:'21:18:03',speaker:'',line:''},
      {img:'ev_access.jpg',scene:'物业门禁',time:'21:24:17',speaker:'',line:''},
      {img:'ev_taxi.jpg',scene:'平台订单',time:'21:52:09',speaker:'',line:''}
    ],
    audit:[
      {img:'shot_records_wide.jpg',scene:'物业设备终端',time:'21:06:14',speaker:'系统审计',line:'LOGIN / zhao_xu'},
      {img:'shot_records_detail.jpg',scene:'物业设备终端',time:'21:07:02',speaker:'系统审计',line:'QUERY / ACCESS_LOG'},
      {img:'shot_records_detail.jpg',scene:'物业设备终端',time:'21:08:31',speaker:'系统审计',line:'QUERY / WATER_METER'}
    ],
    rescue:[
      {img:'ev_bookshop_msg.jpg',scene:'手机缓存',time:'20:50:12',speaker:'林夏',line:'他倒下了，还在喘。'},
      {img:'ev_call.jpg',scene:'通信缓存',time:'20:52:03',speaker:'系统',line:'120 / 00:00:04'},
      {img:'shot_bookstore_counter.jpg',scene:'林夏书店',time:'20:52:07',speaker:'',line:''}
    ],
    second:[
      {img:'shot_interrogation_wide.jpg',scene:'ROOM 03 / 补充讯问',time:'16:08:22',speaker:'复核员',line:'你21:27才到西河公寓。'},
      {img:'shot_interrogation_table.jpg',scene:'ROOM 03 / 补充讯问',time:'16:08:35',speaker:'陈默',line:'……我知道。'},
      {img:'shot_interrogation_left.jpg',scene:'ROOM 03 / 补充讯问',time:'16:09:01',speaker:'陈默',line:'有些是后来看到的。有些，是他们让我记住的。'}
    ],
    ending:[
      {img:'shot_records_wide.jpg',scene:'CASE 17 / REVIEW MEETING',time:'18:42:11',speaker:'复核结论',line:'原“陈默故意杀人”移送意见撤回。'},
      {img:'shot_interrogation_wide.jpg',scene:'ROOM 03 / SUPPLEMENT',time:'19:10:04',speaker:'陈默',line:'我以为只要我认了，事情就会停在我这里。'},
      {img:'shot_bookstore_wide.jpg',scene:'SUPPLEMENT STATEMENT',time:'19:37:26',speaker:'林夏',line:'我当时拨了120。然后我把电话挂了。'},
      {img:'shot_records_detail.jpg',scene:'PROPERTY TERMINAL',time:'20:11:48',speaker:'赵序',line:'记录没有改过。我只是知道它们会被怎样理解。'}
    ]
  },
  final: {
    roles:[
      {id:'initial',label:'初始伤害',people:['林夏','陈默','赵序'],correct:'林夏',need:['brass','message']},
      {id:'rescue',label:'救助中断',people:['林夏 / 赵序','陈默','韩川'],correct:'林夏 / 赵序',need:['call','autopsy']},
      {id:'timeline',label:'事后时间线设计',people:['赵序','陈默','韩川'],correct:'赵序',need:['zhaolog','access']},
      {id:'confession',label:'虚假自首',people:['陈默','林夏','赵序'],correct:'陈默',need:['confession','arrival']}
    ],
    models:['陈默单独故意杀人','三人共同预谋杀人','初始冲突、救助中断、事后掩饰与虚假自首分别认定'],
    correctModel:'初始冲突、救助中断、事后掩饰与虚假自首分别认定'
  },
  endings: {
    standard:{title:'复核结论',text:'第17号案件撤回原移送意见，重新区分初始伤害、救助中断、事后掩饰与虚假自首。陈默的主动投案不再被作为最初犯罪行为的直接证明。'},
    complete:{title:'完整卷宗 · 第二份口供',text:'E18环境录音被纳入补充卷。复核组能够进一步还原120呼叫中断前后的决策过程，责任链从“推测”转为有同步记录支撑。'},
    independent:{title:'独立复核完成',text:'你在减少程序指引的情况下重新完成案件。卷宗真相没有改变，但材料顺序与判断过程不再由系统替你安排。'}
  }
};
