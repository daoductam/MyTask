import { motion, AnimatePresence } from 'framer-motion';
import { formatDateStrict } from '../../utils/dateUtils';

function TaskDetailModal({ isOpen, onClose, task, onEdit, onDelete }) {
  if (!task) return null;

  const getPriorityClass = (priority) => {
    if (priority === 'HIGH' || priority === 'URGENT') return 'bg-red-500/10 border-red-500/20 text-red-500';
    if (priority === 'MEDIUM') return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'HIGH' || priority === 'URGENT') return 'Cao';
    if (priority === 'MEDIUM') return 'Trung bình';
    return 'Thấp';
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'TODO': 'Cần làm',
      'IN_PROGRESS': 'Đang làm',
      'REVIEW': 'Kiểm tra',
      'DONE': 'Hoàn thành'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'DONE') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
    if (status === 'IN_PROGRESS') return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
    if (status === 'REVIEW') return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    return 'bg-slate-500/10 border-slate-500/20 text-slate-500';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            onClick={onClose}
          ></motion.div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl border-t border-slate-100 dark:border-white/20"
          >
            {/* Header with Priority Stripe */}
            <div className={`h-2 w-full ${
              task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500'
            }`}></div>

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusClass(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${getPriorityClass(task.priority)}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              <h2 className={`text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-4 tracking-tight leading-tight ${task.status === 'DONE' ? 'line-through opacity-60' : ''}`}>
                {task.title}
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-icons-round text-lg">calendar_today</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hạn hoàn thành</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{task.dueDate ? formatDateStrict(task.dueDate) : 'Không có hạn'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-icons-round text-lg">assignment</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dự án</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{task.projectName || 'Chung'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Mô tả chi tiết</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                  {task.description || 'Không có mô tả chi tiết cho công việc này.'}
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { onEdit(task); onClose(); }}
                  className="flex-1 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-lg">edit</span>
                  CHỈNH SỬA
                </button>
                <button 
                  onClick={() => { onDelete(task.id); onClose(); }}
                  className="flex-1 py-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-icons-round text-lg">delete</span>
                  XÓA
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TaskDetailModal;
