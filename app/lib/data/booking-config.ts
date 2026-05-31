import type { AddOnConfig } from '../types/booking';

/** 附加项目录 */
export const ADD_ONS: AddOnConfig[] = [
  { id: 'helicopter', name: '私人直升机接驳', price: 38000, icon: 'Plane' },
  { id: 'michelin',   name: '米其林三星主厨私宴', price: 15000, icon: 'UtensilsCrossed' },
  { id: 'balloon',    name: '热气球日出体验', price: 8000, icon: 'Ticket' },
];

/** 兴趣标签 */
export const INTERESTS = [
  { emoji: '🍽️', label: '美食探索' },
  { emoji: '🍷', label: '葡萄酒品鉴' },
  { emoji: '🎨', label: '艺术文化' },
  { emoji: '⛰️', label: '户外探险' },
  { emoji: '🧘', label: '健康养生' },
  { emoji: '🛍️', label: '购物体验' },
  { emoji: '👨‍👩‍👧‍👦', label: '家庭活动' },
  { emoji: '🏆', label: '体育赛事' },
];

/** 饮食偏好 */
export const DIETARY_OPTIONS = [
  '素食', '纯素食', '无麸质', '无乳制品',
  '无坚果', '无贝类', '低糖', '无酒精',
];

/** 默认行程站点 */
export const DEFAULT_ROUTE = [
  { label: '起点', city: '巴黎', sub: 'Paris, France' },
  { label: '经停', city: '托斯卡纳', sub: 'Tuscany, Italy' },
  { label: '终点', city: '圣托里尼', sub: 'Santorini, Greece' },
];

/** 尊享礼遇 */
export const PRIVILEGES = [
  { icon: 'Shield', title: '私人管家 24/7', desc: '您的专属管家将全程待命，无论是临时行程调整还是突发需求，皆能在瞬息间为您妥善安排。' },
  { icon: 'Plane', title: '机场 VIP 快速通关', desc: '告别繁琐的排队等待。在主要枢纽机场享受礼宾接机、VIP 休息室及专属安检通道服务。' },
  { icon: 'Car', title: '全程私享司导', desc: '配备精通当地语言的高级司导。豪华座驾每日深度清洁，备有您喜爱的饮品与香氛。' },
  { icon: 'UtensilsCrossed', title: '餐厅优先预订权', desc: '纵使是极难预约的米其林餐厅或景观位，我们凭借全球资源为您锁定最佳席位。' },
  { icon: 'RotateCcw', title: '行程灵活改签', desc: '计划赶不上变化？我们提供极具灵活性的取消与改签政策，确保您的旅程无后顾之忧。' },
  { icon: 'Ticket', title: '礼宾通道 VIP 入场', desc: '卢浮宫、梵蒂冈博物馆等世界级景点，均可享受免排队礼宾通道及私人专家导览。' },
] as const;

/** 管家团队 */
export const TEAM_MEMBERS = [
  {
    name: 'Claire Lin', nameCn: '林婉清', badge: '高级策划师',
    avatar: 'https://picsum.photos/id/1027/200/200',
    bio: '10年奢华旅行定制经验，曾为多位知名企业家策划环球之旅。擅长挖掘目的地深层文化与隐秘奢华体验。',
    langs: ['中文', '英语', '法语'],
  },
  {
    name: 'Marco Rossi', nameCn: '', badge: '目的地专家',
    avatar: 'https://picsum.photos/id/1005/200/200',
    bio: '托斯卡纳本地专家，精通欧洲文化遗产与顶级酒庄资源。为您开启那些不对公众开放的私人庄园大门。',
    langs: ['意大利语', '英语', '中文'],
  },
] as const;

/** 默认基础价格（元） */
export const DEFAULT_BASE_PRICE = 128000;
