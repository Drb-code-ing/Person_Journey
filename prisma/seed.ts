/**
 * 从 OpenFlights 数据导入真实航线和目的地
 * 数据来源：https://github.com/jpatokal/openflights (ODbL License)
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/* ─── 中文城市/国家映射 ─── */

const CITY_CN: Record<string, string> = {
  'Shanghai': '上海', 'Beijing': '北京', 'Guangzhou': '广州', 'Shenzhen': '深圳',
  'Chengdu': '成都', 'Hangzhou': '杭州', 'Nanjing': '南京', 'Wuhan': '武汉',
  'Chongqing': '重庆', 'Xiamen': '厦门', 'Kunming': '昆明', 'Xi An': '西安',
  'Paris': '巴黎', 'London': '伦敦', 'Tokyo': '东京', 'Seoul': '首尔',
  'New York': '纽约', 'Los Angeles': '洛杉矶', 'San Francisco': '旧金山',
  'Sydney': '悉尼', 'Melbourne': '墨尔本', 'Dubai': '迪拜', 'Singapore': '新加坡',
  'Bangkok': '曼谷', 'Osaka': '大阪', 'Kyoto': '京都', 'Rome': '罗马',
  'Milan': '米兰', 'Venice': '威尼斯', 'Barcelona': '巴塞罗那', 'Madrid': '马德里',
  'Berlin': '柏林', 'Munich': '慕尼黑', 'Vienna': '维也纳', 'Prague': '布拉格',
  'Budapest': '布达佩斯', 'Istanbul': '伊斯坦布尔', 'Athens': '雅典',
  'Amsterdam': '阿姆斯特丹', 'Brussels': '布鲁塞尔', 'Zurich': '苏黎世',
  'Geneva': '日内瓦', 'Helsinki': '赫尔辛基', 'Stockholm': '斯德哥尔摩',
  'Oslo': '奥斯陆', 'Copenhagen': '哥本哈根', 'Dublin': '都柏林',
  'Edinburgh': '爱丁堡', 'Lisbon': '里斯本', 'Hanoi': '河内',
  'Ho Chi Minh City': '胡志明市', 'Bali': '巴厘岛', 'Denpasar': '巴厘岛',
  'Phuket': '普吉岛', 'Maldives': '马尔代夫', 'Male': '马尔代夫',
  'Cairo': '开罗', 'Marrakech': '马拉喀什', 'Cape Town': '开普敦',
  'Nairobi': '内罗毕', 'Dar Es Salaam': '达累斯萨拉姆', 'Zanzibar': '桑给巴尔',
  'Reykjavik': '雷克雅未克', 'Santorini': '圣托里尼', 'Mykonos': '米科诺斯',
  'Nice': '尼斯', 'Lyon': '里昂', 'Florence': '佛罗伦萨', 'Naples': '那不勒斯',
  'Santorini Island': '圣托里尼', 'Split': '斯普利特', 'Dubrovnik': '杜布罗夫尼克',
  'Bergen': '卑尔根', 'Tromsoe': '特罗姆瑟',
  'Tromsø': '特罗姆瑟', 'Lucerne': '卢塞恩',
  'Interlaken': '因特拉肯', 'Queenstown': '皇后镇', 'Auckland': '奥克兰',
  'Honolulu': '火奴鲁鲁', 'Las Vegas': '拉斯维加斯', 'Miami': '迈阿密',
  'Malé': '马尔代夫', 'Colombo': '科伦坡', 'Kathmandu': '加德满都',
  'Siem Reap': '暹粒', 'Phnom Penh': '金边', 'Boracay': '长滩岛',
  'Buenos Aires': '布宜诺斯艾利斯', 'Lima': '利马', 'Rio de Janeiro': '里约热内卢',
  'Havana': '哈瓦那', 'Seychelles': '塞舌尔',
  'Mauritius': '毛里求斯', 'Hokkaido': '北海道', 'Cappadocia': '卡帕多奇亚',
  'Bruges': '布鲁日', 'Hallstatt': '哈尔施塔特',
  'Abu Dhabi': '阿布扎比', 'Petra': '佩特拉', 'Rajasthan': '拉贾斯坦',
  'Goa': '果阿', 'Sri Lanka': '斯里兰卡', 'Luang Prabang': '琅勃拉邦',
  'Bagan': '蒲甘', 'Samarkand': '撒马尔罕', 'Fiji': '斐济',
  'Tahiti': '大溪地', 'Costa Rica': '哥斯达黎加', 'Galápagos': '加拉帕戈斯',
  'Santiago': '圣地亚哥', 'Cartagena': '卡塔赫纳', 'Serengeti': '塞伦盖蒂',
  'Victoria Falls': '维多利亚瀑布', 'Madagascar': '马达加斯加',
};

