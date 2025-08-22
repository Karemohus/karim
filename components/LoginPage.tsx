
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { WrenchScrewdriverIcon } from './icons';
import { Page } from '../types';

interface LoginPageProps {
    onNavigate: (page: Page) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(phone, password);
    if (result === 'failed') {
      setError('رقم الهاتف أو كلمة المرور غير صحيحة.');
    } else {
        // App.tsx effect will handle navigation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="text-center mb-8">
                <div className="inline-block bg-indigo-100 p-4 rounded-full mb-4 ring-4 ring-indigo-50">
                    <WrenchScrewdriverIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">تسجيل الدخول</h1>
                <p className="text-gray-500 mt-2">مرحباً بعودتك! أدخل بياناتك للوصول.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الهاتف (أو معرف المسؤول)
                    </label>
                    <input
                        id="phone"
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        required
                        autoComplete="tel"
                        placeholder="05xxxxxxxx أو karim"
                    />
                </div>
                <div>
                    <label htmlFor="password"  className="block text-sm font-medium text-gray-700 mb-1">
                        كلمة المرور
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                    />
                </div>
                
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                        <p>{error}</p>
                    </div>
                )}
                
                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg hover:shadow-indigo-500/50"
                >
                    تسجيل الدخول
                </button>
            </form>
             <p className="text-center text-sm text-gray-600 mt-6">
                ليس لديك حساب؟{' '}
                <button onClick={() => onNavigate('register')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                    أنشئ حسابًا جديدًا
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
