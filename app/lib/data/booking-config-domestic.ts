import type { AddOnConfig } from '../types/booking';

/** 国内附加项目录 */
export const DOMESTIC_ADD_ONS: AddOnConfig[] = [
  { id: 'domestic-hsr-vip', name: '高铁商务座升级', price: 3800, icon: 'Plane' },
  { id: 'domestic-chef', name: '非遗传承人私享体验', price: 6800, icon: 'UtensilsCrossed' },
  { id: 'domestic-spa', name: '顶级温泉私汤体验', price: 5200, icon: 'Ticket' },
];

/** 国内兴趣标签 */
export const DOMESTIC_INTERESTS = [
  { emoji: '🍵', label: '茶道禅修' },
  { emoji: '🏔️', label: '雪山徒步' },
  { emoji: '♨️', label: '温泉养生' },
  { emoji: '🏯', label: '古镇文化' },
  { emoji: '🍲', label: '地道美食' },
  { emoji: '🎿', label: '滑雪运动' },
  { emoji: '📸', label: '摄影采风' },
  { emoji: '👨‍👩‍👧‍👦', label: '亲子时光' },
];

/** 国内饮食偏好 */
export const DOMESTIC_DIETARY_OPTIONS = [
  '川味火锅', '粤式早茶', '素食', '清真',
  '无辣', '低盐低油', '有机食材', '无酒精',
];

/** 国内尊享礼遇 */
export const DOMESTIC_PRIVILEGES = [
  { icon: 'Shield', title: '私人管家 24/7', desc: '您的专属管家全程待命，行程调整、突发需求、紧急协助，一个电话即刻响应。' },
  { icon: 'Car', title: '高铁站/机场专车接送', desc: '黑色商务车直达贵宾通道，免去排队等候。车内备有热茶、香氛与舒适拖鞋。' },
  { icon: 'UtensilsCrossed', title: '顶级中餐厅私宴', desc: '为您预约各地最难订的米其林中餐厅与私房菜，体验舌尖上的中国。' },
  { icon: 'RotateCcw', title: '行程灵活改签', desc: '国内出行更随心——提前24小时免费改签，让您的旅程无后顾之忧。' },
  { icon: 'Ticket', title: '非遗传承人私享', desc: '茶道大师、景德镇瓷器匠人、白族扎染传承人……为您开启文化深层体验。' },
  { icon: 'Plane', title: '直升机/游艇可选', desc: '顶级线路可升级私人直升机空中游览或游艇出海，俯瞰大地之美。' },
] as const;

/** 国内管家团队 */
export const DOMESTIC_TEAM_MEMBERS = [
  {
    name: '沈佳怡', nameCn: '', badge: '高级策划师',
    avatar: 'https://picsum.photos/id/1011/200/200',
    bio: '8年国内奢华旅行定制经验，深耕西南秘境与江南雅致线路。熟悉每一处隐世庄园与私享体验。',
    langs: ['中文', '英语'],
  },
  {
    name: '李云飞', nameCn: '', badge: '目的地专家',
    avatar: 'https://picsum.photos/id/1012/200/200',
    bio: '户外探险领队出身，精通高原徒步与雪山攀登路线。稻城亚丁、贡嘎雪山、西藏林芝深度玩家。',
    langs: ['中文', '英语', '藏语'],
  },
] as const;

/** 国内默认基础价格（元） */
export const DOMESTIC_DEFAULT_BASE_PRICE = 38000;
