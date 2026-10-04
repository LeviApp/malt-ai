import React from 'react';

export interface SeverityBadgeProps {
    severity: string;
    isPatientMode?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, isPatientMode = false }) => {
    const normalized = severity.toLowerCase();

    if (normalized.includes('contraindicated')) {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs print:text-[7.5pt] font-bold text-red-400 print:text-red-950 shrink-0">
                {isPatientMode ? '🛑 Do Not Take' : 'Contraindicated'}
            </span>
        );
    }

    if (normalized.includes('major')) {
        return (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs print:text-[7.5pt] font-bold text-orange-400 print:text-amber-950 shrink-0">
                                                    <svg
                                        className="w-4 h-4 text-xs text-orange-400 print:w-3 print:h-3 print:text-orange-400"
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
                {isPatientMode ? 'High Risk / Avoid' : 'Major Warning'}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs print:text-[7.5pt] font-bold text-yellow-400 print:text-amber-900 shrink-0">
            {isPatientMode ? '⚡ Use With Caution' : severity}
        </span>
    );
};

export default SeverityBadge;