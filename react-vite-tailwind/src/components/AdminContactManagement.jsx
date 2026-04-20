import React, { useEffect } from 'react';

const AdminContactManagement = ({
  contacts,
  contactCurrentPage,
  setContactCurrentPage,
  contactItemsPerPage,
  selectedContact,
  setSelectedContact,
  showContactModal,
  setShowContactModal,
  handleUpdateContactStatus,
  getCategoryColors
}) => {
  // Reset pagination when contact filters change (if any)
  useEffect(() => {
    setContactCurrentPage(1);
  }, []); // Add contact filter dependencies when available

  return (
    <>
      <div className="w-full">
        {/* Header */}
        <div className={`bg-gradient-to-r ${getCategoryColors(7)} p-6 shadow-lg`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Contact Submissions</h3>
              <div className="text-white/90 text-sm font-semibold">
                Total: {contacts.length}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            {/* Pagination Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {Math.min((contactCurrentPage - 1) * contactItemsPerPage + 1, contacts.length)} to {Math.min(contactCurrentPage * contactItemsPerPage, contacts.length)} of {contacts.length} contacts
                </div>
                
                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setContactCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={contactCurrentPage === 1}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                  
                  {(() => {
                    const totalPages = Math.ceil(contacts.length / contactItemsPerPage);
                    const currentPage = contactCurrentPage;
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
                          onClick={() => setContactCurrentPage(1)}
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
                          onClick={() => setContactCurrentPage(i)}
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
                          onClick={() => setContactCurrentPage(totalPages)}
                          className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          {totalPages}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button
                    onClick={() => setContactCurrentPage(prev => Math.min(prev + 1, Math.ceil(contacts.length / contactItemsPerPage)))}
                    disabled={contactCurrentPage === Math.ceil(contacts.length / contactItemsPerPage)}
                    className="px-3 py-1 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {!contacts || contacts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400">No contact submissions found.</div>
              </div>
            ) : (
              // Get paginated contacts
              (() => {
                const startIndex = (contactCurrentPage - 1) * contactItemsPerPage;
                const endIndex = startIndex + contactItemsPerPage;
                const paginatedContacts = contacts.slice(startIndex, endIndex);
                
                return paginatedContacts.map((contact) => (
                  <div key={contact._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            Submitted
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {contact.status || 'pending'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">User Information</h4>
                            <div className="text-sm text-gray-600">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-xs text-gray-400">{contact.email}</div>
                              <div className="text-xs text-gray-400">{contact.phone}</div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Subject</h4>
                            <div className="text-sm text-gray-600">
                              <div className="font-medium truncate">{contact.subject}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(contact.createdAt).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">Message Preview</h4>
                            <div className="text-sm text-gray-600">
                              <p className="truncate">{contact.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowContactModal(true);
                        }}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {showContactModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Contact Details</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedContact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedContact.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedContact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Submitted On</p>
                  <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Subject</p>
                <p className="text-xl font-semibold text-gray-900 mb-4">{selectedContact.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Message</p>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex flex-wrap gap-3">
                {selectedContact.status !== 'read' && selectedContact.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateContactStatus(selectedContact._id, 'read')}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark as Read
                  </button>
                )}
                {selectedContact.status !== 'resolved' && (
                  <button
                    onClick={() => handleUpdateContactStatus(selectedContact._id, 'resolved')}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminContactManagement;
