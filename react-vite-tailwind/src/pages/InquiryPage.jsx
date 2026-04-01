import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const InquiryPage = ({ config }) => {
  const { user, isAuthenticated, login } = useAuth();
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  const getThemeColor = (key) => {
    if (!config) return undefined;
    return config[key];
  };

  const initialForm = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    hiringFor: 'influencer',
    category: '',
    location: '',
    eventType: '',
    eventDate: '',
    budget: '',
    requirements: ''
  }), [user]);

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [loginForm, setLoginForm] = useState({ email: user?.email || '', password: '' });
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);

  const [authMode, setAuthMode] = useState('register');
  const [registerForm, setRegisterForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [registerSuccess, setRegisterSuccess] = useState(null);

  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  // Show popup for unauthenticated users and auto-hide after 4 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      setShowRegistrationPopup(true);
      const timer = setTimeout(() => {
        setShowRegistrationPopup(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    const nextEmail = user?.email || form.email || '';
    setLoginForm((prev) => (prev.email === nextEmail ? prev : { ...prev, email: nextEmail }));
  }, [user?.email, form.email]);

  useEffect(() => {
    const nextEmail = user?.email || form.email || '';
    const nextName = user?.name || form.name || '';
    setRegisterForm((prev) => {
      const next = { ...prev };
      if (prev.email !== nextEmail) next.email = nextEmail;
      if (prev.name !== nextName) next.name = nextName;
      return next;
    });
  }, [user?.email, user?.name, form.email, form.name]);

  const onChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onLoginChange = (key) => (e) => {
    setLoginForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const onRegisterChange = (key) => (e) => {
    setRegisterForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const finishAuth = (data) => {
    if (data?.token) {
      localStorage.setItem('userToken', data.token);
    }

    const userData = { ...data };
    delete userData.token;
    delete userData.message;
    login(userData);

    setForm((prev) => ({
      ...prev,
      name: userData.name || prev.name,
      email: userData.email || prev.email,
      phone: userData.phone || prev.phone
    }));
  };

  const handleInlineRegister = async (e) => {
    e.preventDefault();
    setRegisterError(null);
    setRegisterSuccess(null);
    setLoginError(null);
    setLoginSuccess(null);
    setError(null);
    setSuccess(null);

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      setRegisterError('Please fill name, email and password to register.');
      return;
    }

    try {
      setRegisterSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegisterError(data.message || 'Registration failed.');
        return;
      }

      finishAuth(data);
      setRegisterForm((prev) => ({ ...prev, password: '' }));
      setRegisterSuccess('Account created successfully. You can submit your inquiry now.');
    } catch (err) {
      console.error('Inline register error:', err);
      setRegisterError('Network error while registering.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleInlineLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
    setRegisterError(null);
    setRegisterSuccess(null);
    setError(null);
    setSuccess(null);

    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please enter email and password to continue.');
      return;
    }

    try {
      setLoginSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || 'Login failed.';
        setLoginError(msg);

        if (typeof msg === 'string' && msg.toLowerCase().includes('invalid email')) {
          setAuthMode('register');
          setRegisterError('You are not registered. Please create an account below.');
        }
        return;
      }

      finishAuth(data);
      setLoginForm((prev) => ({ ...prev, password: '' }));
      setLoginSuccess('Logged in successfully. You can submit your inquiry now.');
    } catch (err) {
      console.error('Inline login error:', err);
      setLoginError('Network error while logging in.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const validate = () => {
    if (!form.name || !form.email || !form.phone) return 'Please fill your contact details.';
    if (!form.hiringFor) return 'Please select who you want to hire.';
    if (!form.category) return 'Please enter a category.';
    if (!form.location) return 'Please enter a location.';
    if (!form.eventType) return 'Please enter an event type.';
    if (!form.eventDate) return 'Please select an event date.';
    if (form.budget === '' || form.budget === null || form.budget === undefined) return 'Please enter a budget.';
    const budgetNumber = Number(form.budget);
    if (Number.isNaN(budgetNumber) || budgetNumber < 0) return 'Budget must be a valid number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      setError('Please sign in to submit an inquiry.');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Your session token is missing. Please sign in again.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          hiringFor: form.hiringFor,
          category: form.category,
          location: form.location,
          eventType: form.eventType,
          eventDate: form.eventDate,
          budget: Number(form.budget),
          requirements: form.requirements
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to submit inquiry.');
        return;
      }

      setSuccess('Inquiry submitted successfully! Our admin will review it shortly.');
      setForm((prev) => ({
        ...prev,
        hiringFor: 'influencer',
        category: '',
        location: '',
        eventType: '',
        eventDate: '',
        budget: '',
        requirements: ''
      }));
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError('Network error while submitting inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-24" style={{ backgroundColor: getThemeColor('background_color') }}>
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
        <div className="w-full" style={{ backgroundColor: getThemeColor('surface') || 'transparent' }}>
          <div
            className="w-full px-6 sm:px-8 py-6 bg-gradient-to-br"
            style={{
              backgroundImage: `linear-gradient(135deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)`
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 max-w-6xl mx-auto">
              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">Send a Collaboration Request</h1>
                <p className="text-white/95 mt-2 max-w-2xl leading-tight text-sm md:text-base">
                  Send a collaboration request for an influencer. Your inquiry will be reviewed by the admin and marked as <span className="font-semibold">Pending</span> by default.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10 text-sm text-white/90">
                <p className="font-semibold">Status Workflow</p>
                <p className="mt-1 text-xs">Pending → Accepted / Rejected</p>
              </div>
            </div>
          </div>

          <div className="mt-8 px-0 sm:px-0 pb-8 relative z-10">
            {!isAuthenticated && (
              <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 border-l-4 border-brand-500">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h2 className="text-lg font-semibold text-gray-900">{authMode === 'register' ? 'Create account' : 'Login to continue'}</h2>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setRegisterError(null);
                        setRegisterSuccess(null);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                        authMode === 'login' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setLoginError(null);
                        setLoginSuccess(null);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                        authMode === 'register' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  {authMode === 'register'
                    ? 'If you are new, create an account here. Your session will be saved automatically.'
                    : 'Login here and your session will be saved. Next time you won\'t need to login again.'}
                </p>

                {authMode === 'login' && loginSuccess && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{loginSuccess}</div>
                )}
                {authMode === 'login' && loginError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loginError}</div>
                )}

                {authMode === 'register' && registerSuccess && (
                  <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{registerSuccess}</div>
                )}
                {authMode === 'register' && registerError && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{registerError}</div>
                )}

                {authMode === 'login' ? (
                  <form onSubmit={handleInlineLogin} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={onLoginChange('email')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                        placeholder="Email address"
                        autoComplete="email"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={onLoginChange('password')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                        placeholder="Password"
                        autoComplete="current-password"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={loginSubmitting}
                        className={`px-8 py-3 rounded-full font-semibold text-white shadow-2xl transition-all flex items-center gap-3 justify-center w-full sm:w-auto ${
                          loginSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl active:scale-[0.99]'
                        }`}
                        style={{ background: `linear-gradient(90deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)` }}
                      >
                        {loginSubmitting ? 'Logging in...' : 'Login'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleInlineRegister} className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                      <input
                        value={registerForm.name}
                        onChange={onRegisterChange('name')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                        placeholder="Your name"
                        autoComplete="name"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={onRegisterChange('email')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                        placeholder="Email address"
                        autoComplete="email"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Password</label>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={onRegisterChange('password')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                        placeholder="Create a password"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={registerSubmitting}
                        className={`px-8 py-3 rounded-full font-semibold text-white shadow-2xl transition-all flex items-center gap-3 justify-center w-full sm:w-auto ${
                          registerSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl active:scale-[0.99]'
                        }`}
                        style={{ background: `linear-gradient(90deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)` }}
                      >
                        {registerSubmitting ? 'Creating...' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {error && (
              <div className="mb-8 rounded-lg border border-red-200 bg-red-50 pl-4 pr-5 py-3 flex items-start gap-3 border-l-4 border-red-400">
                <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Submission failed</p>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-8 rounded-lg border border-green-200 bg-green-50 pl-4 pr-5 py-3 flex items-start gap-3 border-l-4 border-green-400">
                <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-green-400" />
                <div>
                  <p className="text-sm font-semibold text-green-900">Submitted</p>
                  <p className="text-sm text-green-800 mt-1">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Your Details</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">So the admin can contact you quickly.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1118.88 6.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.name}
                          onChange={onChange('name')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Your name"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.6a1 1 0 01.9.55l1.2 2.4a1 1 0 01-.2 1.05L9 8.5a11 11 0 005.5 5.5l1.5-1.1a1 1 0 011.05-.2l2.4 1.2A1 1 0 0119 18.4V21a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                          </svg>
                        </div>
                        <input
                          value={form.phone}
                          onChange={onChange('phone')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Phone number"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0l-4-4m4 4l-4 4" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          value={form.email}
                          onChange={onChange('email')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                          placeholder="Email address"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Requirement</h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Tell us what you want to hire.</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Hiring For</label>
                      <select
                        value={form.hiringFor}
                        onChange={onChange('hiringFor')}
                        className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100 appearance-none cursor-pointer"
                      >
                        <option value="influencer">Influencer</option>
                        <option value="creator">Creator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Category</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h18" />
                          </svg>
                        </div>
                        <input
                          value={form.category}
                          onChange={onChange('category')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="e.g. Lifestyle, Fitness, Tech"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          value={form.location}
                          onChange={onChange('location')}
                          className="mt-0 w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="City / Venue"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Budget (INR)</label>
                      <div className="mt-2 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-600">₹</span>
                        </div>
                        <input
                          value={form.budget}
                          onChange={onChange('budget')}
                          className="mt-0 w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
                          placeholder="e.g. 5000"
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition transform-gpu hover:-translate-y-0.5 border-l-4 border-brand-500">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>
                </div>
                <p className="text-sm text-gray-500 mt-1">Help us understand the timeline and context.</p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Event Type</label>
                    <input
                      value={form.eventType}
                      onChange={onChange('eventType')}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                      placeholder="e.g. Wedding, Brand Shoot"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Event Date</label>
                    <input
                      type="date"
                      value={form.eventDate}
                      onChange={onChange('eventDate')}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Requirements / Message</label>
                    <textarea
                      value={form.requirements}
                      onChange={onChange('requirements')}
                      rows={4}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-100"
                      placeholder="Describe the influencer style, duration, deliverables, audience size, etc."
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  By submitting, you agree that an admin may contact you using the details provided.
                </div>

                <div className="sm:flex-1 flex sm:justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-8 py-3 rounded-full font-semibold text-white shadow-2xl transition-all flex items-center gap-3 justify-center w-full sm:w-auto ${
                      submitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-2xl active:scale-[0.99]'
                    }`}
                    style={{ background: `linear-gradient(90deg, ${getThemeColor('primary') || '#ee7711'} 0%, ${getThemeColor('secondary') || '#f19332'} 100%)` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                    {submitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Registration Popup */}
      {showRegistrationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all animate-scaleIn">
            {/* Decorative Header */}
            <div className="text-center mb-6">
              <div 
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                style={{ background: `linear-gradient(135deg, ${getThemeColor('primary')}20 0%, ${getThemeColor('secondary')}20 100%)` }}
              >
                <svg 
                  className="w-10 h-10" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: getThemeColor('primary') }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Please Register to Send Inquiries</h3>
              <p className="text-gray-600">Join our platform to connect with amazing influencers and grow your brand.</p>
            </div>

            {/* Visual Elements */}
            <div className="flex justify-center gap-2 mb-6">
              <span 
                className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${getThemeColor('primary')}20` }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('primary') }}
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </span>
              <span 
                className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${getThemeColor('secondary')}20` }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('secondary') }}
                >
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span 
                className="inline-flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${getThemeColor('primary')}15` }}
              >
                <svg 
                  className="w-5 h-5" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('primary') }}
                >
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </span>
            </div>

            {/* Benefits List */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('primary') }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Access to verified influencers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('secondary') }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Send unlimited inquiries</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <svg 
                  className="w-5 h-5 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  style={{ color: getThemeColor('primary') }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track campaign progress</span>
              </div>
            </div>

            {/* Auto-hide message */}
            <div 
              className="text-center text-sm italic px-4 py-2 rounded-lg"
              style={{ 
                backgroundColor: `${getThemeColor('primary')}10`,
                color: getThemeColor('primary')
              }}
            >
              This message will disappear automatically in 4 seconds...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
