import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../data/config';

const inputClassName =
  'w-full rounded-2xl border border-[#A98BC8]/45 bg-white px-4 py-3.5 text-sm font-medium text-[#000000] outline-none transition placeholder:text-[#3E2A55]/55 focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/20';

const getDashboardRoute = (account = {}) => {
  const role = account.role || account.profileType || 'brand';
  if (role === 'admin') return 'admin-dashboard';
  if (role === 'artist' || role === 'influencer') return 'influencer-dashboard';
  return 'user-dashboard';
};

const AuthPage = ({ initialTab }) => {
  const { login } = useAuth();
  const { navigate, params, currentPath } = useRouter();
  const [mode, setMode] = useState(initialTab === 'register' ? 'register' : 'login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (currentPath === 'reset-password') {
      setMode('reset');
      setResetToken(params?.token || '');
    } else {
      setMode(initialTab === 'register' ? 'register' : 'login');
    }
  }, [currentPath, initialTab, params?.token]);

  useEffect(() => {
    const pending = localStorage.getItem('pendingInquiry');
    if (!pending || mode === 'login' || mode === 'forgot' || mode === 'reset') return;

    try {
      const parsed = JSON.parse(pending);
      setFormData((prev) => ({
        ...prev,
        name: parsed.name || prev.name,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone
      }));
    } catch {
      // Ignore malformed draft data.
    }
  }, [mode]);

  const setModeClean = (nextMode) => {
    setMode(nextMode);
    setErrors({});
    setMessage({ type: '', text: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (mode === 'forgot') {
      if (!formData.email.trim()) nextErrors.email = 'Email is required';
    } else if (mode === 'reset') {
      if (!formData.password) nextErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    } else {
      if (mode === 'register') {
        if (!formData.name.trim()) nextErrors.name = 'Name is required';
        if (!formData.phone.trim()) nextErrors.phone = 'Phone number is required';
      }
      if (!formData.email.trim()) nextErrors.email = 'Email is required';
      if (!formData.password) nextErrors.password = 'Password is required';
      if (formData.password && formData.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
      if (mode === 'register' && formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitPendingInquiry = async (token) => {
    const pending = localStorage.getItem('pendingInquiry');
    if (!pending) return false;

    try {
      const inquiryData = JSON.parse(pending);
      await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...inquiryData,
          budget: Number(inquiryData.budget || 0)
        })
      });
      return true;
    } catch {
      return true;
    } finally {
      localStorage.removeItem('pendingInquiry');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    const endpoint = mode === 'reset' ? 'reset-password' : mode === 'forgot' ? 'forgot-password' : mode;
    const payload =
      mode === 'reset'
        ? { token: resetToken, password: formData.password }
        : mode === 'forgot'
          ? { email: formData.email.trim() }
          : mode === 'register'
            ? {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password,
                role: 'brand'
              }
            : {
                email: formData.email.trim(),
                password: formData.password
              };

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.message || 'Unable to continue. Please try again.' });
        return;
      }

      if (mode === 'forgot') {
        setMessage({ type: 'success', text: data.message || 'Reset link sent.' });
        return;
      }

      if (mode === 'reset') {
        setMessage({ type: 'success', text: data.message || 'Password updated. Please login.' });
        window.setTimeout(() => setModeClean('login'), 900);
        return;
      }

      if (!data.token) {
        setMessage({ type: 'error', text: data.message || 'Login failed.' });
        return;
      }

      localStorage.setItem('userToken', data.token);
      const userData = { ...data };
      delete userData.message;
      localStorage.setItem('userData', JSON.stringify(userData));
      login(userData);

      const hadPendingInquiry = await submitPendingInquiry(data.token);
      window.setTimeout(() => {
        navigate(getDashboardRoute(userData));
      }, hadPendingInquiry ? 800 : 450);
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const title =
    mode === 'forgot'
      ? 'Reset Access'
      : mode === 'reset'
        ? 'New Password'
        : mode === 'register'
          ? 'Create Account'
          : 'Welcome Back';

  const subtitle =
    mode === 'forgot'
      ? 'Enter your email to receive a reset link.'
      : mode === 'reset'
        ? 'Set a secure password for your account.'
        : mode === 'register'
          ? 'Create your workspace and continue.'
          : 'Login to your ViralMantrix workspace.';

  return (
    <main className="min-h-screen overflow-hidden bg-[linear-gradient(135deg,#000000_0%,#171321_48%,#3E2A55_100%)] text-[#FFFFFF]">
      <div className="relative isolate min-h-screen">
        <div className="absolute inset-0">
          <div className="absolute left-[-8%] top-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(223,122,254,0.28),transparent_62%)] blur-3xl" />
          <div className="absolute right-[-6%] top-[16%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.30),transparent_64%)] blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6 lg:px-10">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 rounded-full border border-[#3E2A55] bg-[#0D0D0D]/72 px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_38px_rgba(223,122,254,0.10)] backdrop-blur-xl"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
            Back
          </button>

          <button
            type="button"
            onClick={() => navigate('home')}
            className="text-sm font-semibold uppercase tracking-[0.32em] text-[#DF7AFE]"
          >
            ViralMantrix
          </button>

          <button
            type="button"
            onClick={() => navigate('inquiry')}
            className="hidden rounded-full border border-[#3E2A55] bg-[#0D0D0D]/72 px-5 py-2.5 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_38px_rgba(223,122,254,0.10)] backdrop-blur-xl sm:block"
          >
            Hire Influencer
          </button>
        </div>

        <section className="relative z-10 mx-auto grid min-h-[calc(100vh-96px)] max-w-[1180px] items-center gap-10 px-6 pb-16 lg:grid-cols-[0.96fr_0.84fr] lg:px-10 xl:gap-16">
          <div className="hidden max-w-[34rem] flex-col justify-center lg:flex">
            <div className="inline-flex rounded-full border border-[#A98BC8]/35 bg-[#0D0D0D]/72 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#FFFFFF] shadow-[0_14px_38px_rgba(223,122,254,0.10)]">
              Creator Network
            </div>
            <h1 className="mt-7 text-[clamp(3rem,4.7vw,4.8rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#FFFFFF]">
              Login to your creator space
            </h1>
            <div className="mt-9 h-[15.5rem] w-full rounded-[2.6rem] bg-[radial-gradient(circle_at_34%_32%,#FFFFFF_0%,#A98BC8_34%,#8B4DD8_72%,#DF7AFE_100%)] shadow-[0_42px_110px_rgba(223,122,254,0.22)]" />
          </div>

          <div className="mx-auto w-full max-w-[31rem] lg:justify-self-end">
            <form
              onSubmit={handleSubmit}
              className="rounded-[2rem] border border-[#A98BC8]/45 bg-[#FFFFFF] p-6 shadow-[0_32px_90px_rgba(6,6,6,0.42)] backdrop-blur-2xl sm:p-8"
            >
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171321] text-[#FFFFFF]">
                  <UserRound className="h-6 w-6" strokeWidth={2} />
                </div>
                <h2 className="text-3xl font-semibold text-[#000000]">{title}</h2>
                <p className="mt-2 text-sm font-medium leading-6 text-[#3E2A55]">{subtitle}</p>
              </div>

              {message.text && (
                <div
                  className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
                    message.type === 'success'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="space-y-4">
                {mode === 'register' && (
                  <>
                    <div>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className={inputClassName}
                      />
                      {errors.name && <p className="mt-2 text-xs text-rose-600">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Phone number"
                        className={inputClassName}
                      />
                      {errors.phone && <p className="mt-2 text-xs text-rose-600">{errors.phone}</p>}
                    </div>
                  </>
                )}

                {mode !== 'reset' && (
                  <div>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]" strokeWidth={1.9} />
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email address"
                        className={`${inputClassName} pl-12`}
                      />
                    </div>
                    {errors.email && <p className="mt-2 text-xs text-rose-600">{errors.email}</p>}
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]" strokeWidth={1.9} />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={mode === 'reset' ? 'New password' : 'Password'}
                        className={`${inputClassName} pl-12 pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E2A55]"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-2 text-xs text-rose-600">{errors.password}</p>}
                  </div>
                )}

                {(mode === 'register' || mode === 'reset') && (
                  <div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]" strokeWidth={1.9} />
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`${inputClassName} pl-12 pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3E2A55]"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-2 text-xs text-rose-600">{errors.confirmPassword}</p>}
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setModeClean('forgot')}
                  className="mt-4 block text-sm font-semibold text-[#DF7AFE]"
                >
                  Forgot password?
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#DF7AFE] px-6 text-sm font-semibold text-white shadow-[0_20px_42px_rgba(223,122,254,0.26)] transition hover:-translate-y-0.5 hover:bg-[#8B4DD8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading
                  ? 'Please wait...'
                  : mode === 'forgot'
                    ? 'Send Reset Link'
                    : mode === 'reset'
                      ? 'Update Password'
                      : mode === 'register'
                        ? 'Create Account'
                        : 'Login'}
                {!isLoading && <ArrowRight className="h-4 w-4" strokeWidth={2.3} />}
              </button>

              <div className="mt-6 text-center text-sm font-medium text-[#3E2A55]">
                {mode === 'login' ? (
                  <div className="rounded-[1.35rem] border border-[#DF7AFE]/35 bg-[#F7EEFF] p-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8B4DD8]">New creator?</div>
                    <button
                      type="button"
                      onClick={() => navigate('influencer-registration')}
                      className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#171321] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(23,19,33,0.18)] transition hover:-translate-y-0.5 hover:bg-[#3E2A55]"
                    >
                      Sign up as Influencer
                    </button>
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-[#DF7AFE]/25 bg-[#F7EEFF] p-3">
                    <span className="text-[#3E2A55]">Already have an account?</span>{' '}
                    <button type="button" onClick={() => setModeClean('login')} className="font-semibold text-[#8B4DD8]">
                      Login
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
