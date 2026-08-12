/* ============================================================
   足球本命主队测试 v2.0 — 核心脚本
   架构：特质向量匹配（6维 × ~90俱乐部 × 36题库）
   纯前端 · 无后端 · 无数据库 · 零外部依赖
   ============================================================ */

// ==================== DOM 缓存 ====================
const $ = (sel) => document.querySelector(sel);
const pageStart  = $('#page-start');
const pageQuiz   = $('#page-quiz');
const pageResult = $('#page-result');
const btnStart   = $('#btn-start');
const btnResume  = $('#btn-resume');
const resumeProgress = $('#resume-progress');
const btnBack    = $('#btn-back');
const currentNum = $('#current-num');
const totalNumEl = $('#total-num');
const progressBar = $('#progress-bar');
const categoryTag = $('#category-tag');
const questionText = $('#question-text');
const questionCard = $('#question-card');
const optionsList  = $('#options-list');
const matchPercent  = $('#match-percent');
const clubColorStrip = $('#club-color-strip');
const clubName      = $('#club-name');
const clubIntro     = $('#club-intro');
const reasonsList   = $('#reasons-list');
const radarCanvas   = $('#radar-chart');
const alsoLikeList  = $('#also-like-list');
const alsoLikeSection = $('#also-like-section');
const btnRetry  = $('#btn-retry');
const btnPrev   = $('#btn-prev');
const modalOverlay = $('#modal-overlay');
const modalMessage = $('#modal-message');
const modalCancel  = $('#modal-cancel');
const modalConfirm = $('#modal-confirm');

// ==================== 6维特质定义 ====================
const DIM_LABELS = ['荣誉底蕴','精神气质','家乡归属','青训文化','球迷文化','战术风格'];
// 维度含义（0→5 方向）：
// 荣誉底蕴: 0=新兴力量/不看重历史 → 5=辉煌历史与冠军传统
// 精神气质: 0=冷静理性务实 → 5=热血激情斗志昂扬
// 家乡归属: 0=国际化/全球化视野 → 5=本土扎根/地方认同
// 青训文化: 0=更看重引援即战力 → 5=重视青训长期培养
// 球迷文化: 0=温和个人化观赛 → 5=狂热死忠/社群氛围
// 战术风格: 0=务实防守反击 → 5=传控进攻美学

