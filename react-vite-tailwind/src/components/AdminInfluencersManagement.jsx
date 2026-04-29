import React, { useState, useEffect } from 'react';

const AdminInfluencersManagement = ({ influencers, onRefreshInfluencers }) => {
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [availableIds, setAvailableIds] = useState(null);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3x3 grid layout

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm, sortBy, availabilityDate, availableIds]);

  // Shared helpers
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  // Pagination helper function
  const getPaginationNumbers = () => {
    const pages = [];
    
    // Show max 5 page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Add first page if not visible
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="px-2 text-gray-500">...</span>);
      }
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
            i === currentPage
              ? 'bg-orange-600 text-white border-orange-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="px-2 text-gray-500">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  // Safely render location (handles both string and object formats)
  const renderLocation = (loc) => {
    if (!loc) return 'Not specified';
    if (typeof loc === 'string') return loc;
    const { city = '', country = '' } = loc;
    const formatted = [city, country].filter(Boolean).join(', ');
    return formatted || 'Not specified';
  };

  // Filter and sort influencers
  const filteredInfluencers = influencers
    .filter(influencer => {
      // Enhanced search including categories
      const searchLower = searchTerm.toLowerCase();
      const nameMatch = (influencer.displayName || influencer.name || '').toLowerCase().includes(searchLower);
      const emailMatch = (influencer.email || '').toLowerCase().includes(searchLower);
      const categoryMatch = influencer.categories && influencer.categories.some(cat => 
        typeof cat === 'string' ? cat.toLowerCase().includes(searchLower) : 
        (cat.name && cat.name.toLowerCase().includes(searchLower))
      );
      const subcategoryMatch = influencer.subcategories && influencer.subcategories.some(sub => 
        typeof sub === 'string' ? sub.toLowerCase().includes(searchLower) : 
        (sub.name && sub.name.toLowerCase().includes(searchLower))
      );
      const skillsMatch = influencer.skills && influencer.skills.some(skill => 
        skill.toLowerCase().includes(searchLower)
      );
      
      const matchesSearch = nameMatch || emailMatch || categoryMatch || subcategoryMatch || skillsMatch;
      const matchesStatus = filterStatus === 'all' || influencer.profileCompletionStatus === filterStatus;
      
      // Debug log for search (only when searching)
      if (searchTerm && matchesSearch) {
        console.log('Influencer Search Match:', {
          searchTerm,
          influencerName: influencer.displayName || influencer.name,
          influencerEmail: influencer.email,
          categories: influencer.categories,
          subcategories: influencer.subcategories,
          skills: influencer.skills,
          matches: { nameMatch, emailMatch, categoryMatch, subcategoryMatch, skillsMatch }
        });
      }
      
      // Check if influencer has basic required information
      const hasBasicInfo = influencer && influencer.email;
      const matchesAvailability = !availableIds || availableIds.has(String(influencer._id || influencer.id));
      return matchesSearch && matchesStatus && hasBasicInfo && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortBy === 'registrationDate') {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
      if (sortBy === 'profileCompletion') {
        return b.profileCompletion - a.profileCompletion;
      }
      if (sortBy === 'name') {
        const nameA = a.displayName || a.email || '';
        const nameB = b.displayName || b.email || '';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredInfluencers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInfluencers = filteredInfluencers.slice(startIndex, endIndex);

  const fetchAvailableInfluencers = async () => {
    if (!availabilityDate) {
      setAvailableIds(null);
      return;
    }

    setLoadingAvailable(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/influencers/available?date=${availabilityDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Failed to filter available influencers');
        return;
      }

      const result = await res.json();
      const ids = new Set((result.data || []).map((inf) => String(inf._id || inf.id)));
      setAvailableIds(ids);
    } catch (error) {
      console.error('Error fetching available influencers:', error);
      alert('Network error while filtering available influencers');
    } finally {
      setLoadingAvailable(false);
    }
  };

  const getCompletionColor = (completion) => {
    if (completion >= 80) return 'text-green-600 bg-green-100';
    if (completion >= 60) return 'text-blue-600 bg-blue-100';
    if (completion >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompletionIcon = (status) => {
    switch (status) {
      case 'Complete': return '✅';
      case 'Good': return '🟡';
      case 'Basic': return '🟠';
      case 'Incomplete': return '🔴';
      default: return '❓';
    }
  };

  const getVerificationBadge = (status) => {
    switch (status) {
      case 'verified': return { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Verified' };
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Pending' };
      case 'rejected': return { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Rejected' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', label: '❓ Unknown' };
    }
  };

  const handleViewDetails = (influencer) => {
    setSelectedInfluencer(influencer);
    setShowDetailsModal(true);
  };

  const handleToggleInfluencerStatus = async (influencerId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/influencer/${influencerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedInfluencer = data.data;
        
        // Update local selected influencer if open
        if (selectedInfluencer && (selectedInfluencer._id === influencerId || selectedInfluencer.id === influencerId)) {
          setSelectedInfluencer(updatedInfluencer);
        }
        
        onRefreshInfluencers(); // Refresh influencers list from parent
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update influencer status');
      }
    } catch (error) {
      console.error('Error updating influencer status:', error);
      alert('Network error while updating influencer status');
    }
  };

  const InfluencerDetailsModal = () => {
    if (!selectedInfluencer) return null;

    const verificationBadge = getVerificationBadge(selectedInfluencer.verificationStatus);
    
    // use shared `renderLocation`

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Influencer Profile Details</h3>
            <button 
              onClick={() => setShowDetailsModal(false)} 
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <img 
                src={selectedInfluencer.profileImage} 
                alt={selectedInfluencer.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold text-gray-800">{selectedInfluencer.fullName}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationBadge.bg} ${verificationBadge.text}`}>
                    {verificationBadge.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📧 {selectedInfluencer.email}</span>
                  <span>📱 {selectedInfluencer.phone}</span>
                  <span>📍 {renderLocation(selectedInfluencer.location)}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(selectedInfluencer.profileCompletion)}`}>
                    {getCompletionIcon(selectedInfluencer.profileCompletionStatus)} {selectedInfluencer.profileCompletion}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedInfluencer.profileType}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Influencer Details</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Profile Type:</strong> {selectedInfluencer.profileType}</div>
                    <div><strong>Categories:</strong> {selectedInfluencer.categories?.length > 0 ? selectedInfluencer.categories.join(', ') : (selectedInfluencer.category || 'None')}</div>
                    {/* <div><strong>Subcategories:</strong> {selectedInfluencer.subcategories?.join(', ') || 'None'}</div> */}
                    {/* <div><strong>Skills:</strong> {selectedInfluencer.skills?.join(', ') || 'None'}</div> */}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Bio</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedInfluencer.bio || 'No bio provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Pricing Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Minimum Budget:</strong> ₹{selectedInfluencer.budgetMin?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong>Maximum Budget:</strong> ₹{selectedInfluencer.budgetMax?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong>Default Budget:</strong> ₹{selectedInfluencer.budget?.toLocaleString('en-IN') || 'Not specified'}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Social Links</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Instagram:</strong> {selectedInfluencer.socialLinks?.instagram || 'Not provided'}</div>
                    <div><strong>YouTube:</strong> {selectedInfluencer.socialLinks?.youtube || 'Not provided'}</div>
                    <div><strong>Facebook:</strong> {selectedInfluencer.socialLinks?.facebook || 'Not provided'}</div>
                    <div><strong>Website:</strong> {selectedInfluencer.socialLinks?.website || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            {/* <div>
              <h5 className="font-semibold text-gray-700 mb-2">Portfolio ({selectedInfluencer.portfolio?.length || 0} items)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedInfluencer.portfolio?.length > 0 ? (
                  selectedInfluencer.portfolio.map((item, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      {item.includes('image') ? (
                        <img src={item} alt={`Portfolio ${index + 1}`} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-500">📎 File {index + 1}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8 bg-gray-50 rounded-lg">
                    No portfolio items uploaded
                  </div>
                )}
              </div>
            </div> */}

            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Registration Date</div>
                <div>{new Date(selectedInfluencer.registrationDate).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Last Updated</div>
                <div>{new Date(selectedInfluencer.lastUpdated).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                {/* <div className="font-semibold text-gray-700">Profile Views</div> */}
                {/* <div>{selectedInfluencer.profileViews?.toLocaleString() || 0}</div> */}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => handleToggleInfluencerStatus(selectedInfluencer._id, !selectedInfluencer.isActive)}
                className={`px-6 py-2 rounded-lg text-white ${
                  selectedInfluencer.isActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedInfluencer.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-7xl bg-gradient-to-r from-white via-orange-50/30 to-white rounded-2xl border border-orange-100/50 p-6 shadow-lg">
          {/* Search and Filters Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800">Search & Filter Influencers</h4>
              <p className="text-sm text-gray-600">Find the perfect influencers for your campaigns</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, category, subcategory, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-orange-300"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-orange-300"
            >
              <option value="all">All Profiles</option>
              <option value="Complete">Complete (80%+)</option>
              <option value="Good">Good (60-79%)</option>
              <option value="Basic">Basic (40-59%)</option>
              <option value="Incomplete">Incomplete (&lt;40%)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-orange-300"
            >
              <option value="registrationDate">Registration Date</option>
              <option value="profileCompletion">Profile Completion</option>
              <option value="name">Name</option>
            </select>

            {/* Date Availability Check */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 hover:border-orange-300"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchAvailableInfluencers}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                disabled={loadingAvailable}
              >
                <span className="flex items-center justify-center gap-2">
                  {loadingAvailable ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check Available
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAvailabilityDate('');
                  setAvailableIds(null);
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-200 hover:shadow-md font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {availableIds && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-200/20 to-emerald-300/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-emerald-200/20 to-teal-300/10 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-green-800">Available Influencers Found</h4>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                    {filteredInfluencers.length}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-green-700 mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Date:</span>
                    <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-green-200">
                      {new Date(availabilityDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Total:</span>
                    <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-green-200">
                      {influencers.length} influencers
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-medium">Available:</span>
                    <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-green-200">
                      {Math.round((filteredInfluencers.length / influencers.length) * 100)}% match rate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAvailabilityDate('');
                      setAvailableIds(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filter
                  </button>
                  
                  <div className="text-sm text-green-600 font-medium">
                    {filteredInfluencers.length === 0 
                      ? 'No influencers available on this date. Try a different date.'
                      : filteredInfluencers.length === 1
                      ? 'Perfect match found!'
                      : `${filteredInfluencers.length} great matches available!`
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Info Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {Math.min(startIndex + 1, filteredInfluencers.length)} to {Math.min(endIndex, filteredInfluencers.length)} of {filteredInfluencers.length} influencers
          </div>
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            
            {getPaginationNumbers()}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedInfluencers.map((influencer) => {
          const verificationBadge = getVerificationBadge(influencer.verificationStatus);
          
                    
          const isAvailable = availableIds && availableIds.has(String(influencer._id || influencer.id));
          const isUnavailable = availableIds && !isAvailable;
          
          return (
            <div key={influencer._id} className={`relative rounded-xl shadow-lg border-2 overflow-hidden hover:shadow-xl transition-all duration-300 ${
              isUnavailable 
                ? 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-80' 
                : isAvailable 
                ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-300 hover:border-green-400 hover:shadow-2xl' 
                : 'bg-white border-gray-100'
            }`}>
              {/* Availability Status Badge */}
              {availableIds && (
                <div className="absolute top-3 right-3 z-10">
                  {isAvailable ? (
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      AVAILABLE
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      UNAVAILABLE
                    </div>
                  )}
                </div>
              )}

              {/* Unavailable Overlay */}
              {isUnavailable && (
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-0"></div>
              )}

              <div className={`p-4 border-b ${isUnavailable ? 'border-gray-200' : 'border-gray-100'} relative z-5`}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img 
                      src={influencer.profileImage} 
                      alt={influencer.displayName || influencer.email}
                      className={`w-16 h-16 rounded-full object-cover border-2 ${
                        isUnavailable 
                          ? 'border-gray-300 grayscale' 
                          : isAvailable 
                          ? 'border-green-300' 
                          : 'border-gray-100'
                      }`}
                    />
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-gray-500/20 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${
                      isUnavailable ? 'text-gray-600' : isAvailable ? 'text-green-800' : 'text-gray-800'
                    }`}>
                      {influencer.displayName || (influencer.email ? influencer.email.split('@')[0] : `Influencer ${influencer._id?.slice(-6)}`)}
                    </div>
                    <div className={`text-sm truncate ${isUnavailable ? 'text-gray-500' : 'text-gray-600'}`}>
                      {influencer.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isUnavailable 
                          ? 'bg-gray-200 text-gray-600' 
                          : getCompletionColor(influencer.profileCompletion)
                      }`}>
                        {influencer.profileCompletion || 0}% Complete
                      </span>
                      <span className={`text-xs ${isUnavailable ? 'text-gray-400' : 'text-gray-500'}`}>
                        {influencer.profileType || 'Influencer'} • {influencer.categories?.[0] || 'No category'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 space-y-3 relative z-5 ${isUnavailable ? 'bg-gray-50/50' : ''}`}>
                {/* Availability Status in Card */}
                {availableIds && (
                  <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-white/80 backdrop-blur-sm border">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={`text-xs font-semibold ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                        {isAvailable ? 'Available on selected date' : 'Not available on selected date'}
                      </span>
                    </div>
                    {isAvailable && (
                      <div className="text-xs text-green-600 font-medium">
                        ✓ Ready for booking
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-sm ${isUnavailable ? 'text-gray-600' : 'text-gray-700'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Profile Completion:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-20 rounded-full h-2 ${isUnavailable ? 'bg-gray-300' : 'bg-gray-200'}`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isUnavailable 
                              ? 'bg-gray-400' 
                              : 'bg-gradient-to-r from-red-500 via-yellow-500 to-green-500'
                          }`}
                          style={{ width: `${influencer.profileCompletion || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${isUnavailable ? 'text-gray-600' : ''}`}>{influencer.profileCompletion || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Categories:</span>
                    <span className={isUnavailable ? 'text-gray-500' : 'text-gray-600'}>{influencer.categories?.slice(0, 2).join(', ') || 'None'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Location:</span>
                    <span className={isUnavailable ? 'text-gray-500' : 'text-gray-600'}>{renderLocation(influencer.location)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Portfolio:</span>
                    <span className={isUnavailable ? 'text-gray-500' : 'text-gray-600'}>{influencer.portfolio?.length || 0} items</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Joined:</span>
                    <span className={isUnavailable ? 'text-gray-500' : 'text-gray-600'}>{new Date(influencer.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={`flex gap-2 pt-3 border-t ${isUnavailable ? 'border-gray-200' : 'border-gray-100'}`}>
                  <button
                    onClick={() => handleViewDetails(influencer)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                      isUnavailable 
                        ? 'bg-gray-300 text-gray-600 hover:bg-gray-400 cursor-not-allowed' 
                        : isAvailable
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    disabled={isUnavailable}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {isUnavailable ? 'Unavailable' : 'View Details'}
                    </span>
                  </button>
                  <button
                    onClick={() => !isUnavailable && handleToggleInfluencerStatus(influencer._id, !influencer.isActive)}
                    disabled={isUnavailable}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                      isUnavailable 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : influencer.isActive 
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg' 
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isUnavailable ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 0018.364 5.636m-9 9v-9m0 9l-3-3m3 3l3-3m-6-3h6" />
                        </svg>
                        Unavailable
                      </span>
                    ) : influencer.isActive ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Deactivate
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Activate
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {paginatedInfluencers.length === 0 && filteredInfluencers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400">No influencers found on this page.</div>
        </div>
      )}

      {filteredInfluencers.length === 0 && (
        <div className={`relative overflow-hidden rounded-2xl p-8 ${availableIds ? 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-2 border-red-200' : 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 border border-gray-200'} shadow-lg`}>
          {/* Decorative background elements */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${availableIds ? 'bg-gradient-to-br from-red-200/20 to-pink-300/10' : 'bg-gradient-to-br from-gray-200/20 to-slate-300/10'} rounded-full blur-3xl`}></div>
          <div className={`absolute bottom-0 left-0 w-24 h-24 ${availableIds ? 'bg-gradient-to-tr from-pink-200/20 to-rose-300/10' : 'bg-gradient-to-tr from-slate-200/20 to-zinc-300/10'} rounded-full blur-2xl`}></div>
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 ${availableIds ? 'bg-gradient-to-br from-red-500 to-pink-600' : 'bg-gradient-to-br from-gray-400 to-slate-500'} rounded-2xl flex items-center justify-center shadow-xl`}>
                {availableIds ? (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
            
            <h4 className={`text-2xl font-bold mb-3 ${availableIds ? 'text-red-800' : 'text-gray-800'}`}>
              {availableIds ? 'No Influencers Available' : 'No Influencers Found'}
            </h4>
            
            <p className={`text-lg mb-6 max-w-md mx-auto ${availableIds ? 'text-red-700' : 'text-gray-600'}`}>
              {availableIds 
                ? `Unfortunately, no influencers are available on ${new Date(availabilityDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Please select a different date.`
                : (searchTerm ? `No influencers match "${searchTerm}". Try adjusting your search terms or filters.` : 'No influencers match the current filters. Try adjusting your criteria.')
              }
            </p>
            
            <div className="flex justify-center gap-3">
              {availableIds && (
                <button
                  type="button"
                  onClick={() => {
                    setAvailabilityDate('');
                    setAvailableIds(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Date Filter
                </button>
              )}
              
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSortBy('registrationDate');
                  if (availableIds) {
                    setAvailabilityDate('');
                    setAvailableIds(null);
                  }
                }}
                className={`px-6 py-3 ${availableIds ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'} rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            </div>
            
            {!availableIds && (
              <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Tips:</span>
                </p>
                <ul className="text-xs text-gray-500 space-y-1 text-left max-w-sm mx-auto">
                  <li>Try using different keywords in the search</li>
                  <li>Check the spelling of your search terms</li>
                  <li>Try selecting different filter options</li>
                  <li>Clear all filters to see all influencers</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {showDetailsModal && <InfluencerDetailsModal />}
    </div>
  );
};

export default AdminInfluencersManagement;
