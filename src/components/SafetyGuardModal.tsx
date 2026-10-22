import React from 'react';

export interface SafetyGuardModalProps {
  isHighAcuity: boolean;
  alertDirective?: string; // Added back to root props
  safety_modal_trigger?: string;
  regimenInteractionNotes?: Array<{
    alertDirective?: string;
    clinical?: string;
    patientFriendly?: string;
  }>;
  onReset?: () => void;
}

export const SafetyGuardModal: React.FC<SafetyGuardModalProps> = ({
  isHighAcuity,
  alertDirective,
  safety_modal_trigger,
  regimenInteractionNotes = [],
  onReset,
}) => {
  // Determine dynamic title based on acuity or specific safety modal trigger
  const getModalTitle = (): string => {
    if (safety_modal_trigger === 'POST_OP_HIGH_RISK') {
      return 'Post-Operative & Clinical Safety Alert';
    }
    return isHighAcuity
      ? 'Emergency Medical Alert'
      : 'First Aid & Urgent Guidance';
  };

  // Resolve the text to display: prioritize direct root alertDirective, then regimenNotes alertDirective, then patientFriendly/clinical
  const resolvedDirective =
    alertDirective ||
    regimenInteractionNotes[0]?.alertDirective ||
    regimenInteractionNotes[0]?.patientFriendly ||
    regimenInteractionNotes[0]?.clinical;

  return (
    <div
      className={`p-6 sm:p-8 rounded-2xl border-4 shadow-2xl flex flex-col gap-6 transition-all ${
        isHighAcuity
          ? 'bg-red-950/90 border-red-500 shadow-red-900/50 animate-pulse-subtle print:border-red-600 print:bg-red-50'
          : 'bg-slate-900/90 border-amber-500/80 shadow-amber-900/30 print:border-amber-500 print:bg-amber-50/80'
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b pb-4 ${
          isHighAcuity ? 'border-red-500/30' : 'border-amber-500/30'
        }`}
      >
        <svg
          className={`w-8 h-8 shrink-0 ${
            isHighAcuity
              ? 'text-red-500'
              : 'text-amber-400 print:text-amber-700'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div>
          <h3
            className={`md:grid-cols-2 text-2xl font-extrabold tracking-wide uppercase ${
              isHighAcuity
                ? 'text-red-400 print:text-red-800'
                : 'text-amber-300 print:text-amber-900'
            }`}
          >
            {getModalTitle()}
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {resolvedDirective && (
          <p
            className={`text-base sm:text-lg font-normal leading-relaxed ${
              isHighAcuity
                ? 'text-red-100/90 print:text-red-950'
                : 'text-slate-200 print:text-slate-900'
            }`}
          >
            {resolvedDirective}
          </p>
        )}
      </div>

      <div
        className={`pt-2 flex flex-wrap gap-4 items-center justify-between border-t ${
          isHighAcuity ? 'border-red-500/30' : 'border-amber-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className={`px-5 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer print:hidden ${
                isHighAcuity
                  ? 'bg-red-900/80 hover:bg-red-800 text-red-100 border-red-500/40'
                  : 'bg-amber-500/30 hover:bg-amber-400/50 text-amber-200 border-amber-500/40'
              }`}
            >
              Start New Analysis
            </button>
          )}
          {isHighAcuity && (
            <a
              href="tel:911"
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black tracking-wider text-base uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer print:hidden"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1.01 1.01 0 011.21-.502l4.493 1.498a1.1 1.1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              CALL 911 NOW!
            </a>
          )}
        </div>
      </div>
    </div>
  );
};