import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

// Small helper to safely read env base
const getApiBase = () => (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

const ARTIST_NICHES = ['Singer', 'Dancer', 'Musician', 'Painter', 'Photographer', 'Actor', 'Comedian', 'Magician', 'DJ', 'Makeup Artist', 'Fashion Designer', 'Writer'];
const INFLUENCER_NICHES = ['Lifestyle', 'UGC Creator', 'Fashion', 'Fitness', 'Travel', 'Food', 'Tech', 'Finance', 'Gaming', 'Education', 'Motivation', 'Spiritual', 'Actor', 'Comedian', 'Model', 'Filmmaker', 'Influencer', 'Historical'];
const PLATFORM_LIST = ['instagram', 'youtube', 'facebook'];

const ProfileEditForm = ({ formData, onChange, onSave, onCancel }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const role = formData.role || 'user';
  const niches = role === 'artist' ? ARTIST_NICHES : INFLUENCER_NICHES;

  // Calculate completion progress
  const calculateCompletion = () => {
    let completed = 0;
    let total = 12;

    if (formData.fullName?.trim()) completed++;
    if (formData.email?.trim()) completed++;
    if (formData.phone?.trim()) completed++;
    if (formData.bio?.trim()) completed++;
    if (formData.location?.city?.trim() || (typeof formData.location === 'string' && formData.location.trim())) completed++;
    if (formData.location?.country?.trim()) completed++;
    if (formData.niche) completed++;
    if (formData.experience?.trim()) completed++;
    if (formData.budgetMin) completed++;
    if (formData.budgetMax) completed++;
    if (formData.budget) completed++;
    if (formData.socialLinks?.instagram?.trim() || formData.platforms?.instagram?.url?.trim() || formData.instagram?.trim()) completed++;

    return { completed, total, percent: Math.round((completed / total) * 100) };
  };

  const progress = calculateCompletion();
  const handleField = (name, value) => {
    // Coerce numeric budget fields to numbers so backend/validation sees them correctly
    const numericFields = ['budget', 'budgetMin', 'budgetMax'];
    let out = value;
    if (numericFields.includes(name)) {
      out = value === '' ? '' : Number(value);
      if (Number.isNaN(out)) out = value;
    }
    onChange({ target: { name, value: out } });
  };
  const handleNestedField = (path, value) => {
    // If nested field is a followers count, coerce to number
    let out = value;
    if (path.endsWith('.followers')) {
      out = value === '' ? '' : Number(value);
      if (Number.isNaN(out)) out = value;
    }
    onChange({ target: { name: path, value: out } });
  };
  const handlePlatformToggle = (platform) => {
    const current = formData.platforms?.[platform] || {};
    handleNestedField(`platforms.${platform}.hasAccount`, !current.hasAccount);
  };

  // UI classes - simplified and cleaner
  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-500 text-sm transition-all focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
  const labelClass = "block text-sm font-semibold text-gray-800 mb-2";
  const requiredBadge = <span className="text-red-500 font-bold ml-1">*</span>;
  const optionalBadge = <span className="text-gray-400 text-xs ml-1">(optional)</span>;
  
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
    const token = localStorage.getItem('userToken');

    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const response = await fetch(`${API_BASE_URL}/api/influencer/portfolio/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      handleField('portfolio', [...(formData.portfolio || []), ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload one or more images. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    const API_BASE_URL = getApiBase();
    const token = localStorage.getItem('userToken');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/influencer/portfolio/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      // Use returned url to update profile image fields
      const url = data.url || data.path || data.data?.url;
      if (url) {
        handleField('profileImage', url);
        handleField('profilePicture', url);
      }
    } catch (err) {
      console.error('Avatar upload error', err);
      alert('Failed to upload avatar. Try again.');
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };


  // Main render - single page scrollable design
  return (
    <div className="w-full bg-transparent">
      <div className="max-w-3xl w-full mx-auto px-2 sm:px-8 py-10 md:py-12">
        {/* Page Header with Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 text-sm mt-1">Update your information to help us match you with better opportunities</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-brand-600">{progress.completed}/{progress.total}</p>
              <p className="text-xs text-gray-500 mt-0.5">Fields Completed</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-brand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{progress.percent}% Complete</p>
        </div>

        {/* Basic Information Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Basic Information
          </h2>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                { (formData.profileImage || formData.profilePicture) ? (
                  <img src={formData.profileImage || formData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                <div className="flex gap-2 items-center">
                  <button type="button" onClick={() => avatarInputRef.current?.click()} className="px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition">
                    {avatarUploading ? 'Uploading...' : 'Change Avatar'}
                  </button>
                  <button type="button" onClick={() => { handleField('profileImage', ''); handleField('profilePicture', ''); }} className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG or WebP. Max 5MB.</p>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Full Name
                {requiredBadge}
              </label>
              <input 
                className={inputClass} 
                value={formData.fullName || ''} 
                onChange={e => handleField('fullName', e.target.value)} 
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Email Address
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  type="email" 
                  value={formData.email || ''} 
                  onChange={e => handleField('email', e.target.value)} 
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone Number
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  type="tel" 
                  value={formData.phone || ''} 
                  onChange={e => handleField('phone', e.target.value)} 
                  placeholder="+91 9876543210"
                />
              </div>
            </div>


          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 2.586V4h3a2 2 0 012 2v2h1a1 1 0 110 2h-1v3h1a1 1 0 110 2h-1v3h1a1 1 0 110 2h-1v1a2 2 0 01-2 2h-3v-1a1 1 0 10-2 0v1H7a2 2 0 01-2-2v-1H4a2 2 0 01-2-2v-5H2a1 1 0 110-2h1V6H2a1 1 0 010-2h2V4z" />
            </svg>
            Profile Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                About You
                {requiredBadge}
              </label>
              <textarea 
                className={`${inputClass} resize-none`} 
                rows={4} 
                maxLength={500}
                value={formData.bio || ''} 
                onChange={e => handleField('bio', e.target.value)} 
                placeholder="Tell us about yourself, your expertise, and what makes you unique..."
              />
              <p className="text-xs text-gray-500 mt-1">{(formData.bio || '').length}/500 characters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  City
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  value={formData.location?.city || (typeof formData.location === 'string' ? formData.location : '')} 
                  onChange={e => handleNestedField('location.city', e.target.value)} 
                  placeholder="Indore"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Country
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  value={formData.location?.country || ''} 
                  onChange={e => handleNestedField('location.country', e.target.value)} 
                  placeholder="India"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            Professional Details
          </h2>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                {role === 'artist' ? 'Artist' : 'Influencer'} Niche
                {requiredBadge}
              </label>
              <p className="text-xs text-gray-500 mb-2">Select one or more niches</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {niches.map(n => {
                  const selectedNiches = Array.isArray(formData.niche)
                    ? formData.niche
                    : (formData.niche ? [formData.niche] : []);
                  const isSelected = selectedNiches.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        const current = Array.isArray(formData.niche)
                          ? formData.niche
                          : (formData.niche ? [formData.niche] : []);
                        const updated = isSelected
                          ? current.filter(x => x !== n)
                          : [...current, n];
                        handleField('niche', updated);
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-brand-400'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {n}
                    </button>
                  );
                })}
              </div>
              {(() => {
                const count = Array.isArray(formData.niche) ? formData.niche.length : (formData.niche ? 1 : 0);
                return count > 0 ? (
                  <p className="text-xs text-brand-600 mt-2 font-semibold">{count} niche{count > 1 ? 's' : ''} selected</p>
                ) : null;
              })()}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Experience
                  {requiredBadge}
                </label>
                <select 
                  className={inputClass} 
                  value={formData.experience || ''} 
                  onChange={e => handleField('experience', e.target.value)}
                >
                  <option value="">Select your experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Default Budget (per event)
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  type="number" 
                  value={formData.budget || ''} 
                  onChange={e => handleField('budget', e.target.value)} 
                  placeholder="25000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Minimum Budget
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  type="number" 
                  value={formData.budgetMin || ''} 
                  onChange={e => handleField('budgetMin', e.target.value)} 
                  placeholder="10000"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Maximum Budget
                  {requiredBadge}
                </label>
                <input 
                  className={inputClass} 
                  type="number" 
                  value={formData.budgetMax || ''} 
                  onChange={e => handleField('budgetMax', e.target.value)} 
                  placeholder="100000"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Social Media Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Social Media Links
          </h2>

          <div className="space-y-4">
            {PLATFORM_LIST.map(platform => {
              let pData = formData.platforms?.[platform] || {};
              if (!pData.url && formData.socialLinks?.[platform]) {
                pData = {
                  ...pData,
                  hasAccount: true,
                  url: formData.socialLinks[platform]
                };
              }
              return (
                <div key={platform} className="pb-4 border-b border-gray-200 last:border-b-0">
                  <label className="flex items-center gap-3 cursor-pointer mb-4">
                    <input 
                      type="checkbox" 
                      checked={!!pData.hasAccount} 
                      onChange={() => handlePlatformToggle(platform)}
                      className="w-5 h-5 text-brand-600 rounded border-gray-300 focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="font-semibold text-gray-900 capitalize">{platform}</span>
                    <span className="text-xs text-gray-500 ml-auto">{pData.hasAccount ? 'Connected' : 'Not added'}</span>
                  </label>
                  
                  {pData.hasAccount && (
                    <div className="space-y-3 pl-8">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Profile URL</label>
                        <input 
                          className={inputClass} 
                          value={pData.url || ''} 
                          onChange={e => handleNestedField(`platforms.${platform}.url`, e.target.value)} 
                          placeholder={`https://${platform}.com/your-handle`}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Followers</label>
                          <input 
                            className={inputClass} 
                            type="number" 
                            value={pData.followers || ''} 
                            onChange={e => handleNestedField(`platforms.${platform}.followers`, e.target.value)} 
                            placeholder="50000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Engagement %</label>
                          <input 
                            className={inputClass} 
                            value={pData.engagementRate || ''} 
                            onChange={e => handleNestedField(`platforms.${platform}.engagementRate`, e.target.value)} 
                            placeholder="3.5%"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Previous Collaborations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Previous Collaborations
            {optionalBadge}
          </h2>
          <textarea
            className={`${inputClass} resize-none`}
            rows={3}
            value={formData.previousCollaborations || ''}
            onChange={e => handleField('previousCollaborations', e.target.value)}
            placeholder="Mention brands or projects you've worked on..."
          />
        </div>

        {/* Portfolio Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />
            Portfolio {optionalBadge}
          </h2>

          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Showcase your best work. You can upload images directly or add links to your project (YouTube, Instagram, etc.)</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Upload Box */}
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isUploading ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'bg-brand-50/30 border-brand-200 hover:border-brand-400 hover:bg-brand-50'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
                  className="hidden"
                />
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-2" />
                    <p className="text-sm font-semibold text-brand-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-brand-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-900">Upload Images</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG or WebP</p>
                  </>
                )}
              </div>

              {/* Link Input Box */}
              <div className="flex flex-col justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-sm font-bold text-gray-900">Add via Link</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    id="portfolio-input" 
                    className={`${inputClass} !py-2 !text-xs`} 
                    placeholder="Paste URL..."
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const input = document.getElementById('portfolio-input');
                      if (input?.value?.trim()) { 
                        handleField('portfolio', [...(formData.portfolio || []), input.value]); 
                        input.value = ''; 
                      }
                    }}
                    className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {formData.portfolio?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {formData.portfolio.map((item, idx) => {
                const isImage = typeof item === 'string' && (item.includes('cloudinary.com') || item.match(/\.(jpeg|jpg|gif|png|webp)/i));
                return (
                  <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    {isImage ? (
                      <img src={item} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <ImageIcon className="w-6 h-6 text-gray-300 mb-1" />
                        <p className="text-[10px] text-gray-500 font-medium truncate w-full px-1">{item}</p>
                      </div>
                    )}
                    
                    <button 
                      type="button" 
                      onClick={() => handleField('portfolio', formData.portfolio.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>



        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 px-6 py-3 text-white bg-brand-600 rounded-lg font-semibold hover:bg-brand-700 transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditForm;