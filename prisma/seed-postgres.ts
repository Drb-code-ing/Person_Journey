/**
 * PostgreSQL 种子数据
 *
 * 用途：初始化 member_level、sys_dict、sys_config 等系统配置数据
 * 执行：npx tsx prisma/seed-postgres.ts
 *
 * 注意：此脚本在 prisma migrate 之后执行，需要先 prisma generate
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始初始化种子数据...\n');

  // ═══ 1. 会员等级 ═══
  console.log('📋 初始化会员等级...');
  const levels = [
    { levelCode: 'silver',   levelName: '银卡会员', icon: '🥈', minSpend: 0,      benefits: '专属客服 · 优先预订',     discountRate: 1.00, sortOrder: 1 },
    { levelCode: 'gold',     levelName: '金卡会员', icon: '🥇', minSpend: 30000,  benefits: '房型升级 · 早餐赠送',     discountRate: 0.98, sortOrder: 2 },
    { levelCode: 'platinum', levelName: '铂金会员', icon: '💎', minSpend: 80000,  benefits: '私人管家 · 机场贵宾',     discountRate: 0.95, sortOrder: 3 },
    { levelCode: 'diamond',  levelName: '黑钻会员', icon: '👑', minSpend: 200000, benefits: '全定制行程 · 全球礼遇',   discountRate: 0.90, sortOrder: 4 },
  ];

  for (const level of levels) {
    await prisma.memberLevel.upsert({
      where: { levelCode: level.levelCode },
      create: level,
      update: { levelName: level.levelName, icon: level.icon, minSpend: level.minSpend, benefits: level.benefits, discountRate: level.discountRate, sortOrder: level.sortOrder },
    });
  }
  console.log(`  ✅ ${levels.length} 条会员等级`);

  // ═══ 2. 数据字典 ═══
  console.log('📋 初始化数据字典...');
  const dicts = [
    // 交通方式
    { dictType: 'transport_type', dictCode: 'flight',         dictLabel: '航班',        dictValue: 'flight',         sortOrder: 1 },
    { dictType: 'transport_type', dictCode: 'highspeed-rail', dictLabel: '高铁',        dictValue: 'highspeed-rail', sortOrder: 2 },
    { dictType: 'transport_type', dictCode: 'helicopter',     dictLabel: '直升机',      dictValue: 'helicopter',     sortOrder: 3 },
    { dictType: 'transport_type', dictCode: 'cruise',         dictLabel: '邮轮',        dictValue: 'cruise',         sortOrder: 4 },
    { dictType: 'transport_type', dictCode: 'car',            dictLabel: '专车',        dictValue: 'car',            sortOrder: 5 },
    // 订单状态
    { dictType: 'booking_status', dictCode: 'draft',          dictLabel: '草稿',        dictValue: 'draft',          sortOrder: 1 },
    { dictType: 'booking_status', dictCode: 'submitted',      dictLabel: '已提交',      dictValue: 'submitted',      sortOrder: 2 },
    { dictType: 'booking_status', dictCode: 'confirmed',      dictLabel: '已确认',      dictValue: 'confirmed',      sortOrder: 3 },
    { dictType: 'booking_status', dictCode: 'paid',           dictLabel: '已支付',      dictValue: 'paid',           sortOrder: 4 },
    { dictType: 'booking_status', dictCode: 'in_progress',    dictLabel: '进行中',      dictValue: 'in_progress',    sortOrder: 5 },
    { dictType: 'booking_status', dictCode: 'completed',      dictLabel: '已完成',      dictValue: 'completed',      sortOrder: 6 },
    { dictType: 'booking_status', dictCode: 'cancelled',      dictLabel: '已取消',      dictValue: 'cancelled',      sortOrder: 7 },
    { dictType: 'booking_status', dictCode: 'refunded',       dictLabel: '已退款',      dictValue: 'refunded',       sortOrder: 8 },
    // 业务范围
    { dictType: 'scope', dictCode: 'international', dictLabel: '国际', dictValue: 'international', sortOrder: 1 },
    { dictType: 'scope', dictCode: 'domestic',      dictLabel: '国内', dictValue: 'domestic',      sortOrder: 2 },
    // 用户状态
    { dictType: 'user_status', dictCode: 'active',   dictLabel: '正常', dictValue: '1', sortOrder: 1 },
    { dictType: 'user_status', dictCode: 'frozen',   dictLabel: '冻结', dictValue: '2', sortOrder: 2 },
    { dictType: 'user_status', dictCode: 'cancelled',dictLabel: '注销', dictValue: '3', sortOrder: 3 },
    // 空间主题
    { dictType: 'space_theme', dictCode: 'nebula',  dictLabel: '星云', dictValue: 'nebula',  sortOrder: 1 },
    { dictType: 'space_theme', dictCode: 'aurora',  dictLabel: '极光', dictValue: 'aurora',  sortOrder: 2 },
    { dictType: 'space_theme', dictCode: 'cosmic',  dictLabel: '宇宙', dictValue: 'cosmic',  sortOrder: 3 },
    { dictType: 'space_theme', dictCode: 'ocean',   dictLabel: '海洋', dictValue: 'ocean',   sortOrder: 4 },
  ];

  for (const dict of dicts) {
    await prisma.sysDict.upsert({
      where: { dictType_dictCode: { dictType: dict.dictType, dictCode: dict.dictCode } },
      create: dict,
      update: { dictLabel: dict.dictLabel, dictValue: dict.dictValue, sortOrder: dict.sortOrder },
    });
  }
  console.log(`  ✅ ${dicts.length} 条数据字典`);

  // ═══ 3. 系统配置 ═══
  console.log('📋 初始化系统配置...');
  const configs = [
    { configKey: 'booking.max_adults',         configValue: '10',     configType: 'number',  description: '单次预订最大成人数' },
    { configKey: 'booking.max_children',       configValue: '6',      configType: 'number',  description: '单次预订最大儿童数' },
    { configKey: 'booking.child_discount',     configValue: '0.7',    configType: 'number',  description: '儿童折扣率' },
    { configKey: 'booking.group_discount',     configValue: '0.92',   configType: 'number',  description: '团体折扣率（4人以上）' },
    { configKey: 'upload.max_avatar_size',     configValue: '5242880',configType: 'number',  description: '头像最大文件大小（字节）' },
    { configKey: 'upload.allowed_image_types', configValue: 'image/png,image/jpeg,image/webp', configType: 'string', description: '允许的图片MIME类型' },
    { configKey: 'member.auto_upgrade',        configValue: 'true',   configType: 'boolean', description: '自动升级会员等级' },
  ];

  for (const config of configs) {
    await prisma.sysConfig.upsert({
      where: { configKey: config.configKey },
      create: config,
      update: { configValue: config.configValue, configType: config.configType, description: config.description },
    });
  }
  console.log(`  ✅ ${configs.length} 条系统配置`);

  console.log('\n🎉 种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
