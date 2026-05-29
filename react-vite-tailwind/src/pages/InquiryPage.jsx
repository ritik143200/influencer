import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  LockKeyhole,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { useCategoryDirectory } from '../hooks/useCategoryDirectory';
import { getCategorySelectionPayload } from '../utils/categoryDirectory';
import { API_BASE_URL } from '../data/config';
import LocationSelectInput from '../components/LocationSelectInput';
import { useClickOutside } from '../hooks/useClickOutside';

const inputClassName =
  'h-12 w-full rounded-xl border border-[#A98BC8]/55 bg-[#FFFFFF] px-4 text-sm text-[#000000] outline-none transition placeholder:text-[#3E2A55]/55 focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/22';

const textareaClassName =
  'w-full rounded-xl border border-[#A98BC8]/55 bg-[#FFFFFF] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#3E2A55]/55 focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/22';

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Secure & Trusted',
    description: 'Your data is safe with us.'
  },
  {
    icon: Users,
    title: 'Top Influencers',
    description: 'Connect with verified creators.'
  },
  {
    icon: Rocket,
    title: 'Easy & Fast',
    description: 'Launch campaigns in minutes.'
  },
  {
    icon: BarChart3,
    title: 'Better Results',
    description: 'Drive engagement and grow your brand.'
  }
];

const fallbackDirectory = [
  {
    slug: 'creator-influencer',
    name: 'Influencer',
    legacyHiringValue: 'influencer',
    microCategories: [{ slug: 'ugc-creator', name: 'UGC Creator' }, { slug: 'fashion', name: 'Fashion' }]
  },
  {
    slug: 'celebrity',
    name: 'Celebrity',
    legacyHiringValue: 'celebrity',
    microCategories: [{ slug: 'actor', name: 'Actor' }, { slug: 'model', name: 'Model' }]
  },
  {
    slug: 'city-pages',
    name: 'City Page',
    legacyHiringValue: 'city page',
    microCategories: [{ slug: 'local-city-pages', name: 'Local City Pages' }, { slug: 'food-pages', name: 'Food Pages' }]
  },
  {
    slug: 'meme-pages',
    name: 'Meme Page',
    legacyHiringValue: 'meme page',
    microCategories: [{ slug: 'meme-pages-core', name: 'Meme Pages' }, { slug: 'music-pages', name: 'Music Pages' }]
  }
];

const getAccountRole = (account) => account?.role || account?.profileType || '';
const isInfluencerAccount = (account) => ['influencer', 'artist'].includes(getAccountRole(account));
const isBrandAccount = (account) => {
  if (!account || isInfluencerAccount(account)) return false;
  const role = getAccountRole(account);
  return !role || ['brand', 'user'].includes(role);
};

