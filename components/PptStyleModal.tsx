import React from 'react';
import { PresentationStyle } from '../services/pptService';
import { SparklesIcon } from './icons';

interface PptStyleModalProps {
  onClose: () => void;
  onGenerate: (style: PresentationStyle) => void;
}

const styles: { id: PresentationStyle; name: string; description: string; colors: string[] }[] = [
  {
    id: 'minimalist',
    name: 'Minimalis',
    description: 'Putih, bersih, dan fokus pada konten teks.',
    colors: ['bg-white', 'border-gray-300', 'bg-gray-800'],
  },
  {
    id: 'professional',
    name: 'Bisnis Profesional',
    description: 'Warna biru navy dan abu-abu, cocok untuk laporan formal.',
    colors: ['bg-white', 'border-blue-800', 'bg-blue-800'],
  },
  {
    id: 'colorful',
    name: 'Modern Colorful',
    description: 'Warna-warna cerah dengan ikon pendukung yang menarik.',
    colors: ['bg-white', 'border-teal-500', 'bg-red-500'],
  },
];

const PptStyleModal: React.FC<PptStyleModalProps> = ({ onClose, onGenerate }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 sm:p-8 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <SparklesIcon className="w-10 h-10 text-indigo-500 mx-auto" />
          <h3 className="text-2xl font-bold text-gray-900 mt-2">Pilih Gaya Presentasi</h3>
          <p className="text-gray-600 mt-1">Pilih tema visual untuk file PowerPoint Anda.</p>
        </div>

        <div className="mt-6 space-y-4">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onGenerate(style.id)}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-1">
                  {style.colors.map((color, i) => (
                     <div key={i} className={`w-6 h-6 rounded-full border-2 ${color} ${i > 0 ? 'ring-2 ring-white' : ''}`}></div>
                  ))}
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{style.name}</p>
                    <p className="text-sm text-gray-500">{style.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
            <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-gray-100 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
                Batal
            </button>
        </div>
      </div>
    </div>
  );
};

export default PptStyleModal;
