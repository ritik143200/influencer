import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Sparkles, UserRound } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import AuthPage from './AuthPage';
import InfluencerRegistrationPage from './InfluencerRegistrationPage';

const RegistrationPage = ({ config }) => {
  const { navigate, params } = useRouter();
  const initialType = useMemo(() => (params?.type === 'influencer' ? 'influencer' : 'user'), [params]);
  const [selected, setSelected] = useState(initialType);

  useEffect(() => {
    setSelected(initialType);
  }, [initialType]);

  return (
    <div className="min-h-screen overflow-hidden bg-transparent text-white">
      <div className="section-shell relative py-8">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to home
        </button>
      </div>

      <div className="section-shell relative grid gap-8 pb-12 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Join ViralMantrix
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
            Choose your side of the ecosystem.
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-300 sm:text-base">
            Brands launch high-context briefs. Creators build profiles that match internet culture, communities, and premium collaboration opportunities.
          </p>

          <div className="mt-8 grid gap-4">
            <button
              type="button"
              onClick={() => setSelected('user')}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                selected === 'user'
                  ? 'border-cyan-300/30 bg-cyan-400/10 shadow-[0_16px_40px_rgba(34,211,238,0.14)]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-white">
                  <BriefcaseBusiness className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Brand / Campaign Team</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">
                    Create your brand account, submit campaign briefs, and track collaboration progress from one place.
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelected('influencer')}
              className={`rounded-[1.5rem] border p-5 text-left transition ${
                selected === 'influencer'
                  ? 'border-violet-300/30 bg-violet-400/10 shadow-[0_16px_40px_rgba(139,92,246,0.16)]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                  <UserRound className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Creator / Influencer</div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">
                    Build a premium creator profile with dynamic categories, social links, and creator-fit metadata.
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] p-2 sm:p-3">
          {selected === 'user' ? (
            <div className="rounded-[1.6rem] bg-[#071023] p-2 sm:p-4">
              <AuthPage initialTab="register" embedded />
            </div>
          ) : (
            <InfluencerRegistrationPage config={config} embedded />
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
