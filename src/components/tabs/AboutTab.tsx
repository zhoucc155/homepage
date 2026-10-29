import React from 'react';
import {
  Layers,
  Split,
  Zap
} from 'lucide-react';

interface AboutTabProps {
  onNavigateTab?: (tab: 'home' | 'about' | 'achievements' | 'hobbies' | 'works', track?: 'all' | 'acg' | 'audio' | 'ota') => void;
}

const TRACK_RECORDS: { digit: string; unit: string; tag: string; title: string; desc: string; resultLabel: string; result: string }[] = [
  {
    digit: '1',
    unit: '个月',
    tag: '破局诊断',
    title: '摸清新业务的疑点、痛点、难点，重构运营策略和数据体系',
    desc: '30天深入一线完成全链路梳理与量化漏斗诊断；优化历史运营动作，建立标准化可复制的运营 SOP 与核心增长闭环。',
    resultLabel: '痛难点全穿透',
    result: '100%'
  },
  {
    digit: '3',
    unit: '个月',
    tag: '机制飞轮',
    title: '搭建创作者成长体系，将孵化周期从 3 个月缩短为 1 个月',
    desc: '从0开始试点重运营，摸清创作者成长过程中的高流失节点，制定阶段性任务和配套课程并推动产品化落地。',
    resultLabel: '孵化效率提升 200%',
    result: '3M → 1M'
  },
  {
    digit: '5',
    unit: '个月',
    tag: '规模爆发',
    title: '搭建社区内容生态，实现 DAU 从 22 万到 70 万的突破',
    desc: '独立负责站内社区冷启动阶段的内容供给、社区治理与种子用户运营，搭建数据监控体系，持续优化阶段性运营策略，实现 DAU 爆发式增长。',
    resultLabel: 'DAU 增长 218%',
    result: '22W → 70W'
  },
  {
    digit: '7',
    unit: '个月',
    tag: '商业跃迁',
    title: '助力直播业务月 GMV 从 200 万到 2000 万的跃迁',
    desc: '基于抖音直播算法标签推流逻辑，统一人群标签，重构选品逻辑，搭建数据复盘迭代体系，极大提升流量精准度和商业化增长。',
    resultLabel: '月 GMV 10 倍跃迁',
    result: '200W → 2000W'
  }
];

