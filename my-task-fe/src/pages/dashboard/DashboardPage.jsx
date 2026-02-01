import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../../services/dashboardService';
import Header from '../../components/layout/Header';
import QuickAddModal from '../../components/modals/QuickAddModal';

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await dashboardService.getOverview();
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng!';
    if (hour < 18) return 'Chào buổi chiều!';
    return 'Chào buổi tối!';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            {getGreeting()} <span className="animate-pulse inline-block">👋</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Đây là tổng quan năng suất của bạn hôm nay.</p>
        </div>
        <button 
          onClick={() => setIsQuickAddOpen(true)}
          className="group flex items-center gap-2 bg-primary hover:bg-violet-600 text-white px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 font-medium"
        >
          <span className="material-icons-round text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
          <span>Thêm mới</span>
        </button>
      </div>

      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
        onRefresh={fetchDashboard}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-6xl text-blue-500">task</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <span className="material-icons-round">check_circle</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Công việc hôm nay</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{data?.tasksCompleted || 0}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              <span className="text-emerald-500 font-medium">+{data?.tasksDueToday || 0}</span> việc cần làm
            </p>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000" 
                style={{ width: `${data ? Math.min((data.tasksCompleted / (data.tasksCompleted + (data.tasksDueToday || 1)) * 100), 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-6xl text-emerald-500">fitness_center</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <span className="material-icons-round">bolt</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Thói quen</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{data?.habitsCompletedToday || 0}/{data?.totalHabits || 0}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chuỗi tốt nhất: <span className="text-slate-700 dark:text-white font-medium">{data?.maxStreak || 0} ngày</span>
            </p>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                style={{ width: `${data ? Math.min((data.habitsCompletedToday / (data.totalHabits || 1) * 100), 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-6xl text-amber-500">account_balance_wallet</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <span className="material-icons-round">attach_money</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Ngân sách</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{formatCurrency(data?.totalExpenseMonth || 0)}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đã chi: <span className="text-slate-700 dark:text-slate-300 font-medium">{formatCurrency(data?.totalExpenseMonth || 0)}</span>
            </p>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" 
                style={{ width: `${data ? Math.min((data.totalExpenseMonth / (data.totalIncomeMonth || data.totalExpenseMonth || 1) * 100), 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-icons-round text-6xl text-primary">timer</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-icons-round">schedule</span>
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tập trung</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{data?.focusMinutesToday || 0}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phút hôm nay</p>
            <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-1000" 
                style={{ width: `${data ? Math.min((data.focusMinutesToday / 120 * 100), 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Công việc ưu tiên
            </h2>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm text-primary hover:text-violet-400 font-medium transition-colors"
            >
              Xem tất cả
            </button>
          </div>
          <div className="space-y-3">
            {data?.recentTasks?.length > 0 ? data.recentTasks.map((task) => (
              <div key={task.id} className="group flex items-center p-4 rounded-2xl bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-primary/20 transition-all duration-200 cursor-pointer">
                <div className="w-10 flex-shrink-0 flex items-center justify-center">
                  <button className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 group-hover:border-primary hover:bg-primary/20 transition-colors"></button>
                </div>
                <div className="flex-1 ml-2">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">{task.projectName || 'Chưa phân loại'}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {task.dueDate ? (
                        <>
                          <span className="material-icons-round text-[10px]">schedule</span>
                          {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                        </>
                      ) : (
                        <span>Không có hạn</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-medium border ${
                    task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                    task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' : 
                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                  }`}>
                    {task.status === 'DONE' ? 'Hoàn thành' : task.status === 'IN_PROGRESS' ? 'Đang làm' : 'Đang chờ'}
                  </span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors">
                    <span className="material-icons-round text-lg">more_vert</span>
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-500">Chưa có công việc nào ưu tiên</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 relative">
          <div className="h-full glass-panel rounded-3xl p-6 md:p-8 flex flex-col justify-between overflow-hidden relative border-t-2 border-t-primary/30">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30">
                  <span className="material-icons-round text-white animate-pulse">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white leading-tight">Trợ lý AI</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Thông tin chi tiết</p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="material-icons-round text-emerald-500 mt-0.5">verified</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-1">
                      {data?.productivityScore > 70 ? 'Làm tốt lắm!' : 'Cố gắng lên!'}
                    </h4>
                    <div className="space-y-2">
                       {data?.suggestions?.length > 0 ? data.suggestions.map((s, idx) => (
                         <p key={idx} className="text-xs text-slate-600 dark:text-emerald-100/70 leading-relaxed">• {s}</p>
                       )) : (
                         <p className="text-xs text-slate-600 dark:text-emerald-100/70 leading-relaxed">Bạn đang hoàn thành tốt mục tiêu hôm nay. Hãy giữ vững phong độ!</p>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Điểm năng suất</span>
                  <span className="font-bold text-slate-800 dark:text-white text-lg">{data?.productivityScore || 0}/100</span>
                </div>
                
                {/* Dynamic Trend Chart */}
                <div className="h-28 w-full relative group">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <defs>
                      <linearGradient id="productivity-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'rgba(139, 92, 246, 0.4)', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: 'rgba(139, 92, 246, 0)', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    {/* Background Area */}
                    <path 
                      d={data?.productivityTrend ? `M 0 40 L 0 ${40 - (data.productivityTrend[0] / 3 || 10)} 
                          ${data.productivityTrend.map((val, i) => `L ${(i * 100) / 6} ${40 - (val / 3 || 10)}`).join(' ')} 
                          L 100 40 Z` : "M 0 40 L 100 40"} 
                      fill="url(#productivity-gradient)"
                      className="transition-all duration-1000"
                    ></path>
                    {/* Main Line */}
                    <path 
                      d={data?.productivityTrend ? `M 0 ${40 - (data.productivityTrend[0] / 3 || 10)} 
                          ${data.productivityTrend.map((val, i) => `L ${(i * 100) / 6} ${40 - (val / 3 || 10)}`).join(' ')}` : "M 0 40 L 100 40"} 
                      fill="none" 
                      stroke="#8B5CF6" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="transition-all duration-1000"
                    ></path>
                    {/* Dots */}
                    {data?.productivityTrend?.map((val, i) => (
                      <circle 
                        key={i} 
                        cx={(i * 100) / 6} 
                        cy={40 - (val / 3 || 10)} 
                        fill="#fff" 
                        r="2.5" 
                        stroke="#8B5CF6" 
                        strokeWidth="2"
                        className="transition-all duration-1000"
                      >
                        <title>Ngày {i+1}: {val} điểm</title>
                      </circle>
                    ))}
                  </svg>
                </div>

                <button 
                  onClick={() => document.querySelector('button[class*="bottom-8"]')?.click()}
                  className="w-full py-3 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                  <span className="material-icons-round text-primary group-hover:rotate-12 transition-transform">insights</span>
                  Xem phân tích chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