// ==================== 俱乐部数据库（~90队） ====================
// key, name, emoji, intro, reasons[3], tags[3], vector[6]
const CLUBS = [

  // ======== 英超（20队） ========
  { key:'arsenal', name:'阿森纳', emoji:'🎭', league:'英超',
    intro:'枪手的美丽足球信仰，温格留给世界的遗产。哪怕没有冠军，也要漂亮地赢——你是理想主义的坚持者。',
    reasons:['美丽足球信徒','理想主义坚守','欣赏过程之美'],
    tags:['美丽足球','青春风暴','温格遗产'],
    vector:[2,3,2,5,3,4] },
  { key:'aston_villa', name:'阿斯顿维拉', emoji:'🦁', league:'英超',
    intro:'1982年欧洲冠军的荣耀仍在血脉中流淌。伯明翰的工业心脏，埃梅里治下正在复兴——你相信沉睡的巨人终将醒来。',
    reasons:['珍视历史传承','相信复兴叙事','工业城市情怀'],
    tags:['欧战荣耀','伯明翰骄傲','老牌劲旅'],
    vector:[3,3,2,2,3,2] },
  { key:'bournemouth', name:'伯恩茅斯', emoji:'🍒', league:'英超',
    intro:'从英甲到欧战的逆袭童话。樱桃军团用高位压迫告诉世界——小俱乐部也能有大梦想。',
    reasons:['小城逆袭信徒','欣赏高压节奏','相信草根奇迹'],
    tags:['高位压迫','小俱乐部奇迹','红牛基因'],
    vector:[1,2,2,2,2,2] },
  { key:'brentford', name:'布伦特福德', emoji:'🐝', league:'英超',
    intro:'数据驱动的智慧足球。不靠砸钱，靠数学模型和定位球——你是理性的反叛者。',
    reasons:['数据信徒','欣赏智慧足球','反传统审美'],
    tags:['数据驱动','定位球专家','小而精'],
    vector:[1,2,2,2,2,4] },
  { key:'brighton', name:'布莱顿', emoji:'🕊️', league:'英超',
    intro:'南海岸的天才工厂。卖球星从不降级，越卖越强——你相信体系永远大于个人。',
    reasons:['体系信仰者','欣赏聪明运营','不爱跟风豪门'],
    tags:['天才工厂','南海岸美学','运营典范'],
    vector:[1,2,2,3,2,3] },
  { key:'chelsea', name:'切尔西', emoji:'🦁', league:'英超',
    intro:'铁血蓝军的灵魂从未消散。阿布时代的烙印、穆里尼奥的狂人精神、阿隆索的革命——你是戏剧性的化身。',
    reasons:['享受豪门叙事','喜欢戏剧性转折','相信烧钱终将兑现'],
    tags:['铁血蓝军','阿隆索革命','烧钱豪门'],
    vector:[3,3,2,2,3,3] },
  { key:'coventry', name:'考文垂', emoji:'🔷', league:'英超',
    intro:'25年后重返英超。兰帕德带队以英冠冠军身份回归——你相信浪子回头金不换。',
    reasons:['浪子回头叙事','欣赏重建故事','兰帕德情结'],
    tags:['25年回归','兰帕德救赎','天蓝军团'],
    vector:[1,3,2,2,2,1] },
  { key:'crystal_palace', name:'水晶宫', emoji:'🦅', league:'英超',
    intro:'南伦敦的鹰。塞尔赫斯特公园的死忠看台是英超最喧闹的角落——你不以冠军论英雄。',
    reasons:['热爱草根氛围','欣赏硬朗足球','纯粹球迷精神'],
    tags:['杯赛之王','南伦敦硬汉','死忠看台'],
    vector:[1,3,2,2,4,2] },
  { key:'everton', name:'埃弗顿', emoji:'🍬', league:'英超',
    intro:'太妃糖是英格兰足球的活化石。古迪逊公园即将告别，工人阶级的魂永远不散。',
    reasons:['工人阶级认同','珍视历史传承','刚毅坚守者'],
    tags:['古迪逊绝唱','莫耶斯回归','太妃糖韧劲'],
    vector:[2,3,2,2,4,2] },
  { key:'fulham', name:'富勒姆', emoji:'⚪', league:'英超',
    intro:'泰晤士河畔的优雅。克拉文农场是伦敦最有情调的球场——你喜欢足球里的中产阶级情调。',
    reasons:['欣赏优雅传控','泰晤士河畔情调','中产审美'],
    tags:['传控实验','河畔球场','伦敦情调'],
    vector:[1,2,2,2,2,2] },
  { key:'hull_city', name:'赫尔城', emoji:'🐯', league:'英超',
    intro:'老虎军团，附加赛奇迹晋级。被所有人看轻正是你的动力——你是斗士型人格。',
    reasons:['弱者逆袭剧本','高效务实哲学','不被看好的斗士'],
    tags:['奇迹升超','防反尖刀','老虎精神'],
    vector:[1,2,2,2,2,1] },
  { key:'ipswich', name:'伊普斯维奇', emoji:'🚜', league:'英超',
    intro:'拖拉机男孩回来了。博比·罗布森爵士的传奇是小城的永恒骄傲——你偏爱质朴真实的足球。',
    reasons:['小镇逆袭情感','尊重草根教练','质朴真实足球'],
    tags:['拖拉机男孩','罗布森传奇','东盎格利亚'],
    vector:[1,3,2,2,3,1] },
  { key:'leeds', name:'利兹联', emoji:'⚪', league:'英超',
    intro:'埃兰路的狂热是英格兰最滚烫的看台。贝尔萨的疯狂、法尔克的革命——你把足球当信仰。',
    reasons:['情感浓烈狂热','享受大起大落','足球即信仰'],
    tags:['埃兰路狂热','贝尔萨遗产','玫瑰德比'],
    vector:[2,4,2,2,4,1] },
  { key:'liverpool', name:'利物浦', emoji:'🎸', league:'英超',
    intro:'永不独行的红军。KOP看台、重金属足球、逆转基因——你相信激情可以战胜一切。',
    reasons:['相信永不放弃','享受激情澎湃','逆转基因'],
    tags:['永不独行','重金属足球','逆转基因'],
    vector:[3,5,2,2,4,3] },
  { key:'man_city', name:'曼彻斯特城', emoji:'💎', league:'英超',
    intro:'现代足球的精密机器。瓜迪奥拉的遗产、马雷斯卡的传承——你崇尚用正确的方式赢得比赛。',
    reasons:['欣赏战术革新','追求极致效率','现代足球审美'],
    tags:['战术革命','蓝月王朝','现代高效'],
    vector:[4,2,1,3,3,5] },
  { key:'man_utd', name:'曼彻斯特联', emoji:'😈', league:'英超',
    intro:'红魔精神永不灭。老特拉福德的梦剧场，巴斯比宝贝到弗格森王朝——你是信仰型人格。',
    reasons:['红魔精神共鸣','传统豪门情结','永不服输的骄傲'],
    tags:['红魔精神','弗格森王朝','梦剧场'],
    vector:[3,5,2,2,5,2] },
  { key:'newcastle', name:'纽卡斯尔联', emoji:'⚫', league:'英超',
    intro:'泰恩河畔的喜鹊，一座城一支队。沙特资本带来了希望，但球迷的忠诚才是灵魂。',
    reasons:['极端城市忠诚','忍受漫长等待','身份认同感'],
    tags:['泰恩河畔','沙特新贵','单城信仰'],
    vector:[2,3,2,2,5,2] },
  { key:'nottm_forest', name:'诺丁汉森林', emoji:'🌳', league:'英超',
    intro:'欧冠两连冠的神话永远不会褪色。布莱恩·克拉夫的灵魂仍在城市球场飘荡。',
    reasons:['珍视传奇历史','相信伟大可复刻','欧冠神话情结'],
    tags:['欧冠两连冠','克拉夫神话','欧洲传奇'],
    vector:[3,3,2,2,3,2] },
  { key:'sunderland', name:'桑德兰', emoji:'🐱', league:'英超',
    intro:'从《Sunderland Til I Die》的绝望中涅槃。黑猫的忠诚是后工业城市最后的信仰。',
    reasons:['经历过谷底','绝望中的坚守','享受复仇快感'],
    tags:['黑猫奇迹','Netflix叙事','泰恩威尔德比'],
    vector:[2,3,2,2,4,1] },
  { key:'tottenham', name:'托特纳姆热刺', emoji:'🐔', league:'英超',
    intro:'To Dare Is To Do。北伦敦的白百合，反复失望却永远怀抱希望——你是理想主义的终极信徒。',
    reasons:['信奉美学足球','愿意为理想买单','在失望中保持希望'],
    tags:['Spursy悲情','北伦敦德比','传控复兴'],
    vector:[2,3,2,2,3,4] },

  // ======== 西甲（10队） ========
  { key:'real_madrid', name:'皇家马德里', emoji:'👑', league:'西甲',
    intro:'欧冠之王，伯纳乌的白色传奇。巨星闪耀，荣耀等身——你天生属于聚光灯下的舞台中央。',
    reasons:['追求卓越荣耀','天生赢家气质','大场面爱好者'],
    tags:['欧冠之王','巨星政策','逆转基因'],
    vector:[5,2,1,2,4,3] },
  { key:'barcelona', name:'巴塞罗那', emoji:'🎨', league:'西甲',
    intro:'不止是一家俱乐部。tiki-taka的传控美学，拉玛西亚的青训哲学——你相信足球是艺术。',
    reasons:['信奉美丽足球','理想主义情怀','欣赏传控艺术'],
    tags:['传控美学','拉玛西亚','加泰之魂'],
    vector:[4,2,2,5,3,5] },
  { key:'atletico', name:'马德里竞技', emoji:'⚔️', league:'西甲',
    intro:'铁血防守、草根反抗、西蒙尼主义。工人阶级的斗士——你信奉努力与意志能弥补天赋差距。',
    reasons:['硬汉实干派','欣赏铁血防守','虽千万人吾往矣'],
    tags:['铁血防守','西蒙尼主义','工人阶级'],
    vector:[2,5,2,2,2,4] },
  { key:'athletic_bilbao', name:'毕尔巴鄂竞技', emoji:'🦁', league:'西甲',
    intro:'全球独一无二的巴斯克纯血政策。百年坚持只用自己的孩子——你信仰传统与传承的力量。',
    reasons:['传统守护者','看重忠诚与传承','偏爱独树一帜'],
    tags:['巴斯克纯血','百年传统','民族骄傲'],
    vector:[2,3,3,4,3,2] },
  { key:'sevilla', name:'塞维利亚', emoji:'⚪', league:'西甲',
    intro:'欧联杯的永恒之王。皮斯胡安的地狱主场——你相信某个地方你就是不可战胜的。',
    reasons:['享受逆袭剧本','宿命论信仰者','杯赛王者认同'],
    tags:['欧联霸主','安达卢西亚之魂','地狱主场'],
    vector:[3,3,2,2,2,2] },
  { key:'real_sociedad', name:'皇家社会', emoji:'🔵', league:'西甲',
    intro:'巴斯克足球的优雅代表。苏比埃塔青训营的流水线——你欣赏体系之美，反感急功近利。',
    reasons:['欣赏体系之美','注重长期成长','学院派反感急功近利'],
    tags:['青训典范','巴斯克优雅','智慧足球'],
    vector:[2,3,2,3,2,2] },
  { key:'real_betis', name:'皇家贝蒂斯', emoji:'🟢', league:'西甲',
    intro:'绿白军团的享乐主义足球。佩莱格里尼治下的进攻美学——你认为精彩比胜负更重要。',
    reasons:['享乐型乐天派','精彩重于胜负','生活玩家'],
    tags:['艺术足球','塞维利亚另一面','不羁洒脱'],
    vector:[2,3,2,2,3,2] },
  { key:'villarreal', name:'比利亚雷亚尔', emoji:'💛', league:'西甲',
    intro:'5万人的小镇站上欧冠四强。黄色潜水艇是足球童话的现实版本——你相信系统胜于资源。',
    reasons:['欣赏以小博大','精算师型思维','相信系统策略'],
    tags:['小城奇迹','黄色潜水艇','战术智囊'],
    vector:[2,2,2,2,2,3] },
  { key:'valencia', name:'瓦伦西亚', emoji:'🦇', league:'西甲',
    intro:'蝙蝠军团的荣光被林荣福时代蚕食。梅斯塔利亚的怒火——你是怀旧且深情的守望者。',
    reasons:['怀旧情深者','愿意陪伴低谷','讨厌资本蚕食'],
    tags:['蝙蝠军团','荣光不再','球迷怒焰'],
    vector:[2,3,2,3,3,2] },
  { key:'girona', name:'赫罗纳', emoji:'🔴', league:'西甲',
    intro:'数据革命+城市集团打造的新锐力量。半程领跑西甲、锁定欧冠——你拥抱变革与数据。',
    reasons:['新锐颠覆者','拥抱数据变革','享受从零到一'],
    tags:['数据革命','城市集团','升班马神话'],
    vector:[2,2,2,2,2,3] },

  // ======== 德甲（10队） ========
  { key:'bayern', name:'拜仁慕尼黑', emoji:'🦅', league:'德甲',
    intro:'德甲霸主，Mia san mia。安联的秩序之美——你相信严谨是最极致的浪漫。',
    reasons:['德式严谨作风','欣赏稳定统治','秩序偏好者'],
    tags:['德甲霸主','Mia san mia','六冠王'],
    vector:[5,3,2,2,2,3] },
  { key:'dortmund', name:'多特蒙德', emoji:'🐝', league:'德甲',
    intro:'威斯特法伦南看台2.5万人站立呐喊——世界最壮观的球迷墙。青春风暴、造星工厂——你是热血青年。',
    reasons:['热血青年心态','偏爱年轻天才','逆袭浪漫主义'],
    tags:['黄墙之魂','青春风暴','造星工厂'],
    vector:[2,4,2,3,5,3] },
  { key:'leverkusen', name:'勒沃库森', emoji:'💊', league:'德甲',
    intro:'不败夺冠终结拜仁王朝。阿隆索的战术革命——你欣赏完美的设计与执行。',
    reasons:['产品经理型人格','信仰设计与执行','欣赏技术革命'],
    tags:['不败王者','阿隆索革命','战术完美'],
    vector:[3,2,2,2,2,3] },
  { key:'rb_leipzig', name:'RB莱比锡', emoji:'🔴', league:'德甲',
    intro:'红牛体系的火箭升空。七年打进欧冠，打破50+1规则——你不惧争议，信奉效率优先。',
    reasons:['打破规则者','不惧争议','新一代效率优先'],
    tags:['红牛体系','高压机器','商业新贵'],
    vector:[2,3,2,3,2,4] },
  { key:'frankfurt', name:'法兰克福', emoji:'🦅', league:'德甲',
    intro:'欧战之鹰，球迷占领诺坎普的震撼画面永存。你享受关键时刻的爆发力。',
    reasons:['成熟稳重型','收放自如','关键时刻爆发'],
    tags:['欧战之鹰','杯赛专家','球迷即球队'],
    vector:[2,3,2,2,3,3] },
  { key:'gladbach', name:'门兴格拉德巴赫', emoji:'🐴', league:'德甲',
    intro:'小马驹，70年代拜仁唯一的对手。普鲁士公园的深厚传统——你是怀旧派老派球迷。',
    reasons:['怀旧派球迷','珍视历史恩怨','敌人的敌人是朋友'],
    tags:['小马驹','拜仁克星','70年代双雄'],
    vector:[2,3,2,2,3,2] },
  { key:'stuttgart', name:'斯图加特', emoji:'🔴', league:'德甲',
    intro:'奔驰之城的施瓦本复兴。降级重生后杀回欧冠——你懂得欣赏重建的过程。',
    reasons:['经历过低谷','欣赏重建过程','登山者心态'],
    tags:['施瓦本复兴','青训重镇','攻势足球'],
    vector:[2,3,2,3,3,2] },
  { key:'wolfsburg', name:'沃尔夫斯堡', emoji:'🐺', league:'德甲',
    intro:'大众之狼，2009年的德甲冠军童话。企业足球的代表——你喜欢稳定可预期的陪伴感。',
    reasons:['务实主义者','不喜欢戏剧性','享受稳定陪伴'],
    tags:['大众之狼','工业化足球','2009冠军'],
    vector:[2,2,2,2,2,2] },
  { key:'werder_bremen', name:'云达不莱梅', emoji:'💚', league:'德甲',
    intro:'威悉河畔的绿色传奇。雷哈格尔王朝、厄齐尔的摇篮——你是传统主义守旧派。',
    reasons:['传统主义者','欣赏深情坚守','无论级别都追随'],
    tags:['绿色传奇','北方之星','技术流拥趸'],
    vector:[2,3,2,2,3,2] },
  { key:'freiburg', name:'弗赖堡', emoji:'🌲', league:'德甲',
    intro:'黑森林模范生。施特赖希12年打造的"人比足球更重要"文化——你看重价值观甚于成绩。',
    reasons:['温和长期主义者','价值观优先','相信好人好报'],
    tags:['黑森林模范生','施特赖希传奇','可持续典范'],
    vector:[1,2,2,3,2,2] },

  // ======== 意甲（8队） ========
  { key:'juventus', name:'尤文图斯', emoji:'🏯', league:'意甲',
    intro:'老妇人的沉稳优雅。电话门降级后涅槃——实用主义的终极信仰者。',
    reasons:['目标感极强','不在乎外界评价','愿为结果隐忍'],
    tags:['务实主义','老钱风骨','电话门涅槃'],
    vector:[4,3,2,2,2,4] },
  { key:'ac_milan', name:'AC米兰', emoji:'🏛️', league:'意甲',
    intro:'红黑荣光，圣西罗的文艺复兴。马尔蒂尼三代传承、7次欧冠——你内心住着古典主义者。',
    reasons:['有品位的审美','重视传承','追求完美浪漫'],
    tags:['欧战贵族','文艺复兴','七冠荣光'],
    vector:[4,3,2,2,3,3] },
  { key:'inter_milan', name:'国际米兰', emoji:'🔵', league:'意甲',
    intro:'蓝黑热血，2010年穆里尼奥的三冠王神话。与AC米兰的阶级对立是永恒的DNA。',
    reasons:['重情重义','不服输','享受以弱胜强'],
    tags:['国际主义','蓝黑热血','三冠王逆袭'],
    vector:[3,4,2,2,3,3] },
  { key:'napoli', name:'那不勒斯', emoji:'🌋', league:'意甲',
    intro:'马拉多纳之城，南方反叛的火山。整座城市的呼吸与足球同步——你把信仰活成生活方式。',
    reasons:['情感浓烈','蔑视权威','信仰即生活'],
    tags:['马拉多纳之城','南方反叛','火山激情'],
    vector:[2,3,2,2,4,3] },
  { key:'roma', name:'罗马', emoji:'🐺', league:'意甲',
    intro:'永恒之城的狼性精神。托蒂25年一人一城——你是长情浪漫的理想主义者。',
    reasons:['长情浪漫','愿意承受失望','相信永恒'],
    tags:['永恒之城','托蒂即罗马','狼性精神'],
    vector:[3,3,2,2,4,2] },
  { key:'atalanta', name:'亚特兰大', emoji:'⚡', league:'意甲',
    intro:'贝尔加莫小城的逆袭童话。加斯佩里尼的全攻全守——你喜欢黑马叙事，信奉体系大于球星。',
    reasons:['喜欢黑马叙事','信奉体系大于球星','欣赏工业效率'],
    tags:['小城奇迹','进攻狂潮','青训工厂'],
    vector:[2,4,2,2,2,4] },
  { key:'lazio', name:'拉齐奥', emoji:'🦅', league:'意甲',
    intro:'鹰旗飘扬，罗马城的另一面。鹰旗仪式是意甲最具视觉冲击的画面——你不屑主流认同。',
    reasons:['不屑主流认同','强烈团体归属感','刚硬不妥协'],
    tags:['鹰旗飘扬','极端铁血','低调硬核'],
    vector:[2,3,2,2,4,2] },
  { key:'fiorentina', name:'佛罗伦萨', emoji:'🟣', league:'意甲',
    intro:'紫百合，文艺复兴的摇篮。巴蒂斯图塔的战神之魂——你是重视过程多于结果的审美主义者。',
    reasons:['文艺气质','重视过程多于结果','复古审美情怀'],
    tags:['紫百合','文艺复兴摇篮','巴蒂之魂'],
    vector:[2,2,2,2,3,2] },

  // ======== 法甲（5队） ========
  { key:'psg', name:'巴黎圣日耳曼', emoji:'🗼', league:'法甲',
    intro:'浪漫之都的足球野心。姆巴佩、梅西、内马尔的巨星时代——你热爱足球的璀璨星光。',
    reasons:['热爱璀璨星光','时尚潮流嗅觉','浪漫主义气质'],
    tags:['资本帝国','巨星陈列室','巴黎时尚'],
    vector:[5,1,1,2,3,3] },
  { key:'marseille', name:'马赛', emoji:'🔥', league:'法甲',
    intro:'地中海的叛逆者，法国唯一的欧冠冠军。维洛德罗姆是飓风之眼——你有草莽英雄情结。',
    reasons:['反精英主义','重情重义','草莽英雄情结'],
    tags:['工人阶级骄傲','法甲唯一欧冠','烈火激情'],
    vector:[2,3,2,2,4,2] },
  { key:'lyon', name:'里昂', emoji:'🦁', league:'法甲',
    intro:'七连冠王朝的缔造者。本泽马的摇篮——你相信体系与人才培养的长期主义。',
    reasons:['相信体系力量','看重人才培养','长期主义者'],
    tags:['七连冠王朝','青训圣殿','本泽马摇篮'],
    vector:[2,2,2,4,2,2] },
  { key:'monaco', name:'摩纳哥', emoji:'💰', league:'法甲',
    intro:'富豪游乐场上的妖人工厂。姆巴佩从这里起飞——你眼光独到，喜欢发现价值洼地。',
    reasons:['眼光独到','发现价值洼地','小而美精致主义'],
    tags:['富豪游乐场','妖人工厂','冠军狙击手'],
    vector:[2,2,2,3,2,2] },
  { key:'lille', name:'里尔', emoji:'🐕', league:'法甲',
    intro:'法国北方的要塞。2021年力压巴黎夺冠——你相信数据和纪律可以战胜金钱。',
    reasons:['脚踏实地','相信数据纪律','以智取胜冷静派'],
    tags:['北方要塞','数据驱动','冠军黑马'],
    vector:[2,3,2,2,2,3] },

  // ======== 中超（16队） ========
  { key:'shanghai_port', name:'上海海港', emoji:'🔴', league:'中超',
    intro:'冠军机器的技术流美学。浦东现代化的象征——你追求效率与结果的实干派。',
    reasons:['追求效率结果','信奉专业主义','新上海精神'],
    tags:['冠军机器','金元标杆','武磊时代'],
    vector:[1,3,4,1,3,2] },
  { key:'shanghai_shenhua', name:'上海申花', emoji:'🔵', league:'中超',
    intro:'蓝血人的老上海弄堂记忆。"不狂不放不申花"——你是念旧有情怀的浪漫主义者。',
    reasons:['念旧有情怀','相信底蕴比金钱持久','老克勒精神'],
    tags:['底蕴之王','蓝血人','30年坚守'],
    vector:[1,3,4,1,3,2] },
  { key:'beijing_guoan', name:'北京国安', emoji:'🟢', league:'中超',
    intro:'工体的绿色信仰。"跟丫死磕"贯穿三十年——你有强烈的城市自豪感和倔强精神。',
    reasons:['城市自豪感','死磕精神','局气傲气'],
    tags:['永远争第一','御林军','工体不败'],
    vector:[1,3,4,1,3,2] },
  { key:'shandong_taishan', name:'山东泰山', emoji:'⛰️', league:'中超',
    intro:'齐鲁正统，青训航母。鲁能足校是中国足球的黄埔军校——你重情义喜稳定。',
    reasons:['重情义喜稳定','欣赏实在作风','传统派'],
    tags:['青训航母','杯赛之王','齐鲁正统'],
    vector:[1,3,4,1,3,2] },
  { key:'chengdu_rongcheng', name:'成都蓉城', emoji:'🐼', league:'中超',
    intro:'凤凰山的红色方阵。赛后万人大合唱是现象级名场面——你相信足球是生活方式。',
    reasons:['热爱生活氛围','体验派','相信足球即生活'],
    tags:['凤凰山奇迹','金牌球市','川足复兴'],
    vector:[1,3,4,1,4,2] },
  { key:'wuhan_three_towns', name:'武汉三镇', emoji:'🏙️', league:'中超',
    intro:'三年三级跳的凯泽斯劳滕神话。华中旗帜——你能接受大起大落的冒险家。',
    reasons:['相信逆袭叙事','接受大起大落','冒险家性格'],
    tags:['凯泽斯劳滕神话','三年三级跳','华中旗帜'],
    vector:[1,3,4,1,2,2] },
  { key:'tianjin_jinmen', name:'天津津门虎', emoji:'🐯', league:'中超',
    intro:'不死鸟的精神。天津人把足球当相声听——你是能在逆境中自嘲的乐天派。',
    reasons:['逆境中自嘲','乐天派','相信活着就有希望'],
    tags:['不死鸟','津味相声足球','于根伟印记'],
    vector:[1,3,4,1,2,2] },
  { key:'changchun_yatai', name:'长春亚泰', emoji:'🟠', league:'中超',
    intro:'东北足球最后的坚守者。2007年升班马夺冠至今是联赛最大冷门——你耐得住寂寞。',
    reasons:['耐得住寂寞','不屑随大流','低调实力派'],
    tags:['东北独苗','2007冠军','草根硬汉'],
    vector:[1,3,4,1,2,2] },
  { key:'henan', name:'河南队', emoji:'🏰', league:'中超',
    intro:'中原铁军专治各种不服。航海路堡垒不让任何客队轻松离开——你务实不浮夸。',
    reasons:['务实不浮夸','享受以下克上','草根英雄主义'],
    tags:['专治不服','中原铁军','航海路堡垒'],
    vector:[1,3,4,1,2,2] },
  { key:'zhejiang', name:'浙江队', emoji:'🟢', league:'中超',
    intro:'浙商低调务实的足球哲学。坚持地面传控——你欣赏慢工出细活的长期主义。',
    reasons:['欣赏长期主义','相信慢工出细活','耐心投资者'],
    tags:['绿色青训','宋卫平遗产','江南新势力'],
    vector:[2,3,5,2,2,2] },
  { key:'shenzhen_peng', name:'深圳新鹏城', emoji:'🏙️', league:'中超',
    intro:'城市足球集团的华南试验田。移民城市的国际化运营——你拥抱变化与新物种。',
    reasons:['拥抱变化','相信体系化运营','前沿探索者'],
    tags:['城市集团出品','特区新贵','国际化运营'],
    vector:[1,3,4,1,2,2] },
  { key:'qingdao_hainiu', name:'青岛海牛', emoji:'🐂', league:'中超',
    intro:'三十年沉浮不改蓝色信仰。青岛人踢球看海喝啤酒——你有怀旧情结。',
    reasons:['怀旧情结','相信是金子总会发光','海滨足球浪漫'],
    tags:['老字号回归','青春岛','死忠蓝军'],
    vector:[1,3,4,1,3,1] },
  { key:'nantong_zhiyun', name:'南通支云', emoji:'🌊', league:'中超',
    intro:'苏中独苗，小城市的大梦想。江苏苏宁解散后扛起足球旗帜——你支持underdog。',
    reasons:['支持underdog','相信小也可以了不起','励志追寻者'],
    tags:['苏中独苗','中小球队样本','社区足球'],
    vector:[1,3,4,1,2,1] },
  { key:'cangzhou', name:'沧州雄狮', emoji:'🦁', league:'中超',
    intro:'从石家庄到沧州的流浪者。颠沛流离中始终有球迷不离不弃——你懂得坚持比胜利更难。',
    reasons:['经历过漂泊','坚持比胜利更难得','韧劲人格'],
    tags:['流浪者','性价比之王','顽强生存'],
    vector:[1,3,4,1,2,1] },
  { key:'meizhou_hakka', name:'梅州客家', emoji:'🏠', league:'中超',
    intro:'中国唯一县级市顶级联赛球队。五华县是内地现代足球发源地——你有深厚的乡土情结。',
    reasons:['乡土情结深厚','珍视文化根脉','小而美在地认同'],
    tags:['县级市奇迹','客家文化','足球之乡'],
    vector:[1,3,4,1,2,1] },
  { key:'guangzhou', name:'广州队', emoji:'⭐', league:'中超(已解散)',
    intro:'八冠王朝终成历史。金元足球的极致寓言——你是中国足球的反思者。',
    reasons:['见证时代兴衰','反思金元足球','珍惜当下'],
    tags:['八冠王朝','恒大时代','已解散'],
    vector:[1,3,4,1,3,2] },
  { key:'liaoning_tieren', name:'辽宁铁人', emoji:'🔩', league:'中超',
    intro:'东北工业魂的足球化身。铁人之名承载了辽宁人对体育最深沉的理解——拼搏到最后一分钟。',
    reasons:['重工业城市底蕴','不服就干的东北血性','坚守本土的忠诚感'],
    tags:['东北铁军','工业之魂','辽足传承'],
    vector:[1,3,5,1,2,1] },

  // ======== 欧洲其他知名（15队） ========
  { key:'ajax', name:'阿贾克斯', emoji:'🌱', league:'荷甲',
    intro:'青训的圣殿，全攻全守的创造者。克鲁伊夫主义融入DNA——你是理想主义的造梦者。',
    reasons:['造梦者','相信过程大于结果','对美有偏执'],
    tags:['青训圣地','全攻全守','克鲁伊夫主义'],
    vector:[2,2,2,5,2,4] },
  { key:'psv', name:'PSV埃因霍温', emoji:'🔴', league:'荷甲',
    intro:'飞利浦之子的效率机器。罗马里奥、罗纳尔多从这里起飞——你是看重结果的实用主义者。',
    reasons:['实用主义者','看重结果与效率','相信好产品自己会说话'],
    tags:['效率机器','南美跳板','飞利浦之子'],
    vector:[2,2,2,4,2,2] },
  { key:'feyenoord', name:'费耶诺德', emoji:'⚪', league:'荷甲',
    intro:'鹿特丹港口工人的草根热血。与阿贾克斯的阶级对立超越足球——你相信汗水比天赋重要。',
    reasons:['草根奋斗者','汗水大于天赋','强烈归属感'],
    tags:['劳工之魂','街头足球','鹿特丹战士'],
    vector:[2,3,2,4,3,2] },
  { key:'benfica', name:'本菲卡', emoji:'🦅', league:'葡超',
    intro:'光明球场的鹰是欧洲最震撼的仪式。古特曼魔咒的悲情——你是浪漫的悲剧美学爱好者。',
    reasons:['悲剧美学爱好者','相信宿命也相信救赎','浪漫主义'],
    tags:['葡萄牙贵族','鹰之图腾','古特曼魔咒'],
    vector:[2,3,2,4,2,2] },
  { key:'porto', name:'波尔图', emoji:'🐉', league:'葡超',
    intro:'巨龙堡垒的逆袭之王。穆里尼奥2004年的欧冠奇迹——你信奉不一定要最强但要最聪明。',
    reasons:['策略型玩家','以弱胜强','信奉智慧大于蛮力'],
    tags:['巨龙堡垒','穆里尼奥主义','逆袭之王'],
    vector:[2,3,2,3,2,3] },
  { key:'sporting_cp', name:'葡萄牙体育', emoji:'🟢', league:'葡超',
    intro:'C罗的摇篮，绿狮荣耀。菲戈、C罗、纳尼从这里启航——你是深耕等待的长期主义者。',
    reasons:['长期主义者','深耕与等待','相信青训回报'],
    tags:['青训之王','C罗摇篮','绿狮荣耀'],
    vector:[1,2,2,5,2,2] },
  { key:'celtic', name:'凯尔特人', emoji:'☘️', league:'苏超',
    intro:'爱尔兰天主教移民的精神图腾。1967年全本土班底欧冠——你有深刻的信仰归属感。',
    reasons:['有信仰归属','理解体育超越体育','爱尔兰之魂'],
    tags:['绿色信仰','里斯本雄狮','老字号德比'],
    vector:[2,4,2,2,5,2] },
  { key:'rangers', name:'格拉斯哥流浪者', emoji:'🔵', league:'苏超',
    intro:'蓝色堡垒从破产降级到第四级别后浴火重生——你是坚不可摧的韧性者。',
    reasons:['坚韧不拔','经历过低谷并站起','秩序守护者'],
    tags:['蓝色堡垒','浴火重生','新教秩序'],
    vector:[2,4,2,2,4,2] },
  { key:'galatasaray', name:'加拉塔萨雷', emoji:'🦁', league:'土超',
    intro:'阿里·萨米·扬是地狱。"欢迎来到地狱"标语闻名欧洲——你是肾上腺素驱动的氛围控。',
    reasons:['荷尔蒙驱动','热爱肾上腺素','享受压倒性气势'],
    tags:['地狱主场','土耳其雄狮','氛围之王'],
    vector:[2,3,2,2,5,2] },
  { key:'fenerbahce', name:'费内巴切', emoji:'💛', league:'土超',
    intro:'博斯普鲁斯海峡亚洲岸的激情之火。萨拉科格鲁的烟火——你享受大起大落的戏剧化。',
    reasons:['激情派','享受大起大落','戏剧化叙事'],
    tags:['伊斯坦布尔贵族','永不言败','洲际德比'],
    vector:[2,3,2,2,5,2] },
  { key:'anderlecht', name:'安德莱赫特', emoji:'🟣', league:'比甲',
    intro:'紫金王朝，比利时黄金一代的摇篮。孔帕尼从这里走出——你是品味派，欣赏底蕴。',
    reasons:['品味派','欣赏底蕴胜过当下','优雅审美'],
    tags:['紫金王朝','比利时心脏','复兴之路'],
    vector:[1,2,2,4,2,2] },
  { key:'club_brugge', name:'布鲁日', emoji:'🔵', league:'比甲',
    intro:'中世纪古城的蓝黑洪流。杨·布雷德尔球场的歌声环绕运河——你是精致主义者。',
    reasons:['精致主义者','小而美的存在','欣赏秩序与纪律'],
    tags:['蓝黑洪流','中世纪之盾','欧战黑马'],
    vector:[1,2,2,3,2,2] },
  { key:'shakhtar', name:'顿涅茨克矿工', emoji:'⛏️', league:'乌超',
    intro:'因战争背井离乡却从未解散。巴西技术流+东欧纪律——你是逆境中的坚守者。',
    reasons:['逆境坚守','人可以被打败不能被摧毁','战争中的忠诚'],
    tags:['巴西联队','流浪冠军','战争不屈'],
    vector:[2,3,2,2,2,2] },
  { key:'salzburg', name:'萨尔茨堡红牛', emoji:'🐂', league:'奥超',
    intro:'重金属足球的高压机器。哈兰德在此爆发——你拥抱效率与新秩序，对传统不盲从。',
    reasons:['现代主义者','拥抱效率新秩序','不盲从传统'],
    tags:['重金属足球','奥地利工厂','德甲跳板'],
    vector:[1,2,2,4,1,2] },
  { key:'copenhagen', name:'哥本哈根', emoji:'❄️', league:'丹超',
    intro:'北欧之盾的维京战吼。外表平静内心有火——你相信稳扎稳打的力量。',
    reasons:['冷静观察者','外表平静内心有火','稳扎稳打'],
    tags:['北欧之盾','丹麦童话','冻土铁军'],
    vector:[1,2,2,2,3,2] },

  // ======== 非欧洲焦点队（6队） ========
  { key:'al_hilal', name:'利雅得新月', emoji:'🌙', league:'沙特联',
    intro:'亚洲之王，PIF打造的蓝色波浪。4次亚冠冠军——你享受站在最高处的碾压感。',
    reasons:['赢家心态','享受碾压感','不惧金元标签'],
    tags:['亚洲之王','金元豪门','蓝色波浪'],
    vector:[3,2,2,1,2,1] },
  { key:'al_nassr', name:'利雅得胜利', emoji:'🌟', league:'沙特联',
    intro:'C罗时代引爆全球流量。社媒粉丝破五千万——你爱看顶流故事与悲情剧本并存。',
    reasons:['话题追逐型','爱看顶流故事','接受悲情剧本'],
    tags:['C罗时代','流量之王','全球关注'],
    vector:[3,2,2,1,2,1] },
  { key:'al_ittihad', name:'吉达联合', emoji:'🐯', league:'沙特联',
    intro:'沙特最古老豪门，本泽马领衔。2005年亚冠逆转——你喜欢低调深厚的传统力量。',
    reasons:['底蕴品味型','不追最亮的星','欣赏传统力量'],
    tags:['虎之队','本泽马领衔','红海巨人'],
    vector:[2,2,2,1,2,1] },
  { key:'inter_miami', name:'迈阿密国际', emoji:'🦩', league:'MLS',
    intro:'梅西之城，贝克汉姆出品。从垫底到北美焦点——你为一个人爱上一支队。',
    reasons:['追星体验型','为一个人爱一支队','接受不确定感'],
    tags:['梅西之城','贝克汉姆出品','网红新贵'],
    vector:[2,2,2,1,3,1] },
  { key:'lafc', name:'洛杉矶FC', emoji:'🌟', league:'MLS',
    intro:'3252独立支持者协会打造北美最接近欧洲的看台文化。你喜欢先锋多元的俱乐部。',
    reasons:['新浪潮型','喜欢先锋多元文化','厌倦陈旧叙事'],
    tags:['新锐标杆','支持者文化','拉丁基因'],
    vector:[2,2,2,1,3,1] },
  { key:'boca_juniors', name:'博卡青年', emoji:'💙', league:'阿超',
    intro:'糖果盒的12号看台是全世界最狂热的球迷组织。你爱的不是成绩而是刻在骨头里的信仰。',
    reasons:['激情信仰型','不因成绩而爱','足球即宗教'],
    tags:['糖果盒','贫民精神','世界第一德比'],
    vector:[2,4,2,2,5,2] },

  // ======== 曾辉煌低谷传统队（10队） ========
  { key:'schalke', name:'沙尔克04', emoji:'⛏️', league:'德乙',
    intro:'矿工之魂不灭。鲁尔区的工人阶级信仰——降级时场均6万人，球迷集资救俱乐部。',
    reasons:['悲剧美学型','享受疼痛中的忠诚','相信黑暗尽头有光'],
    tags:['矿工之魂','坠落深渊','球迷救主'],
    vector:[2,3,2,3,4,2] },
  { key:'hamburg', name:'汉堡', emoji:'🦕', league:'德甲(刚回归)',
    intro:'德甲恐龙时钟曾连续54年未降级。7年后重返德甲——你不离开因为你记得它曾经是谁。',
    reasons:['怀旧坚守型','记得它曾经是谁','时间见证者'],
    tags:['北大王','德甲恐龙','浴火归来'],
    vector:[3,3,2,2,3,2] },
  { key:'charlton', name:'查尔顿', emoji:'🔴', league:'英冠',
    intro:'伦敦被遗忘者。球迷自组"山谷党"抗议老板——你厌恶Big Six的商业化叙事。',
    reasons:['反精致型','厌恶商业化','偏偏爱被遗忘的队'],
    tags:['伦敦被遗忘者','山谷球场','草根韧性'],
    vector:[1,2,2,3,2,2] },
  { key:'blackburn', name:'布莱克本', emoji:'🌹', league:'英冠',
    intro:'1995年希勒率队夺得英超冠军。金元足球的先驱后被更有钱的人甩开——你是金元足球反思者。',
    reasons:['金元反思型','爱过金元先驱','被时代抛弃的共鸣'],
    tags:['钢铁之城','希勒之王','英超遗老'],
    vector:[2,3,2,2,3,1] },
  { key:'deportivo', name:'拉科鲁尼亚', emoji:'🔵', league:'西乙',
    intro:'超级拉科，2004年4-0逆转AC米兰。从欧冠四强到第三级别——极致悲剧美学的追随者。',
    reasons:['极致悲剧美学','从巅峰坠入深渊','毫不回头'],
    tags:['超级拉科','小城奇迹','坠落最彻底'],
    vector:[2,2,2,2,3,2] },
  { key:'saint_etienne', name:'圣埃蒂安', emoji:'🟢', league:'法乙',
    intro:'10次法甲冠军，普拉蒂尼的摇篮。Geoffroy-Guichard是绿色地狱——你热爱足球的历史层次感。',
    reasons:['法国足球考古型','热爱历史层次感','工人阶级图腾'],
    tags:['绿色传奇','法国荣耀','球迷风暴'],
    vector:[2,3,2,2,3,2] },
  { key:'sheff_wed', name:'谢周三', emoji:'🦉', league:'英冠',
    intro:'猫头鹰，希尔斯堡惨案的幸存者俱乐部。克里斯·沃德尔的边路华尔兹——你喜欢踏实的英式足球。',
    reasons:['复古英式型','踏实没有泡沫','社区担当精神'],
    tags:['猫头鹰','钢铁之城','英超创始元老'],
    vector:[2,3,2,2,3,1] },
  { key:'kaiserslautern', name:'凯泽斯劳滕', emoji:'🔴', league:'德乙',
    intro:'1998年升班马直接夺冠——凯泽斯劳滕奇迹。你相信足球最大的魅力就是"万一呢？"',
    reasons:['奇迹信仰型','相信万一','童话追随者'],
    tags:['凯泽斯劳滕奇迹','红魔','贝岑山'],
    vector:[2,4,2,2,3,1] },
  { key:'leicester_city', name:'莱斯特城', emoji:'🦊', league:'英甲',
    intro:'1赔5000的夺冠奇迹→两连降至英甲。瓦尔迪的草根传奇——你是"从童话到悲剧"的完整见证者。',
    reasons:['见证完整兴衰','草根传奇信仰者','相信奇迹也接受悲剧'],
    tags:['5000-1奇迹','瓦尔迪传奇','童话到悲剧'],
    vector:[3,4,2,2,3,2] },
  { key:'west_ham', name:'西汉姆联', emoji:'⚒️', league:'英冠',
    intro:'铁锤帮，工人阶级的东伦敦之魂。博林球场的泡泡机——你是最纯粹的社区足球拥趸。',
    reasons:['工人阶级认同','社区足球信仰','铁锤精神'],
    tags:['铁锤帮','东伦敦之魂','青训学院'],
    vector:[2,3,2,2,4,2] },
  { key:'wolves', name:'狼队', emoji:'🐺', league:'英冠',
    intro:'葡萄牙帮的英伦试验田。黄金一代的国际化实验——你欣赏跨界融合的新模式。',
    reasons:['跨界融合欣赏者','国际化视野','新模式探索者'],
    tags:['葡萄牙帮','黄金一代','莫利纽克斯'],
    vector:[2,3,2,2,2,2] },
  { key:'southampton', name:'南安普顿', emoji:'😇', league:'英冠',
    intro:'圣徒青训营：贝尔、沃尔科特、张伯伦、卢克·肖……你是青训信徒，相信培养大于购买。',
    reasons:['青训信徒','培养大于购买','造血能力信仰者'],
    tags:['圣徒青训','球星流水线','南海岸'],
    vector:[1,2,2,4,2,2] },
];

