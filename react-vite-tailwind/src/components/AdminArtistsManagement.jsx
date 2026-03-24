import React, { useState, useEffect } from 'react';

const AdminArtistsManagement = ({ artists, onRefreshArtists }) => {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('registrationDate');

  // Filter and sort artists
  const filteredArtists = artists
    .filter(artist => {
      const matchesSearch = artist.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || artist.profileCompletionStatus === filterStatus;
      
      // Check if artist has basic required information
      const hasBasicInfo = artist && (artist.fullName || artist.name) && artist.email;
      return matchesSearch && matchesStatus && hasBasicInfo;
    })
    .sort((a, b) => {
      if (sortBy === 'registrationDate') {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
      }
      if (sortBy === 'profileCompletion') {
        return b.profileCompletion - a.profileCompletion;
      }
      if (sortBy === 'name') {
        return a.fullName?.localeCompare(b.fullName);
      }
      return 0;
    });

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

  const handleViewDetails = (artist) => {
    setSelectedArtist(artist);
    setShowDetailsModal(true);
  };

  const handleToggleArtistStatus = async (artistId, newStatus) => {
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/api/admin/artists/${artistId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (response.ok) {
        onRefreshArtists(); // Refresh artists list
      } else {
        alert('Failed to update artist status');
      }
    } catch (error) {
      console.error('Error updating artist status:', error);
      alert('Network error while updating artist status');
    }
  };

  const ArtistDetailsModal = () => {
    if (!selectedArtist) return null;

    const verificationBadge = getVerificationBadge(selectedArtist.verificationStatus);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Artist Profile Details</h3>
            <button 
              onClick={() => setShowDetailsModal(false)} 
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-6">
              <img 
                src={selectedArtist.profileImage} 
                alt={selectedArtist.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-2xl font-bold text-gray-800">{selectedArtist.fullName}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${verificationBadge.bg} ${verificationBadge.text}`}>
                    {verificationBadge.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📧 {selectedArtist.email}</span>
                  <span>📱 {selectedArtist.phone}</span>
                  <span>📍 {selectedArtist.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCompletionColor(selectedArtist.profileCompletion)}`}>
                    {getCompletionIcon(selectedArtist.profileCompletionStatus)} {selectedArtist.profileCompletion}% Complete
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedArtist.profileType} • {selectedArtist.artistType}
                  </span>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Professional Details</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Profile Type:</strong> {selectedArtist.profileType}</div>
                    <div><strong>Artist Type:</strong> {selectedArtist.artistType}</div>
                    <div><strong>Categories:</strong> {selectedArtist.categories?.length > 0 ? selectedArtist.categories.join(', ') : (selectedArtist.category || 'None')}</div>
                    <div><strong>Subcategories:</strong> {selectedArtist.subcategories?.join(', ') || 'None'}</div>
                    <div><strong>Skills:</strong> {selectedArtist.skills?.join(', ') || 'None'}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Bio</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedArtist.bio || 'No bio provided'}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Pricing Information</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Minimum Budget:</strong> ₹{selectedArtist.budgetMin?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong>Maximum Budget:</strong> ₹{selectedArtist.budgetMax?.toLocaleString('en-IN') || 'Not specified'}</div>
                    <div><strong>Default Budget:</strong> ₹{selectedArtist.budget?.toLocaleString('en-IN') || 'Not specified'}</div>
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-700 mb-2">Social Links</h5>
                  <div className="space-y-2 text-sm">
                    <div><strong>Instagram:</strong> {selectedArtist.socialLinks?.instagram || 'Not provided'}</div>
                    <div><strong>YouTube:</strong> {selectedArtist.socialLinks?.youtube || 'Not provided'}</div>
                    <div><strong>Facebook:</strong> {selectedArtist.socialLinks?.facebook || 'Not provided'}</div>
                    <div><strong>Website:</strong> {selectedArtist.socialLinks?.website || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio */}
            <div>
              <h5 className="font-semibold text-gray-700 mb-2">Portfolio ({selectedArtist.portfolio?.length || 0} items)</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedArtist.portfolio?.length > 0 ? (
                  selectedArtist.portfolio.map((item, index) => (
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
            </div>

            {/* System Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Registration Date</div>
                <div>{new Date(selectedArtist.registrationDate).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Last Updated</div>
                <div>{new Date(selectedArtist.lastUpdated).toLocaleDateString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-semibold text-gray-700">Profile Views</div>
                <div>{selectedArtist.profileViews?.toLocaleString() || 0}</div>
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
                onClick={() => handleToggleArtistStatus(selectedArtist._id, !selectedArtist.isActive)}
                className={`px-6 py-2 rounded-lg text-white ${
                  selectedArtist.isActive 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedArtist.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Artists Management</h3>
          <p className="text-sm text-gray-500">
            {filteredArtists.length} of {artists.length} artists
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Complete">Complete (80%+)</option>
            <option value="Good">Good (60-79%)</option>
            <option value="Basic">Basic (40-59%)</option>
            <option value="Incomplete">Incomplete (&lt;40%)</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="registrationDate">Registration Date</option>
            <option value="profileCompletion">Profile Completion</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Artists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => {
          const verificationBadge = getVerificationBadge(artist.verificationStatus);
          
          return (
            <div key={artist._id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {/* Artist Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <img 
                    src={artist.profileImage} 
                    alt={artist.fullName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">
                      {artist.fullName || artist.name || `Artist ${aid?.slice(-6)}`}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {artist.email}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompletionColor(artist.profileCompletion)}`}>
                        {artist.profileCompletion || 0}% Complete
                      </span>
                      <span className="text-xs text-gray-500">
                        {artist.profileType || 'Artist'} • {artist.categories?.[0] || 'No category'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Artist Details */}
              <div className="p-4 space-y-3">
                <div className="text-sm text-gray-700">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Profile Completion:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${artist.profileCompletion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{artist.profileCompletion}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Categories:</span>
                    <span className="text-gray-600">{artist.categories?.slice(0, 2).join(', ') || 'None'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Location:</span>
                    <span className="text-gray-600">{artist.location || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Portfolio:</span>
                    <span className="text-gray-600">{artist.portfolio?.length || 0} items</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="font-medium">Joined:</span>
                    <span className="text-gray-600">{new Date(artist.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleViewDetails(artist)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleToggleArtistStatus(artist._id, !artist.isActive)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      artist.isActive 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {artist.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Artists Message */}
      {filteredArtists.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">🎭</div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">No artists found</h4>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms' : 'No artists match the current filters'}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && <ArtistDetailsModal />}
    </div>
  );
};

export default AdminArtistsManagement;
