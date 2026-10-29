// Cloudflare Pages Function：/api/messages
// 业务逻辑与 Vercel api/messages.ts 共享 api/_lib/router.ts；本文件仅做环境注入与格式适配。

import { applyEnv } from '../../api/_lib/config';
import { dispatchMessages } from '../../api/_lib/router';
import { toCore, coreToResponse, type FunctionContext } from './_lib/cf';

export const onRequest = async ({ request, env }: FunctionContext): Promise<Response> => {
  applyEnv(env);
  try {
    const core = await toCore(request);
    return coreToResponse(await dispatchMessages(core));
  } catch (err) {
    console.error('[cf/api/messages]', err);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后再试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
