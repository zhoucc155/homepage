import React, { useState, useEffect, useRef } from 'react';
import { ProjectItem } from '../../types';
import { PROJECTS_DATA } from '../../data/portfolioData';
import { ProjectCover } from '../ProjectCover';
import {
  Sparkles,
  ArrowUpRight,
  Search,
  Filter,
  Layers,
  Headphones,
  Users,
  ChevronLeft,
  ChevronRight,
  Play,
  Volume2,
  VolumeX
} from 'lucide-react';
import { usePlayer } from '../MusicPlayerContext';

/* 视频与背景音乐协调：任一视频非静音播放时暂停音乐；全部转为静音或暂停后自动续播 */
let unmutedVideoCount = 0;
let musicPausedByVideo = false;

/* 半宽卡自定义角标：命中 id 时以「AI实践」样式胶囊显示固定文案，未命中则显示 分类 · 年份 */
const CUSTOM_BADGES: Record<string, string> = {
  'echoes-audio-drama': 'AI实践', // 美镜
  'prompt-craft-ai': 'AI实践', // JobHunter
  'wandercity-tourism': '内容创作',
  'acg-dimension-community': 'AI实践',
};

/* 特写卡视频：不自动播放——先显示封面，点击封面上的播放键才开始；
   开始后点击画面切换播放/暂停；进度条可拖动；默认静音，右上角可切换。
   frame='portrait' 时主画面按 3:4 裁剪居中（两侧同一视频模糊衬底），封面同为 3:4 居中 */
