import React from 'react';

const InfoCard = ({ icon, label, value, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100'
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



    </div>
  );
};

export default ProfileOverviewTab;
