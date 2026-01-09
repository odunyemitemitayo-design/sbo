
import React, { useState, useEffect } from 'react';
import { Category, SubCategoryMap, Observation } from '../types';
import { analyzeObservation } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface ObservationFormProps {
  onSubmit: (observation: Observation) => void;
  onProgressUpdate?: (completedCount: number) => void;
}

interface CategoryData {
  subCategory: string;
  comments: string;
  isSafe: boolean;
  isImmediateRisk: boolean;
  correctiveAction?: string;
  imageUrl?: string;
}

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

const DetailedMetadata: Record<string, { desc: string; icon: string; hint?: string; glowColor?: string }> = {
  "Appropriate for the Task": { desc: "Tool specification vs task requirements", icon: "check-circle" },
  "Selection & Condition": { desc: "Physical tool integrity and maintenance status", icon: "wrench" },
  "Correct Application": { desc: "Usage according to standard manufacturer intent", icon: "target" },
  "Workspace Appropriateness": { desc: "Physical area fit for task requirements", icon: "maximize" },
  "Selection & Environmental Condition": { desc: "Lighting, ventilation, and flooring status", icon: "thermometer-snowflake" },
  "Utilization of Space": { desc: "Layout efficiency and safe flow", icon: "grid-3x3" },
  "Air Quality": { desc: "Emissions, dust, or vapors", icon: "wind" },
  "Land & Soil Integrity": { desc: "Spills or ground contamination", icon: "mountain" },
  "Water Protection": { desc: "Runoff or drainage integrity", icon: "droplet" }
};

const ObservationForm: React.FC<ObservationFormProps> = ({ onSubmit, onProgressUpdate }) => {
  const [activeCategory, setActiveCategory] = useState<Category>(Category.BodyPosition);
  const [globalObserver, setGlobalObserver] = useState('');
  const [globalLocation, setGlobalLocation] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  
  const [catStates, setCatStates] = useState<Record<string, CategoryData>>(() => {
    const initial: Record<string, CategoryData> = {};
    Object.values(Category).forEach(c => {
      initial[c as string] = { subCategory: '', comments: '', isSafe: true, isImmediateRisk: false, correctiveAction: '' };
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const current = catStates[activeCategory as string];

  const isComplete = (cat: string) => {
    const s = catStates[cat];
    return s && s.subCategory && s.comments.trim().length > 3;
  };

  useEffect(() => {
    if ((window as any).lucide) (window as any).lucide.createIcons();
  }, [activeCategory, current.subCategory]);

  useEffect(() => {
    const completedCount = Object.values(Category).filter(cat => isComplete(cat as string)).length;
    onProgressUpdate?.(completedCount);
  }, [catStates]);

  const updateState = (updates: Partial<CategoryData>) => {
    setCatStates(prev => ({
      ...prev,
      [activeCategory as string]: { ...prev[activeCategory as string], ...updates }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current.subCategory || !current.comments.trim()) {
      alert("Current telemetry entry is incomplete.");
      return;
    }
    if (!globalObserver || !globalLocation) {
      alert("Observer and Location identifiers are required.");
      return;
    }

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
      imageUrl: current.imageUrl,
      status: current.isSafe ? 'completed' : 'pending' // Correctly set initial status
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

  if (isSuccess) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center animate-checkmark">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
          <i data-lucide="check" className="w-10 h-10 text-slate-950 stroke-[3px]"></i>
        </div>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Transmission Successful</h2>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.values(Category).map((cat) => {
          const isActive = activeCategory === (cat as Category);
          const completed = isComplete(cat as string);
          return (
            <button
              key={cat as string}
              type="button"
              onClick={() => setActiveCategory(cat as Category)}
              className={`relative p-5 rounded-[2rem] border-2 transition-all duration-500 flex flex-col items-center gap-3 active:scale-95 ${
                isActive ? 'bg-slate-900 border-cyan-500 shadow-xl' : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {completed && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></div>}
              <div className={`p-3 rounded-xl ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
                <i data-lucide={CategoryIcons[cat as string]} className="w-5 h-5"></i>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${isActive ? 'text-white' : 'text-slate-600'}`}>{cat as string}</span>
            </button>
          );
        })}
      </section>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="p-8 sm:p-12 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Telemetry Config</h3>
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 w-full sm:w-auto">
              <button type="button" onClick={() => updateState({ isSafe: true })} className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${current.isSafe ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-600'}`}>Safe</button>
              <button type="button" onClick={() => updateState({ isSafe: false })} className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!current.isSafe ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-600'}`}>Unsafe</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {SubCategoryMap[activeCategory].map((sub) => {
              const isSelected = current.subCategory === sub;
              const meta = DetailedMetadata[sub];
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => updateState({ subCategory: sub })}
                  className={`relative text-left p-6 rounded-[1.8rem] border-2 transition-all duration-500 flex items-center gap-7 group ${
                    isSelected ? (current.isSafe ? 'bg-cyan-500/10 border-cyan-500 shadow-lg' : 'bg-rose-500/10 border-rose-500 shadow-lg') : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className={`p-4 rounded-2xl ${isSelected ? (current.isSafe ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500 text-white') : 'bg-slate-900 text-slate-700'}`}>
                    <i data-lucide={meta?.icon || "circle-dot"} className="w-6 h-6"></i>
                  </div>
                  <div className="space-y-1">
                    <span className={`text-[12px] font-black uppercase tracking-widest block ${isSelected ? 'text-white' : 'text-slate-500'}`}>{sub}</span>
                    {meta && <p className="text-[10px] font-medium text-slate-600 leading-relaxed">{meta.desc}</p>}
                  </div>
                </button>
              );
            })}
          </div>

          <div className={`transition-all duration-700 ${current.subCategory ? 'opacity-100' : 'opacity-0 h-0 pointer-events-none'}`}>
            <div className="pt-8 border-t border-slate-800/50 space-y-8">
              <textarea
                placeholder="Professional field narrative..."
                value={current.comments}
                onChange={(e) => updateState({ comments: e.target.value })}
                className={`w-full bg-slate-950 border border-slate-800 rounded-[2.8rem] p-8 text-sm font-bold text-white focus:outline-none focus:border-cyan-500 ring-4 ring-cyan-500/5 transition-all h-40 resize-none`}
              />
              {!current.isSafe && <textarea placeholder="Remediation Actions..." value={current.correctiveAction || ''} onChange={(e) => updateState({ correctiveAction: e.target.value })} className="w-full bg-slate-950 border-rose-500/50 rounded-[2.2rem] p-6 text-sm font-bold text-white focus:border-rose-500 outline-none h-24" />}
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <input type="text" placeholder="Personnel ID" value={globalObserver} onChange={e => setGlobalObserver(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none" />
            <input type="text" placeholder="Deployment Zone" value={globalLocation} onChange={e => setGlobalLocation(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-cyan-500 outline-none" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95 shadow-cyan-500/20 shadow-lg transition-all">
            {isSubmitting ? 'Processing Telemetry...' : 'Transmit Audit'}
          </button>
        </section>
      </form>
    </div>
  );
};

export default ObservationForm;
