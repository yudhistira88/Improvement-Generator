
import React, { useState } from 'react';
import { SparklesIcon } from './icons';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const validCredentials = [
  { username: 'admin', password: 'password' },
  { username: 'Ulismeong', password: 'Baronang090925*' },
  { username: 'yudhistira.an', password: 'Bismillah.11' },
  { username: 'bintoro', password: 'AutocadGAS_2025' },
  { username: 'rida.hai', password: 'tanyasiapa?' },
  { username: 'Vica.na', password: 'Agust2025++*' },
  { username: 'surya.am', password: 'WeakHero2025*' },
  { username: 'Dwi.pa', password: 'Agustus142++' },
  { username: 'anita.he', password: 'Agustus2025++' },
  { username: 'Retno.dw', password: 'Bagas2025@' },
  { username: 'puji', password: 'musthofa*2025' },
  { username: 'clarice', password: 'vilodia!!' },
  { username: 'Dedy.hd', password: 'Honda2025' },
  { username: 'Oi', password: 'Oi' },
  { username: 'dwi.hm', password: 'dwi.hm' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const isValid = validCredentials.some(
      (cred) => cred.username === username && cred.password === password
    );

    if (isValid) {
      onLoginSuccess();
    } else {
      setError('Username atau password salah.');
    }
  };
  
  const commonInputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-shadow";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <SparklesIcon className="w-16 h-16 text-indigo-500 mx-auto" />
            <h1 className="text-4xl font-bold text-gray-800 mt-4">Improvement Generator</h1>
            <p className="mt-2 text-lg text-gray-600">Silakan login untuk melanjutkan</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-base font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className={commonInputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={commonInputClass}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-800 rounded-lg text-center" role="alert">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-x-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
              >
                Login
              </button>
            </div>
          </form>
        </div>
        <footer className="text-center py-6 text-sm text-gray-500">
            <p>© GAS Department, 2025.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;