import { useState, useEffect, useCallback } from 'react';
import goalService from '../../services/goalService';
import { useLayout } from '../../context/LayoutContext';

function GoalsPage() {
  const { toggleSidebar } = useLayout();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
  });
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await goalService.getAllGoals();
      const goalsData = response.data.data || [];
      setGoals(goalsData);
      
      if (goalsData.length > 0) {
        if (selectedGoal) {
          const updatedSelected = goalsData.find(g => g.id === selectedGoal.id);
          setSelectedGoal(updatedSelected || goalsData[0]);
        } else {
          setSelectedGoal(goalsData[0]);
        }
      } else {
        setSelectedGoal(null);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedGoal]);

  useEffect(() => {
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && selectedGoal) {
        await goalService.updateGoal(selectedGoal.id, newGoal);
      } else {
        await goalService.createGoal(newGoal);
      }
      setShowModal(false);
      setIsEditing(false);
      setNewGoal({
        title: '',
        description: '',
        targetDate: new Date().toISOString().split('T')[0],
      });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Có lỗi xảy ra khi lưu mục tiêu.');
    }
  };

  const openEditModal = (e, goal) => {
    e.stopPropagation();
    setSelectedGoal(goal);
    setIsEditing(true);
    setNewGoal({
      title: goal.title,
      description: goal.description || '',
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setNewGoal({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDeleteGoal = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Xóa mục tiêu này sẽ không thể khôi phục. Tiếp tục?')) {
      try {
        await goalService.deleteGoal(id);
        if (selectedGoal?.id === id) setSelectedGoal(null);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  const handleToggleMilestone = async (milestoneId) => {
    try {
      await goalService.toggleMilestone(milestoneId);
      // Re-fetch detail for selected goal
      const resp = await goalService.getGoalById(selectedGoal.id);
      const updatedGoal = resp.data.data;
      setSelectedGoal(updatedGoal);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } catch (error) {
      console.error('Error toggling milestone:', error);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    if (!selectedGoal || !newMilestoneTitle) return;
    try {
      await goalService.addMilestone(selectedGoal.id, newMilestoneTitle);
      setNewMilestoneTitle('');
      const resp = await goalService.getGoalById(selectedGoal.id);
      const updatedGoal = resp.data.data;
      setSelectedGoal(updatedGoal);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } catch (error) {
      console.error('Error adding milestone:', error);
    }
  };

  const handleDeleteMilestone = async (e, milestoneId) => {
    e.stopPropagation();
    if (!window.confirm('Xóa cột mốc này?')) return;
    try {
      await goalService.deleteMilestone(milestoneId);
      const resp = await goalService.getGoalById(selectedGoal.id);
      const updatedGoal = resp.data.data;
      setSelectedGoal(updatedGoal);
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.progress === 100).length,
    successRate: goals.length > 0 ? Math.round((goals.filter(g => g.progress === 100).length / goals.length) * 100) : 0
  };

  const getCategoryTheme = (title) => {
    const t = title.toLowerCase();
    if (t.includes('học') || t.includes('study')) return { icon: 'school', color: 'from-blue-600 to-indigo-600', text: 'Học tập', bg: 'bg-blue-500/10' };
    if (t.includes('tiền') || t.includes('tài chính') || t.includes('finance')) return { icon: 'account_balance_wallet', color: 'from-amber-500 to-orange-600', text: 'Tài chính', bg: 'bg-amber-500/10' };
    if (t.includes('sức khỏe') || t.includes('health') || t.includes('chạy')) return { icon: 'directions_run', color: 'from-emerald-500 to-teal-600', text: 'Sức khỏe', bg: 'bg-emerald-500/10' };
    return { icon: 'auto_awesome', color: 'from-primary to-purple-600', text: 'Phát triển', bg: 'bg-primary/10' };
  };

  const calculateDaysLeft = (date) => {
    const target = new Date(date);
    const today = new Date();
    const diff = target - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 shrink-0">
        <div className="flex items-start gap-4">
             <button 
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0 mt-2"
              >
                <span className="material-icons-round">menu</span>
             </button>
             <div>
              <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <span className="material-icons-round text-lg">home</span>
                <span>/</span>
                <span>Mục tiêu</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight">Quản lý Mục tiêu</h1>
             </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button 
            onClick={openCreateModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-violet-600 text-white px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 font-bold"
          >
            <span className="material-icons-round">add</span>
            <span>Thêm mục tiêu mới</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 shrink-0">
        {[
          { label: 'Tổng mục tiêu', val: stats.total, icon: 'flag', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Đã hoàn thành', val: stats.completed, icon: 'check_circle', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Tỷ lệ thành công', val: `${stats.successRate}%`, icon: 'donut_large', color: 'text-pink-500', bg: 'bg-pink-500/10' }
        ].map((s, i) => (
          <div key={i} className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className={`absolute right-0 top-0 p-6 opacity-10`}><span className={`material-icons-round text-6xl ${s.color}`}>{s.icon}</span></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}><span className="material-icons-round">{s.icon}</span></div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{s.label}</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-4">{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Mục tiêu đang thực hiện
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {goals.map((goal) => {
              const theme = getCategoryTheme(goal.title);
              return (
                <div 
                  key={goal.id} 
                  onClick={() => setSelectedGoal(goal)}
                  className={`glass-panel rounded-3xl p-6 relative group transition-all duration-300 border-transparent cursor-pointer ${selectedGoal?.id === goal.id ? 'border-primary/40 bg-primary/5 dark:bg-primary/10' : 'hover:border-primary/20'}`}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className={`relative w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br ${theme.color} flex items-center justify-center shadow-lg`}>
                      <span className="material-icons-round text-4xl text-white/40">{theme.icon}</span>
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] text-white font-black border border-white/10">{theme.text}</div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-primary transition-colors">{goal.title}</h3>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => openEditModal(e, goal)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white"
                            >
                              <span className="material-icons-round text-lg">edit</span>
                            </button>
                            <button 
                              onClick={(e) => handleDeleteGoal(e, goal.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500"
                            >
                              <span className="material-icons-round text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2">{goal.description || 'Chưa có mô tả.'}</p>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-500 font-bold uppercase tracking-wider">Tiến độ</span>
                          <span className="font-black text-primary text-sm">{goal.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-white/5 h-2 rounded-full overflow-hidden mb-4 shadow-inner">
                          <div 
                            className={`bg-gradient-to-r ${theme.color} h-full rounded-full transition-all duration-1000`}
                            style={{ width: `${goal.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-4 text-slate-500">
                            <div className="flex items-center gap-1.5"><span className="material-icons-round text-sm">calendar_today</span> {new Date(goal.targetDate).toLocaleDateString('vi-VN')}</div>
                            <div className="flex items-center gap-1.5"><span className="material-icons-round text-sm">checklist</span> {goal.milestones?.filter(m => m.isCompleted).length}/{goal.milestones?.length} CỘT MỐC</div>
                          </div>
                          {calculateDaysLeft(goal.targetDate) > 0 ? (
                            <div className="text-primary flex items-center gap-1">
                              <span className="material-icons-round text-xs">timer</span>
                              Còn {calculateDaysLeft(goal.targetDate)} ngày
                            </div>
                          ) : (
                            <div className="text-rose-500 flex items-center gap-1">
                              <span className="material-icons-round text-xs">event_busy</span>
                              Quá hạn
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <div className="text-center py-20 glass-panel rounded-3xl text-slate-500 font-medium">Bạn chưa đề ra mục tiêu nào. Hãy bắt đầu ngay!</div>}
          </div>
        </div>

        <div className="lg:col-span-1 h-full min-h-[600px]">
          <div className="glass-panel rounded-3xl p-6 h-full flex flex-col sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cây mục tiêu</h2>
            </div>
            {selectedGoal ? (
              <div className="relative flex-1 overflow-y-auto pr-2 scrollbar-hide">
                <div className="relative mb-8">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/40"><span className="material-icons-round">stars</span></div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white text-sm truncate max-w-[150px]">{selectedGoal.title}</h4>
                      <span className="text-[10px] text-primary uppercase font-black tracking-widest">Mục tiêu lớn</span>
                    </div>
                  </div>
                  {selectedGoal.milestones?.length > 0 && <div className="absolute left-7 top-14 bottom-[-32px] w-0.5 bg-gradient-to-b from-primary/50 to-slate-300 dark:to-slate-800 z-0"></div>}
                </div>

                <div className="space-y-6 relative ml-12">
                   {selectedGoal.milestones?.map((m, idx) => (
                     <div key={m.id} className="relative">
                       <div className="absolute -left-[2.25rem] top-8 w-6 h-0.5 bg-slate-300 dark:bg-slate-800"></div>
                       {idx < selectedGoal.milestones.length - 1 && <div className="absolute -left-[2.25rem] top-8 bottom-[-24px] w-0.5 bg-slate-300 dark:bg-slate-800"></div>}
                       <div 
                         className={`group/item p-4 rounded-2xl border transition-all cursor-pointer ${m.isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-white/10'}`}
                       >
                         <div className="flex justify-between items-start mb-2 text-[10px] font-black uppercase tracking-[0.15em]">
                            <span className={m.isCompleted ? 'text-emerald-500' : 'text-slate-500'}>Giai đoạn {idx + 1}</span>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={(e) => handleDeleteMilestone(e, m.id)}
                                 className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-rose-500 transition-all text-slate-400"
                               >
                                 <span className="material-icons-round text-sm">delete_outline</span>
                               </button>
                               <span 
                                 onClick={(e) => { e.stopPropagation(); handleToggleMilestone(m.id); }}
                                 className={`w-4 h-4 rounded-lg border-2 flex items-center justify-center transition-all ${m.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-700 group-hover/item:border-slate-500'}`}
                               >
                                 {m.isCompleted && <span className="material-icons-round text-[10px] font-bold">check</span>}
                               </span>
                            </div>
                         </div>
                         <h5 
                           onClick={() => handleToggleMilestone(m.id)}
                           className={`font-bold text-sm ${m.isCompleted ? 'text-emerald-500 line-through opacity-70' : 'text-slate-700 dark:text-white group-hover/item:text-primary transition-colors'}`}
                         >
                           {m.title}
                         </h5>
                       </div>
                     </div>
                   ))}
                   
                   <div className="relative pt-4">
                      <div className="absolute -left-[2.25rem] top-10 w-6 h-0.5 bg-slate-300 dark:bg-slate-800"></div>
                      <form onSubmit={handleAddMilestone} className="flex gap-2">
                        <input 
                          className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-primary/50 text-xs font-medium" 
                          placeholder="Thêm cột mốc..." 
                          value={newMilestoneTitle}
                          onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        />
                        <button type="submit" className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                          <span className="material-icons-round text-sm">add</span>
                        </button>
                      </form>
                   </div>
                </div>

                <div className="mt-12 p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-white/5 text-center">
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 tracking-wide">Bạn đang đi đúng hướng!</p>
                   <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mb-4">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${selectedGoal.progress}%` }}></div>
                   </div>
                   <p className="text-xl font-black text-slate-800 dark:text-white">{selectedGoal.progress}%</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-700 gap-4 opacity-50 dark:opacity-30">
                <span className="material-icons-round text-8xl">account_tree</span>
                <p className="text-sm font-black uppercase tracking-widest">Chọn một mục tiêu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{isEditing ? 'Chỉnh sửa mục tiêu' : 'Mục tiêu mới'}</h3>
               <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all"><span className="material-icons-round">close</span></button>
             </div>
             <form onSubmit={handleCreateGoal} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Tiêu đề mục tiêu</label>
                   <input required value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="Ví dụ: Đạt IELTS 7.5..." />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Ngày hoàn thành dự kiến</label>
                   <input required type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Mô tả chi tiết</label>
                   <textarea rows="3" value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed" placeholder="Lý do và kế hoạch thực hiện mục tiêu này..."></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-all">Hủy</button>
                   <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 font-black hover:scale-[1.02] active:scale-95 transition-all uppercase">{isEditing ? 'Lưu thay đổi' : 'Tạo mục tiêu'}</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes scale-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default GoalsPage;
