export type Tour = {
  id: string
  image: string
  video?: string
  images: string[]
  name: string
  description: string
  price: number
  priceDisplay: string
  friends: number
  bestTime: string
  visa: string
  imgH: number
  w: number
}

export const tours: Tour[] = [
  {
    id: 'cold-islands-norway',
    image: 'https://picsum.photos/id/1004/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_071134_9cc2f2d8-a599-4a73-8c89-6eb4af170352.mp4',
    images: ['https://picsum.photos/id/1002/800/1000', 'https://picsum.photos/id/1019/800/1000', 'https://picsum.photos/id/1018/800/1000'],
    name: '挪威 · 寒冷群岛',
    description:
      "体验挪威偏远北极岛屿的原始之美。从壮丽的峡湾到神奇的北极光，挪威完美融合了荒野探险与斯堪的纳维亚文化。",
    price: 1800,
    priceDisplay: '¥12,800',
    friends: 8,
    bestTime: '6月 - 9月',
    visa: '申根 / 欧盟',
    imgH: 230,
    w: 200,
  },
  {
    id: 'serengeti-tanzania',
    image: 'https://picsum.photos/id/1043/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_220929_e6719f25-1ba0-45c2-97fc-0148805d9fb9.mp4',
    images: ['https://picsum.photos/id/1044/800/1000', 'https://picsum.photos/id/1035/800/1000', 'https://picsum.photos/id/1001/800/1000'],
    name: '坦桑尼亚 · 塞伦盖蒂',
    description:
      '见证地球上最壮观的野生动物奇观。塞伦盖蒂提供无与伦比的游猎体验，从动物大迁徙到近距离接触非洲五霸，穿越无尽的金色平原。',
    price: 2400,
    priceDisplay: '¥16,800',
    friends: 14,
    bestTime: '7月 - 10月',
    visa: '落地签',
    imgH: 310,
    w: 340,
  },
  {
    id: 'switzerland-alps',
    image: 'https://picsum.photos/id/1015/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_071134_9cc2f2d8-a599-4a73-8c89-6eb4af170352.mp4',
    images: ['https://picsum.photos/id/1004/800/1000', 'https://picsum.photos/id/1019/800/1000', 'https://picsum.photos/id/1016/800/1000'],
    name: '瑞士 · 阿尔卑斯',
    description:
      '体验高山宁静的极致之美。从少女峰地区的原始山峰到布里恩茨湖清澈见底的湖水，瑞士完美融合了高端舒适与原始自然。',
    price: 3200,
    priceDisplay: '¥22,800',
    friends: 12,
    bestTime: '5月 - 10月',
    visa: '申根 / 欧盟',
    imgH: 360,
    w: 250,
  },
  {
    id: 'norway-coastal',
    image: 'https://picsum.photos/id/1002/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260509_073207_eeb9b7e5-7df4-4204-80c2-163eb46466e8.mp4',
    images: ['https://picsum.photos/id/1004/800/1000', 'https://picsum.photos/id/1018/800/1000', 'https://picsum.photos/id/1019/800/1000'],
    name: '挪威 · 海岸航行',
    description:
      "航行穿越挪威壮丽的海岸线，碧绿海水与高耸悬崖交相辉映。这是地球上最震撼人心的风景之旅。",
    price: 1800,
    priceDisplay: '¥12,800',
    friends: 6,
    bestTime: '5月 - 8月',
    visa: '申根 / 欧盟',
    imgH: 215,
    w: 210,
  },
  {
    id: 'mountain-valleys-iceland',
    image: 'https://picsum.photos/id/1019/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_220929_e6719f25-1ba0-45c2-97fc-0148805d9fb9.mp4',
    images: ['https://picsum.photos/id/1044/800/1000', 'https://picsum.photos/id/1015/800/1000', 'https://picsum.photos/id/1018/800/1000'],
    name: '冰岛 · 山谷秘境',
    description:
      "探索冰岛超现实的火山地貌、飞流直下的瀑布和地热奇观。一个与其他任何地方都不同的冰与火之地。",
    price: 2100,
    priceDisplay: '¥14,800',
    friends: 9,
    bestTime: '6月 - 8月',
    visa: '申根 / 欧盟',
    imgH: 250,
    w: 235,
  },
  {
    id: 'hidden-coves-croatia',
    image: 'https://picsum.photos/id/1035/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260509_073207_eeb9b7e5-7df4-4204-80c2-163eb46466e8.mp4',
    images: ['https://picsum.photos/id/1001/800/1000', 'https://picsum.photos/id/1043/800/1000', 'https://picsum.photos/id/1044/800/1000'],
    name: '克罗地亚 · 隐秘海湾',
    description:
      "探索克罗地亚幽静的亚得里亚海海岸线——清澈见底的海水、古老的城墙城市和迷人的渔村，坐落在壮观的石灰岩悬崖之间。",
    price: 1950,
    priceDisplay: '¥13,800',
    friends: 11,
    bestTime: '5月 - 9月',
    visa: '申根 / 欧盟',
    imgH: 300,
    w: 220,
  },
  {
    id: 'desert-dunes-morocco',
    image: 'https://picsum.photos/id/1001/800/1000',
    video: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_071134_9cc2f2d8-a599-4a73-8c89-6eb4af170352.mp4',
    images: ['https://picsum.photos/id/1043/800/1000', 'https://picsum.photos/id/1035/800/1000', 'https://picsum.photos/id/1016/800/1000'],
    name: '摩洛哥 · 沙漠之丘',
    description:
      "深入撒哈拉的广阔金色沙丘、古老麦地那和热闹集市。摩洛哥融合了柏柏尔、阿拉伯和法国文化，带来令人难忘的感官之旅。",
    price: 1600,
    priceDisplay: '¥11,800',
    friends: 7,
    bestTime: '10月 - 4月',
    visa: '免签 / 90天',
    imgH: 240,
    w: 215,
  },
]

export function getTourById(id: string): Tour | undefined {
  return tours.find((t) => t.id === id)
}
