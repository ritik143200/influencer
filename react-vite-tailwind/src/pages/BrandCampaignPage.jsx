import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronDown, MapPin, Save, Sparkles } from 'lucide-react';
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

const fallbackDirectory = [
  {
    slug: 'creator-influencer',
    name: 'Creator / Influencer',
    legacyHiringValue: 'influencer',
    microCategories: [{ slug: 'ugc-creator', name: 'UGC Creator' }, { slug: 'fashion', name: 'Fashion' }]
  },
  {
    slug: 'city-pages',
    name: 'City Pages',
    legacyHiringValue: 'city page',
    microCategories: [{ slug: 'local-city-pages', name: 'Local City Pages' }, { slug: 'food-pages', name: 'Food Pages' }]
  },
  {
    slug: 'meme-pages',
    name: 'Meme Pages',
    legacyHiringValue: 'meme page',
    microCategories: [{ slug: 'meme-pages-core', name: 'Meme Pages' }, { slug: 'music-pages', name: 'Music Pages' }]
  },
  {
    slug: 'celebrity',
    name: 'Celebrity',
    legacyHiringValue: 'celebrity',
    microCategories: [{ slug: 'all-types', name: 'All Types' }]
  }
];

const emptyDraft = {
  name: '',
  phone: '',
  email: '',
  password: '',
  budget: '',
  location: '',
  campaignName: '',
  campaignDescription: ''
};

const isLocalPreviewHost = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

