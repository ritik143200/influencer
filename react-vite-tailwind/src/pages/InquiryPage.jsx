import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { useCategoryDirectory } from '../hooks/useCategoryDirectory';
import {
  getCategorySelectionPayload,
  getGroupedMicroCategories,
  getMicroCategoryNames
} from '../utils/categoryDirectory';
import { API_BASE_URL } from '../data/config';

const inputClassName = 'w-full rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-violet-300/40 focus:bg-white/[0.06]';

const InquiryPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const { directory, loading: categoryLoading } = useCategoryDirectory();

  const initialForm = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: '',
    budget: '',
    requirements: ''
  }), [user]);

  const [form, setForm] = useState(initialForm);
  const [selectedMainCategories, setSelectedMainCategories] = useState(['creator-influencer']);
  const [selectedMicroCategories, setSelectedMicroCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
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

  const handleLocationChange = useCallback((event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, location: value }));

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

  const toggleMainCategory = (mainCategorySlug) => {
    setSelectedMainCategories((previous) => {
      const next = previous.includes(mainCategorySlug)
        ? previous.filter((slug) => slug !== mainCategorySlug)
        : [...previous, mainCategorySlug];

      setSelectedMicroCategories((current) =>
        current.filter((microSlug) =>
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

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return 'Please fill your contact details.';
    if (!selectedMainCategories.length) return 'Please choose at least one main category.';
    if (!selectedMicroCategories.length) return 'Please choose at least one micro category.';
    if (!form.location.trim()) return 'Please enter a location.';

    const budgetNumber = Number(form.budget);
    if (!form.budget || Number.isNaN(budgetNumber) || budgetNumber <= 0) return 'Budget must be a valid positive number.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      setError('Your session expired. Please sign in again.');
      return;
    }

    setSubmitting(true);

    try {
      const categoryPayload = getCategorySelectionPayload(directory, selectedMainCategories, selectedMicroCategories);
      const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          budget: Number(form.budget),
          requirements: form.requirements,
          ...categoryPayload
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to submit campaign brief.');
        return;
      }

      setSuccess('Campaign brief submitted. The admin dashboard will receive it instantly.');
      setForm((prev) => ({
        ...prev,
        location: '',
        budget: '',
        requirements: ''
      }));
      setSelectedMainCategories(['creator-influencer']);
      setSelectedMicroCategories([]);
    } catch (submitError) {
      setError('Network error while submitting campaign brief.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pb-14 pt-28 text-white">
      <div className="section-shell grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <BriefcaseBusiness className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Brand campaign brief
          </div>
          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
            Build your next creator-led campaign.
          </h1>
          <p className="mt-4 text-sm leading-8 text-slate-300">
            Pick the creator surfaces you need, define the campaign signal, and send a structured brief that flows straight into the admin dashboard.
          </p>

          <div className="mt-8 space-y-4">
            {[
              'Select one or many creator surfaces at once',
              'Choose micro categories without old-school checkboxes',
              'Send brand details, budget, and deliverables in one motion',
              'Admin can instantly filter submissions by category metadata'
            ].map((item) => (
              <div key={item} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">New brief</div>
              <h2 className="mt-2 text-2xl font-black text-white">Create your brand account brief</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
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
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className={`${inputClassName} sm:col-span-2`}
              placeholder="Brand name or contact person"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className={inputClassName}
              placeholder="Email address"
            />
            <input
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className={inputClassName}
              placeholder="Phone number"
            />
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
            <div className="relative sm:col-span-1">
              <MapPinned className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" strokeWidth={1.8} />
              <input
                ref={cityInputRef}
                value={form.location}
                onChange={handleLocationChange}
                onFocus={() => {
                  if (form.location.trim() && citySuggestions.length) setShowCityDropdown(true);
                }}
                className={`${inputClassName} pl-12`}
                placeholder="City or target market"
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
                        onClick={() => {
                          setForm((prev) => ({ ...prev, location: city }));
                          setShowCityDropdown(false);
                          setCitySuggestions([]);
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/[0.06]"
                      >
                        {city}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <input
              value={form.budget}
              onChange={(event) => setForm((prev) => ({ ...prev, budget: event.target.value }))}
              className={inputClassName}
              placeholder="Budget in INR"
              inputMode="numeric"
            />
          </div>

          <div className="mt-4">
            <textarea
              value={form.requirements}
              onChange={(event) => setForm((prev) => ({ ...prev, requirements: event.target.value }))}
              rows={6}
              className={`${inputClassName} min-h-[150px] resize-none`}
              placeholder="Share the campaign idea, platform expectations, audience, deliverables, timelines, and vibe."
            />
          </div>

          <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4 text-sm text-slate-300">
            Submitted briefs automatically reach the admin dashboard with category metadata for filtering, moderation, and collaboration tracking.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="magnetic-button mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? <ShieldCheck className="h-4 w-4 animate-pulse" strokeWidth={2} /> : <ArrowRight className="h-4 w-4" strokeWidth={2} />}
            {submitting ? 'Submitting campaign brief...' : 'Submit campaign brief'}
          </button>
        </form>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-[2rem] p-6 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <ShieldCheck className="h-6 w-6" strokeWidth={2} />
            </div>
            <h3 className="mt-5 text-2xl font-black">Sign in to send your brief</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Your brand brief needs an account so it can be tracked safely inside the dashboard.
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => navigate('registration', { type: 'user' })}
                className="w-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-3 text-sm font-bold text-white"
              >
                Create a brand account
              </button>
              <button
                type="button"
                onClick={() => navigate('auth')}
                className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/85"
              >
                I already have an account
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="w-full rounded-full px-5 py-3 text-sm font-medium text-white/55"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
