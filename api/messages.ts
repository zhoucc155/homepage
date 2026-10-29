// /api/messages —— 留言板读写
//   GET    ?hobbyId=&visitorId=            → 可见留言（approved + 本人 pending；管理员含全部 pending）
//   POST   {hobbyId, visitorId, content}   → 创建 pending 留言（限频 60s/visitorId）
//   DELETE ?hobbyId=&id=&visitorId=        → 删除（Bearer token=管理员删任意；否则仅本人）
//   PATCH  {hobbyId, id, action}           → 管理员操作 approve / reject / pin / unpin

import {
  listMessages,
  createMessage,
  deleteMessage,
  patchMessage,
  type PatchAction,
} from './_lib/store';
import {
  type ApiRequest,
  type ApiResponse,
  isAdminRequest,
  isValidHobbyId,
  isValidVisitorId,
  sanitizeContent,
  firstQuery,
} from './_lib/auth';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method === 'GET') return await handleGet(req, res);
    if (req.method === 'POST') return await handlePost(req, res);
    if (req.method === 'DELETE') return await handleDelete(req, res);
    if (req.method === 'PATCH') return await handlePatch(req, res);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('[api/messages]', err);
    return res.status(500).json({ error: '服务器错误，请稍后再试' });
  }
}

async function handleGet(req: ApiRequest, res: ApiResponse) {
  const hobbyId = firstQuery(req, 'hobbyId');
  if (!isValidHobbyId(hobbyId)) return res.status(400).json({ error: '无效的留言板' });
  const visitorId = firstQuery(req, 'visitorId') ?? '';
  if (visitorId && !isValidVisitorId(visitorId))
    return res.status(400).json({ error: '无效的访客标识' });

  const admin = await isAdminRequest(req);
  res.setHeader('Cache-Control', 'no-store');
  const messages = await listMessages(hobbyId, visitorId, admin);
  return res.status(200).json(messages);
}

async function handlePost(req: ApiRequest, res: ApiResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const hobbyId = body.hobbyId;
  const visitorId = body.visitorId;
  if (!isValidHobbyId(hobbyId)) return res.status(400).json({ error: '无效的留言板' });
  if (!isValidVisitorId(visitorId)) return res.status(400).json({ error: '无效的访客标识' });
  const content = sanitizeContent(body.content);
  if (!content)
    return res.status(400).json({ error: '留言需为 1~100 字' });

  const result = await createMessage(hobbyId, visitorId, content);
  if (!result.ok) {
    return res.status(429).json({
      error: '发送太频繁，请稍后再试',
      retryAfter: result.retryAfter,
    });
  }
  return res.status(200).json(result.message);
}

async function handleDelete(req: ApiRequest, res: ApiResponse) {
  const hobbyId = firstQuery(req, 'hobbyId');
  const id = firstQuery(req, 'id');
  const visitorId = firstQuery(req, 'visitorId') ?? '';
  if (!isValidHobbyId(hobbyId) || !id || id.length > 64)
    return res.status(400).json({ error: '无效的请求参数' });
  if (visitorId && !isValidVisitorId(visitorId))
    return res.status(400).json({ error: '无效的访客标识' });

  const admin = await isAdminRequest(req);
  if (!admin && !visitorId) return res.status(401).json({ error: '缺少访客标识' });

  const ok = await deleteMessage(hobbyId, id, admin, visitorId);
  if (!ok) return res.status(404).json({ error: '留言不存在或无权删除' });
  return res.status(200).json({ ok: true });
}

const PATCH_ACTIONS: PatchAction[] = ['approve', 'reject', 'pin', 'unpin'];

async function handlePatch(req: ApiRequest, res: ApiResponse) {
  if (!(await isAdminRequest(req))) return res.status(401).json({ error: '需要管理员权限' });

  const body = (req.body ?? {}) as Record<string, unknown>;
  const hobbyId = body.hobbyId;
  const id = typeof body.id === 'string' ? body.id : '';
  const action = body.action;
  if (!isValidHobbyId(hobbyId) || !id || id.length > 64)
    return res.status(400).json({ error: '无效的请求参数' });
  if (typeof action !== 'string' || !PATCH_ACTIONS.includes(action as PatchAction))
    return res.status(400).json({ error: '无效的操作' });

  const ok = await patchMessage(hobbyId, id, action as PatchAction);
  if (!ok) return res.status(404).json({ error: '留言不存在' });
  return res.status(200).json({ ok: true });
}
