import React, { useState } from 'react';
import { X, Check, Copy, Mail } from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [copiedWechat, setCopiedWechat] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyWechat = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.wechat);
    setCopiedWechat(true);
    setTimeout(() => setCopiedWechat(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X className="w-4 h-4 text-neutral-600" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 space-y-2">
          <h3 className="text-2xl font-bold tracking-tight text-neutral-900">
            欢迎发起合作洽谈
          </h3>
        </div>

        {/* Quick Email Copy Box */}
        <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                联系邮箱 / EMAIL
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-900">
                {PERSONAL_INFO.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyEmail}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-600" />
                <span>复制邮箱</span>
              </>
            )}
          </button>
        </div>

        {/* WeChat Copy Box */}
        <div className="flex items-center justify-between p-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-800 shadow-xs">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.565l-.394 1.555c-.041.16.012.331.14.44a.45.45 0 0 0 .47.045l1.758-.858a.66.66 0 0 1 .5-.056 9.77 9.77 0 0 0 1.2.233c-.06-.35-.09-.71-.09-1.075 0-3.79 3.653-6.86 8.157-6.86.143 0 .284.004.425.011C14.53 4.704 11.878 2.188 8.691 2.188zM5.78 5.977a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7zm5.82 0a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7zM15.803 9.75c-3.993 0-7.23 2.692-7.23 6.013 0 3.32 3.237 6.012 7.23 6.012.775 0 1.522-.106 2.223-.301a.55.55 0 0 1 .415.047l1.466.716a.374.374 0 0 0 .39-.037.374.374 0 0 0 .117-.366l-.328-1.296a.491.491 0 0 1 .177-.47C21.897 18.9 23 17.05 23 15.763c0-3.32-3.204-6.013-7.197-6.013zm-2.42 2.845a.71.71 0 1 1 0 1.42.71.71 0 0 1 0-1.42zm4.84 0a.71.71 0 1 1 0 1.42.71.71 0 0 1 0-1.42z" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                微信号 / WECHAT
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-900">
                {PERSONAL_INFO.wechat}
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyWechat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-800 transition-all cursor-pointer shadow-xs"
          >
            {copiedWechat ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">已复制</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-600" />
                <span>复制微信号</span>
              </>
            )}
          </button>
        </div>

        {/* Message Form */}
        {sent ? (
          <div className="p-8 text-center bg-neutral-50 border border-neutral-200 rounded-2xl animate-in zoom-in-95 duration-200 space-y-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-neutral-900">留言已收到！</h4>
            <p className="text-xs text-neutral-600">
              感谢您的关注，通常会在 24 小时内回复您的来信。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>通常 24h 内极速回复</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
