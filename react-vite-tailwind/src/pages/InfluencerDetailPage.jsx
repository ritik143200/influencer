import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from '../contexts/RouterContext';

const InfluencerDetailPage = ({ config }) => {
  const { params, navigate } = useRouter();
  const influencerId = params?.id;
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  // Static featured profiles fallback (same data as TrendingInfluencers)
  const featuredProfiles = {
    'justayushi__': { fullName: 'Ayushi Sikarwar', bio: 'Foodie | adventurer | explorer🚀 Follow me for mouth watering eats, hidden gems, local insights and travel inspiration 📍INDORE 📩 justayushi22@gmail.com', category: 'Food & Travel', profileImage: '/profiles/584350929_18019297550792574_1321395050260371907_n.jpg', socialLinks: { instagram: 'https://www.instagram.com/justayushi__/' }, location: 'Indore', verificationStatus: 'pending' },
    'unscripted.pooja': { fullName: 'Pooja Patel', bio: 'Digital content creator sharing lifestyle, fashion, and daily vlogs', category: 'Digital Creator', profileImage: '/profiles/469720261_881068083858099_1445535093418220669_n.jpg', socialLinks: { instagram: 'https://www.instagram.com/unscripted.pooja/' }, location: 'India', verificationStatus: 'verified' },
    'drx_akshat_mishra': { fullName: 'Drx Akshat Mishra', bio: 'Sports enthusiast & voice artist creating engaging content', category: 'Sports & Voice', profileImage: '/profiles/587307255_18335776141235669_2254666820855514781_n.jpg', socialLinks: { instagram: 'https://www.instagram.com/drx_akshat_mishra/' }, location: 'India', verificationStatus: 'verified' },
    'yourviikas': { fullName: 'Vikas Choudhary', bio: 'Relationship expert & emotional intelligence coach sharing valuable insights', category: 'Relationship & EI', profileImage: '/profiles/605220975_18521599786067256_6899526771075247176_n.jpg', socialLinks: { instagram: 'https://www.instagram.com/yourviikas/' }, location: 'India', verificationStatus: 'verified' },
    'indoreshorts': { fullName: 'Indore Shorts', bio: 'Showcasing the best of Indore city through short videos and local updates', category: 'Local City Page', profileImage: '/profiles/467582962_510159548650448_339588672127858553_n.jpg', socialLinks: { instagram: 'https://www.instagram.com/indoreshorts/' }, location: 'Indore', verificationStatus: 'verified' },
  };

  useEffect(() => {
    if (!influencerId) { setError('No influencer ID provided'); setLoading(false); return; }

    // Check if it's a featured profile (static handle) or a MongoDB ObjectId
    const isObjectId = /^[a-f\d]{24}$/i.test(influencerId);

    if (!isObjectId && featuredProfiles[influencerId]) {
      // Use static data for featured profiles
      setInfluencer(featuredProfiles[influencerId]);
      setLoading(false);
      return;
    }

    const fetchInfluencer = async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch(`${API_BASE_URL}/api/influencer/${influencerId}`);
        const data = await res.json();
        if (res.ok && data.success) { setInfluencer(data.data); }
        else throw new Error(data.message || 'Influencer not found');
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchInfluencer();
  }, [influencerId, API_BASE_URL]);

  useEffect(() => { if (!loading) { const t = setTimeout(() => setFadeIn(true), 50); return () => clearTimeout(t); } }, [loading]);

  const renderLocation = (loc) => {
    if (!loc) return 'Not specified';
    if (typeof loc === 'string') return loc;
    return [loc.city, loc.country].filter(Boolean).join(', ') || 'Not specified';
  };

  const getPortfolioImages = useCallback(() => {
    if (!influencer?.portfolio) return [];
    return influencer.portfolio.filter(item => typeof item === 'string' && (item.includes('cloudinary.com') || item.match(/\.(jpeg|jpg|gif|png|webp)$/i)));
  }, [influencer]);

  const primary = config?.primary_action || '#ee7711';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: config?.background_color || '#ffffff' }}>
      <div className="text-center">
        <div className="w-14 h-14 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center pt-20" style={{ backgroundColor: config?.background_color || '#ffffff' }}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('home')} className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105 shadow-lg" style={{ backgroundColor: primary }}>Go Home</button>
      </div>
    </div>
  );

  if (!influencer) return null;

  const displayName = influencer.fullName || [influencer.firstName, influencer.lastName].filter(Boolean).join(' ') || 'Influencer';
  const categories = influencer.niche?.length ? influencer.niche : influencer.categories?.length ? influencer.categories : influencer.category ? [influencer.category] : [];
  const portfolioImages = getPortfolioImages();
  const socialLinks = influencer.socialLinks || {};
  const platforms = influencer.platforms || {};
  const hasSocials = socialLinks.instagram || socialLinks.youtube || socialLinks.facebook || socialLinks.website;

  return (
    <div className="min-h-screen pb-16" style={{ backgroundColor: config?.background_color || '#ffffff' }}>
      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => setLightboxImage(null)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightboxImage} alt="Portfolio" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Top Navbar Spacer & Back Button */}
      <div className="max-w-[935px] mx-auto px-4 sm:px-6 pt-24 pb-6">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium transition-colors group">
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>

      <div className={`max-w-[935px] mx-auto px-4 sm:px-6 transition-all duration-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        
        {/* Profile Header (Instagram Style) */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 mb-12">
          {/* Avatar Left */}
          <div className="flex-shrink-0 flex justify-center sm:justify-start sm:w-1/3">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              {influencer.profileImage && influencer.profileImage !== 'https://picsum.photos/seed/artist-avatar/400/400.jpg' ? (
                <img src={influencer.profileImage} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl sm:text-5xl font-bold" style={{ color: primary, backgroundColor: `${primary}15` }}>
                  {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Info Right */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Top Row: Username & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <h2 className="text-xl sm:text-2xl font-normal text-gray-900 truncate flex items-center gap-2">
                {influencer.username ? influencer.username : displayName.replace(/\s+/g, '').toLowerCase()}
                {influencer.verificationStatus === 'verified' && (
                  <span className="text-blue-500" title="Verified">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => navigate('inquiry')} className="px-5 py-1.5 rounded-lg text-white font-semibold text-sm transition-all hover:opacity-90" style={{ backgroundColor: primary }}>
                  Hire Now
                </button>
                <button onClick={() => navigate('contact')} className="px-5 py-1.5 rounded-lg font-semibold text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors">
                  Contact
                </button>
              </div>
            </div>

            {/* Middle Row: Stats */}
            <div className="hidden sm:flex gap-8 mb-4">
              {influencer.completedEvents > 0 && (
                <div><span className="font-semibold text-gray-900">{influencer.completedEvents}</span> <span className="text-gray-600">events</span></div>
              )}
              {influencer.budget > 0 && !influencer.budgetMin && (
                <div><span className="font-semibold text-gray-900">₹{Number(influencer.budget).toLocaleString()}</span> <span className="text-gray-600">budget</span></div>
              )}
              {(influencer.budgetMin != null || influencer.budgetMax != null) && (
                <div><span className="font-semibold text-gray-900">₹{influencer.budgetMin ? Number(influencer.budgetMin).toLocaleString() : 0} - ₹{influencer.budgetMax ? Number(influencer.budgetMax).toLocaleString() : 'Any'}</span> <span className="text-gray-600">budget</span></div>
              )}
              {influencer.rating?.average > 0 && (
                <div><span className="font-semibold text-gray-900">⭐ {influencer.rating.average.toFixed(1)}</span> <span className="text-gray-600">rating</span></div>
              )}
            </div>

            {/* Bottom Row: Name, Category, Bio, Links */}
            <div>
              <h1 className="font-semibold text-gray-900">{displayName}</h1>
              {categories.length > 0 && (
                <p className="text-sm text-gray-500 mb-1">{categories.join(' • ')}</p>
              )}
              {influencer.bio && (
                <p className="text-sm text-gray-900 whitespace-pre-line mb-1">{influencer.bio}</p>
              )}
              <p className="text-sm text-gray-600 mb-2">📍 {renderLocation(influencer.location)}</p>

              {/* Mobile Stats (visible only on sm) */}
              <div className="flex sm:hidden gap-6 mt-4 mb-4 border-t border-b border-gray-200 py-3">
                 {influencer.completedEvents > 0 && (
                  <div className="flex flex-col items-center flex-1"><span className="font-semibold text-gray-900">{influencer.completedEvents}</span> <span className="text-xs text-gray-500">events</span></div>
                )}
                {influencer.budget > 0 && !influencer.budgetMin && (
                  <div className="flex flex-col items-center flex-1"><span className="font-semibold text-gray-900">₹{Number(influencer.budget).toLocaleString()}</span> <span className="text-xs text-gray-500">budget</span></div>
                )}
                {influencer.rating?.average > 0 && (
                  <div className="flex flex-col items-center flex-1"><span className="font-semibold text-gray-900">⭐ {influencer.rating.average.toFixed(1)}</span> <span className="text-xs text-gray-500">rating</span></div>
                )}
              </div>

              {hasSocials && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {(socialLinks.instagram || platforms.instagram?.url) && (
                    <a href={socialLinks.instagram || platforms.instagram?.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-900 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                      Instagram
                    </a>
                  )}
                  {(socialLinks.youtube || platforms.youtube?.url) && (
                    <a href={socialLinks.youtube || platforms.youtube?.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-900 bg-red-50 px-3 py-1 rounded hover:bg-red-100 transition-colors flex items-center gap-1">
                      YouTube
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-900 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                      Facebook
                    </a>
                  )}
                  {socialLinks.website && (
                    <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-900 bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 transition-colors flex items-center gap-1">
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-8 mb-8 flex justify-center">
          <div className="flex items-center gap-2 border-t border-gray-900 -mt-px pt-4 px-1">
            <svg aria-label="Posts" className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line><line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line></svg>
            <span className="text-xs font-semibold tracking-widest text-gray-900 uppercase">Portfolio</span>
          </div>
        </div>

        {/* Portfolio Gallery (Grid) */}
        {portfolioImages.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 sm:gap-6">
            {portfolioImages.map((img, i) => (
              <div key={i} onClick={() => setLightboxImage(img)} className="relative aspect-square bg-gray-100 cursor-pointer group">
                <img src={img} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-gray-900 mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">No Portfolio Yet</h2>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default InfluencerDetailPage;
