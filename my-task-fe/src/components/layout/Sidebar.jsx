import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';

const menuItems = [
  { path: '/dashboard', icon: 'home', label: 'Tổng quan' },
  { path: '/projects', icon: 'folder_open', label: 'Dự án' },
  { path: '/tasks', icon: 'task_alt', label: 'Công việc' },
  { path: '/habits', icon: 'fitness_center', label: 'Thói quen' },
  { path: '/finance', icon: 'account_balance_wallet', label: 'Tài chính' },
  { path: '/goals', icon: 'track_changes', label: 'Mục tiêu' },
  { path: '/notes', icon: 'description', label: 'Ghi chú' },
  { path: '/pomodoro', icon: 'timer', label: 'Pomodoro' },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isSidebarOpen, closeSidebar } = useLayout();

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`flex flex-col w-64 py-8 glass-panel border-r border-r-slate-200 dark:border-r-white/5 z-50 h-full transition-transform duration-300 fixed md:relative inset-y-0 left-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 shrink-0">
              <span className="material-icons-round text-2xl">dashboard</span>
            </div>
            <h2 className="text-xl font-bold dark:text-white tracking-tight">LifeDash</h2>
          </div>
          {/* Mobile Close Button */}
          <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-white">
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-2 w-full px-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isItemActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => closeSidebar()} // Close menu on mobile click
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative ${
                  isItemActive
                    ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20'
                    : 'text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                <span className="material-icons-round">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
                {isItemActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_12px_rgba(139,92,246,0.8)]"></div>
                )}
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto px-4 pt-6 flex flex-col gap-4 border-t border-slate-200 dark:border-white/5">
          <button 
            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-yellow-400 hover:bg-white dark:hover:bg-white/5 transition-all duration-300 w-full" 
            onClick={toggleTheme}
          >
            <span className="material-icons-round dark:hidden">dark_mode</span>
            <span className="material-icons-round hidden dark:block">light_mode</span>
            <span className="font-medium text-sm">Chế độ tối</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-primary p-[2px] shrink-0">
              <img 
                alt="User Profile" 
                className="w-full h-full rounded-full object-cover border-2 border-background-dark" 
                src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.fullName}
              />
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-sm font-bold dark:text-white truncate">{user?.fullName || 'Người dùng'}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'Pro Plan'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
              title="Đăng xuất"
            >
              <span className="material-icons-round text-lg">logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
