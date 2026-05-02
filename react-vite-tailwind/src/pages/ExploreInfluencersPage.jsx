import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import InfluencerCard from '../components/InfluencerCard';

const categoryOptions = {
  'influencer': [
    'Lifestyle',
    'UGC Creator',
    'Fashion',
    'Fitness',
    'Travel',
    'Food',
    'Tech',
    'Finance',
    'Gaming',
    'Education',
    'Motivation',
    'Spiritual',
    'Actor',
    'Comedian',
    'Model',
    'Filmmaker',
    'Historical',
    'Other'
  ],
  'celebrity': [
    'All Type'
  ],
  'city page': [
    'Food Pages',
    'Local City Pages',
    'State Pages'
  ],
  'meme page': [
    'Meme Pages',
    'Music Pages',
    'Celebrity Pages',
    'Motivation Pages',
    'Devotional Pages',
    'Media Pages',
    'Political Pages',
    'Other'
  ]
};

const ExploreInfluencersPage = ({ config }) => {
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [dbInfluencers, setDbInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 9;
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubCategory, searchQuery]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubCategory('All');
  }, [selectedCategory]);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.custom-dropdown')) {
        setIsCatOpen(false);
        setIsSubOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch both featured and regular influencers
        const [featRes, allRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/featured-profiles`),
          fetch(`${API_BASE_URL}/api/influencer`)
        ]);

        const featData = await featRes.json();
        const allData = await allRes.json();

        let combined = [];

        if (featRes.ok && featData.success) {
          combined = [...combined, ...featData.data.map(inf => ({
            id: inf._id,
            name: inf.name,
            image: inf.image,
            category: inf.category,
            followers: inf.followers || '0',
            posts: inf.posts || '0',
            budget: inf.budget,
            bio: inf.bio,
            verified: true,
            instagramLink: inf.socialLinks?.instagram || '',
            youtubeLink: inf.socialLinks?.youtube || '',
            isFeatured: true,
            subCategory: '' // FeaturedProfiles usually don't have subCategory
          }))];
        }

        if (allRes.ok && allData.success) {
          // Avoid duplicates if a featured influencer is also in regular list (though they are different collections)
          combined = [...combined, ...allData.data.map(inf => ({
            id: inf._id,
            name: inf.fullName || `${inf.firstName} ${inf.lastName}`,
            image: inf.profileImage,
            category: inf.category || inf.niche?.[0] || 'Influencer',
            subCategory: inf.subcategory || inf.subcategories?.[0] || '',
            followers: inf.followers || '0',
            posts: inf.posts || '0',
            budget: inf.budgetMin ? `₹${inf.budgetMin}` : '',
            bio: inf.bio,
            verified: inf.verificationStatus === 'verified',
            instagramLink: inf.socialLinks?.instagram || inf.platforms?.instagram?.url || '',
            youtubeLink: inf.socialLinks?.youtube || inf.platforms?.youtube?.url || '',
            isFeatured: false
          }))];
        }

        setDbInfluencers(combined);
      } catch (err) {
        console.error('Failed to fetch influencers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE_URL]);

  const visibleCategories = useMemo(() => {
    return ['All', ...Object.keys(categoryOptions)];
  }, []);

  const visibleSubCategories = useMemo(() => {
    if (selectedCategory === 'All') return ['All'];
    return ['All', ...(categoryOptions[selectedCategory.toLowerCase()] || [])];
  }, [selectedCategory]);

  const filteredInfluencers = useMemo(() => {
    return dbInfluencers.filter(i => {
      const matchesSearch = !searchQuery || 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.bio || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || 
        (i.category || '').toLowerCase() === selectedCategory.toLowerCase();
      
      const matchesSubCategory = selectedSubCategory === 'All' || 
        (i.subCategory || '').toLowerCase() === selectedSubCategory.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [dbInfluencers, selectedCategory, selectedSubCategory, searchQuery]);

  const totalPages = Math.ceil(filteredInfluencers.length / ITEMS_PER_PAGE);
  
  const paginatedInfluencers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInfluencers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInfluencers, currentPage]);

  const initials = (name) =>
    (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');

  return (
    <div className="min-h-screen pt-20" style={{ backgroundColor: config.background_color }}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-orange-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: config.text_color }}>
                Explore Top Influencers
              </h1>
              <p className="mt-2 text-gray-600">
                Browse a curated selection of top creators. Filter by category to keep the results clean and focused.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition-colors text-sm font-semibold"
              style={{ color: config.text_color }}
            >
              Back
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mt-8">
            <div className="relative flex-1 w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <input
                type="text"
                placeholder="Search influencers by name or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-white/70 backdrop-blur"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Category Dropdown */}
              <div className="custom-dropdown relative flex-1 md:w-56">
                <button
                  onClick={() => { setIsCatOpen(!isCatOpen); setIsSubOpen(false); }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur flex items-center justify-between font-semibold text-gray-700 hover:border-brand-500 transition-all"
                >
                  <span className="truncate">
                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                
                {isCatOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                    {visibleCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setIsCatOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors ${selectedCategory === cat ? 'text-brand-600 bg-brand-50' : 'text-gray-700'}`}
                      >
                        {cat === 'All' ? 'All Categories' : cat.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SubCategory Dropdown */}
              <div className="custom-dropdown relative flex-1 md:w-56">
                <button
                  onClick={() => { if (selectedCategory !== 'All') { setIsSubOpen(!isSubOpen); setIsCatOpen(false); } }}
                  disabled={selectedCategory === 'All'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur flex items-center justify-between font-semibold text-gray-700 hover:border-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {selectedSubCategory === 'All' ? 'All Sub-Categories' : selectedSubCategory}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${isSubOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>

                {isSubOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 max-h-60 overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                    {visibleSubCategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => { setSelectedSubCategory(sub); setIsSubOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 transition-colors ${selectedSubCategory === sub ? 'text-brand-600 bg-brand-50' : 'text-gray-700'}`}
                      >
                        {sub === 'All' ? 'All Sub-Categories' : sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {paginatedInfluencers.map(inf => (
                <InfluencerCard 
                  key={inf.id} 
                  p={inf} 
                  config={config} 
                  navigate={navigate} 
                  initials={initials} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all ${
                        currentPage === i + 1 
                          ? 'text-white shadow-md' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={currentPage === i + 1 ? { backgroundColor: config.primary_action } : {}}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}

        {!loading && filteredInfluencers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 font-medium">No influencers found for this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExploreInfluencersPage;
