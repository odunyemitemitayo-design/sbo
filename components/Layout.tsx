
import React, { useEffect } from 'react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewState;
  onViewChange: (view: ViewState) => void;
  progress?: number; // Completion percentage (0-100)
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, progress = 0 }) => {
  useEffect(() => {
    if ((window as any).lucide) {
      (window as any).lucide.createIcons();
    }
  }, [activeView]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 font-sans antialiased overflow-x-hidden">
      {/* Sleek Session Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Sophisticated Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-default">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl rotate-6 absolute blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center relative shadow-xl">
                <i data-lucide="shield-alert" className="w-5 h-5 text-cyan-400"></i>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Safety<span className="text-cyan-500">Guard</span></h1>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1 block">Behavioral Analysis</span>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center bg-slate-900/40 p-1 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <button 
              onClick={() => onViewChange('form')}
              className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === 'form' 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_10px_20px_rgba(34,211,238,0.2)] scale-105' 
                : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              Log Session
            </button>
            <button 
              onClick={() => onViewChange('history')}
              className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeView === 'history' 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_10px_20px_rgba(34,211,238,0.2)] scale-105' 
                : 'text-slate-500 hover:text-slate-200'
              }`}
            >
              The Vault
            </button>
          </nav>

          <div className="sm:hidden flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Online</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-full p-2 flex gap-2 shadow-2xl scale-110">
        <button 
          onClick={() => onViewChange('form')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === 'form' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'
          }`}
        >
          LOG
        </button>
        <button 
          onClick={() => onViewChange('history')}
          className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
            activeView === 'history' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'
          }`}
        >
          VAULT
        </button>
      </div>

      <main className="pt-28 pb-40 px-6 max-w-5xl mx-auto">
        {children}
      </main>

      <footer className="bg-slate-950 border-t border-slate-900/60 py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-slate-800'}`}></div>
            ))}
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">
            Field Intelligence Terminal • v3.5.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