const fetchWithTimeout = async (url, options = {}, timeoutMs = 7000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const readStoredBrand = () => {
  try {
    const raw = localStorage.getItem('userData') || localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readQueryCampaign = () => {
  const query = new URLSearchParams(window.location.search);
  const campaignName = query.get('previewCampaign') || query.get('campaignName');
  if (!campaignName) return null;

  return {
    _id: query.get('campaignId') || 'preview-campaign',
    name: query.get('previewBrand') || '',
    email: query.get('previewEmail') || '',
    phone: query.get('previewPhone') || '',
    campaignName,
    requirements: query.get('previewRequirements') || query.get('campaignDescription') || '',
    category: query.get('previewCategory') || '',
    hiringFor: query.get('previewHiringFor') || '',
    location: query.get('previewLocation') || '',
    budget: Number(query.get('previewBudget')) || 0,
    mainCategories: query.get('previewMainCategory') ? [query.get('previewMainCategory')] : [],
    microCategories: query.get('previewMicroCategories')
      ? query.get('previewMicroCategories').split(',').map((item) => item.trim()).filter(Boolean)
      : query.get('previewMicroCategory')
        ? [query.get('previewMicroCategory')]
        : [],
    createdAt: new Date().toISOString(),
    status: 'sent'
  };
};

const readPreviewCampaign = () => {
  try {
    const queryCampaign = readQueryCampaign();
    if (queryCampaign) return queryCampaign;

    const raw = localStorage.getItem('lastSubmittedInquiryPreview');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const toDraft = (campaign, brand) => ({
  name: campaign?.name || brand?.name || '',
  phone: campaign?.phone || brand?.phone || '',
  email: campaign?.email || brand?.email || '',
  password: '',
  budget: campaign?.budget ? String(campaign.budget) : '',
  location: campaign?.location || '',
  campaignName: campaign?.campaignName || '',
  campaignDescription: campaign?.requirements || campaign?.campaignDescription || ''
});

const findMainCategorySlug = (campaign, directory) => {
  const fromCampaign = Array.isArray(campaign?.mainCategories) ? campaign.mainCategories[0] : campaign?.mainCategory;
  if (fromCampaign) return fromCampaign;

  const legacy = campaign?.hiringFor;
  const byLegacy = directory.find((item) => item.legacyHiringValue === legacy || item.name === legacy);
  return byLegacy?.slug || directory[0]?.slug || '';
};

const findMicroCategorySlugs = (campaign, directory, mainSlug) => {
  const fromCampaign = Array.isArray(campaign?.microCategories) ? campaign.microCategories : campaign?.microCategory ? [campaign.microCategory] : [];
  if (fromCampaign.length) return fromCampaign;

  const main = directory.find((item) => item.slug === mainSlug);
  const categoryLabels = String(campaign?.category || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const byName = categoryLabels
    .map((label) => main?.microCategories?.find((item) => item.name === label)?.slug)
    .filter(Boolean);

  return byName;
};

const getAccountRole = (account) => account?.role || account?.profileType || '';
const isInfluencerAccount = (account) => ['influencer', 'artist'].includes(getAccountRole(account));
const isBrandAccount = (account) => {
  if (!account || isInfluencerAccount(account)) return false;
  const role = getAccountRole(account);
  return !role || ['brand', 'user'].includes(role);
};

const BrandCampaignPage = ({ mode = 'create' }) => {
  const isDetails = mode === 'details';
  const { user, isAuthenticated, login } = useAuth();
  const { navigate, params } = useRouter();
  const { directory } = useCategoryDirectory();
  const categoryDirectory = useMemo(() => (directory?.length ? directory : fallbackDirectory), [directory]);
  const storedBrand = useMemo(() => readStoredBrand(), []);
  const brand = isBrandAccount(user) ? user : isBrandAccount(storedBrand) ? storedBrand : null;
  const isBrandSession = isAuthenticated && isBrandAccount(user);
  const [campaignId, setCampaignId] = useState(params?.campaignId || '');
  const [brandForm, setBrandForm] = useState(() => ({
    ...emptyDraft,
    name: brand?.name || '',
    phone: brand?.phone || '',
    email: brand?.email || ''
  }));
  const [selectedMainCategory, setSelectedMainCategory] = useState(categoryDirectory[0]?.slug || '');
  const [selectedMicroCategories, setSelectedMicroCategories] = useState([]);
  const [isMicroDropdownOpen, setIsMicroDropdownOpen] = useState(false);
  const microDropdownRef = useRef(null);
  const [loading, setLoading] = useState(isDetails);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    if (!isDetails) return;

    const loadCampaign = async () => {
      setLoading(true);
      setError('');
      const previewCampaign = readPreviewCampaign();
      const token = localStorage.getItem('userToken');

      if (!token || campaignId === 'preview-campaign') {
        const draft = toDraft(previewCampaign, brand);
        setBrandForm(draft);
        const mainSlug = findMainCategorySlug(previewCampaign, categoryDirectory);
        setSelectedMainCategory(mainSlug);
        setSelectedMicroCategories(findMicroCategorySlugs(previewCampaign, categoryDirectory, mainSlug));
        setCampaignId(previewCampaign?._id || 'preview-campaign');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const campaigns = Array.isArray(data?.data) ? data.data : [];
        const found = campaigns.find((item) => (item._id || item.id) === campaignId) || campaigns[0] || previewCampaign;
        const draft = toDraft(found, brand);
        setBrandForm(draft);
        const mainSlug = findMainCategorySlug(found, categoryDirectory);
        setSelectedMainCategory(mainSlug);
        setSelectedMicroCategories(findMicroCategorySlugs(found, categoryDirectory, mainSlug));
      } catch {
        const draft = toDraft(previewCampaign, brand);
        setBrandForm(draft);
        const mainSlug = findMainCategorySlug(previewCampaign, categoryDirectory);
        setSelectedMainCategory(mainSlug);
        setSelectedMicroCategories(findMicroCategorySlugs(previewCampaign, categoryDirectory, mainSlug));
      } finally {
        setLoading(false);
      }
    };

    loadCampaign();
  }, [API_BASE_URL, brand, campaignId, categoryDirectory, isDetails]);

  const persistPreviewCampaign = () => {
    const categoryPayload = getCategorySelectionPayload(categoryDirectory, [selectedMainCategory], selectedMicroCategories);
    const microCategoryNames = activeMicroCategories
      .filter((item) => selectedMicroCategories.includes(item.slug))
      .map((item) => item.name);

    const payload = {
      _id: campaignId || 'preview-campaign',
      name: brandForm.name.trim(),
      email: brandForm.email.trim(),
      phone: brandForm.phone.trim(),
      campaignName: brandForm.campaignName.trim(),
      requirements: brandForm.campaignDescription.trim(),
      category: microCategoryNames.join(', '),
      hiringFor: activeMainCategory?.name || '',
      location: brandForm.location.trim(),
      budget: Number(brandForm.budget) || 0,
      mainCategories: [selectedMainCategory],
      microCategories: selectedMicroCategories,
      createdAt: readPreviewCampaign()?.createdAt || new Date().toISOString(),
      status: readPreviewCampaign()?.status || 'sent',
      ...categoryPayload
    };

    localStorage.setItem('lastSubmittedInquiryPreview', JSON.stringify(payload));
    return payload;
  };

  const createAccountIfNeeded = async () => {
    const existingToken = localStorage.getItem('userToken');
    if (isBrandSession && existingToken && existingToken !== 'preview-brand-token') {
      return existingToken;
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/register`, {
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
    if (!response.ok || !data.token) throw new Error(data.message || 'Unable to create your brand account.');

    const nextUser = { ...data };
    delete nextUser.message;
    localStorage.setItem('userToken', data.token);
    localStorage.setItem('userData', JSON.stringify(nextUser));
    login(nextUser);
    return data.token;
  };

  const validateForm = () => {
    if (!brandForm.name.trim()) return 'Please enter your brand name.';
    if (!brandForm.phone.trim()) return 'Please enter your phone number.';
    if (!brandForm.email.trim()) return 'Please enter your email address.';
    if (!isDetails && !isBrandSession && !brandForm.password.trim()) return 'Please create a password.';
    if (!selectedMainCategory) return 'Please select a hiring type.';
    if (!selectedMicroCategories.length) return 'Please select at least one micro category.';
    if (!brandForm.location.trim()) return 'Please enter your location.';
    if (!brandForm.budget.trim()) return 'Please enter your budget.';
    if (!brandForm.campaignName.trim()) return 'Please enter your campaign name.';
    if (!brandForm.campaignDescription.trim()) return 'Please enter your campaign description.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const token = await createAccountIfNeeded();
      const categoryPayload = getCategorySelectionPayload(categoryDirectory, [selectedMainCategory], selectedMicroCategories);
      const microCategoryNames = activeMicroCategories
        .filter((item) => selectedMicroCategories.includes(item.slug))
        .map((item) => item.name);
      const body = {
        name: brandForm.name.trim(),
        email: brandForm.email.trim(),
        phone: brandForm.phone.trim(),
        campaignName: brandForm.campaignName.trim(),
        hiringFor: activeMainCategory?.legacyHiringValue || 'influencer',
        category: microCategoryNames.join(', '),
        mainCategories: [selectedMainCategory],
        microCategories: selectedMicroCategories,
        location: brandForm.location.trim(),
        budget: Number(brandForm.budget),
        requirements: brandForm.campaignDescription.trim(),
        ...categoryPayload
      };

      const endpoint = isDetails && campaignId && campaignId !== 'preview-campaign'
        ? `${API_BASE_URL}/api/inquiries/${campaignId}`
        : `${API_BASE_URL}/api/inquiries`;

      if (isLocalPreviewHost() && (token === 'preview-brand-token' || campaignId === 'preview-campaign')) {
        persistPreviewCampaign();
        setSuccess(isDetails ? 'Preview campaign updated locally.' : 'Preview campaign created locally.');
        setTimeout(() => navigate('brand-dashboard-active-preview'), 650);
        return;
      }

      const response = await fetchWithTimeout(endpoint, {
        method: isDetails && campaignId && campaignId !== 'preview-campaign' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save campaign.');
      }

      const saved = data.data || {};
      localStorage.setItem('lastSubmittedInquiryPreview', JSON.stringify(saved));
      setSuccess(isDetails ? 'Campaign details updated.' : 'Campaign created.');
      setTimeout(() => navigate('user-dashboard'), 700);
    } catch (saveError) {
      const isLocalPreview = isLocalPreviewHost();
      const isNetworkBlocked = saveError?.message?.toLowerCase?.().includes('failed to fetch');

      if (isLocalPreview) {
        persistPreviewCampaign();
        setSuccess(isDetails ? 'Preview campaign updated locally.' : 'Preview campaign created locally.');
        setTimeout(() => navigate('brand-dashboard-active-preview'), 650);
        return;
      }

      setError(
        isNetworkBlocked
          ? 'Backend is not reachable right now. Please try again after deployment is live.'
          : saveError.message || 'Unable to save campaign.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleMicroCategory = (slug) => {
    setSelectedMicroCategories((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#000000] px-5 py-8 text-[#FFFFFF]">
        <div className="mx-auto max-w-[980px] rounded-[26px] border border-[#3E2A55] bg-[#0D0D0D] p-8 text-center text-sm text-[#FFFFFF]">
          Loading campaign details...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,rgba(223,122,254,0.18),transparent_32%),linear-gradient(180deg,#000000_0%,#171321_100%)] px-4 py-6 text-[#FFFFFF] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <button
          type="button"
          onClick={() => navigate('user-dashboard')}
          className="mb-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 text-sm font-semibold text-[#FFFFFF]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Dashboard
        </button>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#3E2A55] bg-[#000000]/82 p-5 shadow-[0_24px_70px_rgba(6,6,6,0.50)] backdrop-blur-xl lg:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-[1.65rem] font-semibold text-[#FFFFFF]">
                {isDetails ? 'Campaign Details' : 'Create Your Brand Account'}
              </h1>
              <p className="mt-1 text-sm text-[#FFFFFF]/78">
                {isDetails ? 'Review and edit your brand campaign details.' : 'Get started by adding your brand and campaign details.'}
              </p>
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
              {!isDetails && !isBrandSession ? (
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
                              onClick={() => toggleMicroCategory(item.slug)}
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
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-8 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : isDetails ? 'Save Changes' : 'submit inquiry'}
              {!saving ? (isDetails ? <Save className="h-4 w-4" strokeWidth={2} /> : <ArrowRight className="h-4 w-4" strokeWidth={2} />) : null}
            </button>
            <div className="text-xs text-[#FFFFFF]/78">
              By creating an account, you agree to our{' '}
              <button type="button" onClick={() => navigate('terms-and-condition')} className="font-semibold text-[#FFFFFF] underline decoration-[#0099FF] underline-offset-4">
                Terms & Conditions
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default BrandCampaignPage;
