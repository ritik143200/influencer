import React, { useState } from 'react';

const ARTIST_NICHES = ['Singer', 'Dancer', 'Musician', 'Painter', 'Photographer', 'Actor', 'Comedian', 'Magician', 'DJ', 'Makeup Artist', 'Fashion Designer', 'Writer'];
const INFLUENCER_NICHES = ['Fashion', 'Food', 'Travel', 'Tech', 'Fitness', 'Beauty', 'Gaming', 'Lifestyle', 'Business', 'Education', 'Entertainment', 'Sports'];
const PLATFORM_LIST = ['instagram', 'youtube', 'twitter', 'linkedin', 'tiktok', 'facebook'];

const ProfileEditForm = ({ formData, onChange, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
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

  const stepTitles = ['Basic Info', 'Profile Details', 'Social & Professional'];

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all text-sm bg-gray-50/50 focus:bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 animate-fadeIn">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex items-center flex-1">
            <button onClick={() => setStep(i + 1)}
              className={`flex items-center gap-2 transition-all ${step === i + 1 ? 'text-brand-600' : step > i + 1 ? 'text-green-500' : 'text-gray-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step === i + 1 ? 'border-brand-500 bg-brand-500 text-white' : step > i + 1 ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline text-xs font-semibold">{title}</span>
            </button>
            {i < stepTitles.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔹 Basic Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>First Name *</label><input className={inputClass} value={formData.firstName || ''} onChange={e => handleField('firstName', e.target.value)} placeholder="Enter first name" /></div>
            <div><label className={labelClass}>Last Name *</label><input className={inputClass} value={formData.lastName || ''} onChange={e => handleField('lastName', e.target.value)} placeholder="Enter last name" /></div>
            <div><label className={labelClass}>Username / Display Name</label><input className={inputClass} value={formData.username || ''} onChange={e => handleField('username', e.target.value)} placeholder="@username" /></div>
            <div><label className={labelClass}>Email Address *</label><input className={inputClass} type="email" value={formData.email || ''} onChange={e => handleField('email', e.target.value)} placeholder="your@email.com" /></div>
            <div><label className={labelClass}>Phone Number *</label><input className={inputClass} type="tel" value={formData.phone || ''} onChange={e => handleField('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
            <div><label className={labelClass}>Password</label><input className={inputClass} type="password" value={formData.password || ''} onChange={e => handleField('password', e.target.value)} placeholder="••••••••" /></div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">🔹 Profile Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className={labelClass}>Bio / About</label><textarea className={inputClass + " resize-none"} rows={3} maxLength={1000} value={formData.bio || ''} onChange={e => handleField('bio', e.target.value)} placeholder="Write a short introduction about yourself..." /></div>
            <div><label className={labelClass}>City</label><input className={inputClass} value={formData.location?.city || (typeof formData.location === 'string' ? formData.location : '')} onChange={e => handleNestedField('location.city', e.target.value)} placeholder="e.g. Indore" /></div>
            <div><label className={labelClass}>Country</label><input className={inputClass} value={formData.location?.country || ''} onChange={e => handleNestedField('location.country', e.target.value)} placeholder="e.g. India" /></div>
          </div>
        </div>
      )}

      {/* Step 2: Category & Professional */}
      {step === 2 && (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔹 {role === 'artist' ? 'Artist' : 'Influencer'} Specific Details</h3>
          <div><label className={labelClass}>Niche / Category *</label>
            <div className="flex flex-wrap gap-2">
              {niches.map(n => (
                <button key={n} type="button" onClick={() => handleField('niche', n)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${formData.niche === n ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">🔹 Professional Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Experience</label>
              <select className={inputClass} value={formData.experience || ''} onChange={e => handleField('experience', e.target.value)}>
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option><option value="1-3">1-3 years</option>
                <option value="3-5">3-5 years</option><option value="5-10">5-10 years</option><option value="10+">10+ years</option>
              </select>
            </div>
            <div><label className={labelClass}>Pricing / Charges (₹)</label><input className={inputClass} type="number" value={formData.pricing?.collaborationCharges || formData.budget || ''} onChange={e => handleNestedField('pricing.collaborationCharges', e.target.value)} placeholder="e.g. 5000" /></div>
            <div className="sm:col-span-2"><label className={labelClass}>Previous Collaborations</label><textarea className={inputClass + " resize-none"} rows={2} value={formData.previousCollaborations || ''} onChange={e => handleField('previousCollaborations', e.target.value)} placeholder="List notable collaborations..." /></div>
            <div><label className={labelClass}>Availability</label>
              <div className="flex gap-3">
                {['available', 'busy'].map(a => (
                  <button key={a} type="button" onClick={() => handleField('availability', a)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${formData.availability === a ? (a === 'available' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700') : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    {a === 'available' ? '🟢 Available' : '🔴 Busy'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">🔹 Audience & Reach</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelClass}>Audience Age Group</label><input className={inputClass} value={formData.audienceType?.ageGroup || ''} onChange={e => handleNestedField('audienceType.ageGroup', e.target.value)} placeholder="e.g. 18-35" /></div>
            <div><label className={labelClass}>Audience Region</label><input className={inputClass} value={formData.audienceType?.region || ''} onChange={e => handleNestedField('audienceType.region', e.target.value)} placeholder="e.g. Pan India" /></div>
          </div>
        </div>
      )}

      {/* Step 3: Social & Portfolio */}
      {step === 3 && (
        <div className="space-y-5">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔹 Social Media Platforms</h3>
          <div className="space-y-4">
            {PLATFORM_LIST.map(platform => {
              const pData = formData.platforms?.[platform] || {};
              return (
                <div key={platform} className={`rounded-xl border transition-all ${pData.hasAccount ? 'border-brand-200 bg-brand-50/30' : 'border-gray-200'} p-4`}>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input type="checkbox" checked={!!pData.hasAccount} onChange={() => handlePlatformToggle(platform)}
                      className="w-4 h-4 text-brand-500 rounded border-gray-300" />
                    <span className="font-semibold text-gray-800 capitalize text-sm">{platform}</span>
                  </label>
                  {pData.hasAccount && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-7">
                      <input className={inputClass} value={pData.url || ''} onChange={e => handleNestedField(`platforms.${platform}.url`, e.target.value)} placeholder="Profile URL" />
                      <input className={inputClass} type="number" value={pData.followers || ''} onChange={e => handleNestedField(`platforms.${platform}.followers`, e.target.value)} placeholder="Followers count" />
                      <input className={inputClass} value={pData.engagementRate || ''} onChange={e => handleNestedField(`platforms.${platform}.engagementRate`, e.target.value)} placeholder="Engagement rate %" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">🔹 Portfolio / Sample Work</h3>
          <p className="text-sm text-gray-500">Add links to your portfolio items or upload samples.</p>
          <div className="flex gap-2 mt-2">
            <input id="portfolio-input" className={inputClass + " flex-1"} placeholder="Paste a portfolio URL..." />
            <button type="button" onClick={() => {
              const input = document.getElementById('portfolio-input');
              if (input?.value) { handleField('portfolio', [...(formData.portfolio || []), input.value]); input.value = ''; }
            }} className="px-5 py-3 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-all shadow-md">+ Add</button>
          </div>
          {formData.portfolio?.length > 0 && (
            <div className="space-y-2 mt-3">
              {formData.portfolio.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="flex-1 truncate text-gray-600">{item}</span>
                  <button type="button" onClick={() => handleField('portfolio', formData.portfolio.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
        <button type="button" onClick={() => step > 1 ? setStep(step - 1) : onCancel()}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
          {step === 1 ? 'Cancel' : '← Previous'}
        </button>
        {step < 3 ? (
          <button type="button" onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-md">
            Next →
          </button>
        ) : (
          <button type="button" onClick={onSave}
            className="px-8 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-500 to-orange-500 hover:from-brand-600 hover:to-orange-600 transition-all shadow-lg">
            💾 Save Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileEditForm;
