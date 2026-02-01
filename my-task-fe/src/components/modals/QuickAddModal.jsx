import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import taskService from '../../services/taskService';
import habitService from '../../services/habitService';
import noteService from '../../services/noteService';

function QuickAddModal({ isOpen, onClose, onRefresh }) {
  const [activeTab, setActiveTab] = useState('TASK');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    dueDate: new Date().toISOString().split('T')[0],
    targetPerDay: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (activeTab === 'TASK') {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate,
        });
      } else if (activeTab === 'HABIT') {
        await habitService.createHabit({
          name: formData.title,
          description: formData.description,
          targetPerDay: formData.targetPerDay,
          frequency: 'DAILY',
        });
      } else if (activeTab === 'NOTE') {
        await noteService.createNote({
          title: formData.title,
          content: formData.description,
        });
      }
      onRefresh();
      onClose();
      setFormData({
         title: '',
         description: '',
         priority: 'MEDIUM',
         dueDate: new Date().toISOString().split('T')[0],
         targetPerDay: 1,
      });
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'TASK', label: 'Công việc', icon: 'task_alt' },
    { id: 'HABIT', label: 'Thói quen', icon: 'bolt' },
    { id: 'NOTE', label: 'Ghi chú', icon: 'description' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-white tracking-tight italic">Quick Add</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="material-icons-round text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Tiêu đề</label>
            <input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              placeholder={activeTab === 'TASK' ? 'Cần làm gì?' : activeTab === 'HABIT' ? 'Thói quen gì?' : 'Tiêu đề ghi chú...'}
            />
          </div>

          {activeTab === 'TASK' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Ưu tiên</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none"
                >
                  <option value="LOW" className="bg-slate-800">Thấp</option>
                  <option value="MEDIUM" className="bg-slate-800">Trung bình</option>
                  <option value="HIGH" className="bg-slate-800">Cao</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Hạn chót</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                />
              </div>
            </div>
          )}

          {activeTab === 'HABIT' && (
            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Mục tiêu hàng ngày</label>
              <input
                type="number"
                min="1"
                value={formData.targetPerDay}
                onChange={(e) => setFormData({ ...formData, targetPerDay: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">
              {activeTab === 'NOTE' ? 'Nội dung' : 'Mô tả'}
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed"
              placeholder="..."
            ></textarea>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 font-bold transition-all">Hủy</button>
            <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? 'ĐANG LƯU...' : 'THÊM NGAY'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuickAddModal;
