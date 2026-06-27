// 原料 + 采集源 API
import { Injectable } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { collectionSources, rawMaterialTypes } from '@/database/schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class RawMaterialsService {
  async getSources() {
    const db = getDb();
    return db.select().from(collectionSources).all();
  }

  async getMaterials(sourceId?: string) {
    const db = getDb();
    if (sourceId) {
      return db.select().from(rawMaterialTypes)
        .where(sql`source_id = ${sourceId}`)
        .all();
    }
    return db.select().from(rawMaterialTypes).all();
  }
}
