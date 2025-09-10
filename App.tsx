import React, { useState, useCallback } from 'react';
import { AnyReport, GeneratorType, ReportGenerationParams } from './types';
import { generateReport } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ReportDisplay from './components/ReportDisplay';
import { SparklesIcon } from './components/icons';
import Flowchart from './components/Flowchart';
import GeneratorSelector from './components/GeneratorSelector';
import LoginPage from './components/LoginPage';
import SuccessPopup from './components/SuccessPopup';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [generatorType, setGeneratorType] = useState<GeneratorType | null>(null);
  const [reportData, setReportData] = useState<AnyReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setGeneratorType(null);
    setReportData(null);
    setError(null);
    setIsLoading(false);
  };

  const handleGenerateReport = useCallback(async (params: ReportGenerationParams) => {
    if (!generatorType) return;

    setIsLoading(true);
    setError(null);
    setReportData(null);

    try {
      const report = await generateReport(generatorType, params);
      setReportData(report);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error(err);
      setError('Gagal menghasilkan laporan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [generatorType]);
  
  const handleReportUpdate = (updatedReport: AnyReport) => {
    setReportData(updatedReport);
  }

  const handleBackToSelection = () => {
    setGeneratorType(null);
    setReportData(null);
    setError(null);
    setIsLoading(false);
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header generatorType={generatorType} onBack={handleBackToSelection} onLogout={handleLogout} />
      
      {showSuccessPopup && <SuccessPopup onClose={() => setShowSuccessPopup(false)} />}

      {!generatorType ? (
        <GeneratorSelector onSelectGenerator={setGeneratorType} />
      ) : (
        <main className="container mx-auto px-4 py-12">
          <Flowchart generatorType={generatorType}/>
          <div className="mt-8">
            <InputForm onGenerate={handleGenerateReport} isLoading={isLoading} generatorType={generatorType} />
          </div>
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-8 bg-white rounded-2xl border border-gray-200">
              <SparklesIcon className="w-12 h-12 text-indigo-500 animate-pulse" />
              <p className="mt-4 text-lg font-semibold text-gray-700">AI sedang bekerja...</p>
              <p className="text-gray-500">Menyusun laporan {generatorType} untuk Anda.</p>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg" role="alert">
              <p className="font-bold">Terjadi Kesalahan</p>
              <p>{error}</p>
            </div>
          )}

          {reportData && (
            <div className="mt-8">
              <ReportDisplay 
                report={reportData} 
                onUpdateReport={handleReportUpdate}
              />
            </div>
          )}
        </main>
      )}

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>© GAS Department, 2025.</p>
      </footer>
    </div>
  );
};

export default App;
