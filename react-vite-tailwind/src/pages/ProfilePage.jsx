import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import { 
  CheckCircle2, 
  MapPin,
  ExternalLink, 
  ChevronRight,
  Briefcase,
  Users,
  Layout,
  Instagram,
  Youtube,
  Facebook,
  MessageSquare,
  Edit3
} from 'lucide-react';

const ProfilePage = ({ config }) => {
  const { navigate } = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', phone: '',
    profilePicture: '', profileImage: '', bio: '',
    location: { city: '', country: '' },
    niche: '', category: '',
    platforms: {
      instagram: { hasAccount: false, url: '', followers: '', engagementRate: '' },
      youtube: { hasAccount: false, url: '', followers: '', engagementRate: '' },
      facebook: { hasAccount: false, url: '', followers: '', engagementRate: '' }
    },
    experience: '', previousCollaborations: '',
    portfolio: [], skills: [],
    role: 'user',
    verificationStatus: 'pending', budget: 0,
    socialLinks: { instagram: '', youtube: '', facebook: '', website: '' }
  });

  const [profileLoading, setProfileLoading] = useState(false);

  // Helper to normalize raw API/user data into formData shape
  const normalizeProfile = (src) => ({
    fullName: src.fullName || src.name || `${src.firstName || ''} ${src.lastName || ''}`.trim() || '',
    username: src.username || '',
    email: src.email || '',
    phone: src.phone || '',
    password: '',
    profilePicture: src.profilePicture || '',
    profileImage: src.profileImage || '',
    bio: src.bio || '',
    location: typeof src.location === 'string'
      ? { city: src.location, country: '' }
      : { city: src?.location?.city || '', country: src?.location?.country || '' },
    niche: src.niche || src.category || '',
    category: src.category || '',
    experience: src.experience || '',
    previousCollaborations: src.previousCollaborations || '',
    subcategories: src.subcategories || [],
    portfolio: src.portfolio || [],
    pricing: {
      collaborationCharges: src?.pricing?.collaborationCharges || '',
      pricingModel: src?.pricing?.pricingModel || 'fixed'
    },
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
    }
  });

  // Seed from localStorage user immediately, then fetch fresh data from API
  useEffect(() => {
    if (!isAuthenticated) return;

    // Step 1: seed from cached user
    if (user) setFormData(prev => ({ ...prev, ...normalizeProfile(user) }));

    // Step 2: fetch fresh from DB
    const fetchProfile = async () => {
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
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

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
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const token = localStorage.getItem('userToken');

      // Build the payload with all editable fields
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        experience: formData.experience,
        skills: formData.subcategories,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        budget: formData.budget,
        socialLinks: formData.socialLinks,
        platforms: formData.platforms,
        niche: formData.niche,
        category: formData.category,
        previousCollaborations: formData.previousCollaborations,
        pricing: formData.pricing,
        profileImage: formData.profileImage,
        profilePicture: formData.profilePicture,
      };

      // Only include password if user typed a new one
      if (formData.password && formData.password.length >= 6) {
        payload.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/influencer/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data || formData;
        updateUser(updatedUser);
        setSaveMessage('Profile updated successfully!');
      } else {
        const err = await response.json().catch(() => ({}));
        setSaveMessage(err.message || 'Update failed. Please try again.');
      }
    } catch {
      setSaveMessage('Network error. Changes saved locally only.');
      updateUser(formData);
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
          <p className="text-gray-500 mb-6">Please sign in to view and manage your profile.</p>
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
          <p className="text-gray-500 font-medium">Loading your profile...</p>
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
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-bold text-center animate-slideDown shadow-sm">
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

  const nicheOrCategory = formData.niche || formData.category;
  const displayRole = (formData.role === 'artist' || formData.role === 'influencer') ? 'Influencer' : 'User';

  const userData = {
    name: formData.fullName || `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Your Name',
    username: formData.username ? `@${formData.username}` : '@username',
    title: displayRole,
    handle2: nicheOrCategory,
    location: formattedLocation,
    bio: formData.bio || 'Passionate professional ready for the next big project.',
    tags: formData.subcategories?.length ? formData.subcategories : ["Creator", "Tech", "Lifestyle"],
    stats: {
      totalReach: (() => {
        const ig = parseInt(formData.platforms?.instagram?.followers) || 0;
        const yt = parseInt(formData.platforms?.youtube?.followers) || 0;
        const fb = parseInt(formData.platforms?.facebook?.followers) || 0;
        return (ig + yt + fb || 0).toLocaleString();
      })(),
      instagram: { 
        followers: formData.platforms?.instagram?.followers || '0', 
        engagement: formData.platforms?.instagram?.engagementRate ? `${formData.platforms.instagram.engagementRate}%` : 'N/A',
        url: formData.platforms?.instagram?.url || formData.socialLinks?.instagram || ''
      },
      youtube: { 
        subs: formData.platforms?.youtube?.followers || '0', 
        avgViews: 'N/A',
        url: formData.platforms?.youtube?.url || formData.socialLinks?.youtube || ''
      },
      facebook: { 
        url: formData.platforms?.facebook?.url || formData.socialLinks?.facebook || '',
        followers: formData.platforms?.facebook?.followers || '0'
      }
    },
    pricing: {
      starting: formData.pricing?.collaborationCharges ? `₹${Number(formData.pricing.collaborationCharges).toLocaleString()}` : formData.budget ? `₹${Number(formData.budget).toLocaleString()}` : 'Contact for Pricing',
      responseTime: "< 24 hrs"
    },
    professional: {
      experience: formData.experience ? `${formData.experience} Years` : 'N/A',
      primaryNiche: nicheOrCategory,
      location: formattedLocation
    },
    portfolio: (formData.portfolio?.length ? formData.portfolio : [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?auto=format&fit=crop&q=80&w=400"
    ]).map((item, id) => ({
      id: id + 1,
      title: `Portfolio Work ${id + 1}`,
      category: "(Sample)",
      img: typeof item === 'string' && item.startsWith('http') ? item : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
    }))
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 pb-12 pt-20" style={{ backgroundColor: config.background_color }}>
      {saveMessage && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold text-center animate-fadeIn shadow-md">
            ✅ {saveMessage}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          {/* Banner */}
          <div className="h-48 md:h-64 overflow-hidden relative bg-gradient-to-r from-brand-500 to-indigo-600">
            <img 
              src="https://images.unsplash.com/photo-1572508589584-94d778209da9?auto=format&fit=crop&q=80&w=1200" 
              alt="Profile Cover"
              className="w-full h-full object-cover mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Profile Basic Info */}
          <div className="p-6 md:p-8 pt-0 flex flex-col md:flex-row gap-6 relative">
            {/* Avatar */}
            <div className="relative -mt-16 md:-mt-20 shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                <img 
                  src={formData.profileImage || formData.profilePicture || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=400"} 
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 mt-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{userData.name}</h1>
                {formData.verificationStatus === 'verified' && (
                  <CheckCircle2 className="text-blue-500 fill-blue-500" size={22} strokeWidth={2.5} />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-sm md:text-base font-medium">
                <span>{userData.username}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {userData.location}</span>
                <span>{userData.title} @{userData.handle2}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                {userData.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-slate-200 cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Editing Card - Desktop Right */}
            <div className="hidden lg:block w-72 bg-white border border-slate-100 shadow-sm rounded-2xl p-5 self-start">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Profile Actions</h3>
              <div className="space-y-3">
                <button onClick={() => setIsEditing(true)} className="w-full flex items-center justify-center gap-2 bg-[#3078F1] text-white font-bold py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]">
                  <Edit3 size={18} /> EDIT PROFILE
                </button>
                <button className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all">
                  VIEW MEDIA KIT
                </button>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="px-6 md:px-8 pb-8">
            <h4 className="font-bold text-slate-900 mb-2">Bio</h4>
            <p className="text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
              {userData.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Stats and Professional Info */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center transition-all hover:border-brand-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Reach</p>
              <h3 className="text-2xl font-black text-slate-900">{userData.stats.totalReach}</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Combined</p>
            </div>

            {/* Instagram Card */}
            {(parseInt(userData.stats.instagram.followers.toString().replace(/,/g, '')) > 0 || userData.stats.instagram.url) && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#F7E7ED]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-[#fceef5] flex items-center justify-center text-[#e1306c]">
                    <Instagram size={12} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instagram</p>
                </div>
                <h3 className="text-xl font-black text-slate-900">{userData.stats.instagram.followers}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Followers</p>
              </div>
            )}

            {/* YouTube Card */}
            {(parseInt(userData.stats.youtube.subs.toString().replace(/,/g, '')) > 0 || userData.stats.youtube.url) && (
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#FEECEC]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-md bg-[#feecec] flex items-center justify-center text-[#ff0000]">
                    <Youtube size={12} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">YouTube</p>
                </div>
                <h3 className="text-xl font-black text-slate-900">{userData.stats.youtube.subs}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Subscribers</p>
              </div>
            )}

            {/* Facebook Card */}
            {(parseInt(userData.stats.facebook.url ? '1' : '0') > 0 || userData.stats.facebook.url) && (
               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-[#EEF4FE]">
                 <div className="flex items-center gap-2 mb-1">
                   <div className="w-5 h-5 rounded-md bg-[#eef4fe] flex items-center justify-center text-[#1877f2]">
                     <Facebook size={12} />
                   </div>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Facebook</p>
                 </div>
                 <h3 className="text-xl font-black text-slate-900">{userData.stats.facebook.url ? 'Active' : '0'}</h3>
                 <p className="text-xs text-slate-400 font-medium mt-1">Connected</p>
               </div>
             )}
          </div>

          {/* Portfolio & Collaborations */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                Portfolio & Collaborations
              </h3>
              <button className="text-sm font-bold text-[#3078F1] hover:underline flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-6">
              {userData.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userData.portfolio.map(item => (
                    <div key={item.id} className="group cursor-pointer">
                      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 relative">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                            View Details <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#3078F1] transition-colors line-clamp-1">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{item.category}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No portfolio items added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Details & Socials */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Mobile Only: Pricing & Availability */}
          <div className="lg:hidden bg-white border border-slate-100 shadow-sm rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Profile Actions</h3>
            <div className="flex gap-3">
              <button onClick={() => setIsEditing(true)} className="flex-1 flex items-center justify-center gap-2 bg-[#3078F1] text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-all shadow-md">
                <Edit3 size={18} /> EDIT
              </button>
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all">
                MEDIA KIT
              </button>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-5">Professional Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Briefcase size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</p>
                  <p className="text-sm font-bold text-slate-700">{userData.professional.experience}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Layout size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Niche</p>
                  <p className="text-sm font-bold text-slate-700 leading-tight">{userData.professional.primaryNiche}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</p>
                  <p className="text-sm font-bold text-slate-700">{userData.pricing.starting}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-hidden">
            <h3 className="text-base font-bold text-slate-800 mb-5">Social Media Links</h3>
            <div className="flex flex-wrap items-center gap-4">
              {userData.stats.instagram.url ? (
                <a href={userData.stats.instagram.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#fceef5] flex items-center justify-center text-[#e1306c] hover:scale-110 transition-transform">
                  <Instagram size={20} />
                </a>
              ) : null}
              {userData.stats.youtube.url ? (
                <a href={userData.stats.youtube.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#feecec] flex items-center justify-center text-[#ff0000] hover:scale-110 transition-transform">
                  <Youtube size={20} />
                </a>
              ) : null}
              {userData.stats.facebook.url ? (
                <a href={userData.stats.facebook.url} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#eef4fe] flex items-center justify-center text-[#1877f2] hover:scale-110 transition-transform">
                  <Facebook size={20} />
                </a>
              ) : null}
              {/* Fallback msg if nothing shows */}
              {(!userData.stats.instagram.url && !userData.stats.youtube.url && !userData.stats.facebook.url) && (
                <p className="text-xs text-slate-400 italic">No social links connected yet.</p>
              )}
            </div>
          </div>

          {/* Collaboration Banner */}
          <div className="bg-gradient-to-br from-[#3078F1] to-[#6366f1] rounded-2xl p-6 text-white relative overflow-hidden group mb-6">
            <div className="relative z-10">
              <h3 className="font-black text-xl mb-2 italic">Ready to Grind?</h3>
              <p className="text-blue-100 text-sm mb-4 font-medium">Let&apos;s build something epic together. Contact for projects or collabs.</p>
              <button disabled className="bg-white/90 text-[#3078F1] px-5 py-2 rounded-xl font-black text-sm transition-all shadow-md cursor-not-allowed">
                LET&apos;S TALK
              </button>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-12 transition-transform">
              <MessageSquare size={80} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
