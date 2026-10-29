import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * 悬浮「回到顶部」按钮：
 * 当页面滚动超过一屏高度时出现在右下角，点击后平滑回到当前 tab 顶部。
 */
export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      className={`fixed bottom-10 right-6 z-40 flex items-center justify-center w-11 h-11 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};
