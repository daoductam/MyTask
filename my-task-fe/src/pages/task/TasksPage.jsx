import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useLayout } from '../../context/LayoutContext';

function TasksPage() {
  const { toggleSidebar } = useLayout();
  const [kanbanTasks, setKanbanTasks] = useState({
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: []
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getKanbanTasks();
      setKanbanTasks(response.data.data || {
        TODO: [],
        IN_PROGRESS: [],
        REVIEW: [],
        DONE: []
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjects();
      setProjects(response.data.data || []);
      if (response.data.data?.length > 0) {
        setNewTask(prev => ({ ...prev, projectId: response.data.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTask(newTask);
      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        projectId: projects[0]?.id || '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: ''
      });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Có lỗi xảy ra khi tạo công việc.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const getPriorityClass = (priority) => {
    if (priority === 'HIGH' || priority === 'URGENT') return 'bg-red-500/10 border-red-500/20 text-red-500';
    if (priority === 'MEDIUM') return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'HIGH' || priority === 'URGENT') return 'Cao';
    if (priority === 'MEDIUM') return 'Trung bình';
    return 'Thấp';
  };

  const filterTasks = (tasks) => {
    if (!tasks) return [];
    if (activeFilter === 'Tất cả') return tasks;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    return tasks.filter(task => {
      // Name filter
      if (localSearchQuery && !task.title.toLowerCase().includes(localSearchQuery.toLowerCase())) {
        return false;
      }

      if (!task.dueDate) return activeFilter === 'Tất cả';
      const taskDate = new Date(task.dueDate).getTime();
      
      if (activeFilter === 'Hôm nay') {
        return taskDate >= today && taskDate < today + 86400000;
      }
      
      if (activeFilter === 'Tuần này') {
        const nextWeek = today + (7 * 86400000);
        return taskDate >= today && taskDate < nextWeek;
      }

      if (activeFilter === 'Đã hoàn thành') {
        return task.status === 'DONE';
      }

      return true;
    });
  };

  const columns = [
    { 
      key: 'TODO', 
      label: 'Cần làm', 
      color: 'bg-slate-400', 
      tasks: filterTasks(kanbanTasks.TODO) 
    },
    { 
      key: 'IN_PROGRESS', 
      label: 'Đang thực hiện', 
      color: 'bg-blue-500', 
      tasks: [...filterTasks(kanbanTasks.IN_PROGRESS), ...filterTasks(kanbanTasks.REVIEW)]
    },
    { 
      key: 'DONE', 
      label: 'Đã xong', 
      color: 'bg-emerald-500', 
      tasks: filterTasks(kanbanTasks.DONE) 
    }
  ];

  const renderTaskCard = (task) => (
    <div key={task.id} className="group p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)] transition-all cursor-pointer relative">
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border tracking-wider ${getPriorityClass(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'DONE' && (
             <button 
                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(task.id, task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE'); }}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                title="Tiến hành"
             >
                <span className="material-icons-round text-sm">forward</span>
             </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
            title="Xóa"
          >
            <span className="material-icons-round text-sm">delete</span>
          </button>
        </div>
      </div>
      <h4 className={`text-slate-800 dark:text-slate-100 font-semibold text-sm mb-1 leading-snug ${task.status === 'DONE' ? 'line-through opacity-60' : ''}`}>
        {task.title}
      </h4>
      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
      
      {task.status === 'IN_PROGRESS' && (
          <div className="w-full bg-slate-200 dark:bg-white/10 h-1 rounded-full mb-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full w-[65%]"></div>
          </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs">
          <span className="material-icons-round text-[14px]">calendar_today</span>
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Không có hạn'}</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
             <span className="material-icons-round text-xs text-slate-400">person</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col relative min-h-0">
      <div className="relative z-10 px-6 py-6 md:px-8 border-b border-white/5 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
                onClick={toggleSidebar}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0"
              >
                <span className="material-icons-round">menu</span>
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                Công việc
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/10 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10">
                  {(kanbanTasks.TODO?.length || 0) + (kanbanTasks.IN_PROGRESS?.length || 0) + (kanbanTasks.REVIEW?.length || 0)} đang chờ
                </span>
              </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-64">
              <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm text-sm" 
                placeholder="Tìm kiếm công việc..." 
                type="text"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-end lg:items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-hide">
            <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
              {['Tất cả', 'Hôm nay', 'Tuần này', 'Đã hoàn thành'].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter 
                    ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-2 bg-primary hover:bg-violet-600 text-white px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300 font-medium whitespace-nowrap"
          >
            <span className="material-icons-round text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
            <span>Thêm công việc mới</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 lg:p-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full min-w-0">
          {columns.map((col) => (
            <div key={col.key} className={`flex flex-col h-full glass-panel rounded-2xl border-t-4 ${
              col.key === 'TODO' ? 'border-t-slate-400 dark:border-t-slate-500' : 
              col.key === 'IN_PROGRESS' ? 'border-t-blue-500' : 'border-t-emerald-500'
            }`}>
              <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-white/5">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.color} ${col.key === 'IN_PROGRESS' ? 'animate-pulse' : ''}`}></span>
                  {col.label}
                  <span className="bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md text-xs font-medium">{col.tasks.length}</span>
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 kanban-col scrollbar-hide">
                {col.tasks.map(renderTaskCard)}
                {col.tasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl text-slate-400">
                    <span className="material-icons-round text-3xl mb-1">inbox</span>
                    <span className="text-xs">Trống</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg glass-panel rounded-3xl shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/10 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Thêm công việc mới</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-all"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Tiêu đề</label>
                <input 
                  type="text" 
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Nhập tiêu đề công việc..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Dự án</label>
                  <select 
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    {projects.map(p => <option key={p.id} value={p.id} className="bg-white dark:bg-slate-800">{p.name}</option>)}
                    {projects.length === 0 && <option value="" className="bg-white dark:bg-slate-800" disabled>Chưa có dự án</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Ưu tiên</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="LOW" className="bg-white dark:bg-slate-800">Thấp</option>
                    <option value="MEDIUM" className="bg-white dark:bg-slate-800">Trung bình</option>
                    <option value="HIGH" className="bg-white dark:bg-slate-800">Cao</option>
                    <option value="URGENT" className="bg-white dark:bg-slate-800">Khẩn cấp</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Mô tả</label>
                <textarea 
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Nhập mô tả chi tiết..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-1">Ngày hết hạn</label>
                <input 
                  type="date" 
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-medium"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-violet-600 transition-all font-bold"
                >
                  Tạo công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default TasksPage;
