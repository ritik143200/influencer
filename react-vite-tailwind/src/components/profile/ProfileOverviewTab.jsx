import React from 'react';

const InfoCard = ({ icon, label, value, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-2xl border ${colors[color]} transition-all hover:shadow-md`}>
      <div className="text-lg mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-sm mt-0.5 break-words">{value || <span className="italic opacity-50">Not provided</span>}</p>
      </div>
    </div>
  );
};

const ProfileOverviewTab = ({ formData }) => {
  const platforms = formData.platforms || {};
  const activePlatforms = Object.entries(platforms).filter(([, d]) => d.hasAccount && d.url);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Bio Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">📝</span>
          About
        </h3>
        <p className="text-gray-600 leading-relaxed">{formData.bio || 'No bio added yet. Tell the world about yourself!'}</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <InfoCard icon="📧" label="Email" value={formData.email} color="blue" />
        <InfoCard icon="📱" label="Phone" value={formData.phone} color="green" />
        <InfoCard icon="🎯" label="Category / Niche" value={formData.niche || formData.category} color="brand" />
        <InfoCard icon="⏳" label="Experience" value={formData.experience} color="purple" />
        <InfoCard icon="💰" label="Pricing" value={formData.pricing?.collaborationCharges ? `₹${formData.pricing.collaborationCharges}` : (formData.budget ? `₹${formData.budget}` : null)} color="orange" />
        <InfoCard icon="📊" label="Availability" value={formData.availability === 'available' ? '🟢 Available' : '🔴 Busy'} color="green" />
        <InfoCard icon="👥" label="Audience" value={formData.audienceType?.ageGroup || 'All ages'} color="pink" />
        <InfoCard icon="🌍" label="Audience Region" value={formData.audienceType?.region || 'Global'} color="blue" />
      </div>

      {/* Social Platforms */}
      {activePlatforms.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">🔗</span>
            Connected Platforms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePlatforms.map(([platform, data]) => (
              <a key={platform} href={data.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-100 to-purple-100 flex items-center justify-center font-bold text-brand-600 text-sm capitalize">
                  {platform.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 capitalize text-sm">{platform}</p>
                  <p className="text-xs text-gray-500 truncate">{data.followers ? `${data.followers} followers` : data.url}</p>
                </div>
                {data.engagementRate && (
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-semibold">{data.engagementRate}% ER</span>
                )}
                <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Professional Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">💼</span>
          Professional Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Experience</p>
            <p className="text-gray-800 font-medium">{formData.experience || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Collaborations</p>
            <p className="text-gray-800 font-medium">{formData.previousCollaborations || 'None listed'}</p>
          </div>
          {formData.skills && formData.skills.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-xs font-semibold border border-brand-100">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Preview */}
      {formData.portfolio && formData.portfolio.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">🎨</span>
            Portfolio
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {formData.portfolio.slice(0, 6).map((item, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:shadow-lg transition-shadow">
                {typeof item === 'string' && (item.startsWith('http') || item.startsWith('/')) ? (
                  <img src={item} alt={`Portfolio ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-2 text-center">{item}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverviewTab;
