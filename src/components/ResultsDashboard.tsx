import React from 'react';
import { type AnalysisResponse } from '../services/api';
import { type UserRole } from './Nav';

interface ResultsDashboardProps {
    data: AnalysisResponse;
    onReset?: () => void;
    activeRole?: UserRole;
    onRoleChange?: (role: UserRole) => void;
}

interface SeverityBadgeProps {
    severity: string;
    isPatientMode: boolean;
}

export const SeverityBadge = ({ severity, isPatientMode }: SeverityBadgeProps) => {
    const normalized = severity.toLowerCase();

    if (normalized.includes('contraindicated')) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {isPatientMode ? '🛑 Do Not Take' : 'Contraindicated'}
            </span>
        );
    }

    if (normalized.includes('major')) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                {isPatientMode ? '⚠️ High Risk / Avoid' : 'Major Warning'}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            {isPatientMode ? '⚡ Use With Caution' : severity}
        </span>
    );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
    data,
    onReset,
    activeRole = 'doctor',
    onRoleChange,
}) => {
    // Sync view mode with activeRole ('doctor' -> 'clinical', 'patient' -> 'patient')
    const activeTab = activeRole === 'doctor' ? 'clinical' : 'patient';

    const handleTabClick = (tab: 'clinical' | 'patient') => {
        if (onRoleChange) {
            onRoleChange(tab === 'clinical' ? 'doctor' : 'patient');
        }
    };

    const { medicationAnalyses = [], regimenInteractionNotes = [] } = data || {};

    // Helper function for severity badge styling
    const getSeverityBadge = (severity?: string) => {
        switch (severity?.toLowerCase()) {
            case 'high':
            case 'severe':
            case 'contraindicated':
                return 'bg-red-500/20 text-red-300 border-red-500/40';
            case 'moderate':
                return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            case 'low':
            default:
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8 text-white select-text print:text-black print:bg-white">
            {/* Top Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#A5A6FF]/20 pb-6 print:border-gray-300">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white print:text-gray-900">
                        Analysis Results
                    </h2>
                    <p className="text-[#A5A6FF] text-sm mt-1 print:text-gray-600">
                        AI-generated clinical analysis and patient-facing breakdown.
                    </p>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-[#0A0054]/60 border border-[#A5A6FF]/30 text-white hover:bg-[#A5A6FF]/20 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                        title="Print or export analysis"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4h10z"
                            />
                        </svg>
                        Print Summary
                    </button>

                    {onReset && (
                        <button
                            type="button"
                            onClick={onReset}
                            className="px-5 py-2 rounded-xl bg-[#1400A9] border border-[#A5A6FF]/30 text-white hover:bg-white hover:text-[#1400A9] font-medium transition-all text-sm flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            Analyze Another Case
                        </button>
                    )}
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
                <div className="flex gap-2 p-1.5 bg-[#1400A9]/60 rounded-xl border border-[#A5A6FF]/20 w-fit">
                    <button
                        type="button"
                        onClick={() => handleTabClick('clinical')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'clinical'
                            ? 'bg-[#A5A6FF] text-[#1400A9] shadow-md'
                            : 'text-[#A5A6FF] hover:text-white'
                            }`}
                    >
                        Clinical View
                    </button>
                    <button
                        type="button"
                        onClick={() => handleTabClick('patient')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'patient'
                            ? 'bg-[#A5A6FF] text-[#1400A9] shadow-md'
                            : 'text-[#A5A6FF] hover:text-white'
                            }`}
                    >
                        Patient Plain-Language
                    </button>
                </div>

                <span className="text-xs text-[#A5A6FF]/80 italic">
                    Currently displaying {activeTab === 'clinical' ? 'clinical provider' : 'patient-friendly'} context
                </span>
            </div>

            {/* Overall Regimen Interaction Notes */}
            {regimenInteractionNotes.length > 0 && (
                <div className="p-6 rounded-2xl bg-[#1400A9] border border-[#A5A6FF]/30 flex flex-col gap-3 shadow-lg print:border-gray-400 print:bg-gray-50 print:text-black">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#A5A6FF] print:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#A5A6FF] print:text-gray-700">
                            Overall Regimen Interaction Notes
                        </span>
                    </div>
                    <div className="space-y-2 divide-y divide-[#A5A6FF]/10 print:divide-gray-200">
                        {regimenInteractionNotes.map((note, idx) => (
                            <p key={idx} className="text-base text-white print:text-gray-900 leading-relaxed pt-2 first:pt-0">
                                {activeTab === 'clinical' ? note.clinical : note.patientFriendly}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State Guard */}
            {medicationAnalyses.length === 0 && (
                <div className="p-12 text-center rounded-2xl bg-[#1400A9]/30 border border-[#A5A6FF]/20">
                    <p className="text-lg text-[#A5A6FF]">No medication analyses returned for this query.</p>
                </div>
            )}

            {/* Medication Analyses Grid */}
            <div className="flex flex-col gap-8">
                {medicationAnalyses.map((item, index) => (
                    <div
                        key={index}
                        className="p-6 rounded-2xl bg-[#1400A9]/70 border border-[#A5A6FF]/20 flex flex-col gap-6 shadow-xl print:border-gray-300 print:bg-white print:text-black"
                    >
                        {/* Medication Title Bar */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#A5A6FF]/10 pb-4 print:border-gray-200">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#A5A6FF] print:text-gray-600">
                                    Target Drug #{index + 1}
                                </span>
                                <h3 className="text-2xl font-bold text-white print:text-gray-900 mt-0.5">
                                    {item.targetDrug}
                                </h3>
                            </div>
                            {item.reasonForSwitch && (
                                <div className="px-3 py-1 rounded-lg bg-[#0A0054]/50 border border-[#A5A6FF]/20 text-xs sm:text-sm text-[#A5A6FF] print:text-gray-700">
                                    <strong className="text-white print:text-black">Switch Reason: </strong>
                                    {activeTab === "patient"
                                        ? item.reasonForSwitch.patientFriendly
                                        : item.reasonForSwitch.clinical}
                                </div>
                            )}
                        </div>

                        {/* Primary Alternatives */}
                        {item.primaryAlternatives && item.primaryAlternatives.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h4 className="text-lg font-bold text-white print:text-gray-900 flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-emerald-400 print:text-emerald-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Primary Alternatives
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {item.primaryAlternatives.map((alt, altIdx) => (
                                        <div
                                            key={altIdx}
                                            className="p-4 rounded-xl bg-[#0A0054]/50 border border-[#A5A6FF]/20 flex flex-col gap-3 print:bg-gray-50 print:border-gray-300"
                                        >
                                            <div className="flex justify-between items-center border-b border-[#A5A6FF]/10 pb-2 print:border-gray-200">
                                                <span className="font-bold text-lg text-white print:text-gray-900">
                                                    {alt.drugName}
                                                </span>
                                                {alt.drugClass && (
                                                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#A5A6FF]/20 text-[#A5A6FF] font-semibold print:bg-gray-200 print:text-gray-800">
                                                        {typeof alt.drugClass === 'string'
                                                            ? alt.drugClass
                                                            : activeTab === "patient"
                                                                ? alt.drugClass.patientFriendly
                                                                : alt.drugClass.clinical}
                                                    </span>
                                                )}
                                            </div>

                                            {alt.whyItIsTheBestAlternative && (
                                                <p className="text-sm text-slate-100 print:text-gray-800 leading-relaxed">
                                                    <strong className="text-[#A5A6FF] print:text-gray-900">
                                                        Rationale:{' '}
                                                    </strong>
                                                    {activeTab === 'clinical'
                                                        ? alt.whyItIsTheBestAlternative.clinical
                                                        : alt.whyItIsTheBestAlternative.patientFriendly}
                                                </p>
                                            )}

                                            {alt.safetyConsiderations && (
                                                <p className="text-sm text-slate-200 print:text-gray-700 leading-relaxed">
                                                    <strong className="text-[#A5A6FF] print:text-gray-900">
                                                        Safety Note:{' '}
                                                    </strong>
                                                    {activeTab === 'clinical'
                                                        ? alt.safetyConsiderations.clinical
                                                        : alt.safetyConsiderations.patientFriendly}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Secondary Alternatives */}
                        {item.secondaryAlternatives && item.secondaryAlternatives.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h4 className="text-lg font-bold text-[#A5A6FF] print:text-gray-800">
                                    Secondary Alternatives
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {item.secondaryAlternatives.map((alt, altIdx) => (
                                        <div
                                            key={altIdx}
                                            className="p-4 rounded-xl bg-[#0A0054]/30 border border-[#A5A6FF]/10 flex flex-col gap-2 print:bg-gray-50 print:border-gray-300"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-base text-white print:text-gray-900">
                                                    {alt.drugName}
                                                </span>
                                                {alt.drugClass && (
                                                    <span className="text-xs px-2.5 py-1 rounded-md bg-[#A5A6FF]/20 text-[#A5A6FF] font-semibold print:bg-gray-200 print:text-gray-800">
                                                        {typeof alt.drugClass === 'string'
                                                            ? alt.drugClass
                                                            : activeTab === "patient"
                                                                ? alt.drugClass.patientFriendly
                                                                : alt.drugClass.clinical}
                                                    </span>
                                                )}
                                            </div>
                                            {alt.whyItIsTheBestAlternative && (
                                                <p className="text-sm text-slate-200 print:text-gray-800 leading-relaxed">
                                                    {activeTab === 'clinical'
                                                        ? alt.whyItIsTheBestAlternative.clinical
                                                        : alt.whyItIsTheBestAlternative.patientFriendly}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Medications to Avoid */}
                        {item.medicationsToAvoid && item.medicationsToAvoid.length > 0 && (
                            <div className="flex flex-col gap-3 pt-2">
                                <h4 className="text-lg font-bold text-amber-300 print:text-amber-700 flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-amber-400 print:text-amber-700"
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
                                    Medications to Avoid / Contraindications
                                </h4>
                                <div className="space-y-3">
                                    {item.medicationsToAvoid.map((avoid, avoidIdx) => (
                                        <div
                                            key={avoidIdx}
                                            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 print:bg-red-50 print:border-red-300"
                                        >
                                            <div className="flex-1">
                                                <span className="font-bold text-red-200 print:text-red-900">
                                                    {avoid.drugOrClass}:{' '}
                                                </span>
                                                <span className="text-sm text-slate-200 print:text-gray-800">
                                                    {activeTab === 'clinical'
                                                        ? avoid.reasonToAvoid?.clinical
                                                        : avoid.reasonToAvoid?.patientFriendly}
                                                </span>
                                            </div>
                                            {avoid.severity && (
                                                <SeverityBadge
                                                    severity={avoid.severity}
                                                    isPatientMode={activeTab === 'patient'}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultsDashboard;