import React from 'react';
import { ArticleItem } from '../types';
import { resolveImg, onImgError } from '../data/portfolioData';
import { X, Calendar, Clock, User, Tag } from 'lucide-react';

interface ArticleModalProps {
  article: ArticleItem | null;
  onClose: () => void;
}

/** 渲染内联 Markdown-like 格式：**粗体**、*斜体*、`代码`，转成 ReactNode */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 匹配 **...** (粗体)、*...* (斜体)、`...` (代码)
  const re = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(
        <strong key={key++} className="font-bold text-neutral-900">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('`')) {
      nodes.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-[0.85em] font-mono text-neutral-800"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <em key={key++} className="italic text-neutral-700">
          {token.slice(1, -1)}
        </em>,
      );
    }
    lastIndex = match.index + token.length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

/** 将正文 content（string | string[]）解析成段落 JSX 数组 */
function renderContent(content: string | string[]): React.ReactNode[] {
  const paras = Array.isArray(content) ? content : content.split(/\n\n+/);
  return paras.map((raw, i) => {
    const p = raw.trim();
    if (!p) return null;

    // ## 二级标题
    if (p.startsWith('## ')) {
      return (
        <h3
          key={i}
          className="mt-6 mb-3 text-base sm:text-lg font-bold text-neutral-900 tracking-tight border-l-2 border-neutral-900 pl-3"
        >
          {p.slice(3).trim()}
        </h3>
      );
    }

    // > 引用（支持多行连续引用）
    if (p.startsWith('> ')) {
      return (
        <blockquote
          key={i}
          className="my-4 pl-4 pr-4 py-3 border-l-2 border-neutral-400 bg-neutral-50/80 text-neutral-700 italic leading-relaxed rounded-r-lg"
        >
          {renderInline(p.slice(2).trim())}
        </blockquote>
      );
    }

    // 列表项（- / * 开头）
    if (/^[-*] /.test(p)) {
      const items = paras
        .slice(i)
        .map((s) => s.trim())
        .filter((s) => /^[-*] /.test(s))
        .map((s) => s.replace(/^[-*] /, ''));
      return (
        <ul key={i} className="my-3 pl-5 space-y-1.5 text-sm text-neutral-700 list-disc marker:text-neutral-400">
          {items.map((it, j) => (
            <li key={j} className="leading-relaxed">
              {renderInline(it)}
            </li>
          ))}
        </ul>
      );
    }

    // 普通段落：首行缩进两字符
    return (
      <p
        key={i}
        className="text-sm sm:text-[15px] text-neutral-700 leading-[1.85] [text-indent:2em]"
      >
        {renderInline(p)}
      </p>
    );
  }).filter(Boolean);
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-neutral-900/55 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-3xl shadow-xl overflow-hidden my-6 sm:my-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 封面图（可选） */}
        {article.cover && (
          <div className="relative w-full aspect-[16/9] bg-neutral-900 border-b border-neutral-100 overflow-hidden">
            <img
              src={resolveImg(article.cover)}
              data-src={article.cover}
              onError={onImgError}
              alt={article.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-colors cursor-pointer z-10"
              aria-label="关闭文章"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header（无封面时：按钮贴右上；有封面时：按钮已在封面上） */}
        <div
          className={`px-6 sm:px-8 py-5 sm:py-6 border-b border-neutral-100 ${
            article.cover ? '-mt-10 relative z-10' : ''
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900 text-white rounded-full text-[11px] font-semibold tracking-wide">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-snug">
            {article.title}
          </h2>
          {article.subtitle && (
            <p className="mt-1.5 text-sm sm:text-base text-neutral-500 leading-relaxed">
              {article.subtitle}
            </p>
          )}

          <div className="mt-4 flex items-center gap-3 text-xs font-mono text-neutral-400">
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

          {!article.cover && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
              aria-label="关闭文章"
            >
              <X className="w-4 h-4 text-neutral-600" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-0">
          {/* 导读 */}
          <div className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-neutral-50 to-neutral-100 border border-neutral-200/70 rounded-2xl text-sm text-neutral-700 leading-relaxed">
            <strong className="text-neutral-900 font-semibold tracking-wide">导读 · </strong>
            {article.excerpt}
          </div>

          {/* 正文段落 */}
          <article className="space-y-0">
            {renderContent(article.content)}
          </article>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
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
