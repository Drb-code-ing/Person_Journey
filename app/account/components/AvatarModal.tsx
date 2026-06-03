'use client';

import { useState, useRef, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check } from 'lucide-react';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatar?: string;
}

export default function AvatarModal({ isOpen, onClose, currentName, currentAvatar }: AvatarModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleSave = () => {
    // 视觉占位阶段：标记已保存（后续接入后端API上传）
    if (previewUrl) {
      setSaved(true);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setSaved(false);
    onClose();
  };

  const displayUrl = previewUrl || currentAvatar;
  const initial = currentName?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <AnimatePresence>
      {isOpen && (
        <motion.div
          className="account-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <motion.div
            className="account-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            onClick={e => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Playfair_Display'] text-lg" style={{ color: 'var(--aj-text-primary)' }}>
                修改头像
              </h3>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: 'var(--aj-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 头像预览 */}
            <div className="flex justify-center mb-8">
              <div className="account-avatar-wrap" style={{ width: 120, height: 120 }}>
                <div className="account-avatar-glow" />
                <div className="account-avatar" style={{ width: 120, height: 120, cursor: 'default' }}>
                  {displayUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayUrl} alt={currentName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="account-avatar-letter" style={{ fontSize: 44 }}>
                      {initial}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 上传区域 */}
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer hover:border-[#C9A96E]/40"
              style={{ borderColor: previewUrl ? 'var(--aj-gold)' : 'var(--aj-glass-border)' }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {previewUrl ? (
                <>
                  <Check size={32} className="mx-auto mb-3" style={{ color: 'var(--aj-gold)' }} />
                  <p className="text-sm mb-1" style={{ color: 'var(--aj-text-primary)' }}>
                    新头像已就绪
                  </p>
                  <p className="text-xs" style={{ color: 'var(--aj-text-muted)' }}>
                    点击重新选择
                  </p>
                </>
              ) : (
                <>
                  <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--aj-gold)' }} />
                  <p className="text-sm mb-1" style={{ color: 'var(--aj-text-primary)' }}>
                    点击或拖拽上传新头像
                  </p>
                  <p className="text-xs" style={{ color: 'var(--aj-text-muted)' }}>
                    支持 JPG、PNG，最大 5MB
                  </p>
                </>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-lg text-sm transition-colors"
                style={{
                  background: 'var(--aj-glass-white)',
                  border: '1px solid var(--aj-glass-border)',
                  color: 'var(--aj-text-secondary)',
                }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={!previewUrl}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: previewUrl ? 'var(--aj-gold)' : 'var(--aj-glass-white)',
                  color: previewUrl ? '#0D0D0D' : 'var(--aj-text-muted)',
                  cursor: previewUrl ? 'pointer' : 'not-allowed',
                  opacity: previewUrl ? 1 : 0.5,
                }}
              >
                {saved ? '已保存 ✓' : '保存'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
