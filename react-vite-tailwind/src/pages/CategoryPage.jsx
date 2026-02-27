import { useState, useEffect, useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
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
    subcategory: 'all',
    skill: '',
    sortBy: 'relevance'
  });
  
  // Category data state
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
  const [expandedCategory, setExpandedCategory] = useState(null); // Track which category dropdown is open
  
  // Display artists state
  const [displayArtists, setDisplayArtists] = useState([]);
  let pageTitle = 'Artists';
  let pageDescription = 'Browse artists';

  console.log('🔄 CategoryPage component mounted');
  console.log('📊 Initial state:', { loading, error, artistsCount: artists.length });

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
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Dynamic Filter-Based Artist Evaluation and Sorting
  useEffect(() => {
    let allArtists = [...artists];
    
    // Calculate relevance score for each artist based on ALL filters
    const scoredArtists = allArtists.map(artist => {
      let score = 0;
      let matchDetails = [];

      // Category Matching - Highest Priority (15 points exact)
      if (selectedCategoryData && artist.category && selectedCategoryData.name && artist.category.toLowerCase() === selectedCategoryData.name.toLowerCase()) {
        score += 15;
        matchDetails.push('Exact category match');
      }

      // Subcategory Matching - Higher Priority (12 points exact, 8 points skills)
      if (filters.subcategory && filters.subcategory !== 'all') {
        if (artist.subcategory === filters.subcategory) {
          score += 12;
          matchDetails.push('Exact subcategory match');
        }
        if (artist.skills?.includes(filters.subcategory)) {
          score += 8;
          matchDetails.push('Skills match');
        }
        if (artist.specialty === filters.subcategory) {
          score += 8;
          matchDetails.push('Specialty match');
        }
      }

      // Location Matching - High Priority (10 points exact, 5 points partial)
      if (filters.location) {
        const searchLocation = filters.location.toLowerCase();
        const artistLocation = artist.location?.toLowerCase() || '';

        if (artistLocation === searchLocation) {
          score += 10;
          matchDetails.push('Exact location match');
        } else if (artistLocation.includes(searchLocation)) {
          score += 5;
          matchDetails.push('Partial location match');
        }
      }

      // Skills Matching - Medium Priority (7 points exact, 4 points partial)
      if (filters.skill) {
        const searchSkill = filters.skill.toLowerCase();

        // Exact skill match
        if (artist.skills?.some(skill => skill.toLowerCase() === searchSkill)) {
          score += 7;
          matchDetails.push('Exact skill match');
        }
        // Partial skill match
        else if (artist.skills?.some(skill => skill.toLowerCase().includes(searchSkill))) {
          score += 4;
          matchDetails.push('Partial skill match');
        }
        // Specialty exact match
        else if (artist.specialty?.toLowerCase() === searchSkill) {
          score += 5;
          matchDetails.push('Specialty match');
        }
        // Specialty partial match
        else if (artist.specialty?.toLowerCase().includes(searchSkill)) {
          score += 3;
          matchDetails.push('Partial specialty match');
        }
        // Category exact match
        else if (artist.category?.toLowerCase() === searchSkill) {
          score += 4;
          matchDetails.push('Category match');
        }
        // Category partial match
        else if (artist.category?.toLowerCase().includes(searchSkill)) {
          score += 2;
          matchDetails.push('Partial category match');
        }
      }

      // Budget Range Matching - Medium Priority (up to 5 points)
      if (filters.minBudget || filters.maxBudget) {
        const artistPrice = artist.budget || 0;
        const minPrice = parseInt(filters.minBudget) || 0;
        const maxPrice = parseInt(filters.maxBudget) || Infinity;

        if (artistPrice >= minPrice && artistPrice <= maxPrice) {
          const rangeMid = (minPrice + maxPrice) / 2;
          const deviation = Math.abs(artistPrice - rangeMid);
          const budgetScore = Math.max(1, 5 - (deviation / 10000));
          score += budgetScore;
          matchDetails.push(`Budget match (${budgetScore.toFixed(1)} points)`);
        }
      }

      // Quality Bonuses
      if (artist.verificationStatus === 'verified') {
        score += 2;
        matchDetails.push('Verified artist');
      }
      if (artist.trending) {
        score += 1;
        matchDetails.push('Trending artist');
      }

      return {
        ...artist,
        relevanceScore: score,
        matchDetails: matchDetails
      };
    });
    
    // If a category is selected, group and sort artists by category match first
    if (selectedCategoryData && selectedCategoryData.name) {
      const categoryName = selectedCategoryData.name.toLowerCase();
      scoredArtists.sort((a, b) => {
        const aCat = (a.category || '').toLowerCase() === categoryName ? 1 : 0;
        const bCat = (b.category || '').toLowerCase() === categoryName ? 1 : 0;
        if (bCat !== aCat) return bCat - aCat; // Group matching category at top
        // Within group, sort by relevance, then rating, then completed events
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        const ratingA = a.rating?.average || a.rating || 0;
        const ratingB = b.rating?.average || b.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        const eventsA = a.completedEvents || 0;
        const eventsB = b.completedEvents || 0;
        return eventsB - eventsA;
      });
    } else {
      // Default: sort by relevance, then rating, then completed events
      scoredArtists.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        const ratingA = a.rating?.average || a.rating || 0;
        const ratingB = b.rating?.average || b.rating || 0;
        if (ratingB !== ratingA) return ratingB - ratingA;
        const eventsA = a.completedEvents || 0;
        const eventsB = b.completedEvents || 0;
        return eventsB - eventsA;
      });
    }
    
    // Apply alternative sorting if specifically selected
    if (filters.sortBy === 'price-low') {
      scoredArtists.sort((a, b) => (a.budget || 0) - (b.budget || 0));
    } else if (filters.sortBy === 'price-high') {
      scoredArtists.sort((a, b) => (b.budget || 0) - (a.budget || 0));
    } else if (filters.sortBy === 'rating') {
      scoredArtists.sort((a, b) => {
        const ratingA = a.rating?.average || a.rating || 0;
        const ratingB = b.rating?.average || b.rating || 0;
        
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        
        const reviewsA = a.rating?.count || a.reviews || 0;
        const reviewsB = b.rating?.count || b.reviews || 0;
        return reviewsB - reviewsA;
      });
    } else if (filters.sortBy === 'experience') {
      scoredArtists.sort((a, b) => {
        const experienceOrder = { '0-1': 0, '1-3': 1, '3-5': 2, '5-10': 3, '10+': 4 };
        const expA = experienceOrder[a.experience] || 0;
        const expB = experienceOrder[b.experience] || 0;
        
        if (expA !== expB) {
          return expB - expA;
        }
        
        const eventsA = a.completedEvents || 0;
        const eventsB = b.completedEvents || 0;
        return eventsB - eventsA;
      });
    }
    
    // Log scoring details for debugging
    if (filters.location || filters.skill || filters.subcategory !== 'all' || filters.minBudget || filters.maxBudget) {
      console.log('🎯 Filter Results - Top 5 Artists:');
      scoredArtists.slice(0, 5).forEach((artist, index) => {
        console.log(`${index + 1}. ${artist.fullName} - Score: ${artist.relevanceScore} - ${artist.matchDetails.join(', ')}`);
      });
    }
    
    setDisplayArtists(scoredArtists);
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
      subcategory: 'all',
      skill: '',
      sortBy: 'relevance'
    });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Category selection handler
  const handleCategorySelect = (categoryKey) => {
    if (allCategoriesData[categoryKey]) {
      setSelectedCategoryData(allCategoriesData[categoryKey]);
      setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey); // Toggle dropdown
      setSelectedSubcategory('All Subcategories');
      setFilters(prev => ({ ...prev, subcategory: 'all' }));
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (option) => {
    setSelectedSubcategory(option.label);
    setFilters(prev => ({ ...prev, subcategory: option.value }));
    setExpandedCategory(null); // Close dropdown after selection
  };

  // Default category for demo
  const category = allCategoriesData.dancers || allCategoriesData.singers;

  console.log('🎯 Using category:', category?.name);
  console.log('🎨 Category color:', category?.color);

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config?.background_color || '#f9fafb' }}>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="flex">
        {/* Left Sidebar - Filters - Fixed Position */}
        <div className="fixed left-0 top-24 w-80 bg-white shadow-lg border-r border-gray-200 z-30" style={{ height: 'calc(100vh - 6rem)' }}>
          <div className="p-4 h-full overflow-y-auto">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6">
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

            <div className="space-y-6">
              {/* Horizontal Scrollable Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="relative">
                  {/* Gradient indicators for scroll */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Horizontal scroll container */}
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                      {Object.entries(allCategoriesData).map(([key, cat]) => (
                        <div key={key} className="flex-shrink-0">
                          <button
                            onClick={() => handleCategorySelect(key)}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 min-w-[80px] ${
                              selectedCategoryData?.name === cat.name
                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className={`text-2xl mb-1 ${
                              selectedCategoryData?.name === cat.name ? 'animate-bounce' : ''
                            }`}>
                              {cat.icon}
                            </div>
                            <span className="text-xs font-medium text-center text-gray-700">
                              {cat.name}
                            </span>
                          </button>
                          
                          {/* Expandable Subcategory Dropdown */}
                          {expandedCategory === key && cat.subcategories && (
                            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden animate-fadeIn">
                              <div className="max-h-60 overflow-y-auto">
                                {Object.entries(cat.subcategories).map(([subKey, subcat]) => (
                                  <div key={subKey} className="border-b border-gray-100 last:border-b-0">
                                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm">{subcat.icon}</span>
                                        <span className="text-sm font-medium text-gray-900">{subcat.name}</span>
                                        <span className="text-xs text-gray-500">({subcat.items.length})</span>
                                      </div>
                                    </div>
                                    <div className="p-1">
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
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Category Display */}
              {selectedCategoryData && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Selected Style</h4>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedCategoryData.icon}</span>
                        <span className="text-sm font-medium text-blue-900">{selectedCategoryData.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCategoryData(null);
                          setExpandedCategory(null);
                          setSelectedSubcategory('All Subcategories');
                          setFilters(prev => ({ ...prev, subcategory: 'all' }));
                        }}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {selectedSubcategory !== 'All Subcategories' && (
                      <div className="mt-2 text-xs text-blue-700">
                        Style: {selectedSubcategory}
                      </div>
                    )}
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

        {/* Main Content Area - With Left Margin for Fixed Sidebar */}
        <div className="flex-1 ml-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => navigate && navigate('home')}
                className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category?.color || 'from-blue-500 to-purple-600'} flex items-center justify-center text-3xl shadow-lg`}>
                {category?.icon || '🎭'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold" style={{ color: config?.text_color || '#111827' }}>{pageTitle}</h1>
                <p className="text-gray-500">{pageDescription}</p>
              </div>
            </div>

            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Showing {displayArtists.length} of {artists.length} artists</span>
                    {(filters.location || filters.minBudget || filters.maxBudget || filters.subcategory !== 'all' || filters.skill) && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">Filters applied</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Sort by:
                    <select 
                      value={filters.sortBy || 'relevance'}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                      className="ml-2 text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Rating: High to Low</option>
                      <option value="experience">Experience: High to Low</option>
                    </select>
                  </div>
                  {(filters.location || filters.minBudget || filters.maxBudget || filters.subcategory !== 'all' || filters.skill) && (
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(filters.location || filters.minBudget || filters.maxBudget || filters.subcategory !== 'all' || filters.skill) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Active filters:</span>
                    {filters.location && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                        📍 {filters.location}
                        <button 
                          onClick={() => updateFilter('location', '')}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {(filters.minBudget || filters.maxBudget) && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                        💰 {filters.minBudget || '0'} - {filters.maxBudget || '∞'}
                        <button 
                          onClick={() => { updateFilter('minBudget', ''); updateFilter('maxBudget', ''); }}
                          className="text-green-500 hover:text-green-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.subcategory && filters.subcategory !== 'all' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex items-center gap-1">
                        🎭 {filters.subcategory}
                        <button 
                          onClick={() => updateFilter('subcategory', 'all')}
                          className="text-purple-500 hover:text-purple-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {filters.skill && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full flex items-center gap-1">
                        🎨 {filters.skill}
                        <button 
                          onClick={() => updateFilter('skill', '')}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Artists Grid - Row Wise Full Width */}
            {displayArtists.length > 0 ? (
              <div className="space-y-4">
                {displayArtists.map((artist, index) => (
                  <div 
                    key={artist._id || artist.id || index}
                    className="animate-fadeIn w-full"
                  >
                    {ArtistCard && <ArtistCard artist={artist} config={config || {}} fullWidth={true} />}
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
                  {loading ? 'Loading artists...' : 'No artists found matching your criteria'}
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
