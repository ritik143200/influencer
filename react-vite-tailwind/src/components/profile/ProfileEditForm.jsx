import React, { useState } from 'react';

const ARTIST_NICHES = ['Singer', 'Dancer', 'Musician', 'Painter', 'Photographer', 'Actor', 'Comedian', 'Magician', 'DJ', 'Makeup Artist', 'Fashion Designer', 'Writer'];
const INFLUENCER_NICHES = [
  'Lifestyle', 'UGC Creator', 'Fashion', 'Fitness', 'Travel', 'Food', 'Tech', 'Finance', 'Gaming', 
  'Education', 'Motivation', 'Spiritual', 'Actor', 'Comedian', 'Model', 'Filmmaker', 'Influencer', 'Historical'
];
const PLATFORM_LIST = ['instagram', 'youtube', 'facebook'];

const ProfileEditForm = ({ formData, onChange, onSave, onCancel }) => {
  const [activeTab, setActiveTab] = useState(1);
  const role = formData.role || 'user';
  const niches = role === 'artist' ? ARTIST_NICHES : INFLUENCER_NICHES;

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

  const tabTitles = ['Basic Info', 'Profile Details', 'Social & Professional'];

  const inputClass = "w-full px-4 py-1.5 rounded-lg border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm bg-gray-50/50 focus:bg-white";
  const labelClass = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1";

  const SaveButton = ({ label }) => (
    <button type="button" onClick={onSave}
      className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 transition-all shadow-lg flex items-center gap-2">
      💾 {label || 'Save Changes'}
    </button>
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-100 bg-gray-50/50">
        {tabTitles.map((title, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i + 1)}
            className={`flex-1 py-2 px-2 text-center transition-all relative font-bold text-xs uppercase tracking-wider ${
              activeTab === i + 1 
                ? 'text-brand-600 bg-white' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            {title}
            {activeTab === i + 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {/* Tab 1: Basic Info */}
        {activeTab === 1 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="mb-2">
              <h3 className="text-xl font-black text-gray-800">🔹 Basic Details</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2"><label className={labelClass}>Full Name *</label><input className={inputClass} value={formData.fullName || ''} onChange={e => handleField('fullName', e.target.value)} placeholder="Enter your full name" /></div>
              <div><label className={labelClass}>Username / Display Name</label><input className={inputClass} value={formData.username || ''} onChange={e => handleField('username', e.target.value)} placeholder="@username" /></div>
              <div><label className={labelClass}>Email Address *</label><input className={inputClass} type="email" value={formData.email || ''} onChange={e => handleField('email', e.target.value)} placeholder="your@email.com" /></div>
              <div><label className={labelClass}>Phone Number *</label><input className={inputClass} type="tel" value={formData.phone || ''} onChange={e => handleField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className={labelClass}>Password</label><input className={inputClass} type="password" value={formData.password || ''} onChange={e => handleField('password', e.target.value)} placeholder="Leave blank to keep current" /></div>
            </div>

            <h3 className="text-xl font-black text-gray-800 mt-4 mb-3">🔹 Profile Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className={labelClass}>Bio / About</label><textarea className={inputClass + " resize-none"} rows={4} maxLength={1000} value={formData.bio || ''} onChange={e => handleField('bio', e.target.value)} placeholder="Write a short introduction about yourself..." /></div>
              <div><label className={labelClass}>City</label><input className={inputClass} value={formData.location?.city || (typeof formData.location === 'string' ? formData.location : '')} onChange={e => handleNestedField('location.city', e.target.value)} placeholder="e.g. Indore" /></div>
              <div><label className={labelClass}>Country</label><input className={inputClass} value={formData.location?.country || ''} onChange={e => handleNestedField('location.country', e.target.value)} placeholder="e.g. India" /></div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <SaveButton label="Update Basic Info" />
            </div>
          </div>
        )}

        {/* Tab 2: Category & Professional */}
        {activeTab === 2 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="mb-2">
              <h3 className="text-xl font-black text-gray-800">🔹 Professional Details</h3>
            </div>

            <div><label className={labelClass}>{role === 'artist' ? 'Artist' : 'Influencer'} Niche / Category *</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {niches.map(n => (
                  <button key={n} type="button" onClick={() => handleField('niche', n)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${formData.niche === n ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div><label className={labelClass}>Experience</label>
                <select className={inputClass} value={formData.experience || ''} onChange={e => handleField('experience', e.target.value)}>
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option><option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option><option value="5-10">5-10 years</option><option value="10+">10+ years</option>
                </select>
              </div>
              <div><label className={labelClass}>Pricing / Charges (₹)</label><input className={inputClass} type="number" value={formData.pricing?.collaborationCharges || formData.budget || ''} onChange={e => handleNestedField('pricing.collaborationCharges', e.target.value)} placeholder="e.g. 5000" /></div>
              <div className="sm:col-span-2"><label className={labelClass}>Previous Collaborations</label><textarea className={inputClass + " resize-none"} rows={3} value={formData.previousCollaborations || ''} onChange={e => handleField('previousCollaborations', e.target.value)} placeholder="List notable collaborations..." /></div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <SaveButton label="Update Professional Details" />
            </div>
          </div>
        )}

        {/* Tab 3: Social & Portfolio */}
        {activeTab === 3 && (
          <div className="space-y-3 animate-fadeIn">
            <div className="mb-2">
              <h3 className="text-xl font-black text-gray-800">🔹 Social Media & Portfolio</h3>
            </div>

            <div className="space-y-4">
              {PLATFORM_LIST.map(platform => {
                let pData = formData.platforms?.[platform] || {};
                
                // Fallback to socialLinks if platforms data is missing but URL exists
                if (!pData.url && formData.socialLinks?.[platform]) {
                  pData = {
                    ...pData,
                    hasAccount: true,
                    url: formData.socialLinks[platform]
                  };
                }

                return (
                  <div key={platform} className={`rounded-2xl border transition-all ${pData.hasAccount ? 'border-brand-200 bg-brand-50/20' : 'border-gray-100 bg-gray-50/30'} p-5`}>
                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                      <input type="checkbox" checked={!!pData.hasAccount} onChange={() => handlePlatformToggle(platform)}
                        className="w-5 h-5 text-brand-500 rounded-lg border-gray-300 focus:ring-brand-500" />
                      <span className="font-bold text-gray-800 capitalize text-base">{platform}</span>
                    </label>
                    {pData.hasAccount && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-8">
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Profile URL</label><input className={inputClass} value={pData.url || ''} onChange={e => handleNestedField(`platforms.${platform}.url`, e.target.value)} placeholder="URL" /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Followers</label><input className={inputClass} type="number" value={pData.followers || ''} onChange={e => handleNestedField(`platforms.${platform}.followers`, e.target.value)} placeholder="Count" /></div>
                        <div><label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Engagement %</label><input className={inputClass} value={pData.engagementRate || ''} onChange={e => handleNestedField(`platforms.${platform}.engagementRate`, e.target.value)} placeholder="Rate" /></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="text-xl font-black text-gray-800 mt-5 mb-3">🔹 Portfolio / Sample Work</h3>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-sm text-gray-500 mb-4">Add direct links to your best work (YouTube, Instagram, or Website URLs).</p>
              <div className="flex gap-3">
                <input id="portfolio-input" className={inputClass + " flex-1 bg-white"} placeholder="Paste a portfolio URL here..." />
                <button type="button" onClick={() => {
                  const input = document.getElementById('portfolio-input');
                  if (input?.value) { handleField('portfolio', [...(formData.portfolio || []), input.value]); input.value = ''; }
                }} className="px-5 py-2 bg-brand-500 text-white rounded-lg font-bold text-sm hover:bg-brand-600 transition-all shadow-md active:scale-95">+ Add</button>
              </div>

              {formData.portfolio?.length > 0 && (
                <div className="grid grid-cols-1 gap-2 mt-4">
                  {formData.portfolio.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl text-sm shadow-sm group">
                      <span className="flex-1 truncate text-gray-600 font-medium">{item}</span>
                      <button type="button" onClick={() => handleField('portfolio', formData.portfolio.filter((_, i) => i !== idx))} 
                        className="text-red-400 hover:text-red-600 transition-colors p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <SaveButton label="Update Social" />
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ProfileEditForm;
