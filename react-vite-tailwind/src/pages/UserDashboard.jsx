import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import InquiryProgressBar from '../components/InquiryProgressBar';

const UserDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  // Removed bookings, bookingFilter

  // Inquiries state
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [inquiriesError, setInquiriesError] = useState('');
  const [expandedInquiryIds, setExpandedInquiryIds] = useState(new Set());

  // Change Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    // Booking-related effect removed

    
      // Fetch inquiries for the user (try API, fallback to localStorage)
      const fetchInquiries = async () => {
        setLoadingInquiries(true);
        setInquiriesError('');
        try {
          const token = localStorage.getItem('userToken');
          const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
          const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });

          if (res.ok) {
            const data = await res.json();
            // backend may return { data: [...] } or an array directly
            const list = Array.isArray(data.data) ? data.data : (Array.isArray(data.inquiries) ? data.inquiries : (Array.isArray(data) ? data : []));
            setInquiries(list);
          } else {
            const fallback = JSON.parse(localStorage.getItem('userInquiries') || '[]');
            setInquiries(fallback);
            setInquiriesError('Failed to load inquiries from server');
          }
        } catch (err) {
          const fallback = JSON.parse(localStorage.getItem('userInquiries') || '[]');
          setInquiries(fallback);
          setInquiriesError('Network error while loading inquiries');
        } finally {
          setLoadingInquiries(false);
        }
      };

      fetchInquiries();
  }, []);

  const toggleInquiryExpand = (id) => {
    setExpandedInquiryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('userToken');
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordSuccess('Password successfully updated!');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError('Network error. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Helper function to get status styling (updated for new workflow)
  const getStatusStyle = (status) => {
    if (status === 'admin_accepted') return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Admin Accepted' };
    if (status === 'admin_rejected') return { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Admin Rejected' };
    if (status === 'forwarded') return { bg: 'bg-purple-100', text: 'text-purple-800', label: '→ Forwarded to Influencer' };
    if (status === 'artist_accepted') return { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Influencer Accepted' };
    if (status === 'artist_rejected') return { bg: 'bg-red-100', text: 'text-red-800', label: '✗ Influencer Rejected' };
    if (status === 'completed') return { bg: 'bg-green-100', text: 'text-green-800', label: '✓ Completed' };
    return { bg: 'bg-blue-100', text: 'text-blue-800', label: '📤 Sent' };
  };

  // Helper function to get inquiry progress
  // Booking-related helpers removed

  const renderUser = () => (
    <div className="space-y-6">
      {/* User Profile Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {userData?.profileImage ? (
                <img
                  src={userData.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-4xl text-gray-400">
                  {userData?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <button className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
              Change Photo
            </button>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={userData?.name || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={userData?.email || ''}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={userData?.phone || 'Not provided'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={userData?.location || 'Not provided'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">1</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Account Age</h3>
          <p className="text-gray-500 text-xs mt-1">Member since 2024</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">0</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Saved Influencers</h3>
          <p className="text-gray-500 text-xs mt-1">Influencers you've bookmarked</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {/* Bookings removed */}
          </div>
          <h3 className="text-gray-600 text-sm font-medium">Completed Events</h3>
          <p className="text-gray-500 text-xs mt-1">Successfully attended</p>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Account Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Change Password</h4>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
            >
              Update
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Notifications</h4>
                <p className="text-sm text-gray-500">Manage email and push notifications</p>
              </div>
            </div>
            <button className="px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              Configure
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Privacy Settings</h4>
                <p className="text-sm text-gray-500">Control your data and privacy preferences</p>
              </div>
            </div>
            <button className="px-4 py-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          {/* Bookings removed */}
        </div>
        {/* Bookings removed */}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* Bookings removed */}
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Completed Events</h3>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* Bookings removed */}
        </div>
        {/* Bookings removed */}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">0</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Saved Influencers</h3>
      </div>
    </div>
  );

  // Booking-related UI removed


  const renderInquiries = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Your Inquiries</h3>
        <p className="text-sm text-gray-500">{inquiries.length} total</p>
      </div>

      {loadingInquiries ? (
        <div className="p-6 text-center text-gray-500">Loading inquiries…</div>
      ) : inquiries.length === 0 ? (
        <div className="p-6 text-center text-gray-500">You haven't sent any inquiries yet.</div>
      ) : (
        null
      )}
      {inquiriesError && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{inquiriesError}</div>
      )}
      {inquiries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inquiries.map((inq) => {
            const id = inq.id || inq._id || JSON.stringify(inq).slice(0, 8);
            const statusKey = inq.status || inq.state || 'sent';
            const status = getStatusStyle(statusKey);
            const progressPercentage = inq.progressPercentage || 10;

            return (
              <div key={id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-4">
                {/* Top: Title, Category, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{inq.title || inq.eventType || 'Hiring Request'}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="inline-block px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium">{inq.category || inq.type || '—'}</span>
                      <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full font-medium">
                        <svg className="inline w-4 h-4 mr-1 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        {inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : (inq.date ? new Date(inq.date).toLocaleDateString() : '—')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${status.bg} ${status.text}`}>{status.label}</span>
                    <button onClick={() => toggleInquiryExpand(id)} className="text-sm text-brand-600 font-medium underline underline-offset-2">Details</button>
                  </div>
                </div>

                {/* Progress Bar Component */}
                <div className="mt-2">
                  <InquiryProgressBar status={statusKey} progressPercentage={progressPercentage} />
                </div>

                {/* Inquiry Details */}
                <div className="mt-2 text-sm text-gray-700">
                  <div className="mb-2"><span className="font-medium text-gray-600">Requirements:</span> <span className="break-words text-gray-800">{inq.message || inq.details || inq.requirements || '—'}</span></div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span><strong>Budget:</strong> {inq.budget ? `₹${Number(inq.budget).toLocaleString('en-IN')}` : (inq.budgetRange || '—')}</span>
                    <span><strong>Location:</strong> {inq.location || '—'}</span>
                    <span><strong>Sent:</strong> {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : (inq.created ? new Date(inq.created).toLocaleString() : '—')}</span>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedInquiryIds.has(id) && (
                  <div className="mt-2 text-sm text-gray-600 space-y-2 border-t border-gray-100 pt-2">
                    {inq.hiringFor && <div><strong>Hiring For:</strong> {inq.hiringFor}</div>}
                    {inq.phone && <div><strong>Contact:</strong> {inq.phone}</div>}
                    {inq.email && <div><strong>Email:</strong> {inq.email}</div>}
                    {inq.workflowHistory && inq.workflowHistory.length > 0 && (
                      <div>
                        <strong>Workflow History:</strong>
                        <ul className="ml-4 mt-1 space-y-1">
                          {inq.workflowHistory.map((history, idx) => (
                            <li key={idx} className="text-xs">
                              {history.stage}: {history.status} ({new Date(history.updatedAt).toLocaleDateString()})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-full pt-20 lg:pt-24" style={{ backgroundColor: config.background_color }}>
      {/* Status Update Notification removed (booking feature deleted) */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {userData?.name || 'User'}!</p>
                <p className="text-xs text-brand-500 mt-1">Indori Influencer Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3m2 4h6M5 12H3m2 4h6m6 4h6m2 4h6a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex space-x-8 px-6">
            {['overview', 'inquiries', 'user'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'inquiries' && renderInquiries()}
        {activeTab === 'user' && renderUser()}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                  setPasswordSuccess('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6">
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50 flex items-center"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
