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
  'Oslo': '奥斯陆', 'Bergen': '卑尔根', 'Tromsoe': '特罗姆瑟',
  'Tromsø': '特罗姆瑟', 'Zurich': '苏黎世', 'Lucerne': '卢塞恩',
  'Interlaken': '因特拉肯', 'Queenstown': '皇后镇', 'Auckland': '奥克兰',
  'Honolulu': '火奴鲁鲁', 'Las Vegas': '拉斯维加斯', 'Miami': '迈阿密',
  'Malé': '马尔代夫', 'Colombo': '科伦坡', 'Kathmandu': '加德满都',
  'Siem Reap': '暹粒', 'Phnom Penh': '金边', 'Boracay': '长滩岛',
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
};

/* ─── 精选奢华目的地（含描述、最佳时间、签证） ─── */

const LUXURY_DESTINATIONS: Record<string, {
  desc: string; bestTime: string; visa: string; priceBase: number; days: number;
}> = {
  'Paris': { desc: '光之城——埃菲尔铁塔、卢浮宫、塞纳河畔的浪漫之旅。米其林三星餐厅与高定时装的发源地。', bestTime: '4月-10月', visa: '申根签证', priceBase: 128000, days: 8 },
  'London': { desc: '泰晤士河畔的皇家之城，白金汉宫与大英博物馆的深厚底蕴。下午茶与西区剧院的英式优雅。', bestTime: '5月-9月', visa: '英国签证', priceBase: 135000, days: 8 },
  'Tokyo': { desc: '传统与未来交融的东方之都。从浅草寺的晨钟到银座的霓虹，寿司之神与樱花季的极致体验。', bestTime: '3月-5月', visa: '免签/15天', priceBase: 98000, days: 7 },
  'Rome': { desc: '永恒之城，古罗马斗兽场到梵蒂冈的艺术殿堂。罗马假日的浪漫与意大利美食的巅峰。', bestTime: '4月-6月', visa: '申根签证', priceBase: 118000, days: 7 },
  'Santorini': { desc: '爱琴海上的蓝白童话。伊亚日落被誉为世界最美，火山温泉与悬崖酒店的极致浪漫。', bestTime: '5月-10月', visa: '申根签证', priceBase: 148000, days: 7 },
  'Barcelona': { desc: '高迪建筑的奇幻之城，兰布拉大道的热情与加泰罗尼亚美食的创意碰撞。', bestTime: '5月-6月', visa: '申根签证', priceBase: 115000, days: 7 },
  'Dubai': { desc: '沙漠中崛起的未来之城。哈利法塔的云端晚餐、沙漠冲沙与全球最大的购物中心。', bestTime: '11月-3月', visa: '免签/30天', priceBase: 108000, days: 6 },
  'Bali': { desc: '千庙之岛的灵性之旅。乌布梯田、海神庙日落、私人泳池别墅与巴厘SPA的身心洗礼。', bestTime: '4月-10月', visa: '免签/30天', priceBase: 88000, days: 8 },
  'Maldives': { desc: '印度洋上的珍珠项链。水上别墅、珊瑚花园、私人沙滩——地球上最接近天堂的地方。', bestTime: '11月-4月', visa: '免签/30天', priceBase: 168000, days: 6 },
  'Reykjavik': { desc: '冰与火之地。蓝湖温泉、北极光、冰川徒步与间歇泉——地球最超现实的风景。', bestTime: '6月-8月', visa: '申根签证', priceBase: 158000, days: 8 },
  'Oslo': { desc: '峡湾之国的起点。维京船博物馆、北极光观测与挪威森林的原始之美。', bestTime: '6月-9月', visa: '申根签证', priceBase: 138000, days: 8 },
  'Dubrovnik': { desc: '亚得里亚海的珍珠。中世纪城墙、红顶老城与《权力的游戏》取景地。', bestTime: '5月-9月', visa: '申根签证', priceBase: 125000, days: 7 },
  'Marrakech': { desc: '北非的神秘之都。马拉喀什集市的香料气息、撒哈拉骆驼之旅与摩洛哥庭院的精致。', bestTime: '10月-4月', visa: '免签/90天', priceBase: 98000, days: 8 },
  'Cape Town': { desc: '非洲大陆的尽头。桌山日出、好望角企鹅、斯泰伦博斯酒庄与多元文化的融合。', bestTime: '11月-3月', visa: '免签/30天', priceBase: 128000, days: 9 },
  'Sydney': { desc: '南半球的闪耀之星。悉尼歌剧院、蓝山国家公园、邦迪海滩与猎人谷酒庄。', bestTime: '10月-4月', visa: '电子签', priceBase: 148000, days: 10 },
  'New York': { desc: '世界之都。百老汇、中央公园、大都会博物馆与第五大道——永不沉睡的城市。', bestTime: '4月-6月', visa: '美国签证', priceBase: 138000, days: 8 },
  'Kyoto': { desc: '千年古都的东方美学。金阁寺、竹林小径、艺伎文化与怀石料理的极致。', bestTime: '3月-5月', visa: '免签/15天', priceBase: 108000, days: 7 },
  'Bangkok': { desc: '微笑之国的璀璨首都。大皇宫、水上市场、泰式按摩与街头美食的天堂。', bestTime: '11月-2月', visa: '免签/30天', priceBase: 68000, days: 6 },
  'Singapore': { desc: '花园城市的精致典范。滨海湾金沙、牛车水美食、圣淘沙与夜间动物园。', bestTime: '全年', visa: '免签/30天', priceBase: 88000, days: 5 },
  'Istanbul': { desc: '横跨欧亚的文明交汇。蓝色清真寺、大巴扎、博斯普鲁斯海峡与土耳其浴。', bestTime: '4月-6月', visa: '电子签', priceBase: 88000, days: 7 },
  'Seoul': { desc: '韩流文化的中心。景福宫、明洞购物、韩式汗蒸与米其林韩定食。', bestTime: '3月-5月', visa: '免签/90天', priceBase: 68000, days: 5 },
  'Vienna': { desc: '音乐之都的古典优雅。美泉宫、国家歌剧院、萨赫蛋糕与维也纳咖啡文化。', bestTime: '4月-10月', visa: '申根签证', priceBase: 118000, days: 6 },
  'Prague': { desc: '千塔之城的童话。查理大桥、布拉格城堡、波西米亚水晶与捷克啤酒。', bestTime: '5月-9月', visa: '申根签证', priceBase: 98000, days: 6 },
  'Amsterdam': { desc: '运河之城的自由灵魂。梵高博物馆、库肯霍夫郁金香、自行车与奶酪。', bestTime: '4月-5月', visa: '申根签证', priceBase: 115000, days: 6 },
  'Zurich': { desc: '阿尔卑斯门户的奢华之城。班霍夫大街购物、苏黎世湖游船与瑞士名表工坊。', bestTime: '6月-9月', visa: '申根签证', priceBase: 158000, days: 7 },
  'Nice': { desc: '蔚蓝海岸的璀璨明珠。天使湾、老城集市、普罗旺斯薰衣草与戛纳电影节。', bestTime: '5月-9月', visa: '申根签证', priceBase: 128000, days: 7 },
  'Queenstown': { desc: '冒险之都。蹦极发源地、米尔福德峡湾、瓦纳卡湖与中土世界。', bestTime: '12月-2月', visa: '电子签', priceBase: 168000, days: 10 },
  'Cancún': { desc: '加勒比海的度假天堂。玛雅遗址、粉红湖、Xcaret生态公园与全包式度假村。', bestTime: '12月-4月', visa: '免签', priceBase: 128000, days: 8 },
  'Hanoi': { desc: '东方巴黎的千年古都。还剑湖、36行街、下龙湾游船与越南美食。', bestTime: '10月-12月', visa: '免签/15天', priceBase: 58000, days: 6 },
  'Florence': { desc: '文艺复兴的心脏。乌菲兹美术馆、圣母百花大殿、托斯卡纳酒庄与手工皮具。', bestTime: '4月-6月', visa: '申根签证', priceBase: 128000, days: 7 },
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
    { city: 'Santorini', via: 'Paris', origin: '上海', price: 188000, days: 10 },
    { city: 'Barcelona', via: 'London', origin: '上海', price: 168000, days: 10 },
    { city: 'Reykjavik', via: 'London', origin: '北京', price: 178000, days: 10 },
    { city: 'Oslo', via: 'Amsterdam', origin: '上海', price: 158000, days: 9 },
    { city: 'Dubrovnik', via: 'Istanbul', origin: '北京', price: 148000, days: 9 },
    { city: 'Marrakech', via: 'Paris', origin: '上海', price: 138000, days: 9 },
    { city: 'Cape Town', via: 'Dubai', origin: '上海', price: 168000, days: 11 },
    { city: 'Prague', via: 'Vienna', origin: '北京', price: 128000, days: 8 },
    { city: 'Nice', via: 'Paris', origin: '上海', price: 148000, days: 9 },
    { city: 'Queenstown', via: 'Sydney', origin: '上海', price: 198000, days: 12 },
    { city: 'Cancún', via: 'New York', origin: '北京', price: 178000, days: 10 },
    { city: 'Florence', via: 'Rome', origin: '上海', price: 148000, days: 9 },
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
          price: hc.price,
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

      // 计算距离和飞行时间
      const dist = haversine(originAirport.lat, originAirport.lng, destAirport.lat, destAirport.lng);
      const flightHours = Math.round(dist / 850); // ~850 km/h average

      // 根据距离和目的地计算价格
      const distMultiplier = dist > 10000 ? 1.5 : dist > 5000 ? 1.2 : dist > 2000 ? 1.0 : 0.8;
      const price = Math.round(destConfig.priceBase * distMultiplier / 1000) * 1000;

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
          price,
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
      { from: '上海', via: 'Paris', to: 'Santorini', price: 198000, days: 14 },
      { from: '上海', via: 'Dubai', to: 'Maldives', price: 188000, days: 12 },
      { from: '北京', via: 'Zurich', to: 'Rome', price: 185000, days: 13 },
      { from: '北京', via: 'Istanbul', to: 'Santorini', price: 168000, days: 12 },
      { from: '广州', via: 'Singapore', to: 'Bali', price: 128000, days: 10 },
      { from: '深圳', via: 'Tokyo', to: 'Kyoto', price: 118000, days: 10 },
      { from: '上海', via: 'Rome', to: 'Barcelona', price: 178000, days: 13 },
      { from: '北京', via: 'London', to: 'Edinburgh', price: 168000, days: 11 },
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
          price: vr.price,
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
