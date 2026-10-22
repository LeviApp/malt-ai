import React, { useState } from 'react';
import { type AnalysisResponse } from '../services/api';
import { SeverityBadge } from './SeverityBadge';
import { SafetyGuardModal } from './SafetyGuardModal';
interface ResultsDashboardProps {
    data: AnalysisResponse;
    onReset?: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
    data,
    onReset,
}) => {
    const [activeTab, setActiveTab] = useState<'clinical' | 'patient'>('clinical');
    const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'fail'>('idle');
const { 
  medicationAnalyses = [], 
  regimenInteractionNotes = [],
  safety_modal_trigger
} = (data as AnalysisResponse) || {};

// Extract the unified alertDirective from the first interaction note if present
const alertDirective = regimenInteractionNotes[0]?.alertDirective;

const isEmergency = data?.isEmergency ?? false;
const isHighAcuity = data?.isHighAcuity ?? false;

    const handleDownloadPdf = async () => {
        if (pdfStatus === 'generating') return;

        try {
            setPdfStatus('generating');
            const container = document.getElementById('results-container');
            if (!container) {
                alert("Results container not found!");
                setPdfStatus('fail');
                setTimeout(() => setPdfStatus('idle'), 3500);
                return;
            }

            const reportHTML = container.innerHTML;
            const API_BASE_URL = import.meta.env.VITE_MALT_API_URL || 'http://localhost:5001/api';

            const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportHTML })
            });

            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();

            // Generate timestamp string
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10);
            const timePart = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
            const fileName = `Malt-AI-Patient-Summary-d-${datePart}-t-${timePart}.pdf`;

            // Detect restricted in-app social browsers (like Facebook/Instagram webviews)
            const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
            const isInAppBrowser = /FBAN|FBAV|Instagram|Twitter|LinkedInApp/i.test(ua);

            const blobUrl = URL.createObjectURL(blob);

            if (isInAppBrowser) {
                // In-app browsers block direct downloads; open as Data/Blob URL in a new tab 
                // so the user can view/save it using the platform's built-in viewer.
                const opened = window.open(blobUrl, '_blank');
                if (!opened) {
                    window.location.href = blobUrl;
                }
            } else {
                // Standard Desktop & Mobile Browsers (Chrome, Safari, Firefox, Edge)
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Clean up the object URL after a safe delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);

            setPdfStatus('success');
            setTimeout(() => setPdfStatus('idle'), 2500);

        } catch (err) {
            console.error(err);
            setPdfStatus('fail');
            setTimeout(() => setPdfStatus('idle'), 3500);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-8 text-white select-text print:p-0 print:m-0 print:w-full print:max-w-none print:gap-2 print:text-black print:bg-white">
            {/* Page Break & Global Print Styles */}
            <style>{`
                @media print {
                    @page {
                        margin: 15mm 12mm;
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
            {isEmergency ? (<SafetyGuardModal
  isHighAcuity={isHighAcuity}
  alertDirective={alertDirective}
  safety_modal_trigger={safety_modal_trigger}
  regimenInteractionNotes={regimenInteractionNotes}
  onReset={onReset}
/>) : (
                <>
                    {/* Top Header Actions */}
                    <div className="flex flex-col gap-2 pb-2 print:pb-1">
                        {/* Main Header Row: Title & Action Buttons side-by-side at >= 525px */}
                        <div className="flex flex-col min-[525px]:flex-row min-[525px]:justify-between min-[525px]:items-center gap-2 sm:gap-4">

                            {/* Main Title & Subtitle Grouping for < 525px */}
                            <div className="flex flex-col text-center min-[525px]:text-left min-w-0">
                                {/* Title with restored truncate class */}
                                <h2 className="text-2xl min-[525px]:text-lg sm:text-[1.2rem] md:text-3xl font-extrabold tracking-tight text-white truncate print:text-[11pt] print:font-bold print:text-gray-900">
                                    Analysis Results
                                </h2>
                                {/* Subtitle sits right under title on screens under 525px */}
                                <p className="text-[#A5A6FF] text-sm min-[525px]:hidden mt-1 font-medium">
                                    AI-generated clinical analysis and patient-facing breakdown.
                                </p>
                            </div>

                            {/* Action Buttons: Full width flex container matching toggle bar below */}
                            <div className="flex items-center justify-between w-full min-[525px]:w-auto gap-2 sm:gap-3 print:hidden shrink-0 pt-1 min-[525px]:pt-0">
                                <button
                                    type="button"
                                    onClick={handleDownloadPdf}
                                    disabled={pdfStatus === 'generating'}
                                    className={`flex-1 min-[525px]:flex-none px-3 py-2 min-[525px]:px-2.5 min-[525px]:py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-medium whitespace-nowrap text-[13px] min-[550px]:text-sm sm:text-sm ${pdfStatus === 'success'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : pdfStatus === 'fail'
                                            ? 'bg-rose-100 text-rose-800'
                                            : pdfStatus === 'generating'
                                                ? 'bg-[#A5A6FF] text-[#1400A9] cursor-wait'
                                                : 'bg-[#A5A6FF] text-[#1400A9] hover:bg-white cursor-pointer'
                                        }`}
                                    title="Print or export analysis"
                                >
                                    {pdfStatus === 'success' ? (
                                        <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : pdfStatus === 'fail' ? (
                                        <svg className="w-4 h-4 shrink-0 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : pdfStatus === 'generating' ? (
                                        <svg
                                            className="animate-spin w-4 h-4 shrink-0 text-[#1400A9]"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                d="M12 2a10 10 0 0110 10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                            />
                                        </svg>
                                    )}

                                    {pdfStatus === 'generating'
                                        ? 'Generating PDF...'
                                        : pdfStatus === 'success'
                                            ? 'Downloaded!'
                                            : pdfStatus === 'fail'
                                                ? 'Failed!'
                                                : 'Download PDF'}
                                </button>

                                {onReset && (
                                    <button
                                        type="button"
                                        onClick={onReset}
                                        className="flex-1 min-[525px]:flex-none px-3 py-2 min-[525px]:px-2.5 min-[525px]:py-1.5 sm:px-5 sm:py-2 rounded-xl bg-[#A5A6FF] text-[#1400A9] hover:bg-white font-medium transition-all text-[13px] min-[550px]:text-sm sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                        {/* Subtitle placed full-width below the header row on screens 525px and up */}
                        <p className="hidden min-[525px]:block text-[#A5A6FF] text-sm sm:text-base print:text-[7.5pt] print:text-gray-600 print:mt-0.5">
                            AI-generated clinical analysis and patient-facing breakdown.
                        </p>
                    </div>

                    <hr className="border-t border-slate-700 my-3 print:hidden" />
                    {/* Mode Switcher */}

                    <div className="w-full md:w-auto flex items-center print:hidden">
                        <button
                            type="button"
                            onClick={() => setActiveTab('clinical')}
                            className={`flex-1 md:flex-initial text-center px-6 py-3 rounded-l-lg text-base md:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'clinical'
                                ? 'bg-white text-[#1400A9]'
                                : 'text-[#1400A9] bg-[#A5A6FF] hover:bg-white'
                                }`}
                        >
                            Clinical View
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('patient')}
                            className={`flex-1 md:flex-initial text-center px-6 py-3 rounded-r-lg text-base md:text-sm font-semibold transition-all cursor-pointer ${activeTab === 'patient'
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
                                className="p-6 rounded-2xl bg-[#1400A9] border border-[#A5A6FF]/20 flex flex-col gap-6 print:p-2 print:gap-1.5 print:border-gray-300 print:bg-white print:text-black print:rounded-xl print-keep-together"
                            >
                                {/* Target Drug Title Bar - Adjusted width constraints for print */}
                                <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4 border-b border-[#A5A6FF]/10 pb-4 print:border-gray-200 print:pb-1 print-keep-together">
                                    <div className="shrink-0 max-w-[65%] print:max-w-[65%] flex flex-col justify-center">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-[#A5A6FF] print:text-[7.5pt] print:text-indigo-800 print:font-bold block">
                                            Target Drug #{index + 1}
                                        </span>
                                        <h3 className="text-2xl font-bold text-white print:text-[10pt] print:font-bold print:text-gray-900 mt-0.5 print:whitespace-nowrap print:overflow-hidden print:text-ellipsis">
                                            {item.targetDrug}
                                        </h3>
                                    </div>
                                    {item.reasonForSwitch && (
                                        <div className="pl-3 border-l-2 border-[#A5A6FF]/60 print:border-indigo-400 flex-1 min-w-0 flex items-center">
                                            <span className="text-xs sm:text-sm text-slate-200 print:text-[7pt] print:text-gray-700 block leading-tight">
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
                                            <svg className="w-5 h-5 text-emerald-400 print:w-3 print:h-3 print:text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Primary Alternatives
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 print:grid-cols-1 print:gap-1.5">
                                            {item.primaryAlternatives.map((alt, altIdx) => (
                                                <div key={altIdx} className="p-4 rounded-xl bg-black border border-[#A5A6FF]/20 flex flex-col gap-3 print:p-1.5 print:gap-0.5 print:bg-emerald-50/40 print:border-emerald-300 print:border-l-4 print:border-l-emerald-600 print-keep-together">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#A5A6FF]/10 pb-2 print:border-emerald-200 print:pb-0.5">
                                                        <span className="font-bold text-lg text-white print:text-[8.5pt] print:text-emerald-950">
                                                            {alt.drugName}
                                                        </span>
                                                        {alt.drugClass && (
                                                            <span className="text-sm px-0 py-1 rounded-md text-emerald-400 font-semibold print:px-1 print:py-0.5 print:text-[7pt] print:text-emerald-600">
                                                                {typeof alt.drugClass === 'string' ? alt.drugClass : activeTab === "patient" ? alt.drugClass.patientFriendly : alt.drugClass.clinical}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {alt.whyItIsTheBestAlternative && (
                                                        <p className="text-sm text-slate-100 print:text-[8pt] print:text-gray-800 print:leading-tight">
                                                            <strong className="text-emerald-400 print:text-emerald-900">Rationale: </strong>
                                                            {typeof alt.whyItIsTheBestAlternative === 'string' ? alt.whyItIsTheBestAlternative : activeTab === 'clinical' ? alt.whyItIsTheBestAlternative?.clinical : alt.whyItIsTheBestAlternative?.patientFriendly}
                                                        </p>
                                                    )}
                                                    {alt.safetyConsiderations && (
                                                        <p className="text-sm text-slate-200 print:text-[8pt] print:text-gray-700 print:leading-tight">
                                                            <strong className="text-emerald-400 print:text-emerald-900">Safety Note: </strong>
                                                            {activeTab === 'clinical' ? alt.safetyConsiderations.clinical : alt.safetyConsiderations.patientFriendly}
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
                                            <svg className="w-5 h-5 text-yellow-400 print:w-3 print:h-3 print:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            Secondary Alternatives
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 print:grid-cols-1 print:gap-1.5">
                                            {item.secondaryAlternatives.map((alt, altIdx) => (
                                                <div key={altIdx} className="p-4 rounded-xl bg-black border border-[#A5A6FF]/10 flex flex-col gap-2 print:p-1.5 print:gap-0.5 print:bg-blue-50/30 print:border-blue-200 print:border-l-4 print:border-l-blue-500 print-keep-together">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-transparent print:border-blue-200 print:pb-0.5">
                                                        <span className="font-bold text-base text-white print:text-[8.5pt] print:text-blue-950">
                                                            {alt.drugName}
                                                        </span>
                                                        {alt.drugClass && (
                                                            <span className="text-sm px-0 py-1 rounded-md text-yellow-400 font-semibold print:px-1 print:py-0.5 print:text-[7pt] print:text-blue-500">
                                                                {typeof alt.drugClass === 'string' ? alt.drugClass : activeTab === "patient" ? alt.drugClass.patientFriendly : alt.drugClass.clinical}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {alt.whyItIsTheBestAlternative && (
                                                        <p className="text-sm text-slate-200 print:text-[8pt] print:text-gray-800 print:leading-tight">
                                                            {typeof alt.whyItIsTheBestAlternative === 'string' ? alt.whyItIsTheBestAlternative : activeTab === 'clinical' ? alt.whyItIsTheBestAlternative?.clinical : alt.whyItIsTheBestAlternative?.patientFriendly}
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
                                            <svg className="w-5 h-5 text-red-400 print:w-3 print:h-3 print:text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Medications to Avoid / Contraindications
                                        </h4>
                                        <div className="space-y-3 print:space-y-1">
                                            {item.medicationsToAvoid.map((avoid, avoidIdx) => (
                                                <div key={avoidIdx} className="p-3.5 rounded-xl bg-black flex flex-col md:flex-row print:flex-row items-stretch gap-3 md:gap-4 print:p-1.5 print:bg-red-50/70 print:border print:border-red-300 print:border-l-4 print:border-l-red-600 print-keep-together">
                                                    <div className="order-2 md:order-1 print:order-1 pt-3 border-t md:pt-0 md:border-t-0 print:pt-0 print:border-t-0 md:pr-4 print:pr-4 md:border-r print:border-r border-[#A5A6FF]/60 print:border-red-300 flex-1 min-w-0 flex items-center">
                                                        <div>
                                                            <span className="font-bold text-red-400 print:text-[8pt] print:text-red-950">
                                                                {avoid.drugOrClass}:{' '}
                                                            </span>
                                                            <span className="text-sm text-slate-200 print:text-[8pt] print:text-gray-800">
                                                                {typeof avoid.reasonToAvoid === 'string' ? avoid.reasonToAvoid : activeTab === 'clinical' ? avoid.reasonToAvoid?.clinical : avoid.reasonToAvoid?.patientFriendly}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {avoid.severity && (
                                                        <div className="order-1 md:order-2 print:order-2 w-full md:w-36 print:w-36 flex items-center justify-center shrink-0">
                                                            <SeverityBadge severity={avoid.severity} isPatientMode={activeTab === 'patient'} />
                                                        </div>
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