// App.tsx
import { useState } from 'react';
import './App.css';
import { Nav, type UserRole } from './components/Nav';
import { PatientForm } from './components/PatientForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { type AnalysisResponse } from './services/api';

function App() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);

  const handleSuccess = (results: AnalysisResponse) => {
    setAnalysis(results);
  };

  const handleReset = () => {
    setAnalysis(null);
  };

  return (
    <>
      <Nav
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        showToggle={Boolean(analysis)}
      />
      {!analysis ? (
        <PatientForm onSubmitSuccess={handleSuccess} />
      ) : (
        <ResultsDashboard
          data={analysis}
          onReset={handleReset}
          activeRole={selectedRole}
          onRoleChange={setSelectedRole}
        />
      )}
    </>
  );
}

export default App;