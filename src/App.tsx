/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TabKey, ProjectItem } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { ContactModal } from './components/ContactModal';
import { ProjectModal } from './components/ProjectModal';
import { MusicPlayerProvider } from './components/tabs/HobbiesTab';
import { usePlayer } from './components/MusicPlayerContext';

import { HomeTab } from './components/tabs/HomeTab';
import { AboutTab } from './components/tabs/AboutTab';
import { AchievementsTab } from './components/tabs/AchievementsTab';
import { HobbiesTab } from './components/tabs/HobbiesTab';
import { WorksTab } from './components/tabs/WorksTab';

const AppShell = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [pendingTrack, setPendingTrack] = useState<'all' | 'acg' | 'audio' | 'ota'>('all');
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  // 导航栏黑胶「查看歌单」请求：切到爱好页（歌单页内的落地定位由 HobbiesTab 消费同一请求完成）
  const { viewRequest } = usePlayer();

  React.useEffect(() => {
    if (viewRequest) setActiveTab('hobbies');
  }, [viewRequest]);

  const handleTabChange = (tab: TabKey, track?: 'all' | 'acg' | 'audio' | 'ota') => {
    // 未指定赛道时重置为 all，避免项目复盘挂载时误触发锚点定位、盖过导航栏的回顶滚动
    setPendingTrack(track ?? 'all');
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-dot-pattern flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Top Floating Pill Navigation matching Image 1 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Main Content Area with generous breathing room below floating navbar */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-20">
        {activeTab === 'home' && (
          <HomeTab
            onNavigateTab={handleTabChange}
            onOpenContact={() => setIsContactOpen(true)}
            onSelectProject={(proj) => setSelectedProject(proj)}
          />
        )}

        {activeTab === 'about' && <AboutTab onNavigateTab={handleTabChange} />}

        {activeTab === 'achievements' && (
          <AchievementsTab
            onSelectProject={(proj) => setSelectedProject(proj)}
            initialTrack={pendingTrack}
          />
        )}

        {activeTab === 'hobbies' && <HobbiesTab />}

        {activeTab === 'works' && (
          <WorksTab onSelectProject={(proj) => setSelectedProject(proj)} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onTabChange={handleTabChange}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Floating back-to-top button */}
      <BackToTop />

      {/* Interactive Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default function App() {
  // 全局音乐播放器：播放状态与音频 iframe 提升至应用根部，切 tab 播放不中断
  return (
    <MusicPlayerProvider>
      <AppShell />
    </MusicPlayerProvider>
  );
}
