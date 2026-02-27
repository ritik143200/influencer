import { useState, useEffect, useRef } from 'react';
import { artists } from '../data/mockData';
import ArtistCard from '../components/ArtistCard';

// Categories data
const allCategoriesData = {
  singers: {
    name: 'Singers',
    icon: '🎤',
    color: 'from-purple-500 to-pink-600',
    subcategories: {
      classical: { name: 'Classical', icon: '🎵', items: ['Hindustani', 'Carnatic', 'Bhajan', 'Ghazal', 'Shabad'] },
      bollywood: { name: 'Bollywood', icon: '🎬', items: ['Playback', 'Sufi', 'Romantic', 'Item Numbers', 'Folk'] },
      western: { name: 'Western', icon: '🎸', items: ['Pop', 'Rock', 'Jazz', 'Blues', 'Country'] },
      devotional: { name: 'Devotional', icon: '🙏', items: ['Bhajan', 'Kirtan', 'Aarti', 'Chalisa', 'Mantra'] }
    }
  },
  dancers: {
    name: 'Dancers',
    icon: '💃',
    color: 'from-pink-500 to-rose-600',
    subcategories: {
      classical: { name: 'Classical', icon: '🎭', items: ['Bharatanatyam', 'Kathak', 'Odissi', 'Kuchipudi', 'Manipuri'] },
      bollywood: { name: 'Bollywood', icon: '🎬', items: ['Bollywood', 'Contemporary', 'Fusion', 'Item Numbers'] },
      folk: { name: 'Folk', icon: '🪘', items: ['Bhangra', 'Garba', 'Ghoomar', 'Lavani', 'Bihu'] },
      western: { name: 'Western', icon: '🎭', items: ['Hip-Hop', 'Contemporary', 'Jazz', 'Ballet', 'Salsa'] }
    }
  },
  musicians: {
    name: 'Musicians',
    icon: '🎵',
    color: 'from-indigo-500 to-purple-600',
    subcategories: {
      instrumental: { name: 'Instrumental', icon: '🎸', items: ['Guitar', 'Piano', 'Violin', 'Flute', 'Drums'] },
      classical: { name: 'Classical', icon: '🎻', items: ['Sitar', 'Tabla', 'Harmonium', 'Sarod', 'Santoor'] },
      western: { name: 'Western', icon: '🎺', items: ['Guitar', 'Piano', 'Drums', 'Bass', 'Saxophone'] }
    }
  },
  photographers: {
    name: 'Photographers',
    icon: '📸',
    color: 'from-blue-500 to-cyan-600',
    subcategories: {
      wedding: { name: 'Wedding', icon: '💒', items: ['Traditional', 'Candid', 'Pre-Wedding', 'Destination', 'Cinematic'] },
      portrait: { name: 'Portrait', icon: '👤', items: ['Professional', 'Family', 'Maternity', 'Newborn', 'Corporate'] },
  commercial: { name: 'Commercial', icon: '📷', items: ['Product', 'Fashion', 'Food', 'Architecture', 'Event'] }
    }
  },
  makeup_artists: {
    name: 'Makeup Artists',
    icon: '💄',
    color: 'from-pink-500 to-rose-600',
    subcategories: {
      bridal: { name: 'Bridal', icon: '👰', items: ['Traditional', 'Modern', 'HD', 'Airbrush', '3D'] },
      fashion: { name: 'Fashion', icon: '✨', items: ['Editorial', 'Runway', 'Commercial', 'Creative', 'Avant-Garde'] },
      special: { name: 'Special Effects', icon: '🎭', items: ['SFX', 'Prosthetic', 'Fantasy', 'Horror', 'Sci-Fi'] }
    }
  },
  decorators: {
    name: 'Decorators',
    icon: '🎨',
    color: 'from-amber-500 to-orange-600',
    subcategories: {
      wedding: { name: 'Wedding', icon: '💒', items: ['Mandap', 'Reception', 'Sangeet', 'Mehendi', 'Engagement'] },
      event: { name: 'Event', icon: '🎉', items: ['Corporate', 'Birthday', 'Anniversary', 'Theme', 'Festival'] },
  home: { name: 'Home', icon: '🏠', items: ['Living Room', 'Bedroom', 'Kitchen', 'Office', 'Garden'] }
    }
  },
  mehendi_artists: {
    name: 'Mehendi Artists',
    icon: '🌿',
    color: 'from-green-500 to-emerald-600',
    subcategories: {
      traditional: { name: 'Traditional', icon: '🪷', items: ['Indian', 'Arabic', 'Rajasthani', 'Marwari', 'Pakistani'] },
      modern: { name: 'Modern', icon: '✨', items: ['Contemporary', 'Fusion', 'Minimalist', 'Geometric', 'Abstract'] }
    }
  },
  videographers: {
    name: 'Videographers',
    icon: '🎥',
    color: 'from-red-500 to-pink-600',
    subcategories: {
      wedding: { name: 'Wedding', icon: '💒', items: ['Cinematic', 'Traditional', 'Drone', 'Highlight', 'Documentary'] },
      commercial: { name: 'Commercial', icon: '📹', items: ['Corporate', 'Advertisement', 'Product', 'Music Video', 'Documentary'] }
    }
  }
};

