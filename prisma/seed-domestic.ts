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
