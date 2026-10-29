// Upstash Redis REST API 封装：纯 fetch，无需 redis 客户端依赖。
// 所有命令统一走 /pipeline（JSON 数组），规避 URL 编码问题（留言内容含换行/中文/空格）。
// 环境变量经 config 中心注入（applyEnv），Vercel / Cloudflare / express 三端共用。

import { config } from './config';

// 未配置环境变量时为 false，存储层自动降级为内存兜底（本地无 Upstash 联调用）
export const redisEnabled = (): boolean => Boolean(config.upstashUrl && config.upstashToken);

type RedisValue = string | number;
type Command = (string | number)[];

async function request(commands: Command[]): Promise<unknown[]> {
  const url = config.upstashUrl;
  const token = config.upstashToken;
  if (!url || !token) throw new Error('Upstash Redis 未配置');
  const res = await fetch(`${url.replace(/\/+$/, '')}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    // Serverless 函数内不缓存
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const data = (await res.json()) as { result?: unknown; error?: string }[];
  return data.map((item) => {
    if (item && typeof item === 'object' && 'error' in item && item.error) {
      throw new Error(`Upstash: ${item.error}`);
    }
    return item?.result;
  });
}

/** 执行单条命令，返回 result（可能为 null） */
export async function redisCmd(...args: Command): Promise<unknown> {
  return (await request([args]))[0];
}

/** 批量执行命令，按序返回 results */
export async function redisPipeline(commands: Command[]): Promise<unknown[]> {
  if (!commands.length) return [];
  return request(commands);
}
