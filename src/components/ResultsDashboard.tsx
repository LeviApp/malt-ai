import React, { useState } from 'react';
import { type AnalysisResponse } from '../services/api';
import { SeverityBadge } from './SeverityBadge';

interface ResultsDashboardProps {
    data: AnalysisResponse;
    onReset?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
    data,
    onReset,
}) => {
    const [activeTab, setActiveTab] = useState<'clinical' | 'patient'>('clinical');

    const { medicationAnalyses = [], regimenInteractionNotes = [] } = data || {};

const isEmergency = 
    data?.meta?.model === 'client-emergency-intercept' || 
    regimenInteractionNotes.some(n => 
        n.clinical?.includes('CRITICAL TRAUMA INTERCEPT') ||
        n.clinical?.toLowerCase().includes('call 911') ||
        n.patientFriendly?.toLowerCase().includes('call 911')
    ) ||
    // Catch-all: Guard #1 produces an empty medication array with emergency notes
    (medicationAnalyses.length === 0 && regimenInteractionNotes.length > 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8 text-white select-text print:p-0 print:m-0 print:w-full print:max-w-none print:gap-2 print:text-black print:bg-white">
            {/* Page Break & Global Print Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 10mm 12mm;
                        size: portrait;
                    }
                    body {
                        background: #ffffff !important;
                        color: #000000 !important;
                        font-size: 8.5pt !important;
                        line-height: 1.25 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-keep-together {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                    h1, h2, h3, h4, h5, h6 {
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                    }
                }
            `}</style>

            {/* 🚨 PROMINENT EMERGENCY BANNER */}
            {isEmergency ? (
                <div className="p-6 sm:p-8 rounded-2xl bg-red-950/90 border-4 border-red-500 shadow-2xl shadow-red-900/50 flex flex-col gap-6 animate-pulse-subtle print:border-red-600 print:bg-red-50 print:text-black">
                    <div className="flex items-center gap-3 border-b border-red-500/30 pb-4">
                        <svg className="w-8 h-8 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                            <h3 className="text-2xl font-extrabold text-red-400 tracking-wide uppercase print:text-red-800">
                                Emergency Medical Alert
                            </h3>
                            <p className="text-xs text-red-300 font-medium print:text-red-700">
                                Immediate action required
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {regimenInteractionNotes.map((note, idx) => (
                            <p key={idx} className="text-lg sm:text-xl font-bold text-white leading-relaxed print:text-red-950">
                                {activeTab === 'clinical' ? note.clinical : note.patientFriendly}
                            </p>
                        ))}
                    </div>

                    <div className="pt-2 flex flex-wrap gap-4 items-center justify-between border-t border-red-500/30">
                        <span className="text-sm text-red-200 font-semibold print:text-red-900">
                            Outpatient medication analysis is strictly non-actionable for acute emergencies.
                        </span>
                        
                        <div className="flex items-center gap-3 print:hidden">
                            {onReset && (
                                <button
                                    type="button"
                                    onClick={onReset}
                                    className="px-5 py-3 rounded-xl bg-red-900/80 hover:bg-red-800 text-red-100 font-semibold text-sm border border-red-500/40 transition-all cursor-pointer"
                                >
                                    Start New Analysis
                                </button>
                            )}
                            <a
                                href="tel:3039088029"
                                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black tracking-wider text-base uppercase transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1.01 1.01 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                CALL 911 NOW!
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Top Header Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#A5A6FF]/20 pb-6 print:border-gray-300 print:pb-1 print:mb-0.5 print:gap-0">
                        <div>
                            <h2 className="text-3xl font-extrabold tracking-tight text-white print:text-[11pt] print:font-bold print:text-gray-900">
                                Analysis Results
                            </h2>
                            <p className="text-[#A5A6FF] text-sm mt-1 print:text-[7.5pt] print:text-gray-600 print:mt-0.5">
                                AI-generated clinical analysis and patient-facing breakdown.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 print:hidden">
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="px-4 py-2 rounded-xl bg-[#A5A6FF] text-[#1400A9] hover:bg-white text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
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
                                    className="px-5 py-2 rounded-xl bg-[#A5A6FF] text-[#1400A9] hover:bg-white font-medium transition-all text-sm flex items-center gap-2 cursor-pointer"
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
                    <div className="flex items-center justify-start flex-wrap print:hidden">
                        <button
                            type="button"
                            onClick={() => setActiveTab('clinical')}
                            className={`px-5 py-2 rounded-l-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'clinical'
                                ? 'bg-white text-[#1400A9]'
                                : 'text-[#1400A9] bg-[#A5A6FF] hover:bg-white'
                                }`}
                        >
                            Clinical View
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('patient')}
                            className={`px-5 py-2 rounded-r-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === 'patient'
                                ? 'bg-white text-[#1400A9]'
                                : 'text-[#1400A9] bg-[#A5A6FF] hover:bg-white'
                                }`}
                        >
                            Patient View
                        </button>
                    </div>

                    {/* Case Context Banner */}
                    {data?.inputSummary && (
                        <div className="p-4 rounded-xl text-white print:p-1.5 print:my-0.5 print:text-[8.5pt] print:leading-tight print:text-black print:border print:border-gray-200 print:rounded-lg print:bg-gray-50/50 print-keep-together">
                            <strong className="text-white print:text-gray-900 uppercase tracking-wider">
                                {activeTab === 'patient' ? 'Information Reviewed:' : 'Case Context:'}
                            </strong>{' '}
                            <span className="text-slate-200 print:text-gray-800">
                                {activeTab === 'patient'
                                    ? data?.inputSummary.patientFriendly
                                    : data?.inputSummary.clinical}
                            </span>
                        </div>
                    )}

                    {/* Summary Banner */}
                    {regimenInteractionNotes.length > 0 && (
                        <div className="p-6 rounded-2xl bg-[#1400A9] border-2 border-[#A5A6FF] flex flex-col gap-3 print:p-2 print:my-0.5 print:gap-1 print:border-indigo-300 print:bg-indigo-50/50 print:text-black print-keep-together">
                            <div className="flex items-center gap-1.5">
                                <svg className="w-5 h-5 text-[#A5A6FF] print:w-3 print:h-3 print:text-indigo-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs print:text-[7.5pt] font-bold uppercase tracking-wider text-[#A5A6FF] print:text-indigo-900">
                                    Summary
                                </span>
                            </div>
                            <div className="space-y-2 divide-y divide-[#A5A6FF]/10 print:space-y-1 print:divide-indigo-200">
                                {regimenInteractionNotes.map((note, idx) => (
                                    <p key={idx} className="text-base text-white print:text-[8.5pt] print:leading-tight print:text-indigo-950 print:font-medium pt-2 first:pt-0">
                                        {activeTab === 'clinical' ? note.clinical : note.patientFriendly}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty State Guard */}
                    {medicationAnalyses.length === 0 && (
                        <div className="p-12 text-center rounded-2xl bg-[#1400A9]/30 border border-[#A5A6FF]/20 print:p-4 print:border-gray-300">
                            <p className="text-lg text-[#A5A6FF] print:text-xs print:text-gray-600">No medication analyses returned for this query.</p>
                        </div>
                    )}

                    {/* Medication Analyses Grid */}
                    <div className="flex flex-col gap-8 print:gap-2">
                        {medicationAnalyses.map((item, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl bg-[#1400A9] border border-[#A5A6FF]/20 flex flex-col gap-6 print:p-2 print:gap-1.5 print:border-gray-300 print:bg-white print:text-black print:rounded-xl"
                            >
                                {/* Target Drug Title Bar */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#A5A6FF]/10 pb-4 print:border-gray-200 print:pb-1 print-keep-together">
                                    <div>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[#A5A6FF] print:text-[7.5pt] print:text-indigo-800 print:font-bold">
                                            Target Drug #{index + 1}
                                        </span>
                                        <h3 className="text-2xl font-bold text-white print:text-[10pt] print:font-bold print:text-gray-900 mt-0.5">
                                            {item.targetDrug}
                                        </h3>
                                    </div>
                                    {item.reasonForSwitch && (
                                        <div className="pl-3 border-l-2 border-[#A5A6FF]/60 print:border-indigo-400 my-1">
                                            <span className="text-xs sm:text-sm text-slate-200 print:text-gray-700">
                                                <strong className="text-white print:text-gray-900">Switch Reason: </strong>
                                                {typeof item.reasonForSwitch === 'string'
                                                    ? item.reasonForSwitch
                                                    : activeTab === 'clinical'
                                                        ? item.reasonForSwitch.clinical
                                                        : item.reasonForSwitch.patientFriendly}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Primary Alternatives Wrapper */}
                                {item.primaryAlternatives && item.primaryAlternatives.length > 0 && (
                                    <div className="flex flex-col gap-4 print:gap-1 print-keep-together">
                                        <h4 className="text-lg font-bold text-emerald-400 print:text-[8.5pt] print:text-emerald-900 flex items-center gap-1.5">
                                            <svg
                                                className="w-5 h-5 text-emerald-400 print:w-3 print:h-3 print:text-emerald-700"
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-1.5">
                                            {item.primaryAlternatives.map((alt, altIdx) => (
                                                <div
                                                    key={altIdx}
                                                    className="p-4 rounded-xl bg-black border border-[#A5A6FF]/20 flex flex-col gap-3 print:p-1.5 print:gap-0.5 print:bg-emerald-50/40 print:border-emerald-300 print:border-l-4 print:border-l-emerald-600 print-keep-together"
                                                >
                                                    <div className="flex justify-between items-center border-b border-[#A5A6FF]/10 pb-2 print:border-emerald-200 print:pb-0.5">
                                                        <span className="font-bold text-lg text-white print:text-[8.5pt] print:text-emerald-950">
                                                            {alt.drugName}
                                                        </span>
                                                        {alt.drugClass && (
                                                            <span className="text-xs px-2.5 py-1 rounded-md text-emerald-400 font-semibold print:px-1 print:py-0.5 print:text-[7pt] print:text-emerald-600">
                                                                {typeof alt.drugClass === 'string'
                                                                    ? alt.drugClass
                                                                    : activeTab === "patient"
                                                                        ? alt.drugClass.patientFriendly
                                                                        : alt.drugClass.clinical}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {alt.whyItIsTheBestAlternative && (
                                                        <p className="text-sm text-slate-100 print:text-[8pt] print:text-gray-800 print:leading-tight">
                                                            <strong className="text-emerald-400 print:text-emerald-900">
                                                                Rationale:{' '}
                                                            </strong>
                                                            {typeof alt.whyItIsTheBestAlternative === 'string'
                                                                ? alt.whyItIsTheBestAlternative
                                                                : activeTab === 'clinical'
                                                                    ? alt.whyItIsTheBestAlternative?.clinical
                                                                    : alt.whyItIsTheBestAlternative?.patientFriendly}
                                                        </p>
                                                    )}

                                                    {alt.safetyConsiderations && (
                                                        <p className="text-sm text-slate-200 print:text-[8pt] print:text-gray-700 print:leading-tight">
                                                            <strong className="text-emerald-400 print:text-emerald-900">
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

                                {/* Secondary Alternatives Wrapper */}
                                {item.secondaryAlternatives && item.secondaryAlternatives.length > 0 && (
                                    <div className="flex flex-col gap-4 print:gap-1 print-keep-together">
                                        <h4 className="text-lg font-bold text-yellow-400 print:text-[8.5pt] print:text-blue-900 flex items-center gap-1.5">
                                            <svg
                                                className="w-5 h-5 text-yellow-400 print:w-3 print:h-3 print:text-blue-700"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                                />
                                            </svg>
                                            Secondary Alternatives
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-1.5">
                                            {item.secondaryAlternatives.map((alt, altIdx) => (
                                                <div
                                                    key={altIdx}
                                                    className="p-4 rounded-xl bg-black border border-[#A5A6FF]/10 flex flex-col gap-2 print:p-1.5 print:gap-0.5 print:bg-blue-50/30 print:border-blue-200 print:border-l-4 print:border-l-blue-500 print-keep-together"
                                                >
                                                    <div className="flex justify-between items-center border-b border-transparent print:border-blue-200 print:pb-0.5">
                                                        <span className="font-bold text-base text-white print:text-[8.5pt] print:text-blue-950">
                                                            {alt.drugName}
                                                        </span>
                                                        {alt.drugClass && (
                                                            <span className="text-xs px-2.5 py-1 rounded-md text-yellow-400 font-semibold print:px-1 print:py-0.5 print:text-[7pt] print:text-blue-500">
                                                                {typeof alt.drugClass === 'string'
                                                                    ? alt.drugClass
                                                                    : activeTab === "patient"
                                                                        ? alt.drugClass.patientFriendly
                                                                        : alt.drugClass.clinical}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {alt.whyItIsTheBestAlternative && (
                                                        <p className="text-sm text-slate-200 print:text-[8pt] print:text-gray-800 print:leading-tight">
                                                            {typeof alt.whyItIsTheBestAlternative === 'string'
                                                                ? alt.whyItIsTheBestAlternative
                                                                : activeTab === 'clinical'
                                                                    ? alt.whyItIsTheBestAlternative?.clinical
                                                                    : alt.whyItIsTheBestAlternative?.patientFriendly}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Medications to Avoid Wrapper */}
                                {item.medicationsToAvoid && item.medicationsToAvoid.length > 0 && (
                                    <div className="flex flex-col gap-3 pt-2 print:gap-1 print:pt-0.5 print-keep-together">
                                        <h4 className="text-lg font-bold text-red-400 print:text-[8.5pt] print:text-red-900 flex items-center gap-1.5">
                                            <svg
                                                className="w-5 h-5 text-red-400 print:w-3 print:h-3 print:text-red-700"
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

                                        <div className="space-y-3 print:space-y-1">
                                            {item.medicationsToAvoid.map((avoid, avoidIdx) => (
                                                <div
                                                    key={avoidIdx}
                                                    className="p-3.5 rounded-xl bg-black flex items-stretch gap-4 print:p-1.5 print:bg-red-50/70 print:border print:border-red-300 print:border-l-4 print:border-l-red-600 print-keep-together"
                                                >
                                                    {/* Left Side: Contraindication Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-bold text-red-400 print:text-[8pt] print:text-red-950">
                                                            {avoid.drugOrClass}:{' '}
                                                        </span>
                                                        <span className="text-sm text-slate-200 print:text-[8pt] print:text-gray-800">
                                                            {typeof avoid.reasonToAvoid === 'string'
                                                                ? avoid.reasonToAvoid
                                                                : activeTab === 'clinical'
                                                                    ? avoid.reasonToAvoid?.clinical
                                                                    : avoid.reasonToAvoid?.patientFriendly}
                                                        </span>
                                                    </div>

                                                    {avoid.severity && (
                                                        <>
                                                            {/* Vertical Divider Line */}
                                                            <div className="w-0 border-r border-[#A5A6FF]/60 my-0.5 shrink-0 print:border-red-300" />

                                                            {/* Right Side: Badge Slot with Fixed Width for Grid Alignment */}
                                                            <div className="w-36 flex items-center justify-center shrink-0">
                                                                <SeverityBadge
                                                                    severity={avoid.severity}
                                                                    isPatientMode={activeTab === 'patient'}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ResultsDashboard;