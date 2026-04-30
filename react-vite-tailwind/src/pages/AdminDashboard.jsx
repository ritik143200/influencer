import React, { useState, useEffect } from 'react';

import { useRouter } from '../contexts/RouterContext';

import { useAuth } from '../contexts/AuthContext';

import InquiryProgressBar from '../components/InquiryProgressBar';

import AdminInfluencersManagement from '../components/AdminInfluencersManagement';

import AdminFeaturedInfluencers from '../components/AdminFeaturedInfluencers';

import AdminUserManagement from '../components/AdminUserManagement';

import AdminContactManagement from '../components/AdminContactManagement';

import AdminInquiryManagement from '../components/AdminInquiryManagement';

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
  const [isFilteringInfluencers, setIsFilteringInfluencers] = useState(false);

  // Pagination state for inquiries
  const [inquiryCurrentPage, setInquiryCurrentPage] = useState(1);
  const [inquiryItemsPerPage] = useState(10);

  // Pagination state for users
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage] = useState(10);

  // Pagination state for contacts
  const [contactCurrentPage, setContactCurrentPage] = useState(1);
  const [contactItemsPerPage] = useState(10);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 245678,
    thisMonthRevenue: 45678,
    lastMonthRevenue: 38956,
    totalUsers: 0,
    totalInfluencers: 0,
    totalInquiries: 0,
    pendingInquiries: 0,
    processedInquiries: 0,
    completedInquiries: 0,
  });

  // Refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showForwardModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForwardModal]);

  // Filter states for Users
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states for Inquiries
  const [filterStatusInquiry, setFilterStatusInquiry] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTermInquiry, setSearchTermInquiry] = useState('');

  // Forward modal filters (search by category, budget, location)
  const [forwardSearchCategory, setForwardSearchCategory] = useState('');
  const [forwardFilterBudgetMin, setForwardFilterBudgetMin] = useState('');
  const [forwardFilterBudgetMax, setForwardFilterBudgetMax] = useState('');
  const [forwardFilterLocation, setForwardFilterLocation] = useState('');

  // Reset pagination when filters change
  useEffect(() => {
    setInquiryCurrentPage(1);
  }, [filterStatusInquiry, filterDate, searchTermInquiry]);

  // Reset pagination when user filters change
  useEffect(() => {
    setUserCurrentPage(1);
  }, [filterRole, filterStatus, searchTerm]);

  // Reset pagination when contact filters change (if any)
  useEffect(() => {
    setContactCurrentPage(1);
  }, []); // Add contact filter dependencies when available

  // Derived filtered influencers for forward modal
  const filteredInfluencersForForward = (Array.isArray(influencers) ? influencers : []).filter(i => {
    // Category check
    const cats = (i.categories || (i.category ? [i.category] : [])).map(c => String(c).toLowerCase());
    const catQuery = (forwardSearchCategory || '').trim().toLowerCase();
    const matchesCategory = !catQuery || cats.some(c => c.includes(catQuery));

    // Location check
    const locStr = (typeof i.location === 'string') ? i.location : ((i.location && (i.location.city || i.location.country)) ? `${i.location.city || ''} ${i.location.country || ''}` : '');
    const locQuery = (forwardFilterLocation || '').trim().toLowerCase();
    const matchesLocation = !locQuery || String(locStr).toLowerCase().includes(locQuery);

    // Budget check (tolerant - accept if influencer has any budget-like field overlapping requested range)
    let matchesBudget = true;
    if (forwardFilterBudgetMin || forwardFilterBudgetMax) {
      const min = forwardFilterBudgetMin ? Number(forwardFilterBudgetMin) : Number.NEGATIVE_INFINITY;
      const max = forwardFilterBudgetMax ? Number(forwardFilterBudgetMax) : Number.POSITIVE_INFINITY;
      const infMin = Number(i.budgetMin || i.minBudget || i.expectedBudget || i.budget || 0) || 0;
      const infMax = Number(i.budgetMax || i.maxBudget || i.expectedBudget || i.budget || infMin) || infMin;
      matchesBudget = (infMax >= min && infMin <= max);
    }

    return matchesCategory && matchesLocation && matchesBudget;
  });

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



      // Static notifications fetch removed as per request to only allow real-time notifications

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

  // Real-time notifications polling
  useEffect(() => {
    if (!adminData) return;

    const fetchRealTimeNotifications = async () => {
      try {
        const notifRes = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
        });
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setNotifications(Array.isArray(notifData) ? notifData : []);
        }
      } catch (err) {
        console.error('Error fetching real-time notifications:', err);
      }
    };

    // Fetch immediately
    fetchRealTimeNotifications();

    // Poll every 10 seconds for real-time updates
    const intervalId = setInterval(fetchRealTimeNotifications, 10000);

    return () => clearInterval(intervalId);
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

  const handleAssignToInfluencer = async (inquiryId, influencerId = null) => {

    try {

      // Validate inputs
      if (!inquiryId) {
        alert('Error: Inquiry ID is missing');
        return;
      }

      // Use provided influencerId or use demo mode
      const targetId = influencerId ? String(influencerId).trim() : 'demo';

      if (targetId !== 'demo' && targetId.length < 10) {
        console.error('Invalid influencer ID:', targetId);
        alert('Error: Invalid influencer ID format');
        return;
      }

      console.log('handleAssignToInfluencer called with:', { inquiryId, targetId });

      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${inquiryId}/assign/${targetId}`, {

        method: 'PATCH',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': `Bearer ${localStorage.getItem('userToken')}`

        },

        body: JSON.stringify({

          notes: influencerId ? `Inquiry assigned to selected influencer` : 'Inquiry completed by admin'

        })

      });

      const data = await res.json();

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

  const handleToggleRecipient = (influencerId) => {

    setForwardRecipients(prev => {

      const next = new Set(prev);

      if (next.has(influencerId)) next.delete(influencerId);

      else next.add(influencerId);

      return next;

    });

  };



  const handleConfirmForward = async () => {

    if (!forwardInquiryId) return;

    const recipients = Array.from(forwardRecipients);

    if (recipients.length === 0) {

      alert('Select at least one influencer to forward to');

      return;

    }

    console.log('Forwarding inquiry:', { forwardInquiryId, recipients });

    // Set loading state
    setIsFilteringInfluencers(true);

    try {

      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${forwardInquiryId}/forward`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('userToken')}` },

        body: JSON.stringify({ recipients })

      });

      const data = await res.json();

      console.log('Forward response:', { status: res.status, data });

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

    } finally {

      setIsFilteringInfluencers(false);

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

                <span className="text-2xl">👤</span>

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

                <span className="text-2xl">👥</span>

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
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h3>
              <div className="text-white/90 text-sm font-medium">
                Live Updates
              </div>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <RecentActivity API_BASE_URL={API_BASE_URL} getThemeColor={getThemeColor} />
          </div>
        </div>



        </div>

    </div>

  );



  // Keep all other existing functions unchanged but with theme consistency

  









                            


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

            {['overview', 'users', 'influencers', 'featured', 'inquiries', 'contacts', 'analytics', 'settings'].map((tab, index) => (

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
                    {tab === 'featured' && '⭐'}

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

        {activeTab === 'users' && (
          <AdminUserManagement
            users={users}
            filterRole={filterRole}
            setFilterRole={setFilterRole}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            userCurrentPage={userCurrentPage}
            setUserCurrentPage={setUserCurrentPage}
            userItemsPerPage={userItemsPerPage}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            showUserModal={showUserModal}
            setShowUserModal={setShowUserModal}
            handleViewUserDetails={handleViewUserDetails}
            handleUpdateUserStatus={handleUpdateUserStatus}
            handleDeleteUser={handleDeleteUser}
            getCategoryColors={getCategoryColors}
            successMessage={successMessage}
            setSuccessMessage={setSuccessMessage}
          />
        )}

        {activeTab === 'influencers' && (

          <AdminInfluencersManagement

            influencers={influencers}

            onRefreshInfluencers={() => fetchDashboardData(true)}

          />

        )}

        {activeTab === 'featured' && (
          <AdminFeaturedInfluencers
            influencers={influencers}
            API_BASE_URL={API_BASE_URL}
            getThemeColor={getThemeColor}
          />
        )}

        {activeTab === 'inquiries' && (
          <AdminInquiryManagement
            inquiries={inquiries}
            inquiryCurrentPage={inquiryCurrentPage}
            setInquiryCurrentPage={setInquiryCurrentPage}
            inquiryItemsPerPage={inquiryItemsPerPage}
            filterStatusInquiry={filterStatusInquiry}
            setFilterStatusInquiry={setFilterStatusInquiry}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            searchTermInquiry={searchTermInquiry}
            setSearchTermInquiry={setSearchTermInquiry}
            handleAdminInquiryAction={handleAdminInquiryAction}
            handleOpenForwardModal={handleOpenForwardModal}
            handleViewInquiryDetails={handleViewInquiryDetails}
            handleAssignToInfluencer={handleAssignToInfluencer}
            getCategoryColors={getCategoryColors}
          />
        )}

        {activeTab === 'contacts' && (
          <AdminContactManagement
            contacts={contacts}
            contactCurrentPage={contactCurrentPage}
            setContactCurrentPage={setContactCurrentPage}
            contactItemsPerPage={contactItemsPerPage}
            selectedContact={selectedContact}
            setSelectedContact={setSelectedContact}
            showContactModal={showContactModal}
            setShowContactModal={setShowContactModal}
            handleUpdateContactStatus={handleUpdateContactStatus}
            getCategoryColors={getCategoryColors}
          />
        )}

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

                      {selectedInfluencer.InfluencerType || 'Professional Influencer'}

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

                      <p className="text-sm text-gray-500">Influencer Type</p>

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

                  {selectedInfluencer.isActive !== false ? 'Deactivate Influencer' : 'Activate Influencer'}

                </button>

                <button

                  className="px-6 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors"

                  style={{ backgroundColor: getThemeColor('primary') }}

                >

                  Edit Influencer

                </button>

              </div>

            </div>

          </div>

        </div>

      )}



      {/* Forward Inquiry Modal */}

      {showForwardModal && (

        <div className="fixed inset-0 z-50 bg-white overflow-y-auto animate-fadeIn">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white/95 backdrop-blur animate-slideDown shadow-xl" style={{ 
              borderBottom: `3px solid ${config.primary_action}`,
              boxShadow: `0 4px 20px ${config.primary_action}30`
            }}>
              <div className="flex items-center justify-between gap-4">
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold" style={{ color: config.text_color || '#1e293b' }}>Forward Inquiry</h3>
                  <p className="text-sm mt-1" style={{ color: config.secondary_action || '#64748b' }}>Select one or more influencers to forward this inquiry to.</p>
                </div>
                <div className="flex items-center gap-2 animate-fadeIn">
                  <button 
                    onClick={() => setShowForwardModal(false)} 
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 shadow-md"
                    style={{ 
                      backgroundColor: config.surface_color || '#f0f9ff',
                      color: config.primary_action || '#0ea5e9',
                      border: `2px solid ${config.primary_action}`
                    }}
                  >
                    Close
                  </button>
                  <button 
                    onClick={handleConfirmForward} 
                    disabled={isFilteringInfluencers || forwardRecipients.size === 0}
                    className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                    style={{ 
                      backgroundColor: config.primary_action || '#0ea5e9',
                      opacity: (isFilteringInfluencers || forwardRecipients.size === 0) ? 0.5 : 1
                    }}
                  >
                    {isFilteringInfluencers ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Forwarding...
                      </>
                    ) : (
                      <>
                        Forward Inquiry
                        {forwardRecipients.size > 0 && (
                          <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            {forwardRecipients.size}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">

              {/* Filters: Category, Budget, Location */}
              <div className="rounded-2xl shadow-xl p-4 sm:p-6" style={{ 
                background: 'white',
                border: `2px solid ${config.primary_action}30`,
                boxShadow: `0 8px 25px ${config.primary_action}15`
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: config.primary_action }}></div>
                  <h4 className="text-lg font-semibold" style={{ color: config.text_color || '#1e293b' }}>Filter Influencers</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                      <span className="text-lg">??</span> Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lifestyle, Music"
                      value={forwardSearchCategory}
                      onChange={(e) => setForwardSearchCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder-gray-400"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                      <span className="text-lg">??</span> Budget Min
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={forwardFilterBudgetMin}
                        onChange={(e) => setForwardFilterBudgetMin(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                      <span className="text-lg">??</span> Budget Max
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs</span>
                      <input
                        type="number"
                        placeholder="100000"
                        value={forwardFilterBudgetMax}
                        onChange={(e) => setForwardFilterBudgetMax(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-gray-700 mb-1 block flex items-center gap-1">
                      <span className="text-lg">??</span> Location
                    </label>
                    <input
                      type="text"
                      placeholder="City or Country"
                      value={forwardFilterLocation}
                      onChange={(e) => setForwardFilterLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium transition-all focus:border-purple-400 focus:ring-2 focus:ring-purple-100 placeholder-gray-400"
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                    <button
                      onClick={() => {
                        setForwardSearchCategory('');
                        setForwardFilterBudgetMin('');
                        setForwardFilterBudgetMax('');
                        setForwardFilterLocation('');
                      }}
                      className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">??</span> Clear Filters
                    </button>
                    <div className="text-sm text-gray-600 sm:ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Showing influencers matching filters
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl p-4 sm:p-6" style={{ 
                background: 'white',
                border: `2px solid ${config.primary_action}30`,
                boxShadow: `0 8px 25px ${config.primary_action}15`
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold" style={{ color: config.text_color || '#1e293b' }}>Available Influencers</h4>
                  <div className="text-sm" style={{ color: config.secondary_action || '#64748b' }}>
                    {filteredInfluencersForForward.length} of {influencers.length} matching
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                  {isFilteringInfluencers ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 border rounded-xl animate-pulse">
                        <div className="w-5 h-5 bg-gray-200 rounded mt-1"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Check if any filters are applied
                    (forwardSearchCategory || forwardFilterBudgetMin || forwardFilterBudgetMax || forwardFilterLocation) ? (
                      // Filters are applied - show filtered results
                      filteredInfluencersForForward.length === 0 ? (
                        // No influencers match filters
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">??</span>
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Influencers Match Your Filters</h4>
                          <p className="text-sm text-gray-600 max-w-md mb-4">
                            Try adjusting your filters to see more influencers.
                          </p>
                          <button
                            onClick={() => {
                              setForwardSearchCategory('');
                              setForwardFilterBudgetMin('');
                              setForwardFilterBudgetMax('');
                              setForwardFilterLocation('');
                            }}
                            className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      ) : (
                        // Show filtered influencers
                        filteredInfluencersForForward.map(i => {
                          const aid = i._id || i.id;
                          const checked = forwardRecipients.has(aid);

                          return (
                            <label key={aid} className="flex items-start gap-3 p-4 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:shadow-lg" style={{ 
                              borderColor: checked ? config.primary_action : `${config.primary_action}30`,
                              backgroundColor: checked ? `${config.primary_action}05` : 'white',
                              boxShadow: checked ? `0 4px 15px ${config.primary_action}20` : 'none'
                            }}>
                              <input className="mt-1 w-5 h-5 rounded focus:ring-2 focus:ring-brand-100" type="checkbox" checked={checked} onChange={() => handleToggleRecipient(aid)} style={{ 
                                color: checked ? 'white' : config.primary_action,
                                backgroundColor: checked ? config.primary_action : 'white'
                              }} />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate" style={{ color: checked ? 'white' : config.text_color || '#1f2937' }}>
                                  {i.fullName || i.name || `Influencer ${aid?.slice(-6)}`}
                                </div>
                                <div className="text-xs mt-1 break-words" style={{ color: checked ? 'white' : config.secondary_action || '#64748b' }}>
                                  {i.categories?.join(', ') || i.category || 'General'} · {i.email}
                                </div>
                              </div>
                            </label>
                          );
                        })
                      )
                    ) : (
                      // No filters applied - show empty state
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">??</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Apply Filters to See Influencers</h4>
                        <p className="text-sm text-gray-600 max-w-md mb-4">
                          Use the filters above to search for influencers by category, budget, or location.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="text-lg">??</span>
                            <span>Category</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="text-lg">??</span>
                            <span>Budget</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="text-lg">??</span>
                            <span>Location</span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
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

                        {selectedInquiry.category || 'Not specified'}

                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-gray-500">Hiring Of</p>

                      <p className="font-medium text-gray-900 capitalize">

                        {selectedInquiry.hiringFor || 'Not specified'}

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
                                  const influencerIdToUse = influencerData._id || influencerData.id || forward.userId?._id || forward.userId;
                                  if (!influencerIdToUse) {
                                    alert('Error: Cannot get influencer ID. Please refresh and try again.');
                                    return;
                                  }
                                  handleAssignToInfluencer(selectedInquiry._id, String(influencerIdToUse));
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

                        {selectedForwardedInfluencer.fullName || selectedForwardedInfluencer.name || 'Unknown Influencer'}

                      </h2>

                      <p className="text-white/80 mt-1">

                        {selectedForwardedInfluencer.profileType || selectedForwardedInfluencer.InfluencerType || 'Professional Influencer'}

                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium bg-white/20 text-white">

                          Influencer ID: #{(selectedForwardedInfluencer._id || selectedForwardedInfluencer.id || 'N/A')?.slice(-6)}

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
                    {selectedForwardedInfluencer.isActive !== false ? 'Deactivate Influencer' : 'Activate Influencer'}
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

