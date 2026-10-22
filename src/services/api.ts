export interface AnalysisRequest {
  medications: string;
  allergies?: string;
  caseDetails?: string;
  selectedSampleCase?: number
}

export interface DualExplanation {
  clinical: string;
  patientFriendly: string;
}

export interface AvoidMedication {
  drugOrClass: string;
  severity: string;
  reasonToAvoid: DualExplanation;
}

export interface AlternativeMedication {
  drugName: string;
  drugClass: DualExplanation;
  whyItIsTheBestAlternative: DualExplanation;
  safetyConsiderations: DualExplanation;
}

export interface MedicationAnalysis {
  targetDrug: string;
  reasonForSwitch?: DualExplanation;
  medicationsToAvoid: AvoidMedication[];
  primaryAlternatives: AlternativeMedication[];
  secondaryAlternatives?: AlternativeMedication[];
}

export interface InputSummary {
  clinical: string;
  patientFriendly: string;
}

export interface AnalysisResponse {
  isValidInput: boolean;
  isEmergency?: boolean;
  isHighAcuity?: boolean;
  safety_modal_trigger?: string;
  meta: {
    timestamp: string;
    model: string;
  };
  inputSummary?: InputSummary;
  medicationAnalyses: MedicationAnalysis[];
  regimenInteractionNotes: Array<{
    alertDirective?: string;
    clinical?: string;
    patientFriendly?: string;
  }>;

  // Optional client/error fields
  validationError?: string;
  error?: string;
}

// Ensure this matches your Express backend URL & port
const API_BASE_URL = import.meta.env.VITE_MALT_API_URL || 'http://localhost:5001/api';

// Main API Service Function
export async function analyzePatientCase(data: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const apiKey = import.meta.env.VITE_API_FINGERPRINT;
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(data),
    });

    let isRateLimited = false;

    // Handle 429 specifically without halting execution
    if (response.status === 429) {
      isRateLimited = true;
      // Calculate exact timestamp 24 hours (24 * 60 * 60 * 1000 ms) from now
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const cooldownExpiration = new Date(Date.now() + ONE_DAY_MS).toISOString();

      localStorage.setItem('malt_ai_rate_limited', cooldownExpiration);
    } else if (!response.ok) {
      // Throw for non-429 server error statuses (500, 503, 400, etc.)
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // Safely parse JSON payload (or fallback to empty object if unparseable)
    const rawData = await response.json().catch(() => ({}));

    const disclaimer = 'Note: Due to high request volume, this analysis may be based on simplified or partial evaluation.';

    const existingClinical = rawData?.inputSummary?.clinical || '';
    const existingPatientFriendly = rawData?.inputSummary?.patientFriendly || '';

    // Format final response, preserving any generated summary data if it was created
    const result: AnalysisResponse = {
      ...rawData,
      isValidInput: rawData?.isValidInput ?? true,
      isEmergency: rawData?.isEmergency ?? false,
      isHighAcuity: rawData?.isHighAcuity ?? false,
      meta: rawData?.meta || {
        timestamp: new Date().toISOString(),
        model: 'malt-ai-clinical-v2',
      },
      inputSummary: {
        clinical: isRateLimited
          ? `[RATE_LIMITED] ${existingClinical}`.trim()
          : existingClinical,
        patientFriendly: isRateLimited
          ? `${disclaimer} ${existingPatientFriendly}`.trim()
          : existingPatientFriendly,
      },
      regimenInteractionNotes: rawData?.regimenInteractionNotes || [],
      medicationAnalyses: rawData?.medicationAnalyses || [],
    };

    return result;
  } catch (error: any) {
    console.error('API Error in analyzePatientCase:', error);

    // Catch standard browser network connection failures
    if (error instanceof TypeError || error?.message?.toLowerCase().includes('fetch')) {
      throw new Error(
        'Unable to reach backend server. Please verify Express server is running on port 5001.'
      );
    }

    throw error;
  }
}