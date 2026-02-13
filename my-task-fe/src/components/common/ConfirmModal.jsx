import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?', 
  confirmText = 'Xác nhận', 
  cancelText = 'Hủy',
  type = 'danger' // 'danger' or 'warning' or 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'delete_forever',
          iconBg: 'bg-rose-500/10 text-rose-500',
          btnBg: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30',
        };
      case 'warning':
        return {
          icon: 'warning',
          iconBg: 'bg-amber-500/10 text-amber-500',
          btnBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
        };
      default:
        return {
          icon: 'info',
          iconBg: 'bg-primary/10 text-primary',
          btnBg: 'bg-primary hover:bg-primary/80 shadow-primary/30',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      ></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/10 overflow-hidden text-center">
        {/* Decorative background element */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl ${styles.iconBg.split(' ')[0]}`}></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-16 h-16 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-6 shadow-inner`}>
            <span className="material-icons-round text-3xl">{styles.icon}</span>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold text-sm"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 rounded-2xl text-white shadow-lg transition-all font-bold text-sm ${styles.btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