const COUNTRY_CN: Record<string, string> = {
  'China': '中国', 'France': '法国', 'United Kingdom': '英国', 'Japan': '日本',
  'South Korea': '韩国', 'United States': '美国', 'Australia': '澳大利亚',
  'United Arab Emirates': '阿联酋', 'Singapore': '新加坡', 'Thailand': '泰国',
  'Italy': '意大利', 'Spain': '西班牙', 'Germany': '德国', 'Austria': '奥地利',
  'Czech Republic': '捷克', 'Hungary': '匈牙利', 'Turkey': '土耳其',
  'Greece': '希腊', 'Netherlands': '荷兰', 'Belgium': '比利时',
  'Switzerland': '瑞士', 'Finland': '芬兰', 'Sweden': '瑞典',
  'Norway': '挪威', 'Denmark': '丹麦', 'Ireland': '爱尔兰',
  'Portugal': '葡萄牙', 'Vietnam': '越南', 'Indonesia': '印尼',
  'Maldives': '马尔代夫', 'Egypt': '埃及', 'Morocco': '摩洛哥',
  'South Africa': '南非', 'Kenya': '肯尼亚', 'Tanzania': '坦桑尼亚',
  'Iceland': '冰岛', 'Croatia': '克罗地亚', 'New Zealand': '新西兰',
  'Sri Lanka': '斯里兰卡', 'Nepal': '尼泊尔', 'Cambodia': '柬埔寨',
  'Philippines': '菲律宾', 'Malaysia': '马来西亚', 'India': '印度',
  'Mexico': '墨西哥', 'Brazil': '巴西', 'Argentina': '阿根廷',
  'Peru': '秘鲁', 'Chile': '智利', 'Canada': '加拿大',
  'Cuba': '古巴', 'Seychelles': '塞舌尔', 'Mauritius': '毛里求斯',
  'Jordan': '约旦',
  'Laos': '老挝', 'Myanmar': '缅甸', 'Uzbekistan': '乌兹别克斯坦',
  'Fiji': '斐济', 'French Polynesia': '法属波利尼西亚',
  'Costa Rica': '哥斯达黎加', 'Ecuador': '厄瓜多尔',
  'Colombia': '哥伦比亚', 'Zimbabwe': '津巴布韦', 'Madagascar': '马达加斯加',
};

/* ─── 精选奢华目的地 ─── */
// 注意：价格由 AI 实时估算，种子数据不存储价格

