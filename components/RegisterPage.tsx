
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from './icons';
import { Page } from '../types';

interface RegisterPageProps {
    onNavigate: (page: Page) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('كلمتا المرور غير متطابقتين.');
            return;
        }

        const result = register(name, phone, password, referralCode);

        if (result === 'exists') {
            setError('هذا الرقم مسجل بالفعل. حاول تسجيل الدخول.');
        } else if (result === 'invalid_referral') {
            setError('كود الدعوة الذي أدخلته غير صحيح.');
        } else {
            // App.tsx effect will handle navigation to profile page
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 animate-fade-in">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <div className="text-center mb-8">
                        <div className="inline-block bg-indigo-100 p-4 rounded-full mb-4 ring-4 ring-indigo-50">
                            <UserIcon className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">إنشاء حساب جديد</h1>
                        <p className="text-gray-500 mt-2">انضم إلينا للاستفادة من جميع خدماتنا.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                الاسم الكامل
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                                autoComplete="name"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                رقم الهاتف
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                                autoComplete="tel"
                                placeholder="05xxxxxxxx"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                كلمة المرور
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                                minLength={6}
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                تأكيد كلمة المرور
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
                                كود الدعوة (اختياري)
                            </label>
                            <input
                                id="referralCode"
                                type="text"
                                value={referralCode}
                                onChange={(e) => setReferralCode(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                placeholder="إذا دعاك صديق، أدخل الكود هنا"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                        >
                            إنشاء الحساب
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        لديك حساب بالفعل؟{' '}
                        <button onClick={() => onNavigate('login')} className="font-semibold text-indigo-600 hover:text-indigo-500">
                            سجل الدخول من هنا
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
