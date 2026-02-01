import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import workspaceService from '../../services/workspaceService';
import Header from '../../components/layout/Header';

function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    workspaceId: '',
    startDate: '',
    dueDate: '',
    priority: 'MEDIUM',
    icon: 'folder',
    color: 'from-purple-500 to-indigo-500'
  });

  useEffect(() => {
    fetchProjects();
  }, [filter]);

  useEffect(() => {
    fetchWorkspaces();
  }, []); // Fetch workspaces only once on component mount

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectService.getProjects(filter);
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const resp = await workspaceService.getAllWorkspaces();
      const wsData = resp.data.data || [];
      setWorkspaces(wsData);
      if (wsData.length > 0 && !newProject.workspaceId) {
        setNewProject(prev => ({ ...prev, workspaceId: wsData[0].id }));
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await projectService.updateProject(selectedProject.id, newProject);
      } else {
        await projectService.createProject(newProject);
      }
      setShowModal(false);
      setSelectedProject(null);
      setNewProject({
        name: '',
        description: '',
        workspaceId: workspaces[0]?.id || '',
        startDate: '',
        dueDate: '',
        priority: 'MEDIUM',
        icon: 'folder',
        color: 'from-purple-500 to-indigo-500'
      });
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Xóa dự án này sẽ xóa toàn bộ công việc bên trong. Tiếp tục?')) {
      try {
        await projectService.deleteProject(projectId);
        fetchProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleToggleArchive = async (e, project) => {
    e.stopPropagation();
    try {
      const newStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
      await projectService.updateProject(project.id, { ...project, status: newStatus });
      fetchProjects();
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const openEditModal = (e, project) => {
    e.stopPropagation();
    setSelectedProject(project);
    setNewProject({
      name: project.name,
      description: project.description || '',
      workspaceId: project.workspaceId,
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      priority: project.priority,
      icon: project.icon || 'folder',
      color: project.color || 'from-purple-500 to-indigo-500'
    });
    setShowModal(true);
  };

  const getPriorityClass = (priority) => {
    if (priority === 'HIGH') return 'text-red-500 bg-red-500/10 border-red-500/20';
    if (priority === 'MEDIUM') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  const getPriorityLabel = (priority) => {
    if (priority === 'HIGH') return 'Ưu tiên cao';
    if (priority === 'MEDIUM') return 'Trung bình';
    return 'Ưu tiên thấp';
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <Header />
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 mt-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
            Dự án của bạn
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg">Quản lý tiến độ và cộng tác hiệu quả.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-sm text-sm" 
              placeholder="Tìm kiếm dự án..." 
              type="text"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-2 bg-primary hover:bg-violet-600 text-white px-6 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300 font-medium whitespace-nowrap"
          >
            <span className="material-icons-round text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
            <span>Dự án mới</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                : 'bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-white/5 hover:text-primary dark:hover:text-white'
            }`}
          >
            {status === 'ALL' ? 'Tất cả' : status === 'ACTIVE' ? 'Đang thực hiện' : status === 'COMPLETED' ? 'Đã hoàn thành' : 'Lưu trữ'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {(() => {
            const filteredProjects = localSearchQuery 
              ? projects.filter(p => p.name.toLowerCase().includes(localSearchQuery.toLowerCase())) 
              : projects;
            
            if (filteredProjects.length === 0) {
              return (
                <div className="col-span-full text-center py-20 text-slate-500 font-medium">
                  {localSearchQuery ? `Không tìm thấy dự án nào khớp với "${localSearchQuery}"` : "Bạn chưa có dự án nào trong mục này."}
                </div>
              );
            }

            return filteredProjects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => navigate(`/projects/${project.id}`)}
                className="glass-panel rounded-3xl p-6 relative group hover:-translate-y-2 transition-all duration-300 flex flex-col h-full glow-border cursor-pointer shadow-xl shadow-black/5"
              >
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={(e) => openEditModal(e, project)}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white transition-all backdrop-blur-sm border border-white/5"
                  >
                    <span className="material-icons-round text-sm">edit</span>
                  </button>
                  <button 
                    onClick={(e) => handleToggleArchive(e, project)}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-blue-400 transition-all backdrop-blur-sm border border-white/5"
                    title={project.status === 'ARCHIVED' ? 'Khôi phục' : 'Lưu trữ'}
                  >
                    <span className="material-icons-round text-sm">{project.status === 'ARCHIVED' ? 'unarchive' : 'archive'}</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProject(e, project.id)}
                    className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-rose-500 transition-all backdrop-blur-sm border border-white/5"
                  >
                    <span className="material-icons-round text-sm">delete</span>
                  </button>
                </div>
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${project.color || 'from-purple-500 to-indigo-500'} flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0`}>
                    <span className="material-icons-round text-2xl">{project.icon || 'folder'}</span>
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getPriorityClass(project.priority)}`}>
                        {getPriorityLabel(project.priority)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">{project.name}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 flex-grow">
                  {project.description || 'Không có mô tả cho dự án này.'}
                </p>
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2 font-black uppercase tracking-widest">
                    <span className="text-slate-500">Tiến độ</span>
                    <span className="text-primary">{project.taskCount > 0 ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] relative transition-all duration-1000" 
                      style={{ width: `${project.taskCount > 0 ? (project.completedTaskCount / project.taskCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 mt-auto">
                  <div className="flex -space-x-3">
                    <img className="w-8 h-8 rounded-full border-2 border-white dark:border-card-dark" src={`https://ui-avatars.com/api/?name=${project.createdByName}&background=random`} alt="avatar" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                    <span className="material-icons-round text-sm">assignment</span>
                    <span>{project.taskCount || 0} công việc</span>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20 max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{selectedProject ? 'Chỉnh sửa dự án' : 'Dự án mới'}</h3>
               <button onClick={() => { setShowModal(false); setSelectedProject(null); }} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"><span className="material-icons-round">close</span></button>
             </div>
             <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Tên dự án</label>
                      <input required value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" placeholder="Tên dự án..." />
                   </div>
                   <div className="col-span-2 md:col-span-1">
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Ưu tiên</label>
                      <select required value={newProject.priority} onChange={(e) => setNewProject({...newProject, priority: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none">
                         <option value="LOW" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Thấp</option>
                         <option value="MEDIUM" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Trung bình</option>
                         <option value="HIGH" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">Cao</option>
                      </select>
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Workspace</label>
                   <select required value={newProject.workspaceId} onChange={(e) => setNewProject({...newProject, workspaceId: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold appearance-none">
                      {workspaces.map(ws => <option key={ws.id} value={ws.id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-medium">{ws.name}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Ngày bắt đầu</label>
                      <input type="date" value={newProject.startDate} onChange={(e) => setNewProject({...newProject, startDate: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Hạn hoàn thành</label>
                      <input type="date" value={newProject.dueDate} onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold" />
                   </div>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.2em] ml-1">Mô tả dự án</label>
                   <textarea rows="3" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} className="w-full px-5 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all leading-relaxed" placeholder="Mục tiêu và phạm vi của dự án này..."></textarea>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="button" onClick={() => { setShowModal(false); setSelectedProject(null); }} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 font-bold transition-all">Hủy</button>
                   <button type="submit" className="flex-1 py-4 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 font-black hover:scale-[1.02] active:scale-95 transition-all uppercase">{selectedProject ? 'Lưu thay đổi' : 'Tạo dự án'}</button>
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

export default ProjectsPage;
