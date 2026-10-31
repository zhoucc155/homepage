import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { ProjectItem } from '../../types';
import { TRACK_PROJECTS } from '../../data/portfolioData';
import { ProjectCover } from '../ProjectCover';
import { 
  TrendingUp, 
  Users, 
  Box, 
  Zap, 
  Award,
  ArrowUpRight,
  Headphones, 
  Compass, 
  Code2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface AchievementsTabProps {
  onSelectProject: (project: ProjectItem) => void;
  initialTrack?: 'all' | 'acg' | 'audio' | 'ota';
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ onSelectProject, initialTrack = 'all' }) => {
  // 赛道切换控制器：all / acg(二次元社区) / audio(声音内容平台) / ota(OTA平台)
  const [activeTrack, setActiveTrack] = useState<'all' | 'acg' | 'audio' | 'ota'>(initialTrack);

  // 滑动指示器：测量当前激活按钮的位置，让白底胶囊平滑滑动过去
  const switcherRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  // 复盘区锚点：从首页带赛道跳转过来时，定位到本区域并预留吸顶导航高度，避免被导航栏遮挡
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (initialTrack === 'all') return;
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'auto' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TRACK_OPTIONS: { key: 'all' | 'acg' | 'audio' | 'ota'; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'acg', label: '二次元社区' },
    { key: 'audio', label: '声音内容平台' },
    { key: 'ota', label: 'OTA平台' },
  ];

  const TRACK_LABELS: Record<'acg' | 'audio' | 'ota', string> = {
    acg: '第一弹',
    audio: '喜马拉雅',
    ota: '携程',
  };

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const container = switcherRef.current;
      if (!container) return;
      const activeBtn = container.querySelector<HTMLButtonElement>(
        `button[data-key="${activeTrack}"]`
      );
      if (activeBtn) {
        setIndicator({
          left: activeBtn.offsetLeft,
          width: activeBtn.offsetWidth,
          ready: true,
        });
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTrack]);

  const filteredProjects =
    activeTrack === 'all'
      ? TRACK_PROJECTS
      : TRACK_PROJECTS.filter((p) => p.track === activeTrack);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Header */}
      <section className="space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
          Proven Impact · 项目成绩与业务沉淀
        </span>
        <h1 className="mt-2! text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          用扎实的业务结果与生态留存说话
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed font-normal">
          横跨二次元社区、音频直播与OTA直播三大业务场景，围绕内容生态、创作者、用户增长与商业化，交付可量化、可持续的生态战绩。
        </p>
        <blockquote className="mt-4! pl-3 border-l border-neutral-200 text-xs sm:text-sm text-neutral-500 italic font-light leading-relaxed max-w-2xl">
          整理过往项目的过程犹如拾取散落银河的星星，有的历经时间刷洗已无处可循，唯记忆长存于心。
        </blockquote>
      </section>

      {/* ============================================================== */}
      {/* 1. TOP QUANTITATIVE IMPACT GRID (Image 5 Style, Clean)        */}
      {/* ============================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Content Reach */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">内容生态</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              0-1
            </div>
            <div className="text-xs font-bold text-neutral-800 mt-1">
              社区生态体系建设
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              包括社区治理、内容冷启动、种子用户运营、数据看板搭建等
            </p>
          </div>
        </div>

        {/* Metric Card 2: Community Retention */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold">创作者生态</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              200%
            </div>
            <div className="text-xs font-bold text-neutral-800 mt-1">
              创作者孵化效率提升
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              从 0 搭建主播成长体系并推动产品化，承接每月近 2 万名新主播的规模化成长需求。
            </p>
          </div>
        </div>

        {/* Metric Card 3: Cultural Tourism Footprint */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold">用户增长</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              52万
            </div>
            <div className="text-xs font-bold text-neutral-800 mt-1">
              增长玩法3天新增UV
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              用鉴定结果激活潜在用户，建立用户与业务场景的连接。
            </p>
          </div>
        </div>

        {/* Metric Card 4: AI Prototyping Speed */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-neutral-300 transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">商业化增长</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              7000万
            </div>
            <div className="text-xs font-bold text-neutral-800 mt-1">
              抖音直播累计GMV
            </div>
            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
              基于抖音算法标签推流逻辑，重构整套选品、讲解、运营体系。
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. IN-DEPTH CASE STUDIES: 赛道切换 + 双列卡片 (参考图布局)        */}
      {/* ============================================================== */}
      <section ref={sectionRef} className="space-y-8">
        {/* Header: 标题 + 副标题（左） / 赛道切换控制器（右） */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              代表项目复盘与业务攻坚
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500">
              聚焦内容生态、创作者留存、用户增长与商业化增长实战复盘
            </p>
          </div>

          {/* 赛道切换控制器：白底指示器随激活项平滑滑动 */}
          <div
            ref={switcherRef}
            className="relative inline-flex items-center self-start sm:self-center bg-neutral-100 rounded-xl p-1"
          >
            <div
              className={`absolute top-1 bottom-1 rounded-lg bg-white border border-neutral-200 shadow-xs ${
                indicator.ready ? 'transition-all duration-300 ease-out' : ''
              }`}
              style={{ left: indicator.left, width: indicator.width }}
            />
            {TRACK_OPTIONS.map((option) => {
              const isActive = activeTrack === option.key;
              return (
                <button
                  key={option.key}
                  data-key={option.key}
                  onClick={() => setActiveTrack(option.key)}
                  className={`relative z-10 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors duration-300 cursor-pointer ${
                    isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 双列竖版项目卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* 顶部封面图 */}
              <div className="relative aspect-[16/8.5] overflow-hidden bg-neutral-100">
                <ProjectCover src={project.image} alt={project.title} fit="cover" />
                {/* 电影级光影渐变：自底部向上细腻过渡，衬托角标与整体质感 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-3 left-3 w-[72px] text-center tracking-wider backdrop-blur-md bg-black/45 border border-white/15 text-white text-[10px] font-semibold py-1 rounded-full">
                  {project.client}
                </div>
                {project.sideBadge && (
                  <div className="absolute top-3 right-3 w-[72px] flex items-center justify-center tracking-wider bg-neutral-900/30 backdrop-blur-md border border-white/25 text-white text-[10px] font-semibold py-1 rounded-full">
                    <span>{project.sideBadge.replace('支线：', '')}</span>
                  </div>
                )}
              </div>

              {/* 卡片主体 */}
              <div className="p-5 sm:p-6 space-y-3 flex flex-col flex-1">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 group-hover:text-[#2563EB] transition-colors">
                  {project.title}
                </h3>

                <p className="text-xs sm:text-[13px] text-neutral-600 leading-relaxed -mt-1.5">
                  {project.summary}
                </p>

                {/* 三列核心数据 */}
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-1.5 grid grid-cols-3 gap-2 text-center">
                  {project.metrics.map((m, i) => (
                    <div key={i}>
                      <div className="text-[11px] font-mono text-neutral-400">{m.label}</div>
                      <div className="text-sm sm:text-base font-bold text-neutral-900 font-mono">
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 底部：核心 SOP 与查看复盘并排 */}
                <div className="pt-2 border-t border-neutral-100/80 flex items-center justify-between gap-4">
                  {project.sop && (
                    <div className="pl-3 border-l border-neutral-300 text-xs text-neutral-500 leading-relaxed">
                      核心 SOP：{project.sop}
                    </div>
                  )}
                  <button
                    onClick={() => onSelectProject(project)}
                    className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-neutral-900 hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all cursor-pointer"
                  >
                    <span>查看复盘</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. TESTIMONIALS / COLLABORATOR REVIEWS (Clean Minimalist)       */}
      {/* ============================================================== */}
      <section className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
            Data Analysis Capability · 数据分析能力
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            数据分析辅助运营决策的案例
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-6 space-y-4 transition-colors duration-200 hover:border-neutral-400/90 hover:bg-neutral-800">
            <div className="inline-block text-lg font-bold text-neutral-800 bg-rose-400 px-3 py-0.5">竞品分成规则调研分析</div>
            <p className="pl-3 border-l border-neutral-300 text-sm text-neutral-300 leading-relaxed italic">
              <span className="block">网易云入局音频直播，其分成规则会对喜马造成多大冲击？</span>
              <span className="block mt-2">研究并对比双方分成规则，锁定影响范围。优化我方分成规则和运营体系，提升新主播签约率。</span>
            </p>
            <div className="flex justify-end">
              <a
                href="https://my.feishu.cn/sheets/Ngkisd7HzhlZf6tJ4oVc5hg1nsd?sheet=92a05f"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-neutral-400 group-hover:text-white bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer"
              >
                查看分析思路
              </a>
            </div>
          </div>

          <div className="group bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-6 space-y-4 transition-colors duration-200 hover:border-neutral-400/90 hover:bg-neutral-800">
            <div className="inline-block text-lg font-bold text-neutral-800 bg-[#48BFE3] px-3 py-0.5">计划新开直播间ROI测算</div>
            <p className="pl-3 border-l border-neutral-300 text-sm text-neutral-300 leading-relaxed italic">
              <span className="block">团队计划新开区域直播间，问题是选择什么区域？ROI如何？</span>
              <span className="block mt-2">结合历史数据和渠道渗透率测算预估ROI，最终选定江浙沪、广东、云南作为候选，并劝退天津业务的开播诉求。</span>
            </p>
            <div className="flex justify-end">
              <a
                href="https://my.feishu.cn/wiki/ET4CwnOAyibot7kxp1tc7kgjnNf"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-neutral-400 group-hover:text-white bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer"
              >
                查看分析思路
              </a>
            </div>
          </div>

          <div className="group bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-6 space-y-4 transition-colors duration-200 hover:border-neutral-400/90 hover:bg-neutral-800">
            <div className="inline-block text-lg font-bold text-neutral-800 bg-amber-300 px-3 py-0.5">数据口径修正及经营诊断</div>
            <p className="pl-3 border-l border-neutral-300 text-sm text-neutral-300 leading-relaxed italic">
              <span className="block">对现有看板的字段定义逐一拆解，洞悉业务面临的挑战与机会。</span>
              <span className="block mt-2">修正“核销率”的数据口径，避免因口径问题造成数据虚高导致决策误判。同时针对业务核心卡点，多角度分析影响因素并给出针对性解法。</span>
            </p>
          </div>

          <div className="group bg-neutral-800/80 border border-neutral-700/80 rounded-2xl p-6 space-y-4 transition-colors duration-200 hover:border-neutral-400/90 hover:bg-neutral-800">
            <div className="inline-block text-lg font-bold text-neutral-800 bg-violet-300 px-3 py-0.5">量化商品售卖的生命周期</div>
            <p className="pl-3 border-l border-neutral-300 text-sm text-neutral-300 leading-relaxed italic">
              <span className="block">如何评估引流品/爆品效果？怎么判断该不该换品？</span>
              <span className="block mt-2">总结归纳过往引流品/爆品的售卖规律，包括上架后的流量涨跌、成交曲线、带动复购率等，定义爆品孵化周期和衰退周期；建立货盘动态流转机制，达到衰退指标时开始过渡换品。</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
