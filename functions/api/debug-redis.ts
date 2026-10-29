// 临时调试端点：定位留言读取路径问题，用完即删
import { applyEnv, config } from '../../api/_lib/config';
import { redisCmd, redisPipeline, redisEnabled } from '../../api/_lib/redis';
import { coreToResponse, toCore, type FunctionContext } from './_lib/cf';

export const onRequest = async ({ request, env }: FunctionContext): Promise<Response> => {
  applyEnv(env);
  const core = await toCore(request);
  const hobbyId = String(core.query['hobbyId'] ?? 'final-check');
  const debug: Record<string, unknown> = {
    redisEnabled: redisEnabled(),
    urlHost: '',
    hobbyId,
    zrangeRaw: null,
    zrangeType: '',
    hgetallRaw: null,
    error: null,
  };
  try {
    debug.urlHost = (() => {
      try {
        return new URL(config.upstashUrl ?? '').host;
      } catch {
        return `INVALID_URL: ${JSON.stringify(config.upstashUrl)}`;
      }
    })();
    const raw = await redisCmd('ZRANGE', `msg:index:${hobbyId}`, '0', '-1');
    debug.zrangeRaw = raw;
    debug.zrangeType = Object.prototype.toString.call(raw);
    if (Array.isArray(raw) && raw.length) {
      const hashes = await redisPipeline(
        raw.map((id) => ['HGETALL', `msg:data:${hobbyId}:${String(id)}`])
      );
      debug.hgetallRaw = hashes;
    }
  } catch (e) {
    debug.error = String(e);
  }
  return coreToResponse({ status: 200, body: debug, headers: {} });
};
