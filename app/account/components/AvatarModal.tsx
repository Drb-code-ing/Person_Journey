'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../lib/contexts/AuthContext';

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentAvatar?: string;
  /** 上传成功回调（用于刷新 profile） */
  onSaved?: () => void;
}

export default function AvatarModal({ isOpen, onClose, currentName, currentAvatar, onSaved }: AvatarModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const handleFile = useCallback((file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('文件大小不能超过 5MB');
      return;
    }

    setSelectedFile(file);
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

  const handleSave = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setSaved(true);
        // 同步更新 AuthContext（导航栏头像立即生效）
        updateUser({ avatar: json.data.avatarUrl });
        toast('头像更新成功', 'success');
        // 先关闭弹窗，再触发刷新（避免重弹）
        onClose();
        onSaved?.();
      } else {
        setError(json.error?.message || '上传失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setSaved(false);
    setSelectedFile(null);
    setError(null);
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
                    支持 JPG、PNG、WebP，最大 5MB
                  </p>
                </>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <p className="text-xs mt-3 text-center" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}

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
                disabled={!previewUrl || uploading}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  background: previewUrl && !uploading ? 'var(--aj-gold)' : 'var(--aj-glass-white)',
                  color: previewUrl && !uploading ? '#0D0D0D' : 'var(--aj-text-muted)',
                  cursor: previewUrl && !uploading ? 'pointer' : 'not-allowed',
                  opacity: previewUrl && !uploading ? 1 : 0.5,
                }}
              >
                {uploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    上传中...
                  </>
                ) : saved ? (
                  '已保存 ✓'
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