const LUXURY_DESTINATIONS: Record<string, {
  desc: string; bestTime: string; visa: string; days: number;
}> = {
  'Paris': { desc: '光之城——埃菲尔铁塔、卢浮宫、塞纳河畔的浪漫之旅。米其林三星餐厅与高定时装的发源地。', bestTime: '4月-10月', visa: '申根签证', days: 8 },
  'London': { desc: '泰晤士河畔的皇家之城，白金汉宫与大英博物馆的深厚底蕴。下午茶与西区剧院的英式优雅。', bestTime: '5月-9月', visa: '英国签证', days: 8 },
  'Tokyo': { desc: '传统与未来交融的东方之都。从浅草寺的晨钟到银座的霓虹，寿司之神与樱花季的极致体验。', bestTime: '3月-5月', visa: '免签/15天', days: 7 },
  'Rome': { desc: '永恒之城，古罗马斗兽场到梵蒂冈的艺术殿堂。罗马假日的浪漫与意大利美食的巅峰。', bestTime: '4月-6月', visa: '申根签证', days: 7 },
  'Santorini': { desc: '爱琴海上的蓝白童话。伊亚日落被誉为世界最美，火山温泉与悬崖酒店的极致浪漫。', bestTime: '5月-10月', visa: '申根签证', days: 7 },
  'Barcelona': { desc: '高迪建筑的奇幻之城，兰布拉大道的热情与加泰罗尼亚美食的创意碰撞。', bestTime: '5月-6月', visa: '申根签证', days: 7 },
  'Dubai': { desc: '沙漠中崛起的未来之城。哈利法塔的云端晚餐、沙漠冲沙与全球最大的购物中心。', bestTime: '11月-3月', visa: '免签/30天', days: 6 },
  'Bali': { desc: '千庙之岛的灵性之旅。乌布梯田、海神庙日落、私人泳池别墅与巴厘SPA的身心洗礼。', bestTime: '4月-10月', visa: '免签/30天', days: 8 },
  'Maldives': { desc: '印度洋上的珍珠项链。水上别墅、珊瑚花园、私人沙滩——地球上最接近天堂的地方。', bestTime: '11月-4月', visa: '免签/30天', days: 6 },
  'Reykjavik': { desc: '冰与火之地。蓝湖温泉、北极光、冰川徒步与间歇泉——地球最超现实的风景。', bestTime: '6月-8月', visa: '申根签证', days: 8 },
  'Oslo': { desc: '峡湾之国的起点。维京船博物馆、北极光观测与挪威森林的原始之美。', bestTime: '6月-9月', visa: '申根签证', days: 8 },
  'Dubrovnik': { desc: '亚得里亚海的珍珠。中世纪城墙、红顶老城与《权力的游戏》取景地。', bestTime: '5月-9月', visa: '申根签证', days: 7 },
  'Marrakech': { desc: '北非的神秘之都。马拉喀什集市的香料气息、撒哈拉骆驼之旅与摩洛哥庭院的精致。', bestTime: '10月-4月', visa: '免签/90天', days: 8 },
  'Cape Town': { desc: '非洲大陆的尽头。桌山日出、好望角企鹅、斯泰伦博斯酒庄与多元文化的融合。', bestTime: '11月-3月', visa: '免签/30天', days: 9 },
  'Sydney': { desc: '南半球的闪耀之星。悉尼歌剧院、蓝山国家公园、邦迪海滩与猎人谷酒庄。', bestTime: '10月-4月', visa: '电子签', days: 10 },
  'New York': { desc: '世界之都。百老汇、中央公园、大都会博物馆与第五大道——永不沉睡的城市。', bestTime: '4月-6月', visa: '美国签证', days: 8 },
  'Kyoto': { desc: '千年古都的东方美学。金阁寺、竹林小径、艺伎文化与怀石料理的极致。', bestTime: '3月-5月', visa: '免签/15天', days: 7 },
  'Bangkok': { desc: '微笑之国的璀璨首都。大皇宫、水上市场、泰式按摩与街头美食的天堂。', bestTime: '11月-2月', visa: '免签/30天', days: 6 },
  'Singapore': { desc: '花园城市的精致典范。滨海湾金沙、牛车水美食、圣淘沙与夜间动物园。', bestTime: '全年', visa: '免签/30天', days: 5 },
  'Istanbul': { desc: '横跨欧亚的文明交汇。蓝色清真寺、大巴扎、博斯普鲁斯海峡与土耳其浴。', bestTime: '4月-6月', visa: '电子签', days: 7 },
  'Seoul': { desc: '韩流文化的中心。景福宫、明洞购物、韩式汗蒸与米其林韩定食。', bestTime: '3月-5月', visa: '免签/90天', days: 5 },
  'Vienna': { desc: '音乐之都的古典优雅。美泉宫、国家歌剧院、萨赫蛋糕与维也纳咖啡文化。', bestTime: '4月-10月', visa: '申根签证', days: 6 },
  'Prague': { desc: '千塔之城的童话。查理大桥、布拉格城堡、波西米亚水晶与捷克啤酒。', bestTime: '5月-9月', visa: '申根签证', days: 6 },
  'Amsterdam': { desc: '运河之城的自由灵魂。梵高博物馆、库肯霍夫郁金香、自行车与奶酪。', bestTime: '4月-5月', visa: '申根签证', days: 6 },
  'Zurich': { desc: '阿尔卑斯门户的奢华之城。班霍夫大街购物、苏黎世湖游船与瑞士名表工坊。', bestTime: '6月-9月', visa: '申根签证', days: 7 },
  'Nice': { desc: '蔚蓝海岸的璀璨明珠。天使湾、老城集市、普罗旺斯薰衣草与戛纳电影节。', bestTime: '5月-9月', visa: '申根签证', days: 7 },
  'Queenstown': { desc: '冒险之都。蹦极发源地、米尔福德峡湾、瓦纳卡湖与中土世界。', bestTime: '12月-2月', visa: '电子签', days: 10 },
  'Cancún': { desc: '加勒比海的度假天堂。玛雅遗址、粉红湖、Xcaret生态公园与全包式度假村。', bestTime: '12月-4月', visa: '免签', days: 8 },
  'Hanoi': { desc: '东方巴黎的千年古都。还剑湖、36行街、下龙湾游船与越南美食。', bestTime: '10月-12月', visa: '免签/15天', days: 6 },
  'Florence': { desc: '文艺复兴的心脏。乌菲兹美术馆、圣母百花大殿、托斯卡纳酒庄与手工皮具。', bestTime: '4月-6月', visa: '申根签证', days: 7 },
  'Buenos Aires': { desc: '南美巴黎。探戈发源地、博卡区彩色小屋、顶级牛排与马尔贝克红酒。', bestTime: '3月-5月', visa: '免签/90天', days: 8 },
  'Lima': { desc: '世界美食之都。中央餐厅连续多年全球第一，印加遗迹与太平洋悬崖的壮美。', bestTime: '5月-10月', visa: '免签/90天', days: 7 },
  'Rio de Janeiro': { desc: '上帝之城。基督山、科帕卡巴纳海滩、狂欢节与桑巴舞的激情。', bestTime: '12月-3月', visa: '免签/90天', days: 8 },
  'Havana': { desc: '时光冻结的加勒比明珠。老爷车巡游、雪茄工坊、海明威故居与莫吉托。', bestTime: '11月-4月', visa: '免签/30天', days: 7 },
  'Zanzibar': { desc: '印度洋上的香料之岛。石头城迷宫、丁香种植园、私人沙滩别墅与海豚湾。', bestTime: '6月-10月', visa: '电子签', days: 8 },
  'Seychelles': { desc: '印度洋的伊甸园。花岗岩海滩、象龟保护区、私人岛屿度假村与顶级浮潜。', bestTime: '4月-5月', visa: '免签/30天', days: 8 },
  'Mauritius': { desc: '非洲的毛里求斯。七色土、路易港、鹿岛水上运动与奢华全包式度假村。', bestTime: '5月-11月', visa: '免签/60天', days: 9 },
  'Hokkaido': { desc: '北海道的四季之美。粉雪滑雪场、富良野薰衣草、札幌啤酒与帝王蟹。', bestTime: '2月-3月（滑雪）/ 7月-8月（花田）', visa: '免签/15天', days: 7 },
  'Cappadocia': { desc: '童话仙境。热气球日出、洞穴酒店、地下城与格雷梅露天博物馆。', bestTime: '4月-6月', visa: '电子签', days: 6 },
  'Mykonos': { desc: '爱琴海的派对天堂。白色风车、超级天堂海滩、米其林海鲜与日落酒吧。', bestTime: '5月-9月', visa: '申根签证', days: 7 },
  'Edinburgh': { desc: '苏格兰首府的千年古堡。皇家一英里、威士忌品鉴、爱丁堡艺术节与高地之旅。', bestTime: '6月-8月', visa: '英国签证', days: 7 },
  'Lisbon': { desc: '七丘之城的葡式优雅。蛋挞发源地、28路电车、法多音乐与辛特拉宫殿。', bestTime: '3月-10月', visa: '申根签证', days: 6 },
  'Bruges': { desc: '北方威尼斯。中世纪古城、巧克力工坊、啤酒文化与运河游船。', bestTime: '4月-9月', visa: '申根签证', days: 5 },
  'Hallstatt': { desc: '阿尔卑斯山间的仙境小镇。盐矿探险、湖畔木屋、达赫斯坦冰川与奥地利湖区。', bestTime: '5月-10月', visa: '申根签证', days: 6 },
  'Abu Dhabi': { desc: '沙漠中的文化绿洲。卢浮宫阿布扎比、谢赫扎耶德大清真寺与F1赛道。', bestTime: '11月-3月', visa: '免签/30天', days: 5 },
  'Petra': { desc: '玫瑰古城。世界新七大奇迹之一，佩特拉之夜的烛光与瓦迪拉姆沙漠星空营地。', bestTime: '3月-5月', visa: '电子签', days: 7 },
  'Rajasthan': { desc: '印度的皇家之心。斋浦尔粉红之城、乌代浦尔湖宫、焦特布尔蓝色之城与骆驼节。', bestTime: '10月-3月', visa: '电子签', days: 9 },
  'Goa': { desc: '印度的葡萄牙殖民遗风。椰林海滩、香料种植园、殖民教堂与瑜伽静修。', bestTime: '11月-2月', visa: '电子签', days: 7 },
  'Sri Lanka': { desc: '印度洋的眼泪。锡兰茶园、狮子岩、加勒古堡与雅拉国家公园花豹追踪。', bestTime: '12月-3月', visa: '电子签', days: 8 },
  'Luang Prabang': { desc: '琅勃拉邦的清晨布施。金顶寺庙、湄公河游船、光西瀑布与法式殖民风情。', bestTime: '11月-4月', visa: '落地签', days: 6 },
  'Bagan': { desc: '万千佛塔之城。热气球日出、蒲甘王朝遗迹、伊洛瓦底江游船与漆器工坊。', bestTime: '11月-3月', visa: '电子签', days: 7 },
  'Samarkand': { desc: '丝绸之路上的蓝色明珠。雷吉斯坦广场、帖木儿陵墓、手工地毯与中亚美食。', bestTime: '4月-6月', visa: '电子签', days: 7 },
  'Fiji': { desc: '南太平洋的天堂群岛。私人岛屿度假村、珊瑚礁潜水、卡瓦仪式与日落巡航。', bestTime: '5月-10月', visa: '免签/120天', days: 9 },
  'Tahiti': { desc: '法属波利尼西亚的梦幻之境。水上屋发源地、波拉波拉岛、黑珍珠与法式美食。', bestTime: '5月-10月', visa: '免签/90天', days: 10 },
  'Costa Rica': { desc: '中美洲的生态天堂。云雾森林、树懒栖息地、火山温泉与世界级冲浪。', bestTime: '12月-4月', visa: '免签/90天', days: 8 },
  'Galápagos': { desc: '达尔文的活教室。巨龟、蓝脚鲣鸟、海鬣蜥与潜水看锤头鲨。', bestTime: '6月-9月', visa: '免签/90天', days: 10 },
  'Santiago': { desc: '智利的葡萄酒之都。安第斯山脉、中央市场海鲜、瓦尔帕莱索彩色小屋。', bestTime: '10月-4月', visa: '免签/90天', days: 8 },
  'Cartagena': { desc: '加勒比海的殖民古城。彩色建筑、城墙漫步、罗萨里奥群岛与哥伦比亚咖啡。', bestTime: '12月-4月', visa: '免签/90天', days: 7 },
  'Serengeti': { desc: '非洲大草原的生命史诗。百万角马大迁徙、热气球Safari、恩戈罗恩戈罗火山口。', bestTime: '6月-10月', visa: '电子签', days: 10 },
  'Victoria Falls': { desc: '雷鸣之烟。世界最大瀑布、蹦极发源地、赞比西河日落巡航与直升机俯瞰。', bestTime: '2月-5月', visa: '电子签', days: 8 },
  'Madagascar': { desc: '第八大洲。狐猴王国、猴面包树大道、琥珀山国家公园与诺西贝岛海滩。', bestTime: '4月-11月', visa: '电子签', days: 10 },
  'Budapest': { desc: '多瑙河上的明珠。塞切尼温泉、渔人堡、匈牙利美食与废墟酒吧文化。', bestTime: '4月-10月', visa: '申根签证', days: 6 },
  'Berlin': { desc: '欧洲的创意之都。柏林墙遗址、博物馆岛、电子音乐与多元美食文化。', bestTime: '5月-9月', visa: '申根签证', days: 6 },
  'Stockholm': { desc: '北欧威尼斯。瓦萨沉船博物馆、老城Gamla Stan、诺贝尔奖晚宴与设计之都。', bestTime: '6月-8月', visa: '申根签证', days: 6 },
  'Copenhagen': { desc: '幸福之都。新港彩色小屋、Tivoli乐园、Noma餐厅发源地与自行车文化。', bestTime: '5月-9月', visa: '申根签证', days: 5 },
  'Helsinki': { desc: '波罗的海的设计之都。芬兰桑姆、设计区、岩石教堂与圣诞老人村。', bestTime: '6月-8月', visa: '申根签证', days: 5 },
  'Munich': { desc: '巴伐利亚的骄傲。新天鹅堡、啤酒花园、宝马博物馆与阿尔卑斯山门户。', bestTime: '5月-10月', visa: '申根签证', days: 6 },
  'Milan': { desc: '时尚之都。米兰大教堂、达芬奇《最后的晚餐》、蒙特拿破仑大街与意大利烩饭。', bestTime: '4月-6月', visa: '申根签证', days: 6 },
  'Madrid': { desc: '伊比利亚之心。普拉多博物馆、马德里王宫、火腿博物馆与弗拉门戈舞。', bestTime: '3月-5月', visa: '申根签证', days: 6 },
  'Dublin': { desc: '翡翠岛的文学之城。健力士啤酒厂、三一学院、莫赫悬崖与爱尔兰音乐酒吧。', bestTime: '5月-9月', visa: '英国签证', days: 6 },
};