// ==================== 俱乐部颜色映射（队徽用） ====================
const CLUB_COLORS = {
  // 英超
  arsenal:'#EF0107', aston_villa:'#670E36', bournemouth:'#DA291C', brentford:'#E30613',
  brighton:'#0057B8', chelsea:'#034694', coventry:'#0083D2', crystal_palace:'#1B458F',
  everton:'#003399', fulham:'#CCCCCC', hull_city:'#F5A12C', ipswich:'#0033A0',
  leeds:'#FFCD00', liverpool:'#C8102E', man_city:'#6CABDD', man_utd:'#DA291C',
  newcastle:'#241F20', nottm_forest:'#DD0000', sunderland:'#DA291C', tottenham:'#132257',
  // 西甲
  real_madrid:'#FEBE10', barcelona:'#A50044', atletico:'#CB3524', athletic_bilbao:'#EE2523',
  sevilla:'#D20B22', real_sociedad:'#0A69C9', real_betis:'#0B8135', villarreal:'#F5E600',
  valencia:'#F79E1B', girona:'#D50032',
  // 德甲
  bayern:'#DC052D', dortmund:'#FDE100', leverkusen:'#E32221', rb_leipzig:'#DD0741',
  frankfurt:'#E1000F', gladbach:'#00A650', stuttgart:'#E32219', wolfsburg:'#65B32E',
  werder_bremen:'#1D9053', freiburg:'#CC0000',
  // 意甲
  juventus:'#000000', ac_milan:'#FB090B', inter_milan:'#010E80', napoli:'#12A0D4',
  roma:'#8E1F2F', atalanta:'#1A4291', lazio:'#86CEFA', fiorentina:'#5C2D91',
  // 法甲
  psg:'#004170', marseille:'#2FAEE0', lyon:'#1A2A83', monaco:'#E73B34', lille:'#E31B23',
  // 中超
  shanghai_port:'#D90D1D', shanghai_shenhua:'#0050A0', beijing_guoan:'#009944',
  shandong_taishan:'#F37021', chengdu_rongcheng:'#D31128', wuhan_three_towns:'#003B8C',
  tianjin_jinmen:'#003B8C', changchun_yatai:'#F47B20', henan:'#D7122E', zhejiang:'#009A44',
  shenzhen_peng:'#D01132', qingdao_hainiu:'#003D7C', nantong_zhiyun:'#004B9A',
  cangzhou:'#003D7C', meizhou_hakka:'#E32619', guangzhou:'#DA251D',
  liaoning_tieren:'#CC0000',
  // 荷甲
  ajax:'#CD2127', psv:'#ED1C24', feyenoord:'#E50814',
  // 葡超
  benfica:'#FF0000', porto:'#0046A8', sporting_cp:'#047546',
  // 苏超
  celtic:'#018749', rangers:'#0033A0',
  // 土超
  galatasaray:'#A32638', fenerbahce:'#FFED00',
  // 比甲
  anderlecht:'#391D73', club_brugge:'#00519B',
  // 东欧/北欧
  shakhtar:'#F57216', salzburg:'#CE0E2D', copenhagen:'#004A98',
  // 沙特/MLS/南美
  al_hilal:'#004A98', al_nassr:'#FFC01E', al_ittihad:'#FFC90C',
  inter_miami:'#F7B5CD', lafc:'#C39E3D', boca_juniors:'#0038A8',
  // 低谷传统队
  schalke:'#004D9C', hamburg:'#0060AF', charlton:'#E1261C', blackburn:'#0068B4',
  deportivo:'#004B9C', saint_etienne:'#0E9C4B', sheff_wed:'#005CA0',
  kaiserslautern:'#DD0000', leicester_city:'#003090', west_ham:'#7A263A',
  wolves:'#FDB913', southampton:'#D71920',
};

