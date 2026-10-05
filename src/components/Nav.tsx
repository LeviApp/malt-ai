import React from 'react';
import darkLogo from '../assets/malt-ai-dm.png';
import lightLogo from '../assets/malt-ai-lm.png';

export const Nav: React.FC = () => {
  return (
    <header className="p-5 md:mb-10 sticky flex flex-row justify-between items-center top-0 z-50 w-full bg-[#1400A9] print:bg-transparent print:static print:p-5 print:mb-4 print:border-b print:border-gray-300">
      {/* Logos: Dark Mode for Screen, Light Mode for Print */}
      <img
        className="h-[clamp(5rem,6.5vw,6.5rem)] w-auto object-contain print:hidden"
        src={darkLogo}
        alt="Malt AI Logo"
      />
      <img
        className="hidden print:block h-12 w-auto object-contain"
        src={lightLogo}
        alt="Malt AI Logo"
      />

      {/* DESKTOP ONLY Notice Box (hidden on mobile) */}
      <div className="hidden md:flex p-4 m-5 rounded-xl border border-amber-500 text-amber-200 items-start gap-3 text-sm sm:text-base leading-relaxed print:hidden">
        <svg
          className="w-6 h-6 text-amber-400 shrink-0 mt-0.5"
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

      {/* PRINT ONLY Header Banner */}
      <div className="hidden print:flex flex-col text-right text-[8pt] leading-tight text-gray-600 max-w-xl print:ml-5">
        <p className="font-bold text-gray-800">Important Medical Notice</p>
        <p>
          This AI decision support tool provides informational drug insights for reference only and is not a substitute for professional clinical judgment. Always consult a licensed clinician before making medication changes.
        </p>
      </div>
    </header>
  );
};

export default Nav;