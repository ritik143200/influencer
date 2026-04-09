import React, { useState, useEffect } from 'react';

import { useRouter } from '../contexts/RouterContext';

import { useAuth } from '../contexts/AuthContext';

import InquiryProgressBar from '../components/InquiryProgressBar';

import AdminInfluencersManagement from '../components/AdminInfluencersManagement';

import RecentActivity from '../components/RecentActivity';



const AdminDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { user, logout } = useAuth();

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states
  const [users, setUsers] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Influencer detail modal state
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [showInfluencerModal, setShowInfluencerModal] = useState(false);
  const [selectedForwardedInfluencer, setSelectedForwardedInfluencer] = useState(null);
  const [showInfluencerDetailsModal, setShowInfluencerDetailsModal] = useState(false);
  const [loadingInfluencerDetails, setLoadingInfluencerDetails] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showInquiryDetailsModal, setShowInquiryDetailsModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Forward inquiry modal state
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardInquiryId, setForwardInquiryId] = useState(null);
  const [forwardRecipients, setForwardRecipients] = useState(new Set());

  const [analytics, setAnalytics] = useState({
    totalRevenue: 245678,
    thisMonthRevenue: 45678,
    lastMonthRevenue: 38956,
    totalUsers: users.length,
    totalInfluencers: influencers.length,
    totalInquiries: inquiries.length,
    pendingInquiries: inquiries.filter(i => (i.status || '').toLowerCase() === 'pending').length,
    processedInquiries: inquiries.filter(i => (i.status || '').toLowerCase() !== 'pending').length,
    completedInquiries: inquiries.filter(i => (i.status || '').toLowerCase() === 'completed').length,
    topInquirer: null,
    activeUsers: Math.floor(users.length * 0.8),
    conversionRate: 12.5
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter states for Users
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states for Inquiries
  const [filterStatusInquiry, setFilterStatusInquiry] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTermInquiry, setSearchTermInquiry] = useState('');

  // Filter states for Inquiries
  // Check admin role

  useEffect(() => {

    if (!user || user.role !== 'admin') {
      navigate('home');
      return;
    }

    setAdminData(user);

  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('home');
  };


  const handleOpenForwardModal = (inquiryId) => {
    setForwardInquiryId(inquiryId);
    setForwardRecipients(new Set());
    setShowForwardModal(true);
  };

  const handleViewInquiryDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryDetailsModal(true);
  };

  const handleViewInfluencerDetails = async (influencer) => {
    setLoadingInfluencerDetails(true);
    try {
      const influencerId = influencer._id || influencer.id;
      let fullInfluencerData = influencer;

      if (!influencer.email || !influencer.phone || influencer.email === 'N/A' || !influencer.categories) {
        const existing = influencers.find(i => (i._id || i.id) === influencerId);
        if (existing && (existing.email || existing.phone)) {
          fullInfluencerData = { ...influencer, ...existing };
        } else {
          const response = await fetch(`${API_BASE_URL}/api/admin/artists/${influencerId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) fullInfluencerData = data.data;
          }
        }
      }

      setSelectedForwardedInfluencer(fullInfluencerData);
      setShowInfluencerDetailsModal(true);
    } catch (err) {
      console.error('Error fetching Influencer Details:', err);
      alert('Failed to fetch complete Influencer Details. Showing available information.');
      setSelectedForwardedInfluencer(influencer);
      setShowInfluencerDetailsModal(true);
    } finally {
      setLoadingInfluencerDetails(false);
    }
  };



  // Fetch dashboard data function

  const fetchDashboardData = async (isSilent = false) => {

    try {

      if (!isSilent) setLoading(true);

      setError(null);



      // Fetch all data in parallel

      const authHeader = { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` };

      const [usersRes, inquiriesRes] = await Promise.all([

        fetch(`${API_BASE_URL}/api/admin/users`, { headers: authHeader }),

        fetch(`${API_BASE_URL}/api/admin/inquiries`, { headers: authHeader })

      ]);



      // Handle responses

      if (usersRes.ok) {

        const usersData = await usersRes.json();

        setUsers(usersData.data || usersData || []);

      }



      if (inquiriesRes.ok) {

        const inquiriesData = await inquiriesRes.json();

        setInquiries(inquiriesData.data || inquiriesData || []);

      }



      // Fetch influencers data

      const influencersRes = await fetch(`${API_BASE_URL}/api/influencer`, {

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('userToken')}`

        }

      });



      if (influencersRes.ok) {
        const influencersData = await influencersRes.json();
        const influencersArray = Array.isArray(influencersData.data) ? influencersData.data :
          Array.isArray(influencersData) ? influencersData :
            Array.isArray(influencersData.artists) ? influencersData.artists : [];

        // Filter out influencers with missing required fields and create demo influencers if needed
        const validInfluencers = influencersArray.filter(influencer =>
          influencer && influencer.email &&
          (influencer.categories && influencer.categories.length > 0 || influencer.category)
        );

        if (validInfluencers.length === 0) {
          const demoInfluencers = [
            {
              _id: 'demo1',
              fullName: 'Demo Influencer 1',
              email: 'influencer1@example.com',
              categories: ['Lifestyle'],
              profileType: 'influencer'
            }
          ];
          setInfluencers(demoInfluencers);
        } else {
          setInfluencers(validInfluencers);
        }

      } else {

        console.error('Failed to fetch influencers:', influencersRes.status, influencersRes.statusText);

        try {

          const errorData = await influencersRes.json();

          console.error('Error response:', errorData);

        } catch (e) {

          const errorText = await influencersRes.text();

          console.error('Error text:', errorText);

        }



        // Set demo artists as fallback

        const demoInfluencers = [

          {

            _id: 'demo1',

            fullName: 'Demo Influencer 1',

            email: 'influencer1@example.com',

            categories: ['Lifestyle'],

            profileType: 'influencer'

          }

        ];

        setInfluencers(demoInfluencers);

      }



      // Update analytics with real data (ensure arrays exist)

      setAnalytics({

        totalRevenue: 245678,

        thisMonthRevenue: 45678,

        lastMonthRevenue: 38956,

        totalUsers: Array.isArray(users) ? users.length : 0,

        totalInfluencers: Array.isArray(influencers) ? influencers.length : 0,

        totalInquiries: Array.isArray(inquiries) ? inquiries.length : 0,

        pendingInquiries: Array.isArray(inquiries) ? inquiries.filter(i => (i.status || '').toLowerCase() === 'pending').length : 0,

        processedInquiries: Array.isArray(inquiries) ? inquiries.filter(i => (i.status || '').toLowerCase() !== 'pending').length : 0,

        completedInquiries: Array.isArray(inquiries) ? inquiries.filter(i => (i.status || '').toLowerCase() === 'completed').length : 0,

        topInquirer: null,

        activeUsers: Array.isArray(users) ? Math.floor(users.length * 0.8) : 0,

        conversionRate: 12.5

      });



      // Fetch notifications

      try {

        const notifRes = await fetch(`${API_BASE_URL}/api/admin/notifications`, {

          headers: authHeader

        });

        if (notifRes.ok) {

          const notifData = await notifRes.json();

          // The backend returns an array directly, not wrapped in { data: [...] }

          setNotifications(Array.isArray(notifData) ? notifData : []);

        }

      } catch (notifErr) {

        console.error('Error fetching notifications:', notifErr);

        setNotifications([]);

      }

      // Fetch contacts
      try {
        const contactsRes = await fetch(`${API_BASE_URL}/api/contacts`, {
          headers: authHeader
        });

        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          setContacts(contactsData.data || []);
        }
      } catch (contactsErr) {
        console.error('Error fetching contacts:', contactsErr);
        setContacts([]);
      }



    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewAnalytics = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/overview`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      const data = await res.json();
      if (!res.ok || !data?.success) return;
      setAnalytics(prev => ({
        ...prev,
        totalUsers: data.data?.totalUsers ?? prev.totalUsers,
        totalInfluencers: data.data?.totalInfluencers ?? prev.totalInfluencers,
        totalInquiries: data.data?.totalInquiries ?? prev.totalInquiries,
        pendingInquiries: data.data?.pendingInquiries ?? prev.pendingInquiries,
        processedInquiries: data.data?.processedInquiries ?? prev.processedInquiries,
        completedInquiries: data.data?.completedInquiries ?? prev.completedInquiries,
        topInquirer: data.data?.topInquirer ?? prev.topInquirer
      }));
    } catch (e) {
      console.error('Error fetching admin overview analytics:', e);
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!adminData) return;
    fetchDashboardData();
    fetchOverviewAnalytics();
  }, [adminData, API_BASE_URL]);

  // Helper to safely render location (handles both string and object formats)
  const renderLocation = (loc) => {
    if (!loc) return 'Not specified';
    if (typeof loc === 'string') return loc;
    const { city = '', country = '' } = loc;
    const formatted = [city, country].filter(Boolean).join(', ');
    return formatted || 'Not specified';
  };

  const handleAdminInquiryAction = async (inquiryId, action) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${inquiryId}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedInquiry = data.data;
        setInquiries(prev => {
          return prev.map(i =>
            (i._id === inquiryId || i.id === inquiryId) ? updatedInquiry : i
          );
        });
        setSuccessMessage(`Inquiry ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to update inquiry');
      }
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Network error while updating inquiry.');
    }
  };

  const handleUpdateContactStatus = async (contactId, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedContact = data.data;
        setContacts(prev => prev.map(c =>
          (c._id === contactId || c.id === contactId) ? updatedContact : c
        ));
        setSelectedContact(updatedContact);
        setSuccessMessage(`Contact status updated to ${status} successfully!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to update contact');
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Network error while updating contact.');
    }
  };

  const handleAssignToArtist = async (inquiryId, artistId = null) => {

    try {

      // Validate inputs
      if (!inquiryId) {
        alert('Error: Inquiry ID is missing');
        return;
      }

      // Use provided artistId or use demo mode
      const targetId = artistId ? String(artistId).trim() : 'demo';

      if (targetId !== 'demo' && targetId.length < 10) {
        console.error('Invalid artist ID:', targetId);
        alert('Error: Invalid artist ID format');
        return;
      }

      console.log('handleAssignToArtist called with:', { inquiryId, targetId });

      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${inquiryId}/assign/${targetId}`, {

        method: 'PATCH',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${localStorage.getItem('userToken')}`

        },

        body: JSON.stringify({

          notes: artistId ? `Inquiry assigned to selected influencer` : 'Inquiry completed by admin'

        })

      });

      const data = await res.json();

      console.log('Assign response:', { status: res.status, success: data.success, message: data.message, data });

      if (res.ok && data.success) {

        setInquiries(prev => prev.map(i =>

          (i._id === inquiryId || i.id === inquiryId) ? data.data : i

        ));

        // Also update selectedInquiry if it's the same one
        if (selectedInquiry && (selectedInquiry._id === inquiryId || selectedInquiry.id === inquiryId)) {

          setSelectedInquiry(data.data);

        }

        setSuccessMessage('Inquiry assigned successfully! Other influencers have been auto-rejected.');

        setTimeout(() => setSuccessMessage(null), 4000);

      } else {

        const errorMsg = data.message || `Assignment failed (Status: ${res.status})`;
        console.error('Assignment failed:', { 
          errorMsg, 
          errorName: data.errorName, 
          errorDetails: data.errorDetails,
          fullResponse: data 
        });
        alert(errorMsg);

      }

    } catch (err) {

      console.error('Error assigning inquiry:', err);

      alert('Network error while assigning inquiry: ' + err.message);

    }

  };



  const handleToggleRecipient = (artistId) => {

    setForwardRecipients(prev => {

      const next = new Set(prev);

      if (next.has(artistId)) next.delete(artistId);

      else next.add(artistId);

      return next;

    });

  };



  const handleConfirmForward = async () => {

    if (!forwardInquiryId) return;

    const recipients = Array.from(forwardRecipients);

    if (recipients.length === 0) {

      alert('Select at least one artist to forward to');

      return;

    }

    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${forwardInquiryId}/forward`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },

        body: JSON.stringify({ recipients })

      });

      const data = await res.json();

      if (res.ok && data.success) {

        // Update the inquiry in state

        setInquiries(prev => prev.map(i => (i._id === forwardInquiryId || i.id === forwardInquiryId) ? data.data : i));

        setShowForwardModal(false);

        setForwardInquiryId(null);

        setForwardRecipients(new Set());

        setSuccessMessage('Inquiry forwarded successfully');

        setTimeout(() => setSuccessMessage(null), 3000);

      } else {

        alert(data.message || 'Failed to forward inquiry');

      }

    } catch (err) {

      console.error('Error forwarding inquiry:', err);

      alert('Network error while forwarding inquiry');

    }

  };



  const handleMarkAllNotificationsRead = async () => {

    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/read-all`, {

        method: 'PATCH',

        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }

      });

      if (res.ok) {

        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      }

    } catch (err) {

      console.error('Failed to mark all as read:', err);

    }

  };



  const handleMarkNotificationRead = async (id) => {

    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/notifications/${id}/read`, {

        method: 'PATCH',

        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }

      });

      if (res.ok) {

        setNotifications(prev =>

          prev.map(n => (n._id === id || n.id === id) ? { ...n, isRead: true } : n)

        );

      }

    } catch (err) {

      console.error('Failed to mark notification as read:', err);

    }

  };



  // User management functions

  const handleViewUserDetails = (user) => {

    setSelectedUser(user);

    setShowUserModal(true);

  };



  const handleUpdateUserStatus = async (userId, action) => {

    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/${action}`, {

        method: 'POST',

        headers: {

          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,

          'Content-Type': 'application/json'

        }

      });



      if (res.ok) {

        const updatedUser = await res.json();

        setUsers(prev => prev.map(u => (u._id === userId || u.id === userId) ? updatedUser : u));

        setSuccessMessage(`User status updated to ${updatedUser.status} successfully!`);

        setTimeout(() => setSuccessMessage(null), 3000);



        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {

          setSelectedUser(updatedUser);

        }

      } else {

        const errorData = await res.json();

        alert(errorData.message || 'Failed to update user status');

      }

    } catch (err) {

      console.error('Error updating user status:', err);

      alert('Network error while updating user status');

    }

  };



  const handleDeleteUser = async (userId) => {

    if (!window.confirm('Are you sure you want to delete this user permanently? This action cannot be undone.')) {

      return;

    }



    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {

        method: 'DELETE',

        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }

      });



      if (res.ok) {

        setUsers(prev => prev.filter(u => u._id !== userId && u.id !== userId));

        setSuccessMessage('User deleted successfully');

        setTimeout(() => setSuccessMessage(null), 3000);

        if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {

          setShowUserModal(false);

          setSelectedUser(null);

        }

      } else {

        const errorData = await res.json();

        alert(errorData.message || 'Failed to delete user');

      }

    } catch (err) {

      console.error('Error deleting user:', err);

      alert('Network error while deleting user');

    }

  };



  const handleToggleInfluencerStatus = async (influencerId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch(`${API_BASE_URL}/api/admin/influencer/${influencerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const updatedInfluencer = data.data;

        // Update influencers list
        setInfluencers(prev => prev.map(i =>
          (i._id === influencerId || i.id === influencerId) ? updatedInfluencer : i
        ));

        // Update selected influencer if open in modal
        if (selectedInfluencer && (selectedInfluencer._id === influencerId || selectedInfluencer.id === influencerId)) {
          setSelectedInfluencer(updatedInfluencer);
        }

        // Update selected forwarded influencer if open in modal
        if (selectedForwardedInfluencer && (selectedForwardedInfluencer._id === influencerId || selectedForwardedInfluencer.id === influencerId)) {
          setSelectedForwardedInfluencer(updatedInfluencer);
        }

        setSuccessMessage(`Influencer ${newStatus ? 'activated' : 'deactivated'} successfully!`);

        // Don't refresh entire dashboard - just update local state
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to update influencer status');
      }
    } catch (err) {
      console.error('Error updating influencer status:', err);
      alert('Network error while updating influencer status');
    }
  };



  // Artist detail view functions

  const handleViewArtist = (artist) => {

    setselectedInfluencer(artist);

    setshowInfluencerModal(true);

  };



  const handleCloseArtistModal = () => {

    setshowInfluencerModal(false);

    setselectedInfluencer(null);

  };



  // Theme-consistent colors from landing page

  const getThemeColor = (type) => {

    const colors = {

      primary: config?.primary_action || '#ee7711',

      secondary: config?.secondary_action || '#6b7280',

      surface: config?.surface_color || '#ffffff',

      background: config?.background_color || '#f9fafb',

      text: config?.text_color || '#1f2937'

    };

    return colors[type] || colors.text;

  };



  // Category colors from landing page

  const getCategoryColors = (index) => {

    const categoryColors = [

      'from-purple-500 to-indigo-600',

      'from-pink-500 to-rose-600',

      'from-blue-500 to-cyan-600',

      'from-amber-500 to-orange-600',

      'from-emerald-500 to-teal-600',

      'from-violet-500 to-purple-600',

      'from-red-500 to-pink-600',

      'from-yellow-500 to-amber-600'

    ];

    return categoryColors[index % categoryColors.length];

  };



  // Overview component with landing page theme

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Overview Header with Refresh Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: getThemeColor('text') }}>
          Overview Dashboard
        </h2>
        <button
          onClick={() => fetchOverviewAnalytics(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isRefreshing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md'
            }`}
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards - Theme Consistent */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(0)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

          <div className="relative p-6">

            <div className="flex items-center justify-between mb-4">

              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(0)} rounded-2xl flex items-center justify-center shadow-lg`}>

                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />

                </svg>

              </div>

              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                ₹{(analytics.totalRevenue / 100000).toFixed(1)}L

              </span>

            </div>

            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Total Revenue</h3>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">

                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">

                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />

                </svg>

                +{((analytics.thisMonthRevenue - analytics.lastMonthRevenue) / analytics.lastMonthRevenue * 100).toFixed(1)}%

              </span>

              <span className="text-xs" style={{ color: getThemeColor('secondary') }}>from last month</span>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(1)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

          <div className="relative p-6">

            <div className="flex items-center justify-between mb-4">

              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(1)} rounded-2xl flex items-center justify-center shadow-lg`}>

                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />

                </svg>

              </div>

              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                {analytics.totalUsers}

              </span>

            </div>

            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Total Users</h3>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">

                Active: {analytics.activeUsers}

              </span>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(2)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

          <div className="relative p-6">

            <div className="flex items-center justify-between mb-4">

              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(2)} rounded-2xl flex items-center justify-center shadow-lg`}>

                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

                </svg>

              </div>

              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                {analytics.totalInfluencers}

              </span>

            </div>

            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Total Influencers</h3>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">

                Verified/Pending

              </span>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(3)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

          <div className="relative p-6">

            <div className="flex items-center justify-between mb-4">

              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(3)} rounded-2xl flex items-center justify-center shadow-lg`}>

                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                </svg>

              </div>

              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                {analytics.totalInquiries}

              </span>

            </div>

            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Total Inquiries</h3>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">

                Pending: {analytics.pendingInquiries}

              </span>

            </div>

          </div>

        </div>



        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(5)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

          <div className="relative p-6">

            <div className="flex items-center justify-between mb-4">

              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(5)} rounded-2xl flex items-center justify-center shadow-lg`}>

                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m-6 6v2a4 4 0 004 4h4m-6-6H9m8-8V7a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />

                </svg>

              </div>

              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                {analytics.processedInquiries}

              </span>

            </div>

            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Processed Inquiries</h3>

            <div className="flex items-center gap-2">

              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">

                Active/Done

              </span>

            </div>

          </div>

        </div>

        <div className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          style={{ backgroundColor: getThemeColor('surface') }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(7)} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${getCategoryColors(7)} rounded-2xl flex items-center justify-center shadow-lg`}>
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-2.627 3.42 3.42 0 002.627 1.946 3.42 3.42 0 001.946 2.627 3.42 3.42 0 002.627-1.946 3.42 3.42 0 00-1.946-2.627 3.42 3.42 0 00-2.627-1.946 3.42 3.42 0 00-1.946 2.627z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: getThemeColor('text') }}>
                {analytics.completedInquiries}
              </span>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Fully Completed Inquiries</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Admin Completed
              </span>
            </div>
          </div>
        </div>

      </div>



      <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"

        style={{ backgroundColor: getThemeColor('surface') }}>

        <div className={`bg-gradient-to-r ${getCategoryColors(6)} p-6`}>

          <h3 className="text-xl font-bold text-white flex items-center gap-2">

            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />

            </svg>

            Top Inquirer

          </h3>

        </div>

        <div className="p-6">

          {analytics.topInquirer ? (

            <div className="flex items-center justify-between gap-4">

              <div className="min-w-0">

                <div className="font-semibold text-gray-800 truncate">

                  {analytics.topInquirer.name || 'Unknown user'}

                </div>

                <div className="text-sm text-gray-500 truncate">

                  {analytics.topInquirer.email || analytics.topInquirer.userId}

                </div>

              </div>

              <div className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">

                {analytics.topInquirer.inquiriesCount} inquiries

              </div>

            </div>

          ) : (

            <div className="text-sm text-gray-500">No inquiry data yet</div>

          )}

        </div>

      </div>



      {/* Recent Activity - Theme Consistent */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          style={{ backgroundColor: getThemeColor('surface') }}>
          <div className={`bg-gradient-to-r ${getCategoryColors(4)} p-6`}>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <RecentActivity API_BASE_URL={API_BASE_URL} getThemeColor={getThemeColor} />
          </div>
        </div>



        <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"

          style={{ backgroundColor: getThemeColor('surface') }}>

          <div className={`bg-gradient-to-r ${getCategoryColors(5)} p-6`}>

            <h3 className="text-xl font-bold text-white flex items-center gap-2">

              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />

              </svg>

              Quick Stats

            </h3>

          </div>

          <div className="p-6 space-y-4">

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">

              <span className="font-medium text-blue-800">Conversion Rate</span>

              <span className="text-2xl font-bold text-blue-600">{analytics.conversionRate}%</span>

            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">

              <span className="font-medium text-green-800">Total Influencers</span>

              <span className="text-2xl font-bold text-green-600">{analytics.totalInfluencers}</span>

            </div>

            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-xl">

              <span className="font-medium text-orange-800">Avg. Booking Value</span>

              <span className="text-2xl font-bold text-orange-600">₹2,500</span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );



  // Keep all other existing functions unchanged but with theme consistency

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
                <option value="artist" className="text-gray-900">Artist</option>
                <option value="influencer" className="text-gray-900">Influencer</option>
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
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400">No users found matching your filters.</div>
              </div>
            ) : filteredUsers.map((user) => (
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
            ))}
          </div>
        </div>
      </div>
    );
  };









  const renderInquiries = () => {
    // Filter inquiries based on filters
    const filteredInquiries = (Array.isArray(inquiries) ? inquiries : []).filter(inquiry => {
      const status = inquiry.status || 'sent';
      const matchesStatus = filterStatusInquiry === 'all' || status === filterStatusInquiry;
      const matchesSearch = searchTermInquiry === '' ||
        (inquiry.hiringFor?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
          inquiry.name?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
          inquiry.email?.toLowerCase().includes(searchTermInquiry.toLowerCase()) ||
          (inquiry.userId && typeof inquiry.userId === 'object' && inquiry.userId.name?.toLowerCase().includes(searchTermInquiry.toLowerCase())));

      return matchesStatus && matchesSearch;
    });

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
                <option value="artist_accepted" className="text-gray-900">Artist Accepted</option>
                <option value="artist_rejected" className="text-gray-900">Artist Rejected</option>
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
            {filteredInquiries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-gray-400">No inquiries found matching your filters.</div>
              </div>
            ) : filteredInquiries.map((inquiry) => {
              const inquiryId = inquiry._id || inquiry.id;
              const status = inquiry.status || 'sent';

              return (
                <div key={inquiryId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                  {/* Header Row */}
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          #{String(inquiryId).slice(-6)}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status === 'admin_accepted' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'admin_rejected' ? 'bg-red-100 text-red-800' :
                              status === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                                status === 'artist_accepted' ? 'bg-green-100 text-green-800' :
                                  status === 'artist_rejected' ? 'bg-red-100 text-red-800' :
                                    status === 'completed' ? 'bg-green-100 text-green-800' :
                                      'bg-blue-100 text-blue-800'
                          }`}>
                          {status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* User Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">User Information</h4>
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">{inquiry.userId?.name || inquiry.name}</div>
                            <div className="text-xs text-gray-400">{inquiry.userId?.email || inquiry.email}</div>
                          </div>
                        </div>

                        {/* Requirement */}
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Requirement</h4>
                          <div className="text-sm text-gray-600">
                            <div className="font-medium text-gray-700 capitalize">{inquiry.hiringFor}</div>
                            <div className="text-xs text-gray-500">{inquiry.category} · {renderLocation(inquiry.location)}</div>
                            {inquiry.budget !== undefined && inquiry.budget !== null && (
                              <div className="text-xs text-gray-500">Budget: ₹{Number(inquiry.budget).toLocaleString('en-IN')}</div>
                            )}
                          </div>
                        </div>

                        {/* Event Details */}
                        <div>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">Event Details</h4>
                          <div className="text-sm text-gray-600">
                            {/* Event Type Removed */}
                            <div className="text-xs text-gray-500 truncate">{inquiry.requirements || '-'}</div>
                            <div className="text-xs text-gray-500">
                              {inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString('en-IN') : '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="lg:w-32">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">Progress</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${inquiry.progressPercentage || 10}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{inquiry.progressPercentage || 10}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Forwarded To Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">Forwarded To</h4>
                    {(() => {
                      const isBeingForwarded = (inquiryId === forwardInquiryId);
                      const currentForwarded = Array.isArray(inquiry.forwardedTo) ? inquiry.forwardedTo : [];
                      const selectingIds = isBeingForwarded ? Array.from(forwardRecipients) : [];

                      // Filter out selectingIds that are already in currentForwarded
                      const extraSelectingIds = selectingIds.filter(id =>
                        !currentForwarded.some(f => (typeof f === 'string' ? f : (f.userId?._id || f.userId || f._id || f.id)) === id)
                      );

                      const allItemsToDisplay = [...currentForwarded, ...extraSelectingIds];

                      if (allItemsToDisplay.length === 0) {
                        return <span className="text-gray-400 text-xs italic">Not forwarded</span>;
                      }

                      return (
                        <div className="flex flex-wrap gap-2">
                          {allItemsToDisplay.slice(0, 3).map((item, index) => {
                            const isSelecting = isBeingForwarded && (typeof item === 'string' && selectingIds.includes(item));
                            const influencerId = (typeof item === 'object' && item !== null)
                              ? (item.userId?._id || item.userId || item._id || item.id)
                              : item;

                            // Try to get influencer details from populated field first, otherwise look in influencers array
                            const influencer = (typeof item === 'object' && item !== null && item.userId && typeof item.userId === 'object' && (item.userId.fullName || item.userId.name))
                              ? item.userId
                              : (typeof item === 'object' && item !== null && (item.fullName || item.name))
                                ? item
                                : influencers.find(i => (i._id === influencerId || i.id === influencerId));

                            const name = influencer?.fullName || influencer?.name || influencer?.artistName || (influencerId ? `Influencer ${String(influencerId).slice(-4)}` : 'Unknown');
                            const category = (influencer?.categories && influencer?.categories.length > 0)
                              ? influencer.categories[0]
                              : (influencer?.category || influencer?.profileType || 'N/A');

                            return (
                              <div key={influencerId || index} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isSelecting
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-purple-50 border-purple-200'
                                }`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${isSelecting
                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                    : 'bg-purple-100 text-purple-700 border-purple-200'
                                  }`}>
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`text-[11px] font-semibold truncate ${isSelecting ? 'text-blue-600' : 'text-gray-700'
                                      }`}>
                                      {name}
                                      {isSelecting && <span className="ml-1 text-[9px] font-normal italic">(Selecting...)</span>}
                                    </span>
                                  </div>
                                  <div className="text-[9px] text-gray-400 font-medium uppercase truncate tracking-wider">{category}</div>
                                </div>
                              </div>
                            );
                          })}
                          {allItemsToDisplay.length > 3 && (
                            <div className="text-[10px] text-purple-600 font-bold px-3 py-2">
                              +{allItemsToDisplay.length - 3} more influencers
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderContacts = () => (
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
          {!contacts || contacts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400">No contact submissions found.</div>
            </div>
          ) : contacts.map((contact) => (
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

                <div className="flex gap-2">
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
            </div>
          ))}
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
                  <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Status</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedContact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedContact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedContact.status || 'pending'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Subject</p>
                <p className="text-gray-900">{selectedContact.subject}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Message</p>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedContact.message}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase mb-2">Submitted On</p>
                <p className="text-gray-900">{new Date(selectedContact.createdAt).toLocaleString('en-IN')}</p>
              </div>
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
      )}
    </div>
  );

  const renderAnalytics = () => (

    <div className="rounded-2xl shadow-lg border border-gray-100 p-8"

      style={{ backgroundColor: getThemeColor('surface') }}>

      <h3 className="text-2xl font-bold mb-6" style={{ color: getThemeColor('text') }}>

        Analytics Dashboard

      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div className={`bg-gradient-to-br ${getCategoryColors(5)} bg-opacity-10 rounded-2xl p-6`}>

          <h4 className="text-lg font-semibold mb-4">Revenue Overview</h4>

          <div className="space-y-3">

            <div className="flex justify-between">

              <span>This Month</span>

              <span className="font-bold">₹{analytics.thisMonthRevenue.toLocaleString()}</span>

            </div>

            <div className="flex justify-between">

              <span>Last Month</span>

              <span className="font-bold">₹{analytics.lastMonthRevenue.toLocaleString()}</span>

            </div>

            <div className="flex justify-between">

              <span>Total</span>

              <span className="font-bold">₹{analytics.totalRevenue.toLocaleString()}</span>

            </div>

          </div>

        </div>



        <div className={`bg-gradient-to-br ${getCategoryColors(0)} bg-opacity-10 rounded-2xl p-6`}>

          <h4 className="text-lg font-semibold mb-4">User Analytics</h4>

          <div className="space-y-3">

            <div className="flex justify-between">

              <span>Total Users</span>

              <span className="font-bold">{analytics.totalUsers}</span>

            </div>

            <div className="flex justify-between">

              <span>Active Users</span>

              <span className="font-bold">{analytics.activeUsers}</span>

            </div>

            <div className="flex justify-between">

              <span>Conversion Rate</span>

              <span className="font-bold">{analytics.conversionRate}%</span>

            </div>

          </div>

        </div>

      </div>

    </div>

  );



  const renderSettings = () => (

    <div className="rounded-2xl shadow-lg border border-gray-100 p-8"

      style={{ backgroundColor: getThemeColor('surface') }}>

      <h3 className="text-2xl font-bold mb-6" style={{ color: getThemeColor('text') }}>

        Admin Settings

      </h3>

      <div className="space-y-6">

        <div className="bg-gray-50 rounded-2xl p-6">

          <h4 className="text-lg font-semibold mb-4">Platform Configuration</h4>

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <span>Enable Email Notifications</span>

              <button className="w-12 h-6 bg-blue-500 rounded-full relative">

                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>

              </button>

            </div>

            <div className="flex items-center justify-between">

              <span>Maintenance Mode</span>

              <button className="w-12 h-6 bg-gray-300 rounded-full relative">

                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>

              </button>

            </div>

          </div>

        </div>



        <div className="bg-gray-50 rounded-2xl p-6">

          <h4 className="text-lg font-semibold mb-4">Security Settings</h4>

          <div className="space-y-4">

            <div className="flex items-center justify-between">

              <span>Two-Factor Authentication</span>

              <button className="w-12 h-6 bg-blue-500 rounded-full relative">

                <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></span>

              </button>

            </div>

            <div className="flex items-center justify-between">

              <span>Session Timeout</span>

              <select className="px-3 py-1 border border-gray-300 rounded-xl">

                <option>30 minutes</option>

                <option>1 hour</option>

                <option>2 hours</option>

              </select>

            </div>

          </div>

        </div>

      </div>

    </div>

  );



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



  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: getThemeColor('background') }}>

        <div className="text-center">

          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>

          <p className="font-medium" style={{ color: getThemeColor('text') }}>Loading Admin Dashboard...</p>

        </div>

      </div>

    );

  }



  if (error) {

    return (

      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: getThemeColor('background') }}>

        <div className="text-center">

          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>

          <p style={{ color: getThemeColor('secondary') }}>{error}</p>

        </div>

      </div>

    );

  }



  // Add top padding to prevent overlap with fixed navbar (assume navbar height ~80px)

  return (

    <div className="min-h-screen pt-20" style={{ backgroundColor: getThemeColor('background') }}>

      {/* Theme-Consistent Header */}

      <div className="shadow-lg border-b border-gray-100" style={{ backgroundColor: getThemeColor('surface') }}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="py-6">

            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">

              <div className="flex items-center gap-4">

                <div className={`w-12 h-12 bg-gradient-to-br ${getCategoryColors(0)} rounded-2xl flex items-center justify-center shadow-lg`}>

                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />

                  </svg>

                </div>

                <div>

                  <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: getThemeColor('text') }}>

                    Admin Dashboard

                  </h1>

                  <p className="text-sm font-medium" style={{ color: getThemeColor('secondary') }}>

                    Welcome back, {adminData?.name || 'Super Admin'}! 🎉

                  </p>

                  <p className="text-xs font-semibold mt-1" style={{ color: getThemeColor('primary') }}>

                    Indori Influencer Platform - Real-time Management

                  </p>

                </div>

              </div>



              <div className="flex items-center gap-4">

                {/* Notifications */}

                <div className="relative">

                  <button

                    onClick={() => setShowNotifications(!showNotifications)}

                    className="relative p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-105"

                  >

                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />

                    </svg>

                    {notifications.filter(n => !n.isRead).length > 0 && (

                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">

                        {notifications.filter(n => !n.isRead).length}

                      </span>

                    )}

                  </button>



                  {/* Notifications Dropdown */}

                  {showNotifications && (

                    <div className="absolute right-0 mt-2 w-96 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"

                      style={{ backgroundColor: getThemeColor('surface') }}>

                      <div className={`bg-gradient-to-r ${getCategoryColors(0)} p-4 flex justify-between items-center`}>

                        <h3 className="font-bold text-white">Notifications</h3>

                        {notifications.filter(n => !n.isRead).length > 0 && (

                          <button

                            onClick={handleMarkAllNotificationsRead}

                            className="text-xs text-white hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded transition-colors"

                          >

                            Mark all read

                          </button>

                        )}

                      </div>

                      <div className="max-h-96 overflow-y-auto">

                        {notifications.map((notification) => (

                          <div

                            key={notification._id || notification.id}

                            onClick={() => handleMarkNotificationRead(notification._id || notification.id)}

                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50' : ''

                              }`}

                          >

                            <div className="flex items-start gap-3">

                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>

                              <div className="flex-1">

                                <h4 className="font-semibold text-sm capitalize" style={{ color: getThemeColor('text') }}>

                                  {notification.type} Notification

                                </h4>

                                <p className="text-xs text-gray-600 mt-1">{notification.message}</p>

                                <p className="text-xs text-gray-400 mt-2">

                                  {notification.createdAt

                                    ? new Date(notification.createdAt).toLocaleString('en-IN')

                                    : notification.time || 'Just now'}

                                </p>

                              </div>

                            </div>

                          </div>

                        ))}

                      </div>

                    </div>

                  )}

                </div>



                {/* User Profile */}

                <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-2">

                  <div className={`w-8 h-8 bg-gradient-to-br ${getCategoryColors(0)} rounded-full flex items-center justify-center`}>

                    <span className="text-white text-sm font-bold">A</span>

                  </div>

                  <div className="hidden sm:block">

                    <p className="text-sm font-semibold" style={{ color: getThemeColor('text') }}>{adminData?.name || 'Admin'}</p>

                    <p className="text-xs text-gray-500">Administrator</p>

                  </div>

                </div>



                {/* Logout Button */}

                <button

                  onClick={handleLogout}

                  className="px-4 py-2 text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 hover:scale-105 shadow-lg"

                  style={{ backgroundColor: getThemeColor('primary') }}

                >

                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />

                  </svg>

                  Logout

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>



      {/* Theme-Consistent Navigation Tabs */}

      <div className="shadow-lg border-b border-gray-100 sticky top-0 z-40" style={{ backgroundColor: getThemeColor('surface') }}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex overflow-x-auto space-x-2 sm:space-x-4 scrollbar-hide">

            {['overview', 'users', 'influencers', 'inquiries', 'contacts', 'analytics', 'settings'].map((tab, index) => (

              <button

                key={tab}

                onClick={() => setActiveTab(tab)}

                className={`group relative px-6 py-4 font-medium text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 rounded-t-xl ${activeTab === tab

                  ? 'text-white'

                  : 'text-gray-600 hover:text-gray-900'

                  }`}

                style={{

                  backgroundColor: activeTab === tab ? undefined : 'transparent'

                }}

              >

                {activeTab === tab && (

                  <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColors(index)} rounded-t-xl`}></div>

                )}

                <span className="relative flex items-center gap-2">

                  <span className="text-lg">

                    {tab === 'overview' && '📊'}

                    {tab === 'users' && '👥'}

                    {tab === 'influencers' && '🎨'}

                    {tab === 'inquiries' && '💬'}
                    {tab === 'contacts' && '📧'}
                    {tab === 'analytics' && '📈'}
                    {tab === 'settings' && '⚙️'}

                  </span>

                  <span className="hidden sm:inline capitalize">{tab}</span>

                </span>

              </button>

            ))}

          </div>

        </div>

      </div>



      {/* Main Content */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {activeTab === 'overview' && renderOverview()}

        {activeTab === 'users' && renderUsers()}

        {activeTab === 'influencers' && (

          <AdminInfluencersManagement

            influencers={influencers}

            onRefreshInfluencers={() => fetchDashboardData(true)}

          />

        )}

        {activeTab === 'inquiries' && renderInquiries()}

        {activeTab === 'contacts' && renderContacts()}

        {activeTab === 'analytics' && renderAnalytics()}

        {activeTab === 'settings' && renderSettings()}

      </div>



      {/* Influencer Detail Modal */}

      {showInfluencerModal && selectedInfluencer && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className={`bg-gradient-to-r ${getCategoryColors(2)} p-6 rounded-t-2xl`}>

              <div className="flex justify-between items-start">

                <div className="flex items-center gap-4">

                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">

                    {selectedInfluencer.profileImage ? (

                      <img src={selectedInfluencer.profileImage} alt={selectedInfluencer.firstName} className="w-16 h-16 rounded-full object-cover" />

                    ) : (

                      <span className="text-white text-2xl font-bold">

                        {selectedInfluencer.firstName?.charAt(0)?.toUpperCase() || 'A'}

                      </span>

                    )}

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold text-white">

                      {selectedInfluencer.firstName} {selectedInfluencer.lastName}

                    </h2>

                    <p className="text-white/80 mt-1">

                      {selectedInfluencer.InfluencerType || 'Professional Artist'}

                    </p>

                    <div className="flex items-center gap-2 mt-2">

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${selectedInfluencer.isActive !== false

                          ? 'bg-green-100 text-green-700'

                          : 'bg-red-100 text-red-700'

                        }`}>

                        <div className={`w-2 h-2 rounded-full ${selectedInfluencer.isActive !== false ? 'bg-green-500' : 'bg-red-500'

                          }`} />

                        {selectedInfluencer.isActive !== false ? 'Active' : 'Inactive'}

                      </span>

                    </div>

                  </div>

                </div>

                <button

                  onClick={handleCloseArtistModal}

                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"

                >

                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                  </svg>

                </button>

              </div>

            </div>



            {/* Modal Body */}

            <div className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Information */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                    </svg>

                    Personal Information

                  </h3>

                  <div className="space-y-3">

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-gray-500">First Name</p>

                        <p className="font-medium text-gray-900">{selectedInfluencer.firstName || 'Not provided'}</p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Last Name</p>

                        <p className="font-medium text-gray-900">{selectedInfluencer.lastName || 'Not provided'}</p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Email Address</p>

                      <p className="font-medium text-gray-900">{selectedInfluencer.email || 'Not provided'}</p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Phone Number</p>

                      <p className="font-medium text-gray-900">{selectedInfluencer.phone || 'Not provided'}</p>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-gray-500">Date of Birth</p>

                        <p className="font-medium text-gray-900">

                          {selectedInfluencer.dateOfBirth ? new Date(selectedInfluencer.dateOfBirth).toLocaleDateString() : 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Gender</p>

                        <p className="font-medium text-gray-900 capitalize">

                          {selectedInfluencer.gender || 'Not specified'}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>



                {/* Category Selection */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />

                    </svg>

                    Category Selection

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Artist Type</p>

                      <p className="font-medium text-gray-900 capitalize">

                        {selectedInfluencer.InfluencerType || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Category</p>

                      <div className="flex flex-wrap gap-1 mt-1">

                        {selectedInfluencer.category ? (

                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">

                            {selectedInfluencer.category}

                          </span>

                        ) : (

                          <span className="text-gray-500 text-sm">No category specified</span>

                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Subcategory</p>

                      <p className="font-medium text-gray-900 capitalize">

                        {selectedInfluencer.subcategory || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Skills</p>

                      <div className="flex flex-wrap gap-1 mt-1">

                        {selectedInfluencer.skills?.length > 0 ? (

                          selectedInfluencer.skills.map((skill, idx) => (

                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">

                              {skill}

                            </span>

                          ))

                        ) : (

                          <span className="text-gray-500 text-sm">No skills specified</span>

                        )}

                      </div>

                    </div>

                  </div>

                </div>



                {/* Professional Information */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                    </svg>

                    Professional Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Experience</p>

                      <p className="font-medium text-gray-900">

                        {selectedInfluencer.experience ? `${selectedInfluencer.experience} years` : 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Bio / Description</p>

                      <p className="font-medium text-gray-900 text-sm leading-relaxed">

                        {selectedInfluencer.bio || 'No bio provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Location</p>

                      <p className="font-medium text-gray-900">
                        {renderLocation(selectedInfluencer.location)}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Registration Date</p>

                      <p className="font-medium text-gray-900">

                        {selectedInfluencer.createdAt ? new Date(selectedInfluencer.createdAt).toLocaleDateString() : 'Not available'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Budget Information */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />

                    </svg>

                    Expected Budget Range

                  </h3>

                  <div className="space-y-3">

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-gray-500">Starting From</p>

                        <p className="font-medium text-gray-900">

                          {selectedInfluencer.budgetMin ? `₹${selectedInfluencer.budgetMin}` : 'Not specified'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Upto</p>

                        <p className="font-medium text-gray-900">

                          {selectedInfluencer.budgetMax ? `₹${selectedInfluencer.budgetMax}` : 'Not specified'}

                        </p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Status</p>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${selectedInfluencer.isActive !== false

                          ? 'bg-green-100 text-green-700'

                          : 'bg-red-100 text-red-700'

                        }`}>

                        <div className={`w-2 h-2 rounded-full ${selectedInfluencer.isActive !== false ? 'bg-green-500' : 'bg-red-500'

                          }`} />

                        {selectedInfluencer.isActive !== false ? 'Active' : 'Inactive'}

                      </span>

                    </div>

                  </div>

                </div>



                {/* Portfolio & Social Links */}

                <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />

                    </svg>

                    Portfolio & Social Links

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Portfolio Files</p>

                      <div className="flex flex-wrap gap-2 mt-1">

                        {selectedInfluencer.portfolio?.length > 0 ? (

                          selectedInfluencer.portfolio.map((file, idx) => (

                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">

                              {file.name || `File ${idx + 1}`}

                            </span>

                          ))

                        ) : (

                          <span className="text-gray-500 text-sm">No portfolio files uploaded</span>

                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Social Media Links</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">

                        {selectedInfluencer.socialLinks?.instagram && (

                          <div className="flex items-center gap-2">

                            <span className="text-pink-600">📷</span>

                            <a href={selectedInfluencer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"

                              className="text-purple-600 hover:text-purple-700 text-sm">

                              Instagram

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.youtube && (

                          <div className="flex items-center gap-2">

                            <span className="text-red-600">📺</span>

                            <a href={selectedInfluencer.socialLinks.youtube} target="_blank" rel="noopener noreferrer"

                              className="text-purple-600 hover:text-purple-700 text-sm">

                              YouTube

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.facebook && (

                          <div className="flex items-center gap-2">

                            <span className="text-blue-600">📘</span>

                            <a href={selectedInfluencer.socialLinks.facebook} target="_blank" rel="noopener noreferrer"

                              className="text-purple-600 hover:text-purple-700 text-sm">

                              Facebook

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.website && (

                          <div className="flex items-center gap-2">

                            <span className="text-gray-600">🌐</span>

                            <a href={selectedInfluencer.socialLinks.website} target="_blank" rel="noopener noreferrer"

                              className="text-purple-600 hover:text-purple-700 text-sm">

                              Website

                            </a>

                          </div>

                        )}

                        {(!selectedInfluencer.socialLinks?.instagram && !selectedInfluencer.socialLinks?.youtube &&

                          !selectedInfluencer.socialLinks?.facebook && !selectedInfluencer.socialLinks?.website) && (

                            <span className="text-gray-500 text-sm">No social links provided</span>

                          )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">ID Proof Status</p>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${selectedInfluencer.idProof ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'

                        }`}>

                        {selectedInfluencer.idProof ? '✓ Verified' : '⏳ Pending'}

                      </span>

                    </div>

                  </div>

                </div>

              </div>



              {/* Modal Footer */}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">

                <button

                  onClick={handleCloseArtistModal}

                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"

                >

                  Close

                </button>

                <button

                  onClick={() => handleToggleInfluencerStatus(selectedInfluencer._id || selectedInfluencer.id, selectedInfluencer.isActive !== false)}

                  className={`px-6 py-2 text-white rounded-xl font-medium transition-colors ${selectedInfluencer.isActive !== false

                      ? 'bg-red-600 hover:bg-red-700'

                      : 'bg-green-600 hover:bg-green-700'

                    }`}

                >

                  {selectedInfluencer.isActive !== false ? 'Deactivate Artist' : 'Activate Artist'}

                </button>

                <button

                  className="px-6 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"

                  style={{ backgroundColor: getThemeColor('primary') }}

                >

                  Edit Artist

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Forward Inquiry Modal */}

      {showForwardModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">

            <div className={`p-6 border-b border-gray-100 flex justify-between items-center`}>

              <h3 className="text-xl font-bold">Forward Inquiry</h3>

              <button onClick={() => setShowForwardModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>

            </div>

            <div className="p-6 space-y-4">

              <p className="text-sm text-gray-600">Select one or more influencers to forward this inquiry to.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {influencers.length === 0 ? (

                  <div className="text-gray-400">No influencers available</div>

                ) : influencers.map(i => {

                  const aid = i._id || i.id;

                  const checked = forwardRecipients.has(aid);

                  return (

                    <label key={aid} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">

                      <input type="checkbox" checked={checked} onChange={() => handleToggleRecipient(aid)} />

                      <div className="flex-1">

                        <div className="font-medium text-gray-800">

                          {i.fullName || i.name || `Influencer ${aid?.slice(-6)}`}

                        </div>

                        <div className="text-xs text-gray-500">

                          {i.categories?.join(', ') || i.category || 'General'} · {i.email}

                        </div>

                      </div>

                    </label>

                  );

                })}

              </div>



              <div className="flex justify-end gap-3">

                <button onClick={() => setShowForwardModal(false)} className="px-4 py-2 rounded-xl border">Cancel</button>

                <button onClick={handleConfirmForward} className="px-4 py-2 rounded-xl bg-indigo-600 text-white">Forward</button>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Inquiry Details Modal */}

      {showInquiryDetailsModal && selectedInquiry && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}

            <div className={`bg-gradient-to-r ${getCategoryColors(6)} p-6 rounded-t-2xl`}>

              <div className="flex justify-between items-start">

                <div>

                  <h2 className="text-2xl font-bold text-white">Inquiry Details</h2>

                  <p className="text-white/80 mt-1">

                    Inquiry ID: #{(selectedInquiry._id || selectedInquiry.id || 'N/A')?.slice(-6)}

                  </p>

                </div>

                <button

                  onClick={() => setShowInquiryDetailsModal(false)}

                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"

                >

                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                  </svg>

                </button>

              </div>

            </div>



            {/* Modal Body */}

            <div className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* User Information */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                    </svg>

                    User Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Name</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.userId?.name || selectedInquiry.name || 'Not provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Email</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.userId?.email || selectedInquiry.email || 'Not provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Phone</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.phone || 'Not provided'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Event Information */}

                <div className="bg-gray-50 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

                    </svg>

                    Event Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Category</p>

                      <p className="font-medium text-gray-900 capitalize">

                        {selectedInquiry.hiringFor || selectedInquiry.category || 'Not specified'}

                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-gray-500">inquiry date</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.eventDate ? new Date(selectedInquiry.eventDate).toLocaleDateString('en-IN') : 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="font-medium text-gray-900">
                        {renderLocation(selectedInquiry.location)}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Budget</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.budget ? `₹${Number(selectedInquiry.budget).toLocaleString('en-IN')}` : 'Not specified'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Requirements */}

                <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                    </svg>

                    Requirements

                  </h3>

                  <p className="font-medium text-gray-900 text-sm leading-relaxed">

                    {selectedInquiry.requirements || 'No specific requirements mentioned'}

                  </p>

                </div>

              </div>



              {/* Unified Forwarded Influencers Tracking Section */}

              {selectedInquiry.forwardedTo && selectedInquiry.forwardedTo.length > 0 && (

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 md:col-span-2 mb-6 border border-indigo-200 shadow-sm">

                  <div className="flex items-center justify-between mb-6">

                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">

                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />

                      </svg>

                      Forwarded Influencers Status

                    </h3>

                    <div className="flex gap-3 text-sm flex-wrap">

                      {(() => {

                        const accepted = selectedInquiry.forwardedTo.filter(f => f.acceptanceStatus === 'accepted').length;

                        const rejected = selectedInquiry.forwardedTo.filter(f => f.acceptanceStatus === 'rejected' || f.acceptanceStatus === 'auto-rejected').length;

                        const pending = selectedInquiry.forwardedTo.filter(f => !f.acceptanceStatus || f.acceptanceStatus === 'pending').length;

                        return (

                          <>

                            {accepted > 0 && <span className="px-3 py-1 bg-green-200 text-green-800 font-semibold rounded-full">✓ Accepted: {accepted}</span>}

                            {rejected > 0 && <span className="px-3 py-1 bg-red-200 text-red-800 font-semibold rounded-full">✕ Rejected: {rejected}</span>}

                            {pending > 0 && <span className="px-3 py-1 bg-yellow-200 text-yellow-800 font-semibold rounded-full">⏳ Pending: {pending}</span>}

                          </>

                        );

                      })()}

                    </div>

                  </div>



                  {/* Workflow Status Info Banner */}

                  {(() => {

                    const accepted = selectedInquiry.forwardedTo.filter(f => f.acceptanceStatus === 'accepted').length;

                    const anyAssigned = selectedInquiry.assignedInfluencer && selectedInquiry.assignedInfluencer.userId;

                    return (

                      <div className={`rounded-lg p-4 mb-4 ${

                        anyAssigned

                          ? 'bg-emerald-100 border border-emerald-300'

                          : accepted > 0

                          ? 'bg-blue-100 border border-blue-300'

                          : 'bg-amber-100 border border-amber-300'

                      }`}>

                        <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">

                          {anyAssigned ? (

                            <>

                              <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">

                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />

                              </svg>

                              ✓ Inquiry Completed - Assigned to accepted influencer. Other influencers auto-rejected.

                            </>

                          ) : accepted > 0 ? (

                            <>

                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />

                              </svg>

                              ℹ️ Action Required - Influencer(s) accepted. Click "Assign" button to finalize.

                            </>

                          ) : (

                            <>

                              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

                              </svg>

                              ⏳ Waiting - No influencers have accepted yet.

                            </>

                          )}

                        </p>

                      </div>

                    );

                  })()}



                  <div className="grid gap-3">

                    {selectedInquiry.forwardedTo.map((forward, idx) => {

                      const influencerData = forward.userId && typeof forward.userId === 'object' ? forward.userId : {};

                      const influencerName = influencerData.fullName || 

                        influencerData.name || 

                        (influencerData.firstName && influencerData.lastName ? `${influencerData.firstName} ${influencerData.lastName}` : 'Unknown Influencer');

                      const influencerEmail = influencerData.email || 'No email available';

                      const influencerCategory = influencerData.profileType || 'General';

                      const acceptanceStatus = forward.acceptanceStatus || 'pending';

                      const forwardedDate = forward.forwardedAt ? new Date(forward.forwardedAt).toLocaleDateString('en-IN') : 'Unknown date';

                      const responseDate = forward.acceptedAt 

                        ? new Date(forward.acceptedAt).toLocaleDateString('en-IN') 

                        : forward.rejectedAt 

                        ? new Date(forward.rejectedAt).toLocaleDateString('en-IN') 

                        : null;

                      const isAssigned = selectedInquiry.assignedInfluencer && 

                        selectedInquiry.assignedInfluencer.userId && 

                        selectedInquiry.assignedInfluencer.userId.toString() === (influencerData._id || forward.userId)?.toString();



                      return (

                        <div

                          key={idx}

                          className={`flex items-start justify-between p-4 rounded-lg border-2 transition-all ${

                            isAssigned

                              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'

                              : acceptanceStatus === 'accepted'

                              ? 'bg-green-50 border-green-300'

                              : acceptanceStatus === 'rejected' || acceptanceStatus === 'auto-rejected'

                              ? 'bg-red-50 border-red-300 opacity-75'

                              : 'bg-white border-gray-300 hover:border-indigo-300'

                          }`}

                        >

                          <div className="flex-1">

                            <div className="flex items-center gap-2 mb-2">

                              <p className="font-semibold text-gray-900 flex items-center gap-1">

                                {isAssigned && (

                                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">

                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />

                                  </svg>

                                )}

                                {influencerName}

                              </p>

                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${

                                isAssigned

                                  ? 'bg-emerald-200 text-emerald-800'

                                  : acceptanceStatus === 'accepted'

                                  ? 'bg-green-200 text-green-800'

                                  : acceptanceStatus === 'rejected'

                                  ? 'bg-red-200 text-red-800'

                                  : acceptanceStatus === 'auto-rejected'

                                  ? 'bg-red-300 text-red-900'

                                  : 'bg-yellow-200 text-yellow-800'

                              }`}>

                                {isAssigned

                                  ? '★ Completed'

                                  : acceptanceStatus === 'accepted'

                                  ? '✓ Accepted'

                                  : acceptanceStatus === 'rejected'

                                  ? '✕ Rejected'

                                  : acceptanceStatus === 'auto-rejected'

                                  ? '✕ Auto-rejected'

                                  : '⏳ Pending'}

                              </span>

                            </div>



                            <div className="text-sm text-gray-600 space-y-1">

                              <p>

                                <span className="font-medium text-gray-700">Category:</span> {influencerCategory}

                              </p>

                              <p>

                                <span className="font-medium text-gray-700">Email:</span>{' '}

                                <a href={`mailto:${influencerEmail}`} className="text-indigo-600 hover:underline">

                                  {influencerEmail}

                                </a>

                              </p>

                              <p>

                                <span className="font-medium text-gray-700">Forwarded:</span> {forwardedDate}

                              </p>

                              {responseDate && (

                                <p>

                                  <span className="font-medium text-gray-700">

                                    {acceptanceStatus === 'accepted' ? '✓ Accepted' : '✕ Responded'}:

                                  </span>{' '}

                                  {responseDate}

                                </p>

                              )}

                              {forward.response && (

                                <div className="mt-2 p-2 bg-white bg-opacity-50 rounded border-l-2 border-gray-400">

                                  <p className="text-xs text-gray-700">

                                    <span className="font-semibold">Response:</span> {forward.response}

                                  </p>

                                </div>

                              )}

                            </div>

                          </div>



                          <div className="ml-4 flex flex-col gap-2">

                            <button

                              onClick={() => handleViewInfluencerDetails(influencerData)}

                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"

                            >

                              View Profile

                            </button>

                            {acceptanceStatus === 'accepted' && !isAssigned && (

                              <button

                                onClick={() => {
                                  const artistIdToUse = influencerData._id || influencerData.id || forward.userId?._id || forward.userId;
                                  if (!artistIdToUse) {
                                    alert('Error: Cannot get artist ID. Please refresh and try again.');
                                    return;
                                  }
                                  handleAssignToArtist(selectedInquiry._id, String(artistIdToUse));
                                }}

                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"

                              >

                                Assign

                              </button>

                            )}

                          </div>

                        </div>

                      );

                    })}

                  </div>

                </div>

              )}



              {/* Admin Information Section */}

              {(selectedInquiry.acceptedByAdmin || selectedInquiry.acceptedBy) && (

                <div className="bg-blue-50 rounded-xl p-6 md:col-span-2 mb-6 border border-blue-200">

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />

                    </svg>

                    Accepted By Admin

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-gray-500">Admin Name</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.acceptedByAdmin?.name || selectedInquiry.acceptedByAdminName || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-gray-500">Admin Email</p>

                      <p className="font-medium text-gray-900">

                        {selectedInquiry.acceptedByAdmin?.email || selectedInquiry.acceptedByAdminEmail || 'Not specified'}

                      </p>

                    </div>

                    {selectedInquiry.acceptedAt && (

                      <div>

                        <p className="text-sm text-gray-500">Accepted On</p>

                        <p className="font-medium text-gray-900">

                          {new Date(selectedInquiry.acceptedAt).toLocaleString('en-IN')}

                        </p>

                      </div>

                    )}

                  </div>

                </div>

              )}



              {/* Progress Section */}

              <div className="mt-6">

                <InquiryProgressBar

                  status={selectedInquiry.status || 'sent'}

                  progressPercentage={selectedInquiry.progressPercentage || 10}

                  forwardedTo={selectedInquiry.forwardedTo || []}

                  onViewArtist={handleViewInfluencerDetails}

                  influencers={influencers}

                />

              </div>



              {/* Modal Footer */}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">

                <button

                  onClick={() => setShowInquiryDetailsModal(false)}

                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"

                >

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Influencer Details Modal */}

      {showInfluencerDetailsModal && (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

          {loadingInfluencerDetails ? (

            <div className="p-12 flex flex-col items-center justify-center">

              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>

              <p className="text-gray-600 font-medium">Loading Influencer Details...</p>

            </div>

          ) : selectedForwardedInfluencer ? (

            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">

              {/* Modal Header */}

              <div className={`bg-gradient-to-r ${getCategoryColors(2)} p-6 rounded-t-2xl`}>

                <div className="flex justify-between items-start">

                  <div className="flex items-center gap-4">

                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">

                      <span className="text-white text-2xl font-bold">

                        {(selectedForwardedInfluencer.fullName || selectedForwardedInfluencer.name || 'Unknown')?.charAt(0)?.toUpperCase() || 'A'}

                      </span>

                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-white">

                        {selectedForwardedInfluencer.fullName || selectedForwardedInfluencer.name || 'Unknown Artist'}

                      </h2>

                      <p className="text-white/80 mt-1">

                        {selectedForwardedInfluencer.profileType || selectedForwardedInfluencer.InfluencerType || 'Professional Artist'}

                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium bg-white/20 text-white">

                          Artist ID: #{(selectedForwardedInfluencer._id || selectedForwardedInfluencer.id || 'N/A')?.slice(-6)}

                        </span>

                      </div>

                    </div>

                  </div>

                  <button

                    onClick={() => setShowInfluencerDetailsModal(false)}

                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"

                  >

                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                    </svg>

                  </button>

                </div>

              </div>



              {/* Modal Body */}

              <div className="p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Personal Information */}

                  <div className="bg-gray-50 rounded-xl p-6">

                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                      </svg>

                      Personal Information

                    </h3>

                    <div className="space-y-3">

                      <div>

                        <p className="text-sm text-gray-500">Full Name</p>

                        <p className="font-medium text-gray-900">

                          {selectedForwardedInfluencer.fullName || selectedForwardedInfluencer.name || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Email Address</p>

                        <p className="font-medium text-gray-900">

                          {selectedForwardedInfluencer.email || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Phone Number</p>

                        <p className="font-medium text-gray-900">

                          {selectedForwardedInfluencer.phone || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="font-medium text-gray-900">
                          {renderLocation(selectedForwardedInfluencer.location)}
                        </p>

                      </div>

                    </div>

                  </div>



                  {/* Professional Information */}

                  <div className="bg-gray-50 rounded-xl p-6">

                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                      </svg>

                      Professional Information

                    </h3>

                    <div className="space-y-3">

                      <div>

                        <p className="text-sm text-gray-500">Profile Type</p>

                        <p className="font-medium text-gray-900 capitalize">

                          {selectedForwardedInfluencer.profileType || selectedForwardedInfluencer.InfluencerType || 'Not specified'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Categories</p>

                        <div className="flex flex-wrap gap-1 mt-1">

                          {selectedForwardedInfluencer.categories && selectedForwardedInfluencer.categories.length > 0 ? (

                            selectedForwardedInfluencer.categories.map((cat, idx) => (

                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">

                                {cat}

                              </span>

                            ))

                          ) : (

                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium capitalize">

                              {selectedForwardedInfluencer.category || 'General'}

                            </span>

                          )}

                        </div>

                      </div>

                      <div>

                        <p className="text-sm text-gray-500">Experience</p>

                        <p className="font-medium text-gray-900">

                          {selectedForwardedInfluencer.experience ? `${selectedForwardedInfluencer.experience} years` : 'Not specified'}

                        </p>

                      </div>

                    </div>

                  </div>



                  {/* Bio */}

                  <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">

                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                      </svg>

                      Bio / Description

                    </h3>

                    <p className="font-medium text-gray-900 text-sm leading-relaxed">

                      {selectedForwardedInfluencer.bio || 'No bio provided'}

                    </p>

                  </div>



                  {/* Social Links */}

                  <div className="bg-gray-50 rounded-xl p-6 md:col-span-2">

                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />

                      </svg>

                      Social Media Links

                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">

                      {selectedForwardedInfluencer.socialLinks?.instagram && (

                        <div className="flex items-center gap-2">

                          <span className="text-pink-600">📷</span>

                          <a href={selectedForwardedInfluencer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"

                            className="text-purple-600 hover:text-purple-700 text-sm">

                            Instagram

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.youtube && (

                        <div className="flex items-center gap-2">

                          <span className="text-red-600">📺</span>

                          <a href={selectedForwardedInfluencer.socialLinks.youtube} target="_blank" rel="noopener noreferrer"

                            className="text-purple-600 hover:text-purple-700 text-sm">

                            YouTube

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.facebook && (

                        <div className="flex items-center gap-2">

                          <span className="text-blue-600">📘</span>

                          <a href={selectedForwardedInfluencer.socialLinks.facebook} target="_blank" rel="noopener noreferrer"

                            className="text-purple-600 hover:text-purple-700 text-sm">

                            Facebook

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.website && (

                        <div className="flex items-center gap-2">

                          <span className="text-gray-600">🌐</span>

                          <a href={selectedForwardedInfluencer.socialLinks.website} target="_blank" rel="noopener noreferrer"

                            className="text-purple-600 hover:text-purple-700 text-sm">

                            Website

                          </a>

                        </div>

                      )}

                      {(!selectedForwardedInfluencer.socialLinks?.instagram && !selectedForwardedInfluencer.socialLinks?.youtube &&

                        !selectedForwardedInfluencer.socialLinks?.facebook && !selectedForwardedInfluencer.socialLinks?.website) && (

                          <span className="text-gray-500 text-sm">No social links provided</span>

                        )}

                    </div>

                  </div>

                </div>



                {/* Modal Footer */}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleInfluencerStatus(selectedForwardedInfluencer._id || selectedForwardedInfluencer.id, selectedForwardedInfluencer.isActive !== false)}
                    className={`px-6 py-2 text-white rounded-xl font-medium transition-colors ${selectedForwardedInfluencer.isActive !== false
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {selectedForwardedInfluencer.isActive !== false ? 'Deactivate Artist' : 'Activate Artist'}
                  </button>
                  <button
                    onClick={() => setShowInfluencerDetailsModal(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>

              </div>

            </div>

          ) : (

            <div className="p-12 text-center">

              <p className="text-gray-600">No influencer data available</p>

            </div>

          )}

        </div>
      )}

      {/* Render User Details Modal */}
      {renderUserModal()}

      {/* Success Message Notification */}
      {successMessage && (
        <div className="fixed bottom-8 right-8 z-[100] animate-bounce-in">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );

};



export default AdminDashboard;