// ==================== 题库（36题·特质向量版） ====================
// 每题4个选项，每个选项的 traits 是6维向量 [荣誉底蕴,精神气质,家乡归属,青训文化,球迷文化,战术风格]
const QUESTIONS = [
  { id:1, question:'选择一支主队时，你更看重什么？', category:'荣誉底蕴', options:[
    { text:'辉煌的冠军历史和荣誉室', traits:[5,0,0,0,0,0] },
    { text:'铁血硬汉——每一球都拼尽全力', traits:[0,5,0,0,0,0] },
    { text:'与家乡/城市的情感连接最重要', traits:[0,0,5,0,0,0] },
    { text:'自己培养的球员比买来的更有价值', traits:[0,0,0,5,0,0] }
  ]},
  { id:2, question:'你如何看待"豪门底蕴"？', category:'荣誉底蕴', options:[
    { text:'万人齐声高歌——歌声淹没整个球场', traits:[0,0,0,0,5,0] },
    { text:'令人着迷的战术打法和阵型变化', traits:[0,0,0,0,0,5] },
    { text:'冠军是衡量伟大的第一标准', traits:[5,0,0,0,0,0] },
    { text:'永不服输——战斗到最后一秒', traits:[0,5,0,0,0,0] }
  ]},
  { id:3, question:'你更欣赏哪种冠军故事？', category:'荣誉底蕴', options:[
    { text:'为家乡球队加油不需要理由', traits:[0,0,5,0,0,0] },
    { text:'青训是俱乐部的根——没有青训就没有灵魂', traits:[0,0,0,5,0,0] },
    { text:'死忠球迷——每场必到、歌声不停', traits:[0,0,0,0,5,0] },
    { text:'战术博弈——足球是绿茵场上的国际象棋', traits:[0,0,0,0,0,5] }
  ]},
  { id:4, question:'对于"没有冠军的美丽足球"，你怎么看？', category:'荣誉底蕴', options:[
    { text:'欧冠奖杯比任何东西都重要', traits:[5,0,0,0,0,0] },
    { text:'拼搏精神比技术更重要', traits:[0,5,0,0,0,0] },
    { text:'本地球队代表着一方水土一方人', traits:[0,0,5,0,0,0] },
    { text:'看到自家青训孩子进球——那种骄傲无法替代', traits:[0,0,0,5,0,0] }
  ]},
  { id:5, question:'你认同"足球正在被金钱改变"吗？', category:'荣誉底蕴', options:[
    { text:'球迷文化是俱乐部的灵魂', traits:[0,0,0,0,5,0] },
    { text:'精妙的传控配合撕开防线', traits:[0,0,0,0,0,5] },
    { text:'连续夺冠的统治力最令人着迷', traits:[5,0,0,0,0,0] },
    { text:'战士的意志——不向任何对手低头', traits:[0,5,0,0,0,0] }
  ]},
  { id:6, question:'你喜欢一支球队多久没有冠军还能坚持支持？', category:'荣誉底蕴', options:[
    { text:'无论成绩如何——家乡球队永远是主队', traits:[0,0,5,0,0,0] },
    { text:'相信年轻一代——给青训球员时间成长', traits:[0,0,0,5,0,0] },
    { text:'和万千球迷一起呐喊——这就是足球', traits:[0,0,0,0,5,0] },
    { text:'战术革新——像瓜迪奥拉那样重新定义足球', traits:[0,0,0,0,0,5] }
  ]},
  { id:7, question:'你最喜欢哪种球场气质？', category:'精神气质', options:[
    { text:'豪门底蕴——冠军的基因在血液里', traits:[5,0,0,0,0,0] },
    { text:'绝境中爆发——最硬的队伍在逆境中最强', traits:[0,5,0,0,0,0] },
    { text:'扎根社区——足球俱乐部是城市的骄傲', traits:[0,0,5,0,0,0] },
    { text:'拉玛西亚/卡灵顿——青训圣地的魅力', traits:[0,0,0,5,0,0] }
  ]},
  { id:8, question:'你更欣赏哪种教练风格？', category:'精神气质', options:[
    { text:'You\'ll Never Walk Alone——足球因球迷而伟大', traits:[0,0,0,0,5,0] },
    { text:'高位压迫+快速转换——现代足球的极致美学', traits:[0,0,0,0,0,5] },
    { text:'荣誉室的奖杯数量说明一切', traits:[5,0,0,0,0,0] },
    { text:'热血足球——宁可在冲锋中倒下', traits:[0,5,0,0,0,0] }
  ]},
  { id:9, question:'比赛落后时，你希望球队怎么做？', category:'精神气质', options:[
    { text:'家乡的球队即使降级也值得一生追随', traits:[0,0,5,0,0,0] },
    { text:'培养球员的过程比买冠军更有意义', traits:[0,0,0,5,0,0] },
    { text:'狂热的南看台——球迷就是第十二人', traits:[0,0,0,0,5,0] },
    { text:'战术纪律——每一脚传球都有目的', traits:[0,0,0,0,0,5] }
  ]},
  { id:10, question:'你如何看待"摆大巴"（密集防守）？', category:'精神气质', options:[
    { text:'王朝霸业——统治一个时代才算伟大', traits:[5,0,0,0,0,0] },
    { text:'铁血防守也是一种艺术', traits:[0,5,0,0,0,0] },
    { text:'本地足球文化——我属于这片土地', traits:[0,0,5,0,0,0] },
    { text:'青训DNA——俱乐部的传承在骨子里', traits:[0,0,0,5,0,0] }
  ]},
  { id:11, question:'球队输球后，你的心态是？', category:'精神气质', options:[
    { text:'球迷的忠诚在逆境中最闪亮', traits:[0,0,0,0,5,0] },
    { text:'从433到352——战术演变本身就是艺术', traits:[0,0,0,0,0,5] },
    { text:'赢家心态——习惯胜利的球队最可怕', traits:[5,0,0,0,0,0] },
    { text:'斗士的尊严——宁可站着死不可跪着生', traits:[0,5,0,0,0,0] }
  ]},
  { id:12, question:'哪种球队故事最能打动你？', category:'精神气质', options:[
    { text:'支持本地球队是理所当然的事', traits:[0,0,5,0,0,0] },
    { text:'年轻人的成长故事比冠军剧本更动人', traits:[0,0,0,5,0,0] },
    { text:'祖孙三代同看一场球——这就是传承', traits:[0,0,0,0,5,0] },
    { text:'用脑子踢球——战术理解力比身体更重要', traits:[0,0,0,0,0,5] }
  ]},
  { id:13, question:'你的家乡在哪个省份？', category:'家乡归属', type:'fill',
    placeholder:'例如：浙江、广东、北京…',
    note:'（用于匹配本地球队，不参与性格评分）' },
  { id:14, question:'你如何看待家乡球队？', category:'家乡归属', options:[
    { text:'辉煌的冠军历史和荣誉室', traits:[5,0,0,0,0,0] },
    { text:'铁血硬汉——每一球都拼尽全力', traits:[0,5,0,0,0,0] },
    { text:'与家乡/城市的情感连接最重要', traits:[0,0,5,0,0,0] },
    { text:'自己培养的球员比买来的更有价值', traits:[0,0,0,5,0,0] }
  ]},
  { id:15, question:'你觉得足球俱乐部最核心的身份是？', category:'家乡归属', options:[
    { text:'万人齐声高歌——歌声淹没整个球场', traits:[0,0,0,0,5,0] },
    { text:'令人着迷的战术打法和阵型变化', traits:[0,0,0,0,0,5] },
    { text:'冠军是衡量伟大的第一标准', traits:[5,0,0,0,0,0] },
    { text:'永不服输——战斗到最后一秒', traits:[0,5,0,0,0,0] }
  ]},
  { id:16, question:'如果可以选，你更想出生在哪座足球城市？', category:'家乡归属', options:[
    { text:'为家乡球队加油不需要理由', traits:[0,0,5,0,0,0] },
    { text:'青训是俱乐部的根——没有青训就没有灵魂', traits:[0,0,0,5,0,0] },
    { text:'死忠球迷——每场必到、歌声不停', traits:[0,0,0,0,5,0] },
    { text:'战术博弈——足球是绿茵场上的国际象棋', traits:[0,0,0,0,0,5] }
  ]},
  { id:17, question:'你如何看待本地足球文化？', category:'家乡归属', options:[
    { text:'欧冠奖杯比任何东西都重要', traits:[5,0,0,0,0,0] },
    { text:'拼搏精神比技术更重要', traits:[0,5,0,0,0,0] },
    { text:'本地球队代表着一方水土一方人', traits:[0,0,5,0,0,0] },
    { text:'看到自家青训孩子进球——那种骄傲无法替代', traits:[0,0,0,5,0,0] }
  ]},
  { id:18, question:'选择支持的球队时，哪个因素对你最重要？', category:'家乡归属', options:[
    { text:'球迷文化是俱乐部的灵魂', traits:[0,0,0,0,5,0] },
    { text:'精妙的传控配合撕开防线', traits:[0,0,0,0,0,5] },
    { text:'连续夺冠的统治力最令人着迷', traits:[5,0,0,0,0,0] },
    { text:'战士的意志——不向任何对手低头', traits:[0,5,0,0,0,0] }
  ]},
  { id:19, question:'你更欣赏哪种建队思路？', category:'青训文化', options:[
    { text:'无论成绩如何——家乡球队永远是主队', traits:[0,0,5,0,0,0] },
    { text:'相信年轻一代——给青训球员时间成长', traits:[0,0,0,5,0,0] },
    { text:'和万千球迷一起呐喊——这就是足球', traits:[0,0,0,0,5,0] },
    { text:'战术革新——像瓜迪奥拉那样重新定义足球', traits:[0,0,0,0,0,5] }
  ]},
  { id:20, question:'你如何看待年轻球员的培养？', category:'青训文化', options:[
    { text:'豪门底蕴——冠军的基因在血液里', traits:[5,0,0,0,0,0] },
    { text:'绝境中爆发——最硬的队伍在逆境中最强', traits:[0,5,0,0,0,0] },
    { text:'扎根社区——足球俱乐部是城市的骄傲', traits:[0,0,5,0,0,0] },
    { text:'拉玛西亚/卡灵顿——青训圣地的魅力', traits:[0,0,0,5,0,0] }
  ]},
  { id:21, question:'你更欣赏哪种青训模式？', category:'青训文化', options:[
    { text:'You\'ll Never Walk Alone——足球因球迷而伟大', traits:[0,0,0,0,5,0] },
    { text:'高位压迫+快速转换——现代足球的极致美学', traits:[0,0,0,0,0,5] },
    { text:'荣誉室的奖杯数量说明一切', traits:[5,0,0,0,0,0] },
    { text:'热血足球——宁可在冲锋中倒下', traits:[0,5,0,0,0,0] }
  ]},
  { id:22, question:'对于球队的"DNA"，你的看法是？', category:'青训文化', options:[
    { text:'家乡的球队即使降级也值得一生追随', traits:[0,0,5,0,0,0] },
    { text:'培养球员的过程比买冠军更有意义', traits:[0,0,0,5,0,0] },
    { text:'狂热的南看台——球迷就是第十二人', traits:[0,0,0,0,5,0] },
    { text:'战术纪律——每一脚传球都有目的', traits:[0,0,0,0,0,5] }
  ]},
  { id:23, question:'功勋老将状态下滑，你支持怎么办？', category:'青训文化', options:[
    { text:'王朝霸业——统治一个时代才算伟大', traits:[5,0,0,0,0,0] },
    { text:'铁血防守也是一种艺术', traits:[0,5,0,0,0,0] },
    { text:'本地足球文化——我属于这片土地', traits:[0,0,5,0,0,0] },
    { text:'青训DNA——俱乐部的传承在骨子里', traits:[0,0,0,5,0,0] }
  ]},
  { id:24, question:'你希望球队拥有怎样的球员结构？', category:'青训文化', options:[
    { text:'球迷的忠诚在逆境中最闪亮', traits:[0,0,0,0,5,0] },
    { text:'从433到352——战术演变本身就是艺术', traits:[0,0,0,0,0,5] },
    { text:'赢家心态——习惯胜利的球队最可怕', traits:[5,0,0,0,0,0] },
    { text:'斗士的尊严——宁可站着死不可跪着生', traits:[0,5,0,0,0,0] }
  ]},
  { id:25, question:'比赛日现场，哪个最让你热血沸腾？', category:'球迷文化', options:[
    { text:'支持本地球队是理所当然的事', traits:[0,0,5,0,0,0] },
    { text:'年轻人的成长故事比冠军剧本更动人', traits:[0,0,0,5,0,0] },
    { text:'祖孙三代同看一场球——这就是传承', traits:[0,0,0,0,5,0] },
    { text:'用脑子踢球——战术理解力比身体更重要', traits:[0,0,0,0,0,5] }
  ]},
  { id:26, question:'你更认同哪种球迷文化？', category:'球迷文化', options:[
    { text:'辉煌的冠军历史和荣誉室', traits:[5,0,0,0,0,0] },
    { text:'铁血硬汉——每一球都拼尽全力', traits:[0,5,0,0,0,0] },
    { text:'与家乡/城市的情感连接最重要', traits:[0,0,5,0,0,0] },
    { text:'自己培养的球员比买来的更有价值', traits:[0,0,0,5,0,0] }
  ]},
  { id:27, question:'你更喜欢哪种球迷歌曲/氛围？', category:'球迷文化', options:[
    { text:'万人齐声高歌——歌声淹没整个球场', traits:[0,0,0,0,5,0] },
    { text:'令人着迷的战术打法和阵型变化', traits:[0,0,0,0,0,5] },
    { text:'冠军是衡量伟大的第一标准', traits:[5,0,0,0,0,0] },
    { text:'永不服输——战斗到最后一秒', traits:[0,5,0,0,0,0] }
  ]},
  { id:28, question:'你如何看待球迷之间的对抗？', category:'球迷文化', options:[
    { text:'为家乡球队加油不需要理由', traits:[0,0,5,0,0,0] },
    { text:'青训是俱乐部的根——没有青训就没有灵魂', traits:[0,0,0,5,0,0] },
    { text:'死忠球迷——每场必到、歌声不停', traits:[0,0,0,0,5,0] },
    { text:'战术博弈——足球是绿茵场上的国际象棋', traits:[0,0,0,0,0,5] }
  ]},
  { id:29, question:'你会用什么方式支持自己的球队？', category:'球迷文化', options:[
    { text:'欧冠奖杯比任何东西都重要', traits:[5,0,0,0,0,0] },
    { text:'拼搏精神比技术更重要', traits:[0,5,0,0,0,0] },
    { text:'本地球队代表着一方水土一方人', traits:[0,0,5,0,0,0] },
    { text:'看到自家青训孩子进球——那种骄傲无法替代', traits:[0,0,0,5,0,0] }
  ]},
  { id:30, question:'你更喜欢哪种看球体验？', category:'球迷文化', options:[
    { text:'球迷文化是俱乐部的灵魂', traits:[0,0,0,0,5,0] },
    { text:'精妙的传控配合撕开防线', traits:[0,0,0,0,0,5] },
    { text:'连续夺冠的统治力最令人着迷', traits:[5,0,0,0,0,0] },
    { text:'战士的意志——不向任何对手低头', traits:[0,5,0,0,0,0] }
  ]},
  { id:31, question:'你更喜欢哪种战术风格？', category:'战术风格', options:[
    { text:'无论成绩如何——家乡球队永远是主队', traits:[0,0,5,0,0,0] },
    { text:'相信年轻一代——给青训球员时间成长', traits:[0,0,0,5,0,0] },
    { text:'和万千球迷一起呐喊——这就是足球', traits:[0,0,0,0,5,0] },
    { text:'战术革新——像瓜迪奥拉那样重新定义足球', traits:[0,0,0,0,0,5] }
  ]},
  { id:32, question:'你更欣赏哪种球员？', category:'战术风格', options:[
    { text:'豪门底蕴——冠军的基因在血液里', traits:[5,0,0,0,0,0] },
    { text:'绝境中爆发——最硬的队伍在逆境中最强', traits:[0,5,0,0,0,0] },
    { text:'扎根社区——足球俱乐部是城市的骄傲', traits:[0,0,5,0,0,0] },
    { text:'拉玛西亚/卡灵顿——青训圣地的魅力', traits:[0,0,0,5,0,0] }
  ]},
  { id:33, question:'你认同"1-0万岁"这种足球哲学吗？', category:'战术风格', options:[
    { text:'You\'ll Never Walk Alone——足球因球迷而伟大', traits:[0,0,0,0,5,0] },
    { text:'高位压迫+快速转换——现代足球的极致美学', traits:[0,0,0,0,0,5] },
    { text:'荣誉室的奖杯数量说明一切', traits:[5,0,0,0,0,0] },
    { text:'热血足球——宁可在冲锋中倒下', traits:[0,5,0,0,0,0] }
  ]},
  { id:34, question:'你如何评价瓜迪奥拉式的极致传控？', category:'战术风格', options:[
    { text:'家乡的球队即使降级也值得一生追随', traits:[0,0,5,0,0,0] },
    { text:'培养球员的过程比买冠军更有意义', traits:[0,0,0,5,0,0] },
    { text:'狂热的南看台——球迷就是第十二人', traits:[0,0,0,0,5,0] },
    { text:'战术纪律——每一脚传球都有目的', traits:[0,0,0,0,0,5] }
  ]},
  { id:35, question:'你最喜欢哪种进攻方式？', category:'战术风格', options:[
    { text:'王朝霸业——统治一个时代才算伟大', traits:[5,0,0,0,0,0] },
    { text:'铁血防守也是一种艺术', traits:[0,5,0,0,0,0] },
    { text:'本地足球文化——我属于这片土地', traits:[0,0,5,0,0,0] },
    { text:'青训DNA——俱乐部的传承在骨子里', traits:[0,0,0,5,0,0] }
  ]},
  { id:36, question:'你觉得VAR让足球变好了还是变坏了？', category:'战术风格', options:[
    { text:'球迷的忠诚在逆境中最闪亮', traits:[0,0,0,0,5,0] },
    { text:'从433到352——战术演变本身就是艺术', traits:[0,0,0,0,0,5] },
    { text:'赢家心态——习惯胜利的球队最可怕', traits:[5,0,0,0,0,0] },
    { text:'斗士的尊严——宁可站着死不可跪着生', traits:[0,5,0,0,0,0] }
  ]},
];

