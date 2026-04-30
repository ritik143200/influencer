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

  // Filter states for User Inquiries
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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
        </div>
      </div>
    </div>
  );

  const renderOverview = () => {
    // Comprehensive inquiry statistics
    const totalInquiries = inquiries.length;
    
    // Status-based tracking for user inquiries
    const pendingInquiries = inquiries.filter(inq => 
      inq.status === 'pending' || inq.status === 'sent' || 
      (!inq.status && !inq.adminStatus)
    ).length;
    
    const acceptedByInfluencer = inquiries.filter(inq => 
      inq.status === 'accepted' || inq.status === 'artist_accepted'
    ).length;
    
    const rejectedByInfluencer = inquiries.filter(inq => 
      inq.status === 'rejected' || inq.status === 'artist_rejected'
    ).length;
    
    const acceptedByAdmin = inquiries.filter(inq => 
      inq.adminStatus === 'accepted' || inq.adminStatus === 'confirmed'
    ).length;
    
    const rejectedByAdmin = inquiries.filter(inq => 
      inq.adminStatus === 'rejected'
    ).length;
    
    const completedByAdmin = inquiries.filter(inq => 
      inq.adminStatus === 'completed' || inq.status === 'completed'
    ).length;

    const activeInquiries = Math.max(0, totalInquiries - completedByAdmin - rejectedByInfluencer - rejectedByAdmin);
    const totalRejected = rejectedByInfluencer + rejectedByAdmin;
    const successRate = totalInquiries > 0 ? Math.round((completedByAdmin / totalInquiries) * 100) : 0;

    const journeySteps = [
      { label: 'Sent', desc: 'You submitted', count: totalInquiries, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-700' },
      { label: 'Forwarded', desc: 'To influencer', count: pendingInquiries, color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700' },
      { label: 'Influencer OK', desc: 'Accepted', count: acceptedByInfluencer, color: 'bg-amber-500', light: 'bg-amber-50 text-amber-700' },
      { label: 'Admin Confirmed', desc: 'Approved', count: acceptedByAdmin, color: 'bg-indigo-500', light: 'bg-indigo-50 text-indigo-700' },
      { label: 'Completed', desc: 'Event done', count: completedByAdmin, color: 'bg-green-500', light: 'bg-green-50 text-green-700' },
    ];

    return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-white/75 text-sm font-medium mb-1">Welcome back 👋</p>
            <h2 className="text-2xl font-bold">{userData?.name || 'User'}</h2>
            <p className="text-white/70 text-sm mt-1">Here's your inquiry activity at a glance</p>
          </div>
          <div className="bg-white/15 rounded-xl px-5 py-3 text-center">
            <div className="text-4xl font-black">{successRate}%</div>
            <div className="text-white/75 text-xs mt-1">Success Rate</div>
          </div>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', value: totalInquiries, sub: 'All requests sent', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', valColor: 'text-blue-700', border: 'border-blue-100',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
          { label: 'Active', value: activeInquiries, sub: 'In progress', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', valColor: 'text-amber-700', border: 'border-amber-100',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
          { label: 'Completed', value: completedByAdmin, sub: 'Successfully done', iconBg: 'bg-green-100', iconColor: 'text-green-600', valColor: 'text-green-700', border: 'border-green-100',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
          { label: 'Rejected', value: totalRejected, sub: 'Declined requests', iconBg: 'bg-red-100', iconColor: 'text-red-500', valColor: 'text-red-600', border: 'border-red-100',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${card.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center ${card.iconColor}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{card.icon}</svg>
              </div>
              <span className={`text-3xl font-black ${card.valColor}`}>{card.value}</span>
            </div>
            <p className="text-sm font-semibold text-gray-800">{card.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Journey Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1 h-6 rounded-full bg-brand-500" />
          <h3 className="text-base font-bold text-gray-800">Inquiry Journey</h3>
          <span className="ml-auto text-xs text-gray-400">Step-by-step flow</span>
        </div>
        {/* Desktop */}
        <div className="hidden sm:flex items-start">
          {journeySteps.map((step, i) => (
            <div key={step.label} className="flex-1 flex flex-col items-center relative">
              {i < journeySteps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 ${step.count > 0 ? step.color : 'bg-gray-200'}`} />
              )}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${step.count > 0 ? step.color : 'bg-gray-200'}`}>
                {step.count > 0 ? step.count : <span className="text-gray-400 text-xs">—</span>}
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-2 text-center px-1">{step.label}</p>
              <p className="text-[10px] text-gray-400 text-center mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
        {/* Mobile */}
        <div className="flex sm:hidden flex-col gap-3">
          {journeySteps.map((step) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${step.count > 0 ? step.color : 'bg-gray-200'}`}>
                {step.count > 0 ? step.count : '—'}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${step.count > 0 ? step.light : 'bg-gray-100 text-gray-400'}`}>{step.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Status Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 rounded-full bg-brand-500" />
          <h3 className="text-base font-bold text-gray-800">Status Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Pending / Sent', count: pendingInquiries, badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-400', desc: 'Awaiting influencer response' },
            { label: 'Accepted by Influencer', count: acceptedByInfluencer, badge: 'bg-green-50 text-green-700', dot: 'bg-green-500', desc: 'Influencer approved your request' },
            { label: 'Rejected by Influencer', count: rejectedByInfluencer, badge: 'bg-red-50 text-red-600', dot: 'bg-red-400', desc: 'Influencer declined your request' },
            { label: 'Confirmed by Admin', count: acceptedByAdmin, badge: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500', desc: 'Admin approved your request' },
            { label: 'Rejected by Admin', count: rejectedByAdmin, badge: 'bg-orange-50 text-orange-700', dot: 'bg-orange-400', desc: 'Admin declined your request' },
            { label: 'Completed', count: completedByAdmin, badge: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500', desc: 'Event successfully completed' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.label}</p>
                <p className="text-[11px] text-gray-400 truncate">{item.desc}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-sm font-black flex-shrink-0 ${item.badge}`}>{item.count}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
    );
  };

  // Booking-related UI removed




  const renderInquiries = () => {
  // Filter inquiries based on filters
  const filteredInquiries = (Array.isArray(inquiries) ? inquiries : []).filter(inquiry => {
    const status = inquiry.status || 'sent';
    const adminStatus = inquiry.adminStatus || '';
    
    // Status filter - check both user status and admin status
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === status) ||
      (filterStatus === 'pending' && (status === 'pending' || status === 'sent')) ||
      (filterStatus === 'accepted' && (status === 'accepted' || status === 'artist_accepted')) ||
      (filterStatus === 'rejected' && (status === 'rejected' || status === 'artist_rejected')) ||
      (filterStatus === 'admin-accepted' && (adminStatus === 'accepted' || adminStatus === 'confirmed')) ||
      (filterStatus === 'admin-rejected' && adminStatus === 'rejected') ||
      (filterStatus === 'completed' && (adminStatus === 'completed' || status === 'completed'));
    
    // Date filter
    const matchesDate = filterDate === '' || 
      (inquiry.date && new Date(inquiry.date).toISOString().split('T')[0] === filterDate) ||
      (inquiry.eventDate && new Date(inquiry.eventDate).toISOString().split('T')[0] === filterDate) ||
      (inquiry.createdAt && new Date(inquiry.createdAt).toISOString().split('T')[0] === filterDate);
    
    // Search filter - search in title, category, and other fields
    const matchesSearch = searchTerm === '' || 
      (inquiry.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.type?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inquiry.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesDate && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Your Inquiries</h3>
        <div className="text-sm text-gray-500">
          {filteredInquiries.length} of {inquiries.length} total
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted by Influencer</option>
            <option value="rejected">Rejected by Influencer</option>
            <option value="admin-accepted">Confirmed by Admin</option>
            <option value="admin-rejected">Rejected by Admin</option>
            <option value="completed">Completed</option>
          </select>
          
          {/* Date Filter */}
          <input
            type="date"
            placeholder="Filter by date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          
          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterDate('');
              setSearchTerm('');
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loadingInquiries ? (
        <div className="p-6 text-center text-gray-500">Loading inquiries…</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {inquiries.length === 0 ? "You haven't sent any inquiries yet." : "No inquiries found matching your filters."}
        </div>
      ) : null}
      
      {inquiriesError && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">{inquiriesError}</div>
      )}
      
      {filteredInquiries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInquiries.map((inq) => {
            const id = inq.id || inq._id || JSON.stringify(inq).slice(0, 8);
            const statusKey = inq.status || inq.state || 'sent';
            const status = getStatusStyle(statusKey);
            const progressPercentage = inq.progressPercentage || 10;

            return (
              <div key={id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-4">
                {/* Top: Title, Category, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">{inq.title || 'Hiring Request'}</h4>
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
                    {inq.adminStatus && (
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                        Admin: {inq.adminStatus}
                      </span>
                    )}
                    <button onClick={() => toggleInquiryExpand(id)} className="text-sm text-brand-600 font-medium underline underline-offset-2">Details</button>
                  </div>
                </div>

                {/* Progress Bar Component */}
                <div className="mt-2">
                  <InquiryProgressBar status={statusKey} progressPercentage={progressPercentage} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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
