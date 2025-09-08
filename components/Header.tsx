
import React from 'react';
import { GeneratorType } from '../types';
import { ArrowLeftIcon } from './icons';

interface HeaderProps {
    generatorType: GeneratorType;
    onBack: () => void;
}

const TITLES: Record<GeneratorType, { title: string }> = {
    QCC: {
        title: 'QCC Generator',
    },
    IP: {
        title: 'IP Generator',
    },
};

const Header: React.FC<HeaderProps> = ({ generatorType, onBack }) => {
  const { title } = TITLES[generatorType];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-2 -ml-2 rounded-full transition">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;