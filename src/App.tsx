// App.tsx
// THIS WAS THE LATEST COMMIT THAT WASN'T BROKEN ON LOCAL

import { useState } from 'react';
import './App.css';
import { Nav } from './components/Nav';
import { PatientForm } from './components/PatientForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { type AnalysisResponse } from './services/api';
import MedicalNotice from './components/MedicalNotice';

const isDailyQuotaExceeded = () => {
  const lockUntil = localStorage.getItem('malt_api_locked_until');
  if (!lockUntil) return false;
  return true
};

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [showCustomSampleModal, setShowCustomSampleModal] = useState(true);

  const handleSuccess = (results: AnalysisResponse) => {
    setAnalysis(results);
  };

  const handleReset = () => {
    setAnalysis(null);
  };

  return (
    <div id="results-container">
      <Nav />
      <MedicalNotice /> {/* Displays below Nav on mobile (< 768px), hidden on desktop */}
      
      {!analysis ? (
        <PatientForm onSubmitSuccess={handleSuccess} />
      ) : (
        <ResultsDashboard
          data={analysis}
          onReset={handleReset}
        />
      )}
      {/* {(
  // ── DAILY QUOTA LOCKED STATE ──
  <div className="mx-auto max-w-2xl rounded-xl border border-amber-500/30 bg-amber-950/20 p-8 text-center shadow-lg">
    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-3xl">
      🌙
    </div>
    <h3 className="text-xl font-semibold text-amber-200">
      Daily Gemini API Quota Reached
    </h3>
    <p className="mt-2 text-sm text-amber-200/80 leading-relaxed">
      Our free-tier live API quota has been exhausted for the day and resets at midnight PT.
      Custom query submissions are temporarily paused.
    </p>
    <p className="mt-3 text-xs text-amber-300/70 font-medium">
      ✨ You can still test full system logic using our 15 pre-compiled demonstration cases!
    </p>
    
    <button
      onClick={() => setShowCustomSampleModal(false)}
      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-amber-500"
    >
      🧪 Launch 15 Pre-Compiled Case Studies
    </button>
  </div>
)} */}
    </div>
  );
}

export default App;