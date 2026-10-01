import React, { useState } from 'react';

interface FormState {
  medications: string;
  allergies: string;
  contextDetails: string;
}

export const PatientForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    medications: '',
    allergies: '',
    contextDetails: '',
  });

  // Destructure for easy variable access anywhere in the component
  const { medications, allergies, contextDetails } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted Patient Context:', formData);
    // Submit logic / API call goes here
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col items-center select-text">
      {/* Header & Subheader */}
      <section className="text-center mb-8 max-w-2xl">
        <h1 className="text-3xl font-extrabold text-white mb-3 leading-tight">
          Medication Alternative Discovery
        </h1>
        <p className="text-[#A5A6FF] text-base">
          Enter current prescriptions, known allergies, and relevant case context to generate safe, AI-guided medication options.
        </p>
      </section>

      {/* Form with side-by-side inputs and bottom action button */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex flex-col gap-6 text-white"
      >
        {/* Side-by-Side Inputs Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Box 1: Medications */}
          <div className="flex flex-col gap-2">
            <label htmlFor="medications" className="medications-label text-lg font-medium">
              Medications
            </label>
            <textarea
              id="medications"
              name="medications"
              rows={4}
              value={formData.medications}
              onChange={handleChange}
              placeholder="List any current prescriptions, dosages, or supplements..."
              className="w-full p-4 rounded-xl bg-[#1400A9] border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Box 2: Allergies */}
          <div className="flex flex-col gap-2">
            <label htmlFor="allergies" className="text-lg font-medium">
              Allergies
            </label>
            <textarea
              id="allergies"
              name="allergies"
              rows={4}
              value={formData.allergies}
              onChange={handleChange}
              placeholder="List known drug allergies or severe sensitivities..."
              className="w-full p-4 rounded-xl bg-[#1400A9] border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text"
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          {/* Box 3: Context Details */}
          <div className="flex flex-col gap-2">
            <label htmlFor="contextDetails" className="text-lg font-medium">
              Case Details
            </label>
            <textarea
              id="contextDetails"
              name="contextDetails"
              rows={4}
              value={formData.contextDetails}
              onChange={handleChange}
              placeholder="Describe relevant medical history, specific concerns, or symptoms..."
              className="w-full p-4 rounded-xl bg-[#1400A9] border border-[#A5A6FF]/30 text-white placeholder-[#A5A6FF] focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] resize-none select-text cursor-text"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>

        {/* Action: Send Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-2">
          <div className="md:col-start-2">
            <button
              type="submit"
              className="submit-button w-full cursor-pointer py-4 rounded-xl bg-[#A5A6FF] border border-[#A5A6FF]/30 text-[#1400A9] font-bold hover:bg-white hover:text-[#1400A9] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A5A6FF] text-[1.5rem]"
              disabled={!medications.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;