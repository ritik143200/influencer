import React, { useEffect } from 'react';

const AdminInquiryManagement = ({
  inquiries,
  inquiryCurrentPage,
  setInquiryCurrentPage,
  inquiryItemsPerPage,
  filterStatusInquiry,
  setFilterStatusInquiry,
  filterDate,
  setFilterDate,
  searchTermInquiry,
  setSearchTermInquiry,
  handleAdminInquiryAction,
  handleOpenForwardModal,
  handleAssignToInfluencer,
  handleViewInquiryDetails,
  getCategoryColors
}) => {
  // Reset pagination when filters change
  useEffect(() => {
    setInquiryCurrentPage(1);
  }, [filterStatusInquiry, filterDate, searchTermInquiry]);

  // Filter inquiries based on filters
  const filteredInquiries = (Array.isArray(inquiries) ? inquiries : []).filter(inquiry => {
    const status = inquiry.status || 'sent';
    
    // Enhanced status matching for influencer rejections
    let matchesStatus = filterStatusInquiry === 'all' || status === filterStatusInquiry;
    
    // Special handling for artist_rejected: also show inquiries where any influencer has rejected
    if (filterStatusInquiry === 'artist_rejected' && status !== 'artist_rejected') {
      const hasInfluencerRejection = inquiry.forwardedTo && inquiry.forwardedTo.some(f => 
        f.acceptanceStatus === 'rejected'
      );
      matchesStatus = hasInfluencerRejection;
    }
    
    // Special handling for artist_accepted: also show inquiries where any influencer has accepted
    if (filterStatusInquiry === 'artist_accepted' && status !== 'artist_accepted') {
      const hasInfluencerAcceptance = inquiry.forwardedTo && inquiry.forwardedTo.some(f => 
        f.acceptanceStatus === 'accepted'
      );
      matchesStatus = hasInfluencerAcceptance;
    }
    
    const matchesSearch = searchTermInquiry === '' ||
      (inquiry.hiringFor?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
        inquiry.name?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
        inquiry.email?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
        (inquiry.userId && typeof inquiry.userId === 'object' && inquiry.userId.name?.toLowerCase().includes(searchTermInquiry.toLowerCase())));

    // Debug log for influencer filtering
    if (filterStatusInquiry === 'artist_rejected') {
      console.log('Filtering for influencer rejected:', {
        inquiryId: inquiry._id,
        inquiryStatus: status,
        matchesStatus,
        filterStatus: filterStatusInquiry,
        forwardedTo: inquiry.forwardedTo,
        hasInfluencerRejection: inquiry.forwardedTo && inquiry.forwardedTo.some(f => f.acceptanceStatus === 'rejected')
      });
    }
    
    if (filterStatusInquiry === 'artist_accepted') {
      console.log('Filtering for influencer accepted:', {
        inquiryId: inquiry._id,
        inquiryStatus: status,
        matchesStatus,
        filterStatus: filterStatusInquiry,
        forwardedTo: inquiry.forwardedTo,
        hasInfluencerAcceptance: inquiry.forwardedTo && inquiry.forwardedTo.some(f => f.acceptanceStatus === 'accepted')
      });
    }

    return matchesStatus && matchesSearch;
  });

  // Debug log for filtered results
  if (filterStatusInquiry === 'artist_rejected') {
    console.log('Influencer Rejected Filter Results:', {
      totalInquiries: inquiries.length,
      filteredCount: filteredInquiries.length,
      filteredInquiries: filteredInquiries.map(i => ({
        id: i._id,
        name: i.name,
        status: i.status
      }))
    });
  }
  
  if (filterStatusInquiry === 'artist_accepted') {
    console.log('Influencer Accepted Filter Results:', {
      totalInquiries: inquiries.length,
      filteredCount: filteredInquiries.length,
      filteredInquiries: filteredInquiries.map(i => ({
        id: i._id,
        name: i.name,
        status: i.status
      }))
    });
  }

  return (
    <div className="w-full">
      {/* Full Page Header */}
      <div className={`bg-gradient-to-r ${getCategoryColors(6)} p-6 shadow-lg`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-white">Inquiry Management</h3>
            <div className="text-white/90 text-sm font-semibold">
              Total: {filteredInquiries.length} / {Array.isArray(inquiries) ? inquiries.length : 0}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTermInquiry}
                onChange={(e) => setSearchTermInquiry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatusInquiry}
              onChange={(e) => setFilterStatusInquiry(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="sent" className="text-gray-900">Sent</option>
              <option value="admin_accepted" className="text-gray-900">Accepted</option>
              <option value="admin_rejected" className="text-gray-900">Rejected</option>
              <option value="forwarded" className="text-gray-900">Forwarded</option>
              <option value="artist_accepted" className="text-gray-900">Influencer Accepted</option>
              <option value="artist_rejected" className="text-gray-900">Influencer Rejected</option>
              <option value="completed" className="text-gray-900">Completed</option>
            </select>

            {/* Date Filter */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilterStatusInquiry('all');
                setFilterDate('');
                setSearchTermInquiry('');
              }}
              className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Full Page Content */}
      <div className="w-full p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Pagination Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {Math.min((inquiryCurrentPage - 1) * inquiryItemsPerPage + 1, filteredInquiries.length)} to {Math.min(inquiryCurrentPage * inquiryItemsPerPage, filteredInquiries.length)} of {filteredInquiries.length} inquiries
              </div>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setInquiryCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={inquiryCurrentPage === 1}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                
                {(() => {
                  const totalPages = Math.ceil(filteredInquiries.length / inquiryItemsPerPage);
                  const currentPage = inquiryCurrentPage;
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
                        onClick={() => setInquiryCurrentPage(1)}
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
                        onClick={() => setInquiryCurrentPage(i)}
                        className={`px-3 py-1 rounded-lg border text-sm font-medium transition-colors ${
                          i === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
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
                        onClick={() => setInquiryCurrentPage(totalPages)}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
                
                <button
                  onClick={() => setInquiryCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInquiries.length / inquiryItemsPerPage)))}
                  disabled={inquiryCurrentPage === Math.ceil(filteredInquiries.length / inquiryItemsPerPage)}
                  className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {filteredInquiries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400">No inquiries found matching your filters.</div>
            </div>
          ) : (
            // Get paginated inquiries
            (() => {
              const startIndex = (inquiryCurrentPage - 1) * inquiryItemsPerPage;
              const endIndex = startIndex + inquiryItemsPerPage;
              const paginatedInquiries = filteredInquiries.slice(startIndex, endIndex);
              
              return paginatedInquiries.map((inquiry) => {
            const inquiryId = inquiry._id || inquiry.id;
            const status = inquiry.status || 'sent';
            
            // Check for individual influencer responses
            const hasInfluencerRejections = inquiry.forwardedTo && inquiry.forwardedTo.some(f => f.acceptanceStatus === 'rejected');
            const hasInfluencerAcceptances = inquiry.forwardedTo && inquiry.forwardedTo.some(f => f.acceptanceStatus === 'accepted');
            const rejectedInfluencers = inquiry.forwardedTo ? inquiry.forwardedTo.filter(f => f.acceptanceStatus === 'rejected') : [];
            const acceptedInfluencers = inquiry.forwardedTo ? inquiry.forwardedTo.filter(f => f.acceptanceStatus === 'accepted') : [];
            
            // Determine display status
            let displayStatus = status;
            if (filterStatusInquiry === 'artist_rejected' && hasInfluencerRejections && status !== 'artist_rejected') {
              displayStatus = 'artist_rejected'; // Show as rejected for filtering purposes
            }
            if (filterStatusInquiry === 'artist_accepted' && hasInfluencerAcceptances && status !== 'artist_accepted') {
              displayStatus = 'artist_accepted'; // Show as accepted for filtering purposes
            }

            return (
              <div key={inquiryId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        displayStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                        displayStatus === 'admin_accepted' ? 'bg-green-100 text-green-800' :
                        displayStatus === 'admin_rejected' ? 'bg-red-100 text-red-800' :
                        displayStatus === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                        displayStatus === 'artist_accepted' ? 'bg-emerald-100 text-emerald-800' :
                        displayStatus === 'artist_rejected' ? 'bg-orange-100 text-orange-800' :
                        displayStatus === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {displayStatus.replace(/_/g, ' ').replace(/artist/gi, 'influencer').charAt(0).toUpperCase() + displayStatus.replace(/_/g, ' ').replace(/artist/gi, 'influencer').slice(1)}
                        {hasInfluencerRejections && displayStatus !== 'artist_rejected' && (
                          <span className="ml-1 text-xs">(Has Rejections)</span>
                        )}
                        {hasInfluencerAcceptances && displayStatus !== 'artist_accepted' && (
                          <span className="ml-1 text-xs text-green-600">(Has Acceptances)</span>
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(inquiry.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Client Information</h4>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">{inquiry.name}</div>
                          <div className="text-xs text-gray-400">{inquiry.email}</div>
                          <div className="text-xs text-gray-400">{inquiry.phone}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Project Details</h4>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium truncate">{inquiry.hiringFor}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Budget: {inquiry.budget ? `Rs. ${inquiry.budget.toLocaleString()}` : 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">Timeline</h4>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">{inquiry.timeline || 'Not specified'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Duration: {inquiry.duration || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Preview */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">Message Preview</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  {status === 'sent' && (
                    <>
                      <button
                        onClick={() => handleAdminInquiryAction(inquiryId, 'accept')}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAdminInquiryAction(inquiryId, 'reject')}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {(status === 'admin_accepted' || status === 'forwarded') && (
                    <button
                      onClick={() => handleOpenForwardModal(inquiryId)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Forward
                    </button>
                  )}
                  
                  {(status === 'artist_accepted' || status === 'artist_rejected') && (
                    <button
                      onClick={() => handleAssignToArtist(inquiryId)}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleViewInquiryDetails(inquiry)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
              });
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiryManagement;
