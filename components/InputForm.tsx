import React, { useState } from 'react';
import { SparklesIcon } from './icons';
import { GeneratorType, ReportGenerationParams } from '../types';

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


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
        const params: ReportGenerationParams = { theme, additionalData, currentCondition, desiredCondition };

        if (generatorType === 'IP') {
            params.supportingDataBefore = supportingDataBefore;
            params.supportingDataAfter = supportingDataAfter;
        }
        onGenerate(params);
    }
  };

  const labels = LABELS[generatorType];
  const commonInputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-shadow";

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="qcc-theme" className="block text-base font-medium text-gray-700 mb-2">
              {labels.mainLabel}
            </label>
            <input
              id="qcc-theme"
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder={labels.mainPlaceholder}
              className={commonInputClass}
              required
            />
          </div>
           <div>
            <label htmlFor="current-condition" className="block text-base font-medium text-gray-700 mb-2">
              {labels.currentLabel}
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
              {labels.desiredLabel}
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
                    Data Sebelum
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
                    Data Sesudah (Target)
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
            disabled={isLoading || !theme.trim()}
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
  );
};

export default InputForm;