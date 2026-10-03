export interface AnalysisRequest {
  medications: string;
  allergies?: string;
  caseDetails?: string;
}

export interface ClinicalAnalysis {
  summary: string;
  riskLevel: 'Low' | 'Moderate' | 'High';
  interactions: string[];
  recommendations: string[];
}

export interface PatientFriendlyAnalysis {
  explanation: string;
  keyTakeaways: string[];
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

export interface AnalysisResponse {
  isValidInput: boolean;
  meta: {
    timestamp: string;
    model: string;
  };
  medicationAnalyses: MedicationAnalysis[];
  regimenInteractionNotes: DualExplanation[];
  
  // Optional client/error fields
  validationError?: string;
  error?: string;
}

// Ensure this matches your Express backend URL & port
const API_BASE_URL = 'http://localhost:5001/api';

/**
 * Sends patient medication and case details to the backend for AI analysis.
 */
export async function analyzePatientCase(data: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message || errorData?.error || `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const result: AnalysisResponse = await response.json();
    return result;
  } catch (error: any) {
    console.error('API Error in analyzePatientCase:', error);
    
    // Pass clear message up to UI layer
    if (error instanceof TypeError && error.message.includes('Fetch')) {
      throw new Error('Unable to reach backend server. Please verify Express server is running on port 5001.');
    }
    
    throw error;
  }
}