/* ─── 中国出发城市对应的 IATA 代码 ─── */

const CHINESE_HUBS: Record<string, string> = {
  '上海': 'PVG', '北京': 'PEK', '广州': 'CAN', '深圳': 'SZX',
  '成都': 'CTU', '杭州': 'HGH', '厦门': 'XMN',
};

// OpenFlights 中城市名可能与我们的 key 不同，建立别名映射
const CITY_ALIASES: Record<string, string[]> = {
  'Santorini': ['Thira', 'Santorini'],
  'Barcelona': ['Barcelona'],
  'Bali': ['Denpasar', 'Bali'],
  'Maldives': ['Male', 'Malé', 'Maldives'],
  'Reykjavik': ['Reykjavik', 'Keflavik'],
  'Oslo': ['Oslo'],
  'Dubrovnik': ['Dubrovnik'],
  'Marrakech': ['Marrakech', 'Marrakesh'],
  'Cape Town': ['Cape Town'],
  'Kyoto': ['Osaka', 'Kyoto'],
  'Prague': ['Prague', 'Praha'],
  'Nice': ['Nice'],
  'Queenstown': ['Queenstown'],
  'Cancún': ['Cancun', 'Cancún'],
  'Florence': ['Florence', 'Firenze'],
  'Buenos Aires': ['Buenos Aires'],
  'Lima': ['Lima'],
  'Rio de Janeiro': ['Rio De Janeiro', 'Rio de Janeiro'],
  'Havana': ['Havana'],
  'Zanzibar': ['Zanzibar'],
  'Seychelles': ['Mahe', 'Seychelles'],
  'Mauritius': ['Mauritius', 'Port Louis'],
  'Hokkaido': ['Sapporo', 'Hokkaido', 'Asahikawa'],
  'Cappadocia': ['Nevsehir', 'Cappadocia', 'Kayseri'],
  'Mykonos': ['Mykonos'],
  'Edinburgh': ['Edinburgh'],
  'Lisbon': ['Lisbon'],
  'Bruges': ['Brussels', 'Brugge'],
  'Hallstatt': ['Salzburg', 'Hallstatt'],
  'Abu Dhabi': ['Abu Dhabi'],
  'Petra': ['Amman', 'Petra', 'Aqaba'],
  'Rajasthan': ['Jaipur', 'Udaipur', 'Jodhpur'],
  'Goa': ['Goa', 'Dabolim'],
  'Sri Lanka': ['Colombo', 'Sri Lanka'],
  'Luang Prabang': ['Luang Prabang'],
  'Bagan': ['Nyaung U', 'Bagan'],
  'Samarkand': ['Samarkand'],
  'Fiji': ['Nadi', 'Fiji'],
  'Tahiti': ['Papeete', 'Tahiti'],
  'Costa Rica': ['San Jose', 'Costa Rica'],
  'Galápagos': ['Galápagos', 'Baltra'],
  'Santiago': ['Santiago'],
  'Cartagena': ['Cartagena'],
  'Serengeti': ['Serengeti', 'Kilimanjaro'],
  'Victoria Falls': ['Victoria Falls', 'Livingstone'],
  'Madagascar': ['Antananarivo', 'Madagascar'],
  'Budapest': ['Budapest'],
  'Berlin': ['Berlin'],
  'Munich': ['Munich'],
  'Stockholm': ['Stockholm'],
  'Copenhagen': ['Copenhagen'],
  'Helsinki': ['Helsinki'],
  'Milan': ['Milan'],
  'Madrid': ['Madrid'],
  'Dublin': ['Dublin'],
};