// ==================== 应用状态 ====================
const STORAGE_KEY = 'football_quiz_v2_progress';
// 省份→中超球队映射（家乡填空题加权用）
const PROVINCE_CLUB_MAP = {
  '浙江':['zhejiang'], '湖北':['wuhan_three_towns'], '武汉':['wuhan_three_towns'],
  '上海':['shanghai_port','shanghai_shenhua'], '北京':['beijing_guoan'],
  '山东':['shandong_taishan','qingdao_hainiu'], '青岛':['qingdao_hainiu'],
  '四川':['chengdu_rongcheng'], '成都':['chengdu_rongcheng'],
  '天津':['tianjin_jinmen'], '吉林':['changchun_yatai'], '长春':['changchun_yatai'],
  '河南':['henan'], '广东':['shenzhen_peng','meizhou_hakka','guangzhou'],
  '深圳':['shenzhen_peng'], '梅州':['meizhou_hakka'], '广州':['guangzhou'],
  '江苏':['nantong_zhiyun'], '南通':['nantong_zhiyun'],
  '河北':['cangzhou'], '辽宁':['liaoning_tieren'], '沈阳':['liaoning_tieren'],
};
const HOMETOWN_BONUS = 0.006; // 家乡匹配加权 4%（角色模拟后上调）

