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

    let isRateLimited = response.status === 429;

    // Handle explicit HTTP 429 status from gateway
    if (isRateLimited) {
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const cooldownExpiration = new Date(Date.now() + ONE_DAY_MS).toISOString();
      localStorage.setItem('malt_ai_rate_limited', cooldownExpiration);
    }

    if (!response.ok && !isRateLimited) {
      // Throw for non-429 server error statuses (500, 503, 400, etc.)
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // Safely parse JSON payload (this captures your backend's graceful fallback payload!)
    const rawData = await response.json().catch(() => ({}));

    // FIXED: Check if the backend's fallback payload reported exhaustion or emergency state
    const isBackendExhausted = rawData?.meta?.exhausted === true || rawData?.isEmergency === true;
    if (isBackendExhausted || isRateLimited) {
      isRateLimited = true;
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const cooldownExpiration = new Date(Date.now() + ONE_DAY_MS).toISOString();
      localStorage.setItem('malt_ai_rate_limited', cooldownExpiration);
    }

    const analyses = rawData?.medicationAnalyses || [];
    const notes = rawData?.regimenInteractionNotes;
    
    let alertDirectiveMessage = '';
    if (Array.isArray(notes) && notes[0]?.alertDirective) {
      alertDirectiveMessage = notes[0].alertDirective;
    } else if (notes?.patientFriendly) {
      alertDirectiveMessage = notes.patientFriendly;
    } else {
      alertDirectiveMessage = 'Daily system request limit reached. You can continue testing the application by choosing one of the pre-configured sample cases.';
    }

    // 1. RATE LIMITED / EXHAUSTED CASE: Force Modal Trigger
    if (isRateLimited || isBackendExhausted || analyses.length === 0) {
      return {
        isValidInput: true,
        isEmergency: true, // Forces your frontend modal/overlay to pop open!
        isHighAcuity: false,
        safety_modal_trigger: "RATE_LIMIT_EXCEEDED",
        meta: {
          timestamp: new Date().toISOString(),
          model: rawData?.meta?.model || 'malt-ai-clinical-v2',
        },
        inputSummary: {
          clinical: rawData?.inputSummary?.clinical || "Analysis restricted due to temporary system rate constraints.",
          patientFriendly: rawData?.inputSummary?.patientFriendly || "Daily system request limit reached for custom analyses.",
        },
        regimenInteractionNotes: [
          {
            alertDirective: alertDirectiveMessage,
            clinical: "Upstream API quota exhausted. Free Tier daily request limit reached.",
            patientFriendly: alertDirectiveMessage,
          }
        ],
        medicationAnalyses: [],
      };
    }

    // 2. NORMAL SUCCESSFUL CASE WITH DATA
    const disclaimer = 'Note: Due to high request volume, this analysis may be based on simplified or partial evaluation.';
    const existingClinical = rawData?.inputSummary?.clinical || '';
    const existingPatientFriendly = rawData?.inputSummary?.patientFriendly || '';

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
        clinical: `${disclaimer}${existingClinical}`,
        patientFriendly: `${disclaimer}${existingPatientFriendly}`,
      },
      regimenInteractionNotes: rawData?.regimenInteractionNotes || [],
      medicationAnalyses: analyses,
    };

    return result;

  } catch (error: any) {
    console.error('API Error in analyzePatientCase:', error);

    if (error instanceof TypeError || error?.message?.toLowerCase().includes('fetch')) {
      throw new Error(
        'Unable to reach backend server. Please verify Express server is running on port 5001.'
      );
    }

    throw error;
  }
}