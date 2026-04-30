import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ProfileOverviewTab from '../components/profile/ProfileOverviewTab';
import { 
  CheckCircle2, 
  MapPin,
  Instagram,
  Youtube,
  Facebook,
  Edit3
} from 'lucide-react';

const ProfilePage = ({ config }) => {
  const { navigate } = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const lastUpdatedRef = useRef(null);

  const categoryIdToName = {
    lifestyle: 'Lifestyle',
    travel: 'Travel',
    fitness_health: 'Fitness & Health',
    food: 'Food (Cooking + Street Food)',
    technology: 'Technology (Unboxing / App Review / Gadgets)',
    finance_investment: 'Finance & Investment (Stock Market)',
    gaming: 'Gaming',
    education: 'Education (Study / Career / Kids Learning)',
    motivation_growth: 'Motivation & Self Growth (Personal Branding)',
    spiritual_astrology: 'Spiritual & Astrology',
    fashion: 'Fashion',
    comedy_entertainment: 'Comedy & Entertainment (Roasting)',
    historical: 'Historical',
    art_craft: 'Art & Craft',
    ai: 'AI',
    vlogs: 'Vlogs',
    street_interviews: 'Street Interviews',
    ugc_creator: 'UGC Creator',
    influencer: 'Influencer',
    actor: 'Actor',
    model: 'Model',
    filmmaker: 'Filmmaker',
    celebrity: 'Celebrity',
    food_pages: 'Food Pages',
    local_city_pages: 'Local City Pages',
    state_pages: 'State Pages',
    meme_pages: 'Meme Pages',
    music_pages: 'Music Pages',
    celebrity_pages: 'Celebrity Pages',
    motivation_pages: 'Motivation Pages',
    devotional_pages: 'Devotional Pages',
    media_pages: 'Media Pages',
    political_pages: 'Political Pages',
    other: 'Other'
  };

  // Token validation utility
  const validateToken = () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      return false;
    }
    
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        console.log('Token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', phone: '',
    profilePicture: '', profileImage: '', bio: '',
    location: { city: '', country: '' },
    niche: [], category: '',
    platforms: {
      instagram: { hasAccount: false, url: '', followers: '', engagementRate: '' },
      youtube: { hasAccount: false, url: '', followers: '', engagementRate: '' },
      facebook: { hasAccount: false, url: '', followers: '', engagementRate: '' }
    },
    experience: '',
    portfolio: [],
    role: 'user',
    verificationStatus: 'pending', budget: 0, budgetMin: '', budgetMax: '',
    socialLinks: { instagram: '', youtube: '', facebook: '', website: '' },
    pricing: {
      collaborationCharges: '',
      pricingModel: 'fixed'
    }
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const accent = 'rgb(238, 119, 17)';

  // Helper to normalize raw API/user data into formData shape
  const normalizeProfile = (src) => ({
    fullName: src.fullName || `${src.firstName || ''} ${src.lastName || ''}`.trim() || '',
    firstName: src.firstName || '',
    lastName: src.lastName || '',
    email: src.email || '',
    phone: src.phone || '',
    password: '',
    profilePicture: src.profilePicture || '',
    profileImage: src.profileImage || '',
    bio: src.bio || '',
    location: typeof src.location === 'string'
      ? { city: src.location, country: '' }
      : { city: src?.location?.city || '', country: src?.location?.country || '' },
    niche: Array.isArray(src.niche) ? src.niche : (src.niche ? [src.niche] : (src.categories ? src.categories : [])),
    category: src.category || '',
    experience: src.experience || '',
    subcategories: src.subcategories || [],
    portfolio: src.portfolio || [],
    pricing: {
      collaborationCharges: src?.pricing?.collaborationCharges || '',
      pricingModel: src?.pricing?.pricingModel || 'fixed'
    },
    budget: src.budget || 0,
    budgetMin: src.budgetMin || '',
    budgetMax: src.budgetMax || '',
    socialLinks: {
      instagram: src?.socialLinks?.instagram || '',
      youtube: src?.socialLinks?.youtube || '',
      facebook: src?.socialLinks?.facebook || '',
      website: src?.socialLinks?.website || ''
    },
    platforms: {
      instagram: { hasAccount: src?.platforms?.instagram?.hasAccount || false, url: src?.platforms?.instagram?.url || src?.socialLinks?.instagram || '', followers: src?.platforms?.instagram?.followers || '', engagementRate: src?.platforms?.instagram?.engagementRate || '' },
      youtube: { hasAccount: src?.platforms?.youtube?.hasAccount || false, url: src?.platforms?.youtube?.url || src?.socialLinks?.youtube || '', followers: src?.platforms?.youtube?.followers || '', engagementRate: src?.platforms?.youtube?.engagementRate || '' },
      facebook: { hasAccount: src?.platforms?.facebook?.hasAccount || false, url: src?.platforms?.facebook?.url || src?.socialLinks?.facebook || '', followers: src?.platforms?.facebook?.followers || '', engagementRate: src?.platforms?.facebook?.engagementRate || '' }
    },
    role: src.role || 'user'
  });

  // Seed from localStorage user immediately, then fetch fresh data from API
  useEffect(() => {
    if (!isAuthenticated || isUpdating) return;

    // Check if token is valid before making API calls
    if (!validateToken()) {
      console.log('Invalid token detected, clearing and redirecting to login');
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('loggedInUser');
      navigate('auth');
      return;
    }

    // Step 1: seed from cached user
    if (user) setFormData(prev => ({ ...prev, ...normalizeProfile(user) }));

    // Step 2: fetch fresh from DB (only if not recently updated)
    const fetchProfile = async () => {
      // Skip API call if we just updated the profile (within last 2 seconds)
      const now = Date.now();
      if (lastUpdatedRef.current && (now - lastUpdatedRef.current) < 2000) {
        console.log('Skipping API fetch - profile recently updated');
        return;
      }

      setProfileLoading(true);
      try {
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE_URL}/api/influencer/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const result = await res.json();
          const normalized = normalizeProfile(result.data);
          setFormData(prev => ({ ...prev, ...normalized }));
          updateUser(result.data); // keep AuthContext in sync
        }
      } catch (err) {
        console.warn('Could not fetch profile from server, using cached data.', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, isUpdating]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = JSON.parse(JSON.stringify(prev));
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]] || typeof current[keys[i]] !== 'object') current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };


  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const token = localStorage.getItem('userToken');

      console.log('Profile update - Token check:', { token: !!token, tokenLength: token?.length });

      if (!token || !validateToken()) {
        setSaveMessage('Authentication error: Please login again');
        
        // Clear invalid token and redirect
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        localStorage.removeItem('loggedInUser');
        
        setTimeout(() => {
          navigate('auth');
        }, 2000);
        
        setIsUpdating(false);
        return;
      }

      // Build the payload with all editable fields
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        experience: formData.experience,
        skills: formData.subcategories,
        budget: formData.budget,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        socialLinks: formData.socialLinks,
        platforms: formData.platforms,
        niche: Array.isArray(formData.niche) ? formData.niche : (formData.niche ? [formData.niche] : []),
        category: formData.category,
        pricing: formData.pricing,
        profileImage: formData.profileImage,
        profilePicture: formData.profilePicture,
        portfolio: formData.portfolio,
      };

      // Only include password if user typed a new one
      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }

      console.log('Making profile update request to:', `${API_BASE_URL}/api/influencer/me`);

      const response = await fetch(`${API_BASE_URL}/api/influencer/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Profile update response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Profile update success:', result);
        const updatedUser = result.data || { ...user, ...payload };
        // Ensure niche is always array after save
        if (updatedUser.niche && !Array.isArray(updatedUser.niche)) {
          updatedUser.niche = [updatedUser.niche];
        }
        
        // Update form data directly without triggering API refresh
        setFormData(prev => ({ ...prev, ...normalizeProfile(updatedUser) }));
        
        // Track last update to prevent unnecessary API calls
        lastUpdatedRef.current = Date.now();
        
        // Update user context
        updateUser(updatedUser);
        
        setSaveMessage('Profile updated successfully!');
      } else {
        const errorText = await response.text();
        console.error('Profile update failed:', { status: response.status, errorText });
        
        let errorMessage = 'Update failed. Please try again.';
        try {
          const err = await response.json();
          errorMessage = err.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        if (response.status === 401) {
          errorMessage = 'Authentication error: Please login again';
          
          // Clear invalid token and redirect to login
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('loggedInUser');
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('auth');
          }, 2000);
        }
        
        setSaveMessage(errorMessage);
      }
    } catch {
      setSaveMessage('Network error. Changes saved locally only.');
      updateUser(formData);
    } finally {
      setIsUpdating(false);
    }
    // Removed setIsEditing(false) to allow individual updates without closing the interface
    setTimeout(() => setSaveMessage(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 animate-fadeIn" style={{ backgroundColor: config.background_color }}>
        <div className="max-w-lg mx-auto px-4 text-center bg-white/80 backdrop-blur rounded-2xl shadow-xl p-12 border border-brand-100">
          <div className="w-20 h-20 mx-auto mb-6 bg-brand-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold mb-3 text-gray-800">Sign In Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to view and manage your profile.</p>
          <button onClick={() => navigate('auth')} className="px-8 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg">
            Sign In →
          </button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center" style={{ backgroundColor: config.background_color }}>
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="pt-20 pb-16 min-h-screen bg-[#F8F9FA]" style={{ backgroundColor: config.background_color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {saveMessage && (
            <div className="mb-6">
              <div className="p-4 bg-green-50 border text-green-700 rounded-2xl text-sm font-bold text-center animate-slideDown shadow-sm" style={{ borderColor: accent }}>
                  ✅ {saveMessage}
                </div>
              </div>
          )}
          <ProfileEditForm formData={formData} onChange={handleInputChange} onSave={handleSave} onCancel={() => setIsEditing(false)} />
        </div>
      </div>
    );
  }

  const locCity = formData.location?.city || '';
  const locCountry = formData.location?.country || '';
  const formattedLocation = typeof formData.location === 'string' 
    ? formData.location 
    : [locCity, locCountry].filter(Boolean).join(', ') || 'Global';

  const normalizeNiches = (niche) => {
    if (!niche) return [];
    return Array.isArray(niche) ? niche : (typeof niche === 'string' ? [niche] : []);
  };

  // Ensure external links include protocol so anchors open correctly
  const makeHref = (url) => {
    if (!url) return '';
    const trimmed = String(url).trim();
    if (trimmed === '') return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const normalizedNiches = normalizeNiches(formData.niche);
  const displayNiches = normalizedNiches.length > 0
    ? normalizedNiches
    : (formData.category ? [formData.category] : []);
  const readableDisplayNiches = displayNiches.map((n) => categoryIdToName[n] || n);
  const nicheOrCategory = readableDisplayNiches.length > 0 ? readableDisplayNiches.join(', ') : formData.category;
  const displayRole = (formData.role === 'artist' || formData.role === 'influencer') ? 'Influencer' : 'User';

  const userData = {
    name: formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Your Name',
    
    title: displayRole,
    handle2: nicheOrCategory || 'Creator',
    location: formattedLocation || 'Location',
    bio: formData.bio || 'Tell us about yourself...',
    tags: formData.subcategories?.length ? formData.subcategories : [],
    stats: {
      totalReach: (() => {
        const ig = parseInt(formData.platforms?.instagram?.followers) || 0;
        const yt = parseInt(formData.platforms?.youtube?.followers) || 0;
        const fb = parseInt(formData.platforms?.facebook?.followers) || 0;
        const total = ig + yt + fb;
        return total > 0 ? total.toLocaleString() : '0';
      })(),
      instagram: { 
        followers: formData.platforms?.instagram?.followers || '0', 
        engagement: formData.platforms?.instagram?.engagementRate ? `${formData.platforms.instagram.engagementRate}%` : '0%',
        url: formData.platforms?.instagram?.url || formData.socialLinks?.instagram || ''
      },
      youtube: { 
        subs: formData.platforms?.youtube?.followers || '0', 
        url: formData.platforms?.youtube?.url || formData.socialLinks?.youtube || ''
      },
      facebook: { 
        url: formData.platforms?.facebook?.url || formData.socialLinks?.facebook || '',
        followers: formData.platforms?.facebook?.followers || '0'
      }
    },
    // pricing UI removed; keep raw pricing in formData for backend compatibility
    professional: {
      experience: formData.experience ? `${formData.experience} Years` : '0 Years',
      primaryNiche: readableDisplayNiches.length > 0 ? (readableDisplayNiches.length === 1 ? readableDisplayNiches[0] : readableDisplayNiches.join(', ')) : (formData.category || 'General'),
      location: formattedLocation || 'Global'
    },
    // Budget fields
    budget: formData.budget || 0,
    budgetMin: formData.budgetMin || '',
    budgetMax: formData.budgetMax || '',
    portfolio: (formData.portfolio?.length ? formData.portfolio : []).map((item, id) => ({
      id: id + 1,
      title: typeof item === 'string' ? item : item?.title || `Portfolio Work ${id + 1}`,
      category: typeof item === 'string' ? 'Work' : item?.category || 'Portfolio',
      img: typeof item === 'string' && item.startsWith('http') ? item : 
           typeof item === 'object' && item?.url ? item.url : 
           "https://via.placeholder.com/400x300/f0f0f0/666666?text=No+Image"
    }))
  };

  // Budget formatting helpers: treat null/undefined/empty-string as absent
  const hasBudgetMin = userData.budgetMin !== '' && userData.budgetMin !== null && userData.budgetMin !== undefined && `${userData.budgetMin}`.trim() !== '';
  const hasBudgetMax = userData.budgetMax !== '' && userData.budgetMax !== null && userData.budgetMax !== undefined && `${userData.budgetMax}`.trim() !== '';
  const hasBudgetDefault = userData.budget !== '' && userData.budget !== null && userData.budget !== undefined && userData.budget !== 0;
  const formattedBudgetMin = hasBudgetMin ? `₹${Number(userData.budgetMin).toLocaleString('en-IN')}` : null;
  const formattedBudgetMax = hasBudgetMax ? `₹${Number(userData.budgetMax).toLocaleString('en-IN')}` : null;
  const formattedBudgetDefault = hasBudgetDefault ? `₹${Number(userData.budget).toLocaleString('en-IN')}` : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans text-slate-900 pb-16 pt-20" style={{ backgroundColor: config.background_color }}>
      {saveMessage && (
        <div className="max-w-6xl mx-auto px-4 mb-6">
          <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg text-sm font-semibold animate-fadeIn">
            ✅ {saveMessage}
          </div>
        </div>
      )}

      {/* Hero Section with Profile Header */}
      <div className="w-full mb-12">
        {/* Banner */}
        <div className="h-40 md:h-56 overflow-hidden relative bg-gradient-to-br to-white font-sans to-white font-sans to-white font-sans -mt-20 pt-200">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1572508589584-94d778209da9?auto=format&fit=crop&q=80&w=1200" 
            alt="Profile Cover"
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/1 via-black/0 to-transparent"></div>
        </div>

        {/* Profile Info Section */}
        <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 mb-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-end">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white relative group">
                <img 
                  src={formData.profileImage || formData.profilePicture || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=400"} 
                  alt={userData.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
              </div>
            </div>

            {/* Header Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">{userData.name}</h1>
                {formData.verificationStatus === 'verified' && (
                  <span className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
                    <CheckCircle2 className="text-blue-500 fill-blue-500" size={16} />
                    <span className="text-xs font-bold text-blue-600">VERIFIED</span>
                  </span>
                )}
              </div>
              
              <p className="text-lg font-semibold text-slate-700 mb-4">{userData.title} • {userData.handle2}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <MapPin size={18} className="text-slate-500" />
                  {userData.location}
                </div>
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {formData.email || 'email@example.com'}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {userData.tags.length > 0 ? (
                  userData.tags.map(tag => (
                    <span key={tag} className="inline-block bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 text-sm italic">No specializations added yet</span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <button 
              onClick={() => setIsEditing(true)} 
              className="hidden lg:flex fixed bottom-6 right-6 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 z-50 items-center gap-2" style={{ background: 'rgb(238 119 17)' }}
            >
              <Edit3 size={18} />
              EDIT PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* Biography Section - Professional Profile */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 hover:shadow-md transition-shadow" style={{ borderColor: accent }}>
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl shadow-inner">
            📝
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Professional Bio</h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-md tracking-widest">About Me</span>
            </div>
            <div className="text-slate-700 text-base leading-relaxed max-w-4xl">
              {userData.bio && userData.bio !== 'Tell us about yourself...' ? (
                <p className="whitespace-pre-wrap">{userData.bio}</p>
              ) : (
                <p className="text-slate-500 italic">No professional bio shared yet. Introduce yourself to brands!</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="hidden md:block px-5 py-2 hover:bg-slate-50 text-indigo-600 rounded-xl text-sm font-bold transition-all border hover:border-brand-100"
            style={{ borderColor: accent }}
          >
            Edit Bio
          </button>
        </div>
      </div>

      {/* Main Content Grid - Basic & Professional Information Cards */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Basic Information Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border transition-all hover:shadow-md" style={{ borderColor: accent }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'rgb(238 119 17)' }}></div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Basic Information</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Full Name</label>
              <p className="text-base font-semibold text-slate-900">{userData.name || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Email</label>
              <p className="text-base font-semibold text-slate-900 break-all">{formData.email || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Phone</label>
              <p className="text-base font-semibold text-slate-900">{formData.phone || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Location</label>
              <p className="text-base font-semibold text-slate-900">{formattedLocation || "—"}</p>
            </div>
          </div>
        </div>

        {/* Professional Information Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border transition-all hover:shadow-md" style={{ borderColor: accent }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 rounded-full" style={{ background: 'rgb(238 119 17)' }}></div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Professional Profile</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Primary Niche</label>
              <p className="text-base font-semibold text-slate-900">{userData.professional.primaryNiche || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Experience</label>
              <p className="text-base font-semibold text-slate-900">{userData.professional.experience || "—"}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Total Reach</label>
              <p className="text-base font-semibold text-slate-900">{userData.stats.totalReach} followers</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Budget Range</label>
              <p className="text-base font-semibold text-slate-900">{userData.budgetMin || userData.budgetMax ? `${userData.budgetMin || '₹0'} - ${userData.budgetMax || '₹0'}` : 'Not specified'}</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1">Default Budget</label>
              <p className="text-base font-semibold text-slate-900">{userData.budget ? `₹${Number(userData.budget).toLocaleString()}` : 'Not specified'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Social Media Section */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-6 shadow-sm border mb-8" style={{ borderColor: accent }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
              <div className="w-1 h-6 rounded-full" style={{ background: 'rgb(238 119 17)' }} />
              Social Media
            </h3>
            <div>
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold border border-indigo-100">Edit</button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {(formData.socialLinks?.instagram || userData.stats.instagram.url) ? (
              <a href={makeHref(formData.socialLinks?.instagram || userData.stats.instagram.url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 hover:shadow-sm">
                <Instagram size={18} className="text-[#e1306c]" />
                <span className="text-sm font-medium text-slate-700">Instagram</span>
              </a>
            ) : null}

            {(formData.socialLinks?.youtube || userData.stats.youtube.url) ? (
              <a href={makeHref(formData.socialLinks?.youtube || userData.stats.youtube.url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg border border-red-100 hover:shadow-sm">
                <Youtube size={18} className="text-red-500" />
                <span className="text-sm font-medium text-slate-700">YouTube</span>
              </a>
            ) : null}

            {(formData.socialLinks?.facebook || userData.stats.facebook.url) ? (
              <a href={makeHref(formData.socialLinks?.facebook || userData.stats.facebook.url)} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 hover:shadow-sm">
                <Facebook size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Facebook</span>
              </a>
            ) : null}

            {!(formData.socialLinks?.instagram || userData.stats.instagram.url || formData.socialLinks?.youtube || userData.stats.youtube.url || formData.socialLinks?.facebook || userData.stats.facebook.url) && (
              <p className="text-sm text-slate-600">No social links added yet. Click Edit to add profiles.</p>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Section — Link Stickers */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border mb-8" style={{ borderColor: accent }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full" style={{ background: 'rgb(238 119 17)' }}></div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Portfolio</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold border border-indigo-100"
            >
              Edit
            </button>
          </div>

          {formData.portfolio && formData.portfolio.filter(item => typeof item === 'string' && item.trim()).length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {formData.portfolio.map((item, idx) => {
                if (typeof item !== 'string' || !item.trim()) return null;
                const href = item.startsWith('http') ? item : `https://${item}`;
                let hostname = '';
                let label = '';
                try {
                  const u = new URL(href);
                  hostname = u.hostname.replace('www.', '');
                  // Friendly label based on hostname
                  if (hostname.includes('youtube')) label = '▶ YouTube';
                  else if (hostname.includes('instagram')) label = '📷 Instagram';
                  else if (hostname.includes('facebook')) label = '👤 Facebook';
                  else if (hostname.includes('twitter') || hostname.includes('x.com')) label = '𝕏 Twitter';
                  else if (hostname.includes('linkedin')) label = '💼 LinkedIn';
                  else if (hostname.includes('tiktok')) label = '🎵 TikTok';
                  else label = hostname;
                } catch { label = item.slice(0, 30); }
                return (
                  <a
                    key={idx}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2.5 bg-white border border-gray-200 hover:border-orange-400 rounded-2xl px-5 py-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    title={item}
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">{label}</span>
                    <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <p className="text-slate-600 font-medium mb-6">No portfolio links added yet.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-8 py-3 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95" style={{ background: 'rgb(238 119 17)' }}
              >
                Add Portfolio Link
              </button>
            </div>
          )}
        </div>

        <ProfileOverviewTab formData={formData} />
      </div>
    </div>
  );
};

export default ProfilePage;
