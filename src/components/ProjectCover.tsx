import React from 'react';

interface ProjectCoverProps {
  src: string;
  alt: string;
  className?: string;
  /** contain：原比例居中留白（默认）；cover：铺满容器并轻微裁剪 */
  fit?: 'contain' | 'cover';
}

/**
 * 项目封面：主图保持原比例居中展示、不裁剪（object-contain）；
 * 容器未铺满的区域以同一张图放大模糊压暗作衬底（播放器 letterbox 手法），
 * 竖图进横容器时两侧是同色系的柔焦延伸，视觉和谐。悬浮时主图轻放大、衬底微扩。
 */
export const ProjectCover: React.FC<ProjectCoverProps> = ({ src, alt, className = '', fit = 'contain' }) => (
  <>
    {/* 衬底：同图放大模糊铺满，填充主图未覆盖区域 */}
    <img
      src={src}
      alt=""
      aria-hidden="true"
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`absolute inset-0 w-full h-full object-cover scale-110 blur-lg brightness-90 transition-transform duration-500 group-hover:scale-112 ${className}`}
    />
    {/* 主图：保持原比例、居中、不裁剪 */}
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`absolute inset-0 w-full h-full ${fit === 'cover' ? 'object-cover' : 'object-contain'} transition-transform duration-500 group-hover:scale-102 ${className}`}
    />
  </>
);
