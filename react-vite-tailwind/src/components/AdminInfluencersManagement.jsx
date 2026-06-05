import React, { useState, useEffect } from 'react';
import { useToast } from '../hooks/useToast';

const AdminInfluencersManagement = ({ influencers, onRefreshInfluencers }) => {
  const { showToast, ToastContainer } = useToast();
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
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://viralmantrix.com').replace(/\/$/, '');

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
          className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="px-2 text-white/50">...</span>);
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
              ? 'bg-[#DF7AFE] text-black border-[#DF7AFE] font-bold'
              : 'border-white/10 text-white hover:bg-white/10'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page if not visible
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="px-2 text-white/50">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors"
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
        showToast(err.message || 'Failed to filter available influencers', 'error');
        return;
      }

      const result = await res.json();
      const ids = new Set((result.data || []).map((inf) => String(inf._id || inf.id)));
      setAvailableIds(ids);
    } catch (error) {
      console.error('Error fetching available influencers:', error);
      showToast('Network error while filtering available influencers', 'error');
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
      case 'verified': return { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: '✅ Verified' };
      case 'pending': return { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-400', label: '⏳ Pending' };
      case 'rejected': return { bg: 'bg-rose-500/10 border border-rose-500/20', text: 'text-rose-400', label: '❌ Rejected' };
      default: return { bg: 'bg-white/10 border border-white/10', text: 'text-white/70', label: '❓ Unknown' };
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
        showToast(errorData.message || 'Failed to update influencer status', 'error');
      }
    } catch (error) {
      console.error('Error updating influencer status:', error);
      showToast('Network error while updating influencer status', 'error');
    }
  };

  const InfluencerDetailsModal = () => {
    if (!selectedInfluencer) return null;

    const verificationBadge = getVerificationBadge(selectedInfluencer.verificationStatus);
    
    // use shared `renderLocation`

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0D0D0D] sticky top-0 z-10">
            <h3 className="text-xl font-bold text-white">Influencer Profile Details</h3>
            <button 
              onClick={() => setShowDetailsModal(false)} 
              className="text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <img 
                src={selectedInfluencer.profileImage} 
                alt={selectedInfluencer.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/10"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold text-white">{selectedInfluencer.fullName}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationBadge.bg} ${verificationBadge.text}`}>
                    {verificationBadge.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <span>📧 {selectedInfluencer.email}</span>
                  <span>📱 {selectedInfluencer.phone}</span>
                  <span>📍 {renderLocation(selectedInfluencer.location)}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(selectedInfluencer.profileCompletion)}`}>
                    {getCompletionIcon(selectedInfluencer.profileCompletionStatus)} {selectedInfluencer.profileCompletion}% Complete
                  </span>
                  <span className="text-sm text-white/50">
                    {selectedInfluencer.profileType}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-white/80 mb-2">Influencer Details</h5>
                  <div className="space-y-2 text-sm text-white/70">
                     <div><strong className="text-white/50 font-normal">Full Name:</strong> {selectedInfluencer.fullName}</div>
                     <div><strong className="text-white/50 font-normal">Location:</strong> {selectedInfluencer.location}</div>
                    <div><strong className="text-white/50 font-normal">Profile Type:</strong> {selectedInfluencer.profileType}</div>
                    <div><strong className="text-white/50 font-normal">Categories:</strong> {selectedInfluencer.categories?.length > 0 ? selectedInfluencer.categories.join(', ') : (selectedInfluencer.category || 'None')}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-white/80 mb-2">Bio</h5>
                  <p className="text-sm text-white/80 bg-[#121212] border border-white/5 p-3 rounded-lg leading-relaxed">
                    {selectedInfluencer.bio || 'No bio provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-white/80 mb-2">Pricing Information</h5>
                  <div className="space-y-2 text-sm text-white/70">
                    <div><strong className="text-white/50 font-normal">Minimum Budget:</strong> ₹{selectedInfluencer.budgetMin?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong className="text-white/50 font-normal">Maximum Budget:</strong> ₹{selectedInfluencer.budgetMax?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong className="text-white/50 font-normal">Default Budget:</strong> ₹{selectedInfluencer.budget?.toLocaleString('en-IN') || 'Not specified'}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-white/80 mb-2">Social Links</h5>
                  <div className="space-y-2 text-sm text-white/70">
                    <div><strong className="text-white/50 font-normal">Instagram:</strong> {selectedInfluencer.socialLinks?.instagram || 'Not provided'}</div>
                    <div><strong className="text-white/50 font-normal">YouTube:</strong> {selectedInfluencer.socialLinks?.youtube || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#121212] border border-white/5 p-3 rounded-lg">
                <div className="font-semibold text-white/80">Registration Date</div>
                <div className="text-white/70 mt-1">{new Date(selectedInfluencer.registrationDate).toLocaleDateString()}</div>
              </div>
              <div className="bg-[#121212] border border-white/5 p-3 rounded-lg">
                <div className="font-semibold text-white/80">Last Updated</div>
                <div className="text-white/70 mt-1">{new Date(selectedInfluencer.lastUpdated).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 border border-white/10 text-white bg-white/5 rounded-lg hover:bg-white/10 font-semibold transition"
              >
                Close
              </button>
              <button 
                onClick={() => handleToggleInfluencerStatus(selectedInfluencer._id, !selectedInfluencer.isActive)}
                className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
                  selectedInfluencer.isActive 
                    ? 'bg-rose-600 hover:bg-rose-700' 
                    : 'bg-emerald-600 hover:bg-emerald-700'
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
      <ToastContainer />
      <div className="flex flex-col items-center gap-6">
        <div className="w-full max-w-7xl bg-[#121212] rounded-2xl border border-white/10 p-6 shadow-lg">
          {/* Search and Filters Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#DF7AFE] to-[#814AC8] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Search & Filter Influencers</h4>
              <p className="text-sm text-white/70">Find the perfect influencers for your campaigns</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name, email, category, subcategory, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent bg-[#0D0D0D] text-white placeholder-white/30 transition-all duration-200 hover:border-white/20"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent bg-[#0D0D0D] text-white transition-all duration-200 hover:border-white/20"
            >
              <option value="all" className="bg-[#0D0D0D] text-white">All Profiles</option>
              <option value="Complete" className="bg-[#0D0D0D] text-white">Complete (80%+)</option>
              <option value="Good" className="bg-[#0D0D0D] text-white">Good (60-79%)</option>
              <option value="Basic" className="bg-[#0D0D0D] text-white">Basic (40-59%)</option>
              <option value="Incomplete" className="bg-[#0D0D0D] text-white">Incomplete (&lt;40%)</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent bg-[#0D0D0D] text-white transition-all duration-200 hover:border-white/20"
            >
              <option value="registrationDate" className="bg-[#0D0D0D] text-white">Registration Date</option>
              <option value="profileCompletion" className="bg-[#0D0D0D] text-white">Profile Completion</option>
              <option value="name" className="bg-[#0D0D0D] text-white">Name</option>
            </select>

            {/* Date Availability Check */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-white/10 rounded-xl focus:ring-2 focus:ring-[#DF7AFE] focus:border-transparent bg-[#0D0D0D] text-white transition-all duration-200 hover:border-white/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fetchAvailableInfluencers}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#DF7AFE] to-[#814AC8] text-white rounded-xl hover:opacity-90 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg font-bold"
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
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 hover:shadow-md font-medium"
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
        <div className="bg-[#0D0D0D] border-2 border-emerald-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-bold text-emerald-400">Available Influencers Found</h4>
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                    {filteredInfluencers.length}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Date:</span>
                    <span className="bg-[#121212] px-2 py-1 rounded-lg border border-white/10">
                      {new Date(availabilityDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">Total:</span>
                    <span className="bg-[#121212] px-2 py-1 rounded-lg border border-white/10">
                      {influencers.length} influencers
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="font-medium">Available:</span>
                    <span className="bg-[#121212] px-2 py-1 rounded-lg border border-white/10">
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
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filter
                  </button>
                  
                  <div className="text-sm text-emerald-400 font-semibold">
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
      <div className="bg-[#121212] rounded-xl border border-white/10 p-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/70">
            Showing {Math.min(startIndex + 1, filteredInfluencers.length)} to {Math.min(endIndex, filteredInfluencers.length)} of {filteredInfluencers.length} influencers
          </div>
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
            >
              Previous
            </button>
            
            {getPaginationNumbers()}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-white/10 text-sm font-medium text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
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
            <div key={influencer._id} className={`relative rounded-xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 ${
              isUnavailable 
                ? 'bg-[#0D0D0D] border-white/10 opacity-40 hover:opacity-50' 
                : isAvailable 
                ? 'bg-[#121212] border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-950/20' 
                : 'bg-[#0D0D0D] border-white/10 hover:border-white/20'
            }`}>
              {/* Availability Status Badge */}
              {availableIds && (
                <div className="absolute top-3 right-3 z-10">
                  {isAvailable ? (
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      AVAILABLE
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
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
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-0"></div>
              )}

              <div className={`p-4 border-b ${isUnavailable ? 'border-white/10' : 'border-white/10'} relative z-[5]`}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <img 
                      src={influencer.profileImage} 
                      alt={influencer.displayName || influencer.email}
                      className={`w-16 h-16 rounded-full object-cover border-2 ${
                        isUnavailable 
                          ? 'border-white/10 grayscale' 
                          : isAvailable 
                          ? 'border-emerald-500/40' 
                          : 'border-white/10'
                      }`}
                    />
                    {isUnavailable && (
                      <div className="absolute inset-0 bg-black/40 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${
                      isUnavailable ? 'text-white/40' : isAvailable ? 'text-emerald-400' : 'text-white'
                    }`}>
                      {influencer.displayName || (influencer.email ? influencer.email.split('@')[0] : `Influencer ${influencer._id?.slice(-6)}`)}
                    </div>
                    <div className={`text-sm truncate ${isUnavailable ? 'text-white/30' : 'text-white/50'}`}>
                      {influencer.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isUnavailable 
                          ? 'bg-white/10 text-white/50' 
                          : getCompletionColor(influencer.profileCompletion)
                      }`}>
                        {influencer.profileCompletion || 0}% Complete
                      </span>
                      <span className={`text-xs ${isUnavailable ? 'text-white/30' : 'text-white/40'}`}>
                        {influencer.profileType || 'Influencer'} • {influencer.categories?.[0] || 'No category'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-4 space-y-3 relative z-[5] ${isUnavailable ? 'bg-black/10' : ''}`}>
                {/* Availability Status in Card */}
                {availableIds && (
                  <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-[#121212] border border-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className={`text-xs font-semibold ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isAvailable ? 'Available on selected date' : 'Not available on selected date'}
                      </span>
                    </div>
                    {isAvailable && (
                      <div className="text-xs text-emerald-400 font-medium">
                        ✓ Ready
                      </div>
                    )}
                  </div>
                )}

                <div className={`text-sm ${isUnavailable ? 'text-white/40' : 'text-white/70'}`}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-white/50">Completion:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-20 rounded-full h-2 ${isUnavailable ? 'bg-white/10' : 'bg-white/10'}`}>
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isUnavailable 
                              ? 'bg-white/30' 
                              : 'bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500'
                          }`}
                          style={{ width: `${influencer.profileCompletion || 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${isUnavailable ? 'text-white/40' : ''}`}>{influencer.profileCompletion || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-white/50">Categories:</span>
                    <span className={isUnavailable ? 'text-white/30' : 'text-white/70'}>{influencer.categories?.slice(0, 2).join(', ') || 'None'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-white/50">Location:</span>
                    <span className={isUnavailable ? 'text-white/30' : 'text-white/70'}>{renderLocation(influencer.location)}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-white/50">Portfolio:</span>
                    <span className={isUnavailable ? 'text-white/30' : 'text-white/70'}>{influencer.portfolio?.length || 0} items</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium text-white/50">Joined:</span>
                    <span className={isUnavailable ? 'text-white/30' : 'text-white/70'}>{new Date(influencer.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className={`flex gap-2 pt-3 border-t ${isUnavailable ? 'border-white/10' : 'border-white/10'}`}>
                  <button
                    onClick={() => handleViewDetails(influencer)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                      isUnavailable 
                        ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                        : isAvailable
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
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
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all transform hover:scale-105 ${
                      isUnavailable 
                        ? 'bg-white/10 text-white/30 cursor-not-allowed' 
                        : influencer.isActive 
                        ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md hover:shadow-lg' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg'
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
        <div className="bg-[#121212] rounded-xl border border-white/10 p-8 text-center">
          <div className="text-white/50">No influencers found on this page.</div>
        </div>
      )}

      {filteredInfluencers.length === 0 && (
        <div className={`relative overflow-hidden rounded-2xl p-8 ${availableIds ? 'bg-[#0D0D0D] border-2 border-rose-500/20' : 'bg-[#121212] border border-white/10'} shadow-lg`}>
          {/* Decorative background elements */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-white/0 rounded-full blur-3xl`}></div>
          
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 ${availableIds ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-[#DF7AFE] to-[#814AC8]'} rounded-2xl flex items-center justify-center shadow-xl`}>
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
            
            <h4 className={`text-2xl font-bold mb-3 ${availableIds ? 'text-rose-400' : 'text-white'}`}>
              {availableIds ? 'No Influencers Available' : 'No Influencers Found'}
            </h4>
            
            <p className={`text-lg mb-6 max-w-md mx-auto ${availableIds ? 'text-rose-300/80' : 'text-white/60'}`}>
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
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl font-medium flex items-center gap-2"
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
                className={`px-6 py-3 ${availableIds ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gradient-to-r from-[#DF7AFE] to-[#814AC8] text-white hover:opacity-90'} rounded-xl transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            </div>
            
            {!availableIds && (
              <div className="mt-6 p-4 bg-[#0D0D0D] border border-white/10 rounded-xl">
                <p className="text-sm text-white/70 mb-2">
                  <span className="font-semibold">Tips:</span>
                </p>
                <ul className="text-xs text-white/50 space-y-1 text-left max-w-sm mx-auto">
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
