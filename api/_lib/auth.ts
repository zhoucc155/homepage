// 管理员鉴权 + 输入校验。密码比对使用 timingSafeEqual 防时序攻击。

import { timingSafeEqual, randomBytes } from 'node:crypto';
import { verifyAdminToken } from './store';

/** 最小请求/响应接口：兼容 Vercel Node functions 与 express（本地 server.ts 复用同一份 handler） */
export interface ApiRequest {
  method?: string;
  query: Record<string, string | string[] | undefined> | undefined;
  body: unknown;
  headers: Record<string, string | string[] | undefined> | undefined;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(data: unknown): void;
  setHeader(name: string, value: string): ApiResponse;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 恒时比对管理员密码；未配置 ADMIN_PASSWORD 时一律失败 */
export function isValidAdminPassword(input: unknown): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || typeof input !== 'string') return false;
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) {
    // 长度不等时也烧一次恒时比较，避免通过耗时探测密码长度
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function genToken(): string {
  return randomBytes(24).toString('hex');
}

/** 从 Authorization: Bearer <token> 提取 token */
export function getBearerToken(req: ApiRequest): string | null {
  const raw = req.headers?.authorization;
  if (typeof raw !== 'string') return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  return m ? m[1].trim() : null;
}

/** 请求是否携带有效管理员 token */
export async function isAdminRequest(req: ApiRequest): Promise<boolean> {
  const token = getBearerToken(req);
  if (!token) return false;
  return verifyAdminToken(token);
}

// ---------------------------------------------------------------------------
// 输入校验
// ---------------------------------------------------------------------------

export const isValidHobbyId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-z0-9-]{1,64}$/.test(v);

export const isValidVisitorId = (v: unknown): v is string =>
  typeof v === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(v);

/** 清洗留言正文：trim 后需为 1~100 字 */
export function sanitizeContent(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const s = v.trim();
  if (!s || s.length > 100) return null;
  return s;
}

export function firstQuery(req: ApiRequest, key: string): string | undefined {
  const v = req.query?.[key];
  return Array.isArray(v) ? v[0] : v;
}
