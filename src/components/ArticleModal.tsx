import React from 'react';
import { ArticleItem } from '../types';
import { X, Calendar, Clock, User } from 'lucide-react';

interface ArticleModalProps {
  article: ArticleItem | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-neutral-100">
          <span className="px-3 py-0.5 bg-neutral-100 border border-neutral-200 rounded-full text-xs font-semibold text-neutral-800">
            {article.category}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            aria-label="关闭文章"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
              {article.title}
            </h2>
            <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {article.date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {article.readTime}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {article.author}
              </span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-2xl text-xs sm:text-sm text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900">导读：</strong>{article.excerpt}
          </div>

          <div className="text-neutral-700 text-xs sm:text-sm leading-relaxed space-y-4">
            <p>{article.content}</p>
            <p>
              在二次元社区、声音内容与文旅数字化项目中，我们经常看到“空洞的视觉堆砌”与“粗糙的工程落地”之间的割裂。好的产品体验往往诞生于感性共情与严谨系统的交汇处：既尊重圈层用户的细腻情绪，又依托扎实的代码与架构确保毫秒级的顺滑体验。
            </p>
            <h4 className="text-sm font-bold text-neutral-900 pt-2">
              核心实践沉淀
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600">
              <li>以故事为原点推导功能架构，而非盲目堆砌功能表；</li>
              <li>严格把控色彩与动效的呼吸感，音频与阅读场景杜绝刺目荧光色；</li>
              <li>借助 AI 编程工具链快速实现高保真交互验证，让原型在真实设备上说话；</li>
              <li>将圈层同好的热爱转化为持续投稿与自发破圈的底层机制。</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono">
            Published by {article.author}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            完成阅读
          </button>
        </div>
      </div>
    </div>
  );
};
