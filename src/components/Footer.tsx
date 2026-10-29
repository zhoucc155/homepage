import React from 'react';
import { TabKey } from '../types';
import { PERSONAL_INFO } from '../data/portfolioData';
import { ArrowUp, Mail } from 'lucide-react';

interface FooterProps {
  onTabChange: (tab: TabKey) => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onTabChange, onOpenContact }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 sm:mt-28 border-t border-neutral-200/90 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          {/* Col 1: Wordmark & Bio */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/src/assets/images/avatar_kino.png"
                alt={PERSONAL_INFO.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="font-bold text-base tracking-tight text-neutral-900">
                {PERSONAL_INFO.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-[350px] leading-relaxed">
              深耕二次元社区、声音内容平台与 OTA 平台生态，聚焦平台生态与商业化增长。
            </p>
            <div className="text-xs font-mono text-neutral-400">
              © 2026 {PERSONAL_INFO.name}. All rights reserved.
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Quick Navigation
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-neutral-600">
              <button 
                onClick={() => { onTabChange('home'); scrollToTop(); }}
                className="text-left hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                首页 · Home
              </button>
              <button 
                onClick={() => { onTabChange('about'); scrollToTop(); }}
                className="text-left hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                关于我 · About
              </button>
              <button 
                onClick={() => { onTabChange('achievements'); scrollToTop(); }}
                className="text-left hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                项目复盘 · Review
              </button>
              <button 
                onClick={() => { onTabChange('hobbies'); scrollToTop(); }}
                className="text-left hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                我的爱好 · Hobbies
              </button>
              <button 
                onClick={() => { onTabChange('works'); scrollToTop(); }}
                className="text-left hover:text-neutral-900 transition-colors py-1 cursor-pointer"
              >
                我的作品 · Portfolio
              </button>
            </div>
          </div>

          {/* Col 3: Actions */}
          <div className="md:col-span-3 space-y-3 md:text-right flex flex-col md:items-end">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
              Get in touch
            </div>
            <button
              onClick={onOpenContact}
              className="flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>发送合作邀请 · Contact</span>
            </button>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer pt-1"
            >
              <span>回到顶部</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
