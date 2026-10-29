import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, KeyRound, MessageCircle, Pin, PinOff, Send, Trash2, X } from 'lucide-react';

// ---------------------------------------------------------------------------
// 留言板：读写 /api/messages（每 hobbyId 独立留言板）。
// 先发后审：新留言 pending 仅本机可见，管理员过审后对所有人可见；
// visitorId 存 localStorage 标识本机（匿名），adminToken 存 sessionStorage（12h）。
// ---------------------------------------------------------------------------
interface LocalMessage {
  id: string;
  content: string;
  createdAt: number;
  own?: boolean; // 本机发送，可自删
  pinned?: boolean; // 管理员置顶
  pending?: boolean; // 待审核（本机渲染与已过审无差别；管理员可见并可审核）
}

const COOLDOWN_SECONDS = 60; // 与服务端限频一致（60 秒一条）
const MAX_LENGTH = 100;

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

// 匿名访客标识：localStorage 持久化，服务端据此判定"本人留言"与限频
const getVisitorId = (): string => {
  let v = localStorage.getItem('mb_visitor_id');
  if (!v) {
    v = genId();
    localStorage.setItem('mb_visitor_id', v);
  }
  return v;
};

// 管理员 token：sessionStorage（关浏览器即失效），服务端侧 12h TTL
const getAdminToken = (): string | null => sessionStorage.getItem('mb_admin_token');
const setAdminToken = (t: string | null): void => {
  if (t) sessionStorage.setItem('mb_admin_token', t);
  else sessionStorage.removeItem('mb_admin_token');
};

// 操作按钮基类
const btnBaseCls = 'flex items-center justify-center transition-all cursor-pointer';

interface Props {
  hobbyId: string; // 留言板归属的爱好卡片（独立留言板 + 存储键）
  active: boolean; // 点击激活留言板（显示输入框）
  onClose: () => void; // 退出留言板模式
}

