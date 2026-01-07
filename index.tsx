
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Category, SubCategoryMap, Observation, ViewState, CategoryDisplayNames } from './types';
import { analyzeObservation } from './services/geminiService';
import confetti from 'canvas-confetti';

/** 
 * REFINED CATEGORY ICONS 
 */
const CategoryIcons: Record<string, string> = {
  [Category.BodyPosition]: "accessibility",
  [Category.PeopleReaction]: "users",
  [Category.PPE]: "shield-check",
  [Category.Procedures]: "clipboard-list",
  [Category.ToolsAndEquipment]: "wrench",
  [Category.WorkEnvironment]: "layout",
  [Category.Pollution]: "droplets",
  [Category.FoodSafety]: "utensils",
};

/**
 * REFINED METADATA FOR VISUAL CARDS
 */
const DetailedMetadata: Record<string, { desc: string; icon: string; hint?: string; glowColor?: string }> = {
  "Appropriate for the Task": { desc: "Tool specification vs task requirements", icon: "check-circle" },
  "Selection & Condition": { desc: "Physical integrity and maintenance status", icon: "wrench", hint: "Check for: Current inspection tags, guard safety, proper tool ratings, and maintenance logs." },
  "Correct Application": { desc: "Usage according to standard manufacturer intent", icon: "target" },
  "Workspace Appropriateness": { desc: "Physical area fit for task requirements", icon: "maximize" },
  "Selection & Environmental Condition": { desc: "Lighting, ventilation, and flooring status", icon: "thermometer-snowflake", hint: "Consider: Housekeeping, Lighting, Noise levels, or Trip hazards." },
  "Utilization of Space": { desc: "Layout efficiency and safe flow", icon: "grid-3x3" },
  "Air Quality": { desc: "Emissions, dust, or vapors", icon: "wind" },
  "Land & Soil Integrity": { desc: "Spills or ground contamination", icon: "mountain" },
  "Water Protection": { desc: "Runoff or drainage integrity", icon: "droplet" }
};

/**
 * MAIN APP CONTAINER
 */
const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('form');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('safety_observations');
    if (saved) {
      try {
        setObservations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load observations", e);
      }
    }
  }, []);

  const handleAddObservation = (newObs: Observation) => {
    const updated = [newObs, ...observations];
    setObservations(updated);
    localStorage.setItem('safety_observations', JSON.stringify(updated));
    setView('history');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout activeView={view} onViewChange={setView} progress={formProgress}>
      {view === 'form' ? (
        <ObservationForm 
          onSubmit={handleAddObservation} 
          onProgressUpdate={setFormProgress} 
        />
      ) : (
        <ObservationList observations={observations} />
      )}
    </Layout>
  );
};

/**
 * LAYOUT SHELL
 */
const Layout: React.FC<{ children: React.ReactNode, activeView: ViewState, onViewChange: (v: ViewState) => void, progress: number }> = ({ children, activeView, onViewChange, progress }) => {
  useEffect(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); }, [activeView]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 font-sans antialiased overflow-x-hidden transition-colors duration-500">
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-slate-900">
        <div className="h-full bg-gradient-to-r from-indigo-600 via-cyan-500 to-teal-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${progress}%` }}></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-[60] bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/50 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center relative shadow-xl">
              <i data-lucide="shield-alert" className="w-5 h-5 text-cyan-400"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Safety<span className="text-cyan-500">Guard</span></h1>
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1 block">Behavioral Analysis</span>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center bg-slate-900/40 p-1 rounded-2xl border border-slate-800/60 backdrop-blur-md">
            <button onClick={() => onViewChange('form')} className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'form' ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-slate-200'}`}>Log Session</button>
            <button onClick={() => onViewChange('history')} className={`px-7 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105' : 'text-slate-500 hover:text-slate-200'}`}>The Vault</button>
          </nav>
        </div>
      </header>

      <main className="pt-28 pb-40 px-6 max-w-5xl mx-auto print:pt-0 print:pb-0">
        {children}
      </main>

      <div className="sm:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-full p-2 flex gap-2 shadow-2xl scale-110 print:hidden">
        <button onClick={() => onViewChange('form')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'form' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}>LOG</button>
        <button onClick={() => onViewChange('history')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'history' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}>VAULT</button>
      </div>
    </div>
  );
};

/**
 * FORM COMPONENT
 */
