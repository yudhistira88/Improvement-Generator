import React, { useEffect } from 'react';
import { CheckCircleIcon } from './icons';

interface SuccessPopupProps {
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

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
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl leading-6 font-bold text-gray-900">Laporan Berhasil Dibuat</h3>
            <div className="mt-4 px-7 py-3">
                <p className="text-base text-gray-600">
                    Data Improvement Berhasil dibuat. Silahkan di review kembali hasil yang telah dibuat. Lanjut Unduh PDF, Word atau bisa Buat langsung File PPT. Semangat Berkarya Tim GA Supporting!!!
                </p>
            </div>
            <div className="items-center px-4 py-3">
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-green-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                    Tutup
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPopup;