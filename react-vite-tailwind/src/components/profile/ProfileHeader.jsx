import React, { useRef } from 'react';
import { Instagram, Youtube, Facebook } from 'lucide-react';

const ProfileHeader = ({ formData, isEditing, onImageChange, onEditToggle }) => {
  const fileInputRef = useRef(null);
  const role = formData.role || 'user';

  const roleConfig = {
    artist: { label: 'Artist', gradient: 'from-brand-500 to-orange-600', badge: 'bg-brand-500' },
    influencer: { label: 'Influencer', gradient: 'from-purple-500 to-pink-600', badge: 'bg-purple-500' },
    user: { label: 'User', gradient: 'from-blue-500 to-cyan-600', badge: 'bg-blue-500' },
    admin: { label: 'Admin', gradient: 'from-red-500 to-rose-600', badge: 'bg-red-500' }
  };
  const rc = roleConfig[role] || roleConfig.user;

  // Social links: support both formData.socialLinks and formData.platforms
  const socialLinks = {
    instagram:
      formData.socialLinks?.instagram || formData.platforms?.instagram?.url || '',
    youtube:
      formData.socialLinks?.youtube || formData.platforms?.youtube?.url || '',
    facebook:
      formData.socialLinks?.facebook || formData.platforms?.facebook?.url || '',
  };

  return (
    <div className="relative mb-8 animate-fadeIn">
      {/* Cover Banner */}
      <div className={`h-48 sm:h-56 rounded-3xl bg-gradient-to-r ${rc.gradient} relative overflow-hidden shadow-xl`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-4 right-12 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-white/15 blur-xl" />
        </div>
        <div className="absolute bottom-4 right-6 flex gap-2">
          <span className={`${rc.badge} text-white text-xs px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-lg`}>
            {rc.label}
          </span>
          {formData.verificationStatus === 'verified' && (
            <span className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1 shadow-lg">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Profile Picture */}
      <div className="absolute top-32 sm:top-40 left-8 sm:left-12 z-10">
        <div className="relative group">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-purple-100">
            {formData.profileImage || formData.profilePicture ? (
              <img src={formData.profileImage || formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl text-gray-300">👤</span>
              </div>
            )}
          </div>
          {isEditing && (
            <button onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-9 h-9 bg-brand-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-brand-600 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
          <span className={`absolute top-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow ${formData.availability === 'available' ? 'bg-green-400' : 'bg-gray-400'}`} />
        </div>
      </div>

      {/* Name & Quick Info */}
      <div className="pt-20 px-4 sm:px-12 flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            {formData.firstName || formData.name || 'Your Name'} {formData.lastName || ''}
          </h1>
          <p className="text-gray-500 text-sm mt-1 flex flex-wrap items-center gap-3">
            {formData.username && <span className="flex items-center gap-1">@{formData.username}</span>}
            {(formData.location?.city || formData.location) && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {typeof formData.location === 'string' ? formData.location : `${formData.location?.city || ''}${formData.location?.country ? ', ' + formData.location.country : ''}`}
              </span>
            )}
            {formData.niche && <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded text-xs font-semibold">{formData.niche}</span>}
          </p>
          {/* Social Media Icons */}
          <div className="flex gap-3 mt-3">
            {socialLinks.instagram && socialLinks.instagram.startsWith('http') && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#fceef5] flex items-center justify-center text-[#e1306c] hover:scale-110 transition-transform shadow">
                <Instagram size={20} />
              </a>
            )}
            {socialLinks.youtube && socialLinks.youtube.startsWith('http') && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#feecec] flex items-center justify-center text-[#ff0000] hover:scale-110 transition-transform shadow">
                <Youtube size={20} />
              </a>
            )}
            {socialLinks.facebook && socialLinks.facebook.startsWith('http') && (
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-[#eef4fe] flex items-center justify-center text-[#1877f2] hover:scale-110 transition-transform shadow">
                <Facebook size={20} />
              </a>
            )}
          </div>
        </div>
        <button onClick={onEditToggle}
          className={`mt-4 sm:mt-0 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg ${isEditing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-brand-500 text-white hover:bg-brand-600'}`}>
          {isEditing ? '✕ Cancel' : '✎ Edit Profile'}
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