const InquiryPage = () => {
  const { user, isAuthenticated, login } = useAuth();
  const { navigate } = useRouter();
  const { directory } = useCategoryDirectory();

  const categoryDirectory = useMemo(() => (directory?.length ? directory : fallbackDirectory), [directory]);
  const isBrandSession = isAuthenticated && isBrandAccount(user);

  const [brandForm, setBrandForm] = useState({
    name: isBrandAccount(user) ? user?.name || '' : '',
    phone: isBrandAccount(user) ? user?.phone || '' : '',
    email: isBrandAccount(user) ? user?.email || '' : '',
    password: '',
    budget: '',
    location: '',
    campaignName: '',
    campaignDescription: ''
  });
  const [selectedMainCategory, setSelectedMainCategory] = useState(categoryDirectory[0]?.slug || '');
  const [selectedMicroCategories, setSelectedMicroCategories] = useState([]);
  const [isMicroDropdownOpen, setIsMicroDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const microDropdownRef = useRef(null);

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const activeMainCategory =
    categoryDirectory.find((item) => item.slug === selectedMainCategory) || categoryDirectory[0] || null;
  const activeMicroCategories = activeMainCategory?.microCategories || [];
  const selectedMicroCategoryNames = useMemo(
    () =>
      activeMicroCategories
        .filter((item) => selectedMicroCategories.includes(item.slug))
        .map((item) => item.name),
    [activeMicroCategories, selectedMicroCategories]
  );

  useClickOutside(microDropdownRef, () => setIsMicroDropdownOpen(false), isMicroDropdownOpen);

  const syncAuthData = (authData) => {
    const nextUser = { ...authData };
    delete nextUser.message;
    localStorage.setItem('userToken', authData.token);
    localStorage.setItem('userData', JSON.stringify(nextUser));
    login(nextUser);
  };

  const persistCampaignPreview = () => {
    try {
      localStorage.setItem(
        'lastSubmittedInquiryPreview',
        JSON.stringify({
          _id: 'preview-campaign',
          name: brandForm.name.trim(),
          email: brandForm.email.trim(),
          phone: brandForm.phone.trim(),
          campaignName: brandForm.campaignName.trim(),
          requirements: brandForm.campaignDescription.trim(),
          category: activeMicroCategories
            .filter((item) => selectedMicroCategories.includes(item.slug))
            .map((item) => item.name)
            .join(', '),
          hiringFor: activeMainCategory?.name || '',
          location: brandForm.location.trim(),
          budget: Number(brandForm.budget) || 0,
          mainCategories: [selectedMainCategory],
          microCategories: selectedMicroCategories,
          createdAt: new Date().toISOString(),
          status: 'sent'
        })
      );
    } catch {
      // Preview cache is optional.
    }
  };

  const createAccountIfNeeded = async () => {
    if (isBrandSession) {
      return localStorage.getItem('userToken');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: brandForm.name.trim(),
        email: brandForm.email.trim(),
        phone: brandForm.phone.trim(),
        password: brandForm.password,
        role: 'brand'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error(data.message || 'Unable to create your brand account.');
    }

    syncAuthData(data);
    return data.token;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError('');

    if (!loginForm.email.trim() || !loginForm.password.trim()) {
      setLoginError('Please enter your email and password.');
      return;
    }

    setLoggingIn(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email.trim(),
          password: loginForm.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.token) {
        setLoginError(data.message || 'Unable to login right now.');
        return;
      }

      if (!isBrandAccount(data)) {
        setLoginError('Please login with a brand account for hiring influencers.');
        return;
      }

      syncAuthData(data);
      navigate('user-dashboard');
    } catch {
      setLoginError('Network error. Please try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSubmitInquiry = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!brandForm.name.trim()) return setError('Please enter your brand name.');
    if (!brandForm.phone.trim()) return setError('Please enter your phone number.');
    if (!brandForm.email.trim()) return setError('Please enter your email address.');
    if (!isBrandSession && !brandForm.password.trim()) return setError('Please create a password.');
    if (!selectedMainCategory) return setError('Please select a hiring type.');
    if (!selectedMicroCategories.length) return setError('Please select at least one micro category.');
    if (!brandForm.location.trim()) return setError('Please enter your location.');
    if (!brandForm.budget.trim()) return setError('Please enter your budget.');
    if (!brandForm.campaignName.trim()) return setError('Please enter your campaign name.');
    if (!brandForm.campaignDescription.trim()) return setError('Please enter your campaign description.');

    setSubmitting(true);
    try {
      const token = await createAccountIfNeeded();
      const categoryPayload = getCategorySelectionPayload(categoryDirectory, [selectedMainCategory], selectedMicroCategories);
      const selectedMicroCategoryNames = activeMicroCategories
        .filter((item) => selectedMicroCategories.includes(item.slug))
        .map((item) => item.name);

      const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: brandForm.name.trim(),
          email: brandForm.email.trim(),
          phone: brandForm.phone.trim(),
          campaignName: brandForm.campaignName.trim(),
          hiringFor: activeMainCategory?.legacyHiringValue || 'influencer',
          category: selectedMicroCategoryNames.join(', '),
          mainCategories: [selectedMainCategory],
          microCategories: selectedMicroCategories,
          location: brandForm.location.trim(),
          budget: Number(brandForm.budget),
          requirements: brandForm.campaignDescription.trim(),
          ...categoryPayload
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Unable to submit the inquiry.');
        return;
      }

      persistCampaignPreview();
      setSuccess('Inquiry submitted successfully. Taking you to the brand dashboard...');
      setTimeout(() => navigate('user-dashboard'), 900);
    } catch (submitError) {
      const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname);
      const isNetworkBlocked = submitError?.message?.toLowerCase?.().includes('failed to fetch');

      if (isLocalPreview && isNetworkBlocked) {
        persistCampaignPreview();
        setSuccess('Preview saved locally. Taking you to the brand dashboard...');
        setTimeout(() => navigate('brand-dashboard-active-preview'), 700);
        return;
      }

      setError(
        isNetworkBlocked
          ? 'Backend is not reachable right now. Please try again after deployment is live.'
          : submitError.message || 'Network error while submitting your inquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_18%_0%,rgba(223,122,254,0.18),transparent_30%),linear-gradient(180deg,#000000_0%,#171321_100%)] pt-[88px] text-[#FFFFFF]">
      <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-6 lg:px-8">
        <div className="rounded-[28px] border border-[#3E2A55] bg-[#0D0D0D]/86 p-5 shadow-[0_24px_70px_rgba(6,6,6,0.50)] backdrop-blur-xl lg:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.78fr]">
            <form onSubmit={handleSubmitInquiry} className="rounded-[24px] border border-[#3E2A55] bg-[#000000]/78 p-5 shadow-[0_12px_34px_rgba(169,139,200,0.12)] lg:p-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <h1 className="text-[1.65rem] font-semibold text-[#FFFFFF]">Create Your Brand Account</h1>
                  <p className="mt-1 text-sm text-[#FFFFFF]/78">Get started by adding your brand and campaign details.</p>
                </div>
              </div>

              {error ? (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="mt-6 border-t border-[#171321] pt-5">
                <div className="text-sm font-semibold text-[#FFFFFF]">Brand Information</div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Brand Name</label>
                    <input
                      value={brandForm.name}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, name: event.target.value }))}
                      className={inputClassName}
                      placeholder="Enter your brand name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Phone Number</label>
                    <input
                      value={brandForm.phone}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, phone: event.target.value }))}
                      className={inputClassName}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Email ID</label>
                    <input
                      type="email"
                      value={brandForm.email}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, email: event.target.value }))}
                      className={inputClassName}
                      placeholder="Enter your email address"
                    />
                  </div>
                  {!isBrandSession ? (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Password</label>
                      <input
                        type="password"
                        value={brandForm.password}
                        onChange={(event) => setBrandForm((prev) => ({ ...prev, password: event.target.value }))}
                        className={inputClassName}
                        placeholder="Create your password"
                      />
                    </div>
                  ) : null}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Hiring Of</label>
                    <div className="relative" ref={microDropdownRef}>
                      <select
                        value={selectedMainCategory}
                        onChange={(event) => {
                          setSelectedMainCategory(event.target.value);
                          setSelectedMicroCategories([]);
                          setIsMicroDropdownOpen(false);
                        }}
                        className={`${inputClassName} appearance-none pr-10`}
                      >
                        <option value="">Select hiring type</option>
                        {categoryDirectory.map((item) => (
                          <option key={item.slug} value={item.slug}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3E2A55]/65" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Micro Category</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsMicroDropdownOpen((open) => !open)}
                        className={`${inputClassName} flex h-auto min-h-12 items-center justify-between gap-3 py-3 text-left`}
                      >
                        <span className="line-clamp-2">
                          {selectedMicroCategoryNames.length
                            ? selectedMicroCategoryNames.join(', ')
                            : 'Select one or more categories'}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#3E2A55]/65 transition ${isMicroDropdownOpen ? 'rotate-180' : ''}`}
                          strokeWidth={2}
                        />
                      </button>

                      {isMicroDropdownOpen ? (
                        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 rounded-2xl border border-[#A98BC8]/60 bg-[#FFFFFF] p-3 shadow-[0_22px_44px_rgba(6,6,6,0.34)]">
                          <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                            {activeMicroCategories.map((item) => {
                              const active = selectedMicroCategories.includes(item.slug);
                              return (
                                <button
                                  key={item.slug}
                                  type="button"
                                  onClick={() =>
                                    setSelectedMicroCategories((prev) =>
                                      active
                                        ? prev.filter((slug) => slug !== item.slug)
                                        : [...prev, item.slug]
                                    )
                                  }
                                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                                    active
                                      ? 'bg-[#DF7AFE] text-[#FFFFFF]'
                                      : 'text-[#000000] hover:bg-[#A98BC8]/14 hover:text-[#8B4DD8]'
                                  }`}
                                >
                                  <span>{item.name}</span>
                                  {active ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-[#A98BC8]/35 pt-3">
                            <span className="text-xs font-semibold text-[#3E2A55]/70">
                              {selectedMicroCategories.length} selected
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedMicroCategories([])}
                              className="text-xs font-semibold text-[#8B4DD8]"
                            >
                              Clear selection
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Location</label>
                    <div className="relative">
                      <LocationSelectInput
                        value={brandForm.location}
                        onChange={(location) => setBrandForm((prev) => ({ ...prev, location }))}
                        className={`${inputClassName} pr-10`}
                        placeholder="Enter your city"
                      />
                      <MapPin className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3E2A55]/65" strokeWidth={2} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Budget (INR)</label>
                    <input
                      value={brandForm.budget}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, budget: event.target.value }))}
                      className={inputClassName}
                      placeholder="eg. 50,000"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-[#171321] pt-5">
                <div className="text-sm font-semibold text-[#FFFFFF]">Campaign Details</div>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Campaign Name</label>
                    <input
                      value={brandForm.campaignName}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, campaignName: event.target.value }))}
                      className={inputClassName}
                      placeholder="eg. Summer Sale Campaign"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Campaign Description</label>
                    <textarea
                      rows={4}
                      value={brandForm.campaignDescription}
                      onChange={(event) => setBrandForm((prev) => ({ ...prev, campaignDescription: event.target.value }))}
                      className={textareaClassName}
                      placeholder="Tell us more about your campaign, goals and target audience..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-8 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'submit inquiry'}
                  {!submitting ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
                </button>
                <div className="text-xs text-[#FFFFFF]/78">
                  By creating an account, you agree to our{' '}
                  <button type="button" onClick={() => navigate('terms-and-condition')} className="font-semibold text-[#FFFFFF] underline decoration-[#0099FF] underline-offset-4">
                    Terms & Conditions
                  </button>
                </div>
              </div>
            </form>

            <div className="rounded-[24px] border border-[#3E2A55] bg-[linear-gradient(180deg,#0D0D0D_0%,#000000_100%)] p-5 shadow-[0_12px_34px_rgba(169,139,200,0.12)] lg:p-6">
              <div className="flex min-h-full flex-col justify-between">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-[#171321] text-[#DF7AFE]">
                    <LockKeyhole className="h-6 w-6" strokeWidth={2} />
                  </div>
                  <div className="mt-5 text-center">
                    <h2 className="text-[1.7rem] font-semibold text-[#FFFFFF]">Welcome Back</h2>
                    <p className="mt-2 text-sm text-[#FFFFFF]/78">Log in to access your brand dashboard.</p>
                  </div>

                  {loginError ? (
                    <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {loginError}
                    </div>
                  ) : null}

                  {isBrandSession ? (
                    <div className="mt-8 space-y-4">
                      <div className="rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] px-4 py-4 text-sm text-[#FFFFFF]/78">
                        You are already signed in as <span className="font-semibold text-[#FFFFFF]">{user?.email}</span>.
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('user-dashboard')}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-6 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.22)]"
                      >
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} className="mt-8 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-medium text-[#FFFFFF]">Email ID</label>
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                          className={inputClassName}
                          placeholder="Enter your registered email"
                        />
                      </div>
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <label className="block text-xs font-medium text-[#FFFFFF]">Password</label>
                          <button type="button" className="text-xs font-medium text-[#DF7AFE]">
                            Forgot Password?
                          </button>
                        </div>
                        <input
                          type="password"
                          value={loginForm.password}
                          onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                          className={inputClassName}
                          placeholder="Enter your password"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loggingIn}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-6 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loggingIn ? 'Logging in...' : 'Login to Dashboard'}
                        {!loggingIn ? <ArrowRight className="h-4 w-4" strokeWidth={2} /> : null}
                      </button>

                      <div className="flex items-center gap-3 text-xs text-[#FFFFFF]/70">
                        <div className="h-px flex-1 bg-[#3E2A55]" />
                        OR
                        <div className="h-px flex-1 bg-[#3E2A55]" />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `${API_BASE_URL}/api/auth/google`;
                        }}
                        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-sm font-medium text-[#FFFFFF]"
                      >
                        <span className="text-base font-semibold text-[#DF7AFE]">G</span>
                        Continue with Google
                      </button>

                      <div className="text-center text-sm text-[#FFFFFF]/78">
                        Don&apos;t have an account?{' '}
                        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="font-semibold text-[#DF7AFE]">
                          Create one
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D] px-5 py-4 shadow-[0_10px_30px_rgba(169,139,200,0.10)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#FFFFFF]">{item.title}</div>
                      <div className="mt-1 text-xs text-[#FFFFFF]/72">{item.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryPage;
