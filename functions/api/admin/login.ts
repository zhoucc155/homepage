// Cloudflare Pages Function：/api/admin/login（业务逻辑见 api/_lib/router.ts dispatchLogin）

import { applyEnv } from '../../../api/_lib/config';
import { dispatchLogin } from '../../../api/_lib/router';
import { toCore, coreToResponse, type FunctionContext } from '../_lib/cf';

export const onRequest = async ({ request, env }: FunctionContext): Promise<Response> => {
  applyEnv(env);
  try {
    const core = await toCore(request);
    return coreToResponse(await dispatchLogin(core));
  } catch (err) {
    console.error('[cf/api/admin/login]', err);
    return new Response(JSON.stringify({ error: '服务器错误，请稍后再试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }
};