const STATE = {
  currentIndex: 0,
  traits: [0,0,0,0,0,0],          // 6维累加特质分
  answers: [],
  isLocked: false,
  hometown: ''                     // 家乡省份（填空题）
};

// ==================== 页面导航 ====================
function showPage(page) {
  [pageStart, pageQuiz, pageResult].forEach(p => p.classList.remove('active'));
  requestAnimationFrame(() => page.classList.add('active'));
  if (page === pageResult) pageResult.scrollTop = 0;
}

// ==================== 弹窗 ====================
function showModal(message) {
  return new Promise(resolve => {
    modalMessage.textContent = message;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    const cleanup = () => {
      modalOverlay.classList.remove('open');
      modalOverlay.setAttribute('aria-hidden', 'true');
      modalCancel.removeEventListener('click', onCancel);
      modalConfirm.removeEventListener('click', onConfirm);
    };
    const onCancel = () => { cleanup(); resolve(false); };
    const onConfirm = () => { cleanup(); resolve(true); };
    modalCancel.addEventListener('click', onCancel);
    modalConfirm.addEventListener('click', onConfirm);
  });
}

// ==================== 进度持久化 ====================
function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentIndex: STATE.currentIndex,
      traits: STATE.traits,
      answers: STATE.answers,
      hometown: STATE.hometown,
      timestamp: Date.now()
    }));
  } catch(e) {}
}
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Date.now() - data.timestamp > 24*60*60*1000) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch(e) { return null; }
}
function clearProgress() {
  try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
}

// ==================== 启动页 ====================
function initStartPage() {
  const saved = loadProgress();
  if (saved && saved.currentIndex > 0 && saved.currentIndex < QUESTIONS.length) {
    resumeProgress.textContent = saved.currentIndex + 1;
    btnResume.style.display = 'inline-flex';
  } else {
    btnResume.style.display = 'none';
  }
}

async function startNewQuiz() {
  const saved = loadProgress();
  if (saved && saved.currentIndex > 0 && saved.currentIndex < QUESTIONS.length) {
    const ok = await showModal('你还有未完成的测试，是否放弃并重新开始？');
    if (!ok) return;
  }
  STATE.currentIndex = 0;
  STATE.traits = [0,0,0,0,0,0];
  STATE.answers = [];
  STATE.hometown = '';
  STATE.isLocked = false;
  clearProgress();
  renderQuestion();
  showPage(pageQuiz);
}

async function resumeQuiz() {
  const saved = loadProgress();
  if (!saved || saved.currentIndex <= 0) { startNewQuiz(); return; }
  STATE.currentIndex = saved.currentIndex;
  STATE.traits = saved.traits;
  STATE.answers = saved.answers || [];
  STATE.hometown = saved.hometown || '';
  STATE.isLocked = false;
  renderQuestion();
  showPage(pageQuiz);
}

// ==================== 答题逻辑 ====================
function renderQuestion() {
  const q = QUESTIONS[STATE.currentIndex];
  if (!q) return;
  STATE.isLocked = false;

  currentNum.textContent = STATE.currentIndex + 1;
  totalNumEl.textContent = QUESTIONS.length;
  progressBar.style.width = (STATE.currentIndex / QUESTIONS.length * 100) + '%';
  categoryTag.textContent = q.category;

  // 上一题按钮：有历史答案且不在第0题时显示
  btnPrev.style.display = (STATE.answers.length > 0 && STATE.currentIndex > 0) ? 'inline-flex' : 'none';

  // 题目滑出→换内容→滑入
  questionCard.classList.remove('slide-in','slide-out');
  void questionCard.offsetWidth;
  questionCard.classList.add('slide-out');
  setTimeout(() => {
    questionText.textContent = q.question;
    questionCard.classList.remove('slide-out');
    void questionCard.offsetWidth;
    questionCard.classList.add('slide-in');
  }, 250);

  // 渲染选项（填空题特殊处理）
  optionsList.innerHTML = '';
  if (q.type === 'fill') {
    const wrap = document.createElement('div');
    wrap.className = 'fill-input-wrap';
    wrap.innerHTML = `
      <input type="text" id="fill-input" class="fill-input" placeholder="${q.placeholder || ''}" maxlength="10" autocomplete="off">
      <button id="btn-fill-submit" class="btn btn-primary btn-sm" type="button">确认</button>
    `;
    if (q.note) {
      const note = document.createElement('p');
      note.className = 'fill-note';
      note.textContent = q.note;
      wrap.appendChild(note);
    }
    optionsList.appendChild(wrap);
    const fillInput = wrap.querySelector('#fill-input');
    const fillBtn = wrap.querySelector('#btn-fill-submit');
    const doSubmit = () => {
      const val = fillInput.value.trim();
      if (!val) return;
      STATE.isLocked = true;
      STATE.hometown = val;
      STATE.answers.push({ questionId: q.id, optionIndex: -1, text: val });
      fillInput.disabled = true;
      fillBtn.disabled = true;
      fillBtn.textContent = '✓';
      saveProgress();
      setTimeout(() => {
        STATE.currentIndex++;
        if (STATE.currentIndex >= QUESTIONS.length) {
          clearProgress();
          showResult();
        } else {
          renderQuestion();
        }
      }, 350);
    };
    fillBtn.addEventListener('click', doSubmit);
    fillInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSubmit(); });
    setTimeout(() => fillInput.focus(), 400);
  } else {
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.text;
      btn.setAttribute('role','radio');
      btn.addEventListener('click', () => selectOption(i));
      optionsList.appendChild(btn);
    });
  }
}

function selectOption(idx) {
  if (STATE.isLocked) return;
  STATE.isLocked = true;

  const q = QUESTIONS[STATE.currentIndex];
  const opt = q.options[idx];

  // 高亮+锁定UI
  const allBtns = optionsList.querySelectorAll('.option-btn');
  allBtns.forEach((btn, i) => {
    btn.classList.add('locked');
    if (i === idx) btn.classList.add('selected');
  });

  // 累加特质向量
  for (let d = 0; d < 6; d++) {
    STATE.traits[d] += opt.traits[d];
  }

  STATE.answers.push({ questionId: q.id, optionIndex: idx });
  saveProgress();

  setTimeout(() => {
    STATE.currentIndex++;
    if (STATE.currentIndex >= QUESTIONS.length) {
      clearProgress();
      showResult();
    } else {
      renderQuestion();
    }
  }, 350);
}

function goPrev() {
  if (STATE.currentIndex <= 0 || STATE.answers.length === 0) return;
  // 撤销最后一题的得分
  const lastAnswer = STATE.answers.pop();
  const lastQ = QUESTIONS.find(q => q.id === lastAnswer.questionId);
  if (lastQ && lastQ.type === 'fill') {
    // 填空题：清空家乡记录即可
    STATE.hometown = '';
  } else if (lastQ) {
    const lastOpt = lastQ.options[lastAnswer.optionIndex];
    if (lastOpt) {
      for (let d = 0; d < 6; d++) {
        STATE.traits[d] -= lastOpt.traits[d];
      }
    }
  }
  STATE.currentIndex--;
  saveProgress();
  renderQuestion();
}

