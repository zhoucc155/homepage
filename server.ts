// 本地开发 API 服务器：复用 api/ 下的 Vercel handler（express 兼容其最小接口）。
// 用法：npm run dev:api   （默认 8787 端口，Vite dev server 将 /api 代理到此）
// 无 UPSTASH_* 环境变量时自动降级为内存存储，方便本地全流程联调。

import 'dotenv/config';
import express from 'express';
import messagesHandler from './api/messages';
import loginHandler from './api/admin/login';
import logoutHandler from './api/admin/logout';
import { redisEnabled } from './api/_lib/redis';
import type { ApiRequest, ApiResponse } from './api/_lib/auth';

const PORT = Number(process.env.PORT) || 8787;

const app = express();
app.use(express.json());

// express 的 req/res 与 Vercel Node handler 结构兼容（query 类型体系不同，断言对齐）
const adapt = (h: (req: ApiRequest, res: ApiResponse) => Promise<unknown>) =>
  (req: express.Request, res: express.Response) =>
    void h(req as unknown as ApiRequest, res as unknown as ApiResponse);

app.all('/api/messages', adapt(messagesHandler));
app.all('/api/admin/login', adapt(loginHandler));
app.all('/api/admin/logout', adapt(logoutHandler));

app.listen(PORT, () => {
  console.log(`API dev server: http://localhost:${PORT}`);
  console.log(redisEnabled ? '存储：Upstash Redis' : '存储：内存兜底（未配置 UPSTASH_* 环境变量）');
});