/* ─── Haversine 距离计算 ─── */

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ─── 解析 OpenFlights 数据 ─── */

interface Airport {
  id: number; name: string; city: string; country: string;
  iata: string; lat: number; lng: number;
}

function parseAirports(filePath: string): Airport[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(Boolean).map((line) => {
    // CSV with quoted strings
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { parts.push(current); current = ''; continue; }
      current += ch;
    }
    parts.push(current);
    return {
      id: parseInt(parts[0]) || 0,
      name: parts[1] || '',
      city: parts[2] || '',
      country: parts[3] || '',
      iata: parts[4] || '',
      lat: parseFloat(parts[6]) || 0,
      lng: parseFloat(parts[7]) || 0,
    };
  }).filter((a) => a.iata && a.iata !== '\\N');
}

function parseRoutes(filePath: string): { src: string; dst: string }[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').filter(Boolean).map((line) => {
    const parts = line.split(',');
    return { src: parts[2] || '', dst: parts[4] || '' };
  }).filter((r) => r.src && r.dst && r.src !== '\\N' && r.dst !== '\\N');
}

/* ─── 主逻辑 ─── */

async function main() {
  console.log('📊 Loading OpenFlights data...');
  const airports = parseAirports(path.join(__dirname, '../data/raw/airports.dat'));
  const routes = parseRoutes(path.join(__dirname, '../data/raw/routes.dat'));

  // 建立 IATA → Airport 索引
  const byIata = new Map<string, Airport>();
  for (const a of airports) {
    if (a.iata) byIata.set(a.iata, a);
  }

  // 找到所有中国机场
  const chineseAirports = airports.filter((a) => a.country === 'China' && a.iata);
  console.log(`  Found ${chineseAirports.length} Chinese airports`);

  // 找到所有从中国出发的航线
  const chineseIatas = new Set(chineseAirports.map((a) => a.iata));
  const routesFromChina = routes.filter((r) => chineseIatas.has(r.src));
  console.log(`  Found ${routesFromChina.length} routes from China`);

  // 找到中国能直飞的目的地城市
  const destIatas = new Set(routesFromChina.map((r) => r.dst));
  const destAirports = airports.filter((a) => destIatas.has(a.iata));
  const destCities = new Map<string, Airport[]>();
  for (const a of destAirports) {
    const existing = destCities.get(a.city) || [];
    existing.push(a);
    destCities.set(a.city, existing);
  }
  console.log(`  Found ${destCities.size} destination cities from China`);

  // ─── 清空旧数据 ───
  await prisma.booking.deleteMany();
  await prisma.route.deleteMany();
  await prisma.destination.deleteMany();

  // ─── 写入目的地 ───
  console.log('\n🌍 Creating destinations...');
  const destMap = new Map<string, string>(); // city → destinationId

  for (const [city, config] of Object.entries(LUXURY_DESTINATIONS)) {
    // 用别名查找机场
    const aliases = CITY_ALIASES[city] || [city];
    let airport: Airport | undefined;
    let matchedCity = city;
    for (const alias of aliases) {
      const found = destCities.get(alias);
      if (found && found.length > 0) {
        airport = found[0];
        matchedCity = alias;
        break;
      }
    }
    // 模糊匹配兜底
    if (!airport) {
      const fuzzyKey = [...destCities.keys()].find((k) =>
        k.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(k.toLowerCase())
      );
      if (fuzzyKey) {
        airport = destCities.get(fuzzyKey)![0];
        matchedCity = fuzzyKey;
      }
    }
    if (!airport) {
      console.log(`  ⚠ No airport found for ${city}, skipping`);
      continue;
    }

    const d = await prisma.destination.create({ data: {
      slug: city.toLowerCase().replace(/\s+/g, '-').replace(/ú/g, 'u'),
      country: COUNTRY_CN[airport.country] || airport.country,
      city: CITY_CN[city] || city,
      description: config.desc,
      bestTime: config.bestTime,
      visa: config.visa,
      images: JSON.stringify([
        `https://picsum.photos/seed/${city.toLowerCase().replace(/\s+/g,'')}/800/1000`,
        `https://picsum.photos/seed/${city}2/800/1000`,
        `https://picsum.photos/seed/${city}3/800/1000`,
      ]),
    }});
    destMap.set(matchedCity, d.id);
    destMap.set(city, d.id);
    console.log(`  ✅ ${COUNTRY_CN[airport.country] || airport.country} · ${CITY_CN[city] || city} [${airport.iata}]`);
  }

  // ─── 补充无法直飞的目的地（通过枢纽中转） ───
  console.log('\n🔄 Adding hub-connected destinations...');
  let routeCount = 0;
  const hubConnected = [
    { city: 'Santorini', via: 'Paris', origin: '上海', days: 10 },
    { city: 'Barcelona', via: 'London', origin: '上海', days: 10 },
    { city: 'Reykjavik', via: 'London', origin: '北京', days: 10 },
    { city: 'Oslo', via: 'Amsterdam', origin: '上海', days: 9 },
    { city: 'Dubrovnik', via: 'Istanbul', origin: '北京', days: 9 },
    { city: 'Marrakech', via: 'Paris', origin: '上海', days: 9 },
    { city: 'Cape Town', via: 'Dubai', origin: '上海', days: 11 },
    { city: 'Prague', via: 'Vienna', origin: '北京', days: 8 },
    { city: 'Nice', via: 'Paris', origin: '上海', days: 9 },
    { city: 'Queenstown', via: 'Sydney', origin: '上海', days: 12 },
    { city: 'Cancún', via: 'New York', origin: '北京', days: 10 },
    { city: 'Florence', via: 'Rome', origin: '上海', days: 9 },
    { city: 'Buenos Aires', via: 'New York', origin: '北京', days: 12 },
    { city: 'Lima', via: 'Los Angeles', origin: '上海', days: 10 },
    { city: 'Rio de Janeiro', via: 'New York', origin: '北京', days: 10 },
    { city: 'Havana', via: 'New York', origin: '北京', days: 9 },
    { city: 'Zanzibar', via: 'Dubai', origin: '上海', days: 10 },
    { city: 'Seychelles', via: 'Dubai', origin: '上海', days: 10 },
    { city: 'Mauritius', via: 'Dubai', origin: '上海', days: 11 },
    { city: 'Hokkaido', via: 'Tokyo', origin: '上海', days: 8 },
    { city: 'Cappadocia', via: 'Istanbul', origin: '北京', days: 8 },
    { city: 'Mykonos', via: 'Athens', origin: '上海', days: 9 },
    { city: 'Edinburgh', via: 'London', origin: '上海', days: 9 },
    { city: 'Lisbon', via: 'Paris', origin: '上海', days: 8 },
    { city: 'Bruges', via: 'Amsterdam', origin: '上海', days: 7 },
    { city: 'Hallstatt', via: 'Vienna', origin: '北京', days: 8 },
    { city: 'Abu Dhabi', via: 'Dubai', origin: '上海', days: 5 },
    { city: 'Petra', via: 'Istanbul', origin: '北京', days: 9 },
    { city: 'Rajasthan', via: 'Singapore', origin: '上海', days: 11 },
    { city: 'Goa', via: 'Singapore', origin: '广州', days: 9 },
    { city: 'Sri Lanka', via: 'Singapore', origin: '上海', days: 10 },
    { city: 'Luang Prabang', via: 'Bangkok', origin: '广州', days: 8 },
    { city: 'Bagan', via: 'Bangkok', origin: '广州', days: 9 },
    { city: 'Samarkand', via: 'Istanbul', origin: '北京', days: 9 },
    { city: 'Fiji', via: 'Sydney', origin: '上海', days: 11 },
    { city: 'Tahiti', via: 'Sydney', origin: '上海', days: 12 },
    { city: 'Costa Rica', via: 'New York', origin: '北京', days: 10 },
    { city: 'Galápagos', via: 'Lima', origin: '上海', days: 12 },
    { city: 'Santiago', via: 'Lima', origin: '上海', days: 10 },
    { city: 'Cartagena', via: 'New York', origin: '北京', days: 9 },
    { city: 'Serengeti', via: 'Nairobi', origin: '上海', days: 12 },
    { city: 'Victoria Falls', via: 'Cape Town', origin: '上海', days: 10 },
    { city: 'Madagascar', via: 'Dubai', origin: '上海', days: 12 },
    { city: 'Budapest', via: 'Vienna', origin: '北京', days: 8 },
    { city: 'Berlin', via: 'Amsterdam', origin: '上海', days: 8 },
    { city: 'Munich', via: 'Zurich', origin: '北京', days: 8 },
    { city: 'Stockholm', via: 'Oslo', origin: '上海', days: 8 },
    { city: 'Copenhagen', via: 'Amsterdam', origin: '上海', days: 7 },
    { city: 'Helsinki', via: 'Stockholm', origin: '北京', days: 7 },
    { city: 'Milan', via: 'Rome', origin: '上海', days: 8 },
    { city: 'Madrid', via: 'Barcelona', origin: '上海', days: 8 },
    { city: 'Dublin', via: 'London', origin: '上海', days: 8 },
  ];

  for (const hc of hubConnected) {
    const destConfig = LUXURY_DESTINATIONS[hc.city];
    if (!destConfig || destMap.has(hc.city)) continue;

    // 创建目的地（即使没有直飞航线）
    const d = await prisma.destination.create({ data: {
      slug: hc.city.toLowerCase().replace(/\s+/g, '-'),
      country: (() => {
        const countryMap: Record<string, string> = {
          'Santorini': '希腊', 'Barcelona': '西班牙', 'Reykjavik': '冰岛',
          'Oslo': '挪威', 'Dubrovnik': '克罗地亚', 'Marrakech': '摩洛哥',
          'Cape Town': '南非', 'Prague': '捷克', 'Nice': '法国',
          'Queenstown': '新西兰', 'Cancún': '墨西哥', 'Florence': '意大利',
        };
        return countryMap[hc.city] || '未知';
      })(),
      city: CITY_CN[hc.city] || hc.city,
      description: destConfig.desc,
      bestTime: destConfig.bestTime,
      visa: destConfig.visa,
      images: JSON.stringify([
        `https://picsum.photos/seed/${hc.city.toLowerCase().replace(/\s+/g,'')}/800/1000`,
        `https://picsum.photos/seed/${hc.city}2/800/1000`,
        `https://picsum.photos/seed/${hc.city}3/800/1000`,
      ]),
    }});
    destMap.set(hc.city, d.id);
    console.log(`  ✅ ${CITY_CN[hc.city] || hc.city} (via ${hc.via})`);

    // 创建中转路线
    const viaId = destMap.get(hc.via);
    if (viaId) {
      const viaCity = CITY_CN[hc.via] || hc.via;
      const toCity = CITY_CN[hc.city] || hc.city;
      try {
        await prisma.route.create({ data: {
          slug: `${hc.origin.toLowerCase()}-${hc.via.toLowerCase()}-${hc.city.toLowerCase().replace(/\s+/g,'-')}`,
          name: `${hc.origin} → ${viaCity} → ${toCity}`,
          description: `经${viaCity}中转，深度游览${toCity}。${destConfig.desc}`,
          origin: hc.origin,
          transitId: viaId,
          destinationId: d.id,
          price: 0, // AI 实时估算
          days: hc.days,
          imageUrl: `https://picsum.photos/seed/${hc.city.toLowerCase().replace(/\s+/g,'')}/800/600`,
          galleryUrls: '[]',
          isActive: true,
        }});
        routeCount++;
      } catch { /* skip duplicates */ }
    }
  }

  // ─── 写入直飞航线 ───
  console.log('\n✈️  Creating direct routes...');

  for (const [originName, originIata] of Object.entries(CHINESE_HUBS)) {
    const originAirport = byIata.get(originIata);
    if (!originAirport) continue;

    for (const [destCity, destId] of destMap.entries()) {
      const destConfig = LUXURY_DESTINATIONS[destCity];
      if (!destConfig) continue;

      const destAirport = destCities.get(destCity)?.[0];
      if (!destAirport) continue;

      // 计算飞行时间
      const dist = haversine(originAirport.lat, originAirport.lng, destAirport.lat, destAirport.lng);
      const flightHours = Math.round(dist / 850); // ~850 km/h average

      const slug = `${originName.toLowerCase()}-${destCity.toLowerCase().replace(/\s+/g, '-')}`;
      const name = `${originName} → ${CITY_CN[destCity] || destCity}`;

      try {
        await prisma.route.create({ data: {
          slug,
          name,
          description: `${destConfig.desc}（飞行约${flightHours}小时）`,
          origin: originName,
          transitId: null,
          destinationId: destId,
          price: 0, // AI 实时估算
          days: destConfig.days,
          imageUrl: `https://picsum.photos/seed/${destCity.toLowerCase()}/800/600`,
          galleryUrls: '[]',
          isActive: true,
        }});
        routeCount++;
      } catch {
        // slug uniqueness violation, skip
      }
    }

    // 添加带途经的路线
    const viaRoutes = [
      { from: '上海', via: 'Paris', to: 'Santorini', days: 14 },
      { from: '上海', via: 'Dubai', to: 'Maldives', days: 12 },
      { from: '北京', via: 'Zurich', to: 'Rome', days: 13 },
      { from: '北京', via: 'Istanbul', to: 'Santorini', days: 12 },
      { from: '广州', via: 'Singapore', to: 'Bali', days: 10 },
      { from: '深圳', via: 'Tokyo', to: 'Kyoto', days: 10 },
      { from: '上海', via: 'Rome', to: 'Barcelona', days: 13 },
      { from: '北京', via: 'London', to: 'Edinburgh', days: 11 },
    ];

    for (const vr of viaRoutes) {
      if (vr.from !== originName) continue;
      const viaId = destMap.get(vr.via);
      const toId = destMap.get(vr.to);
      if (!viaId || !toId) continue;

      const viaCity = CITY_CN[vr.via] || vr.via;
      const toCity = CITY_CN[vr.to] || vr.to;
      const slug = `${originName.toLowerCase()}-${vr.via.toLowerCase()}-${vr.to.toLowerCase()}`;
      try {
        await prisma.route.create({ data: {
          slug,
          name: `${originName} → ${viaCity} → ${toCity}`,
          description: `经${viaCity}中转，深度游览${toCity}。一次旅程，双重体验。`,
          origin: originName,
          transitId: viaId,
          destinationId: toId,
          price: 0, // AI 实时估算
          days: vr.days,
          imageUrl: `https://picsum.photos/seed/${vr.to.toLowerCase()}/800/600`,
          galleryUrls: '[]',
          isActive: true,
        }});
        routeCount++;
      } catch { /* skip duplicates */ }
    }
  }

  console.log(`\n✅ Done! ${destMap.size} destinations, ${routeCount} routes created.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
