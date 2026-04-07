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

            <div className="relative inline-flex bg-gray-100 rounded-[20px] p-1.5 border border-gray-200 shadow-inner overflow-hidden">
              {/* Sliding Background Pill */}
              <div
                className="absolute inset-y-1.5 rounded-2xl bg-orange-500 shadow-lg shadow-orange-200/50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-0"
                style={{
                  left: selected === 'user' ? '6px' : 'calc(50% + 3px)',
                  width: 'calc(50% - 9px)'
                }}
              />

              <button
                type="button"
                onClick={() => setSelected('user')}
                className={`relative z-10 px-8 py-3 rounded-2xl font-bold text-base transition-colors duration-500 ${selected === 'user'
                  ? 'text-white scale-105'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setSelected('influencer')}
                className={`relative z-10 px-8 py-3 rounded-2xl font-bold text-base transition-colors duration-500 ${selected === 'influencer'
                  ? 'text-white scale-105'
                  : 'text-gray-500 hover:text-gray-700'
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
