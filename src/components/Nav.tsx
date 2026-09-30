import React, { useState } from 'react';
import darkLogo from '../assets/malt-ai-dm.png'

type UserRole = 'doctor' | 'patient';

export const Nav: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');

  const handleToggle = (role: UserRole) => {
    setSelectedRole(role);
  };

  return (
<header className="p-5 sticky flex flex-row justify-between items-center top-0 z-50 w-full bg-[#1400A9]">
  {/* Logo height locked to dynamic viewport scaling */}
  <img 
    className="h-[clamp(5rem,6.5vw,6.5rem)] w-auto object-contain" 
    src={darkLogo} 
    alt="Logo for dark mode." 
  />

  {/* Text size locked to proportional viewport scaling */}
  <section className="flex flex-row justify-around text-[clamp(0.5rem,2.5vw,2rem)] text-white w-1/2">
    <button
      type="button"
      aria-pressed={selectedRole === 'doctor'}
      onClick={() => handleToggle('doctor')}
      className={`cursor-pointer ${selectedRole === 'doctor' ? 'selectedButton' : ''}`}
    >
      doctor
    </button>
    <button
      type="button"
      aria-pressed={selectedRole === 'patient'}
      onClick={() => handleToggle('patient')}
      className={`cursor-pointer ${selectedRole === 'patient' ? 'selectedButton' : ''}`}
    >
      patient
    </button>
  </section>
</header>
  );
};

export default Nav;