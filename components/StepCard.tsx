import React, { useState } from 'react';

interface StepCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ title, children, actions }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className={`w-full flex justify-between items-center p-4 text-left ${isOpen ? 'border-b border-gray-200' : ''}`}>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
            {actions}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={isOpen ? 'Collapse section' : 'Expand section'}
            >
                <svg
                    className={`w-6 h-6 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
        </div>
      </div>
      {isOpen && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default StepCard;