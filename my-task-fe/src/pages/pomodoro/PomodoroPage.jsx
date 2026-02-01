import { useState, useEffect, useRef } from 'react';
import pomodoroService from '../../services/pomodoroService';
import taskService from '../../services/taskService';
import Header from '../../components/layout/Header';
import { useLayout } from '../../context/LayoutContext';

function PomodoroPage() {
  const { toggleSidebar } = useLayout();
  const [mode, setMode] = useState('WORK'); // WORK, SHORT_BREAK, LONG_BREAK
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [stats, setStats] = useState({ completed: 0, totalMinutes: 0 });
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef(null);
  
  const modes = {
    WORK: { label: 'Tập trung', duration: 25 * 60, color: 'primary' },
    SHORT_BREAK: { label: 'Nghỉ ngắn', duration: 5 * 60, color: 'secondary' },
    LONG_BREAK: { label: 'Nghỉ dài', duration: 15 * 60, color: 'blue-500' },
  };

  useEffect(() => {
    fetchTodayStats();
    fetchTodaySessions();
    fetchTasks();
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const fetchTodayStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await pomodoroService.getStats(today, today);
      const data = response.data.data;
      setStats({
        completed: data.totalSessions || 0,
        totalMinutes: data.totalMinutes || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaySessions = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await pomodoroService.getSessions(today);
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskService.getKanbanTasks();
      const kanban = response.data.data;
      const allTasks = [
        ...(kanban.TODO || []),
        ...(kanban.IN_PROGRESS || []),
        ...(kanban.REVIEW || [])
      ];
      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleStart = async () => {
    if (!isRunning && !currentSessionId) {
      try {
        const response = await pomodoroService.startSession(Math.floor(timeLeft / 60), selectedTaskId || null);
        setCurrentSessionId(response.data.data.id);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = async () => {
    setIsRunning(false);
    setTimeLeft(modes[mode].duration);
    if (currentSessionId) {
      try {
        await pomodoroService.deleteSession(currentSessionId);
        setCurrentSessionId(null);
      } catch (error) {
        console.error('Error canceling session:', error);
      }
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    if (currentSessionId) {
      try {
        await pomodoroService.completeSession(currentSessionId);
        setCurrentSessionId(null);
        fetchTodayStats();
        fetchTodaySessions();
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
      } catch (error) {
        console.error('Error completing session:', error);
      }
    }
  };

  const handleDeleteSession = async (id) => {
     if (window.confirm('Xóa phiên này khỏi lịch sử?')) {
        try {
           await pomodoroService.deleteSession(id);
           fetchTodaySessions();
           fetchTodayStats();
        } catch (error) {
           console.error('Error deleting session:', error);
        }
     }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
    setCurrentSessionId(null);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 283;

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 shrink-0">
        <div className="flex flex-col w-full md:w-auto">
           <div className="flex items-center gap-3">
               <button 
                    onClick={toggleSidebar}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0"
                  >
                    <span className="material-icons-round">menu</span>
               </button>
               <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Tập trung chuyên sâu</h1>
           </div>
          <p className="text-slate-500 dark:text-slate-400 md:ml-13">Tăng hiệu suất làm việc với phương pháp Pomodoro.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-8 flex flex-col items-center justify-center relative min-h-[500px]">
          <div className="bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl flex flex-wrap justify-center items-center gap-1 mb-10 transition-colors">
            {Object.entries(modes).map(([key, value]) => (
              <button
                key={key}
                onClick={() => changeMode(key)}
                className={`px-4 md:px-6 py-2 rounded-xl font-bold text-xs md:text-sm transition-all ${mode === key ? 'bg-primary text-white shadow-lg' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >{value.label}</button>
            ))}
          </div>

          <div className="mb-8 w-full max-w-xs">
             <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-2 text-center">Đang làm việc trên</label>
             <select 
               value={selectedTaskId}
               onChange={(e) => setSelectedTaskId(e.target.value)}
               className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none text-center cursor-pointer font-bold"
             >
                <option value="" className="bg-white dark:bg-slate-800 text-slate-400">--- Chọn công việc (tùy chọn) ---</option>
                {tasks.map(t => <option key={t.id} value={t.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">{t.title}</option>)}
             </select>
          </div>

          <div className="relative w-72 h-72 flex items-center justify-center mb-10">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle className="text-slate-200 dark:text-white/5" cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3"></circle>
              <circle 
                className="text-primary transition-all duration-1000 ease-linear" 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" 
                strokeDasharray="283" 
                strokeDashoffset={283 - progress} 
                strokeLinecap="round" strokeWidth="3"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">{formatTime(timeLeft)}</span>
              <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">{isRunning ? 'ACTIVE' : 'READY'}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={handleReset} className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all">
              <span className="material-icons-round">restart_alt</span>
            </button>
            <button onClick={handleStart} className="px-8 md:px-12 py-4 rounded-2xl bg-primary hover:bg-violet-600 text-white font-black text-xl shadow-lg shadow-primary/30 transform hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2">
              <span className="material-icons-round">{isRunning ? 'pause' : 'play_arrow'}</span>
              {isRunning ? 'Dừng' : 'Bắt đầu'}
            </button>
            <button className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-all">
              <span className="material-icons-round">settings</span>
            </button>
          </div>
        </div>

        <div className="space-y-6 flex flex-col">
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-icons-round text-primary">analytics</span>
              Thống kê hôm nay
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phiên hoàn thành</p>
                <p className="text-3xl font-black text-emerald-500">{stats.completed}</p>
              </div>
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng thời gian (phút)</p>
                <p className="text-3xl font-black text-blue-500">{stats.totalMinutes}</p>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 shrink-0">
               <span className="material-icons-round text-pink-500">history</span>
               Lịch sử tập trung
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-hide">
               {sessions.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-white/10 group shadow-sm dark:shadow-none">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.type === 'WORK' ? 'bg-primary/10 dark:bg-primary/20 text-primary' : 'bg-secondary/10 dark:bg-secondary/20 text-secondary'}`}>
                           <span className="material-icons-round text-sm">{s.type === 'WORK' ? 'work' : 'coffee'}</span>
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800 dark:text-white">{s.taskTitle || (s.type === 'WORK' ? 'Phiên tập trung' : 'Nghỉ ngơi')}</p>
                           <p className="text-[10px] text-slate-500">{new Date(s.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {s.duration} phút</p>
                        </div>
                     </div>
                     <button onClick={() => handleDeleteSession(s.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all">
                        <span className="material-icons-round text-sm">delete</span>
                     </button>
                  </div>
               ))}
               {sessions.length === 0 && <div className="text-center py-12 text-slate-500 dark:text-slate-600">Chưa có dữ liệu hôm nay.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PomodoroPage;
