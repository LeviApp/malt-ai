// Nav.tsx
import React, { useState } from 'react';
import darkLogo from '../assets/malt-ai-dm.png';
import lightLogo from '../assets/malt-ai-lm.png'; // Light mode logo for print

export type UserRole = 'doctor' | 'patient';

interface NavProps {
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
}

export const Nav: React.FC<NavProps> = () => {
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);

  return (
    <header className="p-5 mb-10 sticky flex flex-row justify-between items-center top-0 z-50 w-full bg-[#1400A9] print:bg-transparent print:static print:p-5 print:mb-4 print:border-b print:border-gray-300">
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

      {/* Screen View Container */}
      <div className="w-full flex items-center justify-end md:justify-center print:hidden">
        {/* MOBILE / SMALL SCREENS (< 768px): Icon Badge with Tooltip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMobileTooltip(!showMobileTooltip)}
            onMouseEnter={() => setShowMobileTooltip(true)}
            onMouseLeave={() => setShowMobileTooltip(false)}
            className="md:hidden flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-300 text-xs font-medium border border-amber-500/40 hover:bg-amber-500/20 transition-colors focus:outline-none"
            aria-label="Important Medical Notice"
          >
            <svg
              className="w-4 h-4 text-amber-400 shrink-0"
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
            <span>Important Medical Notice</span>
          </button>

          {/* Floating Tooltip Card */}
          {showMobileTooltip && (
            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-gray-900 text-amber-200 text-xs rounded-lg shadow-xl z-50 border border-amber-500/40 backdrop-blur-md">
              This AI tool provides informational drug insights for reference only and is not a
              substitute for professional clinical judgment or direct physician consultation. Always
              consult a licensed healthcare professional or physician before changing, stopping, or
              starting any medication.
            </div>
          )}
        </div>

        {/* DESKTOP (>= 768px): Full Framed Box */}
        <div className="hidden md:flex p-4 m-5 rounded-xl border border-amber-500 text-amber-200 items-start gap-3 text-sm sm:text-base leading-relaxed">
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
      </div>

      {/* PRINT ONLY: Clean, Compact Disclaimer Header Banner */}
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