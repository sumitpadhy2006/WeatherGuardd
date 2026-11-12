import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mode?: 'modal' | 'page';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
  mode = 'modal',
}) => {
  useEffect(() => {
    if (mode === 'page') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, mode]);

  const maxWClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-none w-full',
  }[maxWidth];

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mode === 'page') {
    if (!isOpen) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full h-full flex flex-col bg-slate-900/60 backdrop-blur-2xl rounded-none md:rounded-2xl border-none md:border border-slate-800/60 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60 bg-slate-900/80 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h3>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
            aria-label="Go back"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">{children}</div>
      </motion.div>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={`fixed inset-0 z-50 flex ${maxWidth === 'full' ? 'items-start' : 'items-center sm:items-start md:items-center'} justify-center ${maxWidth === 'full' ? 'p-0' : 'p-4 sm:p-6'} overflow-y-auto`}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWClass} bg-slate-900 flex flex-col ${maxWidth === 'full' ? 'h-full min-h-screen rounded-none border-none' : 'border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 my-8 overflow-hidden'} z-10`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className={`p-5 flex-1 overflow-y-auto ${maxWidth === 'full' ? '' : 'max-h-[80vh]'}`}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
