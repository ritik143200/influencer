import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../data/config';

const inputClassName =
  'w-full rounded-2xl border border-[#A98BC8]/55 bg-[#FFFFFF] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#3E2A55]/55 focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/22';

const prototypeNavItems = ['Home', 'Services', 'Hire Influencers'];

const RegistrationPage = () => {
  const { navigate, params } = useRouter();
  const { login } = useAuth();
  const initialType = useMemo(() => (params?.type === 'influencer' ? 'influencer' : 'user'), [params]);
  const [selected, setSelected] = useState(initialType);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params?.type === 'influencer') {
      navigate('influencer-registration');
      return;
    }
    setSelected(initialType);
  }, [initialType, navigate, params?.type]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateCommon = () => {
    if (!formData.name.trim()) return selected === 'user' ? 'Please enter your brand name.' : 'Please enter your full name.';
    if (!formData.email.trim()) return 'Please enter your email address.';
    if (!formData.phone.trim()) return 'Please enter your phone number.';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number.';
    if (!formData.password.trim()) return 'Please enter a password.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleBrandSubmit = async () => {
    const validationError = validateCommon();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: 'brand'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.token) {
        setError(data.message || 'Unable to create your brand account.');
        return;
      }

      const userData = { ...data };
      delete userData.message;
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify(userData));
      login(userData);
      navigate('user-dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInfluencerContinue = () => {
    const validationError = validateCommon();
    if (validationError) {
      setError(validationError);
      return;
    }

    localStorage.setItem(
      'pendingInfluencerSignupDraft',
      JSON.stringify({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      })
    );

    navigate('influencer-registration');
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(223,122,254,0.18),transparent_32%),linear-gradient(135deg,#000000_0%,#171321_100%)] text-[#FFFFFF]">
      <div className="relative isolate min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-[-6%] top-[10%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(223,122,254,0.30),transparent_62%)] blur-2xl" />
          <div className="absolute right-[-3%] top-[18%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.26),transparent_64%)] blur-2xl" />
          <div className="absolute inset-y-0 right-[14%] hidden w-px bg-[#A98BC8]/25 lg:block" />
          <div className="absolute right-[12%] top-[12%] hidden h-[72%] w-[34%] rounded-[3rem] bg-[radial-gradient(circle_at_top,rgba(223,122,254,0.24),transparent_58%),linear-gradient(180deg,rgba(62,42,85,0.94),rgba(20,16,32,0.88))] shadow-[0_35px_80px_rgba(6,6,6,0.42)] lg:block" />
          <div className="absolute right-[15%] top-[18%] hidden h-28 w-28 rounded-full bg-[#0099FF]/16 blur-lg lg:block" />
          <div className="absolute right-[16%] top-[14%] hidden text-[10rem] font-black leading-none text-[#FFFFFF]/10 lg:block">*</div>
          <div className="absolute right-[9%] top-[23%] hidden h-20 w-20 rounded-full border border-[#A98BC8]/35 lg:block" />
          <div className="absolute right-[25%] top-[31%] hidden h-3 w-3 rounded-full bg-[#FFFFFF]/70 lg:block" />
        </div>

        <div className="section-shell relative z-10 py-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="inline-flex items-center gap-2 rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(6,6,6,0.28)] backdrop-blur"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              Back
            </button>

            <div className="hidden items-center gap-8 rounded-full border border-[#3E2A55] bg-[#0D0D0D]/78 px-6 py-3 text-sm font-medium text-[#FFFFFF] shadow-[0_14px_34px_rgba(6,6,6,0.28)] backdrop-blur md:flex">
              {prototypeNavItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === 'Home') navigate('home');
                    if (item === 'Services') navigate('services');
                    if (item === 'Hire Influencers') navigate('inquiry');
                  }}
                  className="transition hover:text-[#DF7AFE]"
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate('auth')}
              className="rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(6,6,6,0.28)] backdrop-blur"
            >
              Login
            </button>
          </div>

          <div className="grid items-center gap-10 pb-10 pt-12 lg:grid-cols-[0.92fr_0.68fr]">
            <div className="max-w-2xl">
              <div className="mb-6 text-sm font-semibold uppercase tracking-[0.28em] text-[#FFFFFF]">Viral<span className="text-[#DF7AFE]">Mantrix</span></div>
              <h1
                className="max-w-xl text-5xl leading-[0.95] text-[#FFFFFF] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: 'Georgia, Times New Roman, serif' }}
              >
                Connect
                <br />
                brands to
                <br />
                influencers
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-[#FFFFFF]/72">
                Start with account creation, then move into the exact creator or brand workflow built for ViralMantrix.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-[#FFFFFF]/78">
                <span className="rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 shadow-sm">Creator onboarding</span>
                <span className="rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 shadow-sm">Brand campaigns</span>
                <span className="rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 shadow-sm">ViralMantrix paths</span>
              </div>
            </div>

            <div className="relative lg:justify-self-end">
              <div className="relative z-10 w-full max-w-[28rem] rounded-[2rem] border border-[#3E2A55] bg-[#000000]/92 p-6 shadow-[0_26px_80px_rgba(6,6,6,0.45)] backdrop-blur">
                <div className="mx-auto mb-6 inline-flex rounded-full border border-[#3E2A55] bg-[#0D0D0D] p-1">
                  {[
                    { value: 'influencer', label: 'Influencer' },
                    { value: 'user', label: 'Brand' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setSelected(item.value);
                        setError('');
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        selected === item.value ? 'bg-[#DF7AFE] text-white shadow-sm' : 'text-[#FFFFFF]/72'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98BC8]">Account setup</div>
                    <h2 className="mt-2 text-2xl font-semibold text-[#FFFFFF]">
                      {selected === 'influencer' ? 'Create Your Account as an Influencer' : 'Create Your Brand Account'}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-[#FFFFFF]/72">
                      {selected === 'influencer'
                        ? 'This first step creates your account. Next, you will add your creator details and social links.'
                        : 'Create your brand account to launch briefs, track inquiries, and manage campaign activity.'}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
                    {selected === 'influencer' ? <UserRound className="h-5 w-5" strokeWidth={2} /> : <BriefcaseBusiness className="h-5 w-5" strokeWidth={2} />}
                  </div>
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  <input
                    type="text"
                    placeholder={selected === 'influencer' ? 'Enter your full name' : 'Enter your brand name'}
                    value={formData.name}
                    onChange={(event) => handleInputChange('name', event.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(event) => handleInputChange('email', event.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(event) => handleInputChange('phone', event.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(event) => handleInputChange('password', event.target.value)}
                    className={inputClassName}
                  />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(event) => handleInputChange('confirmPassword', event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <button
                  type="button"
                  onClick={selected === 'influencer' ? handleInfluencerContinue : handleBrandSubmit}
                  disabled={loading}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.24)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {selected === 'influencer' ? <Sparkles className="h-4 w-4" strokeWidth={2} /> : <ShieldCheck className="h-4 w-4" strokeWidth={2} />}
                  {loading
                    ? 'Creating account...'
                    : selected === 'influencer'
                      ? 'Continue to your details'
                      : 'Create Brand Account'}
                  {!loading && <ArrowRight className="h-4 w-4" strokeWidth={2} />}
                </button>

                <div className="mt-5 text-center text-sm text-[#FFFFFF]/72">
                  Already have an account?{' '}
                  <button type="button" onClick={() => navigate('auth')} className="font-semibold text-[#FFFFFF] underline decoration-[#0099FF] underline-offset-4">
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