const CategoryPage = ({ config }) => {
  const { params, navigate } = useRouter();
  const searchQuery = params.search;
  const subcategory = params.subcategory;
  
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    location: '',
    minBudget: '',
    maxBudget: '',
    subcategory: 'all'
  });
  
  // Category data state
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
  
  // Initialize displayArtists with artists array
  let displayArtists = artists || [];
  let pageTitle = category?.name || 'Artists';
  let pageDescription = category?.count ? `${category.count.toLocaleString()} artists available` : 'Browse artists';

  // Fetch artists from MongoDB
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching artists from backend...');
        console.log('🌐 API URL: http://localhost:5001/api/artists');
        
        // Fetch from backend API
        const response = await fetch('http://localhost:5001/api/artists', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Response status:', response.status);
        
        const result = await response.json();
        
        console.log('📡 Full API Response:', result);
        
        if (response.ok && result.success) {
          const artistsData = result.artists || [];
          setArtists(artistsData);
          console.log('✅ Artists fetched successfully:', artistsData.length, 'artists');
        } else {
          throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
      } catch (err) {
        console.error('❌ Error fetching artists:', err);
        setError(err.message);
        
        // Fallback to mock data if API fails
        try {
          console.log('🔄 Using mock data fallback...');
          setArtists(artists || []);
        } catch (mockErr) {
          console.error('❌ Error loading mock data:', mockErr);
          setArtists([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Filter artists based on filters state
  useEffect(() => {
    let filtered = [...artists];
    
    // Location filter
    if (filters.location) {
      filtered = filtered.filter(artist => 
        artist.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Budget range filter
    if (filters.minBudget || filters.maxBudget) {
      filtered = filtered.filter(artist => {
        const artistPrice = artist.budget || 0;
        const minPrice = parseInt(filters.minBudget) || 0;
        const maxPrice = parseInt(filters.maxBudget) || Infinity;
        
        return artistPrice >= minPrice && artistPrice <= maxPrice;
      });
    }
    
    // Subcategory filter
    if (filters.subcategory && filters.subcategory !== 'all') {
      filtered = filtered.filter(artist => 
        artist.subcategory === filters.subcategory || 
        artist.skills?.includes(filters.subcategory)
      );
    }
    
    displayArtists = filtered;
  }, [artists, filters]);

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading artists...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load artists</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      minBudget: '',
      maxBudget: '',
      subcategory: 'all'
    });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Category selection handler
  const handleCategorySelect = (categoryKey) => {
    if (allCategoriesData[categoryKey]) {
      setSelectedCategoryData(allCategoriesData[categoryKey]);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (option) => {
    setSelectedSubcategory(option.label);
    setFilters(prev => ({ ...prev, subcategory: option.value }));
  };

  // Default category for demo
  const category = allCategoriesData.dancers;

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate('home')}
            className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl shadow-lg`}>
            {category.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: config.text_color }}>{pageTitle}</h1>
            <p className="text-gray-500">{pageDescription}</p>
          </div>
        </div>

        {/* Flipkart-Style Layout */}
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              {/* Filter Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                  {(filters.location || filters.minBudget || filters.maxBudget || filters.subcategory !== 'all') && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-6">
                {/* Category Selection */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                  <div className="space-y-2">
                    {Object.entries(allCategoriesData).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => handleCategorySelect(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          selectedCategoryData?.name === cat.name
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{cat.icon}</span>
                          <span className="text-sm font-medium">{cat.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subcategory Selection */}
                {selectedCategoryData?.subcategories && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Select Style</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {Object.entries(selectedCategoryData.subcategories).map(([key, subcat]) => (
                        <div key={key} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{subcat.icon}</span>
                              <span className="text-sm font-medium text-gray-900">{subcat.name}</span>
                              <span className="text-xs text-gray-500">({subcat.items.length} styles)</span>
                            </div>
                          </div>
                          <div className="p-2">
                            {subcat.items.map((item, index) => (
                              <button
                                key={index}
                                onClick={() => handleSubcategorySelect({ 
                                  label: item, 
                                  value: item,
                                  icon: subcat.icon 
                                })}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  selectedSubcategory === item || filters.subcategory === item
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Location</h4>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => updateFilter('location', e.target.value)}
                      placeholder="Search by city or area..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Budget Range</h4>
                  <p className="text-xs text-gray-500 mb-2">Per event</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        value={filters.minBudget}
                        onChange={(e) => updateFilter('minBudget', e.target.value)}
                        placeholder="Min"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        value={filters.maxBudget}
                        onChange={(e) => updateFilter('maxBudget', e.target.value)}
                        placeholder="Max"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Specific Skills */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Specific Skills</h4>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={filters.skill || ''}
                      onChange={(e) => updateFilter('skill', e.target.value)}
                      placeholder="e.g., Classical, Bollywood..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Artists Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
                  <p className="text-sm text-gray-600">{pageDescription}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Showing {displayArtists.length} results
                  </span>
                  <select className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Relevance</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Rating: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Artists Grid */}
            {displayArtists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayArtists.map((artist, index) => (
                  <div 
                    key={artist._id || artist.id || index}
                    className="animate-fadeIn"
                  >
                    <ArtistCard artist={artist} config={config} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
                <p className="text-gray-600 mb-4">
                  No artists found matching your criteria
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
