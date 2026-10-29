// 平台无关的 API 路由核心：纯函数输入输出，不感知任何服务器运行时。
//   输入 CoreRequest：method / query / body / headers（与平台解耦的最小结构）
//   输出 CoreResponse：status / body / headers
// 各平台的薄适配层（Vercel api/*.ts、Cloudflare functions/api/*.ts、本地 express）
// 只负责环境变量注入与请求/响应格式转换，业务逻辑全部收敛在本文件。

import {
  listMessages,
  createMessage,
  deleteMessage,
  patchMessage,
  issueAdminToken,
  revokeAdminToken,
  type PatchAction,
} from './store';
import {
  isAdminRequest,
  isValidAdminPassword,
  isValidHobbyId,
  isValidVisitorId,
  sanitizeContent,
  genToken,
  sleep,
  getBearerToken,
} from './auth';

export interface CoreRequest {
  method: string;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

export interface CoreResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

const ok = (body: unknown, headers: Record<string, string> = {}): CoreResponse => ({
  status: 200,
  body,
  headers,
});
const fail = (status: number, error: string, extra: Record<string, unknown> = {}): CoreResponse => ({
  status,
  body: { error, ...extra },
  headers: {},
});

const first = (req: CoreRequest, key: string): string | undefined => {
  const v = req.query[key];
  return Array.isArray(v) ? v[0] : v;
};

// ---------------------------------------------------------------------------
// /api/messages —— 留言板读写
//   GET    ?hobbyId=&visitorId=            → 可见留言（approved + 本人 pending；管理员含全部 pending）
//   POST   {hobbyId, visitorId, content}   → 创建 pending 留言（限频 60s/visitorId）
//   DELETE ?hobbyId=&id=&visitorId=        → 删除（Bearer token=管理员删任意；否则仅本人）
//   PATCH  {hobbyId, id, action}           → 管理员操作 approve / reject / pin / unpin
// ---------------------------------------------------------------------------

export async function dispatchMessages(req: CoreRequest): Promise<CoreResponse> {
  switch (req.method) {
    case 'GET':
      return await messagesGet(req);
    case 'POST':
      return await messagesPost(req);
    case 'DELETE':
      return await messagesDelete(req);
    case 'PATCH':
      return await messagesPatch(req);
    default:
      return fail(405, 'Method Not Allowed');
  }
}

async function messagesGet(req: CoreRequest): Promise<CoreResponse> {
  const hobbyId = first(req, 'hobbyId');
  if (!isValidHobbyId(hobbyId)) return fail(400, '无效的留言板');
  const visitorId = first(req, 'visitorId') ?? '';
  if (visitorId && !isValidVisitorId(visitorId)) return fail(400, '无效的访客标识');

  const admin = await isAdminRequest(req);
  const messages = await listMessages(hobbyId, visitorId, admin);
  return ok(messages, { 'Cache-Control': 'no-store' });
}

async function messagesPost(req: CoreRequest): Promise<CoreResponse> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const hobbyId = body.hobbyId;
  const visitorId = body.visitorId;
  if (!isValidHobbyId(hobbyId)) return fail(400, '无效的留言板');
  if (!isValidVisitorId(visitorId)) return fail(400, '无效的访客标识');
  const content = sanitizeContent(body.content);
  if (!content) return fail(400, '留言需为 1~100 字');

  const result = await createMessage(hobbyId, visitorId, content);
  if (!result.ok) {
    return {
      status: 429,
      body: { error: '发送太频繁，请稍后再试', retryAfter: result.retryAfter },
      headers: {},
    };
  }
  return ok(result.message);
}

async function messagesDelete(req: CoreRequest): Promise<CoreResponse> {
  const hobbyId = first(req, 'hobbyId');
  const id = first(req, 'id');
  const visitorId = first(req, 'visitorId') ?? '';
  if (!isValidHobbyId(hobbyId) || !id || id.length > 64) return fail(400, '无效的请求参数');
  if (visitorId && !isValidVisitorId(visitorId)) return fail(400, '无效的访客标识');

  const admin = await isAdminRequest(req);
  if (!admin && !visitorId) return fail(401, '缺少访客标识');

  const del = await deleteMessage(hobbyId, id, admin, visitorId);
  if (!del) return fail(404, '留言不存在或无权删除');
  return ok({ ok: true });
}

const PATCH_ACTIONS: PatchAction[] = ['approve', 'reject', 'pin', 'unpin'];

async function messagesPatch(req: CoreRequest): Promise<CoreResponse> {
  if (!(await isAdminRequest(req))) return fail(401, '需要管理员权限');

  const body = (req.body ?? {}) as Record<string, unknown>;
  const hobbyId = body.hobbyId;
  const id = typeof body.id === 'string' ? body.id : '';
  const action = body.action;
  if (!isValidHobbyId(hobbyId) || !id || id.length > 64) return fail(400, '无效的请求参数');
  if (typeof action !== 'string' || !PATCH_ACTIONS.includes(action as PatchAction))
    return fail(400, '无效的操作');

  const patched = await patchMessage(hobbyId, id, action as PatchAction);
  if (!patched) return fail(404, '留言不存在');
  return ok({ ok: true });
}

// ---------------------------------------------------------------------------
// /api/admin/login —— POST {password} → 校验通过签发随机 token（12h）；
//                     密码错误 401 + 1 秒延迟防爆破
// ---------------------------------------------------------------------------

export async function dispatchLogin(req: CoreRequest): Promise<CoreResponse> {
  if (req.method !== 'POST') return fail(405, 'Method Not Allowed');

  const password = (req.body as Record<string, unknown> | undefined)?.password;
  if (!isValidAdminPassword(password)) {
    await sleep(1000);
    return fail(401, '密码错误，请重试');
  }
  const token = genToken();
  await issueAdminToken(token);
  return ok({ token });
}

// ---------------------------------------------------------------------------
// /api/admin/logout —— POST：吊销 Bearer token（前端同时清 sessionStorage）
// ---------------------------------------------------------------------------

export async function dispatchLogout(req: CoreRequest): Promise<CoreResponse> {
  if (req.method !== 'POST') return fail(405, 'Method Not Allowed');
  const token = getBearerToken(req);
  if (token) await revokeAdminToken(token);
  return ok({ ok: true });
}
