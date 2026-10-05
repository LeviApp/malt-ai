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
    clinical: string;        // e.g., "65yo M w/ HTN, CKD Stage 3. Current regimen: Lisinopril 20mg, Amlodipine 5mg."
    patientFriendly: string; // e.g., "Summary of medications & health details provided for this review."
}
export interface AnalysisResponse {
  isValidInput: boolean;
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
/**
 * Sends patient medication and case details to the backend for AI analysis.
 */

// High-precision emergency phrases
export const CRITICAL_EMERGENCY_KEYWORDS = [
  'gunshot', 'gun shot', 'bullet wound', 'stabbed', 'stabbing', 'stab wound', 
  'massive hemorrhage', 'bleeding out', 'spurting blood', 'traumatic amputation',
  'severe chest pain', 'crushing chest pain', 'cardiac arrest', 'heart attack',
  'facial drooping', 'slurred speech', 'sudden numbness', 'sudden paralysis',
  'cannot breathe', "can't breathe", 'unable to breathe', 'stop breathing',
  'stopped breathing', 'choking', 'airway closing', 'anaphylactic shock',
  'unresponsive', 'unconscious', 'passed out', 'active seizure', 'continuous seizure',
  'overdose', 'poisoned', 'swallowed bleach', 'ingested poison', 'suicidal'
];

// Helper function to evaluate inputs against emergency patterns
export function isAcuteEmergencyInput(medications: string = '', caseDetails: string = ''): boolean {
  const text = `${medications} ${caseDetails}`.toLowerCase();

  // 1. Direct check against high-precision keyword array
  const hasExactKeyword = CRITICAL_EMERGENCY_KEYWORDS.some((term) => text.includes(term));
  if (hasExactKeyword) return true;

  // 2. Contextual "shot" check (ignores flu shot, allergy shot, etc.)
  const isPenetratingShot = /\b(got shot|shot in|shot me)\b/.test(text) && 
    !/\b(flu shot|allergy shot|tetanus shot|covid shot|b12 shot|booster shot|shingles shot)\b/.test(text);
  if (isPenetratingShot) return true;

  // 3. Contextual "stab" check (ignores stable, stabilize, stability, etc.)
  const isStabTrauma = /\b(stab|stabs|stabbed|stabbing)\b/.test(text) && 
    !/\b(stable|stabilize|stabilized|stabilizing|stability)\b/.test(text);
  if (isStabTrauma) return true;

  // 4. Contextual loss of consciousness check
  const isNeurologicalFaint = /\b(fainted|passing out|passed out|faint and dizzy)\b/.test(text);
  if (isNeurologicalFaint) return true;

  return false;
}

// Main API Service Function
export async function analyzePatientCase(data: AnalysisRequest): Promise<AnalysisResponse> {
  // ---------------------------------------------------------------------------
  // 1. CALL ISACUTEEMERGENCYINPUT HERE (Client-Side Intercept)
  // ---------------------------------------------------------------------------
  if (isAcuteEmergencyInput(data.medications, data.caseDetails)) {
    return {
      isValidInput: true,
      inputSummary: {
        clinical: "Patient reporting acute, life-threatening trauma or emergency symptoms requiring immediate activation of emergency medical services.",
        patientFriendly: "You reported an acute life-threatening emergency."
      },
      medicationAnalyses: [],
      regimenInteractionNotes: [
        {
          clinical: "CRITICAL TRAUMA INTERCEPT: Immediate activation of Emergency Medical Services (911 / Trauma Center Evaluation) is required. Outpatient pharmacological analysis is strictly non-actionable.",
          patientFriendly: "🚨 CALL 911 IMMEDIATELY. This is a life-threatening medical emergency requiring immediate evaluation at an emergency room or trauma center. Do not attempt to self-medicate with oral pain relievers, as they can cause dangerous internal bleeding or delay critical surgical intervention."
        }
      ],
      meta: {
        timestamp: new Date().toISOString(),
        model: "client-emergency-intercept"
      }
    };
  }

  // ---------------------------------------------------------------------------
  // 2. STANDARD FLOW (Proceeds to Express/Gemini server if NOT an emergency)
  // ---------------------------------------------------------------------------
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
    
    if (error instanceof TypeError && error.message.includes('Fetch')) {
      throw new Error('Unable to reach backend server. Please verify Express server is running on port 5001.');
    }
    
    throw error;
  }
}