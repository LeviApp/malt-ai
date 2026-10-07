// App.tsx
// THIS WAS THE LATEST COMMIT THAT WASN'T BROKEN ON LOCAL

import { useState } from 'react';
import './App.css';
import { Nav } from './components/Nav';
import { PatientForm } from './components/PatientForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { type AnalysisResponse } from './services/api';
import MedicalNotice from './components/MedicalNotice';

function App() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const handleSuccess = (results: AnalysisResponse) => {
    setAnalysis(results);
  };

  const handleReset = () => {
    setAnalysis(null);
  };

  return (
    <>
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
    </>
  );
}

export default App;