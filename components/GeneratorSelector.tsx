
import React from 'react';
import { GeneratorType } from '../types';
import { ArrowRightIcon } from './icons';

interface GeneratorSelectorProps {
    onSelectGenerator: (type: GeneratorType) => void;
}

const generatorOptions = [
    { 
        type: 'IP' as GeneratorType, 
        initials: 'IP',
        title: 'IP Generator', 
        color: 'sky' 
    },
    { 
        type: 'QCC' as GeneratorType, 
        initials: 'QCC',
        title: 'QCC Generator', 
        color: 'indigo' 
    },
];

const colorClasses = {
    indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        groupHover: 'group-hover:bg-indigo-100',
        border: 'border-indigo-200',
    },
    sky: {
        bg: 'bg-sky-50',
        text: 'text-sky-600',
        groupHover: 'group-hover:bg-sky-100',
        border: 'border-sky-200',
    },
};

const GeneratorSelector: React.FC<GeneratorSelectorProps> = ({ onSelectGenerator }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-gray-800">Improvement Generator</h1>
                <p className="mt-2 text-lg text-gray-600">Pilih jenis improvement yang ingin Kamu buat.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
                {generatorOptions.map(option => {
                    const colors = colorClasses[option.color];
                    return (
                        <button 
                            key={option.type} 
                            onClick={() => onSelectGenerator(option.type)}
                            className={`group bg-white p-6 rounded-2xl border border-gray-200 text-left hover:border-transparent hover:shadow-lg transition-all duration-300 flex flex-col`}
                        >
                            <div className={`flex items-center justify-center w-14 h-14 ${colors.bg} rounded-full mb-4`}>
                                <span className={`text-xl font-bold ${colors.text}`}>{option.initials}</span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 flex-grow">{option.title}</h2>
                            <div className={`mt-4 text-sm font-semibold ${colors.text} flex items-center gap-2`}>
                                Pilih Generator
                                <ArrowRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"/>
                            </div>
                        </button>
                    )
                })}
            </div>
             <footer className="text-center py-8 text-sm text-gray-500 mt-10">
                <p>© GAS Department, 2025.</p>
            </footer>
        </div>
    );
};

export default GeneratorSelector;