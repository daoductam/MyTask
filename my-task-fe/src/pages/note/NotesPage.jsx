import { useState, useEffect } from 'react';
import noteService from '../../services/noteService';
import Header from '../../components/layout/Header';
import { useLayout } from '../../context/LayoutContext';

function NotesPage() {
  const { toggleSidebar } = useLayout();
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [activeFolder, setActiveFolder] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFolders();
    fetchNotes();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await noteService.getAllFolders();
      setFolders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchNotes = async (folderId = null) => {
    setLoading(true);
    try {
      let response;
      if (folderId && folderId !== 'ALL') {
        response = await noteService.getNotesByFolder(folderId);
      } else {
        response = await noteService.getAllNotes();
      }
      const notesData = response.data.data || [];
      setNotes(notesData);
      if (notesData.length > 0 && !selectedNote) {
        setSelectedNote(notesData[0]);
      } else if (notesData.length === 0) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNoteData = {
        title: 'Ghi chú mới',
        content: '',
        folderId: activeFolder === 'ALL' ? null : activeFolder,
        isPinned: false
      };
      const response = await noteService.createNote(newNoteData);
      const createdNote = response.data.data;
      setNotes([createdNote, ...notes]);
      setSelectedNote(createdNote);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      const response = await noteService.updateNote(selectedNote.id, {
        title: selectedNote.title,
        content: selectedNote.content,
        folderId: selectedNote.folderId,
        isPinned: selectedNote.isPinned
      });
      const updatedNote = response.data.data;
      setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      try {
        await noteService.deleteNote(id);
        const updatedNotes = notes.filter(n => n.id !== id);
        setNotes(updatedNotes);
        if (selectedNote?.id === id) {
          setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      await noteService.togglePin(noteId);
      const updatedNotes = notes.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n);
      setNotes(updatedNotes);
      if (selectedNote?.id === noteId) {
        setSelectedNote({ ...selectedNote, isPinned: !selectedNote.isPinned });
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await noteService.createFolder(newFolderName);
      setNewFolderName('');
      setShowFolderModal(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm('Xóa thư mục sẽ không xóa các ghi chú bên trong. Tiếp tục?')) {
      try {
        await noteService.deleteFolder(id);
        fetchFolders();
        if (activeFolder === id) setActiveFolder('ALL');
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading && notes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col md:flex-row h-full gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full overflow-hidden">
      {/* Sidebar List */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col gap-4 h-full shrink-0">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <button 
                    onClick={toggleSidebar}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-primary transition-colors shrink-0"
                >
                    <span className="material-icons-round">menu</span>
                </button>
                Ghi chú
            </h2>
            <button 
              onClick={() => setShowFolderModal(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Thêm thư mục"
            >
              <span className="material-icons-round">create_new_folder</span>
            </button>
          </div>
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => { setActiveFolder('ALL'); fetchNotes('ALL'); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFolder === 'ALL' ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
          >Tất cả</button>
          {folders.map(f => (
            <button 
              key={f.id} 
              onClick={() => { setActiveFolder(f.id); fetchNotes(f.id); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFolder === f.id ? 'bg-primary text-white shadow-lg' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10'}`}
            >{f.name}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2 scrollbar-hide">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setSelectedNote(note)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${selectedNote?.id === note.id ? 'bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/40' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-white/10 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-bold truncate pr-6 ${selectedNote?.id === note.id ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>{note.title || 'Không tiêu đề'}</h4>
                <button 
                  onClick={(e) => handleTogglePin(e, note.id)}
                  className={`transition-colors ${note.isPinned ? 'text-primary' : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400'}`}
                >
                  <span className="material-icons-round text-sm">{note.isPinned ? 'push_pin' : 'push_pin'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{note.content || '...'}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{note.folderName || 'Chung'}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-600">{getRelativeTime(note.updatedAt)}</span>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && <div className="text-center py-12 text-slate-500 dark:text-slate-600">Trống</div>}
        </div>

        <button 
          onClick={handleCreateNote}
          className="group flex items-center justify-center gap-2 bg-primary hover:bg-violet-600 text-white px-6 py-3.5 rounded-2xl shadow-lg transition-all font-bold w-full"
        >
          <span className="material-icons-round text-xl group-hover:rotate-90 transition-transform">add</span>
          <span>Ghi chú mới</span>
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 glass-panel rounded-3xl flex-col flex overflow-hidden border-t border-slate-200 dark:border-white/10 relative">
        {selectedNote ? (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-800/20 backdrop-blur-md">
              <span className="text-xs text-slate-500">{isSaving ? 'Đang lưu...' : `Sửa lần cuối: ${getRelativeTime(selectedNote.updatedAt)}`}</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSaveNote}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-sm font-bold shadow-sm"
                >
                  <span className="material-icons-round text-lg">save</span>
                  Lưu
                </button>
                <button 
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                >
                   <span className="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 scrollbar-hide bg-white dark:bg-transparent transition-colors">
              <div className="max-w-3xl mx-auto space-y-6">
                 <input 
                    className="w-full bg-transparent border-none p-0 text-4xl md:text-5xl font-black text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 leading-tight" 
                    placeholder="Tiêu đề..." 
                    value={selectedNote.title || ''}
                    onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                 />
                 <textarea 
                    className="w-full bg-transparent border-none p-0 text-lg md:text-xl text-slate-600 dark:text-slate-300 placeholder-slate-300 dark:placeholder-slate-700 focus:ring-0 min-h-[500px] resize-none leading-relaxed" 
                    placeholder="Viết nội dung tại đây..."
                    value={selectedNote.content || ''}
                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                 />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4">
            <span className="material-icons-round text-8xl opacity-10">description</span>
            <p className="text-xl font-medium">Chọn một ghi chú để bắt đầu</p>
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}></div>
          <div className="relative w-full max-w-sm glass-panel rounded-3xl p-6 shadow-2xl animate-scale-in border-t border-slate-100 dark:border-white/20">
             <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Thư mục mới</h3>
             <form onSubmit={handleCreateFolder}>
                <input 
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all mb-4" 
                  placeholder="Tên thư mục..." 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <div className="flex gap-4">
                   <button type="button" onClick={() => setShowFolderModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 font-medium">Hủy</button>
                   <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white shadow-lg font-bold">Tạo</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

export default NotesPage;
