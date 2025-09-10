import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons';
import { GeneratorType, ReportGenerationParams } from '../types';

interface ModalProps {
  message: string;
  onClose: () => void;
}

const ValidationModal: React.FC<ModalProps> = ({ message, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative mx-4 p-6 sm:p-8 border w-full max-w-sm shadow-lg rounded-2xl bg-white"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
            <h3 className="text-xl leading-6 font-bold text-gray-900">Perhatian!!!</h3>
            <div className="mt-4 px-7 py-3">
                <p className="text-base text-gray-600">{message}</p>
            </div>
            <div className="items-center px-4 py-3">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                    Tutup
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};


interface InputFormProps {
  onGenerate: (data: ReportGenerationParams) => void;
  isLoading: boolean;
  generatorType: GeneratorType;
}

const LABELS: Record<GeneratorType, {
    mainLabel: string;
    mainPlaceholder: string;
    currentLabel: string;
    currentPlaceholder: string;
    desiredLabel: string;
    desiredPlaceholder: string;
}> = {
    QCC: {
        mainLabel: "Tema QCC",
        mainPlaceholder: "Contoh: Mengurangi waktu tunggu proses produksi di lini A",
        currentLabel: "Kondisi Saat Ini (Masalah)",
        currentPlaceholder: "Jelaskan masalah yang sedang dihadapi secara rinci. Apa datanya? Apa dampaknya?",
        desiredLabel: "Kondisi yang Diinginkan (Target)",
        desiredPlaceholder: "Jelaskan tujuan atau target yang ingin dicapai. Apa metrik keberhasilannya?",
    },
    IP: {
        mainLabel: "Judul Proyek IP",
        mainPlaceholder: "Contoh: Peningkatan Efisiensi Penggunaan Energi pada Mesin X",
        currentLabel: "Problem Statement",
        currentPlaceholder: "Gambarkan masalah bisnis yang ada, dampaknya, dan mengapa ini penting untuk diselesaikan.",
        desiredLabel: "Goal Statement (SMART)",
        desiredPlaceholder: "Definisikan tujuan yang spesifik, terukur, dapat dicapai, relevan, dan berbatas waktu.",
    }
};

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, generatorType }) => {
  const [theme, setTheme] = useState<string>('');
  const [additionalData, setAdditionalData] = useState<string>('');
  const [currentCondition, setCurrentCondition] = useState<string>('');
  const [desiredCondition, setDesiredCondition] = useState<string>('');
  
  // State for IP-specific data
  const [supportingDataBefore, setSupportingDataBefore] = useState<string>('');
  const [supportingDataAfter, setSupportingDataAfter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup function to ensure scroll is restored when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let isFormValid = false;
    if (generatorType === 'QCC') {
        isFormValid = theme.trim() !== '' && currentCondition.trim() !== '' && desiredCondition.trim() !== '';
    } else if (generatorType === 'IP') {
        isFormValid = theme.trim() !== '' && 
                      currentCondition.trim() !== '' && 
                      desiredCondition.trim() !== '' && 
                      supportingDataBefore.trim() !== '' && 
                      supportingDataAfter.trim() !== '';
    }

    if (!isFormValid) {
        setModalMessage('Data Belum Lengkap, Mohon Lengkapi data terlebih dahulu.');
        setIsModalOpen(true);
        return;
    }

    const params: ReportGenerationParams = { theme, additionalData, currentCondition, desiredCondition };
    if (generatorType === 'IP') {
        params.supportingDataBefore = supportingDataBefore;
        params.supportingDataAfter = supportingDataAfter;
    }
    onGenerate(params);
  };

  const labels = LABELS[generatorType];
  const commonInputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-shadow";

  return (
    <>
      {isModalOpen && <ValidationModal message={modalMessage} onClose={() => setIsModalOpen(false)} />}
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200">
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div>
              <label htmlFor="qcc-theme" className="block text-base font-medium text-gray-700 mb-2">
                {labels.mainLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="qcc-theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder={labels.mainPlaceholder}
                className={commonInputClass}
              />
            </div>
             <div>
              <label htmlFor="current-condition" className="block text-base font-medium text-gray-700 mb-2">
                {labels.currentLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="current-condition"
                value={currentCondition}
                onChange={(e) => setCurrentCondition(e.target.value)}
                rows={3}
                placeholder={labels.currentPlaceholder}
                className={commonInputClass}
              ></textarea>
            </div>
             <div>
              <label htmlFor="desired-condition" className="block text-base font-medium text-gray-700 mb-2">
                {labels.desiredLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="desired-condition"
                value={desiredCondition}
                onChange={(e) => setDesiredCondition(e.target.value)}
                rows={3}
                placeholder={labels.desiredPlaceholder}
                className={commonInputClass}
              ></textarea>
            </div>
            
            {generatorType === 'IP' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="data-sebelum" className="block text-base font-medium text-gray-700 mb-2">
                      Data Sebelum <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="data-sebelum"
                      value={supportingDataBefore}
                      onChange={(e) => setSupportingDataBefore(e.target.value)}
                      rows={3}
                      placeholder="Jelaskan data kuantitatif sebelum perbaikan (misal: % reject, waktu downtime, biaya)."
                      className={commonInputClass}
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="data-sesudah" className="block text-base font-medium text-gray-700 mb-2">
                      Data Sesudah (Target) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="data-sesudah"
                      value={supportingDataAfter}
                      onChange={(e) => setSupportingDataAfter(e.target.value)}
                      rows={3}
                      placeholder="Jelaskan data kuantitatif yang ditargetkan setelah perbaikan."
                      className={commonInputClass}
                    ></textarea>
                  </div>
              </div>
            )}

            {generatorType !== 'IP' && (
              <div>
                <label htmlFor="additional-data" className="block text-base font-medium text-gray-700 mb-2">
                  Data Tambahan (Opsional)
                </label>
                <textarea
                  id="additional-data"
                  value={additionalData}
                  onChange={(e) => setAdditionalData(e.target.value)}
                  rows={3}
                  placeholder="Sebutkan lokasi, nama tim, atau data lain yang relevan di sini..."
                  className={commonInputClass}
                ></textarea>
              </div>
            )}
          </div>
          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-x-3 px-6 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-6 h-6" />
                  <span>Buat Laporan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default InputForm;