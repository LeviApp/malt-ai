// PatientForm.tsx
import React, { useState } from 'react';
import { analyzePatientCase, type AnalysisRequest, type AnalysisResponse } from '../services/api';

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
          response?.regimenInteractionNotes?.[0]?.patientFriendly ||
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
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
              disabled={isLoading}
              placeholder="List any current prescriptions, dosages, or supplements..."
              className="w-full p-4 rounded-xl bg-gray-800 border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50"
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
              disabled={isLoading}
              placeholder="List known drug allergies or severe sensitivities..."
              className="w-full p-4 rounded-xl bg-gray-800 border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50"
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
              disabled={isLoading}
              placeholder="Describe relevant medical history, specific concerns, or symptoms..."
              className="w-full p-4 rounded-xl bg-gray-800 border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text disabled:opacity-50"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Action: Send Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
          <div className="md:col-start-2">
            <button
              type="submit"
              disabled={isLoading ? true : false}
              className={`submit-button w-full py-4 rounded-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] text-[1.5rem] flex items-center justify-center gap-3 bg-[#A5A6FF] border border-[#A5A6FF]/30 text-[#1400A9] hover:bg-white hover:text-[#1400A9] cursor-pointer`}
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
        </div>
      </form>
    </div>
  );
};

export default PatientForm;