export const MessageBoardOverlay: React.FC<Props> = ({ hobbyId, active, onClose }) => {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getAdminToken()));
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [inputError, setInputError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 拉取留言：切换爱好卡片 / 打开卡片（active 变 true）时各请求一次，不做轮询
  const loadMessages = useCallback(async () => {
    const fetchOnce = async () => {
      const headers: Record<string, string> = {};
      const token = getAdminToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      return fetch(
        `/api/messages?hobbyId=${encodeURIComponent(hobbyId)}&visitorId=${encodeURIComponent(getVisitorId())}`,
        { headers }
      );
    };
    try {
      let res = await fetchOnce();
      if (res.status === 401) {
        // 管理员 token 已过期：清掉本地态，按普通访客重取
        setAdminToken(null);
        setIsAdmin(false);
        res = await fetchOnce();
      }
      if (res.ok) setMessages((await res.json()) as LocalMessage[]);
    } catch (err) {
      console.error('加载留言失败', err);
    }
  }, [hobbyId]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (active) void loadMessages();
  }, [active, loadMessages]);

  // 倒计时限频
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // 激活时聚焦输入框；退出时清掉行内高度残留
  useEffect(() => {
    if (active) {
      setTimeout(() => inputRef.current?.focus(), 60);
    } else if (inputRef.current) {
      inputRef.current.style.height = '';
      inputRef.current.style.maxHeight = '';
    }
  }, [active]);

  // 激活时点击卡片以外任意区域退出留言板
  // 按下位置（mousedown）判定而非松开位置（click），避免框选输入框文字拖出卡片松开导致误退出；
  // 点在当前卡片内部（含输入框、管理弹窗）不退出；触发激活的那次点击在监听器挂载前已完成，不会误关
  useEffect(() => {
    if (!active) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const card = (e.target as HTMLElement | null)?.closest?.('[data-hobby-card]');
      if (card && card.getAttribute('data-hobby-card') === hobbyId) return;
      onClose();
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [active, hobbyId, onClose]);

  // 置顶优先，其余按时间倒序
  const sorted = [...messages].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.createdAt - a.createdAt
  );

  // 提交留言（表单提交与 Enter 键共用）；发送失败保留输入内容便于重试
  const doSubmit = async () => {
    const text = input.trim();
    if (!text || cooldown > 0) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hobbyId, visitorId: getVisitorId(), content: text }),
      });
      if (res.status === 429) {
        const data = (await res.json().catch(() => null)) as { retryAfter?: number } | null;
        const wait = Math.max(1, Math.min(data?.retryAfter ?? COOLDOWN_SECONDS, COOLDOWN_SECONDS));
        setCooldown(wait);
        setInputError(`发送太频繁，${wait} 秒后再试`);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const msg = (await res.json()) as LocalMessage;
      setMessages((prev) => [msg, ...prev]);
      setInput('');
      setInputError('');
      setCooldown(COOLDOWN_SECONDS);
      // 重置输入框高度
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } catch (err) {
      console.error('发送留言失败', err);
      setInputError('发送失败，请稍后再试');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSubmit();
  };

  // Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSubmit();
    }
  };

  // 输入框随内容自动增高（2 整行封顶）
  // 上下内边距各 4px；溢出时可视高度 = pt + 2.2 行：
  //   滚到顶 → 露出第 3 行的 1/5；滚到底 → 露出倒数第 3 行的 1/5（上下对称的"窥视"提示）
  //   底部静止状态：最后一行文字下缘与分隔线恒定 4px
  const autoResize = () => {
    const el = inputRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 23;
    const pt = parseFloat(cs.paddingTop) || 4;
    const cap = pt + line * 2.2;
    el.style.maxHeight = `${cap}px`;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, cap)}px`;
  };

  // 删除留言：本人可删自己的；管理员带 Bearer token 可删任意
  const removeMessage = async (m: LocalMessage) => {
    try {
      const token = getAdminToken();
      const res = await fetch(
        `/api/messages?id=${encodeURIComponent(m.id)}&hobbyId=${encodeURIComponent(hobbyId)}&visitorId=${encodeURIComponent(getVisitorId())}`,
        { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (res.status === 401 && token) {
        setAdminToken(null);
        setIsAdmin(false);
      }
      if (res.ok) setMessages((prev) => prev.filter((x) => x.id !== m.id));
    } catch (err) {
      console.error('删除留言失败', err);
    }
  };

  // 管理员 PATCH：approve / reject / pin / unpin
  const patchMessage = async (
    m: LocalMessage,
    action: 'approve' | 'reject' | 'pin' | 'unpin'
  ): Promise<boolean> => {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ hobbyId, id: m.id, action }),
      });
      if (res.status === 401) {
        setAdminToken(null);
        setIsAdmin(false);
        return false;
      }
      return res.ok;
    } catch (err) {
      console.error('操作留言失败', err);
      return false;
    }
  };

  // 管理员：置顶/取消置顶
  const togglePin = async (m: LocalMessage) => {
    if (!(await patchMessage(m, m.pinned ? 'unpin' : 'pin'))) return;
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, pinned: !x.pinned } : x)));
  };

  // 管理员审核：过审（对所有人可见）或驳回（直接消失）
  const reviewMessage = async (m: LocalMessage, action: 'approve' | 'reject') => {
    if (!(await patchMessage(m, action))) return;
    setMessages((prev) =>
      action === 'reject'
        ? prev.filter((x) => x.id !== m.id)
        : prev.map((x) => (x.id === m.id ? { ...x, pending: false } : x))
    );
  };

  // 管理员登录：密码换 12h token（sessionStorage），任何设备输一次密码即获完整管理权
  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      });
      if (res.ok) {
        const { token } = (await res.json()) as { token: string };
        setAdminToken(token);
        setIsAdmin(true);
        setShowKeyModal(false);
        setPwd('');
        setPwdError('');
        void loadMessages();
      } else {
        setPwdError('密码错误，请重试');
      }
    } catch (err) {
      console.error('管理员登录失败', err);
      setPwdError('网络错误，请重试');
    }
  };

  // 登出：吊销服务端 token + 清 sessionStorage，并按普通访客重取留言
  const handleAdminLogout = () => {
    const token = getAdminToken();
    if (token) {
      void fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setAdminToken(null);
    setIsAdmin(false);
    setShowKeyModal(false);
    void loadMessages();
  };

  return (
    <>
      {/* 遮罩层：hover 预览 / active 完整留言板（编辑留白版式） */}
      <div
        className={`absolute inset-0 z-20 flex flex-col bg-neutral-900/70 backdrop-blur-md transition-opacity duration-200 ${
          active
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 group-hover:opacity-100 pointer-events-none'
        }`}
      >
        {/* 头部：标题 + 计数 + 管理入口 / 退出 */}
        <div className="flex items-center justify-between gap-2 px-5 sm:px-6 pt-4">
          <div className="flex items-baseline gap-1.5 text-xs font-bold text-white/90">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>留言板</span>
            <span className="text-[11px] font-mono font-normal text-white/50">{messages.length} 条</span>
            {isAdmin && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-400/90 text-[10px] font-bold text-neutral-900">
                管理中
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowKeyModal(true);
              }}
              aria-label="管理员入口"
              title={isAdmin ? '管理员模式已解锁' : '管理员入口'}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer pointer-events-auto"
            >
              <KeyRound className={`w-3.5 h-3.5 ${isAdmin ? 'text-emerald-300' : ''}`} />
            </button>
            {active && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                aria-label="退出留言板"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 留言列表（编辑留白：细分隔线 + 大留白，无卡片） */}
        <div className="thin-scroll flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-4 space-y-0">
          {sorted.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-mono text-white/50">
              还没有人留言，成为第一个吧
            </div>
          ) : (
            sorted.map((m, i) => (
              <div key={m.id} className={`py-3 border-b border-white/10 ${i === 0 ? 'border-t' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-sm text-white/95 leading-relaxed break-all">
                    {m.pinned && (
                      <Pin
                        className="w-3.5 h-3.5 inline-block mr-1.5 -translate-y-px text-amber-300"
                        fill="currentColor"
                      />
                    )}
                    {isAdmin && m.pending && (
                      <span className="mr-1.5 inline-block rounded-md bg-amber-300/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 align-middle">
                        待审核
                      </span>
                    )}
                    {m.content}
                  </p>
                  {(isAdmin || m.own) && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isAdmin && m.pending && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void reviewMessage(m, 'approve');
                            }}
                            aria-label="通过审核"
                            title="通过审核（对所有人可见）"
                            className={`w-6 h-6 rounded-lg ${btnBaseCls} bg-emerald-400/20 text-emerald-300 hover:bg-emerald-400/40 hover:text-emerald-200`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void reviewMessage(m, 'reject');
                            }}
                            aria-label="驳回留言"
                            title="驳回（对所有人隐藏）"
                            className={`w-6 h-6 rounded-lg ${btnBaseCls} bg-red-400/20 text-red-300 hover:bg-red-400/40 hover:text-red-200`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {isAdmin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            void togglePin(m);
                          }}
                          aria-label={m.pinned ? '取消置顶' : '置顶'}
                          title={m.pinned ? '取消置顶' : '置顶'}
                          className={`w-6 h-6 rounded-lg ${btnBaseCls} bg-white/10 text-white/60 hover:bg-white/25 hover:text-white`}
                        >
                          {m.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeMessage(m);
                        }}
                        aria-label="删除留言"
                        title={m.own && !isAdmin ? '删除我的留言' : '删除'}
                        className={`w-6 h-6 rounded-lg ${btnBaseCls} bg-white/10 text-white/60 hover:bg-red-400/20 hover:text-red-300`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部：激活时显示输入框，预览时显示提示语 */}
        {active ? (
          <form
            className="flex items-center gap-2 px-5 sm:px-6 pb-4 pt-1"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              onChange={(e) => {
                setInput(e.target.value.slice(0, MAX_LENGTH));
                if (inputError) setInputError('');
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder={inputError || '匿名说点什么…（100 字以内）'}
              maxLength={MAX_LENGTH}
              className="thin-scroll flex-1 min-h-[30px] max-h-[54px] text-sm px-0.5 pt-1 pb-1 bg-transparent border-b border-white/25 rounded-none text-white placeholder:text-white/40 outline-none focus:border-white/70 transition-all resize-none leading-relaxed overflow-y-auto"
              style={{ resize: 'none' }}
            />
            {/* 圆形发送钮：冷却时显示倒计时数字，可发送时显示纸飞机图标 */}
            <button
              type="submit"
              disabled={!input.trim() || cooldown > 0}
              aria-label={cooldown > 0 ? `${cooldown} 秒后可再发` : '发送留言'}
              title={cooldown > 0 ? `${cooldown}s` : '发送'}
              className="w-9 h-9 shrink-0 rounded-full bg-white text-neutral-900 flex items-center justify-center transition-all cursor-pointer hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cooldown > 0 ? (
                <span className="text-[11px] font-mono font-bold tabular-nums leading-none">
                  {cooldown}
                </span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        ) : (
          <div className="px-5 sm:px-6 pb-4 pt-1 text-xs font-mono text-white/60">
            点击图片任意位置 · 匿名写下你的留言
          </div>
        )}
      </div>

      {/* 管理员密码弹窗 */}
      {showKeyModal && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-900/85 backdrop-blur-sm pointer-events-auto"
          onClick={() => setShowKeyModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-[85%] max-w-[300px] space-y-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>管理员验证</span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-700">
                  已解锁
                </span>
              )}
            </div>
            <input
              type="password"
              autoFocus
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="输入管理员密码"
              className="w-full h-9 rounded-xl border border-neutral-200 px-3 text-xs text-neutral-800 outline-none focus:border-neutral-900"
            />
            {pwdError && <p className="text-[11px] text-red-500">{pwdError}</p>}
            <div className="flex items-center justify-between gap-2">
              {isAdmin ? (
                <button
                  onClick={handleAdminLogout}
                  className="text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
                >
                  退出管理
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="h-8 px-3 rounded-lg text-[11px] font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  取消
                </button>
                {!isAdmin && (
                  <button
                    onClick={handleAdminLogin}
                    className="h-8 px-3.5 rounded-lg bg-neutral-900 text-white text-[11px] font-bold cursor-pointer hover:bg-neutral-700 transition-all"
                  >
                    验证并解锁
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
