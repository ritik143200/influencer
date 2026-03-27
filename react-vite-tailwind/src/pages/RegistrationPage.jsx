import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import AuthPage from './AuthPage';
import InfluencerRegistrationPage from './InfluencerRegistrationPage';

const RegistrationPage = ({ config }) => {
  const { navigate, params } = useRouter();
  const initialType = useMemo(() => {
    const t = params?.type;
    if (t === 'influencer') return 'influencer';
    return 'user';
  }, [params]);

  const [selected, setSelected] = useState(initialType);

  useEffect(() => {
    setSelected(initialType);
  }, [initialType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-brand-200 rounded-full opacity-10 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-200 rounded-full opacity-10 animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-brand-300 rounded-full opacity-10 animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          <button
            onClick={() => navigate('home')}
            className="mb-6 flex items-center text-gray-600 hover:text-brand-500 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Registration</h1>
              <p className="text-gray-600 mt-1">Choose your registration type to get started</p>
            </div>

            <div className="inline-flex bg-white/80 backdrop-blur rounded-2xl p-1.5 border border-white/40 shadow-sm">
              <button
                type="button"
                onClick={() => setSelected('user')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selected === 'user'
                  ? 'bg-white text-brand-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setSelected('influencer')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${selected === 'influencer'
                  ? 'bg-white text-brand-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Influencer
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {selected === 'user' ? (
            <AuthPage initialTab="register" embedded />
          ) : (
            <InfluencerRegistrationPage config={config} embedded />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
