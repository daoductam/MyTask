import { useState, useEffect } from 'react';
import habitService from '../../services/habitService';
import Header from '../../components/layout/Header';
import { useLayout } from '../../context/LayoutContext';

function HabitsPage() {
  const { toggleSidebar } = useLayout();
  const getLocalDateString = (date = new Date()) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [selectedDay, setSelectedDay] = useState(getLocalDateString());
  const [showModal, setShowModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    icon: 'star',
    color: '#8B5CF6',
    frequency: 'DAILY',
    targetPerDay: 1,
    reminderTime: '08:00'
  });

  useEffect(() => {
    fetchHabits();
  }, [selectedDay]);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await habitService.getAllHabits(selectedDay);
      setHabits(response.data.data || []);
      
      const end = getLocalDateString();
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - 27);
      const start = getLocalDateString(startDateObj);
      
      const historyRes = await habitService.getGlobalLogs(start, end);
      setHistoryLogs(historyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHabit) {
        await habitService.updateHabit(selectedHabit.id, newHabit);
      } else {
        await habitService.createHabit(newHabit);
      }
      setShowModal(false);
      setSelectedHabit(null);
      setNewHabit({
        name: '',
        description: '',
        icon: 'star',
        color: '#8B5CF6',
        frequency: 'DAILY',
        targetPerDay: 1,
        reminderTime: '08:00'
      });
      fetchHabits();
    } catch (error) {
      console.error('Error saving habit:', error);
      alert('Có lỗi xảy ra khi lưu thói quen.');
    }
  };

  const openEditModal = (habit) => {
    setSelectedHabit(habit);
    setNewHabit({
      name: habit.name,
      description: habit.description || '',
      icon: habit.icon || 'star',
      color: habit.color || '#8B5CF6',
      frequency: habit.frequency || 'DAILY',
      targetPerDay: habit.targetPerDay || 1,
      reminderTime: habit.reminderTime || '08:00'
    });
    setShowModal(true);
  };

  const handleCheckIn = async (habitId) => {
    try {
      await habitService.checkIn(habitId);
      fetchHabits();
    } catch (error) {
      console.error('Error checking in habit:', error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thói quen này?')) {
      try {
        await habitService.deleteHabit(habitId);
        fetchHabits();
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  // Generate dynamic week
  const getWeekDays = () => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    
    return [...Array(7)].map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      const isToday = getLocalDateString() === dateStr;
      const isFuture = d > new Date() && !isToday;
      const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      return { 
        label: labels[i], 
        date: d.getDate(),
        fullDate: d,
        dateStr,
        isToday,
        isFuture 
      };
    });
  };

  const daysArr = getWeekDays();

  // Updated stats calculation
  const stats = {
    longestStreak: habits.length > 0 ? Math.max(...habits.map(h => h.currentStreak || 0)) : 0,
    avgCompletion: habits.length > 0 
      ? Math.round(habits.reduce((acc, h) => acc + (h.completedCountToday / (h.targetPerDay || 1)), 0) / habits.length * 100) 
      : 0
  };

  const icons = ['star', 'fitness_center', 'menu_book', 'water_drop', 'bedtime', 'psychology', 'restaurant', 'self_improvement'];
  const colors = ['#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

  if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
  }

  return (
    <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="w-full md:w-auto flex-1 max-w-xl flex items-start gap-4">
           <button 
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0 mt-2"
              >
                <span className="material-icons-round">menu</span>
           </button>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="material-icons-round text-emerald-500 animate-pulse">auto_awesome</span>
                <p className="text-sm font-medium text-emerald-500 uppercase tracking-wider">Xây dựng lối sống lành mạnh</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Theo dõi thói quen</h1>
           </div>
        </div>
      </header>

      <div className="glass-panel p-4 rounded-3xl mb-8 overflow-x-auto scrollbar-hide shrink-0">
        <div className="flex justify-between items-center min-w-[600px] gap-2">
          {daysArr.map((day) => (
            <div 
              key={day.dateStr}
              onClick={() => !day.isFuture && setSelectedDay(day.dateStr)}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group ${
                selectedDay === day.dateStr ? 'bg-primary/20 border border-primary/30 shadow-[0_0_20px_rgba(139,92,246,0.15)]' : 'hover:bg-white/5'
              } ${day.isFuture ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={`text-[10px] uppercase font-black tracking-widest transition-colors ${selectedDay === day.dateStr ? 'text-primary' : 'text-slate-500'}`}>{day.label}</span>
                {day.isToday && <span className="text-[8px] bg-primary/20 text-primary px-1 rounded font-bold">H.NAY</span>}
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center relative transition-all ${selectedDay === day.dateStr ? 'bg-primary text-white shadow-lg shadow-primary/40 scale-110' : 'bg-emerald-500/10 text-emerald-500'}`}>
                <span className="text-sm font-black">{day.date}</span>
                {day.isToday && selectedDay !== day.dateStr && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary border-2 border-slate-900"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 flex-1 overflow-hidden">
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">
              {selectedDay === getLocalDateString() ? 'Thói quen hôm nay' : `Thói quen ngày ${new Date(selectedDay).toLocaleDateString('vi-VN')}`}
            </h3>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 text-primary hover:text-white px-4 py-2 rounded-xl hover:bg-primary/20 transition-all font-medium text-sm"
            >
              <span className="material-icons-round text-lg">add_circle</span>
              Thêm thói quen
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 scrollbar-hide">
            {habits.map((habit) => {
              const progress = (habit.completedCountToday / (habit.targetPerDay || 1)) * 100;
              const dashOffset = 150 - (150 * progress) / 100;
              return (
                <div key={habit.id} className="glass-panel p-6 rounded-3xl group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden" style={{ borderLeft: `4px solid ${habit.color || '#8B5CF6'}` }}>
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                    <button 
                      onClick={() => openEditModal(habit)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <span className="material-icons-round text-lg">edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <span className="material-icons-round text-lg">delete</span>
                    </button>
                  </div>
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                        <span className="material-icons-round text-2xl">{habit.icon || 'star'}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{habit.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{habit.description || 'Hàng ngày'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-3xl font-bold text-slate-800 dark:text-white">
                        {habit.completedCountToday || 0}
                        <span className="text-lg text-slate-500 dark:text-slate-400 font-normal">/{habit.targetPerDay}</span>
                      </span>
                      <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                        <span className="material-icons-round text-sm">local_fire_department</span>
                        Chuỗi {habit.currentStreak} ngày
                      </p>
                    </div>
                    <div className="relative w-14 h-14">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-slate-200 dark:text-slate-700/50" cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeWidth="4"></circle>
                        <circle style={{ color: habit.color }} cx="28" cy="28" fill="transparent" r="24" stroke="currentColor" strokeDasharray="150" strokeDashoffset={dashOffset} strokeLinecap="round" strokeWidth="4"></circle>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: habit.color }}>{Math.round(progress)}%</span>
                    </div>
                  </div>
              {habit.isCompletedToday ? (
                     <button className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 font-medium cursor-default flex items-center justify-center gap-2">
                        <span className="material-icons-round text-lg">check_circle</span>
                        Đã hoàn thành
                      </button>
                  ) : selectedDay === getLocalDateString() ? (
                    <button onClick={() => handleCheckIn(habit.id)} className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-white/5 hover:bg-primary dark:hover:bg-primary hover:text-white text-slate-600 dark:text-slate-300 font-medium transition-all duration-300 flex items-center justify-center gap-2">
                      <span className="material-icons-round text-lg">add</span>
                      Tiến độ
                    </button>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-slate-900/50 text-slate-600 font-medium text-center text-sm border border-white/5 italic">
                       Chế độ xem lịch sử
                    </div>
                  )}
                </div>
              );
            })}
            {habits.length === 0 && <div className="col-span-2 text-center p-12 glass-panel rounded-3xl text-slate-500">Bạn chưa có thói quen nào.</div>}
          </div>
        </div>

        <div className="lg:col-span-1 h-full overflow-hidden">
          <div className="glass-panel p-6 rounded-3xl h-full flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-6">
              <span className="material-icons-round text-primary">insights</span>
              Phân tích
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Chuỗi dài nhất</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-blue-500">{stats.longestStreak}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Ngày</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Mục tiêu trung bình</p>
                <span className="text-2xl font-black text-emerald-500">{stats.avgCompletion}%</span>
              </div>
            </div>
            
            <div className="mb-6 overflow-hidden">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Lịch sử 28 ngày qua</p>
               <div className="grid grid-cols-7 gap-1.5 p-1">
                {[...Array(28)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (27 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  
                  // Calculate intensity for this date
                  const dayLogs = historyLogs.filter(log => log.completedDate === dateStr);
                  let intensity = 0; // 0 to 3
                  
                  if (dayLogs.length > 0) {
                    // Simple logic: if any habit completed, intensity 1. If many, more.
                    // Accurate: compare count with target. Since we don't have targets for all habits in historyRes,
                    // we'll use a simple count of completed actions relative to total habits.
                    const completionRatio = dayLogs.length / (habits.length || 1);
                    if (completionRatio > 0.8) intensity = 3;
                    else if (completionRatio > 0.4) intensity = 2;
                    else intensity = 1;
                  }
                  
                  const colors = ['bg-slate-700/20', 'bg-emerald-500/20', 'bg-emerald-500/50', 'bg-emerald-500/80'];
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-[4px] ${colors[intensity]} transition-all hover:scale-110 cursor-pointer`} 
                      title={`${new Date(dateStr).toLocaleDateString('vi-VN')}: ${dayLogs.length} lần check-in`}
                    ></div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedHabit ? 'Chỉnh sửa thói quen' : 'Thêm thói quen mới'}</h3>
              <button 
                onClick={() => { setShowModal(false); setSelectedHabit(null); }}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateHabit} className="p-4 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tên thói quen</label>
                <input 
                  type="text" 
                  required
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Ví dụ: Đọc sách, Tập gym..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Mục tiêu / ngày</label>
                  <input 
                    type="number" 
                    min="1"
                    value={newHabit.targetPerDay}
                    onChange={(e) => setNewHabit({...newHabit, targetPerDay: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">Thời gian nhắc</label>
                  <input 
                    type="time" 
                    value={newHabit.reminderTime}
                    onChange={(e) => setNewHabit({...newHabit, reminderTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Biểu tượng & Màu sắc</label>
                <div className="flex flex-wrap gap-2 mb-4">
                    {icons.map(icon => (
                        <button 
                            key={icon} type="button" 
                            onClick={() => setNewHabit({...newHabit, icon})}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${newHabit.icon === icon ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'}`}
                        >
                            <span className="material-icons-round text-lg">{icon}</span>
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-2">
                    {colors.map(color => (
                        <button 
                            key={color} type="button" 
                            onClick={() => setNewHabit({...newHabit, color})}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${newHabit.color === color ? 'border-primary dark:border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            style={{ backgroundColor: color }}
                        ></button>
                    ))}
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => { setShowModal(false); setSelectedHabit(null); }} className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-medium">Hủy</button>
                <button type="submit" className="flex-1 py-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-violet-600 transition-all font-bold uppercase">{selectedHabit ? 'Lưu thay đổi' : 'Lưu thói quen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary hover:bg-violet-600 text-white rounded-full shadow-[0_4px_20px_rgba(139,92,246,0.5)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50 group"
      >
        <span className="material-icons-round text-2xl group-hover:rotate-90 transition-transform">add</span>
      </button>

      <style>{`
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default HabitsPage;
