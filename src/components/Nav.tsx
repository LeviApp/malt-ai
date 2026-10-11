import React from 'react';
import darkModeLogo from '../assets/malt-ai-dm.png';
import lightModeLogo from '../assets/malt-ai-lm.png';
import MedicalNotice from './MedicalNotice';

export const Nav: React.FC = () => {
  return (
    <header className="p-5 md:mb-10 sticky flex flex-row justify-between items-center top-0 z-50 w-full bg-[#1400A9] print:bg-transparent print:static print:p-2 print:mb-2 print:border-b print:border-gray-300">
      {/* Logos: Dark Mode for Screen, Light Mode for Print */}
      <img
        className="h-[clamp(5rem,6.5vw,6.5rem)] w-auto object-contain print:hidden"
        src={darkModeLogo}
        alt="Malt AI Logo"
      />
      <img
        className="hidden print:block h-8 w-auto object-contain"
        src={`${window.location.origin}${lightModeLogo}`}
        alt="Malt AI Logo"
      />

      {/* DESKTOP ONLY Notice Box */}
      <MedicalNotice className="hidden md:flex p-4 m-5 print:hidden" />

      {/* PRINT ONLY Header Banner */}
      <div className="hidden print:flex flex-col text-right text-[7.5pt] leading-tight text-gray-600 max-w-lg print:ml-4">
        <p className="font-bold text-gray-800">Important Medical Notice</p>
        <p>
          This AI decision support tool provides informational drug insights for reference only and is not a substitute for professional clinical judgment. Always consult a licensed clinician before making medication changes.
        </p>
      </div>
    </header>
  );
};

export default Nav;