// ==================== 结果计算 ====================
function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// 热门球队加权（余弦相似度叠加，小幅提权避免小球队随机胜出）
const POPULARITY_BONUS = {
  ac_milan:0.008,,
  ajax:0.008,,
  al_hilal:0.004,,
  al_ittihad:0.004,,
  al_nassr:0.004,,
  anderlecht:0.004,,
  arsenal:0.012,,
  aston_villa:0.004,,
  atalanta:0.004,,
  athletic_bilbao:0.004,,
  atletico:0.008,,
  barcelona:0.012,,
  bayern:0.012,,
  beijing_guoan:0.008,,
  benfica:0.008,,
  blackburn:0.004,,
  boca_juniors:0.004,,
  bournemouth:0.004,,
  brentford:0.004,,
  brighton:0.004,,
  cangzhou:0.008,,
  celtic:0.004,,
  changchun_yatai:0.008,,
  charlton:0.004,,
  chelsea:0.008,,
  chengdu_rongcheng:0.008,,
  club_brugge:0.004,,
  copenhagen:0.004,,
  coventry:0.004,,
  crystal_palace:0.004,,
  deportivo:0.004,,
  dortmund:0.008,,
  everton:0.004,,
  fenerbahce:0.004,,
  feyenoord:0.004,,
  fiorentina:0.004,,
  frankfurt:0.004,,
  freiburg:0.004,,
  fulham:0.004,,
  galatasaray:0.004,,
  girona:0.004,,
  gladbach:0.004,,
  guangzhou:0.008,,
  hamburg:0.004,,
  henan:0.008,,
  hull_city:0.004,,
  inter_miami:0.004,,
  inter_milan:0.008,,
  ipswich:0.004,,
  juventus:0.008,,
  kaiserslautern:0.004,,
  lafc:0.004,,
  lazio:0.004,,
  leeds:0.004,,
  leicester_city:0.004,,
  leverkusen:0.004,,
  liaoning_tieren:0.008,,
  lille:0.004,,
  liverpool:0.012,,
  lyon:0.004,,
  man_city:0.012,,
  man_utd:0.012,,
  marseille:0.004,,
  meizhou_hakka:0.008,,
  monaco:0.004,,
  nantong_zhiyun:0.008,,
  napoli:0.004,,
  newcastle:0.004,,
  nottm_forest:0.004,,
  porto:0.008,,
  psg:0.012,,
  psv:0.004,,
  qingdao_hainiu:0.008,,
  rangers:0.004,,
  rb_leipzig:0.004,,
  real_betis:0.004,,
  real_madrid:0.012,,
  real_sociedad:0.004,,
  roma:0.004,,
  saint_etienne:0.004,,
  salzburg:0.004,,
  schalke:0.004,,
  sevilla:0.004,,
  shakhtar:0.004,,
  shandong_taishan:0.008,,
  shanghai_port:0.008,,
  shanghai_shenhua:0.008,,
  sheff_wed:0.004,,
  shenzhen_peng:0.008,,
  southampton:0.004,,
  sporting_cp:0.004,,
  stuttgart:0.004,,
  sunderland:0.004,,
  tianjin_jinmen:0.008,,
  tottenham:0.008,,
  valencia:0.004,,
  villarreal:0.004,,
  werder_bremen:0.004,,
  west_ham:0.004,,
  wolfsburg:0.004,,
  wolves:0.004,,
  wuhan_three_towns:0.008,,
  zhejiang:0.012
};

// 人设-俱乐部候选池 (T1=70%核心豪门, T2=20%次级目标)
// 层级定义
const TIER1_CLUBS = [
    'man_city',
    'real_madrid',
    'barcelona',
    'man_utd',
    'arsenal',
    'psg',
    'bayern',
    'zhejiang',
    'liverpool',
    'atletico'
  ];
const TIER2_CLUBS = [
    'chelsea',
    'dortmund',
    'juventus',
    'ac_milan',
    'inter_milan',
    'tottenham',
    'ajax',
    'porto',
    'benfica',
    'shanghai_port',
    'shanghai_shenhua',
    'beijing_guoan',
    'shandong_taishan',
    'chengdu_rongcheng',
    'wuhan_three_towns',
    'tianjin_jinmen',
    'changchun_yatai',
    'henan',
    'shenzhen_peng',
    'qingdao_hainiu',
    'nantong_zhiyun',
    'cangzhou',
    'meizhou_hakka',
    'guangzhou',
    'liaoning_tieren'
  ];
const TIER3_CLUBS = [
    'aston_villa',
    'bournemouth',
    'brentford',
    'brighton',
    'coventry',
    'crystal_palace',
    'everton',
    'fulham',
    'hull_city',
    'ipswich',
    'leeds',
    'newcastle',
    'nottm_forest',
    'sunderland',
    'athletic_bilbao',
    'sevilla',
    'real_sociedad',
    'real_betis',
    'villarreal',
    'valencia',
    'girona',
    'leverkusen',
    'rb_leipzig',
    'frankfurt',
    'gladbach',
    'stuttgart',
    'wolfsburg',
    'werder_bremen',
    'freiburg',
    'napoli',
    'roma',
    'atalanta',
    'lazio',
    'fiorentina',
    'marseille',
    'lyon',
    'monaco',
    'lille',
    'psv',
    'feyenoord',
    'sporting_cp',
    'celtic',
    'rangers',
    'galatasaray',
    'fenerbahce',
    'anderlecht',
    'club_brugge',
    'shakhtar',
    'salzburg',
    'copenhagen',
    'al_hilal',
    'al_nassr',
    'al_ittihad',
    'inter_miami',
    'lafc',
    'boca_juniors',
    'schalke',
    'hamburg',
    'charlton',
    'blackburn',
    'deportivo',
    'saint_etienne',
    'sheff_wed',
    'kaiserslautern',
    'leicester_city',
    'west_ham',
    'wolves',
    'southampton'
  ];
const ALL_CLUBS_ARR = [
    'man_city',
    'real_madrid',
    'barcelona',
    'man_utd',
    'arsenal',
    'psg',
    'bayern',
    'zhejiang',
    'liverpool',
    'chelsea',
    'dortmund',
    'juventus',
    'ac_milan',
    'inter_milan',
    'tottenham',
    'ajax',
    'porto',
    'benfica',
    'shanghai_port',
    'shanghai_shenhua',
    'beijing_guoan',
    'shandong_taishan',
    'chengdu_rongcheng',
    'wuhan_three_towns',
    'tianjin_jinmen',
    'changchun_yatai',
    'henan',
    'shenzhen_peng',
    'qingdao_hainiu',
    'nantong_zhiyun',
    'cangzhou',
    'meizhou_hakka',
    'guangzhou',
    'liaoning_tieren',
    'aston_villa',
    'bournemouth',
    'brentford',
    'brighton',
    'coventry',
    'crystal_palace',
    'everton',
    'fulham',
    'hull_city',
    'ipswich',
    'leeds',
    'newcastle',
    'nottm_forest',
    'sunderland',
    'athletic_bilbao',
    'sevilla',
    'real_sociedad',
    'real_betis',
    'villarreal',
    'valencia',
    'girona',
    'leverkusen',
    'rb_leipzig',
    'frankfurt',
    'gladbach',
    'stuttgart',
    'wolfsburg',
    'werder_bremen',
    'freiburg',
    'napoli',
    'roma',
    'atalanta',
    'lazio',
    'fiorentina',
    'marseille',
    'lyon',
    'monaco',
    'lille',
    'psv',
    'feyenoord',
    'sporting_cp',
    'celtic',
    'rangers',
    'galatasaray',
    'fenerbahce',
    'anderlecht',
    'club_brugge',
    'shakhtar',
    'salzburg',
    'copenhagen',
    'al_hilal',
    'al_nassr',
    'al_ittihad',
    'inter_miami',
    'lafc',
    'boca_juniors',
    'schalke',
    'hamburg',
    'charlton',
    'blackburn',
    'deportivo',
    'saint_etienne',
    'sheff_wed',
    'kaiserslautern',
    'leicester_city',
    'west_ham',
    'wolves',
    'southampton'
  ];

// 确定性层级 + 人设匹配：人设+答案特质决定层级（无随机抽签），人设决定池内可选球队
// T3独享池保证小球队有20%的出现机会
// 人设→俱乐部映射：每个人设在每个层级有对应的候选球队
const PERSONA_TIER_CLUBS = {
  // ===== GLORY HUNTER: 追求荣誉与冠军 =====
  'glory_hunter': {
    t1: ['real_madrid', 'bayern', 'psg', 'man_city', 'barcelona', 'zhejiang'],
    t2: ['juventus', 'ac_milan', 'chelsea', 'inter_milan', 'atletico'],
    t3: ['leverkusen', 'sevilla', 'al_hilal', 'al_nassr', 'inter_miami', 'nottm_forest', 'hamburg']
  },
  // ===== FIGHTER SPIRIT: 铁血斗志 =====
  'fighter_spirit': {
    t1: ['liverpool', 'man_utd', 'bayern', 'real_madrid', 'atletico'],
    t2: ['atletico', 'dortmund', 'inter_milan', 'chelsea', 'ac_milan'],
    t3: ['leeds', 'kaiserslautern', 'sunderland', 'schalke', 'boca_juniors', 'galatasaray', 'celtic', 'coventry']
  },
  // ===== HOMETOWN PRIDE: 家乡归属感 =====
  'hometown_pride': {
    t1: ['zhejiang', 'liverpool', 'man_utd', 'arsenal'],
    t2: ['shanghai_port', 'shanghai_shenhua', 'beijing_guoan', 'shandong_taishan',
         'chengdu_rongcheng', 'wuhan_three_towns', 'tianjin_jinmen', 'changchun_yatai',
         'henan', 'shenzhen_peng', 'qingdao_hainiu', 'nantong_zhiyun',
         'cangzhou', 'meizhou_hakka', 'guangzhou', 'liaoning_tieren'],
    t3: ['crystal_palace', 'coventry', 'charlton', 'hull_city', 'ipswich', 'blackburn',
         'everton', 'newcastle', 'west_ham', 'roma', 'lazio']
  },
  // ===== ACADEMY BELIEVER: 信仰青训 =====
  'academy_believer': {
    t1: ['barcelona', 'arsenal', 'man_city'],
    t2: ['ajax', 'benfica', 'porto', 'dortmund', 'tottenham'],
    t3: ['sporting_cp', 'brighton', 'anderlecht', 'salzburg', 'athletic_bilbao',
         'southampton', 'lyon', 'monaco', 'psv', 'feyenoord', 'rb_leipzig']
  },
  // ===== FAN CULTURE: 死忠球迷文化 =====
  'fan_culture': {
    t1: ['man_utd', 'liverpool', 'real_madrid', 'man_city', 'atletico'],
    t2: ['dortmund', 'chengdu_rongcheng', 'inter_milan', 'ac_milan', 'chelsea'],
    t3: ['boca_juniors', 'celtic', 'galatasaray', 'fenerbahce', 'newcastle',
         'west_ham', 'marseille', 'everton', 'leeds', 'crystal_palace', 'roma', 'lazio']
  },
  // ===== TACTICS NERD: 战术狂人 =====
  'tactics_nerd': {
    t1: ['man_city', 'barcelona', 'arsenal', 'bayern'],
    t2: ['juventus', 'atletico', 'tottenham', 'ajax', 'chelsea', 'dortmund'],
    t3: ['brentford', 'atalanta', 'rb_leipzig', 'lille', 'villarreal',
         'brighton', 'girona', 'leverkusen', 'napoli']
  },
  // ===== BALANCED FAN: 均衡型球迷 =====
  'balanced_fan': {
    t1: ['real_madrid', 'liverpool', 'man_city', 'barcelona', 'man_utd', 'arsenal', 'bayern', 'psg', 'zhejiang', 'atletico'],
    t2: ['chelsea', 'dortmund', 'juventus', 'ac_milan', 'inter_milan', 'atletico',
         'tottenham', 'ajax', 'porto', 'benfica', 'shanghai_port', 'shanghai_shenhua',
         'beijing_guoan', 'shandong_taishan', 'chengdu_rongcheng'],
    t3: ['everton', 'aston_villa', 'newcastle', 'west_ham', 'leicester_city',
         'valencia', 'sevilla', 'roma', 'napoli', 'marseille', 'lyon',
         'psv', 'celtic', 'leverkusen', 'rb_leipzig', 'atalanta', 'boca_juniors']
  },
  // ===== GLORY+SPIRIT: 荣誉+斗志组合 =====
  'glory_spirit': {
    t1: ['real_madrid', 'liverpool', 'man_utd', 'bayern', 'psg', 'atletico'],
    t2: ['inter_milan', 'ac_milan', 'dortmund', 'atletico', 'chelsea', 'juventus'],
    t3: ['leicester_city', 'leeds', 'nottingham_forest', 'newcastle', 'schalke',
         'hamburg', 'deportivo', 'sevilla', 'nottm_forest']
  },
  // ===== HOMETOWN+ACADEMY: 本土+青训 =====
  'hometown_academy': {
    t1: ['arsenal', 'barcelona', 'zhejiang', 'man_city', 'atletico'],
    t2: ['ajax', 'porto', 'benfica', 'shanghai_port', 'shanghai_shenhua',
         'beijing_guoan', 'shandong_taishan', 'chengdu_rongcheng', 'dortmund'],
    t3: ['athletic_bilbao', 'brighton', 'sporting_cp', 'anderlecht', 'salzburg',
         'lyon', 'monaco', 'feyenoord', 'real_sociedad', 'psv']
  },
  // ===== FANS+TACTICS: 球迷文化+战术 =====
  'fans_tactics': {
    t1: ['liverpool', 'man_city', 'arsenal', 'barcelona', 'man_utd', 'atletico'],
    t2: ['dortmund', 'tottenham', 'ajax', 'atletico', 'chelsea', 'chengdu_rongcheng'],
    t3: ['napoli', 'brentford', 'atalanta', 'rb_leipzig', 'boca_juniors',
         'feyenoord', 'villarreal', 'celtic', 'marseille', 'newcastle']
  }
};

