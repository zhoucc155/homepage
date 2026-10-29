// 留言板存储层：Redis（Upstash REST）实现 + 无环境变量时的内存兜底。
// 数据模型（Redis）：
//   HASH  msg:data:{hobbyId}:{msgId}   → id / visitorId / content / status / pinned / createdAt
//   ZSET  msg:index:{hobbyId}          → score=createdAt, member=msgId
//   SET   rate:{visitorId}             → 限频标记，EX 60 NX
//   SET   admin:token:{token}          → 管理员会话，EX 43200（12h）

import { redisCmd, redisPipeline, redisEnabled } from './redis';

export type MessageStatus = 'pending' | 'approved';

export interface MessageRecord {
  id: string;
  hobbyId: string;
  visitorId: string;
  content: string;
  status: MessageStatus;
  pinned: boolean;
  createdAt: number;
}

/** 返回给前端的留言（不含 visitorId 等敏感字段） */
export interface PublicMessage {
  id: string;
  content: string;
  createdAt: number;
  own: boolean;
  pinned: boolean;
  pending: boolean;
}

export const RATE_LIMIT_SECONDS = 60;
export const ADMIN_TOKEN_TTL_SECONDS = 43200; // 12h
export const MAX_CONTENT_LENGTH = 100;

// ---------------------------------------------------------------------------
// 内存兜底（无 Upstash 环境变量时）
// ---------------------------------------------------------------------------
const memBoards = new Map<string, Map<string, MessageRecord>>();
const memRate = new Map<string, number>(); // visitorId → 解禁时间戳(ms)
const memTokens = new Map<string, number>(); // token → 过期时间戳(ms)

function memList(hobbyId: string, visitorId: string, isAdmin: boolean): PublicMessage[] {
  return [...(memBoards.get(hobbyId)?.values() ?? [])]
    .filter(
      (r) =>
        r.status === 'approved' ||
        (r.status === 'pending' && (r.visitorId === visitorId || isAdmin))
    )
    .map((r) => toPublic(r, visitorId))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
}

function memCreate(hobbyId: string, visitorId: string, content: string): PublicMessage {
  const now = Date.now();
  const rec: MessageRecord = {
    id: genMsgId(),
    hobbyId,
    visitorId,
    content,
    status: 'pending',
    pinned: false,
    createdAt: now,
  };
  if (!memBoards.has(hobbyId)) memBoards.set(hobbyId, new Map());
  memBoards.get(hobbyId)!.set(rec.id, rec);
  return toPublic(rec, visitorId);
}

function memDelete(hobbyId: string, id: string, byAdmin: boolean, visitorId: string): boolean {
  const rec = memBoards.get(hobbyId)?.get(id);
  if (!rec) return false;
  if (!byAdmin && rec.visitorId !== visitorId) return false;
  memBoards.get(hobbyId)!.delete(id);
  return true;
}

function memPatch(
  hobbyId: string,
  id: string,
  action: 'approve' | 'reject' | 'pin' | 'unpin'
): boolean {
  const rec = memBoards.get(hobbyId)?.get(id);
  if (!rec) return false;
  switch (action) {
    case 'approve':
      rec.status = 'approved';
      break;
    case 'reject': // rejected 直接消失：等价删除
      memBoards.get(hobbyId)!.delete(id);
      break;
    case 'pin':
      rec.pinned = true;
      break;
    case 'unpin':
      rec.pinned = false;
      break;
  }
  return true;
}

// ---------------------------------------------------------------------------
// 公共 API（自动选择 Redis / 内存实现）
// ---------------------------------------------------------------------------

function toPublic(r: MessageRecord, visitorId: string): PublicMessage {
  return {
    id: r.id,
    content: r.content,
    createdAt: r.createdAt,
    own: r.visitorId === visitorId,
    pinned: r.pinned,
    pending: r.status === 'pending',
  };
}

function genMsgId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

const dataKey = (hobbyId: string, id: string) => `msg:data:${hobbyId}:${id}`;
const indexKey = (hobbyId: string) => `msg:index:${hobbyId}`;

function parseHash(obj: Record<string, string> | null | undefined): MessageRecord | null {
  if (!obj || !obj.id) return null;
  return {
    id: obj.id,
    hobbyId: obj.hobbyId,
    visitorId: obj.visitorId,
    content: obj.content,
    status: obj.status === 'approved' ? 'approved' : 'pending',
    pinned: obj.pinned === '1',
    createdAt: Number(obj.createdAt) || 0,
  };
}

function serialize(rec: MessageRecord): [string, string][] {
  return [
    ['id', rec.id],
    ['hobbyId', rec.hobbyId],
    ['visitorId', rec.visitorId],
    ['content', rec.content],
    ['status', rec.status],
    ['pinned', rec.pinned ? '1' : '0'],
    ['createdAt', String(rec.createdAt)],
  ];
}

