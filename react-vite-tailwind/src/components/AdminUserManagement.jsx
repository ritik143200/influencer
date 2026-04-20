import React, { useState, useEffect } from 'react';

const AdminUserManagement = ({
  users,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  userCurrentPage,
  setUserCurrentPage,
  userItemsPerPage,
  selectedUser,
  setSelectedUser,
  showUserModal,
  setShowUserModal,
  handleViewUserDetails,
  handleUpdateUserStatus,
  handleDeleteUser,
  getCategoryColors,
  successMessage,
  setSuccessMessage
}) => {
  // Reset pagination when user filters change
  useEffect(() => {
    setUserCurrentPage(1);
  }, [filterRole, filterStatus, searchTerm, setUserCurrentPage]);

  const renderUserModal = () => {
    if (!showUserModal || !selectedUser) return null;

    const userColorIndex = 1; // Indigo/Blue theme

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          {/* Modal Header */}
          <div className={`bg-gradient-to-r ${getCategoryColors(userColorIndex)} p-6 text-white`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedUser.name}</h3>
                  <p className="text-white/80 capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Email Address</p>
                <p className="text-gray-900 font-semibold">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">User Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedUser.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedUser.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                  }`}>
                  {selectedUser.status || 'Active'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Account Created</p>
                <p className="text-gray-900 font-semibold">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">User ID</p>
                <p className="text-gray-500 font-mono text-xs">{selectedUser._id || selectedUser.id}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Management Actions</h4>
              <div className="flex flex-wrap gap-3">
                {selectedUser.status !== 'active' && (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUser._id || selectedUser.id, 'unblock')}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                  >
                    Activate Account
                  </button>
                )}
                {selectedUser.status !== 'blocked' && (
                  <button
                    onClick={() => handleUpdateUserStatus(selectedUser._id || selectedUser.id, 'block')}
                    className="px-6 py-2 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
                  >
                    Deactivate Account
                  </button>
                )}
                <button
                  onClick={() => handleDeleteUser(selectedUser._id || selectedUser.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-4 flex justify-end">
            <button
              onClick={() => setShowUserModal(false)}
              className="px-6 py-2 text-gray-600 font-bold hover:text-gray-900 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    // Filter users based on filters
    const filteredUsers = users.filter(user => {
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSearch = searchTerm === '' ||
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesRole && matchesStatus && matchesSearch;
    });

    return (
      <div className="w-full">
        {/* Full Page Header */}
        <div className={`bg-gradient-to-r ${getCategoryColors(1)} p-6 shadow-lg`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">User Management</h3>
              <button className="px-4 py-2 bg-white text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors">
                Add New User
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all" className="text-gray-900">All Roles</option>
                <option value="user" className="text-gray-900">User</option>
                <option value="admin" className="text-gray-900">Admin</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="all" className="text-gray-900">All Status</option>
                <option value="active" className="text-gray-900">Active</option>
                <option value="inactive" className="text-gray-900">Inactive</option>
                <option value="suspended" className="text-gray-900">Suspended</option>
              </select>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setFilterRole('all');
                  setFilterStatus('all');
                  setSearchTerm('');
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
                  Showing {Math.min((userCurrentPage - 1) * userItemsPerPage + 1, filteredUsers.length)} to {Math.min(userCurrentPage * userItemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={userCurrentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {(() => {
                    const totalPages = Math.ceil(filteredUsers.length / userItemsPerPage);
                    const currentPage = userCurrentPage;
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
                          onClick={() => setUserCurrentPage(1)}
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
                          onClick={() => setUserCurrentPage(i)}
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
                          onClick={() => setUserCurrentPage(totalPages)}
                          className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button
                    onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredUsers.length / userItemsPerPage)))}
                    disabled={userCurrentPage === Math.ceil(filteredUsers.length / userItemsPerPage)}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400">No users found matching your filters.</div>
              </div>
            ) : (
              // Get paginated users
              (() => {
                const startIndex = (userCurrentPage - 1) * userItemsPerPage;
                const endIndex = startIndex + userItemsPerPage;
                const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
                
                return paginatedUsers.map((user) => (
              <div key={user._id || user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                {/* User Header Row */}
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      {/* User Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {user.status || 'Active'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">{user.email}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewUserDetails(user)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Manage User
                  </button>
                  <button
                    onClick={() => handleViewUserDetails(user)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleUpdateUserStatus(user._id || user.id, 'unblock')}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleUpdateUserStatus(user._id || user.id, 'block')}
                    className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id || user.id)}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ));
              })()
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderUsers()}
      {renderUserModal()}
    </>
  );
};

export default AdminUserManagement;
