import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import taskService from '../../services/taskService';
import Header from '../../components/layout/Header';

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const DEFAULT_KANBAN = {
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: []
  };

  const [kanbanTasks, setKanbanTasks] = useState(DEFAULT_KANBAN);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    projectId: id,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [projectRes, kanbanRes] = await Promise.all([
        projectService.getProjectById(id),
        projectService.getKanbanTasks(id)
      ]);
      setProject(projectRes.data.data);
      
      // Ensure all columns exist
      const tasksData = kanbanRes.data.data || {};
      setKanbanTasks({
        TODO: tasksData.TODO || [],
        IN_PROGRESS: tasksData.IN_PROGRESS || [],
        REVIEW: tasksData.REVIEW || [],
        DONE: tasksData.DONE || []
      });
    } catch (error) {
      console.error('Error fetching project detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await taskService.updateTask(selectedTask.id, newTask);
      } else {
        await taskService.createTask({ ...newTask, projectId: id });
      }
      setShowTaskModal(false);
      setSelectedTask(null);
      setNewTask({
        title: '',
        description: '',
        projectId: id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: ''
      });
      fetchProjectData();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      try {
        await taskService.deleteTask(taskId);
        fetchProjectData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const openAddTaskModal = (status) => {
    setSelectedTask(null);
    setNewTask({
      title: '',
      description: '',
      projectId: id,
      status: status || 'TODO',
      priority: 'MEDIUM',
      dueDate: ''
    });
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      projectId: id,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setShowTaskModal(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId, currentStatus) => {
    e.dataTransfer.setData('taskId', String(taskId));
    e.dataTransfer.setData('sourceStatus', currentStatus);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskIdString = e.dataTransfer.getData('taskId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');

    if (!taskIdString || !sourceStatus || sourceStatus === targetStatus) return;

    const taskId = Number(taskIdString);

    try {
      // Optimistic Update
      const sourceList = kanbanTasks[sourceStatus] || [];
      const taskToMove = sourceList.find(t => t.id === taskId);
      
      if (taskToMove) {
        setKanbanTasks(prev => ({
          ...prev,
          [sourceStatus]: (prev[sourceStatus] || []).filter(t => t.id !== taskId),
          [targetStatus]: [...(prev[targetStatus] || []), { ...taskToMove, status: targetStatus }]
        }));
      }

      await taskService.updateTaskStatus(taskId, targetStatus);
      fetchProjectData(); // Refresh to get updated stats/order
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchProjectData(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center text-slate-500 font-medium">Không tìm thấy dự án.</div>;
  }

  const totalTasks = Object.values(kanbanTasks).reduce((acc, tasks) => acc + (tasks?.length || 0), 0);
  const completedTasks = kanbanTasks.DONE?.length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const strokeDasharray = `${progress}, 100`;

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

  const columns = [
    { key: 'TODO', label: 'Cần làm', color: 'bg-slate-400' },
    { key: 'IN_PROGRESS', label: 'Đang làm', color: 'bg-blue-500' },
    { key: 'REVIEW', label: 'Đang kiểm tra', color: 'bg-amber-500' },
    { key: 'DONE', label: 'Hoàn thành', color: 'bg-emerald-500' }
  ];

  return (
    <div className="px-4 md:px-6 lg:px-8 pb-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
      <Header />
      
      <button 
        onClick={() => navigate('/projects')} 
        className="group flex items-center gap-2 text-slate-500 hover:text-white transition-all w-fit mb-3"
      >
        <span className="material-icons-round text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Danh sách dự án</span>
      </button>

      {/* Project Summary Header */}
      <div className="glass-panel p-4 rounded-3xl mb-3 shadow-xl shadow-black/5 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full rotate-[-90deg] drop-shadow-xl" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-white/5" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                <path className="text-primary transition-all duration-1000 ease-out" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={strokeDasharray} strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-slate-800 dark:text-white">{Math.round(progress)}%</span>
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1">
                <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{project.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">{project.status}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1"><span className="material-icons-round text-sm">calendar_today</span> {project.dueDate ? new Date(project.dueDate).toLocaleDateString('vi-VN') : 'KHÔNG HẠN'}</span>
                <span className="flex items-center gap-1"><span className="material-icons-round text-sm">assignment</span> {project.taskCount} TASKS</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => openAddTaskModal('TODO')}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary hover:bg-violet-600 text-white shadow-lg shadow-primary/25 transition-all text-xs font-black uppercase tracking-widest shrink-0"
          >
            <span className="material-icons-round text-lg">add</span>
            CÔNG VIỆC MỚI
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 mt-6">
        <div className="flex gap-2.5 h-full overflow-x-auto xl:overflow-x-hidden scrollbar-hide">
          {columns.map((col) => (
            <div 
              key={col.key} 
              className="flex flex-col flex-1 min-w-[200px] max-w-[400px] min-h-[600px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
            >
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <h3 className="font-black text-[9px] uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${col.color} shrink-0`}></span>
                  <span className="truncate">{col.label}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-slate-400 font-bold">
                    {kanbanTasks[col.key]?.length || 0}
                  </span>
                </h3>
                <button 
                  onClick={() => openAddTaskModal(col.key)}
                  className="text-slate-600 hover:text-white transition-colors p-1"
                >
                  <span className="material-icons-round text-lg">add</span>
                </button>
              </div>
              
              <div className="flex-1 bg-slate-50 dark:bg-white/5 rounded-3xl p-2.5 border border-slate-200 dark:border-white/5 flex flex-col gap-2.5 transition-colors">
                {kanbanTasks[col.key]?.map((task) => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, col.key)}
                    onDragEnd={handleDragEnd}
                    className="glass-panel p-4 rounded-2xl cursor-grab active:cursor-grabbing group hover:border-primary/40 transition-all duration-300 relative overflow-hidden shadow-sm shrink-0"
                  >
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button 
                        onClick={() => openEditTaskModal(task)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
                      >
                        <span className="material-icons-round text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      >
                        <span className="material-icons-round text-sm">delete</span>
                      </button>
                    </div>
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all ${
                      task.priority === 'HIGH' ? 'bg-red-500' : task.priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}></div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${getPriorityClass(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold text-slate-800 dark:text-white mb-3 leading-relaxed line-clamp-3 ${task.status === 'DONE' ? 'line-through opacity-50' : ''}`}>
                      {task.title}
                    </h4>
                    
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 tracking-widest uppercase truncate mr-2">
                        <span className="material-icons-round text-xs">schedule</span>
                        <span className="truncate">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'N/A'}</span>
                      </div>
                      <img className="w-5 h-5 rounded-full border border-slate-200 dark:border-white/10 shrink-0" src={`https://ui-avatars.com/api/?name=${task.assigneeName || 'U'}&background=random&size=32&font-size=0.5`} alt="assignee" />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => openAddTaskModal(col.key)}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 mt-auto shrink-0"
                >
                  <span className="material-icons-round text-base">add</span>
                  MỚI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowTaskModal(false)}></div>
          <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{selectedTask ? 'Chỉnh sửa công việc' : 'Công việc mới'}</h3>
               <button onClick={() => { setShowTaskModal(false); setSelectedTask(null); }} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><span className="material-icons-round">close</span></button>
             </div>
             <form onSubmit={handleCreateTask} className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Tiêu đề công việc</label>
                   <input required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="Tên công việc cần thực hiện..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Độ ưu tiên</label>
                      <select value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none">
                         <option value="LOW" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Thấp</option>
                         <option value="MEDIUM" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Trung bình</option>
                         <option value="HIGH" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Cao</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Hạn hoàn thành</label>
                      <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Mô tả công việc</label>
                   <textarea rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed" placeholder="Ghi chú thêm về công việc này..."></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => { setShowTaskModal(false); setSelectedTask(null); }} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-all">Hủy</button>
                   <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 font-black hover:scale-[1.02] active:scale-95 transition-all">{selectedTask ? 'CẬP NHẬT' : 'TẠO CÔNG VIỆC'}</button>
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

export default ProjectDetailPage;
