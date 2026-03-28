import React, { useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

/**
 * Influencer Registration Page Component
 * This component handles registration for influencers only.
 * Previously handled both artists and influencers, but has been optimized for influencer-only use.
 */
const InfluencerRegistrationPage = ({ config, embedded = false }) => {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    profileType: 'influencer',
    location: '',
    categories: [],
    socialLinks: {
      youtube: '',
      instagram: ''
    },
    termsAccepted: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const influencerCategories = [
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
    { id: 'ugc_creator', name: 'UGC Creator', icon: '📱' },
    { id: 'fashion', name: 'Fashion', icon: '👗' },
    { id: 'fitness', name: 'Fitness', icon: '💪' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'food', name: 'Food', icon: '🍔' },
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'motivation', name: 'Motivation', icon: '🔥' },
    { id: 'spiritual', name: 'Spiritual', icon: '🧘' },
    { id: 'actor', name: 'Actor', icon: '🎬' },
    { id: 'comedian', name: 'Comedian', icon: '😄' },
    { id: 'model', name: 'Model', icon: '👤' },
    { id: 'filmmaker', name: 'Filmmaker', icon: '🎥' },
    { id: 'influencer', name: 'Influencer', icon: '🌟' },
    { id: 'historical', name: 'Historical', icon: '📜' },
    { id: 'other', name: 'Other', icon: '📌' }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => {
      const currentCategories = prev.categories || [];
      const newCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter(id => id !== categoryId)
        : [...currentCategories, categoryId];
      return { ...prev, categories: newCategories };
    });
    setError('');
  };

  const validateForm = () => {
    setError('');
    
    // Common validations for both artists and influencers
    if (!formData.email || !formData.phone || !formData.password) {
      setError('Please fill all required fields');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    // Common validation for categories
    if (!formData.categories || formData.categories.length === 0) {
      setError('Please select at least one category');
      return false;
    }
    
    // Terms acceptance validation
    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return false;
    }
    
    return true;
  };


  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Influencer payload - only include required fields
      const payload = {
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        location: formData.location,
        categories: formData.categories,
        socialLinks: formData.socialLinks,
        platforms: {
          instagram: { hasAccount: !!formData.socialLinks.instagram, url: formData.socialLinks.instagram || '' },
          youtube: { hasAccount: !!formData.socialLinks.youtube, url: formData.socialLinks.youtube || '' }
        },
        profileType: 'influencer',
        termsAccepted: formData.termsAccepted
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002';
      const response = await fetch(`${API_BASE_URL}/api/influencer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Registration successful! Your application is under review.');
        setTimeout(() => {
          navigate('home');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={embedded ? 'pb-16' : 'pt-8 pb-16 min-h-screen'} style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {!embedded && (
          <>
            {/* Back to Home Button */}
            <div className="mb-3">
              <button
                onClick={() => navigate('home')}
                className="flex items-center gap-2 text-textSecondary hover:text-orange-500 transition-colors font-medium w-fit"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
          </>
        )}

        <div className="bg-surface rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-12">

            {/* Left Column: Personal Information */}
            <div className="lg:col-span-6 p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-border flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-textPrimary">Influencer Registration</h1>
                  <p className="text-textSecondary text-sm">Fill your contact details</p>
                </div>
              </div>

              <div className="flex-1 flex flex-col space-y-8">
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                    Contact Information
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-2">
                        Email Address
                      </label>
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary mt-8">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                    </div>

                    <div className="relative">
                      <label htmlFor="phone" className="block text-sm font-medium text-textSecondary mb-2">
                        Phone Number
                      </label>
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary mt-8">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                    </div>

                    <div className="relative">
                      <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-2">
                        Password
                      </label>
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary mt-8">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-12 pr-12 py-4 bg-background border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-black text-black text-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-textSecondary hover:text-orange-500 transition-colors mt-8"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-error text-sm animate-in fade-in duration-300">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-success text-sm animate-in fade-in duration-300">
                    {success}
                  </div>
                )}

              </div>
            </div>

            {/* Right Column: Category & Profile Details */}
            <div className="lg:col-span-6 p-8 lg:p-12 bg-background/50 flex flex-col">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-xl font-bold text-textPrimary mb-2">Portfolio Details</h2>
                <p className="text-textSecondary text-sm">Help us understand your talent and social presence</p>
              </div>

              <div className="space-y-8">
                {/* Artist Categories Section */}
                <div>

                  <div
                    onClick={() => setShowCategoryPopup(true)}
                    className="w-full min-h-[60px] p-3 bg-surface border border-border rounded-2xl flex flex-nowrap items-center gap-2 cursor-pointer hover:border-orange-500 hover:shadow-sm transition-all text-left overflow-x-auto custom-scrollbar hide-scrollbar"
                  >
                    {!formData.categories || formData.categories.length === 0 ? (
                      <span className="px-3 text-black text-base">Select Categories (Select up to 3)</span>
                    ) : (
                      formData.categories.map(catId => {
                        const category = influencerCategories.find(c => c.id === catId);
                        return (
                          <div
                          
                            key={catId}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold border border-orange-200 animate-in zoom-in duration-300"
                          >
                            <span className="whitespace-nowrap">{category?.icon}</span>
                            <span className="whitespace-nowrap">{category?.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(catId);
                              }}
                              className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center hover:bg-orange-300 transition-colors"
                            >
                              <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Location & Social Links Section */}
                <div className=" border-border space-y-8">
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-textSecondary mb-2 pl-1">
                      Location
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <input
                        id="location"
                        type="text"
                        placeholder="e.g. Indore, India"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 text-black text-lg shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="youtube" className="block text-sm font-medium text-textSecondary mb-2 pl-1">
                          YouTube Channel
                        </label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </span>
                          <input
                            id="youtube"
                            type="url"
                          placeholder="YouTube Link"
                            value={formData.socialLinks.youtube}
                            onChange={(e) => handleInputChange('socialLinks.youtube', e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 text-black text-lg shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="instagram" className="block text-sm font-medium text-textSecondary mb-2 pl-1">
                          Instagram Profile
                        </label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary group-focus-within:text-orange-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" strokeWidth="2" /><path strokeWidth="2" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" />
                            </svg>
                          </span>
                          <input
                            id="instagram"
                            type="url"
                          placeholder="Instagram Link"
                            value={formData.socialLinks.instagram}
                            onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all placeholder-gray-400 text-black text-lg shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="p-8 lg:p-12 border-t border-border flex flex-col items-center gap-6 bg-surface">
            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 max-w-md">
              <input
                type="checkbox"
                id="termsAccepted"
                checked={formData.termsAccepted}
                onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                className="mt-1 w-4 h-4 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
              <label htmlFor="termsAccepted" className="text-sm text-gray-600 leading-relaxed">
                I agree to the <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">Terms and Conditions</a> and <a href="#" className="text-orange-500 hover:text-orange-600 font-medium">Privacy Policy</a>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full max-w-md py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Registering...
                </span>
              ) : 'Register'}
            </button>
          </div>
        </div>
      </div>
      {/* Category Selection Modal */}
      {showCategoryPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-200 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-textPrimary">Choose Influencer Categories</h2>
                  <p className="text-textSecondary text-sm">Select up to 3 categories that best describe you</p>
                </div>
                <button
                  onClick={() => setShowCategoryPopup(false)}
                  className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search Filter */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-textSecondary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search categories (e.g. Fashion, Fitness, Tech...)"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all placeholder-gray-400 text-gray-700"
                />
              </div>
            </div>

            {/* Modal Body: Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {influencerCategories
                  .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                  .map(category => (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-5 rounded-[24px] border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 ${formData.categories && formData.categories.includes(category.id)
                        ? 'border-orange-500 bg-orange-50 shadow-md scale-[1.02]'
                        : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50 hover:shadow-lg hover:scale-[1.02]'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-1 transition-all ${formData.categories && formData.categories.includes(category.id) ? 'bg-orange-200 scale-110' : 'bg-gray-100'
                        }`}>
                        {category.icon}
                      </div>
                      <span className={`text-xs font-bold text-center leading-tight ${formData.categories && formData.categories.includes(category.id) ? 'text-orange-600' : 'text-gray-600'}`}>
                        {category.name}
                      </span>
                      {formData.categories && formData.categories.includes(category.id) && (
                        <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200 scale-110 animate-in zoom-in duration-300">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                {influencerCategories.filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())).length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <p>No categories found matching "{categorySearchQuery}"</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm font-bold text-gray-600">
                <span className={formData.categories && formData.categories.length === 3 ? 'text-orange-500' : 'text-gray-600'}>
                  {formData.categories ? formData.categories.length : 0}
                </span>
                /3 Selected
              </div>
              <button
                onClick={() => setShowCategoryPopup(false)}
                className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
              >
                Done Selection
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
    
  );
};

export default InfluencerRegistrationPage;
