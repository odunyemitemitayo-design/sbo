
import React, { useState, useEffect } from 'react';

interface LoginPortalProps {
  onLogin: (role: string) => void;
}

const roles = [
  { id: 'observer', title: 'Observer (HSE)', desc: 'Record and transmit telemetry.', icon: 'shield-check' },
  { id: 'manager', title: 'Analytics Manager', desc: 'Monitor enterprise performance.', icon: 'bar-chart-3' },
  { id: 'employee', title: 'Site Personnel', desc: 'Manage your safety profile.', icon: 'user' },
  { id: 'followup', title: 'Action Remediation', icon: 'clock', desc: 'Resolve outstanding risks.' },
];

const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
  const [stage, setStage] = useState<'splash' | 'roles' | 'login'>('splash');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Initial Splash Sequence ONLY ONCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('roles');
    }, 2000);
    return () => clearTimeout(timer);
  }, []); // Empty dependency array: only runs once on mount

  // Re-run icon initialization whenever stage changes
  useEffect(() => {
    if ((window as any).lucide) (window as any).lucide.createIcons();
  }, [stage]);

  const handleRoleSelect = (e: React.MouseEvent, roleId: string) => {
    e.preventDefault();
    setSelectedRole(roleId);
    setStage('login');
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(selectedRole || 'observer');
    } else {
      alert("Please provide valid authentication credentials.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-slate-950">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[15s] scale-110"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1516937941344-00b4e0337589?q=80&w=2070&auto=format&fit=crop")',
          filter: 'brightness(0.25) blur(10px)'
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950"></div>

      {stage === 'splash' && (
        <div className="relative z-10 text-center animate-in fade-in zoom-in duration-1000">
          <div className="w-24 h-24 bg-cyan-500/20 border-2 border-cyan-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(34,211,238,0.4)] animate-pulse-premium">
            <i data-lucide="shield-alert" className="w-12 h-12 text-cyan-400"></i>
          </div>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Safety<span className="text-cyan-500">Guard</span></h1>
          <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-[1em] mt-4 ml-4">Authorized Personnel Only</p>
        </div>
      )}

      {stage === 'roles' && (
        <div className="relative z-10 max-w-5xl w-full px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Access <span className="text-cyan-500">Gateway</span></h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Select deployment profile for session start</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role) => (
              <button 
                key={role.id}
                type="button"
                onClick={(e) => handleRoleSelect(e, role.id)}
                className="group relative p-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.8rem] text-left transition-all hover:bg-white/10 hover:border-cyan-500/50 hover:-translate-y-3 active:scale-95 glint-effect"
              >
                <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shadow-xl">
                  <i data-lucide={role.icon} className="w-6 h-6"></i>
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 group-hover:text-cyan-400">{role.title}</h3>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter opacity-80 group-hover:opacity-100">{role.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === 'login' && (
        <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in duration-500">
          <button 
            type="button"
            onClick={() => setStage('roles')}
            className="mb-8 flex items-center gap-3 text-slate-500 hover:text-white transition-colors uppercase text-[9px] font-black tracking-widest group"
          >
            <i data-lucide="chevron-left" className="w-4 h-4 group-hover:-translate-x-1 transition-transform"></i> Return to Roles
          </button>
          
          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl">
            <div className="mb-12">
              <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.5em] block mb-3">Login Verification</span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">Authenticate <span className="text-cyan-500">Personnel</span></h2>
            </div>

            <form onSubmit={handleFinalSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">Personnel Email</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.corp" 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-[1.8rem] px-8 py-5 text-xs font-bold text-white focus:border-cyan-500 outline-none transition-all shadow-inner placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">Encryption Key / ID</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-[1.8rem] px-8 py-5 text-xs font-bold text-white focus:border-cyan-500 outline-none transition-all shadow-inner"
                />
              </div>
              
              <button 
                type="submit"
                className="w-full py-6 bg-cyan-500 text-slate-950 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-[0_15px_35px_rgba(34,211,238,0.25)] hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all mt-6"
              >
                Establish Secure Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPortal;
