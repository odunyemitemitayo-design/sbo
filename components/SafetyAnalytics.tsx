
import React, { useEffect, useRef, useState } from 'react';
import { Observation } from '../types';

interface SafetyAnalyticsProps {
  observations: Observation[];
  employeeDirectory: string[];
}

const SafetyAnalytics: React.FC<SafetyAnalyticsProps> = ({ observations, employeeDirectory }) => {
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLCanvasElement>(null);
  const donutChart = useRef<any>(null);
  const barChart = useRef<any>(null);

  const [showNonSubmitters, setShowNonSubmitters] = useState(false);

  // Logic to identify today's submitters and non-submitters
  const today = new Date().toISOString().split('T')[0];
  const todayObservers = new Set(
    observations
      .filter(o => o.dateTime.startsWith(today))
      .map(o => o.observerName)
  );

  const nonSubmitters = employeeDirectory.filter(name => !todayObservers.has(name));
  const submittedCount = todayObservers.size;
  const totalCount = employeeDirectory.length;

  useEffect(() => {
    // Cleanup existing charts on re-render
    if (donutChart.current) donutChart.current.destroy();
    if (barChart.current) barChart.current.destroy();

    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;

    // Logic for Donut Chart (Submission Overview)
    if (donutRef.current) {
      donutChart.current = new ChartJS(donutRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Submitted', 'Pending Entry'],
          datasets: [{
            data: [submittedCount, nonSubmitters.length],
            backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(148, 163, 184, 0.1)'],
            borderColor: ['rgba(16, 185, 129, 1)', 'rgba(148, 163, 184, 0.2)'],
            borderWidth: 2,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '80%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94a3b8',
                font: { size: 10, weight: 'bold', family: 'Inter' },
                padding: 20,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleFont: { size: 12, family: 'Inter' },
              bodyFont: { size: 12, family: 'Inter' },
              padding: 12,
              displayColors: false
            }
          }
        }
      });
    }

    // Logic for Bar Chart (Action Status)
    const openActions = observations.filter(o => !o.isSafe && o.status !== 'completed').length;
    const completedActions = observations.filter(o => !o.isSafe && o.status === 'completed').length;

    if (barRef.current) {
      barChart.current = new ChartJS(barRef.current, {
        type: 'bar',
        data: {
          labels: ['Open Actions', 'Completed'],
          datasets: [{
            label: 'Incident Resolution Status',
            data: [openActions, completedActions],
            backgroundColor: ['rgba(245, 158, 11, 0.8)', 'rgba(20, 184, 166, 0.8)'],
            borderRadius: 12,
            maxBarThickness: 40
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 12
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold', family: 'Inter' } }
            }
          }
        }
      });
    }
  }, [observations, employeeDirectory]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Donut */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center group">
          <header className="w-full mb-6 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Daily Audit Compliance</p>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Submission <span className="text-emerald-500">Overview</span></h4>
             </div>
             <i data-lucide="users" className="w-5 h-5 text-slate-700"></i>
          </header>
          <div className="relative w-full h-64 flex items-center justify-center">
             <canvas ref={donutRef}></canvas>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white leading-none">
                  {submittedCount}/{totalCount}
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Personnel</span>
             </div>
          </div>
          
          <button 
            onClick={() => setShowNonSubmitters(!showNonSubmitters)}
            className="mt-6 px-6 py-2 bg-slate-950 border border-slate-800 rounded-full text-[9px] font-black text-cyan-500 uppercase tracking-widest hover:border-cyan-500/40 transition-all active:scale-95"
          >
            {showNonSubmitters ? 'Hide Details' : 'View Non-Submitters'}
          </button>
        </div>

        {/* Chart 2: Bar */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
          <header className="w-full mb-6 flex justify-between items-center">
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Resolution Health</p>
                <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Action <span className="text-amber-500">Remediation</span> Status</h4>
             </div>
             <i data-lucide="activity" className="w-5 h-5 text-slate-700"></i>
          </header>
          <div className="w-full h-64">
             <canvas ref={barRef}></canvas>
          </div>
        </div>
      </div>

      {/* Elegant Non-Submitter List (Expansion) */}
      {showNonSubmitters && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
           <header className="mb-8 flex justify-between items-center">
              <div className="space-y-2">
                 <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Accountability <span className="text-cyan-500">Audit</span></h4>
                 <p className="text-slate-500 text-[10px] font-medium leading-relaxed uppercase tracking-widest italic">The following personnel have not yet synchronized field telemetry for {today}.</p>
              </div>
              <div className="px-5 py-2 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400">
                {nonSubmitters.length} PENDING
              </div>
           </header>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonSubmitters.map((name, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-cyan-500/20 transition-all">
                   <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-600 group-hover:text-cyan-500 transition-colors">
                      {i + 1}
                   </div>
                   <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
                </div>
              ))}
              {nonSubmitters.length === 0 && (
                <div className="col-span-full py-12 text-center">
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <i data-lucide="check" className="w-5 h-5 text-emerald-500"></i>
                   </div>
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">100% Submission Target Achieved</p>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default SafetyAnalytics;
