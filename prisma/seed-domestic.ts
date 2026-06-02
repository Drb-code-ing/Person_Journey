/**
 * 国内奢华旅行种子数据
 * 15个国内奢华目的地 + 30+条航线/高铁线路
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── 国内奢华目的地 ───

interface DomesticDest {
  slug: string;
  city: string;
  region: string;
  description: string;
  bestTime: string;
  bestSeason: string;
  transport: string[];
  imageId: number;
}

const DOMESTIC_DESTINATIONS: DomesticDest[] = [
  {
    slug: 'lijiang',
    city: '丽江',
    region: '西南',
    description: '雪山脚下的纳西古韵，安缦酒店隐于玉龙雪山与古城之间，东巴文化的神秘与奢华完美交融。',
    bestTime: '四季皆宜，春秋最佳',
    bestSeason: '春/秋',
    transport: ['航班', '高铁'],
    imageId: 100,
  },
  {
    slug: 'dali',
    city: '大理',
    region: '西南',
    description: '苍山洱海间的风花雪月，白族古韵与现代奢享在喜洲古镇相遇。私人游艇游洱海，苍山之巅品茶道。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['航班', '高铁'],
    imageId: 101,
  },
  {
    slug: 'shangri-la',
    city: '香格里拉',
    region: '西南',
    description: '松赞系列酒店发源地，藏区秘境中的至臻奢享。松赞林寺私享导览，普达措国家公园独家路线。',
    bestTime: '5-7月，9-10月',
    bestSeason: '夏/秋',
    transport: ['航班'],
    imageId: 102,
  },
  {
    slug: 'hangzhou',
    city: '杭州',
    region: '华东',
    description: '西湖畔的安缦法云，隐于灵隐寺旁的千年古村落。龙井问茶、西湖泛舟、宋城千古情，尽显江南雅致。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 103,
  },
  {
    slug: 'moganshan',
    city: '莫干山',
    region: '华东',
    description: '裸心堡坐拥山巅城堡视野，竹海环绕的避世秘境。骑马、射箭、森林SPA，距上海仅2小时车程。',
    bestTime: '4-10月',
    bestSeason: '夏',
    transport: ['高铁', '专车'],
    imageId: 104,
  },
  {
    slug: 'sanya',
    city: '三亚',
    region: '华南',
    description: '嘉佩乐、瑰丽、艾迪逊齐聚海棠湾。私人沙滩晚宴、游艇出海、深潜蜈支洲岛，国内顶级海岛奢享。',
    bestTime: '10-次年4月',
    bestSeason: '冬/春',
    transport: ['航班'],
    imageId: 105,
  },
  {
    slug: 'xian',
    city: '西安',
    region: '西北',
    description: '十三朝古都的帝王之旅。兵马俑VIP通道、古城墙私人骑行、长安十二时辰沉浸式体验。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 106,
  },
  {
    slug: 'dunhuang',
    city: '敦煌',
    region: '西北',
    description: '莫高窟特窟私享、鸣沙山月牙泉日落晚宴、雅丹魔鬼城越野探险。丝路文明的极致体验。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['航班'],
    imageId: 107,
  },
  {
    slug: 'tengchong',
    city: '腾冲',
    region: '西南',
    description: '火山温泉之乡，悦榕庄坐拥热海温泉。和顺古镇私享、火山地质公园、银杏村秋色。',
    bestTime: '10-次年3月',
    bestSeason: '秋/冬',
    transport: ['航班'],
    imageId: 108,
  },
  {
    slug: 'changbaishan',
    city: '长白山',
    region: '东北',
    description: '万达/柏悦度假区，冬季粉雪天堂。天池VIP通道、原始森林越野、火山温泉，夏季避暑冬季滑雪。',
    bestTime: '11-次年3月（滑雪）/ 6-8月（避暑）',
    bestSeason: '冬/夏',
    transport: ['航班'],
    imageId: 109,
  },
  {
    slug: 'daocheng',
    city: '稻城亚丁',
    region: '西南',
    description: '蓝色星球上最后一片净土。三怙主神山徒步、牛奶海航拍、藏式帐篷营地星空晚宴。',
    bestTime: '4-5月，9-10月',
    bestSeason: '春/秋',
    transport: ['航班'],
    imageId: 110,
  },
  {
    slug: 'lhasa',
    city: '拉萨',
    region: '西南',
    description: '布达拉宫VIP专场、大昭寺转经祈福、纳木错星空营地。高原上的灵魂之旅，全程供氧保障。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['航班'],
    imageId: 111,
  },
  {
    slug: 'guilin',
    city: '桂林',
    region: '华南',
    description: '漓江竹筏私享、阳朔悦榕庄田园秘境、龙脊梯田壮美日出。桂林山水甲天下的极致诠释。',
    bestTime: '4-10月',
    bestSeason: '春/夏/秋',
    transport: ['航班', '高铁'],
    imageId: 112,
  },
  {
    slug: 'chengdu',
    city: '成都',
    region: '西南',
    description: '大熊猫基地VIP早间场、宽窄巷子私享茶道、川菜大师私厨课程。巴适生活的极致演绎。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 113,
  },
  {
    slug: 'xiamen',
    city: '厦门',
    region: '华东',
    description: '鼓浪屿百年洋房私享、南普陀寺禅修体验、曾厝垵文艺探秘。海上花园的慢奢时光。',
    bestTime: '3-5月，10-12月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 114,
  },
  {
    slug: 'zhangjiajie',
    city: '张家界',
    region: '华中',
    description: '阿凡达悬浮山取景地。天门山玻璃栈道、百龙天梯、宝峰湖与黄龙洞的地质奇观。',
    bestTime: '4-6月，9-11月',
    bestSeason: '春/秋',
    transport: ['航班', '高铁'],
    imageId: 115,
  },
  {
    slug: 'huangshan',
    city: '黄山',
    region: '华东',
    description: '五岳归来不看山。云海奇松、温泉别墅、宏村徽派古建筑与黄山毛峰品茗。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 116,
  },
  {
    slug: 'jiuzhaigou',
    city: '九寨沟',
    region: '西南',
    description: '人间仙境，五彩池的蓝绿色调令人屏息。藏族村寨、原始森林与诺日朗瀑布。',
    bestTime: '9-11月',
    bestSeason: '秋',
    transport: ['航班'],
    imageId: 117,
  },
  {
    slug: 'kanas',
    city: '喀纳斯',
    region: '西北',
    description: '新疆秘境。喀纳斯湖怪传说、禾木村晨雾、白哈巴边境与图瓦人文化。',
    bestTime: '6-10月',
    bestSeason: '夏/秋',
    transport: ['航班'],
    imageId: 118,
  },
  {
    slug: 'lugu-lake',
    city: '泸沽湖',
    region: '西南',
    description: '东方女儿国。摩梭族走婚文化、猪槽船游湖、里格半岛星空与格姆女神山。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['航班', '专车'],
    imageId: 119,
  },
  {
    slug: 'wuyuan',
    city: '婺源',
    region: '华东',
    description: '中国最美乡村。油菜花海、徽派建筑群、篁岭晒秋与古驿道徒步。',
    bestTime: '3-4月（油菜花）/ 11月（晒秋）',
    bestSeason: '春/秋',
    transport: ['高铁', '专车'],
    imageId: 120,
  },
  {
    slug: 'yangshuo',
    city: '阳朔',
    region: '华南',
    description: '漓江精华段。遇龙河竹筏、西街洋人街、印象刘三姐与阳朔攀岩。',
    bestTime: '4-10月',
    bestSeason: '春/夏/秋',
    transport: ['高铁', '航班'],
    imageId: 121,
  },
  {
    slug: 'xishuangbanna',
    city: '西双版纳',
    region: '西南',
    description: '热带雨林王国。傣族泼水节、野象谷、星光夜市与安纳塔拉度假村。',
    bestTime: '11-次年4月',
    bestSeason: '冬/春',
    transport: ['航班'],
    imageId: 122,
  },
  {
    slug: 'beihai',
    city: '北海',
    region: '华南',
    description: '银滩细沙如粉、涠洲岛火山地质、老街骑楼与海鲜盛宴。',
    bestTime: '4-11月',
    bestSeason: '春/夏/秋',
    transport: ['航班', '高铁'],
    imageId: 123,
  },
  {
    slug: 'qingdao',
    city: '青岛',
    region: '华东',
    description: '红瓦绿树碧海蓝天。八大关别墅群、崂山道教文化、青岛啤酒与海鲜。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['高铁', '航班'],
    imageId: 124,
  },
  {
    slug: 'chengde',
    city: '承德',
    region: '华北',
    description: '皇家避暑胜地。避暑山庄、外八庙、金山岭长城与坝上草原骑马。',
    bestTime: '6-9月',
    bestSeason: '夏',
    transport: ['高铁', '航班'],
    imageId: 125,
  },
  {
    slug: 'datong',
    city: '大同',
    region: '华北',
    description: '北魏古都。云冈石窟、悬空寺、华严寺与大同古城墙的千年风华。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['高铁', '航班'],
    imageId: 126,
  },
  {
    slug: 'hulunbuir',
    city: '呼伦贝尔',
    region: '华北',
    description: '中国最美草原。莫日格勒河、满洲里国门、蒙古包星空与草原骑马。',
    bestTime: '6-9月',
    bestSeason: '夏',
    transport: ['航班'],
    imageId: 127,
  },
  {
    slug: 'harbin',
    city: '哈尔滨',
    region: '东北',
    description: '东方莫斯科。冰雪大世界、圣索菲亚教堂、中央大街与俄式红肠。',
    bestTime: '12-2月（冰雪）/ 6-8月（避暑）',
    bestSeason: '冬/夏',
    transport: ['航班', '高铁'],
    imageId: 128,
  },
  {
    slug: 'dalian',
    city: '大连',
    region: '东北',
    description: '北方明珠。星海广场、金石滩、老虎滩海洋公园与海鲜盛宴。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['航班', '高铁'],
    imageId: 129,
  },
  {
    slug: 'wuhan',
    city: '武汉',
    region: '华中',
    description: '九省通衢。黄鹤楼、东湖樱花园、户部巷热干面与长江夜游。',
    bestTime: '3-4月（樱花）/ 9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 130,
  },
  {
    slug: 'changsha',
    city: '长沙',
    region: '华中',
    description: '星城烟火气。岳麓书院、橘子洲头、坡子街美食与茶颜悦色。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 131,
  },
  {
    slug: 'fenghuang',
    city: '凤凰古城',
    region: '华中',
    description: '沈从文笔下的边城。沱江泛舟、吊脚楼、苗族银饰与篝火晚会。',
    bestTime: '3-11月',
    bestSeason: '春/夏/秋',
    transport: ['高铁', '专车'],
    imageId: 132,
  },
  {
    slug: 'enshi',
    city: '恩施',
    region: '华中',
    description: '中国仙本那。屏山峡谷悬浮船、恩施大峡谷、土司城与吊脚楼。',
    bestTime: '4-10月',
    bestSeason: '夏/秋',
    transport: ['航班', '高铁'],
    imageId: 133,
  },
  {
    slug: 'suzhou',
    city: '苏州',
    region: '华东',
    description: '东方威尼斯。拙政园、平江路、苏绣工坊与苏式园林的极致美学。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁'],
    imageId: 134,
  },
  {
    slug: 'nanjing',
    city: '南京',
    region: '华东',
    description: '六朝古都。中山陵、明孝陵、夫子庙与盐水鸭的金陵风韵。',
    bestTime: '3-5月，9-11月',
    bestSeason: '春/秋',
    transport: ['高铁', '航班'],
    imageId: 135,
  },
  {
    slug: 'putuoshan',
    city: '普陀山',
    region: '华东',
    description: '海天佛国。观音道场、普济禅寺、千步沙海滩与素食禅修。',
    bestTime: '3-11月',
    bestSeason: '春/夏/秋',
    transport: ['航班', '高铁'],
    imageId: 136,
  },
  {
    slug: 'qinghai-lake',
    city: '青海湖',
    region: '西北',
    description: '高原蓝宝石。环湖骑行、油菜花海、鸟岛观鸟与藏族帐篷。',
    bestTime: '6-8月',
    bestSeason: '夏',
    transport: ['航班', '高铁'],
    imageId: 137,
  },
  {
    slug: 'xiahe',
    city: '甘南',
    region: '西北',
    description: '藏传佛教圣地。拉卜楞寺转经、桑科草原、扎尕那石城与郎木寺。',
    bestTime: '6-9月',
    bestSeason: '夏/秋',
    transport: ['航班', '专车'],
    imageId: 138,
  },
  {
    slug: 'zhuhai',
    city: '珠海',
    region: '华南',
    description: '百岛之市。长隆海洋王国、情侣路、外伶仃岛与横琴蚝。',
    bestTime: '10-次年4月',
    bestSeason: '冬/春',
    transport: ['高铁', '航班'],
    imageId: 139,
  },
  {
    slug: 'wanning',
    city: '万宁',
    region: '华南',
    description: '冲浪胜地。日月湾、兴隆热带花园、南湾猴岛与咖啡文化。',
    bestTime: '11-次年4月',
    bestSeason: '冬/春',
    transport: ['航班', '高铁'],
    imageId: 140,
  },
  {
    slug: 'ningxia',
    city: '宁夏',
    region: '西北',
    description: '塞上江南。沙坡头沙漠体验、西夏王陵、贺兰山岩画与葡萄酒庄。',
    bestTime: '5-10月',
    bestSeason: '夏/秋',
    transport: ['航班', '高铁'],
    imageId: 141,
  },
];

// ─── 国内出发城市 ───

const DOMESTIC_HUBS: Record<string, string[]> = {
  '上海': ['PVG'],
  '北京': ['PEK'],
  '广州': ['CAN'],
  '深圳': ['SZX'],
  '成都': ['CTU'],
  '杭州': ['HGH'],
  '厦门': ['XMN'],
};

// ─── 路线生成逻辑 ───

interface RouteTemplate {
  origin: string;
  dest: string;
  transportType: string;
  priceBase: number;
  days: number;
  hasTransit?: string;
}

function generateRoutes(): RouteTemplate[] {
  const routes: RouteTemplate[] = [];
  const origins = Object.keys(DOMESTIC_HUBS);

  // 按区域分组
  const byRegion: Record<string, DomesticDest[]> = {};
  for (const d of DOMESTIC_DESTINATIONS) {
    if (!byRegion[d.region]) byRegion[d.region] = [];
    byRegion[d.region].push(d);
  }

  // 核心线路：每个目的地从主要枢纽城市出发
  for (const dest of DOMESTIC_DESTINATIONS) {
    const transport = dest.transport;

    // 上海出发（高铁/航班）
    if (transport.includes('高铁')) {
      routes.push({
        origin: '上海',
        dest: dest.slug,
        transportType: 'highspeed-rail',
        priceBase: 28000 + Math.floor(Math.random() * 20000),
        days: dest.slug === 'hangzhou' || dest.slug === 'moganshan' || dest.slug === 'xiamen' ? 3 : dest.slug === 'chengdu' ? 5 : 5,
      });
    }

    // 上海出发（航班）
    if (transport.includes('航班')) {
      routes.push({
        origin: '上海',
        dest: dest.slug,
        transportType: 'flight',
        priceBase: 35000 + Math.floor(Math.random() * 25000),
        days: dest.slug === 'lijiang' || dest.slug === 'dali' ? 6 : dest.slug === 'hangzhou' ? 4 : 5,
      });
    }

    // 北京出发（航班/高铁）
    if (transport.includes('航班')) {
      routes.push({
        origin: '北京',
        dest: dest.slug,
        transportType: 'flight',
        priceBase: 38000 + Math.floor(Math.random() * 25000),
        days: 5,
      });
    }
    if (transport.includes('高铁') && (dest.slug === 'hangzhou' || dest.slug === 'xian' || dest.slug === 'chengdu')) {
      routes.push({
        origin: '北京',
        dest: dest.slug,
        transportType: 'highspeed-rail',
        priceBase: 32000 + Math.floor(Math.random() * 15000),
        days: dest.slug === 'hangzhou' ? 4 : 5,
      });
    }

    // 广州/深圳出发（航班为主）
    if (transport.includes('航班')) {
      routes.push({
        origin: '广州',
        dest: dest.slug,
        transportType: 'flight',
        priceBase: 33000 + Math.floor(Math.random() * 22000),
        days: 5,
      });
    }

    // 成都出发（适合西南线路）
    if (dest.region === '西南') {
      routes.push({
        origin: '成都',
        dest: dest.slug,
        transportType: transport.includes('高铁') ? 'highspeed-rail' : 'flight',
        priceBase: 25000 + Math.floor(Math.random() * 15000),
        days: dest.slug === 'daocheng' ? 5 : dest.slug === 'lhasa' ? 7 : 4,
      });
    }

    // 杭州出发（适合华东线路）
    if (dest.region === '华东' && dest.slug !== 'hangzhou') {
      routes.push({
        origin: '杭州',
        dest: dest.slug,
        transportType: 'highspeed-rail',
        priceBase: 26000 + Math.floor(Math.random() * 12000),
        days: 3,
      });
    }

    // 厦门出发（适合华南线路）
    if (dest.region === '华南') {
      routes.push({
        origin: '厦门',
        dest: dest.slug,
        transportType: 'flight',
        priceBase: 30000 + Math.floor(Math.random() * 15000),
        days: 5,
      });
    }
  }

  return routes;
}

// ─── 种子函数 ───

export async function seedDomestic() {
  console.log('🇨🇳 开始导入国内奢华旅行数据...');

  // 1. 创建目的地
  const destMap: Record<string, string> = {};
  for (const d of DOMESTIC_DESTINATIONS) {
    const images = JSON.stringify([
      `https://picsum.photos/id/${d.imageId}/800/600`,
      `https://picsum.photos/id/${d.imageId + 20}/800/600`,
    ]);

    const dest = await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {
        scope: 'domestic',
        country: '中国',
        city: d.city,
        region: d.region,
        description: d.description,
        bestTime: d.bestTime,
        bestSeason: d.bestSeason,
        visa: '无需签证',
        transport: JSON.stringify(d.transport),
        images,
      },
      create: {
        slug: d.slug,
        scope: 'domestic',
        country: '中国',
        city: d.city,
        region: d.region,
        description: d.description,
        bestTime: d.bestTime,
        bestSeason: d.bestSeason,
        visa: '无需签证',
        transport: JSON.stringify(d.transport),
        images,
      },
    });
    destMap[d.slug] = dest.id;
    console.log(`  ✓ ${d.city}（${d.region}）`);
  }

  // 2. 创建路线
  const routeTemplates = generateRoutes();
  let count = 0;

  for (const r of routeTemplates) {
    if (!destMap[r.dest]) continue;

    const destInfo = DOMESTIC_DESTINATIONS.find((d) => d.slug === r.dest)!;
    const transportLabel = r.transportType === 'highspeed-rail' ? '高铁商务座' :
                          r.transportType === 'flight' ? '国内航班头等舱' :
                          r.transportType === 'helicopter' ? '私人直升机' : '专车';

    const slug = `domestic-${r.origin}-${r.dest}-${r.transportType}`;
    const name = `${r.origin} → ${destInfo.city} · ${transportLabel} · ${r.days}天${r.days - 1}晚`;

    await prisma.route.upsert({
      where: { slug },
      update: {
        scope: 'domestic',
        name,
        description: `${r.origin}出发，${transportLabel}前往${destInfo.city}，${r.days}天${r.days - 1}晚奢华体验`,
        origin: r.origin,
        destinationId: destMap[r.dest],
        price: r.priceBase,
        days: r.days,
        transportType: r.transportType,
        imageUrl: `https://picsum.photos/id/${destInfo.imageId + 10}/800/600`,
        galleryUrls: JSON.stringify([
          `https://picsum.photos/id/${destInfo.imageId + 10}/800/600`,
          `https://picsum.photos/id/${destInfo.imageId + 30}/800/600`,
        ]),
      },
      create: {
        slug,
        scope: 'domestic',
        name,
        description: `${r.origin}出发，${transportLabel}前往${destInfo.city}，${r.days}天${r.days - 1}晚奢华体验`,
        origin: r.origin,
        destinationId: destMap[r.dest],
        price: r.priceBase,
        days: r.days,
        transportType: r.transportType,
        imageUrl: `https://picsum.photos/id/${destInfo.imageId + 10}/800/600`,
        galleryUrls: JSON.stringify([
          `https://picsum.photos/id/${destInfo.imageId + 10}/800/600`,
          `https://picsum.photos/id/${destInfo.imageId + 30}/800/600`,
        ]),
      },
    });
    count++;
  }

  console.log(`\n✅ 国内数据导入完成：${Object.keys(destMap).length} 个目的地，${count} 条路线`);
}

// 独立运行
seedDomestic()
  .catch((e) => {
    console.error('❌ 国内数据导入失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
