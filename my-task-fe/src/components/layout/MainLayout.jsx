import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AIChat from '../ai/AIChat';
import { LayoutProvider } from '../../context/LayoutContext';

function MainLayoutContent() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      <main className="flex-1 relative flex flex-col min-w-0">
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40 dark:opacity-20 animate-blob"></div>
          <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] opacity-40 dark:opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
          <Outlet />
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-primary hover:bg-violet-600 text-white rounded-full shadow-[0_4px_20px_rgba(139,92,246,0.5)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-50"
        >
          <span className="material-icons-round text-2xl">chat_bubble</span>
          {!isChatOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
            </span>
          )}
        </button>

        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </main>
    </div>
  );
}

function MainLayout() {
  return (
    <LayoutProvider>
      <MainLayoutContent />
    </LayoutProvider>
  );
}

export default MainLayout;
