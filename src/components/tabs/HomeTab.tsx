import React from 'react';
import { TabKey, ProjectItem } from '../../types';
import { 
  PERSONAL_INFO, 
  PROJECTS_DATA 
} from '../../data/portfolioData';
import {
  Search,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Headphones,
  Compass,
  Calendar,
  Clock,
  Layers
} from 'lucide-react';

interface HomeTabProps {
  onNavigateTab: (tab: TabKey, track?: 'all' | 'acg' | 'audio' | 'ota') => void;
  onOpenContact: () => void;
  onSelectProject: (project: ProjectItem) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onNavigateTab,
  onOpenContact,
  onSelectProject,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ============================================================== */}
      {/* 1. HERO SECTION (Layout from Image 1, Clean & Refined)          */}
      {/* ============================================================== */}
      <section className="pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clean Editorial Typography & Signature Highlight Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
                我是{' '}
                <span className="bg-[rgb(245,158,11)] text-black px-3 py-0.5 inline-block border-[3px] border-neutral-900 -rotate-[2deg]">
                  周周周晏宁
                </span>
                <br />
                一个互联网平台运营 & AI探险家
              </h1>
            </div>

            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed font-normal">
              {PERSONAL_INFO.bio}
            </p>

            {/* CTAs matching Image 1 layout with clean modern styling */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onNavigateTab('about')}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <Search className="w-4 h-4 text-neutral-300" />
                <span>了解更多 · Know more</span>
              </button>

              <button
                onClick={() => onNavigateTab('works')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 rounded-full text-sm font-semibold shadow-xs hover:border-neutral-300 transition-all cursor-pointer"
              >
                <Lightbulb className="w-4 h-4 text-neutral-500" />
                <span>浏览作品 · View works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Character Portrait Card matching Image 1 layout */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-sm aspect-square rounded-3xl bg-amber-50 border border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-1.5 flex items-center justify-center overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]">
              <div className="w-full h-full rounded-2xl overflow-hidden bg-amber-100/50 relative flex items-center justify-center">
                <img
                  src={PERSONAL_INFO.avatar}
                  alt={PERSONAL_INFO.name}
                  className="w-full h-full object-cover scale-105 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quantifiable Metrics Strip (Image 5 style fused under Hero) */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {PERSONAL_INFO.stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all"
            >
              <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-neutral-800 mt-1">
                {stat.label}
              </div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                {stat.subtext}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SERVICES SECTION (Exact layout from Image 2, Clean & Clear)  */}
      {/* ============================================================== */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            My{' '}
            <span className="bg-[#E11D48] text-white px-2.5 py-0.5 rounded-md inline-block">
              career history
            </span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
            深耕二次元社区、声音内容平台与 OTA 平台生态，聚焦平台生态与商业化增长。
          </p>
        </div>

        {/* 3-Column Service Cards matching Image 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Service Card 1: ACG Community */}
          <div className="group bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col">
            <div className="h-48 bg-neutral-50 border-b border-neutral-100 p-5 flex items-center justify-center relative">
              {/* Graphic element for ACG Community */}
              <div className="w-52 bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">Creator Hub</span>
                </div>
                <div className="pt-2.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-600">
                      ★
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="w-20 h-2 bg-neutral-800 rounded-full"></div>
                      <div className="w-28 h-1.5 bg-neutral-200 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-[9px] font-mono text-neutral-600">创作者引入</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-[9px] font-mono text-neutral-600">分层扶持</span>
                    <span className="px-1.5 py-0.5 rounded-md bg-neutral-100 text-[9px] font-mono text-neutral-600">激励制度</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#E11D48] font-semibold">
                  01 · 圈层生态
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  二次元社区与创作者生态
                </h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  ACG Community & Creator Ecosystem
                </p>
                <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
                  深谙二次元文用户心智与圈层文化，0-1建设声音内容生态，完成创作者引入、扶持、激励，及商业化路径探索。
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => onNavigateTab('achievements', 'acg')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <span>查看社区生态案例</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Card 2: Audio & Voice */}
          <div className="group bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col">
            <div className="h-48 bg-neutral-50 border-b border-neutral-100 p-5 flex items-center justify-center relative">
              {/* Graphic element for Audio & Voice */}
              <div className="w-52 bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-[10px] font-mono text-neutral-500">Audio Live</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">DAU + 40%</span>
                </div>
                <div className="pt-2 flex items-center justify-center gap-1 h-12">
                  {[40, 75, 50, 90, 60, 30, 85, 45, 95, 60, 35, 70, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-full transition-all"
                      style={{ height: `${h * 0.35}px` }}
                    ></div>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-center text-neutral-400 pt-1">
                  标杆主播 × 特色内容栏目
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-indigo-600 font-semibold">
                  02 · 声音内容
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  泛娱乐音频直播与创作者生态
                </h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  Audio Live Streaming & Creator Ecosystem
                </p>
                <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
                  围绕音频直播业务，从运营试点到产品化落地，多维度提升平台内容供给能力、主播生命周期、内容消费效率。
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => onNavigateTab('achievements', 'audio')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>查看声音内容案例</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Service Card 3: Cultural Tourism */}
          <div className="group bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col">
            <div className="h-48 bg-neutral-50 border-b border-neutral-100 p-5 flex items-center justify-center relative">
              {/* Graphic element for Cultural Tourism */}
              <div className="w-52 bg-white border border-neutral-200 rounded-xl p-3 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[10px] font-mono text-neutral-500">Douyin Live</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 font-semibold">GMV 7000万 +</span>
                </div>
                <div className="h-10 bg-amber-50/70 border border-amber-200/60 rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span className="text-[11px] font-medium text-neutral-800">商品分层 × 供给优化</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">数据驱动</span>
                </div>
                <div className="text-[10px] font-mono text-center text-neutral-400">
                  公域推流逻辑 · 人货场三要素
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-amber-700 font-semibold">
                  03 · 旅游直播
                </span>
                <h3 className="text-lg font-bold text-neutral-900 mt-1">
                  平台生态与抖音公域直播
                </h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  Platform Ecosystem & Public Live Streaming
                </p>
                <p className="text-sm text-neutral-600 mt-2.5 leading-relaxed">
                  从平台生态建设到抖音直播间精耕，通过供给优化、主播运营、内容场景、商品策略和数据决策提升商业增长。
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-end">
                <button
                  onClick={() => onNavigateTab('achievements', 'ota')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors cursor-pointer"
                >
                  <span>查看旅游直播案例</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