const FeaturedVideo: React.FC<{ src: string; alt: string; frame?: 'fill' | 'portrait'; poster?: string }> = ({
  src,
  alt,
  frame = 'fill',
  poster,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const backdropRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [fullyVisible, setFullyVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const player = usePlayer();
  /* 最新 player 快照：音乐 Provider 每次状态变化都会生成新 context 对象，
     协调逻辑统一走 ref 取值，避免被 Provider 重渲染触发/干扰 */
  const playerRef = useRef(player);
  playerRef.current = player;
  const wasUnmutedPlaying = useRef(false);

  /* 非静音播放 → 暂停背景音乐；转为静音或暂停 → 自动续播（仅当音乐此前被视频暂停） */
  useEffect(() => {
    const active = playing && !muted;
    if (active === wasUnmutedPlaying.current) return;
    const p = playerRef.current;
    if (active) {
      wasUnmutedPlaying.current = true;
      unmutedVideoCount += 1;
      if (unmutedVideoCount === 1 && p.isPlaying) {
        musicPausedByVideo = true;
        p.playPause();
      }
    } else {
      wasUnmutedPlaying.current = false;
      unmutedVideoCount = Math.max(0, unmutedVideoCount - 1);
      if (unmutedVideoCount === 0 && musicPausedByVideo) {
        musicPausedByVideo = false;
        if (!p.isPlaying) p.playPause();
      }
    }
  }, [playing, muted]);

  /* 卸载兜底：非静音播放中组件被移除（如切换 Tab）时归还计数并续播音乐 */
  useEffect(() => {
    return () => {
      if (!wasUnmutedPlaying.current) return;
      wasUnmutedPlaying.current = false;
      unmutedVideoCount = Math.max(0, unmutedVideoCount - 1);
      if (unmutedVideoCount === 0 && musicPausedByVideo) {
        musicPausedByVideo = false;
        const p = playerRef.current;
        if (p && !p.isPlaying) p.playPause();
      }
    };
  }, []);

  /* 监听卡片是否完整展示在视口中 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setFullyVisible(entries[0].intersectionRatio >= 0.99),
      { threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* 离开视口时暂停（不自动播放，均由用户点击封面开始） */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!fullyVisible) video.pause();
  }, [fullyVisible]);

  /* 竖版衬底与主画面同步播放/暂停 */
  useEffect(() => {
    const backdrop = backdropRef.current;
    if (!backdrop) return;
    if (playing) backdrop.play().catch(() => {});
    else backdrop.pause();
  }, [playing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!started) {
      setStarted(true);
      video.play().catch(() => {});
      return;
    }
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  /* 按指针位置定位播放进度 */
  const seekTo = (clientX: number) => {
    const bar = barRef.current;
    const video = videoRef.current;
    if (!bar || !video || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setProgress(ratio);
  };

  /* 进度条拖动：按下后跟随指针移动，松开结束 */
  const onBarPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    seekTo(e.clientX);
    const move = (ev: PointerEvent) => seekTo(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className="absolute inset-0 cursor-pointer"
    >
      {/* 竖版衬底：同一视频放大模糊铺满，随主画面同步播放 */}
      {frame === 'portrait' && (
        <video
          ref={backdropRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg brightness-90 pointer-events-none"
        />
      )}

      <div
        className={
          frame === 'portrait' ? 'absolute inset-0 flex items-center justify-center' : 'absolute inset-0'
        }
      >
        <video
          ref={videoRef}
          src={src}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          aria-label={alt}
          className={
            frame === 'portrait' ? 'h-full aspect-[3/4] object-cover' : 'w-full h-full object-cover'
          }
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgress(v.currentTime / v.duration);
          }}
        />
      </div>

      {/* 封面：未开始播放时显示封面图，点击任意处开始；fill 铺满，portrait 与主画面同 3:4 居中 */}
      {!started && poster && (
        frame === 'portrait' ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img
              src={poster}
              alt=""
              aria-hidden="true"
              className="h-full aspect-[3/4] object-cover"
            />
          </div>
        ) : (
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        )
      )}

      {/* 播放按钮：未播放时居中显示 */}
      {!playing && (
        <div
          aria-hidden="true"
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/45 backdrop-blur-xs border border-white/25 text-white flex items-center justify-center pointer-events-none"
        >
          <Play className="w-6 h-6 ml-0.5" />
        </div>
      )}

      {/* 静音/取消静音：右上角，仅播放中显示（阻断冒泡，不影响点击暂停/播放） */}
      {playing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          aria-label={muted ? '取消静音' : '静音'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center hover:bg-black/65 transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}

      {/* 进度条：常驻显示，支持点击定位与拖动调节 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2.5 flex items-end bg-transparent cursor-pointer"
        onPointerDown={onBarPointerDown}
        ref={barRef}
      >
        <div className="w-full h-1 bg-white/25">
          <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
};

/* 特写卡轮播：自动播放 + 左右切换 + 指示点，卡片完整进入视口时播放，悬浮时暂停 */
const FeaturedCarousel: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = rootRef.current?.closest('[data-featured-card]');
    if (!card) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.intersectionRatio >= 1),
      { threshold: 1 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !inView || images.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % images.length), 3500);
    return () => clearInterval(timer);
  }, [paused, inView, images.length]);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  return (
    <div
      ref={rootRef}
      className="absolute inset-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* 左右切换按钮 */}
      <button
        onClick={prev}
        aria-label="上一张"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        aria-label="下一张"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 backdrop-blur-xs text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* 指示点 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`切换到第 ${i + 1} 张`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

interface WorksTabProps {
  onSelectProject: (project: ProjectItem) => void;
}

export const WorksTab: React.FC<WorksTabProps> = ({ onSelectProject }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { label: '全部作品', value: 'All', icon: Layers },
    { label: 'AI实践', value: 'AI实践', icon: Users },
    { label: '内容创作', value: '内容创作', icon: Headphones },
  ];

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    // 分类依据与卡片角标一致：有自定义角标的项目按角标文案归类，其余按 category
    const badge = CUSTOM_BADGES[project.id] ?? project.category;
    const matchesCategory = selectedCategory === 'All' || badge === selectedCategory;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Header */}
      <section className="space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-2 inline-block">
          Selected Portfolio · 精选作品库
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          细碎灵感的捕梦网
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed font-normal">
          想要将萤火虫编织成一盏盏灯。这里陈列着我的灵感与想法落成的作品，收藏仍在继续，未完待续。
        </p>
      </section>

      {/* Filter and Search Bar */}
      <section className="space-y-4 mb-6! sm:mb-8!">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索项目、标签..."
              className="w-full bg-white border border-neutral-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-xs"
            />
          </div>
        </div>
      </section>

      {/* Projects Bento Grid：全宽特写卡（图内嵌留白）+ 半宽卡的编辑式排版 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((project, i) => {
          const isFirst = i === 0;
          const isFeatured = isFirst || i === 1; // 前两张为全宽特写卡，紧贴排列：美镜（图左）+ JobHunter（图右）
          const isReversed = isFeatured && !isFirst;
          const isStatRow = i % 2 === 1; // 半宽卡：奇数位用三格指标，偶数位用单指标 + 详情

          if (isFeatured) {
            return (
              <div
                key={project.id}
                data-featured-card
                className={`md:col-span-2 group bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden grid gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 ${
                  isReversed ? 'md:grid-cols-[1fr_1.2fr]' : 'md:grid-cols-[1.2fr_1fr]'
                }`}
              >
                {/* 视觉封面：自持 16:10 比例，高度不随文字内容变化，isReversed 时图在右；有 gallery 时渲染轮播 */}
                <div
                  className={`relative rounded-xl overflow-hidden bg-neutral-100 aspect-[16/10] self-start md:self-center border border-neutral-200 ${
                    isReversed ? 'md:order-2' : ''
                  }`}
                >
                  {project.gallery?.length ? (
                    <div className="absolute inset-0 group-hover:scale-102 transition-transform duration-500">
                      <FeaturedCarousel images={project.gallery} alt={project.title} />
                    </div>
                  ) : project.video ? (
                    <div className="absolute inset-0">
                      <FeaturedVideo
                        src={project.video}
                        alt={project.title}
                        frame={project.videoFrame}
                        poster={project.videoPoster}
                      />
                    </div>
                  ) : (
                    <ProjectCover src={project.image} alt={project.title} />
                  )}
                  <div className="absolute top-3 left-3 w-[72px] text-center tracking-wider backdrop-blur-md bg-black/45 border border-white/15 text-white text-[10px] font-semibold py-1 rounded-full">
                    AI实践
                  </div>
                </div>

                {/* 内容区：与封面同处一个内边距容器，边距一致 */}
                <div className="flex flex-col">
                  <div className="flex-1 flex flex-col justify-center gap-3">
                    <div className="space-y-2.5">
                      <div className="text-[11px] font-mono">
                        {isReversed ? (
                          <span className="text-[#2563EB] font-semibold">{project.category}</span>
                        ) : (
                          <span className="text-[#2563EB] font-semibold">{project.categoryEn}</span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-[22px] font-bold text-neutral-900 tracking-tight leading-snug group-hover:text-[#2563EB] transition-colors">
                        {project.title}
                      </h3>
                      <div className="text-[13px] text-neutral-500">{project.subtitle}</div>
                      <p className="text-[13px] text-neutral-600 leading-relaxed">
                        {project.summary}
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* 指标框：列数随指标数量自适应 */}
                      <div
                        className="grid gap-2.5"
                        style={{ gridTemplateColumns: `repeat(${project.metrics.length}, minmax(0, 1fr))` }}
                      >
                        {project.metrics.map((m, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5"
                          >
                            <div className="text-[11px] font-mono text-neutral-400">{m.label}</div>
                            <div className="text-[15px] font-bold text-neutral-900 font-mono mt-1 leading-tight">
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 标签 + 行动 */}
                      {isReversed ? (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => window.open('https://my.feishu.cn/wiki/S6HWw3efgiDAedkbXFVcu5JunUb', '_blank', 'noreferrer')}
                            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer"
                          >
                            <span>点击获取工具</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-4">
                          <a
                            href="/meijing-prototype.html"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 group-hover:text-neutral-900 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-300 cursor-pointer"
                          >
                            <span>查看页面原型</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={project.id}
              className="group bg-white border border-neutral-200/90 rounded-2xl shadow-xs hover:shadow-md hover:border-neutral-300 transition-all overflow-hidden flex flex-col p-5 sm:p-6 gap-3 sm:gap-3.5"
            >
              {/* 视觉封面：与内容区共用同一内边距容器；有视频时用视频封面（同特写卡播放逻辑） */}
              <div className="relative aspect-[3/2] rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                {project.video ? (
                  <FeaturedVideo
                    src={project.video}
                    alt={project.title}
                    frame={project.videoFrame}
                    poster={project.videoPoster}
                  />
                ) : (
                  <ProjectCover
                    src={project.image}
                    alt={project.title}
                    fit={project.id === 'acg-dimension-community' ? 'cover' : undefined}
                  />
                )}
                {CUSTOM_BADGES[project.id] ? (
                  <div className="absolute top-3 left-3 w-[72px] text-center tracking-wider backdrop-blur-md bg-black/45 border border-white/15 text-white text-[10px] font-semibold py-1 rounded-full">
                    {CUSTOM_BADGES[project.id]}
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 bg-neutral-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-semibold px-3 py-1.5 rounded-full">
                    {project.category} · {project.year}
                  </div>
                )}
              </div>

              {/* 内容区：与封面同处一个内边距容器，边距一致 */}
              <div className="flex-1 flex flex-col">
                <div className="space-y-1.5">
                  <div
                    className={`font-mono ${
                      project.id === 'wandercity-tourism' || project.id === 'acg-dimension-community'
                        ? 'text-[11px] font-semibold text-[#2563EB]'
                        : 'text-[10px] text-neutral-400'
                    }`}
                  >
                    {project.id === 'wandercity-tourism'
                      ? '视频剪辑 · 剪映'
                      : project.id === 'acg-dimension-community'
                        ? 'Gemini & Trae'
                        : `${project.client} · ${project.role}`}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-[13px] text-neutral-600 line-clamp-2 leading-relaxed">
                    {project.summary}
                  </p>
                </div>

                {isStatRow ? (
                  <div className="mt-auto pt-4 grid grid-cols-3 gap-2">
                    {project.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-neutral-200 rounded-lg px-2.5 py-2"
                      >
                        <div className="text-[10px] font-mono text-neutral-400">{m.label}</div>
                        <div className="text-[15px] font-bold text-neutral-900 font-mono mt-1 leading-tight">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>

      {filteredProjects.length === 0 && (
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-neutral-700">没有找到匹配的项目</p>
          <p className="text-xs text-neutral-400">请尝试切换分类或缩减搜索关键词</p>
        </div>
      )}
    </div>
  );
};