export const AboutTab: React.FC<AboutTabProps> = ({ onNavigateTab }) => {
  // Editorial-style perspective columns (matching the magazine reference: kicker / watermark / title / quote / numbered items / footer)
  const perspectiveColumns = [
    {
      index: '01',
      kicker: 'INNER COMPASS · 自白画像',
      title: ['「理性」和「感性」从不相悖'],
      titleBg: 'rgb(225, 29, 72)',
      quote: '如果一个产品只有冷冰冰的数据指标，而不能让人在离开屏幕后依然记挂，它就只是一具没有灵魂的空壳。',
      items: [
        { no: '01', title: '高标准J人', desc: '习惯先把事情想清楚，允许过程磕磕绊绊，但无法接受自己“先做一个垃圾出来”。' },
        { no: '02', title: '事事利他', desc: '有极强的同理心，敏锐洞察他人的情绪波形与现实痛点，精准切入他人需求，提升协作效率。' },
        { no: '03', title: '专注 · 心流', desc: '对于价值认同的事，享受全神贯注、投入忘我的状态，不喜欢被打断。' },
      ],
      footerTags: ['Follow builders, not influencers.'],
      view: 'self' as const,
    },
    {
      index: '02',
      kicker: 'EXTERNAL MIRROR · 他人评价',
      title: ['总能有温度地把事做规整'],
      titleBg: 'rgb(37, 99, 235)',
      quote: '她总能找茬，数据的茬、流程的茬、规则的茬，能把一团乱麻梳理得井井有条，是团队中兜底的存在。',
      items: [
        { no: '01', title: '数据解剖员', desc: '“话不多，但一针见血。”习惯挖掘数据找到运营盲点，会用数据结论拒绝不合理需求。' },
        { no: '02', title: '规则制定者', desc: '对于涉及多方协作的政策，能同时考虑到业务目标和创作者现实痛点，多版本方案校验，找到规则的最佳平衡点。' },
        { no: '03', title: '玩法探索家', desc: '对内容风向和用户需求有敏锐嗅觉，能融会泛娱乐细分领域的创意玩法，碰撞出意想不到的火花。' },
      ],
      footerTags: ['Play more, try more, think more.'],
      view: 'others' as const,
    },
  ];

  // Timeline dual-track milestones (Main Quest: Career/Engineering vs Side Quest: Life/Hobbies/Exploration)
  // 每个节点数据独立成常量，与下方渲染块一一对应；增删改任一节点只动它自己的常量和渲染块，互不影响
  const n2023 = {
    period: '至今',
    tag: 'Phase 04 · 全栈赋能',
    mainQuest: null as unknown as {
      title: string;
      role: string;
      badge: string;
      badgeColor: string;
      summary: string;
      highlights: string[];
    },
    sideQuest: {
      title: '用AI做了点小东西',
      context: '业余探索 · 极客精神',
      badge: '支线 · 极客实验',
      badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      summary: '痴迷于 Vibe Coding ，在与AI的对话中一遍遍叩问自己，做了一些有用的小玩意儿；沉迷Chatbox，灵感如天上繁星汇成一束聚光灯，打在我身上，正在用AI辅助创作自己的第一本小说。',
      details: '深夜写完最后一段着色器代码并无报错跑通的瞬间，是最好的精神疗愈。'
    }
  };

  const n2021 = {
    period: '2023',
    tag: 'Phase 03 · 在地文脉',
    mainQuest: {
      title: '平台化直播生态与商业化增长',
      role: '携程',
      badge: '查看案例',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      summary: '围绕站内外直播业务，搭建多角色内容生态体系和达人分层运营机制，重构站外选品、供给、运营体系，实现流量精准度和商业化收益的双重暴涨。',
      highlights: [
        '单季度入驻达人 100 + ，开播场次提升 20%',
        '站外直播累计 GMV 超 7000 万，单场峰值超 400 万',
        '直播间 CTR 提升 200% ，优秀场次 GPM 超 5 万'
      ]
    },
    sideQuest: {
      title: '打补丁，解锁人生新体验',
      context: '行旅生活 · 感官感知',
      badge: '支线 · 行者寻味',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      summary: '成为OTA公域直播的独立业务顾问，累计完成10+场标准化直播搭建；\n点亮地图足迹，并创作出第一条播放量10w+的视频；\n两个月极速学车考驾照，平平无奇的考试小天才！',
      details: '“真正打动人心的风景，往往藏在地图未曾标注的弄堂转角。”'
    }
  };

  const n2020 = {
    period: '2021',
    tag: 'Phase 02 · 声音沉浸',
    mainQuest: {
      title: '创作者成长效率与社区内容生态',
      role: '喜马拉雅',
      badge: '查看案例',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      summary: '围绕音频直播业务，从创作者孵化与分层运营、内容生态与消费场景、用户增长渠道多点发力，全面提升创作者留存与收益。',
      highlights: [
        '新人培养周期从3个月缩短至1个月',
        '0-1搭建社区内容与玩法体系，带动直播DAU提升30%',
        '核心创作者月收益提升70%，涨粉速率提升200%'
      ]
    },
    sideQuest: {
      title: '一些小小的社区竞品调研',
      context: '竞技思维 · 毫秒级敬畏',
      badge: '支线 · 电竞心流',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
      summary: '在0-1搭建声音交友社区时做的一些小小调研，现在看来还不太成熟，但也是成长路上的足迹。',
      details: '逆风局复盘与 Ban/Pick 阵容博弈，正是产品在有限资源下做取舍的最佳演练。'
    }
  };

  const n2018 = {
    period: '2018',
    tag: 'Phase 01 · 圈层启蒙',
    mainQuest: {
      title: '二次元 UGC 社区与创作者生态建设',
      role: '第一弹',
      badge: '查看案例',
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200',
      summary: '围绕二次元兴趣用户与创作者需求，从 0 到 1 推动声音内容生态建设，完成创作者招募、活动激励、商业化探索、签约合作的完整闭环。',
      highlights: [
        '挖掘并引入 80 + 配音社团及工作室，带动配音区 DAU 突破 20 万',
        '联动《阴阳师》等 IP 策划内容活动， 撬动 40+ 工作室长期合作',
        '主导拉新活动，零成本拉新精准用户 4300 +'
      ]
    },
    sideQuest: {
      title: '正式入坑！成为一名英雄联盟「电竞云玩家」',
      context: '文学想象 · 叙事逻辑',
      badge: '支线 · 小说阅写',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      summary: '在瞬息万变的高压对局中与亿万观众心跳同频，永远不吝啬为选手的极限操作和逆风翻盘激情呐喊。',
      details: '云玩家的热爱同样滚烫：这个领域不允许存在我不懂的「梗」'
    }
  };

  const n2016 = {
    period: '2016',
    tag: 'Phase 00 · 新手村',
    mainQuest: {
      title: '完成新手任务：从中山大学计算机系毕业',
      role: '',
      badge: '',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      summary: '',
      highlights: [],
    },
    sideQuest: {
      title: '达成成就！成为网文书虫十年啦！',
      context: '新手村 · 兴趣存档',
      badge: '支线 · 新手村',
      badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      summary: '沉浸于想象力渲染出的亿万浩瀚宇宙，至今保持年阅读量超千万字',
      details: '所有后来的故事，都是从新手村领到的第一个任务开始的。'
    } as { title: string; context: string; badge: string; badgeColor: string; summary: string; details: string } | null
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ============================================================== */}
      {/* 1. PROVEN TRACK RECORD: 实战能力强度                            */}
      {/* ============================================================== */}
      <section>
        <div className="rounded-2xl">
          {/* 顶部：徽标 */}
          <div className="flex items-center justify-center gap-4">
            <div className="inline-flex items-center gap-1.5 self-start text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
              <Zap className="w-3.5 h-3.5 text-neutral-700" />
              <span>PROVEN TRACK RECORD · 实战能力强度</span>
            </div>
          </div>

          {/* 标题区 */}
          <div className="mt-2 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">我曾经：</h2>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2.5">
              <span style={{ fontFamily: "Georgia, Cambria, 'Times New Roman', 'Songti SC', SimSun, serif" }} className="text-[18px] text-neutral-400 line-through decoration-[#DC2626]">跨过山和大海，也穿过人山人海</span>
              <span className="px-2.5 py-0.5 rounded-full text-[#DC2626] text-xs font-semibold whitespace-nowrap">（划掉，讲点实际成绩）</span>
            </div>
            <p className="mt-2.5 text-sm text-neutral-600">拒绝假大空的自嗨叙事，用清晰的时间刻度、业务穿透力与量化结果驱动业务增长。</p>
          </div>

          <div aria-hidden="true" className="my-6 border-t border-neutral-200" />

          {/* 2×2 成绩卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {TRACK_RECORDS.map((r) => (
              <div
                key={r.tag}
                className="group relative flex flex-col bg-white hover:bg-[#FCFCFC] border border-neutral-200 rounded-xl p-5 sm:p-6 hover:border-neutral-300 hover:shadow-md"
              >
                {/* 左上短玫红条，悬浮时展开为整行宽度 */}
                <span aria-hidden="true" className="block w-9 h-1 rounded-full bg-[#E11D48] mb-4 transition-all duration-300 group-hover:w-full" />
                <div className="flex items-end justify-between gap-3">
                  <div className="text-2xl sm:text-3xl font-mono font-extrabold text-neutral-900 tracking-tight leading-none">
                    <span>{r.digit}</span>
                    <span> {r.unit}</span>
                  </div>
                  <span className="font-mono text-xs text-neutral-400 shrink-0">{r.tag}</span>
                </div>
                <h3 className="mt-2.5 text-base font-bold text-neutral-900 leading-snug">{r.title}</h3>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{r.desc}</p>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-400 group-hover:text-neutral-500">{r.resultLabel}</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#FFF1F2] text-[#9F1239] text-xs font-mono font-semibold">{r.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. VERTICAL TIMELINE: LEFT = MAIN QUEST, RIGHT = SIDE QUEST    */}
      {/* ============================================================== */}
      <section className="space-y-8">
        <div className="space-y-3 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
            <Layers className="w-3.5 h-3.5 text-neutral-700" />
            <span>Dual-Track Timeline · 双轨时间轴</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-[#F6B83F] tracking-tight"
            style={{ WebkitTextStroke: '2.5px #000', paintOrder: 'stroke fill', textShadow: '3px 3px 0 #000' }}
          >
            {'地球体验卡\u2002RPG进行时'}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            职业的主线推进离不开生活支线的灵感补给，如同 RPG 的双螺旋
          </p>
        </div>

        {/* Timeline Header Label Bar */}
        <div className="hidden lg:grid grid-cols-12 gap-6 items-center px-5 py-2.5 bg-white border-2 border-neutral-900 rounded-xl shadow-[3px_3px_0_0_#171717] text-xs font-mono font-semibold">
          <div className="col-span-5 text-neutral-900 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
            <span>主线历程 · MAIN QUEST</span>
          </div>
          <div className="col-span-2 text-center text-neutral-400 font-normal">
            <span>CHRONO / 时间标尺</span>
          </div>
          <div className="col-span-5 text-neutral-900 flex items-center justify-center gap-2">
            <span>支线探索 · SIDE QUEST</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          </div>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative">
          {/* Central Vertical Spine Line (desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-8 -translate-x-1/2 w-0 border-l-2 border-dashed border-neutral-200"></div>

          <div className="space-y-10 sm:space-y-12">
            {/* ===== Node · 2023 · Phase 04 全栈赋能（独立模块） ===== */}
            <div className="relative">
              <div className="lg:hidden flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold">
                  {n2023.period}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {n2023.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.25fr_1fr] gap-4 lg:gap-8 items-start">
                <div className="hidden lg:block lg:col-span-2"></div>

                {n2023.sideQuest && (
                  <div className="group relative flex flex-col justify-between bg-[#FDFCFB] hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-1.5">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                        {n2023.sideQuest.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2023.sideQuest.summary}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          onNavigateTab?.('works');
                          window.scrollTo({ top: 0, behavior: 'auto' });
                        }}
                        className="relative z-10 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer"
                      >
                        浏览作品
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Node · 2021 · Phase 03 在地文脉（独立模块） ===== */}
            <div className="relative">
              <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10 flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-900 shadow-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-900 text-[10px] font-mono font-semibold text-neutral-700 whitespace-nowrap">
                  {n2021.period}
                </span>
              </div>

              <div className="lg:hidden flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold">
                  {n2021.period}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {n2021.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.25fr_1fr] gap-4 lg:gap-8 items-start">
                <div className="group relative flex flex-col justify-between bg-white hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4">
                  <div className="space-y-2.5">
                    {(n2021.mainQuest.role || n2021.mainQuest.badge) && (
                      <div className="flex items-center justify-between gap-3">
                        {n2021.mainQuest.role && (
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-neutral-900">{n2021.mainQuest.role}</span>
                        )}
                        {n2021.mainQuest.badge && (
                          <span onClick={() => onNavigateTab?.('achievements', 'ota')} className="relative z-10 whitespace-nowrap text-[11px] font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer">{n2021.mainQuest.badge}</span>
                        )}
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                      {n2021.mainQuest.title}
                    </h3>

                    {n2021.mainQuest.summary && (
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2021.mainQuest.summary}
                      </p>
                    )}
                  </div>

                  {n2021.mainQuest.highlights.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100 group-hover:border-neutral-800 space-y-1.5">
                      {n2021.mainQuest.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 group-hover:text-neutral-700">
                          <span className="text-neutral-400 shrink-0">–</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block"></div>

                {n2021.sideQuest && (
                  <div className="group relative flex flex-col justify-between bg-[#FDFCFB] hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4 lg:-mt-4">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                        {n2021.sideQuest.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700 whitespace-pre-line">
                        {n2021.sideQuest.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Node · 2021 · Phase 02 声音沉浸 / 喜马拉雅（独立模块） ===== */}
            <div className="relative">
              <div className="hidden lg:flex absolute left-1/2 -top-8 -translate-x-1/2 z-10 flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-900 shadow-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-900 text-[10px] font-mono font-semibold text-neutral-700 whitespace-nowrap">
                  {n2020.period}
                </span>
              </div>

              <div className="lg:hidden flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold">
                  {n2020.period}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {n2020.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.25fr_1fr] gap-4 lg:gap-8 items-start">
                <div className="group relative flex flex-col justify-between bg-white hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4">
                  <div className="space-y-2.5">
                    {(n2020.mainQuest.role || n2020.mainQuest.badge) && (
                      <div className="flex items-center justify-between gap-3">
                        {n2020.mainQuest.role && (
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-neutral-900">{n2020.mainQuest.role}</span>
                        )}
                        {n2020.mainQuest.badge && (
                          <span onClick={() => onNavigateTab?.('achievements', 'audio')} className="relative z-10 whitespace-nowrap text-[11px] font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer">{n2020.mainQuest.badge}</span>
                        )}
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                      {n2020.mainQuest.title}
                    </h3>

                    {n2020.mainQuest.summary && (
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2020.mainQuest.summary}
                      </p>
                    )}
                  </div>

                  {n2020.mainQuest.highlights.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100 group-hover:border-neutral-800 space-y-1.5">
                      {n2020.mainQuest.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 group-hover:text-neutral-700">
                          <span className="text-neutral-400 shrink-0">–</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block"></div>

                {n2020.sideQuest && (
                  <div className="group relative flex flex-col justify-between bg-[#FDFCFB] hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] lg:mt-8">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                        {n2020.sideQuest.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2020.sideQuest.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => window.open('https://my.feishu.cn/mindnotes/I9Fqbe0fHmb5lSnwUZ9cpA5Wn9f#mindmap', '_blank')} className="relative z-10 w-12 py-0.5 rounded-full text-[10px] font-medium border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 group-hover:border-neutral-900 group-hover:bg-transparent group-hover:text-neutral-700 cursor-pointer">SOUL</button>
                      <button onClick={() => window.open('https://my.feishu.cn/mindnotes/TrZLbGWzem08yhnEYxac7Tb4nXe#mindmap', '_blank')} className="relative z-10 w-12 py-0.5 rounded-full text-[10px] font-medium border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 group-hover:border-neutral-900 group-hover:bg-transparent group-hover:text-neutral-700 cursor-pointer">UKI</button>
                      <button onClick={() => window.open('https://my.feishu.cn/mindnotes/Gs9rbBJG6ma445nC1cVcdtg4nNg#mindmap', '_blank')} className="relative z-10 w-12 py-0.5 rounded-full text-[10px] font-medium border border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 group-hover:border-neutral-900 group-hover:bg-transparent group-hover:text-neutral-700 cursor-pointer">一罐</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Node · 2018 · Phase 01 圈层启蒙 / 第一弹（独立模块） ===== */}
            <div className="relative">
              <div className="hidden lg:flex absolute left-1/2 top-4 -translate-x-1/2 z-10 flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-900 shadow-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-900 text-[10px] font-mono font-semibold text-neutral-700 whitespace-nowrap">
                  {n2018.period}
                </span>
              </div>

              <div className="lg:hidden flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold">
                  {n2018.period}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {n2018.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.25fr_1fr] gap-4 lg:gap-8 items-start">
                <div className="group relative flex flex-col justify-between bg-white hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4">
                  <div className="space-y-2.5">
                    {(n2018.mainQuest.role || n2018.mainQuest.badge) && (
                      <div className="flex items-center justify-between gap-3">
                        {n2018.mainQuest.role && (
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-neutral-900">{n2018.mainQuest.role}</span>
                        )}
                        {n2018.mainQuest.badge && (
                          <span onClick={() => onNavigateTab?.('achievements', 'acg')} className="relative z-10 whitespace-nowrap text-[11px] font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer">{n2018.mainQuest.badge}</span>
                        )}
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                      {n2018.mainQuest.title}
                    </h3>

                    {n2018.mainQuest.summary && (
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2018.mainQuest.summary}
                      </p>
                    )}
                  </div>

                  {n2018.mainQuest.highlights.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100 group-hover:border-neutral-800 space-y-1.5">
                      {n2018.mainQuest.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 group-hover:text-neutral-700">
                          <span className="text-neutral-400 shrink-0">–</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block"></div>

                {n2018.sideQuest && (
                  <div className="group relative flex flex-col justify-between bg-[#FDFCFB] hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4 lg:mt-12">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                        {n2018.sideQuest.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2018.sideQuest.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100/80 group-hover:border-neutral-800">
                      <div className="pl-3 border-l border-neutral-300 group-hover:border-neutral-900 text-[11px] text-neutral-500 italic leading-relaxed group-hover:text-neutral-600">
                        {n2018.sideQuest.details}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Node · 2016 · Phase 00 新手村（独立模块） ===== */}
            <div className="relative">
              <div className="hidden lg:flex absolute left-1/2 top-4 -translate-x-1/2 z-10 flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-white border-2 border-neutral-900 shadow-xs flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neutral-900"></span>
                </div>
                <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-white border border-neutral-900 text-[10px] font-mono font-semibold text-neutral-700 whitespace-nowrap">
                  {n2016.period}
                </span>
              </div>

              <div className="lg:hidden flex items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 text-white text-xs font-mono font-bold">
                  {n2016.period}
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  {n2016.tag}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.25fr_1fr] gap-4 lg:gap-8 items-start">
                <div className="group relative flex flex-col justify-between bg-white hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4">
                  <div className="space-y-2.5">
                    {(n2016.mainQuest.role || n2016.mainQuest.badge) && (
                      <div className="flex items-center justify-between gap-3">
                        {n2016.mainQuest.role && (
                          <span className="text-xs font-bold text-neutral-900 group-hover:text-neutral-900">{n2016.mainQuest.role}</span>
                        )}
                        {n2016.mainQuest.badge && (
                          <span className="relative z-10 whitespace-nowrap text-[11px] font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer">{n2016.mainQuest.badge}</span>
                        )}
                      </div>
                    )}

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                      {n2016.mainQuest.title}
                    </h3>

                    {n2016.mainQuest.summary && (
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2016.mainQuest.summary}
                      </p>
                    )}
                  </div>

                  {n2016.mainQuest.highlights.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100 group-hover:border-neutral-800 space-y-1.5">
                      {n2016.mainQuest.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-neutral-700 group-hover:text-neutral-700">
                          <span className="text-neutral-400 shrink-0">–</span>
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="hidden lg:block"></div>

                {n2016.sideQuest && (
                  <div className="group relative flex flex-col justify-between bg-[#FDFCFB] hover:bg-[#F6B83F] after:content-[''] after:absolute after:inset-0 after:translate-x-[12px] after:translate-y-[12px] border-2 border-neutral-900 rounded-2xl p-5 sm:p-6 shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow] duration-100 hover:-translate-x-[4px] hover:-translate-y-[4px] hover:shadow-[8px_8px_0_0_#171717] space-y-4 lg:mt-4">
                    <div className="space-y-2.5">
                      <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-neutral-900">
                        {n2016.sideQuest.title}
                      </h3>

                      <p className="text-xs text-neutral-600 leading-relaxed font-normal group-hover:text-neutral-700">
                        {n2016.sideQuest.summary}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DUAL PERSPECTIVES: 我眼中的我 vs. 他人眼中的我               */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col items-center text-center sm:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
              <Split className="w-3.5 h-3.5 text-neutral-700" />
              <span>Dual Perspectives · 双重镜像</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              自我画像 与 他人视界
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              造梦者的精神内省 vs 他人眼中的真实倒影
            </p>
          </div>
        </div>

        {/* Full-width horizontal divider between header and columns */}
        <div aria-hidden="true" className="border-t border-neutral-200"></div>

        <div>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-x-28 gap-y-12 py-6 sm:py-8 bg-[rgb(250,250,249)]">
            {/* Vertical divider between columns: gradient fade at both ends */}
            <div
              aria-hidden="true"
              className="hidden md:block absolute left-1/2 -translate-x-1/2 top-4 bottom-4 w-px border-l border-neutral-300/70 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
            ></div>
            {perspectiveColumns.map((col) => (
              <div
                key={col.view}
                className="relative flex flex-col"
              >
                {/* Oversized watermark number */}
                <span className="absolute -top-7 right-0 text-[88px] leading-none font-black font-mono text-neutral-900/[0.06] select-none pointer-events-none">
                  {col.index}
                </span>

                {/* Kicker */}
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900"></span>
                  <span>{col.index} / {col.kicker}</span>
                </div>

                {/* Big editorial title */}
                <h3
                  className="mt-5 self-start inline-block px-2.5 py-1 text-[28px] sm:text-[36px] font-black text-white text-left leading-[1.3] tracking-tight"
                  style={{ backgroundColor: col.titleBg }}
                >
                  {col.title.filter(Boolean).map((line, i, arr) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </h3>

                {/* Quote with black bar */}
                <blockquote className="mt-6 pl-4 border-l-2 border-neutral-900 text-sm sm:text-base font-light italic text-neutral-600 leading-relaxed">
                  “{col.quote}”
                </blockquote>

                {/* Numbered items */}
                <div className="mt-10 space-y-6">
                  {col.items.map((item) => (
                    <div key={item.no} className="flex gap-3">
                      <span className="text-xs font-mono text-neutral-400 pt-0.5 shrink-0">{item.no}.</span>
                      <div>
                        <h4 className="text-[15px] sm:text-base font-bold text-neutral-900">{item.title}</h4>
                        <p className="mt-1.5 text-[13px] sm:text-sm text-neutral-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Column footer */}
                <div className="mt-auto pt-8">
                  <div className="pt-4 border-t border-neutral-300/70 flex items-center justify-end">
                    <span className="text-xs font-mono text-neutral-400 tracking-wider">
                      {col.footerTags.join(' · ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
