import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  MapPinned,
  Sparkles,
  Instagram,
  Youtube,
  UserRound,
  ShieldCheck
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

const inputClassName = 'w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-300/40 focus:bg-white/[0.06]';

const InfluencerRegistrationPage = ({ embedded = false }) => {
  const { navigate } = useRouter();
  const { login, updateUser } = useAuth();
  const { directory, loading: categoryLoading } = useCategoryDirectory();

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const cityInputRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const cityFetchTimer = useRef(null);

  const activeCategoryGroups = useMemo(
    () => getGroupedMicroCategories(directory, selectedMainCategories),
    [directory, selectedMainCategories]
  );

  const selectedMicroNames = useMemo(
    () => getMicroCategoryNames(directory, selectedMicroCategories),
    [directory, selectedMicroCategories]
  );

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

  const handleLocationChange = useCallback((event) => {
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
  }, []);

  const handleCitySelect = (city) => {
    handleInputChange('location', city);
    setShowCityDropdown(false);
    setCitySuggestions([]);
  };

  const toggleMainCategory = (mainCategorySlug) => {
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
    setSelectedMicroCategories((previous) =>
      previous.includes(microCategorySlug)
        ? previous.filter((slug) => slug !== microCategorySlug)
        : [...previous, microCategorySlug]
    );
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (phone.startsWith('+')) return cleaned.startsWith('91') ? phone : `+91${cleaned}`;
    return cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Please enter your full name.';
    if (!formData.email.trim() || !formData.phone.trim() || !formData.password.trim()) return 'Please fill all required fields.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (!selectedMainCategories.length) return 'Select at least one main category.';
    if (!selectedMicroCategories.length) return 'Select at least one micro category.';
    if (!formData.termsAccepted) return 'Please accept the terms and conditions.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const categoryPayload = getCategorySelectionPayload(
        directory,
        selectedMainCategories,
        selectedMicroCategories
      );

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formatPhoneNumber(formData.phone),
        password: formData.password,
        location: formData.location,
        socialLinks: formData.socialLinks,
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
      login(mergedUser);
      updateUser(mergedUser);

      setSuccess('Creator profile created. Redirecting to your dashboard...');
      setTimeout(() => navigate('influencer-dashboard'), 1200);
    } catch (submitError) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? 'rounded-[1.7rem] bg-[#071023] p-4 sm:p-5' : 'section-shell pb-12'}>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[1.8rem] p-6 sm:p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Creator onboarding
          </div>

          <h2 className="mt-5 text-3xl font-black text-white sm:text-4xl">
            Turn your influence into a premium creator profile.
          </h2>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Choose the category clusters you belong to, tag your micro categories, and make your profile instantly understandable to brands and admins.
          </p>

          <div className="mt-8 space-y-4">
            {[
              { title: 'Dynamic categories', description: 'Main categories and micro categories sync with backend taxonomy.' },
              { title: 'Better discovery', description: 'Brands can filter by creator type, niche, and community energy.' },
              { title: 'Scalable admin flow', description: 'Every submission lands with structured metadata for moderation and analytics.' }
            ].map((item) => (
              <div key={item.title} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-bold text-white">{item.title}</div>
                <div className="mt-1 text-sm leading-7 text-slate-300">{item.description}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.8rem] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Create your creator account</div>
              <h3 className="mt-2 text-2xl font-black text-white">Creator / Influencer registration</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <UserRound className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-[1.2rem] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-[1.2rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full name"
              value={formData.fullName}
              onChange={(event) => handleInputChange('fullName', event.target.value)}
              className={`${inputClassName} sm:col-span-2`}
            />
            <input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(event) => handleInputChange('email', event.target.value)}
              className={inputClassName}
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(event) => handleInputChange('phone', event.target.value)}
              className={inputClassName}
            />

            <div className="relative sm:col-span-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(event) => handleInputChange('password', event.target.value)}
                className={`${inputClassName} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 transition hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" strokeWidth={1.8} /> : <Eye className="h-5 w-5" strokeWidth={1.8} />}
              </button>
            </div>

            <div className="relative sm:col-span-2">
              <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" strokeWidth={1.8} />
              <input
                ref={cityInputRef}
                type="text"
                placeholder="City or location"
                value={formData.location}
                onChange={handleLocationChange}
                onFocus={() => {
                  if (formData.location.trim() && citySuggestions.length) setShowCityDropdown(true);
                }}
                className={`${inputClassName} pl-12`}
              />

              {(cityLoading || (showCityDropdown && citySuggestions.length > 0)) && (
                <div ref={cityDropdownRef} className="absolute z-20 mt-2 w-full rounded-[1.2rem] border border-white/10 bg-[#0a1122] p-2 shadow-2xl">
                  {cityLoading ? (
                    <div className="px-3 py-2 text-sm text-white/55">Searching cities...</div>
                  ) : (
                    citySuggestions.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => handleCitySelect(city)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/[0.06]"
                      >
                        {city}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Main categories</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {directory.map((category) => {
                const isActive = selectedMainCategories.includes(category.slug);
                return (
                  <button
                    key={category.slug}
                    type="button"
                    onClick={() => toggleMainCategory(category.slug)}
                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'border-violet-300/30 bg-violet-400/12 text-white'
                        : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07]'
                    }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Micro categories</div>
              {categoryLoading && <div className="text-xs text-white/40">Loading taxonomy...</div>}
            </div>

            <div className="mt-4 space-y-5">
              {activeCategoryGroups.map((category) => (
                <div key={category.slug} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-sm font-bold text-white">{category.name}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(category.microCategories || []).map((microCategory) => {
                      const isSelected = selectedMicroCategories.includes(microCategory.slug);
                      return (
                        <button
                          key={microCategory.slug}
                          type="button"
                          onClick={() => toggleMicroCategory(microCategory.slug)}
                          className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                            isSelected
                              ? 'border-cyan-300/30 bg-cyan-400/12 text-white'
                              : 'border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.07]'
                          }`}
                        >
                          {microCategory.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedMicroNames.length > 0 && (
              <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-white">Selected:</span> {selectedMicroNames.join(', ')}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="relative">
              <Instagram className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" strokeWidth={1.8} />
              <input
                type="url"
                placeholder="Instagram link"
                value={formData.socialLinks.instagram}
                onChange={(event) => handleInputChange('socialLinks.instagram', event.target.value)}
                className={`${inputClassName} pl-12`}
              />
            </div>
            <div className="relative">
              <Youtube className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" strokeWidth={1.8} />
              <input
                type="url"
                placeholder="YouTube link"
                value={formData.socialLinks.youtube}
                onChange={(event) => handleInputChange('socialLinks.youtube', event.target.value)}
                className={`${inputClassName} pl-12`}
              />
            </div>
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(event) => handleInputChange('termsAccepted', event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-violet-500"
            />
            <span>
              I agree to the terms, privacy policy, and verification process for creator applications on ViralMantrix.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="magnetic-button mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            {loading ? 'Creating creator account...' : 'Join the creator network'}
          </button>

          <div className="mt-4 text-center text-sm text-white/55">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('auth')} className="font-semibold text-cyan-300 transition hover:text-cyan-200">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfluencerRegistrationPage;
