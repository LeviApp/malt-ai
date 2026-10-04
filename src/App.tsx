// App.tsx
import { useState } from 'react';
import './App.css';
import { Nav, type UserRole } from './components/Nav';
import { PatientForm } from './components/PatientForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { type AnalysisResponse } from './services/api';

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