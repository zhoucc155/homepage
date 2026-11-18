import React from 'react';

/** 渲染内联 Markdown-like 格式：**粗体**、*斜体*、`代码` */
export function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
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

/**
 * 将文章正文（string | string[]）渲染成段落 JSX 数组。
 * 支持：## 小标题、> 引用、-/* 列表、普通段落（自动首行缩进 2em）。
 *
 * @param content 文章正文数组（每段一个字符串）或单字符串
 * @param opts 可选：首行缩进开启/关闭（默认开启）
 */
export function renderArticleParagraphs(
  content: string | string[],
  opts?: { indent?: boolean },
): React.ReactNode[] {
  const indent = opts?.indent ?? true;
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

    // > 引用
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

    // 列表项
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

    // 普通段落
    return (
      <p
        key={i}
        className={`text-sm sm:text-[15px] text-neutral-700 leading-[1.85] ${
          indent ? '[text-indent:2em]' : ''
        }`}
      >
        {renderInline(p)}
      </p>
    );
  }).filter(Boolean);
}
