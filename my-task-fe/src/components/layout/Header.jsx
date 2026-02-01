import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';
import { useLayout } from '../../context/LayoutContext';

function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef(null);
  const { toggleSidebar } = useLayout();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        try {
          const resp = await dashboardService.search(query);
          setResults(resp.data.data);
          setIsOpen(true);
        } catch (error) {
          console.error('Search error:', error);
        }
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (item, type) => {
    setIsOpen(false);
    setQuery('');
    if (type === 'project') {
      navigate(`/projects/${item.id}`);
    } else {
      // If task belongs to a project, go to project detail
      if (item.projectId) {
        navigate(`/projects/${item.projectId}`);
      } else {
        navigate('/tasks');
      }
    }
  };
  
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div className="w-full md:w-auto flex-1 max-w-xl relative flex items-center gap-2" ref={searchRef}>
        <button 
          onClick={toggleSidebar}
          className="md:hidden w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0"
        >
          <span className="material-icons-round">menu</span>
        </button>

        <div className="relative group flex-1">
          <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm" 
            placeholder="Tìm kiếm công việc, dự án..." 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <span className="text-xs px-2 py-1 rounded bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-mono hidden sm:inline-block">⌘K</span>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {isOpen && results && (
          <div className="absolute top-full left-0 w-full mt-2 glass-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-[60] animate-scale-in">
            <div className="max-h-[400px] overflow-y-auto p-2">
              {results.projects?.length > 0 && (
                <div className="mb-4">
                  <h4 className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Dự án</h4>
                  {results.projects.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => handleResultClick(p, 'project')}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-xs`}>
                        <span className="material-icons-round text-sm">{p.icon}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {results.tasks?.length > 0 && (
                <div>
                  <h4 className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Công việc</h4>
                  {results.tasks.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => handleResultClick(t, 'task')}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer group transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <span className="material-icons-round text-sm">assignment</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary">{t.title}</span>
                        <span className="text-[10px] text-slate-500">{t.projectName || 'Không thuộc dự án'} • {t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(!results.tasks?.length && !results.projects?.length) && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Không tìm thấy kết quả nào cho "{query}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 self-end md:self-auto">
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors">
          <span className="material-icons-round">notifications</span>
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
        </button>
        <button className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 overflow-hidden">
          <img 
            alt="Mobile Profile" 
            className="w-full h-full object-cover" 
            src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.fullName}
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
