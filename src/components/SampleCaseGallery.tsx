import React from 'react';
import { SAMPLE_CASE, type SampleCase } from './SampleCase';

interface SampleCasesGalleryProps {
  onSelectCase: (demoCase: SampleCase) => void;
  selectedCaseId?: number;
}

export const SampleCasesGallery: React.FC<SampleCasesGalleryProps> = ({
  onSelectCase,
}) => {
  return (
    <div className="w-full max-w-6xl mx-auto mb-6 px-2 sm:px-0">
      {/* Grid mapping all 15 case cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[175px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">  
    {SAMPLE_CASE.map((study) => {
    return (
<button
  key={study.id}
  type="button"
  onClick={() => onSelectCase(study)}
  className={`sample-card group text-left p-4 rounded-xl transition-all cursor-pointer flex flex-col justify-between bg-[#A5A6FF] hover:bg-white min-h-[140px] h-full`}
>
  <div>
    {/* Title & Side Category Badge */}
    <div className="flex items-start justify-between gap-2 mb-2">
      <h4 className="text-sm font-bold text-[#1400A9] transition-colors leading-snug">
        {study.title}
      </h4>
      <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black text-white">
        {study.category}
      </span>
    </div>

    {/* Quick Summary */}
    <p className="text-xs text-[#1400A9] leading-relaxed line-clamp-3">
      {study.quickSummary}
    </p>
  </div>
</button>
    );
  })}
</div>
    </div>
  );
};