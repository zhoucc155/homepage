// 平台无关的环境配置中心。
//   Vercel / express：process.env 直接可用，handler 入口调用 applyEnv()（无参）即可；
//   Cloudflare Pages Functions：环境变量挂在请求的 env 上，每请求调用 applyEnv(env)。
// 读取统一走 config 的 getter（惰性取值，两平台共用同一份存储层与鉴权层）。

export interface AppEnv {
  ADMIN_PASSWORD?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  [key: string]: string | undefined;
}

const envStore: AppEnv = {};

/** Node 的 process.env 兜底：Cloudflare 运行时可能不存在 process，须安全访问 */
function nodeEnv(): AppEnv | undefined {
  try {
    return typeof process !== 'undefined' && process.env ? (process.env as AppEnv) : undefined;
  } catch {
    return undefined;
  }
}

/** 应用环境变量：显式传入的 env 优先（Cloudflare），否则回落 process.env（Vercel / express） */
export function applyEnv(env?: AppEnv): void {
  const fallback = nodeEnv();
  envStore.ADMIN_PASSWORD = env?.ADMIN_PASSWORD ?? fallback?.ADMIN_PASSWORD;
  envStore.UPSTASH_REDIS_REST_URL = env?.UPSTASH_REDIS_REST_URL ?? fallback?.UPSTASH_REDIS_REST_URL;
  envStore.UPSTASH_REDIS_REST_TOKEN =
    env?.UPSTASH_REDIS_REST_TOKEN ?? fallback?.UPSTASH_REDIS_REST_TOKEN;
}

export const config = {
  get adminPassword(): string | undefined {
    return envStore.ADMIN_PASSWORD;
  },
  get upstashUrl(): string | undefined {
    return envStore.UPSTASH_REDIS_REST_URL;
  },
  get upstashToken(): string | undefined {
    return envStore.UPSTASH_REDIS_REST_TOKEN;
  },
};
