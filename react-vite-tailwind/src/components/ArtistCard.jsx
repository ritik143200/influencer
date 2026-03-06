import { memo, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import ArtistInquiry from './ArtistInquiry';

const ArtistCard = ({ artist, config, fullWidth = false }) => {
  const { navigate } = useRouter();
  const { isAuthenticated } = useAuth();
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  const normalizeNumber = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  // Handle both backend and mock data structures
  const artistName = artist.fullName ||
    `${artist.firstName || ''} ${artist.lastName || ''}`.trim() ||
    artist.name ||
    'Artist Name';
  const artistSpecialty = artist.subcategory || artist.specialty || artist.skills?.[0] || 'Professional Artist';
  const artistRating = normalizeNumber(artist.rating?.average ?? artist.rating ?? 0);
  const artistReviews = artist.rating?.count || artist.reviews || 0;

  // Enhanced budget handling
  const budgetMin = artist.budgetMin ? (typeof artist.budgetMin === 'string' ? parseInt(artist.budgetMin) : artist.budgetMin) : null;
  const budgetMax = artist.budgetMax ? (typeof artist.budgetMax === 'string' ? parseInt(artist.budgetMax) : artist.budgetMax) : null;
  const budget = artist.budget ? (typeof artist.budget === 'string' ? parseInt(artist.budget) : artist.budget) : null;

  const artistPrice = budgetMin && budgetMax
    ? `₹${budgetMin.toLocaleString()} - ₹${budgetMax.toLocaleString()}`
    : budgetMin && !budgetMax
      ? `Starting from ₹${budgetMin.toLocaleString()}`
      : budgetMax && !budgetMin
        ? `Upto ₹${budgetMax.toLocaleString()}`
        : budget
          ? `₹${budget.toLocaleString()}`
          : artist.price || 'Price on request';

  // Improved image handling
  const artistImage = artist.profileImage || artist.image || 'https://picsum.photos/seed/artist-default/400/400.jpg';
  const isImageURL = typeof artistImage === 'string' && (
    artistImage.startsWith('http') ||
    artistImage.startsWith('/api/') ||
    artistImage.startsWith('data:') ||
    artistImage.startsWith('blob:')
  );

  const artistLocation = artist.location || 'Location not specified';
  const isVerified = artist.verificationStatus === 'verified' || artist.verified;

  // Category information
  const artistCategory = artist.category || artist.categoryName || 'Artist';
  const artistSubcategory = artist.subcategory || artist.specialty || 'Professional';
  const artistGenre = artist.genre || artist.type || '';

  // Ensure config has default values
  const themeConfig = {
    primary_color: config?.primary_color || '#ee7711',
    secondary_color: config?.secondary_color || '#ee7711',
    primary_action: config?.primary_action || '#ee7711',
    success_color: config?.success_color || '#ee7711',
    warning_color: config?.warning_color || '#f59e0b',
    text_primary: config?.text_primary || '#1f2937',
    text_secondary: config?.text_secondary || '#6b7280',
    text_muted: config?.text_muted || '#9ca3af',
    card_background: config?.card_background || '#ffffff',
    surface_color: config?.surface_color || '#ffffff',
  };

  const handleInquiryClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('auth');
      return;
    }
    setShowInquiryModal(true);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    navigate('artist', { artistId: artist._id || artist.id, artist });
  };

  // Full width layout (row-wise)
  if (fullWidth) {
    return (
      <>
        <div
          onClick={handleProfileClick}
          className="w-full min-w-0 max-w-full overflow-x-hidden rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 hover:shadow-lg hover:shadow-orange-500/10 transition-[box-shadow,border-color] duration-300 cursor-pointer hover:border-orange-200"
          style={{ backgroundColor: themeConfig.surface_color }}
        >
          <div className="w-full min-w-0 flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap md:items-start md:gap-6 lg:gap-8">
            {/* Artist Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0 w-fit">
              <div className="relative group">
                <div className="relative w-[120px] sm:w-[140px]" style={{ aspectRatio: '1/1.54' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner" style={{ backgroundColor: themeConfig.surface_color }}>
                    {isImageURL ? (
                      <img
                        src={artistImage}
                        alt={artistName}
                        className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center" style={{ display: isImageURL ? 'none' : 'flex' }}>
                      <span className="text-4xl sm:text-5xl text-gray-400">👤</span>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-2">
                  {isVerified && (
                    <div className="w-8 h-8 text-white rounded-full flex items-center justify-center shadow-md flex-shrink-0" style={{ backgroundColor: themeConfig.primary_action }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {artist.trending && (
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-xs">🔥</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Artist Info */}
            <div className="flex-1 min-w-0 md:pr-0 mt-4 md:mt-0">
              {/* Category Breadcrumb */}
              <div className="flex items-center gap-2 mb-3 flex-wrap max-w-full">
                <span className="px-3 py-1 text-white text-xs font-semibold rounded-full flex-shrink-0" style={{ backgroundColor: themeConfig.primary_action }}>
                  {artistCategory}
                </span>
                <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="px-3 py-1 text-xs font-semibold rounded-full border flex-shrink-0" style={{ backgroundColor: themeConfig.surface_color, color: themeConfig.text_primary, borderColor: themeConfig.primary_action }}>
                  {artistSubcategory}
                </span>
                {artistGenre && (
                  <>
                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full flex-shrink-0">
                      {artistGenre}
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-col md:flex-row md:flex-wrap lg:flex-nowrap md:items-start md:gap-0 mb-4 min-w-0">
                <div className="flex-1 min-w-0 md:pr-6">
                  <div className="flex flex-col sm:flex-row sm:flex-nowrap sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-xl sm:text-2xl font-bold truncate flex-1 min-w-0" style={{ color: themeConfig.text_primary }}>{artistName}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isVerified && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 border flex-shrink-0" style={{ backgroundColor: themeConfig.surface_color, color: themeConfig.primary_action, borderColor: themeConfig.primary_action }}>
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                      {artist.trending && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full flex items-center gap-1 flex-shrink-0">
                          🔥 Trending
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-base sm:text-lg mb-3 font-medium" style={{ color: themeConfig.primary_action }}>{artistSpecialty}</p>

                  {/* Sub-options/Styles */}
                  {artistSubcategory && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">Specializations</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-50 to-gray-50 border border-orange-100 text-orange-700 text-xs font-medium rounded-md flex items-center gap-1 flex-shrink-0">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                          {artistSubcategory}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-50 to-gray-50 border border-orange-100 text-orange-700 text-xs font-medium rounded-md flex items-center gap-1 flex-shrink-0">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0"></span>
                          Professional
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-yellow-500 flex-shrink-0">⭐</span>
                        <span className="font-bold text-gray-900 flex-shrink-0">{artistRating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-500 flex-shrink-0">({artistReviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 min-w-0">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate min-w-0">{artistLocation}</span>
                    </div>
                    {artist.experience && (
                      <div className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="flex-shrink-0">{artist.experience} years</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Action */}
                <div className="w-full mt-4 md:mt-0 md:w-full lg:w-[220px] lg:flex-shrink-0 md:self-start min-w-0 ml-0 lg:ml-6">
                  <div className="text-left md:text-right mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Starting From</p>
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600 break-words max-w-full" style={{ color: themeConfig.primary_color }}>
                      {artistPrice}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <button
                      onClick={handleProfileClick}
                      className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-sm hover:shadow-md flex-shrink-0"
                      style={{ background: `linear-gradient(135deg, ${themeConfig.primary_action}, ${themeConfig.primary_color})` }}
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleInquiryClick}
                      className="w-full px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-xl hover:bg-orange-50 transition-colors font-medium flex-shrink-0"
                      style={{ borderColor: themeConfig.primary_action, color: themeConfig.primary_action }}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio/Description */}
              {artist.bio && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl w-full">
                  <p className="text-sm text-gray-600 line-clamp-2">{artist.bio}</p>
                </div>
              )}

              {/* Stats Row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-8 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-sm text-gray-600 flex-shrink-0">Available for bookings</span>
                </div>
                {artist.completedEvents && (
                  <div className="text-sm text-gray-600 flex-shrink-0">
                    <span className="font-semibold text-gray-900 flex-shrink-0">{artist.completedEvents}</span> events completed
                  </div>
                )}
                {artist.responseTime && (
                  <div className="text-sm text-gray-600 flex-shrink-0">
                    Response time: <span className="font-semibold text-gray-900 flex-shrink-0">{artist.responseTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showInquiryModal && (
          <ArtistInquiry
            isOpen={showInquiryModal}
            onClose={() => setShowInquiryModal(false)}
            artist={artist}
            config={config}
          />
        )}
      </>
    );
  }

  // Original card layout (grid)
  return (
    <>
      <div
        onClick={handleProfileClick}
        className="flex-shrink-0 w-64 lg:w-72 rounded-2xl overflow-hidden shadow-lg card-hover cursor-pointer"
        style={{ backgroundColor: themeConfig.surface_color }}
      >
        <div className="relative" style={{ aspectRatio: '1/1.54' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-gray-100 flex items-center justify-center overflow-hidden" style={{ backgroundColor: themeConfig.surface_color }}>
            {isImageURL ? (
              <img
                src={artistImage}
                alt={artistName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center" style={{ display: isImageURL ? 'none' : 'flex' }}>
              <span className="text-6xl">👤</span>
            </div>
          </div>
          {artist.trending && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-semibold" style={{ backgroundColor: themeConfig.primary_action }}>
              🔥 Trending
            </div>
          )}
          {isVerified && (
            <div className="absolute top-3 right-3 px-2 py-1 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: themeConfig.primary_action }}>
              ✓ Verified
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col h-[200px]">
          <h3 className="font-bold mb-1 truncate" style={{ color: themeConfig.text_primary }}>{artistName}</h3>
          <p className="text-sm mb-3 truncate" style={{ color: themeConfig.text_secondary }}>{artistSpecialty}</p>

          <div className="flex items-center justify-between mb-auto">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500 text-sm">⭐</span>
              <span className="font-bold text-sm" style={{ color: themeConfig.text_primary }}>{artistRating.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({artistReviews})</span>
            </div>
            <span className="text-lg font-bold" style={{ color: themeConfig.primary_action }}>
              {artistPrice}
            </span>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={handleProfileClick}
              className="w-full py-2 rounded-lg font-bold text-sm transition-all shadow-md transform hover:scale-[1.02]"
              style={{
                backgroundColor: themeConfig.primary_action,
                color: 'white',
              }}
            >
              Profile
            </button>
            <button
              onClick={handleInquiryClick}
              className="w-full py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-[1.02]"
              style={{
                border: `2px solid ${themeConfig.primary_action}`,
                color: themeConfig.primary_action,
                backgroundColor: 'transparent',
              }}
            >
              Contact
            </button>
          </div>
        </div>
      </div>

      {showInquiryModal && (
        <ArtistInquiry
          isOpen={showInquiryModal}
          onClose={() => setShowInquiryModal(false)}
          artist={artist}
          config={config}
        />
      )}
    </>
  );
};

export default memo(ArtistCard);
