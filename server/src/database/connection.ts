// 数据库连接 — SQLite via libsql
import { createClient, Client } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import * as path from 'path';

let _client: Client | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function getClient() {
  if (_client) return _client;
  const dbPath = path.resolve(__dirname, '../../data/lingzhu.db');
  _client = createClient({ url: `file:${dbPath}` });
  return _client;
}

export function getDb() {
  if (_db) return _db;
  _db = drizzle(getClient(), { schema });
  return _db;
}