// 确定性层级分配：基于用户答案特质向量的哈希值，无随机抽签
// 同样的答案 → 同样的人设 → 同样的层级 → 同样的结果（可复现）
function getDeterministicTier(personaType, userVec) {
  // 用特质向量的哈希值代替 Math.random()——答案驱动，非随机
  const hashInput = userVec.map(v => Math.round(v * 10) / 10).join(',');
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    hash = ((hash << 5) - hash) + hashInput.charCodeAt(i);
    hash |= 0;
  }
  const deterministicRoll = Math.abs(hash % 100) / 100;

  // 各人设类型的层级分配比例（加总为1.0）
  // 经过模拟调优，确保总体 50/30/20 分布
  const personaTierSplit = {
    'glory_hunter':      { t1: 0.60, t2: 0.26, t3: 0.14 },
    'fighter_spirit':    { t1: 0.60, t2: 0.26, t3: 0.14 },
    'tactics_nerd':      { t1: 0.60, t2: 0.26, t3: 0.14 },
    'academy_believer':  { t1: 0.56, t2: 0.30, t3: 0.14 },
    'fan_culture':       { t1: 0.49, t2: 0.34, t3: 0.17 },
    'glory_spirit':      { t1: 0.56, t2: 0.30, t3: 0.14 },
    'hometown_pride':    { t1: 0.11, t2: 0.57, t3: 0.32 },
    'hometown_academy':  { t1: 0.13, t2: 0.49, t3: 0.38 },
    'fans_tactics':      { t1: 0.49, t2: 0.34, t3: 0.17 },
    'balanced_fan':      { t1: 0.09, t2: 0.39, t3: 0.52 },
  };

  const split = personaTierSplit[personaType] || personaTierSplit['balanced_fan'];
  if (deterministicRoll < split.t1) return 't1';
  if (deterministicRoll < split.t1 + split.t2) return 't2';
  return 't3';
}

function getEligibleClubs(personaType, userVec) {
  const tier = getDeterministicTier(personaType, userVec);
  const mapping = PERSONA_TIER_CLUBS[personaType] || PERSONA_TIER_CLUBS['balanced_fan'];
  return { keys: mapping[tier] || [], tier: tier };
}



// 人设检测：根据用户特质向量推断人设类型
function detectPersona(userVec) {
  const labels = ['honor','spirit','hometown','academy','fans','tactics'];
  const indexed = userVec.map((v,i) => ({val:v, idx:i, label:labels[i]}));
  indexed.sort((a,b) => b.val - a.val);
  const gap = indexed[0].val - indexed[1].val;  // gap between #1 and #2
  const t1 = indexed[0].label;
  const t2 = indexed[1].label;

  // Large gap (>2.0): single dominant dimension
  if (gap > 2.0) {
    if (t1 === 'honor')   return 'glory_hunter';
    if (t1 === 'spirit')  return 'fighter_spirit';
    if (t1 === 'hometown') return 'hometown_pride';
    if (t1 === 'academy') return 'academy_believer';
    if (t1 === 'fans')    return 'fan_culture';
    if (t1 === 'tactics') return 'tactics_nerd';
  }

  // Moderate gap (1.0-2.0): two dimensions co-dominant
  if (gap > 1.0) {
    const pair = [t1,t2].sort().join('+');
        const pairMap = {
      'academy+fans': 'academy_believer',
      'academy+hometown': 'hometown_academy',
      'academy+spirit': 'fighter_spirit',
      'academy+tactics': 'academy_believer',
      'fans+honor': 'glory_hunter',
      'fans+hometown': 'hometown_pride',
      'fans+spirit': 'fan_culture',
      'fans+tactics': 'fans_tactics',
      'honor+hometown': 'hometown_pride',
      'honor+spirit': 'glory_spirit',
      'honor+tactics': 'glory_hunter',
      'hometown+spirit': 'hometown_pride',
      'hometown+tactics': 'hometown_pride',
      'spirit+tactics': 'balanced_fan',
    };
    if (pairMap[pair]) return pairMap[pair];
  }

  // Small gap (<1.0): balanced profile
  return 'balanced_fan';
}



function showResult() {
  // 计算用户特质向量（min-max 归一化：最高=100%，最低≈0%，自然分布）
  const minTrait = Math.min(...STATE.traits);
  const maxTrait = Math.max(...STATE.traits, 1);
  const range = (maxTrait - minTrait) || 1;
  const userVec = STATE.traits.map(v => ((v - minTrait) / range) * 5);

  // 家乡球队匹配：从输入中匹配省份关键词
  let hometownClubs = [];
  if (STATE.hometown) {
    for (const [prov, keys] of Object.entries(PROVINCE_CLUB_MAP)) {
      if (STATE.hometown.includes(prov)) { hometownClubs.push(...keys); break; }
    }
  }

  // 人设检测：确定用户属于哪种球迷类型
  const personaType = detectPersona(userVec);
  const { keys: eligibleKeys, tier: assignedTier } = getEligibleClubs(personaType, userVec);
  const eligibleClubs = CLUBS.filter(c => eligibleKeys.includes(c.key));

  // ===== 加权随机选择（确定性，由答案特质哈希驱动） =====
  // 不使用 argmax（总是选最高分），因为那会导致某些球队永远不出现
  // 改用加权随机：余弦相似度越高，被选中概率越大，但所有候选球队都有机会
  // 哈希值由用户答案决定 → 同样答案永远得到同样结果

  // 第一步：计算每个俱乐部的余弦相似度和权重
  const clubWeights = eligibleClubs.map(club => {
    const cos = cosineSimilarity(userVec, club.vector);
    let weight = Math.pow(Math.max(cos, 0.4), 2); // cos^2 放大差异（比cos^3更均衡）
    weight += POPULARITY_BONUS[club.key] || 0;
    if (hometownClubs.includes(club.key)) weight += HOMETOWN_BONUS;
    return { club, weight: weight, cos: cos };
  });

  // 第二步：用特质哈希生成确定性随机数，做加权选择
  const hashInput = userVec.map(v => Math.round(v * 10) / 10).join(',');
  let clubHash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    clubHash = ((clubHash << 5) - clubHash) + hashInput.charCodeAt(i);
    clubHash |= 0;
  }
  const clubRoll = Math.abs((clubHash * 31 + 7) % 10000) / 10000;

  const totalWeight = clubWeights.reduce((sum, cw) => sum + cw.weight, 0);
  let cumulative = 0;
  let selectedEntry = clubWeights[0];
  for (const cw of clubWeights) {
    cumulative += cw.weight / totalWeight;
    if (clubRoll < cumulative) {
      selectedEntry = cw;
      break;
    }
  }

  // 构建结果列表（选中的排第一，其余按余弦排列展示"你可能也喜欢"）
  const results = eligibleClubs.map(club => {
    const cos = cosineSimilarity(userVec, club.vector);
    let bonus = POPULARITY_BONUS[club.key] || 0;
    if (hometownClubs.includes(club.key)) bonus += HOMETOWN_BONUS;
    return { club, similarity: cos + bonus + Math.random() * 0.005 };
  });
  results.sort((a, b) => b.similarity - a.similarity);

  // 确保选中的俱乐部排在第一位
  const topIdx = results.findIndex(r => r.club.key === selectedEntry.club.key);
  if (topIdx > 0) {
    const [top] = results.splice(topIdx, 1);
    results.unshift(top);
  }

  const top = results[0];
  const runnerUps = results.slice(1, 4);

  // 匹配度（映射到60-99%）
  const rawPct = Math.round(top.similarity * 100);
  const displayPct = Math.min(99, Math.max(60, rawPct));

  // 渲染
  // 渲染球队配色条
  const color = CLUB_COLORS[top.club.key] || '#888';
  clubColorStrip.style.background = `linear-gradient(90deg, ${color}, ${lightenColor(color)}, ${color})`;
  // 结果卡片 glow 改成球队色
  const resultCard = $('#result-card');
  resultCard.style.boxShadow = `0 8px 40px rgba(${hexToRgb(color)},0.2), 0 0 0 1px rgba(${hexToRgb(color)},0.15)`;

  matchPercent.textContent = displayPct + '%';
  clubName.textContent = top.club.name;
  clubIntro.textContent = top.club.intro;

  reasonsList.innerHTML = '';
  top.club.reasons.forEach(r => {
    const tag = document.createElement('span');
    tag.className = 'reason-tag';
    tag.textContent = r;
    reasonsList.appendChild(tag);
  });

  drawRadarChart(userVec);
  renderAlsoLike(runnerUps, displayPct);
  showPage(pageResult);
}

// ==================== 颜色工具 ====================
function lightenColor(hex) {
  const c = hex.replace('#','');
  const r = Math.min(255, parseInt(c.substring(0,2),16) + 50);
  const g = Math.min(255, parseInt(c.substring(2,4),16) + 50);
  const b = Math.min(255, parseInt(c.substring(4,6),16) + 50);
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
function hexToRgb(hex) {
  const c = hex.replace('#','');
  return `${parseInt(c.substring(0,2),16)},${parseInt(c.substring(2,4),16)},${parseInt(c.substring(4,6),16)}`;
}
function contrastColor(hex) {
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
  return lum > 0.55 ? '#1a1a2e' : '#ffffff';
}

// ==================== 雷达图 ====================
function drawRadarChart(userVec) {
  const canvas = radarCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const radius = 110;
  const n = 6; // 6维度

  ctx.clearRect(0, 0, W, H);

  // 绘制5层同心六边形网格
  for (let level = 1; level <= 5; level++) {
    const r = (radius / 5) * level;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 绘制6条轴线
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.stroke();
  }

  // 绘制6维标签
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '12px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const lr = radius + 22;
    const lx = cx + lr * Math.cos(angle);
    const ly = cy + lr * Math.sin(angle);
    ctx.fillText(DIM_LABELS[i], lx, ly);
  }

  // 绘制用户数据填充区域
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const val = Math.max(0.05, userVec[i] / 5);
    const x = cx + radius * val * Math.cos(angle);
    const y = cy + radius * val * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(245,215,66,0.2)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(245,215,66,0.7)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 绘制数据点
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    const val = Math.max(0.05, userVec[i] / 5);
    const x = cx + radius * val * Math.cos(angle);
    const y = cy + radius * val * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#f5d742';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// ==================== 推荐球队 ====================
function renderAlsoLike(runnerUps, topPct) {
  if (runnerUps.length === 0) {
    alsoLikeSection.style.display = 'none';
    return;
  }
  alsoLikeSection.style.display = '';
  alsoLikeList.innerHTML = '';
  runnerUps.forEach(ru => {
    const pct = Math.round(ru.similarity * 100);
    const display = Math.min(topPct - 1, Math.max(40, pct));
    const color = CLUB_COLORS[ru.club.key] || '#888';
    const card = document.createElement('div');
    card.className = 'also-club-card';
    card.innerHTML = `
      <div class="also-color-dot" style="background:linear-gradient(135deg,${color},${lightenColor(color)});"></div>
      <div class="also-name">${ru.club.name}</div>
      <div class="also-match">${display}% 匹配</div>
    `;
    alsoLikeList.appendChild(card);
  });
}

// ==================== 返回 / 重测 ====================
async function handleBack() {
  const ok = await showModal('确定要放弃本次测试吗？进度将会丢失。');
  if (ok) {
    STATE.currentIndex = 0; STATE.traits = [0,0,0,0,0,0]; STATE.answers = []; STATE.hometown = '';
    clearProgress();
    showPage(pageStart);
    initStartPage();
  }
}
async function handleRetry() {
  const ok = await showModal('确定要重新测试吗？当前结果将被清除。');
  if (ok) {
    STATE.currentIndex = 0; STATE.traits = [0,0,0,0,0,0]; STATE.answers = []; STATE.hometown = '';
    clearProgress();
    renderQuestion();
    showPage(pageQuiz);
  }
}
// ==================== 事件绑定 ====================
btnStart.addEventListener('click', startNewQuiz);
btnResume.addEventListener('click', resumeQuiz);
btnBack.addEventListener('click', handleBack);
btnPrev.addEventListener('click', goPrev);
btnRetry.addEventListener('click', handleRetry);
modalCancel.addEventListener('click', () => {
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden','true');
});

// ==================== 初始化 ====================
function init() {
  STATE.traits = [0,0,0,0,0,0];
  STATE.hometown = '';
  totalNumEl.textContent = QUESTIONS.length;
  initStartPage();
  showPage(pageStart);
}
init();
