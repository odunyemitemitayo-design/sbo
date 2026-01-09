
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Layout from './components/Layout';
import ObservationForm from './components/ObservationForm';
import ObservationList from './components/ObservationList';
import SafetyAnalytics from './components/SafetyAnalytics';
import LoginPortal from './components/LoginPortal';
import { Observation, ViewState, Category } from './types';
import { storage, StorageKeys } from './services/storageService';

const EMPLOYEE_DIRECTORY = [
  "Sarah Jenkins (Safety Lead)",
  "Marcus Vane (Plant Manager)",
  "Elena Rodriguez (QA Director)",
  "David Chen (Ops Supervisor)",
  "Alex Rivera (Technician)",
  "Jordan Smith (Logistics)",
  "Taylor Wong (Quality Control)",
  "Morgan Freeman (Maintenance)",
  "Casey Jones (Warehouse)",
  "Riley Cooper (HSE Officer)"
];

const MOCK_DATA: Observation[] = [
  {
    id: 'seed-1',
    category: Category.BodyPosition,
    subCategory: 'Line of Fire',
    location: 'Warehouse A-Zone',
    observerName: 'Riley Cooper (HSE Officer)',
    dateTime: new Date().toISOString(), // Setting to now for analytics demo
    isSafe: false,
    status: 'pending',
    comments: 'Worker positioned directly behind forklift during reversing maneuver.',
    aiAnalysis: 'High-risk spatial awareness breach detected. Immediate exclusion zone enforcement required.',
    severity: 'high'
  },
  {
    id: 'seed-2',
    category: Category.PPE,
    subCategory: 'Eye/Face Shields',
    location: 'Welding Bay 4',
    observerName: 'Taylor Wong (Quality Control)',
    dateTime: new Date().toISOString(),
    isSafe: true,
    status: 'completed',
    comments: 'All personnel strictly adhering to secondary shield protocols.',
    aiAnalysis: 'Compliant protective posture maintained. Zero deviations observed.',
    severity: 'low'
  },
  {
    id: 'seed-3',
    category: Category.Procedures,
    subCategory: 'LOTO / Energy Isolation',
    location: 'Turbine Hall 2',
    observerName: 'Sarah Jenkins (Safety Lead)',
    dateTime: new Date(Date.now() - 172800000).toISOString(),
    isSafe: false,
    status: 'in-progress',
    assignedTo: 'Sarah Jenkins (Safety Lead)',
    dueDate: '2025-06-15',
    comments: 'Isolation tag missing from breaker B-12 during maintenance cycle.',
    aiAnalysis: 'Critical procedural failure. Energy isolation protocols compromised.',
    severity: 'high'
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedToken = storage.get<string | null>(StorageKeys.AUTH_TOKEN, null);
    const savedRole = storage.get<string | null>(StorageKeys.USER_ROLE, null);
    return !!(savedToken && savedRole);
  });

  const [userRole, setUserRole] = useState<string | null>(() => 
    storage.get<string | null>(StorageKeys.USER_ROLE, null)
  );

  const [view, setView] = useState<ViewState | 'dashboard' | 'actions' | 'profile' | 'admin'>(() => {
    const savedRole = storage.get<string | null>(StorageKeys.USER_ROLE, null);
    if (savedRole === 'manager') return 'dashboard';
    if (savedRole === 'followup') return 'actions';
    if (savedRole === 'admin' || savedRole === 'employee') return 'admin';
    return 'form';
  });

  const [observations, setObservations] = useState<Observation[]>([]);
  const [formProgress, setFormProgress] = useState(0);
  
  const [assigningObs, setAssigningObs] = useState<Observation | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [remediationTexts, setRemediationTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedObs = storage.get<Observation[]>(StorageKeys.OBSERVATIONS, []);
    if (savedObs.length > 0) {
      setObservations(savedObs);
    } else {
      setObservations(MOCK_DATA);
      storage.set(StorageKeys.OBSERVATIONS, MOCK_DATA);
    }
  }, []);

  // TASK UPDATE: Assign Task
  const assignTask = (reportId: string, personName: string, dateLimit: string) => {
    const updated = observations.map(obs => 
      obs.id === reportId 
        ? { ...obs, assignedTo: personName, dueDate: dateLimit, status: 'in-progress' as const } 
        : obs
    );
    setObservations(updated);
    storage.set(StorageKeys.OBSERVATIONS, updated);
  };

  // TASK UPDATE: Complete Task
  const completeTask = (reportId: string, notes: string) => {
    const updated = observations.map(obs => 
      obs.id === reportId 
        ? { 
            ...obs, 
            isSafe: true, 
            status: 'completed' as const, 
            remediationNotes: notes, 
            completedAt: new Date().toISOString(),
            aiAnalysis: (obs.aiAnalysis || '') + " [REMEDIATION VERIFIED]" 
          } 
        : obs
    );
    setObservations(updated);
    storage.set(StorageKeys.OBSERVATIONS, updated);
  };

  const handleLogin = (role: string) => {
    const mockToken = `sg_session_${crypto.randomUUID()}`;
    storage.set(StorageKeys.AUTH_TOKEN, mockToken);
    storage.set(StorageKeys.USER_ROLE, role);
    setIsAuthenticated(true);
    setUserRole(role);
    if (role === 'manager') setView('dashboard');
    else if (role === 'followup') setView('actions');
    else if (role === 'admin' || role === 'employee') setView('admin');
    else setView('form');
  };

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    storage.clearSession();
    setIsAuthenticated(false);
    setUserRole(null);
    setView('form');
  };

  const handleAddObservation = (newObs: Observation) => {
    const updated = [newObs, ...observations];
    setObservations(updated);
    storage.set(StorageKeys.OBSERVATIONS, updated);
    setView('history');
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningObs || !assignTo || !dueDate) return;
    assignTask(assigningObs.id, assignTo, dueDate);
    setAssigningObs(null);
    setAssignTo('');
    setDueDate('');
  };

  const handleCompleteAction = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const notes = remediationTexts[id] || "No additional notes provided.";
    completeTask(id, notes);
  };

  if (!isAuthenticated) return <LoginPortal onLogin={handleLogin} />;

  const getStatusBadge = (obs: Observation) => {
    if (obs.status === 'completed') return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">Completed</span>;
    if (obs.status === 'in-progress') return <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">In Progress</span>;
    return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">Pending Assignment</span>;
  };

  return (
    <Layout 
      activeView={view as any} 
      onViewChange={setView as any} 
      progress={formProgress}
      userRole={userRole || ''}
      onLogout={handleLogout}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {view === 'form' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Behavioral <span className="text-cyan-500">Telemetry</span></h2>
            <ObservationForm onSubmit={handleAddObservation} onProgressUpdate={(c) => setFormProgress((c/8)*100)} />
          </div>
        )}

        {view === 'actions' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">My <span className="text-amber-500">Remediation Tasks</span></h2>
               <div className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
                 Active Assignments: {observations.filter(o => o.status === 'in-progress').length}
               </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
               {observations.filter(o => o.status === 'in-progress').map(o => (
                 <div key={o.id} className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl space-y-8 group transition-all hover:border-amber-500/30">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-amber-500 text-slate-950 text-[8px] font-black uppercase rounded-full tracking-widest">In Remediation</span>
                           <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{o.location} • Ref: #{o.id.split('-')[0].toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{o.subCategory}</h3>
                        <p className="text-slate-400 text-sm italic font-serif leading-relaxed">"{o.comments}"</p>
                      </div>
                      <div className="text-right flex flex-col justify-center">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Target Deadline</span>
                         <span className="text-amber-400 font-black text-lg">{o.dueDate}</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-800 space-y-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Action Taken Details</label>
                          <textarea 
                            value={remediationTexts[o.id] || ""}
                            onChange={(e) => setRemediationTexts(prev => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder="Describe the steps taken to resolve this safety deviation..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500 transition-all h-32 resize-none"
                          />
                       </div>

                       <div className="flex justify-end">
                          <button 
                             onClick={(e) => handleCompleteAction(e, o.id)}
                             disabled={!(remediationTexts[o.id] && remediationTexts[o.id].length > 5)}
                             className="bg-emerald-500 disabled:opacity-30 disabled:pointer-events-none text-slate-950 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
                          >
                             Mark as Completed
                          </button>
                       </div>
                    </div>
                 </div>
               ))}

               {observations.filter(o => o.status === 'in-progress').length === 0 && (
                 <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-700 bg-slate-900/20">
                    <i data-lucide="check-circle" className="w-16 h-16 mb-6 opacity-20"></i>
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">No active remediation assignments found</span>
                 </div>
               )}
            </div>
          </div>
        )}

        {view === 'admin' && (
          <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">HSE <span className="text-cyan-500">Admin Dashboard</span></h2>
               <div className="flex gap-4">
                  <div className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    Live Nodes: {observations.length}
                  </div>
               </div>
            </header>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Pending Actions</p>
                <p className="text-6xl font-black text-rose-500 tracking-tighter">{observations.filter(o => o.status === 'pending').length}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">In Remediation</p>
                <p className="text-6xl font-black text-amber-500 tracking-tighter">{observations.filter(o => o.status === 'in-progress').length}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] relative overflow-hidden group">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Site Safety Index</p>
                <p className="text-6xl font-black text-emerald-500 tracking-tighter">
                   {Math.round((observations.filter(o => o.isSafe).length / (observations.length || 1)) * 100)}%
                </p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
              </div>
            </div>

            {/* Safety Analytics Section */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Operational Safety Analytics</h3>
               </div>
               <SafetyAnalytics observations={observations} employeeDirectory={EMPLOYEE_DIRECTORY} />
            </section>

            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Critical Action Items Required</h3>
               </div>
               
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-[11px] font-bold">
                     <thead className="bg-slate-950/50 text-slate-500 uppercase tracking-widest border-b border-slate-800">
                       <tr>
                         <th className="px-8 py-6">Incident</th>
                         <th className="px-8 py-6">Telemetry Context</th>
                         <th className="px-8 py-6">Current Status</th>
                         <th className="px-8 py-6">Responsible Person</th>
                         <th className="px-8 py-6 text-right">Administrative Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                       {observations.filter(o => !o.isSafe && o.status !== 'completed').map(o => (
                         <tr key={o.id} className="hover:bg-slate-800/40 transition-colors group">
                           <td className="px-8 py-6">
                             <p className="text-white uppercase italic">{o.category}</p>
                             <p className="text-slate-500 text-[9px] mt-1">{o.location} • {new Date(o.dateTime).toLocaleDateString()}</p>
                           </td>
                           <td className="px-8 py-6 max-w-xs">
                             <p className="text-slate-300 truncate italic">"{o.comments}"</p>
                           </td>
                           <td className="px-8 py-6">
                             {getStatusBadge(o)}
                           </td>
                           <td className="px-8 py-6">
                             {o.assignedTo ? (
                               <div className="space-y-1">
                                 <p className="text-cyan-400 font-black">{o.assignedTo}</p>
                                 <p className="text-slate-600 text-[9px] uppercase tracking-tighter">Due: {o.dueDate}</p>
                               </div>
                             ) : <span className="text-slate-700 italic">Unassigned</span>}
                           </td>
                           <td className="px-8 py-6 text-right">
                              {o.status === 'pending' ? (
                                <button 
                                  onClick={() => setAssigningObs(o)}
                                  className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-slate-950 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-cyan-500/20 transition-all"
                                >
                                  Assign Responsible Person
                                </button>
                              ) : (
                                <button 
                                  onClick={(e) => handleCompleteAction(e, o.id)}
                                  className="bg-emerald-500 text-slate-950 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
                                >
                                  Mark as Resolved
                                </button>
                              )}
                           </td>
                         </tr>
                       ))}
                       {observations.filter(o => !o.isSafe && o.status !== 'completed').length === 0 && (
                         <tr>
                           <td colSpan={5} className="px-8 py-12 text-center text-slate-600 uppercase tracking-widest italic">
                             All telemetry anomalies resolved
                           </td>
                         </tr>
                       )}
                     </tbody>
                   </table>
                 </div>
               </div>
            </div>

            <div className="pt-8">
               <ObservationList observations={observations.slice(0, 10)} />
            </div>
          </div>
        )}

        {assigningObs && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl relative">
                <button 
                  onClick={() => setAssigningObs(null)}
                  className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                >
                  <i data-lucide="x" className="w-6 h-6"></i>
                </button>
                
                <header className="mb-10 space-y-2">
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.4em]">Resource Allocation</span>
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Assign <span className="text-cyan-500">Remediation</span></h3>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed mt-4">
                    Incident: <span className="text-slate-300">{assigningObs.subCategory}</span> in <span className="text-slate-300">{assigningObs.location}</span>
                  </p>
                </header>

                <form onSubmit={handleAssignSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Responsible Person</label>
                    <select 
                      required
                      value={assignTo}
                      onChange={e => setAssignTo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Personnel...</option>
                      {EMPLOYEE_DIRECTORY.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Completion Date</label>
                    <input 
                      type="date" 
                      required
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none transition-all cursor-pointer"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-5 bg-cyan-500 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all mt-4"
                  >
                    Confirm Assignment
                  </button>
                </form>
             </div>
          </div>
        )}

        {view === 'dashboard' && (
          <div className="space-y-12">
             <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">Enterprise <span className="text-cyan-500">Intelligence</span></h2>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Logs</p>
                   <p className="text-4xl font-black text-white">{observations.length}</p>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Compliant</p>
                   <p className="text-4xl font-black text-emerald-500">{observations.filter(o => o.isSafe).length}</p>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">At Risk</p>
                   <p className="text-4xl font-black text-rose-500">{observations.filter(o => !o.isSafe && o.status !== 'completed').length}</p>
                </div>
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Remediated</p>
                   <p className="text-4xl font-black text-cyan-500">{observations.filter(o => o.status === 'completed' && !o.isSafe).length}</p>
                </div>
             </div>

             {/* Safety Analytics Section */}
             <section className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                   <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Operational Safety Analytics</h3>
                </div>
                <SafetyAnalytics observations={observations} employeeDirectory={EMPLOYEE_DIRECTORY} />
             </section>

             <div className="pt-10">
                <ObservationList observations={observations} />
             </div>
          </div>
        )}

        {view === 'history' && <ObservationList observations={observations} />}
      </div>
    </Layout>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
