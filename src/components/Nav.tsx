// Nav.tsx
import React from 'react';
import darkLogo from '../assets/malt-ai-dm.png';

export type UserRole = 'doctor' | 'patient';

interface NavProps {
  selectedRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  showToggle?: boolean; // Controls visibility of the role toggle
}

export const Nav: React.FC<NavProps> = ({
  selectedRole = 'doctor',
  onRoleChange,
  showToggle = true,
}) => {
  const handleToggle = (role: UserRole) => {
    if (onRoleChange) {
      onRoleChange(role);
    }
  };

  return (
    <header className="p-5 mb-10 sticky flex flex-row justify-between items-center top-0 z-50 w-full bg-[#1400A9]">
      {/* Logo height locked to dynamic viewport scaling */}
      <img
        className="h-[clamp(5rem,6.5vw,6.5rem)] w-auto object-contain"
        src={darkLogo}
        alt="Logo for dark mode."
      />

      {/* Render toggles only when results exist */}
      {showToggle && (
        <section className="flex flex-row justify-around text-[clamp(0.5rem,2.5vw,2rem)] text-white w-1/2">
          <button
            type="button"
            aria-pressed={selectedRole === 'doctor'}
            onClick={() => handleToggle('doctor')}
            className={`nav-button cursor-pointer ${
              selectedRole === 'doctor' ? 'selectedButton' : ''
            }`}
          >
            doctor
          </button>
          <button
            type="button"
            aria-pressed={selectedRole === 'patient'}
            onClick={() => handleToggle('patient')}
            className={`nav-button cursor-pointer ${
              selectedRole === 'patient' ? 'selectedButton' : ''
            }`}
          >
            patient
          </button>
        </section>
      )}
    </header>
  );
};

export default Nav;