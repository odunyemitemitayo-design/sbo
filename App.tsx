
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ObservationForm from './components/ObservationForm';
import ObservationList from './components/ObservationList';
import { Observation, ViewState } from './types';
import { storage, StorageKeys } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('form');
  const [observations, setObservations] = useState<Observation[]>([]);
  const [formProgress, setFormProgress] = useState(0);

  useEffect(() => {
    const saved = storage.get<Observation[]>(StorageKeys.OBSERVATIONS, []);
    if (saved.length > 0) {
      setObservations(saved);
    }
  }, []);

  const handleAddObservation = (newObs: Observation) => {
    const updated = [newObs, ...observations];
    setObservations(updated);
    
    const success = storage.set(StorageKeys.OBSERVATIONS, updated);
    if (success) {
      setView('history');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleProgressUpdate = (completedCount: number) => {
    const percentage = (completedCount / 8) * 100;
    setFormProgress(percentage);
  };

  const handleLogoutDummy = () => {
    storage.clearSession();
    window.location.reload();
  };

  return (
    <Layout 
      activeView={view} 
      onViewChange={setView} 
      progress={formProgress} 
      userRole="observer" 
      onLogout={handleLogoutDummy}
    >
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
