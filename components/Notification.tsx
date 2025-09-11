import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './icons';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    setIsVisible(true);

    const timer = setTimeout(() => {
      // Unmount animation
      setIsVisible(false);
      // Actual close after animation
      setTimeout(onClose, 300); 
    }, 3000); // Display for 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 p-4 w-full max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg transition-transform duration-300 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      role="alert"
    >
      <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
      <div>
        <p className="font-semibold text-gray-800">Sukses</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Notification;
