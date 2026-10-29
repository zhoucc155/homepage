import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { X, Layers, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectCover } from './ProjectCover';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [project?.id]);

  if (!project) return null;

  const images = [project.image, ...(project.gallery ?? [])];
  const prevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % images.length);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-white border border-neutral-200 rounded-3xl shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold">
              {project.category}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              {project.year} · {project.client}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
            aria-label="关闭项目详情"
          >
            <X className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        {/* Project Cover Image (with gallery switcher) */}
        <div className="relative w-full h-64 sm:h-72 bg-neutral-900 border-b border-neutral-100 overflow-hidden group/modal-image">
          {imageIndex === 0 ? (
            <ProjectCover
              src={images[0]}
              alt={project.title}
              className="animate-in fade-in duration-300"
            />
          ) : (
            <img
              key={imageIndex}
              src={images[imageIndex]}
              alt={`${project.title} · 案例图 ${imageIndex}`}
              className="w-full h-full object-contain animate-in fade-in duration-300"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 pointer-events-none">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {project.title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                {project.subtitle}
              </p>
            </div>
          </div>

          {/* Gallery switcher */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="上一张"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover/modal-image:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-black/60"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                aria-label="下一张"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white opacity-0 group-hover/modal-image:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-black/60"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md border border-white/15 text-white text-[10px] font-mono tracking-wider">
                {imageIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 space-y-5">
          {/* Key Metrics Strip (Clean Style) */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {project.metrics.map((metric, idx) => (
              <div 
                key={idx}
                className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5"
              >
                <div className="text-xs text-neutral-500 font-medium font-mono">
                  {metric.label}
                </div>
                <div className="text-lg sm:text-xl font-bold text-neutral-900 mt-1 font-mono tracking-tight">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          {/* Overview & Context */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>项目概述 · Overview</span>
            </h4>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
              {project.description}
            </p>
          </div>

          {/* Role */}
          <div className="-mt-2! mb-3! pl-3 border-l border-neutral-300 text-xs text-neutral-700 leading-relaxed">
            角色担当：<strong>{project.role}</strong>
          </div>

          {/* Challenge & Solution Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 space-y-1">
              <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                核心挑战 · The Challenge
              </h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {project.challenge}
              </p>
            </div>
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 space-y-1">
              <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                关键解法 · The Solution
              </h5>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {project.solution}
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>核心技术栈与工具 · Tech Stack</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-white border border-neutral-200 rounded-md text-xs font-mono text-neutral-700 shadow-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {!project.hideModalFooter && (
          <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
            {project.links ? (
              project.links.map((link) => (
                <button
                  key={link.url}
                  onClick={() => window.open(link.url, '_blank')}
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))
            ) : (
              <button
                onClick={() =>
                  project.activityUrl
                    ? window.open(project.activityUrl, '_blank')
                    : onClose()
                }
                className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {project.activityUrl ? project.activityLabel ?? '查看页面' : project.activityLabel ?? '关闭详情'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
