
import React, { useEffect } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState | 'dashboard' | 'actions' | 'profile' | 'admin';
  onViewChange: (view: ViewState | 'dashboard' | 'actions' | 'profile' | 'admin') => void;
  progress?: number;
  userRole: string;
  onLogout: (e?: React.MouseEvent) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, progress = 0, userRole, onLogout }) => {
  useEffect(() => {
    if ((window as any).lucide) (window as any).lucide.createIcons();
  }, [activeView, userRole]);

  const navItems = {
    observer: [
      { id: 'form', label: 'Field Entry', icon: 'plus-circle' },
      { id: 'history', label: 'Audit Log', icon: 'database' }
    ],
    manager: [
      { id: 'dashboard', label: 'Leadership Desk', icon: 'layout-dashboard' },
      { id: 'history', label: 'Full Registry', icon: 'table' }
    ],
    followup: [
      { id: 'actions', label: 'Track Tasks', icon: 'list-todo' },
      { id: 'history', label: 'Archive', icon: 'history' }
    ],
    admin: [
      { id: 'admin', label: 'HQ Overview', icon: 'shield' },
      { id: 'history', label: 'Master Data', icon: 'server' }
    ],
    employee: [
      { id: 'admin', label: 'HQ Overview', icon: 'shield' },
      { id: 'history', label: 'Master Data', icon: 'server' }
    ]
  };

  const getRoleHeader = () => {
    switch (userRole) {
      case 'observer': return 'New Observation';
      case 'manager': return 'Manager Portal';
      case 'followup': return 'Task Tracker';
      case 'admin':
      case 'employee': return 'HQ Command Center';
      default: return 'Safety Dashboard';
    }
  };

  const currentNav = navItems[userRole as keyof typeof navItems] || [];

  const handleNavClick = (e: React.MouseEvent, viewId: string) => {
    e.preventDefault();
    onViewChange(viewId as any);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 font-sans antialiased overflow-x-hidden">
      {/* Global Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-[60] bg-slate-950/60 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => onViewChange(currentNav[0]?.id as any)}>
            <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-xl group-hover:border-cyan-500/50 transition-all">
              <i data-lucide="shield-alert" className="w-5 h-5 text-cyan-400"></i>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-white uppercase italic leading-none">
                Safety<span className="text-cyan-500">Guard</span>
              </h1>
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1 opacity-80">
                {getRoleHeader()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <nav className="hidden md:flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
              {currentNav.map(item => (
                <button 
                  key={item.id}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeView === item.id ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            <button 
              type="button"
              onClick={(e) => onLogout(e)} 
              className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:text-rose-400 transition-all text-[9px] font-black uppercase tracking-widest border border-rose-500/20 rounded-xl hover:bg-rose-500/5 active:scale-95"
            >
              <i data-lucide="log-out" className="w-3.5 h-3.5"></i> 
              <span className="hidden sm:inline">Switch User</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Bar */}
      {currentNav.length > 1 && (
        <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 shadow-2xl">
          {currentNav.map(item => (
            <button 
              key={item.id}
              onClick={(e) => handleNavClick(e, item.id)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                activeView === item.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'
              }`}
            >
              <i data-lucide={item.icon} className="w-4 h-4 mb-1 mx-auto block"></i>
              {item.label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <main className="pt-28 pb-32 px-6 max-w-6xl mx-auto">
        {/* KEY TRIGGER: key={activeView} ensures the animation plays on every screen switch */}
        <div key={activeView} className="animate-in fade-in slide-in-from-bottom-10 duration-500 ease-out fill-mode-both">
          {children}
        </div>
      </main>

      <footer className="py-12 px-6 text-center border-t border-white/5 opacity-40">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-500">Security Node • Terminal v3.5.0</p>
      </footer>
    </div>
  );
};

export default Layout;
