import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CreditCard,
  Inbox,
  Instagram,
  LayoutDashboard,
  Link2,
  LogOut,
  MapPin,
  Plus,
  Save,
  Send,
  Settings,
  ShieldCheck,
  UserRound,
  Wallet,
  Youtube
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';
import { useCategoryDirectory } from '../hooks/useCategoryDirectory';
import {
  getCategorySelectionPayload,
  getGroupedMicroCategories,
  getMicroCategoryNames
} from '../utils/categoryDirectory';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import LocationSelectInput from '../components/LocationSelectInput';
import { useClickOutside } from '../hooks/useClickOutside';

const inputClassName =
  'w-full rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-3.5 py-3 text-sm text-[#FFFFFF] outline-none transition placeholder:text-[#A98BC8] focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#0099FF]/15';

const cardClass = 'rounded-xl border border-[#3E2A55] bg-[#0D0D0D] shadow-[0_18px_50px_rgba(6,6,6,0.42)]';

const previewProfile = {
  fullName: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  location: '',
  category: 'Influencer',
  experience: '',
  budgetMin: '',
  budgetMax: '',
  mainCategories: ['creator-influencer'],
  microCategories: ['fashion'],
  socialLinks: {
    instagram: '',
    youtube: '',
    facebook: ''
  },
  platforms: {
    instagram: { followers: '' },
    youtube: { followers: '' },
    facebook: { followers: '' }
  },
  portfolio: [
    { title: '', url: '' },
    { title: '', url: '' },
    { title: '', url: '' }
  ]
};

const splitLocation = (location) => {
  if (!location) return { city: '', country: '' };
  if (typeof location === 'object') {
    return { city: location.city || '', country: location.country || '' };
  }
  const [city = '', country = ''] = String(location).split(',').map((item) => item.trim());
  return { city, country };
};

const splitGoogleLocation = (value) => {
  const parts = String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  return {
    city: parts[0] || '',
    country: parts[parts.length - 1] || ''
  };
};

const normalizeProfile = (profile = {}) => ({
  fullName: profile.fullName || profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || '',
  username: profile.username || '',
  email: profile.email || '',
  phone: profile.phone || '',
  bio: profile.bio || '',
  location: splitLocation(profile.location),
  category: profile.category || '',
  experience: profile.experience || '',
  gender: profile.gender || '',
  budgetMin: profile.budgetMin || '',
  budgetMax: profile.budgetMax || profile.budget || '',
  pricing: {
    reel: profile.pricing?.reel || profile.pricing?.collaborationCharges || '',
    story: profile.pricing?.story || '',
    collab: profile.pricing?.collab || '',
    staticPost: profile.pricing?.staticPost || '',
    other: profile.pricing?.other || '',
    custom: Array.isArray(profile.pricing?.custom) ? profile.pricing.custom : []
  },
  socialLinks: {
    instagram: profile.socialLinks?.instagram || profile.platforms?.instagram?.url || '',
    youtube: profile.socialLinks?.youtube || profile.platforms?.youtube?.url || '',
    facebook: profile.socialLinks?.facebook || profile.platforms?.facebook?.url || ''
  },
  followers: {
    instagram: profile.platforms?.instagram?.followers || profile.followers || '',
    youtube: profile.platforms?.youtube?.followers || '',
    facebook: profile.platforms?.facebook?.followers || ''
  },
  profileImage: profile.profileImage || profile.profilePicture || '',
  mainCategories: profile.mainCategories?.length ? profile.mainCategories : ['creator-influencer'],
  microCategories: profile.microCategories?.length
    ? profile.microCategories
    : Array.isArray(profile.niche)
      ? profile.niche
      : profile.niche
        ? [profile.niche]
        : [],
  portfolio: Array.isArray(profile.portfolio) && profile.portfolio.length
    ? profile.portfolio
    : [
        { title: '', url: '' },
        { title: '', url: '' },
        { title: '', url: '' }
      ]
});

const creatorName = (profile) => profile.fullName || profile.name || '';
const creatorHandle = (profile) =>
  profile.username || String(creatorName(profile) || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || 'creator';
const creatorInitial = (profile) => (creatorName(profile) ? creatorName(profile).slice(0, 1).toUpperCase() : 'VM');

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
      active ? 'bg-[#FFFFFF] text-[#DF7AFE] shadow-[0_14px_34px_rgba(20,16,32,0.36)]' : 'text-white/78 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon className="h-4 w-4" strokeWidth={2.1} />
    <span className="flex-1">{label}</span>
    {badge ? <span className="rounded-full bg-white/18 px-2 py-0.5 text-[0.68rem] text-white">{badge}</span> : null}
  </button>
);

