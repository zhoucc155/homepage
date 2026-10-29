// /api/admin/logout —— 管理员登出：吊销 Bearer token（前端同时清 sessionStorage）

import { getBearerToken, type ApiRequest, type ApiResponse } from '../_lib/auth';
import { revokeAdminToken } from '../_lib/store';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const token = getBearerToken(req);
    if (token) await revokeAdminToken(token);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/admin/logout]', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}
