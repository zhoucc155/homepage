// /api/admin/login —— 管理员登录
//   POST {password} → 校验通过签发随机 token（12h），前端存 sessionStorage；
//                     密码错误 401 + 1 秒延迟防爆破

import { isValidAdminPassword, sleep, genToken, type ApiRequest, type ApiResponse } from '../_lib/auth';
import { issueAdminToken } from '../_lib/store';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const password = (req.body as Record<string, unknown> | undefined)?.password;
    if (!isValidAdminPassword(password)) {
      await sleep(1000);
      return res.status(401).json({ error: '密码错误，请重试' });
    }
    const token = genToken();
    await issueAdminToken(token);
    return res.status(200).json({ token });
  } catch (err) {
    console.error('[api/admin/login]', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}
