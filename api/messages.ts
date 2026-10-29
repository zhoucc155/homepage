// /api/messages —— Vercel Node handler 薄适配层：环境注入 + req/res → CoreRequest/CoreResponse。
// 业务逻辑统一在 api/_lib/router.ts（与 Cloudflare functions/api/messages.ts 共享同一份）。

import { applyEnv } from './_lib/config';
import { dispatchMessages, type CoreRequest } from './_lib/router';
import type { ApiRequest, ApiResponse } from './_lib/auth';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyEnv();
  const core: CoreRequest = {
    method: req.method ?? 'GET',
    query: req.query ?? {},
    body: req.body,
    headers: req.headers ?? {},
  };
  try {
    const r = await dispatchMessages(core);
    for (const [name, value] of Object.entries(r.headers)) res.setHeader(name, value);
    return res.status(r.status).json(r.body);
  } catch (err) {
    console.error('[api/messages]', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}
