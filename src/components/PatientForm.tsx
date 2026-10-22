// PatientForm.tsx
import React, { useEffect, useState } from 'react';
import { analyzePatientCase, type AnalysisRequest, type AnalysisResponse } from '../services/api';
import { SampleCasesGallery } from './SampleCaseGallery';
import { SAMPLE_CASE } from './SampleCase';

interface FormState {
  medications: string;
  allergies: string;
  caseDetails: string;
}

interface PatientFormProps {
  /** Optional callback to pass result up to parent (e.g., App.tsx) */
  onSubmitSuccess?: (results: AnalysisResponse) => void;
  /** Optional external loading control from parent */
  isLoading?: boolean;
}

export const PatientForm: React.FC<PatientFormProps> = ({
  onSubmitSuccess,
  isLoading: externalLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'custom' | 'sample'>('custom');
  const [selectedSampleCase, setSelectedSampleCase] = useState<number | null>(null);  const [AICooldownActive, setAICooldownActive] = useState(false)
  const [internalLoading, setInternalLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    medications: '',
    allergies: '',
    caseDetails: '',
  });

  // Effective loading state (prioritize parent prop if passed)
  const isLoading = externalLoading ?? internalLoading;

  // Destructure for easy variable access anywhere in the component
  const { medications, allergies, caseDetails } = formData;

  const areAllInputsEmpty = () => {
    return !medications.trim() && !allergies.trim() && !caseDetails.trim();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInternalLoading(true);

    try {
      const payload: AnalysisRequest = {
        medications: medications.trim(),
        allergies: allergies.trim(),
        caseDetails: caseDetails.trim(),
        selectedSampleCase: selectedSampleCase
      };

      const response = await analyzePatientCase(payload);

      // Handle successful validation and return data
      if (response && response.isValidInput !== false) {
        if (onSubmitSuccess) {
          onSubmitSuccess(response);
        }
      } else {
        // Reads explicit backend error string first, with schema fallbacks
        const fallbackMsg =
          response?.validationError ||
          response?.error ||
          response?.regimenInteractionNotes?.[0]?.alertDirective ||
          'The input could not be validated as a medical query.';
        setErrorMessage(fallbackMsg);
      }
    } catch (err: any) {
      // 🛡️ Handles 400 Bad Request / 500 API errors cleanly
      setErrorMessage(
        err.message || 'Failed to connect to analysis server. Make sure backend is running.'
      );
    } finally {
      setInternalLoading(false);
    }
  };

// Checking logic:
const shouldShowCustomAnalysis = (): boolean => {
  const cooldownUntil = localStorage.getItem('malt_ai_rate_limited');

  if (cooldownUntil && new Date().getTime() < new Date(cooldownUntil).getTime()) {
    setAICooldownActive(true);
    setActiveTab('sample');
    return false;
  }

  // Clear expired limit after 24 hours have passed
  localStorage.removeItem('malt_ai_rate_limited');
  setAICooldownActive(false);
  return true;
};

  // Run on mount
  useEffect(() => {
    shouldShowCustomAnalysis();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col items-center select-text">
      {/* Header & Subheader */}
      <section className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">
          Medication Alternative Discovery
        </h1>
        <p className="text-[#A5A6FF] text-base">
          Enter current prescriptions, known allergies, and relevant case context to generate safe,
          AI-guided medication options.
        </p>
      </section>

<div className="w-full flex flex-col items-center mb-8 print:hidden">
  {/* Centered Segmented Tab Switcher */}
  <div className="w-full md:w-auto flex items-center">
    <button
      type="button"
      hidden={AICooldownActive}
      onClick={() => {
        setSelectedSampleCase(null)
        setFormData({ medications: "", allergies: "", caseDetails: "" });
        setActiveTab('custom')
      }}
      className={`flex-1 md:flex-initial text-center px-6 py-3 rounded-l-lg text-base md:text-sm font-semibold transition-all cursor-pointer ${
        activeTab === 'custom'
          ? 'bg-white text-[#1400A9]'
          : 'text-[#1400A9] bg-[#A5A6FF] hover:bg-white'
      }`}
    >
      Custom Analysis
    </button>
    <button
      type="button"
      onClick={() => setActiveTab('sample')}
      className={`flex-1 md:flex-initial text-center px-6 py-3 ${
        AICooldownActive ? 'rounded-lg' : 'rounded-r-lg'
      } text-base md:text-sm font-semibold transition-all cursor-pointer ${
        activeTab === 'sample'
          ? 'bg-white text-[#1400A9]'
          : 'text-[#1400A9] bg-[#A5A6FF] hover:bg-white'
      }`}
    >
      Sample Analysis
    </button>
  </div>

  {/* Dedicated Bottom Container for 'Analyze Another Case' (Preserves Layout Space) */}
  <div className={`mt-4 ${selectedSampleCase ? "visible" : "invisible"}`}>
    <button
      type="button"
      onClick={() => setSelectedSampleCase(null)}
      className="px-6 py-3 rounded-xl bg-[#A5A6FF] text-[#1400A9] hover:bg-white font-semibold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Analyze Another Case
    </button>
  </div>
</div>
      {/* API Error Notification */}
      {errorMessage && (
        <div className="w-full mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-200 flex items-center justify-between text-sm sm:text-base">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Form with side-by-side inputs and bottom action button */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6 text-white">
        {/* Side-by-Side Inputs Container */}
        {(activeTab === "custom" || selectedSampleCase) && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Box 1: Medications */}
          <div className="flex flex-col gap-2">
            <label htmlFor="medications" className="medications-label text-lg font-medium">
              Medications
            </label>
            <textarea
              id="medications"
              name="medications"
              rows={4}
              value={medications}
              onChange={handleChange}
              disabled={isLoading || selectedSampleCase !== null}
              placeholder="List any current prescriptions, dosages, or supplements..."
              className={`w-full p-4 rounded-xl ${selectedSampleCase ? "bg-[#1400A9] readonly border-2 border-[#A5A6FF]" : "bg-gray-800 border border-[#A5A6FF]/30"} text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50`}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
          {/* Box 2: Allergies */}
          <div className="flex flex-col gap-2">
            <label htmlFor="allergies" className="text-lg font-medium">
              Allergies
            </label>
            <textarea
              id="allergies "
              name="allergies"
              rows={4}
              value={allergies}
              onChange={handleChange}
              disabled={isLoading || selectedSampleCase !== null}
              placeholder="List known drug allergies or severe sensitivities..."
              className={`w-full p-4 rounded-xl ${selectedSampleCase ? "bg-[#1400A9] readonly border-2 border-[#A5A6FF]" : "bg-gray-800 border border-[#A5A6FF]/30"} text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50`}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Box 3: Context Details */}
          <div className="flex flex-col gap-2">
            <label htmlFor="caseDetails" className="text-lg font-medium">
              Case Details
            </label>
            <textarea
              id="caseDetails"
              name="caseDetails"
              rows={4}
              value={caseDetails}
              onChange={handleChange}
              disabled={isLoading || selectedSampleCase !== null}
              placeholder="Describe relevant medical history, specific concerns, or symptoms..."
              className={`w-full p-4 rounded-xl ${selectedSampleCase ? "bg-[#1400A9] readonly border-2 border-[#A5A6FF]" : "bg-gray-800 border border-[#A5A6FF]/30"} text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50`}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>)}
        {(activeTab === "sample" && !selectedSampleCase) && (
          <div className="flex flex-col gap-3 w-full mb-6">
            <div className="flex items-center gap-3">
            <label htmlFor="sample-medical-cases" className="text-lg font-medium text-slate-200 md:border-r print:border-r border-[#A5A6FF]/60 pr-4">
              Sample Medical Cases
            </label>
            <span className="text-xs px-2.5 py-0.5 text-white font-medium">
              {SAMPLE_CASE.length} Preset Studies
            </span>
            </div>
            <SampleCasesGallery
              onSelectCase={(study) => {
                // 1. Auto-fill the form text boxes
                setFormData({
                  medications: study.inputs.medications,
                  allergies: study.inputs.allergies,
                  caseDetails: study.inputs.caseDetails
                });
                setSelectedSampleCase(study.id)
                // 2. Load the pre-compiled clinical analysis output directly
                // setAnalysisResult(study.mockOutput);
              }}
            // selectedCaseId={selectedCase?.id}
            />
          </div>
        )}

        {/* Action: Send Button */}
        {(activeTab === "custom" || (activeTab === "sample" && selectedSampleCase)) && (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
          <div className="md:col-start-2">
            <button
              type="submit"
              disabled={(isLoading || areAllInputsEmpty()) ? true : false}
              className={`submit-button w-full py-4 mb-3 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] text-[1.5rem] flex items-center justify-center gap-3 bg-[#A5A6FF] border border-[#A5A6FF]/30 text-[#1400A9] hover:bg-white hover:text-[#1400A9] cursor-pointer`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-[#1400A9]"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    {/* Outer track ring */}
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    {/* Rotating arc segment - perfectly aligned to the same track */}
                    <path
                      className="opacity-75"
                      d="M12 2a10 10 0 0110 10"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Analyzing ...</span>
                </>
              ) : (
                'Analyze Alternatives'
              )}
            </button>
          </div>
        </div>)}
      </form>
    </div>
  );
};

export default PatientForm;