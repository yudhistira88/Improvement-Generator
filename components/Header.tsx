import React from 'react';
import { GeneratorType } from '../types';
import { ArrowLeftIcon, LogoutIcon } from './icons';

interface HeaderProps {
    generatorType: GeneratorType | null;
    onBack: () => void;
    onLogout: () => void;
}

const TITLES: Record<GeneratorType, { title: string }> = {
    QCC: {
        title: 'QCC Generator',
    },
    IP: {
        title: 'IP Generator',
    },
};

const Header: React.FC<HeaderProps> = ({ generatorType, onBack, onLogout }) => {
  const title = generatorType ? TITLES[generatorType].title : 'Improvement Generator';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
            {generatorType && (
              <button onClick={onBack} className="text-gray-500 hover:text-gray-800 p-2 -ml-2 rounded-full transition" title="Kembali ke Pilihan">
                  <ArrowLeftIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-600 p-2 rounded-lg transition-colors hover:bg-red-50" title="Keluar">
            <LogoutIcon className="w-6 h-6" />
            <span className="font-semibold hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;