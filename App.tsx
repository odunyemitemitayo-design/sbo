
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ObservationForm from './components/ObservationForm';
import ObservationList from './components/ObservationList';
import { Observation, ViewState } from './types';

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

  const handleProgressUpdate = (completedCount: number) => {
    // Total of 8 categories
    const percentage = (completedCount / 8) * 100;
    setFormProgress(percentage);
  };

  return (
    <Layout activeView={view} onViewChange={setView} progress={formProgress}>
      <div className="max-w-4xl mx-auto">
        {view === 'form' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <header className="mb-12 space-y-4">
              <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                Field <span className="text-cyan-500">Report</span>
              </h2>
              <p className="text-slate-500 font-bold max-w-lg leading-relaxed text-sm">
                Real-time safety telemetry acquisition. Document behavioral patterns and site conditions for AI processing.
              </p>
            </header>
            <ObservationForm 
              onSubmit={handleAddObservation} 
              onProgressUpdate={handleProgressUpdate} 
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <ObservationList observations={observations} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
