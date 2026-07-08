import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import path from 'path';
import fs from 'fs';
import os from 'os';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'stock-tracker-mvp-secret-key-2024'
);

// ===== SQLite 数据库（懒加载，避免 next build 时初始化导致锁定） =====

let _db: InstanceType<typeof Database> | null = null;

function getDb() {
  if (_db) return _db;

  const defaultDbPath = path.join(os.homedir(), '.qoderworkcn', 'data', 'stock-tracker', 'stock-tracker.db');
  const dbPath = process.env.DATABASE_PATH || defaultDbPath;
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT NOT NULL DEFAULT '',
      theme TEXT NOT NULL DEFAULT 'default',
      motto TEXT NOT NULL DEFAULT '珍惜市场给你的特别提款凭证的机会',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS stocks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      buy_price REAL NOT NULL,
      shares INTEGER NOT NULL,
      buy_date TEXT NOT NULL,
      current_price REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  return _db;
}

// ===== 类型定义 =====

export interface User {
  id: string;
  email: string;
  password: string;
  nickname: string;
  theme: string;
  motto: string;
  createdAt: string;
}

export interface Stock {
  id: string;
  userId: string;
  code: string;
  name: string;
  buyPrice: number;
  shares: number;
  buyDate: string;
  currentPrice: number;
}

// ===== 用户相关 =====

export async function createUser(email: string, password: string, nickname: string): Promise<User> {
  const existing = getDb().prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) throw new Error('该邮箱已被注册');

  const hashed = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    email,
    password: hashed,
    nickname,
    theme: 'default',
    motto: '珍惜市场给你的特别提款凭证的机会',
    createdAt: new Date().toISOString(),
  };

  getDb().prepare(`
    INSERT INTO users (id, email, password, nickname, theme, motto, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.email, user.password, user.nickname, user.theme, user.motto, user.createdAt);

  return user;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const row = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;
  if (!row) return null;

  const valid = await bcrypt.compare(password, row.password as string);
  if (!valid) return null;

  return {
    id: row.id as string,
    email: row.email as string,
    password: row.password as string,
    nickname: row.nickname as string,
    theme: row.theme as string,
    motto: row.motto as string,
    createdAt: row.created_at as string,
  };
}

export function getUserById(id: string): User | undefined {
  const row = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;

  return {
    id: row.id as string,
    email: row.email as string,
    password: row.password as string,
    nickname: row.nickname as string,
    theme: row.theme as string,
    motto: row.motto as string,
    createdAt: row.created_at as string,
  };
}

export function updateUserTheme(userId: string, theme: string) {
  getDb().prepare('UPDATE users SET theme = ? WHERE id = ?').run(theme, userId);
}

export function updateUserMotto(userId: string, motto: string) {
  getDb().prepare('UPDATE users SET motto = ? WHERE id = ?').run(motto, userId);
}

// ===== 股票相关 =====

export function getStocksByUser(userId: string): Stock[] {
  const rows = getDb().prepare('SELECT * FROM stocks WHERE user_id = ?').all(userId) as Record<string, unknown>[];
  return rows.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    code: row.code as string,
    name: row.name as string,
    buyPrice: row.buy_price as number,
    shares: row.shares as number,
    buyDate: row.buy_date as string,
    currentPrice: row.current_price as number,
  }));
}

export function addStock(stock: Omit<Stock, 'id'>): Stock {
  const newStock: Stock = { ...stock, id: crypto.randomUUID() };
  getDb().prepare(`
    INSERT INTO stocks (id, user_id, code, name, buy_price, shares, buy_date, current_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(newStock.id, newStock.userId, newStock.code, newStock.name, newStock.buyPrice, newStock.shares, newStock.buyDate, newStock.currentPrice);
  return newStock;
}

export function deleteStock(stockId: string, userId: string) {
  getDb().prepare('DELETE FROM stocks WHERE id = ? AND user_id = ?').run(stockId, userId);
}

export function updateStockPrice(stockId: string, price: number) {
  getDb().prepare('UPDATE stocks SET current_price = ? WHERE id = ?').run(price, stockId);
}

// ===== JWT =====

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.userId as string;
  } catch {
    return null;
  }
}

// ===== 模拟股票价格数据（API 失败时的回退） =====

const mockPrices: Record<string, { name: string; price: number }> = {
  '600519': { name: '贵州茅台', price: 1680.50 },
  '000858': { name: '五粮液', price: 148.20 },
  '601318': { name: '中国平安', price: 45.80 },
  '000001': { name: '平安银行', price: 11.35 },
  '600036': { name: '招商银行', price: 35.60 },
  '002594': { name: '比亚迪', price: 268.90 },
  '300750': { name: '宁德时代', price: 198.50 },
  '601012': { name: '隆基绿能', price: 18.75 },
  '600900': { name: '长江电力', price: 28.40 },
  '002475': { name: '立讯精密', price: 32.15 },
  '600276': { name: '恒瑞医药', price: 42.30 },
  '000333': { name: '美的集团', price: 58.90 },
  '601888': { name: '中国中免', price: 62.50 },
  '002714': { name: '牧原股份', price: 38.70 },
  '600809': { name: '山西汾酒', price: 168.00 },
  '09988': { name: '阿里巴巴-W', price: 78.35 },
  '00700': { name: '腾讯控股', price: 388.60 },
  '03690': { name: '美团-W', price: 128.40 },
  '09618': { name: '京东集团-SW', price: 118.50 },
  '09999': { name: '网易-S', price: 152.80 },
  '01024': { name: '快手-W', price: 48.90 },
  '09888': { name: '百度集团-SW', price: 88.20 },
  '01810': { name: '小米集团-W', price: 18.65 },
  '09961': { name: '携程集团-S', price: 368.00 },
  '06690': { name: '海尔智家', price: 26.80 },
  'AAPL': { name: '苹果', price: 225.30 },
  'TSLA': { name: '特斯拉', price: 248.50 },
  'NVDA': { name: '英伟达', price: 132.80 },
  'MSFT': { name: '微软', price: 448.60 },
  'GOOGL': { name: '谷歌', price: 178.90 },
  'AMZN': { name: '亚马逊', price: 192.40 },
  'META': { name: 'Meta', price: 510.20 },
  'BABA': { name: '阿里巴巴(US)', price: 82.50 },
  'PDD': { name: '拼多多', price: 128.60 },
  'JD': { name: '京东(US)', price: 32.80 },
};

export function searchStock(keyword: string): { code: string; name: string; price: number }[] {
  const results: { code: string; name: string; price: number }[] = [];
  const kw = keyword.toLowerCase();
  for (const [code, data] of Object.entries(mockPrices)) {
    if (code.toLowerCase().includes(kw) || data.name.toLowerCase().includes(kw)) {
      results.push({ code, name: data.name, price: data.price });
    }
  }
  return results;
}

export function getStockPrice(code: string): { name: string; price: number } | null {
  return mockPrices[code] || null;
}