/** 拉取可见留言：approved + 本人 pending（管理员额外可见全部 pending，用于审核） */
export async function listMessages(
  hobbyId: string,
  visitorId: string,
  isAdmin: boolean
): Promise<PublicMessage[]> {
  if (!redisEnabled()) return memList(hobbyId, visitorId, isAdmin);

  const ids = (await redisCmd('ZRANGE', indexKey(hobbyId), '0', '-1')) as string[] | null;
  if (!ids || ids.length === 0) return [];
  const hashes = await redisPipeline(ids.map((id) => ['HGETALL', dataKey(hobbyId, id)]));
  return hashes
    .map((h) => parseHash(h as Record<string, string>))
    .filter((r): r is MessageRecord => r !== null)
    .filter(
      (r) =>
        r.status === 'approved' ||
        (r.status === 'pending' && (r.visitorId === visitorId || isAdmin))
    )
    .map((r) => toPublic(r, visitorId))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);
}

export type CreateResult =
  | { ok: true; message: PublicMessage }
  | { ok: false; reason: 'rate'; retryAfter: number };

/** 创建留言（先发后审 → pending）。限频：每 visitorId 60 秒 1 条（服务端强制） */
export async function createMessage(
  hobbyId: string,
  visitorId: string,
  content: string
): Promise<CreateResult> {
  if (!redisEnabled()) {
    const now = Date.now();
    const until = memRate.get(visitorId) ?? 0;
    if (now < until) return { ok: false, reason: 'rate', retryAfter: Math.ceil((until - now) / 1000) };
    memRate.set(visitorId, now + RATE_LIMIT_SECONDS * 1000);
    return { ok: true, message: memCreate(hobbyId, visitorId, content) };
  }

  const rateRes = (await redisCmd('SET', `rate:${visitorId}`, '1', 'EX', RATE_LIMIT_SECONDS, 'NX')) as
    | string
    | null;
  if (rateRes !== 'OK') {
    const ttl = (await redisCmd('TTL', `rate:${visitorId}`)) as number;
    return { ok: false, reason: 'rate', retryAfter: ttl > 0 ? ttl : RATE_LIMIT_SECONDS };
  }

  const rec: MessageRecord = {
    id: genMsgId(),
    hobbyId,
    visitorId,
    content,
    status: 'pending',
    pinned: false,
    createdAt: Date.now(),
  };
  await redisPipeline([
    ['HSET', dataKey(hobbyId, rec.id), ...serialize(rec).flat()],
    ['ZADD', indexKey(hobbyId), rec.createdAt, rec.id],
  ]);
  return { ok: true, message: toPublic(rec, visitorId) };
}

/** 删除留言：管理员可删任意，普通人仅可删本人留言 */
export async function deleteMessage(
  hobbyId: string,
  id: string,
  byAdmin: boolean,
  visitorId: string
): Promise<boolean> {
  if (!redisEnabled()) return memDelete(hobbyId, id, byAdmin, visitorId);

  const rec = parseHash((await redisCmd('HGETALL', dataKey(hobbyId, id))) as Record<string, string>);
  if (!rec) return false;
  if (!byAdmin && rec.visitorId !== visitorId) return false;
  await redisPipeline([
    ['DEL', dataKey(hobbyId, id)],
    ['ZREM', indexKey(hobbyId), id],
  ]);
  return true;
}

export type PatchAction = 'approve' | 'reject' | 'pin' | 'unpin';

/** 管理员操作：approve（过审）/ reject（驳回=直接消失）/ pin / unpin */
export async function patchMessage(
  hobbyId: string,
  id: string,
  action: PatchAction
): Promise<boolean> {
  if (!redisEnabled()) return memPatch(hobbyId, id, action);

  const rec = parseHash((await redisCmd('HGETALL', dataKey(hobbyId, id))) as Record<string, string>);
  if (!rec) return false;
  if (action === 'reject') {
    await redisPipeline([
      ['DEL', dataKey(hobbyId, id)],
      ['ZREM', indexKey(hobbyId), id],
    ]);
    return true;
  }
  const field = action === 'approve' ? ['status', 'approved'] : action === 'pin' ? ['pinned', '1'] : ['pinned', '0'];
  await redisCmd('HSET', dataKey(hobbyId, id), ...field);
  return true;
}

// ---------------------------------------------------------------------------
// 管理员 token
// ---------------------------------------------------------------------------

/** 存储管理员 token（12h 有效） */
export async function issueAdminToken(token: string): Promise<void> {
  if (redisEnabled()) {
    await redisCmd('SET', `admin:token:${token}`, '1', 'EX', ADMIN_TOKEN_TTL_SECONDS);
  } else {
    memTokens.set(token, Date.now() + ADMIN_TOKEN_TTL_SECONDS * 1000);
  }
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  if (redisEnabled()) {
    return (await redisCmd('EXISTS', `admin:token:${token}`)) === 1;
  }
  const until = memTokens.get(token) ?? 0;
  if (Date.now() > until) {
    memTokens.delete(token);
    return false;
  }
  return true;
}

export async function revokeAdminToken(token: string): Promise<void> {
  if (!token) return;
  if (redisEnabled()) {
    await redisCmd('DEL', `admin:token:${token}`);
  } else {
    memTokens.delete(token);
  }
}
