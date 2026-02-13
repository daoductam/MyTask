import { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import taskService from '../../services/taskService';
import projectService from '../../services/projectService';
import { useLayout } from '../../context/LayoutContext';
import TaskDetailModal from '../../components/modals/TaskDetailModal';
import { formatDateStrict } from '../../utils/dateUtils';

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
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('KANBAN'); // 'KANBAN' or 'LIST'
  const [paginatedData, setPaginatedData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    pageNumber: 0
  });
  const [kanbanMeta, setKanbanMeta] = useState({
    TODO: { page: 0, hasMore: true },
    IN_PROGRESS: { page: 0, hasMore: true },
    REVIEW: { page: 0, hasMore: true },
    DONE: { page: 0, hasMore: true }
  });
  const [activeFilter, setActiveFilter] = useState('Tất cả');
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
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (viewMode === 'KANBAN') {
      fetchTasks();
    } else {
      fetchPaginatedTasks(0);
    }
    fetchProjects();
  }, [viewMode]);

  const fetchPaginatedTasks = async (page = 0, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await taskService.getAllTasks(page, 20);
      setPaginatedData(response.data.data);
      setPage(page);
    } catch (error) {
      console.error('Error fetching paginated tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      const results = await Promise.all(statuses.map(s => taskService.getAllTasks(0, 10, s)));
      
      const newTasks = {};
      const newMeta = {};
      
      statuses.forEach((status, index) => {
        const data = results[index].data.data;
        newTasks[status] = data.content;
        newMeta[status] = { page: 0, hasMore: !data.last };
      });
      
      setKanbanTasks(newTasks);
      setKanbanMeta(newMeta);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async (status) => {
    const nextPage = kanbanMeta[status].page + 1;
    try {
      const response = await taskService.getAllTasks(nextPage, 10, status);
      const data = response.data.data;
      
      setKanbanTasks(prev => ({
        ...prev,
        [status]: [...prev[status], ...data.content]
      }));
      
      setKanbanMeta(prev => ({
        ...prev,
        [status]: { page: nextPage, hasMore: !data.last }
      }));
    } catch (error) {
      console.error('Error loading more tasks:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getProjects('ALL', 0, 100); // Fetch more for dropdown
      const projectData = response.data.data.content || [];
      setProjects(projectData);
      if (projectData.length > 0) {
        setNewTask(prev => ({ ...prev, projectId: projectData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await taskService.updateTask(selectedTask.id, newTask);
      } else {
        await taskService.createTask(newTask);
      }
      setShowModal(false);
      setSelectedTask(null);
      setNewTask({
        title: '',
        description: '',
        projectId: projects[0]?.id || '',
        priority: 'MEDIUM',
        status: 'TODO',
        dueDate: ''
      });
      if (viewMode === 'KANBAN') {
        fetchTasks(true);
      } else {
        fetchPaginatedTasks(page, true);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Có lỗi xảy ra khi tạo công việc.');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      fetchTasks(true);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setKanbanTasks(prev => {
        const newState = { ...prev };
        Object.keys(newState).forEach(key => {
          newState[key] = newState[key].filter(t => t.id !== taskId);
        });
        return newState;
      });
      await taskService.deleteTask(taskId);
      if (viewMode === 'KANBAN') {
        fetchTasks(true);
      } else {
        fetchPaginatedTasks(page, true);
      }
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
      fetchTasks(true); // Re-fetch on error to revert optimistic update
    }
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
    setShowDetailModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowModal(true);
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
      label: 'Đang làm', 
      color: 'bg-blue-500', 
      tasks: filterTasks(kanbanTasks.IN_PROGRESS)
    },
    { 
      key: 'REVIEW', 
      label: 'Chờ duyệt', 
      color: 'bg-amber-500', 
      tasks: filterTasks(kanbanTasks.REVIEW)
    },
    { 
      key: 'DONE', 
      label: 'Đã xong', 
      color: 'bg-emerald-500', 
      tasks: filterTasks(kanbanTasks.DONE) 
    }
  ];

  const renderTaskCard = (task) => (
    <div 
      key={task.id} 
      onClick={() => handleViewTask(task)}
      className="group p-4 rounded-xl bg-white dark:bg-card-dark border border-slate-200 dark:border-white/5 hover:border-primary/50 hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)] transition-all cursor-pointer relative"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold border tracking-wider ${getPriorityClass(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.status !== 'DONE' && (
             <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : 
                                   task.status === 'IN_PROGRESS' ? 'REVIEW' : 'DONE';
                  handleUpdateStatus(task.id, nextStatus); 
                }}
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
          <span>{task.dueDate ? formatDateStrict(task.dueDate) : 'Không có hạn'}</span>
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
          <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
              <button 
                onClick={() => setViewMode('KANBAN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'KANBAN' 
                  ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-icons-round text-lg">view_kanban</span>
                <span>Kanban</span>
              </button>
              <button 
                onClick={() => setViewMode('LIST')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'LIST' 
                  ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="material-icons-round text-lg">view_list</span>
                <span>Danh sách</span>
              </button>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 hidden lg:block"></div>

            <div className="flex p-1 bg-slate-200/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shrink-0">
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

      {viewMode === 'KANBAN' ? (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 md:p-6 lg:p-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-w-0">
            {columns.map((col) => (
              <div key={col.key} className={`flex flex-col h-full glass-panel rounded-2xl border-t-4 ${
                col.key === 'TODO' ? 'border-t-slate-400 dark:border-t-slate-500' : 
                col.key === 'IN_PROGRESS' ? 'border-t-blue-500' : 
                col.key === 'REVIEW' ? 'border-t-amber-500' : 'border-t-emerald-500'
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
                  {/* Load More Button */}
                  {kanbanMeta[col.key] && kanbanMeta[col.key].hasMore && (
                    <button 
                      onClick={() => handleLoadMore(col.key)}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-transparent hover:border-primary/20 flex items-center justify-center gap-1"
                    >
                      <span className="material-icons-round text-sm">expand_more</span>
                      Tải thêm...
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-4 md:p-6 lg:p-8 relative z-10 overflow-hidden flex flex-col">
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Công việc</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Trạng thái</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Ưu tiên</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Hạn</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {paginatedData.content.map((task) => (
                    <tr 
                      key={task.id} 
                      onClick={() => handleViewTask(task)}
                      className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'DONE' ? 'bg-emerald-500' : 
                            task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 
                            task.status === 'REVIEW' ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></div>
                          <div>
                            <p className={`font-bold text-slate-800 dark:text-white ${task.status === 'DONE' ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{task.projectName || 'Chung'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          task.status === 'DONE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                          'bg-slate-500/10 text-slate-500 border-slate-500/20'
                        }`}>
                          {task.status === 'DONE' ? 'Xong' : task.status === 'IN_PROGRESS' ? 'Làm' : 'Chờ'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getPriorityClass(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-500">
                        {task.dueDate ? formatDateStrict(task.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEditTask(task); }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-primary transition-all"
                          >
                            <span className="material-icons-round text-sm">edit</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-rose-500 transition-all"
                          >
                            <span className="material-icons-round text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {paginatedData.content.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <span className="material-icons-round text-5xl mb-3">inbox</span>
                  <p className="font-medium">Chưa có công việc nào.</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {paginatedData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-white/5 flex flex-wrap justify-between items-center gap-4 bg-slate-50/30 dark:bg-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Trang {paginatedData.pageNumber + 1} / {paginatedData.totalPages} ({paginatedData.totalElements} công việc)
                </p>
                
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page === 0}
                    onClick={() => fetchPaginatedTasks(page - 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-40 transition-all hover:border-primary hover:text-primary"
                  >
                    <span className="material-icons-round">chevron_left</span>
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(paginatedData.totalPages)].map((_, i) => {
                      if (
                        i === 0 || 
                        i === paginatedData.totalPages - 1 || 
                        (i >= page - 1 && i <= page + 1)
                      ) {
                        return (
                          <button
                            key={i}
                            onClick={() => fetchPaginatedTasks(i)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${
                              page === i 
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-500 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {i + 1}
                          </button>
                        );
                      } else if (
                        (i === 1 && page > 2) || 
                        (i === paginatedData.totalPages - 2 && page < paginatedData.totalPages - 3)
                      ) {
                        return <span key={i} className="text-slate-400 px-1 font-black">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button 
                    disabled={page >= paginatedData.totalPages - 1}
                    onClick={() => fetchPaginatedTasks(page + 1)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-500 disabled:opacity-40 transition-all hover:border-primary hover:text-primary"
                  >
                    <span className="material-icons-round">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
      
      
      <TaskDetailModal 
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        task={viewingTask}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <style>{`
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </div>
  );
}

export default TasksPage;
