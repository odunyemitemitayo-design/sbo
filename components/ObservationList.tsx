
import React, { useEffect } from 'react';
import { Observation, Category, CategoryDisplayNames } from '../types';

interface ObservationListProps {
  observations: Observation[];
}

const ObservationList: React.FC<ObservationListProps> = ({ observations }) => {
  useEffect(() => {
    if ((window as any).lucide) (window as any).lucide.createIcons();
  }, [observations]);

  const handleExport = () => {
    window.print();
  };

  if (observations.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-700">
        <i data-lucide="database" className="w-12 h-12 mb-4"></i>
        <span className="text-[10px] font-black uppercase tracking-widest">Audit Registry Empty</span>
      </div>
    );
  }

  const groupedObservations = observations.reduce((acc, obs) => {
    const header = CategoryDisplayNames[obs.category];
    if (!acc[header]) acc[header] = [];
    acc[header].push(obs);
    return acc;
  }, {} as Record<string, Observation[]>);

  return (
    <div className="space-y-16 animate-in fade-in duration-700 print:bg-white print:text-black">
      <div className="flex justify-between items-end border-b border-slate-900 pb-8 print:border-slate-200">
        <div className="print:text-black">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none print:text-black">
            The <span className="text-cyan-500 print:text-cyan-600">Vault</span>
          </h2>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] mt-2">Certified Observation Logs</p>
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={handleExport}
            className="hidden sm:flex items-center gap-2 px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-white text-[10px] font-black tracking-widest hover:bg-slate-800 transition-all active:scale-95 print:hidden"
          >
            <i data-lucide="printer" className="w-3 h-3"></i>
            EXPORT REPORT
          </button>
          <div className="px-5 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-black tracking-widest print:border-slate-300 print:text-slate-600">
            {observations.length} ENTRIES
          </div>
        </div>
      </div>

      <div className="space-y-20">
        {Object.entries(groupedObservations).map(([header, items]) => (
          <section key={header} className="space-y-10">
            <div className="flex items-center gap-6">
              <h3 className={`text-sm font-black uppercase tracking-[0.6em] whitespace-nowrap transition-colors duration-500 ${header === "Food Quality & Safety Audit" ? 'text-cyan-400' : (header === "Workplace Environmental Assessment" ? 'text-[#D2C6B8]' : 'text-cyan-500')} print:text-cyan-700`}>
                {header}
              </h3>
              <div className="h-[1px] w-full bg-slate-900 print:bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-12">
              {(items as Observation[]).map((obs) => (
                <div key={obs.id} className="bg-white text-slate-950 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px] border border-slate-100 print:shadow-none print:border-slate-200 print:break-inside-avoid">
                  <div className={`md:w-16 flex md:flex-col items-center justify-center p-4 transition-colors ${obs.status === 'completed' ? 'bg-emerald-500' : (obs.status === 'in-progress' ? 'bg-amber-500' : 'bg-rose-500')} print:w-4`}>
                    <div className="text-slate-950 flex flex-col items-center gap-2">
                       {obs.status === 'completed' ? (
                         <i data-lucide="check-circle-2" className="w-6 h-6 stroke-[3px]"></i>
                       ) : (
                         <i data-lucide={obs.status === 'in-progress' ? "clock" : "alert-triangle"} className="w-6 h-6 stroke-[3px]"></i>
                       )}
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-0 md:-rotate-90 whitespace-nowrap print:hidden mt-4">
                         {obs.status === 'completed' ? 'Closed-Out' : (obs.status === 'in-progress' ? 'Active Action' : 'Pending')}
                       </span>
                    </div>
                  </div>

                  <div className="flex-1 p-8 md:p-12 space-y-8 flex flex-col relative">
                    {obs.isImmediateRisk && obs.status !== 'completed' && (
                      <div className="absolute top-4 right-8 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse-premium print:hidden">
                        Immediate Hazard Detected
                      </div>
                    )}

                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
                      <div>
                        <h4 className="text-3xl font-black uppercase tracking-tighter leading-none print:text-2xl">{obs.subCategory}</h4>
                        <p className="text-cyan-600 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 italic">{header}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incident Ref</p>
                        <p className="text-xs font-bold font-mono">#{obs.id.split('-')[0].toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className={`p-6 rounded-2xl border transition-all ${obs.isImmediateRisk && obs.status !== 'completed' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'} print:bg-transparent print:border-slate-200`}>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Narrative Context</span>
                          <p className={`text-lg font-serif italic leading-relaxed font-bold print:text-base ${obs.isImmediateRisk && obs.status !== 'completed' ? 'text-rose-900' : 'text-slate-800'}`}>"{obs.comments}"</p>
                        </div>
                        
                        {(obs.correctiveAction || obs.remediationNotes) && (
                          <div className="space-y-4">
                             {obs.correctiveAction && (
                                <div className="bg-emerald-50/50 p-6 rounded-2xl border-l-4 border-emerald-500 print:border-slate-400">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">Immediate Field Mitigation</span>
                                  <p className="text-sm font-bold text-slate-700 italic">"{obs.correctiveAction}"</p>
                                </div>
                             )}
                             {obs.remediationNotes && (
                                <div className="bg-cyan-50 p-6 rounded-2xl border-l-4 border-cyan-600 print:border-slate-400">
                                  <span className="text-[8px] font-black text-cyan-600 uppercase tracking-widest block mb-2">Final Remediation Strategy</span>
                                  <p className="text-sm font-black text-slate-800 italic">"{obs.remediationNotes}"</p>
                                  <div className="mt-3 flex justify-between items-center">
                                    <p className="text-[8px] uppercase font-black text-cyan-700">Closed By: {obs.assignedTo}</p>
                                    {obs.completedAt && (
                                      <p className="text-[8px] font-black text-slate-400 uppercase">Resolved: {new Date(obs.completedAt).toLocaleDateString()}</p>
                                    )}
                                  </div>
                                </div>
                             )}
                          </div>
                        )}

                        {obs.aiAnalysis && (
                          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border-l-4 border-cyan-500 print:bg-slate-50 print:text-black print:border-slate-300 shadow-xl">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse print:bg-cyan-600"></div>
                              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Corporate Intelligence Insight</span>
                            </div>
                            <p className="text-sm leading-relaxed opacity-90">{obs.aiAnalysis}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        {obs.imageUrl && (
                          <div className="rounded-[2rem] overflow-hidden border-2 border-slate-100 aspect-video shadow-inner print:max-h-48 print:rounded-xl">
                            <img src={obs.imageUrl} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-xl print:border print:border-slate-200">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Authorized Observer</span>
                            <p className="text-xs font-black uppercase tracking-tight italic">{obs.observerName}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl print:border print:border-slate-200">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Deployment Location</span>
                            <p className="text-xs font-black uppercase tracking-tight italic">{obs.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <span>Log Generated: {new Date(obs.dateTime).toLocaleString()}</span>
                      <span className="text-slate-200 tracking-[0.5em] print:text-slate-300">SAFETYGUARD INTELLIGENCE REPORT</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ObservationList;