const Field = ({ label, children, required = false }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold text-[#A98BC8]">
      {label}
      {required ? <span className="text-[#DF7AFE]"> *</span> : null}
    </span>
    {children}
  </label>
);

const ProfilePage = ({ previewMode = false }) => {
  const { user, updateUser, logout } = useAuth();
  const { navigate } = useRouter();
  const { directory, loading: categoriesLoading } = useCategoryDirectory();
  const [formData, setFormData] = useState(() => normalizeProfile(previewMode ? previewProfile : user || {}));
  const [mainCategories, setMainCategories] = useState(formData.mainCategories);
  const [microCategories, setMicroCategories] = useState(formData.microCategories);
  const [isMicroDropdownOpen, setIsMicroDropdownOpen] = useState(false);
  const microDropdownRef = useRef(null);
  const hasLoadedProfileRef = useRef(false);
  const [loading, setLoading] = useState(!previewMode);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (previewMode || hasLoadedProfileRef.current) return;
    hasLoadedProfileRef.current = true;

    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('auth');
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/influencer/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const payload = await response.json();
        if (response.ok && payload?.data) {
          const normalized = normalizeProfile(payload.data);
          setFormData(normalized);
          setMainCategories(normalized.mainCategories);
          setMicroCategories(normalized.microCategories);
          updateUser(payload.data);
        }
      } catch {
        let cachedUser = user || {};
        try {
          cachedUser = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('loggedInUser') || '{}');
        } catch {
          cachedUser = user || {};
        }
        const cached = normalizeProfile(cachedUser);
        setFormData(cached);
        setMainCategories(cached.mainCategories);
        setMicroCategories(cached.microCategories);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate, previewMode]);

  const activeCategoryGroups = useMemo(
    () => getGroupedMicroCategories(directory, mainCategories),
    [directory, mainCategories]
  );

  const selectedMicroNames = useMemo(
    () => getMicroCategoryNames(directory, microCategories),
    [directory, microCategories]
  );

  useClickOutside(microDropdownRef, () => setIsMicroDropdownOpen(false), isMicroDropdownOpen);

  const completion = useMemo(
    () => calculateProfileCompletion({ ...formData, mainCategories, microCategories }),
    [formData, mainCategories, microCategories]
  );

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage('');
  };

  const setNestedField = (group, field, value) => {
    setFormData((prev) => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
    setMessage('');
  };

  const updatePortfolio = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item))
    }));
  };

  const addPortfolioRow = () => {
    setFormData((prev) => ({ ...prev, portfolio: [...prev.portfolio, { title: '', url: '' }] }));
  };

  const addCustomPricing = () => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        custom: [...(prev.pricing.custom || []), { label: '', amount: '' }]
      }
    }));
  };

  const updateCustomPricing = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        custom: (prev.pricing.custom || []).map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const toggleMainCategory = (slug) => {
    setIsMicroDropdownOpen(false);
    setMainCategories((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      const selectedSet = new Set(next);
      setMicroCategories((currentMicro) =>
        currentMicro.filter((microSlug) =>
          directory.some((category) => selectedSet.has(category.slug) && category.microCategories?.some((micro) => micro.slug === microSlug))
        )
      );
      return next;
    });
  };

  const toggleMicroCategory = (slug) => {
    setMicroCategories((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const handleSave = async () => {
    if (!formData.socialLinks.instagram.trim()) {
      setMessage('Instagram profile link is required.');
      return;
    }

    setSaving(true);
    setMessage('');

    const categoryPayload = getCategorySelectionPayload(directory, mainCategories, microCategories);
    const selectedMainName = directory.find((category) => category.slug === mainCategories[0])?.name || formData.category;
    const payload = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      location: formData.location,
      experience: formData.experience,
      gender: formData.gender,
      budgetMin: formData.budgetMin,
      budgetMax: formData.budgetMax,
      budget: formData.budgetMax || formData.budgetMin,
      pricing: formData.pricing,
      socialLinks: formData.socialLinks,
      platforms: {
        instagram: {
          hasAccount: Boolean(formData.socialLinks.instagram),
          url: formData.socialLinks.instagram,
          followers: formData.followers.instagram
        },
        youtube: {
          hasAccount: Boolean(formData.socialLinks.youtube),
          url: formData.socialLinks.youtube,
          followers: formData.followers.youtube
        },
        facebook: {
          hasAccount: Boolean(formData.socialLinks.facebook),
          url: formData.socialLinks.facebook,
          followers: formData.followers.facebook
        }
      },
      category: selectedMainName,
      niche: selectedMicroNames,
      portfolio: formData.portfolio.filter((item) => item.title || item.url),
      ...categoryPayload
    };

    if (previewMode) {
      setMessage('Preview saved.');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/influencer/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message || 'Unable to save profile.');
        return;
      }
      updateUser(result.data || payload);
      localStorage.setItem('userData', JSON.stringify(result.data || payload));
      setMessage('Profile saved.');
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="grid min-h-screen lg:grid-cols-[210px_1fr]">
        <aside className="hidden bg-[linear-gradient(180deg,#000000_0%,#171321_55%,#3E2A55_100%)] px-4 py-6 text-white lg:flex lg:flex-col">
          <button type="button" onClick={() => navigate('home')} className="mb-7 px-2 text-left text-2xl font-semibold">
            ViralMantrix
          </button>
          <nav className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('influencer-dashboard')} />
            <SidebarItem icon={UserRound} label="Profile" active onClick={() => navigate('profile')} />
            <SidebarItem icon={Inbox} label="Inbox" />
            <SidebarItem icon={Send} label="My Campaigns" />
            <SidebarItem icon={Wallet} label="Earnings" />
            <SidebarItem icon={CreditCard} label="Payments" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>
          <div className="mt-auto rounded-2xl bg-white/10 p-4">
            <div className="text-xs text-white/70">Profile</div>
            <div className="mt-2 h-2 rounded-full bg-white/18">
              <div className="h-full rounded-full bg-white" style={{ width: `${completion}%` }} />
            </div>
            <div className="mt-2 text-xs font-semibold">{completion}% completed</div>
          </div>
          <button type="button" onClick={handleLogout} className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Logout
          </button>
        </aside>

        <section className="min-w-0 px-5 py-5 lg:px-8">
          <header className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em]">Edit Your Profile</h1>
              <p className="mt-1 text-xs font-medium text-[#A98BC8]">Update your information.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D0D0D] text-[#DF7AFE] shadow-sm">
                <Bell className="h-5 w-5" strokeWidth={2} />
              </button>
              <button type="button" className="flex items-center gap-3 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-3 py-2 shadow-sm">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-[#171321]">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt={creatorName(formData)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#DF7AFE]">
                      {creatorInitial(formData)}
                    </div>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="max-w-[120px] truncate text-sm font-semibold">{creatorHandle(formData)}</div>
                  <div className="text-xs text-[#A98BC8]">{formData.category || 'Influencer'}</div>
                </div>
              </button>
            </div>
          </header>

          {message && <div className="mb-4 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-4 py-3 text-sm font-semibold text-[#A98BC8]">{message}</div>}
          {loading && (
            <div className="mb-4 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-4 py-3 text-sm font-semibold text-[#A98BC8]">
              Syncing profile...
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[0.56fr_1fr]">
            <section className={`${cardClass} p-5`}>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                <UserRound className="h-4 w-4" strokeWidth={2} />
                Profile Overview
              </div>
              <div className="flex items-center gap-5">
                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-[#171321] ring-4 ring-[#3E2A55]">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt={creatorName(formData)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-[#DF7AFE]">
                      {creatorInitial(formData)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <input value={formData.fullName} onChange={(event) => setField('fullName', event.target.value)} className={`${inputClassName} mb-3 font-semibold`} placeholder="Full name" />
                  <div className="text-xs text-[#A98BC8]">{selectedMicroNames.join(', ') || formData.category || 'Influencer'}</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#A98BC8]">
                    <MapPin className="h-3.5 w-3.5" strokeWidth={2} />
                    {[formData.location.city, formData.location.country].filter(Boolean).join(', ') || 'Location'}
                  </div>
                  <div className="mt-2 text-xs text-[#A98BC8]">{formData.email || 'Email'}</div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Field label="Location">
                  <LocationSelectInput
                    value={[formData.location.city, formData.location.country].filter(Boolean).join(', ')}
                    onChange={(location) => {
                      const next = splitGoogleLocation(location);
                      setField('location', next);
                    }}
                    onPlaceSelect={(place) => {
                      const next = splitGoogleLocation(place.label);
                      setField('location', next);
                    }}
                    className={inputClassName}
                    placeholder="Search city or location"
                  />
                </Field>
                <Field label="Country">
                  <input value={formData.location.country} onChange={(event) => setNestedField('location', 'country', event.target.value)} className={inputClassName} placeholder="Country" />
                </Field>
              </div>
            </section>

            <section className={`${cardClass} p-5`}>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                <ShieldCheck className="h-4 w-4" strokeWidth={2} />
                Professional Bio
              </div>
              <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                <Field label="Description" required>
                  <textarea value={formData.bio} onChange={(event) => setField('bio', event.target.value)} className={`${inputClassName} min-h-[112px] resize-none`} placeholder="Add a short description about your work." />
                </Field>
                <div className="grid gap-3">
                  <Field label="Gender">
                    <select value={formData.gender} onChange={(event) => setField('gender', event.target.value)} className={inputClassName}>
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Experience">
                    <input value={formData.experience} onChange={(event) => setField('experience', event.target.value)} className={inputClassName} placeholder="Experience" />
                  </Field>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs font-semibold text-[#A98BC8]">Main Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {directory.map((category) => {
                      const active = mainCategories.includes(category.slug);
                      return (
                        <button
                          key={category.slug}
                          type="button"
                          onClick={() => toggleMainCategory(category.slug)}
                          className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                            active ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white' : 'border-[#3E2A55] bg-[#000000] text-[#A98BC8]'
                          }`}
                        >
                          {category.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs font-semibold text-[#A98BC8]">Micro Categories</div>
                  <div className="relative" ref={microDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsMicroDropdownOpen((open) => !open)}
                      className={`${inputClassName} flex min-h-12 items-center justify-between gap-3 text-left`}
                    >
                      <span className="line-clamp-2">
                        {selectedMicroNames.length ? selectedMicroNames.join(', ') : 'Select one or more micro categories'}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#A98BC8] transition ${isMicroDropdownOpen ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                      />
                    </button>

                    {isMicroDropdownOpen ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] p-3 shadow-[0_24px_55px_rgba(6,6,6,0.45)]">
                        {categoriesLoading ? (
                          <div className="p-2 text-xs text-[#A98BC8]">Loading</div>
                        ) : (
                          <>
                            <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
                              {activeCategoryGroups.map((category) => (
                                <div key={category.slug}>
                                  <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A98BC8]">
                                    {category.name}
                                  </div>
                                  <div className="space-y-1">
                                    {(category.microCategories || []).map((micro) => {
                                      const active = microCategories.includes(micro.slug);
                                      return (
                                        <button
                                          key={micro.slug}
                                          type="button"
                                          onClick={() => toggleMicroCategory(micro.slug)}
                                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                                            active
                                              ? 'bg-[#DF7AFE] text-white'
                                              : 'bg-[#000000] text-[#FFFFFF] hover:bg-[#171321]'
                                          }`}
                                        >
                                          <span>{micro.name}</span>
                                          {active ? <Check className="h-4 w-4" strokeWidth={2.5} /> : null}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 flex items-center justify-between border-t border-[#171321] pt-3">
                              <span className="text-xs font-semibold text-[#A98BC8]">{microCategories.length} selected</span>
                              <button
                                type="button"
                                onClick={() => setMicroCategories([])}
                                className="text-xs font-semibold text-[#DF7AFE]"
                              >
                                Clear selection
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <section className={`${cardClass} p-5`}>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                <Link2 className="h-4 w-4" strokeWidth={2} />
                Social Media Handles
              </div>
              <div className="grid gap-3">
                <Field label="Instagram" required>
                  <input value={formData.socialLinks.instagram} onChange={(event) => setNestedField('socialLinks', 'instagram', event.target.value)} className={inputClassName} placeholder="Instagram URL" required />
                </Field>
                <Field label="YouTube">
                  <input value={formData.socialLinks.youtube} onChange={(event) => setNestedField('socialLinks', 'youtube', event.target.value)} className={inputClassName} placeholder="YouTube URL" />
                </Field>
                <Field label="Facebook">
                  <input value={formData.socialLinks.facebook} onChange={(event) => setNestedField('socialLinks', 'facebook', event.target.value)} className={inputClassName} placeholder="Facebook URL" />
                </Field>
              </div>
            </section>

            <section className={`${cardClass} p-5`}>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                <Instagram className="h-4 w-4" strokeWidth={2} />
                Followers / Subscribers
              </div>
              <div className="grid gap-3">
                <Field label="Instagram">
                  <input value={formData.followers.instagram} onChange={(event) => setNestedField('followers', 'instagram', event.target.value)} className={inputClassName} placeholder="Followers" />
                </Field>
                <Field label="YouTube">
                  <input value={formData.followers.youtube} onChange={(event) => setNestedField('followers', 'youtube', event.target.value)} className={inputClassName} placeholder="Subscribers" />
                </Field>
                <Field label="Facebook">
                  <input value={formData.followers.facebook} onChange={(event) => setNestedField('followers', 'facebook', event.target.value)} className={inputClassName} placeholder="Followers" />
                </Field>
              </div>
            </section>
          </div>

          <section className={`${cardClass} mt-4 p-5`}>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
              <Wallet className="h-4 w-4" strokeWidth={2} />
              Budget
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {[
                ['reel', 'Reel'],
                ['story', 'Story'],
                ['collab', 'Reel with Collab'],
                ['staticPost', 'Static Post']
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input value={formData.pricing[key]} onChange={(event) => setNestedField('pricing', key, event.target.value)} className={inputClassName} placeholder="0" />
                </Field>
              ))}
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#A98BC8]">Other</span>
                  <button
                    type="button"
                    onClick={addCustomPricing}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-[#3E2A55] bg-[#000000] text-[#DF7AFE] transition hover:bg-[#171321]"
                    aria-label="Add other pricing option"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </button>
                </div>
                <input value={formData.pricing.other} onChange={(event) => setNestedField('pricing', 'other', event.target.value)} className={inputClassName} placeholder="0" />
              </div>
            </div>
            {(formData.pricing.custom || []).length > 0 ? (
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {formData.pricing.custom.map((item, index) => (
                  <div key={`custom-pricing-${index}`} className="grid gap-2 rounded-xl border border-[#171321] bg-[#0D0D0D] p-3 sm:grid-cols-[1fr_140px]">
                    <input
                      value={item.label || ''}
                      onChange={(event) => updateCustomPricing(index, 'label', event.target.value)}
                      className={inputClassName}
                      placeholder="Option name"
                    />
                    <input
                      value={item.amount || ''}
                      onChange={(event) => updateCustomPricing(index, 'amount', event.target.value)}
                      className={inputClassName}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className={`${cardClass} mt-4 p-5`}>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
              <BriefcaseBusiness className="h-4 w-4" strokeWidth={2} />
              Portfolio
            </div>
            <div className="space-y-3">
              {formData.portfolio.map((item, index) => (
                <div key={`${index}-${item.title}`} className="grid gap-3 lg:grid-cols-[0.7fr_1fr]">
                  <input value={item.title || ''} onChange={(event) => updatePortfolio(index, 'title', event.target.value)} className={inputClassName} placeholder="Project title" />
                  <input value={item.url || ''} onChange={(event) => updatePortfolio(index, 'url', event.target.value)} className={inputClassName} placeholder="Project URL" />
                </div>
              ))}
            </div>
            <button type="button" onClick={addPortfolioRow} className="mt-4 rounded-xl border border-[#3E2A55] bg-[#000000] px-4 py-2 text-xs font-semibold text-[#DF7AFE]">
              Add Another Link
            </button>
          </section>

          <div className="mt-5 flex justify-center gap-3">
            <button type="button" onClick={() => navigate('influencer-dashboard')} className="h-12 min-w-[180px] rounded-xl border border-[#3E2A55] bg-[#000000] px-6 text-sm font-semibold text-[#A98BC8]">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-xl bg-[#8B4DD8] px-6 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(223,122,254,0.24)] disabled:opacity-60">
              <Save className="h-4 w-4" strokeWidth={2.2} />
              {saving ? 'Saving' : 'Save & Submit Profile'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
