// Cloudflare Pages Functions 适配助手：标准 Request/Response ↔ 平台无关 CoreRequest/CoreResponse。
// 下划线前缀目录不会被 Pages 路由器当成路由，仅作为私有模块使用。
// 业务逻辑统一在 api/_lib/router.ts，与 Vercel、本地 express 共享同一份。

import type { CoreRequest, CoreResponse } from '../../../api/_lib/router';

export interface PagesEnv {
  ADMIN_PASSWORD?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  [key: string]: string | undefined;
}

const BODY_METHODS = new Set(['POST', 'PATCH', 'PUT']);

/** 标准 Request → CoreRequest（query 平铺为 string；body 尝试 JSON 解析，失败置 undefined） */
export async function toCore(request: Request): Promise<CoreRequest> {
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    query[k] = v;
  });

  let body: unknown;
  if (BODY_METHODS.has(request.method)) {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  return {
    method: request.method,
    query,
    body,
    headers: Object.fromEntries(request.headers.entries()),
  };
}

/** CoreResponse → 标准 Response（统一 application/json） */
export function coreToResponse(r: CoreResponse): Response {
  return new Response(JSON.stringify(r.body), {
    status: r.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...r.headers },
  });
}

/** Pages Function 入参（loose 类型：官方 PagesFunction 类型需额外依赖，此处结构化等价） */
export interface FunctionContext {
  request: Request;
  env: PagesEnv;
}
