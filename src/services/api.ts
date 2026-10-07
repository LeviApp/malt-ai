export interface AnalysisRequest {
  medications: string;
  allergies?: string;
  caseDetails?: string;
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
  meta: {
    timestamp: string;
    model: string;
  };
  inputSummary?: InputSummary;
  medicationAnalyses: MedicationAnalysis[];
  regimenInteractionNotes: DualExplanation[];
  
  // Optional client/error fields
  validationError?: string;
  error?: string;
}

// Ensure this matches your Express backend URL & port
const API_BASE_URL = import.meta.env.VITE_MALT_API_URL || 'http://localhost:5001/api';

// High-precision emergency phrases
export const CRITICAL_EMERGENCY_KEYWORDS = [
  'gunshot', 'gun shot', 'bullet wound', 'stabbed', 'stabbing', 'stab wound', 
  'massive hemorrhage', 'bleeding out', 'spurting blood', 'traumatic amputation',
  'severe chest pain', 'crushing chest pain', 'cardiac arrest', 'heart attack',
  'facial drooping', 'slurred speech', 'sudden numbness', 'sudden paralysis',
  'cannot breathe', "can't breathe", 'unable to breathe', 'stop breathing',
  'stopped breathing', 'choking', 'airway closing', 'anaphylactic shock',
  'unresponsive', 'unconscious', 'passed out', 'active seizure', 'continuous seizure',
  'overdose', 'poisoned', 'swallowed bleach', 'ingested poison', 'suicidal', 'poison'
];

// Main API Service Function
export async function analyzePatientCase(data: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    const apiKey = import.meta.env.VITE_API_SECRET_KEY; 
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage =
        errorData?.message || errorData?.error || `Server responded with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const rawResult = await response.json();

    // Trust the explicit flags returned directly from the backend schema
    const result: AnalysisResponse = {
      ...rawResult,
      isEmergency: rawResult.isEmergency ?? false,
      isHighAcuity: rawResult.isHighAcuity ?? false,
    };

    return result;
  } catch (error: any) {
    console.error('API Error in analyzePatientCase:', error);
    
    // Catch standard browser network connection failures
    if (error instanceof TypeError || error?.message?.toLowerCase().includes('fetch')) {
      throw new Error('Unable to reach backend server. Please verify Express server is running on port 5001.');
    }
    
    throw error;
  }
}