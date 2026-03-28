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
    <div className={embedded ? 'py-10 sm:py-14' : 'pt-8 pb-16 min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 relative overflow-hidden'}>
      {!embedded && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-brand-200 rounded-full opacity-10 animate-pulse" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-200 rounded-full opacity-10 animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-brand-300 rounded-full opacity-10 animate-pulse" />
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-h-[calc(100vh-16rem)]">
          
          {/* Left Side: Brand Content (Visible only on Desktop) */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-center p-12">
            <div className="mb-6 max-w-lg">
              <div className="mb-6">
                <h1 className="text-4xl font-medium text-orange-500 mb-4 tracking-tight drop-shadow-sm">Indori Influencer</h1>
                <h2 className="text-2xl text-gray-800 font-medium leading-tight">
                  Turn Your <span className="bg-gradient-to-r from-orange-500 to-brand-500 bg-clip-text text-transparent opacity-90">Influence</span> into a Professional Career
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Direct access to top brands and local business partnerships
              </p>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-white/40 shadow-sm mb-8 scale-105 transition-transform hover:scale-110">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white" />)}
                </div>
                <span className="text-sm font-medium text-gray-800">Join 500+ Creators earning today</span>
              </div>
            </div>

            <div className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/60 shadow-xl space-y-8">
              {[
                { title: 'Collaborate with Top Brands', subtitle: 'Work with the best businesses in Indore', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
                { title: 'Monetize Your Content', subtitle: 'Get paid for your creativity and reach', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                { title: 'Grow Your Audience', subtitle: 'Tools to expand your social presence', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 group cursor-default">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900 leading-none mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Registration Card */}
          <div className="w-full lg:w-1/2 max-w-2xl">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
              
              <div className="mb-8">
                <h2 className="text-3xl font-medium text-gray-800 mb-2">I am an Influencer</h2>
                <p className="text-gray-600">Showcase your reach, get brand deals, and grow your influence across Indore and beyond.</p>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium animate-in fade-in duration-300">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-700 text-sm font-medium animate-in fade-in duration-300">
                  {success}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 ml-1">Email Address</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 ml-1">Phone Number</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </span>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 ml-1">Password</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 ml-1">Location</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </span>
                      <input
                        id="location"
                        type="text"
                        placeholder="Indore, India"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 ml-1">Specialties (Select up to 3)</label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryPopup(true)}
                    className="w-full min-h-[56px] px-4 py-3 bg-gray-50 border-none rounded-2xl flex flex-wrap items-center gap-2 hover:bg-gray-100 transition-all text-left shadow-sm"
                  >
                    {!formData.categories || formData.categories.length === 0 ? (
                      <span className="text-gray-400">What's your niche?</span>
                    ) : (
                      formData.categories.map(catId => {
                        const category = influencerCategories.find(c => c.id === catId);
                        return (
                          <span key={catId} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold flex items-center gap-1 border border-orange-200">
                            {category?.icon} {category?.name}
                          </span>
                        );
                      })
                    )}
                  </button>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 ml-1">Instagram Link</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
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
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 ml-1">YouTube Link</label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-orange-500 transition-colors">
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
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className="mt-1 w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="termsAccepted" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the <a href="#" className="text-orange-500 hover:underline font-medium">Terms and Conditions</a> and <a href="#" className="text-orange-500 hover:underline font-medium">Privacy Policy</a>
                  </label>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-4 bg-[#e65c00] text-white rounded-[20px] font-medium text-lg shadow-xl shadow-orange-200/50 hover:bg-[#d45500] hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0"
                >
                  {loading ? 'Creating Account...' : 'Join as a Creator →'}
                </button>

                <div className="text-center mt-4">
                  <p className="text-gray-500 font-medium">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate('auth')}
                      className="text-orange-500 hover:text-orange-600 font-medium transition-colors hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

                {/* Divider & Socials */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                  <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="flex items-center justify-center py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-gray-700 gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Google
                  </button>
                  <button type="button" className="flex items-center justify-center py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors font-medium text-gray-700 gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Facebook
                  </button>
                </div>
              </div>

            </div>
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
                  <h2 className="text-2xl font-medium text-textPrimary">Choose Influencer Categories</h2>
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
                      <span className={`text-xs font-medium text-center leading-tight ${formData.categories && formData.categories.includes(category.id) ? 'text-orange-600' : 'text-gray-600'}`}>
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
              <div className="text-sm font-medium text-gray-600">
                <span className={formData.categories && formData.categories.length === 3 ? 'text-orange-500' : 'text-gray-600'}>
                  {formData.categories ? formData.categories.length : 0}
                </span>
                /3 Selected
              </div>
              <button
                onClick={() => setShowCategoryPopup(false)}
                className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-medium shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95"
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
