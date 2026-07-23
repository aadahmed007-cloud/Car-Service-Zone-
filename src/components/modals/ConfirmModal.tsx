import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'تأكيد الحذف النهائي',
  cancelText = 'إلغاء',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          confirmBtn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          confirmBtn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20 text-white'
        };
      case 'danger':
      default:
        return {
          iconBg: 'bg-red-500/10 text-red-400 border-red-500/30',
          confirmBtn: 'bg-red-600 hover:bg-red-500 shadow-red-500/20 text-white'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0F172A] border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-100">
        
        {/* Header Icon + Title */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${styles.iconBg} shrink-0`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">إجراء حساس يتطلب تأكيدك</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl text-xs text-slate-300 leading-relaxed">
          {message}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex items-center gap-2 font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer ${styles.confirmBtn}`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
