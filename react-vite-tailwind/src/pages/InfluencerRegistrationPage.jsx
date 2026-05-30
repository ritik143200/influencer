import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Instagram,
  LayoutGrid,
  MapPinned,
  ShieldCheck,
  Youtube
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../data/config';
import { useCategoryDirectory } from '../hooks/useCategoryDirectory';
import {
  getCategorySelectionPayload,
  getGroupedMicroCategories,
  getMicroCategoryNames
} from '../utils/categoryDirectory';
import LocationSelectInput from '../components/LocationSelectInput';
import { useClickOutside } from '../hooks/useClickOutside';

const inputClassName =
  'w-full rounded-2xl border border-[#A98BC8]/55 bg-[#FFFFFF] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#3E2A55]/55 focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/22';

const stepMeta = [
  { id: 1, title: 'Tell us about yourself', caption: 'Profile details' },
  { id: 2, title: 'Connect your social media', caption: 'Social setup' }
];

const InfluencerRegistrationPage = ({ embedded = false }) => {
  const { navigate } = useRouter();
  const { login, updateUser } = useAuth();
  const { directory, loading: categoryLoading } = useCategoryDirectory();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    location: '',
    socialLinks: {
      instagram: '',
      youtube: ''
    },
    termsAccepted: false
  });
  const [selectedMainCategories, setSelectedMainCategories] = useState(['creator-influencer']);
  const [selectedMicroCategories, setSelectedMicroCategories] = useState([]);
  const [isMicroDropdownOpen, setIsMicroDropdownOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const microDropdownRef = useRef(null);
  const cityInputRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const cityFetchTimer = useRef(null);

  useEffect(() => {
    const draft = localStorage.getItem('pendingInfluencerSignupDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData((prev) => ({
          ...prev,
          fullName: parsedDraft.fullName || prev.fullName,
          email: parsedDraft.email || prev.email,
          phone: parsedDraft.phone || prev.phone,
          password: parsedDraft.password || prev.password
        }));
      } catch {
        // ignore malformed draft
      }
    }
  }, []);

  const activeCategoryGroups = useMemo(
    () => getGroupedMicroCategories(directory, selectedMainCategories),
    [directory, selectedMainCategories]
  );

  const selectedMicroNames = useMemo(
    () => getMicroCategoryNames(directory, selectedMicroCategories),
    [directory, selectedMicroCategories]
  );

  useClickOutside(microDropdownRef, () => setIsMicroDropdownOpen(false), isMicroDropdownOpen);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    setError('');
  };

  const handleLocationChange = useCallback(
    (event) => {
      const value = event.target.value;
      handleInputChange('location', value);

      if (cityFetchTimer.current) clearTimeout(cityFetchTimer.current);

      if (!value.trim()) {
        setCitySuggestions([]);
        setShowCityDropdown(false);
        setCityLoading(false);
        return;
      }

      setCityLoading(true);
      cityFetchTimer.current = setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/cities?q=${encodeURIComponent(value.trim())}`);
          const data = await response.json();
          if (data.success) {
            const names = data.data.map((item) => item.name);
            setCitySuggestions(names);
            setShowCityDropdown(names.length > 0);
          }
        } catch {
          setCitySuggestions([]);
          setShowCityDropdown(false);
        } finally {
          setCityLoading(false);
        }
      }, 250);
    },
    [setFormData]
  );

  const handleCitySelect = (city) => {
    handleInputChange('location', city);
    setShowCityDropdown(false);
    setCitySuggestions([]);
  };

  const toggleMainCategory = (mainCategorySlug) => {
    setError('');
    setIsMicroDropdownOpen(false);
    setSelectedMainCategories((previous) => {
      const next = previous.includes(mainCategorySlug)
        ? previous.filter((slug) => slug !== mainCategorySlug)
        : [...previous, mainCategorySlug];

      setSelectedMicroCategories((currentMicroCategories) =>
        currentMicroCategories.filter((microSlug) =>
          next.some((selectedMainSlug) =>
            directory.find((category) => category.slug === selectedMainSlug)?.microCategories?.some((microCategory) => microCategory.slug === microSlug)
          )
        )
      );

      return next;
    });
  };

  const toggleMicroCategory = (microCategorySlug) => {
    setError('');
    setSelectedMicroCategories((previous) =>
      previous.includes(microCategorySlug)
        ? previous.filter((slug) => slug !== microCategorySlug)
        : [...previous, microCategorySlug]
    );
  };

  const goToStep = (nextStep) => {
    if (nextStep > step && step === 1) {
      const validationError = validateStepOne();
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');
    setStep(Math.min(stepMeta.length, Math.max(1, nextStep)));
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (phone.startsWith('+')) return cleaned.startsWith('91') ? phone : `+91${cleaned}`;
    return cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;
  };

  const validateStepOne = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name.';
    if (!formData.email.trim()) return 'Please enter your email address.';
    if (!formData.phone.trim()) return 'Please enter your phone number.';
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) return 'Please enter a valid 10-digit phone number.';
    if (!formData.password.trim()) return 'Please create a password.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (!formData.location.trim()) return 'Please select your city or location.';
    if (!selectedMainCategories.length) return 'Select at least one main category.';
    if (!selectedMicroCategories.length) return 'Select at least one micro category.';
    return null;
  };

  const validateForm = () => {
    const stepOneError = validateStepOne();
    if (stepOneError) return stepOneError;
    if (!formData.socialLinks.instagram.trim()) return 'Please add your Instagram profile link.';
    if (!formData.termsAccepted) return 'Please accept the terms to continue.';
    return null;
  };

  const handleNext = () => {
    const validationError = validateStepOne();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      if (validateStepOne()) setStep(1);
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const categoryPayload = getCategorySelectionPayload(directory, selectedMainCategories, selectedMicroCategories);
      const selectedMicroCategoryNames = getMicroCategoryNames(directory, selectedMicroCategories);
      const [firstName = '', ...lastNameParts] = formData.fullName.trim().split(/\s+/);
      const payload = {
        firstName,
        lastName: lastNameParts.join(' '),
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email.trim(),
        emailId: formData.email.trim(),
        phone: formatPhoneNumber(formData.phone),
        phoneNumber: formatPhoneNumber(formData.phone),
        password: formData.password,
        location: formData.location,
        socialLinks: formData.socialLinks,
        instagram: formData.socialLinks.instagram,
        youtube: formData.socialLinks.youtube,
        categories: selectedMicroCategoryNames,
        niche: selectedMicroCategoryNames,
        profileType: 'influencer',
        termsAccepted: formData.termsAccepted,
        ...categoryPayload
      };

      const response = await fetch(`${API_BASE_URL}/api/influencer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        return;
      }

      const serverUser = data.data || {};
      const mergedUser = {
        ...serverUser,
        fullName: serverUser.fullName || formData.fullName,
        email: serverUser.email || formData.email,
        phone: serverUser.phone || formatPhoneNumber(formData.phone),
        location: serverUser.location || formData.location,
        socialLinks: serverUser.socialLinks || formData.socialLinks,
        role: serverUser.role || 'influencer'
      };

      if (data.token) {
        localStorage.setItem('userToken', data.token);
      }
      localStorage.setItem('userData', JSON.stringify(mergedUser));
      localStorage.setItem('loggedInUser', JSON.stringify(mergedUser));
      localStorage.removeItem('pendingInfluencerSignupDraft');
      login(mergedUser);
      updateUser(mergedUser);

      setSuccess('Creator profile created. Redirecting to your dashboard...');
      setTimeout(() => navigate('influencer-dashboard'), 1200);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? 'rounded-[2rem] bg-[radial-gradient(circle_at_12%_0%,rgba(223,122,254,0.18),transparent_32%),linear-gradient(135deg,#000000_0%,#171321_100%)] p-6 text-[#FFFFFF]'
          : 'min-h-dvh overflow-x-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(223,122,254,0.18),transparent_32%),linear-gradient(135deg,#000000_0%,#171321_100%)] text-[#FFFFFF]'
      }
    >
      <div className="relative isolate overflow-x-hidden">
        {!embedded && (
          <div className="absolute inset-0">
            <div className="absolute left-[-5%] top-[14%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(223,122,254,0.30),transparent_62%)] blur-2xl" />
            <div className="absolute right-[-2%] top-[6%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.24),transparent_62%)] blur-3xl" />
            <div className="absolute right-[8%] top-[18%] hidden h-[72%] w-[35%] rounded-[3rem] bg-[linear-gradient(180deg,rgba(62,42,85,0.96),rgba(20,16,32,0.92))] shadow-[0_40px_90px_rgba(6,6,6,0.42)] lg:block" />
            <div className="absolute right-[11%] top-[22%] hidden h-32 w-32 rounded-full bg-[#0099FF]/18 blur-lg lg:block" />
            <div className="absolute right-[18%] top-[16%] hidden h-4 w-4 rounded-full bg-[#FFFFFF]/75 lg:block" />
            <div className="absolute right-[12%] top-[44%] hidden h-3 w-3 rounded-full bg-[#FFFFFF]/65 lg:block" />
          </div>
        )}

        <div className={`relative z-10 ${embedded ? '' : 'mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8'}`}>
          {!embedded && (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('home')}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-3 py-2 text-xs font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(6,6,6,0.28)] backdrop-blur sm:gap-2 sm:px-4 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
                Back
              </button>

              <div className="min-w-0 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#FFFFFF] sm:text-sm sm:tracking-[0.26em]">
                Viral<span className="text-[#DF7AFE]">Mantrix</span>
              </div>

              <button
                type="button"
                onClick={() => navigate('auth')}
                className="rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-3 py-2 text-xs font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(6,6,6,0.28)] backdrop-blur sm:px-5 sm:py-2.5 sm:text-sm"
              >
                Login
              </button>
            </div>
          )}

          <div className={`${embedded ? '' : 'flex w-full justify-center pb-10 pt-8 sm:pt-10'}`}>
            <div className="mx-auto w-[92vw] max-w-[340px] sm:w-full sm:max-w-[40rem]">
              <div className="w-full rounded-[1.7rem] border border-[#3E2A55] bg-[#000000]/92 p-4 shadow-[0_26px_80px_rgba(6,6,6,0.45)] backdrop-blur sm:rounded-[2rem] sm:p-8">
                <div className="mb-5 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2 sm:mb-6">
                  <button
                    type="button"
                    onClick={() => goToStep(step - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171321] text-[#FFFFFF]"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                  </button>

                  <div className="min-w-0 text-center">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A98BC8]">
                      Step {step} of {stepMeta.length}
                    </div>
                    <h2 className="mt-2 text-[1.45rem] font-semibold leading-tight text-[#FFFFFF] sm:text-2xl">{stepMeta[step - 1].title}</h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToStep(step + 1)}
                    disabled={step === stepMeta.length}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#171321] text-[#FFFFFF] disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                {error && (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                {step === 1 ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(event) => handleInputChange('fullName', event.target.value)}
                        className={`${inputClassName} sm:col-span-2`}
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
                        className={`${inputClassName} sm:col-span-2`}
                      />
                    </div>

                    <div className="relative">
                      <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]/65" strokeWidth={1.8} />
                      <LocationSelectInput
                        inputRef={cityInputRef}
                        placeholder="Select your location"
                        value={formData.location}
                        onChange={(location) => handleInputChange('location', location)}
                        onFocus={() => {
                          if (formData.location.trim() && citySuggestions.length) setShowCityDropdown(true);
                        }}
                        className={`${inputClassName} pl-12`}
                      />

                      {(cityLoading || (showCityDropdown && citySuggestions.length > 0)) && (
                        <div ref={cityDropdownRef} className="absolute z-20 mt-2 w-full rounded-[1.2rem] border border-[#3E2A55] bg-[#0D0D0D] p-2 shadow-xl">
                          {cityLoading ? (
                            <div className="px-3 py-2 text-sm text-[#FFFFFF]/72">Searching cities...</div>
                          ) : (
                            citySuggestions.map((city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => handleCitySelect(city)}
                                className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[#FFFFFF] transition hover:bg-[#171321]"
                              >
                                {city}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FFFFFF]">Main categories</div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {directory.map((category) => {
                          const isActive = selectedMainCategories.includes(category.slug);
                          return (
                            <button
                              key={category.slug}
                              type="button"
                              onClick={() => toggleMainCategory(category.slug)}
                              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                isActive
                                  ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white'
                                  : 'border-[#3E2A55] bg-[#0D0D0D] text-[#FFFFFF] hover:bg-[#171321]'
                              }`}
                            >
                              {category.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FFFFFF]">Micro categories</div>
                        {categoryLoading && <div className="text-xs text-[#FFFFFF]/60">Loading taxonomy...</div>}
                      </div>
                      <div className="relative mt-4" ref={microDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsMicroDropdownOpen((open) => !open)}
                          className={`${inputClassName} flex min-h-12 items-center justify-between gap-3 text-left`}
                        >
                          <span className="line-clamp-2">
                            {selectedMicroNames.length ? selectedMicroNames.join(', ') : 'Select one or more micro categories'}
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 text-[#3E2A55]/70 transition ${isMicroDropdownOpen ? 'rotate-180' : ''}`}
                            strokeWidth={2}
                          />
                        </button>

                        {isMicroDropdownOpen ? (
                          <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-30 rounded-[1.4rem] border border-[#3E2A55] bg-[#0D0D0D] p-3 shadow-[0_24px_55px_rgba(6,6,6,0.45)]">
                            <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
                              {activeCategoryGroups.map((category) => (
                                <div key={category.slug}>
                                  <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A98BC8]">
                                    <LayoutGrid className="h-3.5 w-3.5 text-[#DF7AFE]" strokeWidth={2} />
                                    {category.name}
                                  </div>
                                  <div className="space-y-1">
                                    {(category.microCategories || []).map((microCategory) => {
                                      const isSelected = selectedMicroCategories.includes(microCategory.slug);
                                      return (
                                        <button
                                          key={microCategory.slug}
                                          type="button"
                                          onClick={() => toggleMicroCategory(microCategory.slug)}
                                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                                            isSelected
                                              ? 'bg-[#DF7AFE] text-white'
                                              : 'bg-[#000000] text-[#FFFFFF] hover:bg-[#171321]'
                                          }`}
                                        >
                                          <span>{microCategory.name}</span>
                                          {isSelected ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-[#171321] pt-3">
                              <span className="text-xs font-semibold text-[#A98BC8]">
                                {selectedMicroCategories.length} selected
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMicroCategories([]);
                                  setError('');
                                }}
                                className="text-xs font-semibold text-[#DF7AFE]"
                              >
                                Clear selection
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.24)] transition hover:translate-y-[-1px]"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <Instagram className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]/65" strokeWidth={1.8} />
                        <input
                          type="url"
                          placeholder="Instagram profile link *"
                          value={formData.socialLinks.instagram}
                          onChange={(event) => handleInputChange('socialLinks.instagram', event.target.value)}
                          className={`${inputClassName} pl-12`}
                          required
                        />
                      </div>
                      <div className="relative">
                        <Youtube className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#3E2A55]/65" strokeWidth={1.8} />
                        <input
                          type="url"
                          placeholder="YouTube channel link"
                          value={formData.socialLinks.youtube}
                          onChange={(event) => handleInputChange('socialLinks.youtube', event.target.value)}
                          className={`${inputClassName} pl-12`}
                        />
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-[#171321] bg-[#0D0D0D] p-4">
                      <div className="text-sm font-semibold text-[#FFFFFF]">Selected profile summary</div>
                      <div className="mt-3 text-sm leading-7 text-[#FFFFFF]/72">
                        <span className="font-medium text-[#FFFFFF]">{formData.fullName || 'Your profile'}</span>
                        {selectedMicroNames.length > 0 ? ` in ${selectedMicroNames.join(', ')}` : ' with your category selections'}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-[1.4rem] border border-[#171321] bg-[#0D0D0D] p-4 text-sm text-[#FFFFFF]/72">
                      <input
                        type="checkbox"
                        checked={formData.termsAccepted}
                        onChange={(event) => handleInputChange('termsAccepted', event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-[#A98BC8] text-[#DF7AFE]"
                      />
                      <span>I agree to the creator verification process, terms, and privacy policy for ViralMantrix.</span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] px-5 py-3.5 text-sm font-semibold text-[#FFFFFF]"
                      >
                        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.24)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                        {loading ? 'Creating account...' : 'Create your creator profile'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerRegistrationPage;
