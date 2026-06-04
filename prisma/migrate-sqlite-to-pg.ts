/**
 * SQLite → PostgreSQL 数据迁移脚本
 *
 * 从旧 SQLite dev.db 导出 Destination 和 Route 数据，写入 PostgreSQL
 * 执行：npx tsx prisma/migrate-sqlite-to-pg.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const pg = new PrismaClient();
const sqlite = new Database('prisma/dev.db');

interface OldDestination {
  id: string;
  slug: string;
  scope: string;
  country: string;
  city: string | null;
  region: string | null;
  description: string;
  bestTime: string;
  bestSeason: string | null;
  visa: string;
  transport: string | null;
  images: string;
  createdAt: string;
  updatedAt: string;
}

interface OldRoute {
  id: string;
  slug: string;
  scope: string;
  name: string;
  description: string;
  origin: string;
  transitId: string | null;
  destinationId: string;
  price: number;
  days: number;
  transportType: string;
  imageUrl: string;
  videoUrl: string | null;
  galleryUrls: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

async function main() {
  console.log('🔄 开始 SQLite → PostgreSQL 数据迁移...\n');

  // 1. 读取旧 Destination 数据
  const oldDests = sqlite.prepare('SELECT * FROM Destination').all() as OldDestination[];
  console.log(`📦 读取到 ${oldDests.length} 条目的地`);

  // 2. 建立 ID 映射（old cuid → new uuid）
  const destIdMap = new Map<string, string>();

  // 3. 写入 Destination
  let destCount = 0;
  for (const old of oldDests) {
    const newId = uuidv4();
    destIdMap.set(old.id, newId);

    await pg.destination.create({
      data: {
        id: newId,
        slug: old.slug,
        scope: old.scope,
        country: old.country,
        city: old.city,
        region: old.region,
        description: old.description,
        bestTime: old.bestTime,
        bestSeason: old.bestSeason,
        visa: old.visa,
        transport: old.transport,
        images: old.images,
      },
    });
    destCount++;
  }
  console.log(`  ✅ 写入 ${destCount} 条目的地`);

  // 4. 读取旧 Route 数据
  const oldRoutes = sqlite.prepare('SELECT * FROM Route').all() as OldRoute[];
  console.log(`📦 读取到 ${oldRoutes.length} 条路线`);

  // 5. 写入 Route
  let routeCount = 0;
  let skippedRoutes = 0;
  for (const old of oldRoutes) {
    const newDestId = destIdMap.get(old.destinationId);
    const newTransitId = old.transitId ? destIdMap.get(old.transitId) : null;

    // 跳过引用不存在目的地的路线
    if (!newDestId) {
      skippedRoutes++;
      continue;
    }

    await pg.route.create({
      data: {
        id: uuidv4(),
        slug: old.slug,
        scope: old.scope,
        name: old.name,
        description: old.description,
        origin: old.origin,
        transitId: newTransitId || null,
        destinationId: newDestId,
        price: old.price,
        days: old.days,
        transportType: old.transportType,
        imageUrl: old.imageUrl,
        videoUrl: old.videoUrl,
        galleryUrls: old.galleryUrls,
        isActive: old.isActive === 1,
      },
    });
    routeCount++;
  }
  console.log(`  ✅ 写入 ${routeCount} 条路线（跳过 ${skippedRoutes} 条引用失效）`);

  // 6. 验证
  const destTotal = await pg.destination.count();
  const routeTotal = await pg.route.count();
  console.log(`\n📊 验证：目的地 ${destTotal} 条，路线 ${routeTotal} 条`);
  console.log('🎉 数据迁移完成！');
}

main()
  .catch((e) => {
    console.error('❌ 迁移失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    sqlite.close();
    await pg.$disconnect();
  });
