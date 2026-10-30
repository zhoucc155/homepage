import React, { useState } from 'react';
import { TabKey } from '../types';
import { resolveImg, onImgError } from '../data/portfolioData';
import { Mail, Menu, X, ArrowUpRight, Play, Pause, ListOrdered, Repeat1, Shuffle, ListMusic, SkipForward } from 'lucide-react';
import { usePlayer } from './MusicPlayerContext';
import type { PlayMode } from './MusicPlayerContext';

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onOpenContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 黑胶播放器：播放状态与控制来自全局 Provider
  const { isPlaying, playPause, skipSong, playMode, setPlayMode, viewPlaylist } = usePlayer();
  const [showHint, setShowHint] = useState(false);

  // 首次打开网页：头像左侧浮现音乐提示（展示一次后本地记录，开始播放或 6 秒后消失）
  React.useEffect(() => {
    if (!localStorage.getItem('mb_vinyl_hint_done')) setShowHint(true);
  }, []);
  React.useEffect(() => {
    if (!showHint) return;
    const t = setTimeout(() => {
      setShowHint(false);
      localStorage.setItem('mb_vinyl_hint_done', '1');
    }, 6000);
    return () => clearTimeout(t);
  }, [showHint]);
  React.useEffect(() => {
    if (isPlaying && showHint) {
      setShowHint(false);
      localStorage.setItem('mb_vinyl_hint_done', '1');
    }
  }, [isPlaying, showHint]);

  // 连播模式：顺序播放 / 单曲循环 / 随机播放
  const playModes: { key: PlayMode; label: string; Icon: typeof ListOrdered }[] = [
    { key: 'order', label: '顺序播放', Icon: ListOrdered },
    { key: 'loop-one', label: '单曲循环', Icon: Repeat1 },
    { key: 'shuffle', label: '随机播放', Icon: Shuffle },
  ];

  // DVD 抽屉显隐：唱片与抽屉是分离区域（抽屉 z 层在导航栏下方），用状态+关闭宽限计时保持 hover 连续性
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerCloseTimer = React.useRef<number | null>(null);
  const openDrawer = () => {
    if (drawerCloseTimer.current) {
      window.clearTimeout(drawerCloseTimer.current);
      drawerCloseTimer.current = null;
    }
    setDrawerOpen(true);
  };
  const scheduleDrawerClose = () => {
    if (drawerCloseTimer.current) window.clearTimeout(drawerCloseTimer.current);
    drawerCloseTimer.current = window.setTimeout(() => setDrawerOpen(false), 150); // 150ms 宽限：横穿唱片与抽屉之间的空隙不收起
  };
  React.useEffect(
    () => () => {
      if (drawerCloseTimer.current) window.clearTimeout(drawerCloseTimer.current);
    },
    []
  );

  const tabs: { key: TabKey; label: string; english: string }[] = [
    { key: 'home', label: '首页', english: 'Home' },
    { key: 'about', label: '关于我', english: 'About' },
    { key: 'achievements', label: '项目复盘', english: 'Review' },
    { key: 'hobbies', label: '我的爱好', english: 'Hobbies' },
    { key: 'works', label: '我的作品', english: 'Portfolio' },
  ];

  const handleTabClick = (key: TabKey) => {
    onTabChange(key);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-4 sm:top-6 z-50 px-3 sm:px-4 max-w-5xl mx-auto">
      {/* DVD 抽屉：导航栏的兄弟节点且 z 层更低，右端深塞入栏体左缘下方 24px——圆角规格与导航栏一致（rounded-full），
          塞入深度 ≥ 抽屉圆帽半径（21px），右端圆帽完全藏进胶囊左端圆弧之下，滑出全程看不到右侧圆角；
          右内边距 pr-6 = 塞入深度，按钮全部留在胶囊左尖端以外完整可见 */}
      <div
        onMouseEnter={openDrawer}
        onMouseLeave={scheduleDrawerClose}
        className={`hidden sm:block absolute top-1/2 -translate-y-1/2 z-0 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          drawerOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 translate-x-4 pointer-events-none'
        }`}
        style={{ right: 'calc(100% - 40px)' }}
      >
        <div className="flex items-center gap-1 bg-neutral-900/70 backdrop-blur-xl border border-white/15 rounded-full pl-2.5 pr-6 py-1.5 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]">
          {playModes.map(({ key, label, Icon }) => (
            <button
              key={key}
              title={label}
              aria-label={label}
              onClick={() => setPlayMode(key)}
              className={`flex items-center justify-center w-7 h-7 rounded-full transition-all cursor-pointer ${
                playMode === key
                  ? 'bg-white text-neutral-900 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
          <span className="w-px h-4.5 bg-white/15 mx-0.5" />
          {/* 切歌：按当前连播模式跳到下一首（单曲循环模式下也前进） */}
          <button
            title="切歌"
            aria-label="切歌"
            onClick={skipSong}
            className="flex items-center justify-center w-7 h-7 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            title="查看歌单"
            aria-label="查看歌单"
            onClick={viewPlaylist}
            className="flex items-center justify-center w-7 h-7 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Floating Pill Nav Bar matching Image 1 layout, clean & sleek */}
      <div className="relative z-20 bg-white/90 backdrop-blur-md border border-neutral-200/90 rounded-full px-4 sm:px-6 py-2.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] flex items-center justify-between gap-4">
        {/* Left zone: avatar + desktop navigation links */}
        <div className="flex items-center gap-4">
          {/* 黑胶唱片播放器：头像即唱片，播放时缓慢顺时针旋转；悬浮显示播放/暂停，并触发 DVD 抽屉从导航栏左侧抽出 */}
          <div
            className="relative group/vinyl shrink-0"
            onMouseEnter={openDrawer}
            onMouseLeave={scheduleDrawerClose}
          >
            {/* 首次访问提示：唱片左侧滑入（悬浮黑胶或开始播放后消失；小屏隐藏避免横向溢出） */}
            {showHint && (
              <div className="hidden sm:block absolute right-full top-1/2 -translate-y-1/2 pr-3 z-10 pointer-events-none animate-in fade-in slide-in-from-right-2 duration-300 group-hover/vinyl:opacity-0 transition-opacity">
                <span className="block whitespace-nowrap bg-white/95 backdrop-blur border border-neutral-200/90 rounded-full px-3.5 py-1.5 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)] text-xs text-neutral-600">
                  有点枯燥？来点音乐
                </span>
              </div>
            )}
            {/* 黑胶唱片按钮：播放时缓慢旋转（暂停冻结角度），悬浮覆盖播放/暂停键 */}
            <button
              onClick={playPause}
              aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
              className="relative block w-9 h-9 rounded-full cursor-pointer focus:outline-none select-none"
            >
              <span
                className="absolute inset-0 rounded-full bg-neutral-900 shadow-[0_2px_6px_rgba(0,0,0,0.35)] animate-spin [animation-duration:12s]"
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              >
                {/* 唱片纹路：细密同心槽 */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.07) 0px, rgba(255,255,255,0.07) 0.5px, transparent 0.5px, transparent 2.5px)' }}
                />
                {/* 角向光泽：极淡的宽幅光带，旋转时胶面有微弱的活感 */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'conic-gradient(from 210deg, rgba(255,255,255,0.04), transparent 30%, rgba(255,255,255,0.015) 55%, transparent 80%, rgba(255,255,255,0.04))' }}
                />
                {/* 中心唱片标签=头像（占比加大让唱片黑边更细） */}
                <img
                  src={resolveImg('/images/avatar_kino.png')}
                  data-src="/images/avatar_kino.png"
                  onError={onImgError}
                  alt="Charline / 周晏宁"
                  draggable={false}
                  className="absolute inset-[22%] w-[56%] h-[56%] rounded-full object-cover ring-1 ring-white/25 select-none"
                />
              </span>
              {/* 固定光源光影（参考实拍黑胶·哑光）：大范围低反差的柔和高光缓释到整个胶面 + 边缘缓慢入暗，无局部光斑、无轮缘反光 */}
              <span
                className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_0_6px_rgba(0,0,0,0.35)]"
                style={{
                  background:
                    'radial-gradient(140% 140% at 32% 25%, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.015) 60%, transparent 78%), radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.28) 95%)',
                }}
              />
              {/* 悬浮播放/暂停覆盖层 */}
              <span className="absolute inset-0 z-10 rounded-full bg-black/20 flex items-center justify-center opacity-0 group-hover/vinyl:opacity-100 transition-opacity duration-150">
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 text-white" fill="currentColor" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-white translate-x-px" fill="currentColor" />
                )}
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1 text-[11px] opacity-60">
                  {tab.english}
                </span>
              </button>
            );
          })}
          </nav>
        </div>

        {/* Action button zone */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenContact}
            className="flex items-center justify-center w-9 h-9 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full shadow-xs hover:shadow-sm transition-all cursor-pointer"
            aria-label="聊聊合作"
          >
            <Mail className="w-4 h-4 text-neutral-300" />
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-neutral-800 hover:bg-neutral-100 rounded-full focus:outline-none cursor-pointer"
            aria-label="切换菜单"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl p-3 shadow-lg flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs ${isActive ? 'text-neutral-300' : 'text-neutral-400'}`}>
                  {tab.english}
                </span>
              </button>
            );
          })}
          <div className="pt-2 mt-1 border-t border-neutral-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full text-center py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>聊聊合作 · Get in touch</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
