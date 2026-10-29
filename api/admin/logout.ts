// /api/admin/logout —— Vercel Node handler 薄适配层（业务逻辑见 api/_lib/router.ts）

import { applyEnv } from '../_lib/config';
import { dispatchLogout, type CoreRequest } from '../_lib/router';
import type { ApiRequest, ApiResponse } from '../_lib/auth';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  applyEnv();
  const core: CoreRequest = {
    method: req.method ?? 'GET',
    query: req.query ?? {},
    body: req.body,
    headers: req.headers ?? {},
  };
  try {
    const r = await dispatchLogout(core);
    return res.status(r.status).json(r.body);
  } catch (err) {
    console.error('[api/admin/logout]', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}
