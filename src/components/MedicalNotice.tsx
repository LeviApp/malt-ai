import React from 'react';

interface MedicalNoticeProps {
  /** Custom responsiveness or layout classes */
  className?: string;
}

export const MedicalNotice: React.FC<MedicalNoticeProps> = ({
  className = 'flex md:hidden p-3 sm:p-4 m-5',
}) => {
  return (
    <div
      className={`rounded-xl border border-amber-500 text-amber-200 items-start gap-2.5 sm:gap-3 text-xs sm:text-sm md:text-base leading-relaxed ${className}`}
    >
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p>
        <strong className="font-semibold text-amber-300">Important Medical Notice:</strong> This
        AI tool provides informational drug insights for reference only and is not a substitute
        for professional clinical judgment or direct physician consultation. Always consult a
        licensed healthcare professional or physician before changing, stopping, or starting
        any medication.
      </p>
    </div>
  );
};

export default MedicalNotice;