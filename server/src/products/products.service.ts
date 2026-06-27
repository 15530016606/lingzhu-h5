// 产品数据 — NestJS Service
import { Injectable } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { products } from '@/database/schema';
import { eq, and, sql, SQL } from 'drizzle-orm';

export interface ProductQuery {
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

function sqlStr(col: string, val: any): SQL {
  return sql`${sql.identifier(col)} = ${val}`;
}

@Injectable()
export class ProductsService {
  async findAll(query: ProductQuery) {
    const db = getDb();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (query.type) conditions.push(sqlStr('type', query.type));
    if (query.category) conditions.push(sqlStr('category', query.category));
    if (query.isActive !== undefined) conditions.push(sqlStr('is_active', query.isActive ? 1 : 0));
    else conditions.push(sqlStr('is_active', 1));

    const where = conditions.length > 0 ? and(...(conditions as [SQL, ...SQL[]])) : undefined;

    const data = await db.select().from(products)
      .where(where)
      .limit(limit)
      .offset(offset)
      .all();

    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(products).where(where).all();
    const total = Number(totalResult[0]?.count || 0);

    return { data, total, page, limit };
  }

  async findById(id: number) {
    const db = getDb();
    const result = await db.select().from(products).where(eq(products.id, id)).all();
    return result[0] || null;
  }

  async create(data: any) {
    const db = getDb();
    const result = await db.insert(products).values({
      name: data.name,
      type: data.type || 'bead' as const,
      category: data.category,
      materialType: data.materialType,
      size: data.size,
      price: Math.round(data.price * 100),
      imageUrl: data.imageUrl,
      stock: data.stock ?? 100,
      isActive: data.isActive !== undefined ? data.isActive : true,
    }).returning();
    return result[0];
  }

  async update(id: number, data: any) {
    const db = getDb();
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.materialType !== undefined) updateData.materialType = data.materialType;
    if (data.size !== undefined) updateData.size = data.size;
    if (data.price !== undefined) updateData.price = Math.round(data.price * 100);
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const result = await db.update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async remove(id: number) {
    const db = getDb();
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  }

  async getCategories() {
    const db = getDb();
    const result = await db.selectDistinct({ category: products.category }).from(products).all();
    return result.map(r => r.category);
  }
}