const ObservationForm: React.FC<{ onSubmit: (o: Observation) => void, onProgressUpdate: (n: number) => void }> = ({ onSubmit, onProgressUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.BodyPosition);
  const [globalObserver, setGlobalObserver] = useState('');
  const [globalLocation, setGlobalLocation] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [isFocused, setIsFocused] = useState(false);
  const [catStates, setCatStates] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    Object.values(Category).forEach(c => {
      initial[c as string] = { subCategory: '', comments: '', isSafe: true, isImmediateRisk: false, correctiveAction: '' };
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const commentAreaRef = useRef<HTMLTextAreaElement>(null);
  const current = catStates[activeCategory as string];

  const isComplete = (cat: string) => {
    const s = catStates[cat];
    return s && s.subCategory && s.comments.trim().length > 3;
  };

  useEffect(() => {
    const count = Object.values(Category).filter(cat => isComplete(cat as string)).length;
    onProgressUpdate((count / 8) * 100);
  }, [catStates]);

  useEffect(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); }, [activeCategory, current.subCategory]);

  const updateState = (updates: any) => {
    setCatStates(prev => ({ ...prev, [activeCategory as string]: { ...prev[activeCategory as string], ...updates } }));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.subCategory || !current.comments.trim()) return alert("Current entry is incomplete.");
    if (!globalObserver || !globalLocation) return alert("Missing metadata.");

    setIsSubmitting(true);
    const report: Observation = {
      id: crypto.randomUUID(),
      category: activeCategory,
      subCategory: current.subCategory,
      location: globalLocation,
      observerName: globalObserver,
      dateTime,
      isSafe: current.isSafe,
      isImmediateRisk: current.isImmediateRisk,
      comments: current.comments,
      correctiveAction: current.correctiveAction,
    };

    try {
      const analysis = await analyzeObservation(report);
      report.aiAnalysis = analysis.analysis;
      report.severity = analysis.severity;
      setIsSuccess(true);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        onSubmit(report);
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 2000);
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return <div className="py-20 flex flex-col items-center justify-center animate-checkmark"><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Transmission Successful</h2></div>;

  const isWorkEnv = activeCategory === Category.WorkEnvironment;
  const isToolsEnv = activeCategory === Category.ToolsAndEquipment;
  const isSafe = current.isSafe;

  return (
    <div className={`space-y-12 transition-all duration-700 ${isSafe ? '' : 'ring-rose-500/10 ring-[32px] rounded-[3rem]'}`}>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.values(Category).map((cat) => (
          <button key={cat as string} type="button" onClick={() => setActiveCategory(cat as Category)} className={`relative p-5 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 active:scale-95 ${activeCategory === cat ? 'bg-slate-900 border-cyan-500 shadow-xl' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'}`}>
            <div className={`p-3 rounded-xl ${activeCategory === cat ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              <i data-lucide={CategoryIcons[cat as string]} className="w-5 h-5"></i>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${activeCategory === cat ? 'text-white' : 'text-slate-600'}`}>{cat as string}</span>
          </button>
        ))}
      </section>

      <form onSubmit={handleFinalSubmit} className="space-y-12">
        <div className="p-8 sm:p-12 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Deployment Config</h3>
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <button type="button" onClick={() => updateState({ isSafe: true })} className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSafe ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-600'}`}>Safe</button>
              <button type="button" onClick={() => updateState({ isSafe: false })} className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isSafe ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600'}`}>Unsafe</button>
            </div>
          </div>

          <div className={`grid gap-6 transition-all duration-700 ${isWorkEnv ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {SubCategoryMap[activeCategory].map((sub) => (
              <button key={sub} type="button" onClick={() => updateState({ subCategory: sub })} className={`relative text-left p-6 rounded-[1.8rem] border-2 transition-all duration-500 flex items-center gap-7 group ${current.subCategory === sub ? (isSafe ? 'bg-cyan-500/10 border-cyan-500 shadow-lg' : 'bg-rose-500/10 border-rose-500 shadow-lg') : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
                <div className={`p-4 rounded-2xl transition-all ${current.subCategory === sub ? (isSafe ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500 text-white') : 'bg-slate-900 text-slate-700'}`}>
                  <i data-lucide={DetailedMetadata[sub]?.icon || "circle-dot"} className="w-6 h-6"></i>
                </div>
                <div className="space-y-1">
                  <span className={`text-[12px] font-black uppercase tracking-widest block ${current.subCategory === sub ? 'text-white' : 'text-slate-500'}`}>{sub}</span>
                  {DetailedMetadata[sub] && <p className="text-[10px] font-medium text-slate-600 leading-relaxed">{DetailedMetadata[sub].desc}</p>}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-800/50 space-y-8">
            <div className="relative group">
              <textarea
                ref={commentAreaRef}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Narrative field notes..."
                value={current.comments}
                onChange={(e) => updateState({ comments: e.target.value })}
                className={`w-full backdrop-blur-md transition-all duration-500 h-40 p-8 text-sm font-bold text-white focus:outline-none rounded-[2.8rem] border-[1.5px] ${isWorkEnv || isToolsEnv ? 'bg-white/[0.03] border-white/10 focus:border-cyan-500 ring-4 ring-cyan-500/5' : 'bg-slate-950 border-slate-800 focus:border-cyan-500'}`}
              />
              {(isWorkEnv || isToolsEnv) && (
                <div className={`mt-3 px-6 transition-all transform ${isFocused ? 'opacity-100 translate-y-0' : 'opacity-40 -translate-y-1'}`}>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                    {isWorkEnv 
                      ? "Consider: Housekeeping, Lighting, Noise levels, or Trip hazards."
                      : "Check for: Current inspection tags, guard safety, proper tool ratings, and maintenance logs."}
                  </p>
                </div>
              )}
            </div>
            {!isSafe && <textarea placeholder="Immediate Remediation Plan..." value={current.correctiveAction} onChange={(e) => updateState({ correctiveAction: e.target.value })} className="w-full bg-slate-950 border-rose-500/50 rounded-[2.2rem] p-6 text-sm font-bold text-white focus:border-rose-500 outline-none h-24" />}
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <input type="text" placeholder="Observer ID" value={globalObserver} onChange={e => setGlobalObserver(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none" />
            <input type="text" placeholder="Deployment Zone" value={globalLocation} onChange={e => setGlobalLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none" />
          </div>
          <button type="submit" disabled={isSubmitting} className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 shadow-cyan-500/20 shadow-lg'}`}>
            {isSubmitting ? 'Processing Telemetry...' : 'Transmit Report'}
          </button>
        </section>
      </form>
    </div>
  );
};

/**
 * LIST COMPONENT
 */
const ObservationList: React.FC<{ observations: Observation[] }> = ({ observations }) => {
  useEffect(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); }, [observations]);
  if (observations.length === 0) return <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-700 font-black uppercase tracking-widest text-[10px]">Registry Empty</div>;

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-slate-900 pb-8 print:border-slate-300">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none print:text-slate-950">The <span className="text-cyan-500">Vault</span></h2>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mt-2 print:text-slate-400">Certified Observation Logs</p>
        </div>
        <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-white text-[10px] font-black hover:bg-slate-800 active:scale-95 print:hidden"><i data-lucide="printer" className="w-3 h-3"></i> GENERATE FINAL REPORT</button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {observations.map((obs) => (
          <div key={obs.id} className="bg-white text-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-100 print:shadow-none print:border-slate-300 print:break-inside-avoid">
            <div className={`md:w-16 flex md:flex-col items-center justify-center p-4 ${obs.isSafe ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-0 md:-rotate-90 whitespace-nowrap text-slate-950 print:hidden">{obs.isSafe ? 'SAFE' : 'RISK'}</span>
            </div>
            <div className="flex-1 p-8 md:p-12 space-y-6 flex flex-col">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-2xl font-black uppercase tracking-tighter leading-none">{obs.subCategory}</h4>
                  <p className="text-cyan-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">{CategoryDisplayNames[obs.category]}</p>
                </div>
                <p className="text-xs font-bold font-mono text-slate-400">#{obs.id.split('-')[0].toUpperCase()}</p>
              </div>
              <p className="text-lg font-serif italic font-bold text-slate-800">"{obs.comments}"</p>
              {obs.aiAnalysis && <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border-l-4 border-cyan-500 print:bg-slate-50 print:text-black print:border-slate-300 shadow-xl text-sm leading-relaxed opacity-90 italic">"{obs.aiAnalysis}"</div>}
              <div className="mt-auto flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest pt-4 border-t border-slate-100">
                <span>By: {obs.observerName} @ {obs.location}</span>
                <span>{new Date(obs.dateTime).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
