
import React, { useState } from 'react';

const ARTIST_NICHES = ['Singer', 'Dancer', 'Musician', 'Painter', 'Photographer', 'Actor', 'Comedian', 'Magician', 'DJ', 'Makeup Artist', 'Fashion Designer', 'Writer'];
const INFLUENCER_NICHES = ['Lifestyle', 'UGC Creator', 'Fashion', 'Fitness', 'Travel', 'Food', 'Tech', 'Finance', 'Gaming', 'Education', 'Motivation', 'Spiritual', 'Actor', 'Comedian', 'Model', 'Filmmaker', 'Influencer', 'Historical'];
const PLATFORM_LIST = ['instagram', 'youtube', 'facebook'];


const ProfileEditForm = ({ formData, onChange, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState(1);
  const role = formData.role || 'user';
  const niches = role === 'artist' ? ARTIST_NICHES : INFLUENCER_NICHES;

  // Field handlers
  const handleField = (name, value) => {
    onChange({ target: { name, value } });
  };
  const handleNestedField = (path, value) => {
    onChange({ target: { name: path, value } });
  };
  const handlePlatformToggle = (platform) => {
    const current = formData.platforms?.[platform] || {};
    handleNestedField(`platforms.${platform}.hasAccount`, !current.hasAccount);
  };

  // UI classes
  const inputClass = "w-full px-4 py-2 rounded-md border border-gray-200 bg-white placeholder-gray-400 text-sm sm:text-base transition-shadow duration-150 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 focus:shadow-md";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1";

  // Buttons
  const SaveButton = ({ label }) => (
    <button type="button" onClick={onSave}
      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transform-gpu transition-transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2">
      💾 {label || 'Save Changes'}
    </button>
  );
  const CancelButton = () => (
    <button type="button" onClick={onCancel}
      className="px-6 py-2.5 rounded-full text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transform-gpu transition-transform hover:-translate-y-0.5 shadow-xl flex items-center gap-2">
      ❌ Cancel
    </button>
  );

  // Main render
  return (
    <div className="w-full bg-transparent">
      {/* Tabs Header */}
      <div className="w-full bg-white/0 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            {['Basic Info', 'Profile Details', 'Social & Professional'].map((title, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i + 1)}
                className={`py-3 px-3 text-center transition-all relative font-semibold text-sm tracking-wider ${
                  activeTab === i + 1 ? 'text-brand-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {title}
                {activeTab === i + 1 && (
                  <div className="absolute -bottom-px left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab 1: Basic Info */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Basic Details Card */}
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-lg p-6 overflow-hidden">
              <span className="absolute left-0 top-6 bottom-6 w-1.5 bg-brand-500 rounded-r-md" />
              <div className="pl-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h3 className="text-xl font-extrabold text-gray-800">Basic Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Full Name *</label>
                    <input className={inputClass} value={formData.fullName || ''} onChange={e => handleField('fullName', e.target.value)} placeholder="Enter your full name" />
                  </div>
                  <div>
                    <label className={labelClass}>Username / Display Name</label>
                    <input className={inputClass} value={formData.username || ''} onChange={e => handleField('username', e.target.value)} placeholder="@username" />
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input className={inputClass} type="email" value={formData.email || ''} onChange={e => handleField('email', e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number *</label>
                    <input className={inputClass} type="tel" value={formData.phone || ''} onChange={e => handleField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input className={inputClass} type="password" value={formData.password || ''} onChange={e => handleField('password', e.target.value)} placeholder="Leave blank to keep current" />
                  </div>
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <CancelButton />
                  <SaveButton label="Update Basic Info" />
                </div>
              </div>
            </div>

            {/* Profile Information Card */}
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-lg p-6 overflow-hidden">
              <span className="absolute left-0 top-6 bottom-6 w-1.5 bg-brand-500 rounded-r-md" />
              <div className="pl-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  <h3 className="text-xl font-extrabold text-gray-800">Profile Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Bio / About</label>
                    <textarea className={`${inputClass} resize-none`} rows={4} maxLength={1000} value={formData.bio || ''} onChange={e => handleField('bio', e.target.value)} placeholder="Write a short introduction about yourself..." />
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={inputClass} value={formData.location?.city || (typeof formData.location === 'string' ? formData.location : '')} onChange={e => handleNestedField('location.city', e.target.value)} placeholder="e.g. Indore" />
                  </div>
                  <div>
                    <label className={labelClass}>Country</label>
                    <input className={inputClass} value={formData.location?.country || ''} onChange={e => handleNestedField('location.country', e.target.value)} placeholder="e.g. India" />
                  </div>
                </div>
                <div className="mt-6 flex justify-between gap-3">
                  <CancelButton />
                  <SaveButton label="Update Profile Info" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Professional Details */}
        {activeTab === 2 && (
          <div className="animate-fadeIn">
            <div className="relative bg-white border border-gray-100 rounded-2xl shadow-lg p-6 overflow-hidden">
              <span className="absolute left-0 top-6 bottom-6 w-1.5 bg-brand-500 rounded-r-md" />
              <div className="pl-5 space-y-4">
                <div className="mb-2">
                  <h3 className="text-xl font-extrabold text-gray-800">🔹 Professional Details</h3>
                </div>

                <div>
                  <label className={labelClass}>{role === 'artist' ? 'Artist' : 'Influencer'} Niche / Category *</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {niches.map(n => (
                      <button key={n} type="button" onClick={() => handleField('niche', n)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${formData.niche === n ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className={labelClass}>Experience</label>
                    <select className={inputClass} value={formData.experience || ''} onChange={e => handleField('experience', e.target.value)}>
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Pricing / Charges (₹)</label>
                    <input className={inputClass} type="number" value={formData.pricing?.collaborationCharges || formData.budget || ''} onChange={e => handleNestedField('pricing.collaborationCharges', e.target.value)} placeholder="e.g. 5000" />
                  </div>
                </div>

                {/* Budget Details Section */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span>💰</span>
                    Budget Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Minimum Budget (₹)</label>
                      <input 
                        className={inputClass} 
                        type="number" 
                        value={formData.budget?.min || ''} 
                        onChange={e => handleNestedField('budget.min', e.target.value)} 
                        placeholder="e.g. 1000"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Maximum Budget (₹)</label>
                      <input 
                        className={inputClass} 
                        type="number" 
                        value={formData.budget?.max || ''} 
                        onChange={e => handleNestedField('budget.max', e.target.value)} 
                        placeholder="e.g. 50000"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Default Budget (₹)</label>
                      <input 
                        className={inputClass} 
                        type="number" 
                        value={formData.budget?.default || ''} 
                        onChange={e => handleNestedField('budget.default', e.target.value)} 
                        placeholder="e.g. 10000"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> Set your budget range to attract clients within your preferred pricing range.</p>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Previous Collaborations</label>
                  <textarea className={`${inputClass} resize-none`} rows={3} value={formData.previousCollaborations || ''} onChange={e => handleField('previousCollaborations', e.target.value)} placeholder="List notable collaborations..." />
                </div>

                <div className="mt-6 flex justify-end">
                  <SaveButton label="Update Professional Details" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social Media & Portfolio */}
        {activeTab === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="mb-2">
              <h3 className="text-xl font-black text-gray-800">🔹 Social Media & Portfolio</h3>
            </div>

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
                  <div key={platform} className={`w-full border transition-all ${pData.hasAccount ? 'border-brand-200 bg-brand-50/10' : 'border-gray-100 bg-transparent'} p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input type="checkbox" checked={!!pData.hasAccount} onChange={() => handlePlatformToggle(platform)}
                        className="w-5 h-5 text-brand-500 rounded-lg border-gray-300 focus:ring-brand-500" />
                      <span className="font-bold text-gray-800 capitalize text-base">{platform}</span>
                    </label>
                    {pData.hasAccount && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-6">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Profile URL</label><input className={inputClass} value={pData.url || ''} onChange={e => handleNestedField(`platforms.${platform}.url`, e.target.value)} placeholder="URL" /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Followers</label><input className={inputClass} type="number" value={pData.followers || ''} onChange={e => handleNestedField(`platforms.${platform}.followers`, e.target.value)} placeholder="Count" /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Engagement %</label><input className={inputClass} value={pData.engagementRate || ''} onChange={e => handleNestedField(`platforms.${platform}.engagementRate`, e.target.value)} placeholder="Rate" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="text-lg font-bold text-gray-800 mt-5 mb-3">Portfolio / Sample Work</h3>
            <div className="w-full border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-500 mb-3">Add direct links to your best work (YouTube, Instagram, or Website URLs).</p>
              <div className="flex gap-3">
                <input id="portfolio-input" className={`${inputClass} flex-1 bg-white`} placeholder="Paste a portfolio URL here..." />
                <button type="button" onClick={() => {
                  const input = document.getElementById('portfolio-input');
                  if (input?.value) { handleField('portfolio', [...(formData.portfolio || []), input.value]); input.value = ''; }
                }} className="px-4 py-2 bg-brand-500 text-white rounded-md font-bold text-sm hover:bg-brand-600 transition-all">+ Add</button>
              </div>

              {formData.portfolio?.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-3">
                  {formData.portfolio.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg text-sm group shadow-sm hover:shadow-md transition-shadow">
                      <span className="flex-1 truncate text-gray-600 font-medium">{item}</span>
                      <button type="button" onClick={() => handleField('portfolio', formData.portfolio.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-700 transition-colors p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-between gap-3">
              <CancelButton />
              <SaveButton label="Update Social" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditForm;
