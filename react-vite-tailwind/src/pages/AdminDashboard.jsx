import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

import InquiryProgressBar from '../components/InquiryProgressBar';
import AdminInfluencersManagement from '../components/AdminInfluencersManagement';
import AdminFeaturedInfluencers from '../components/AdminFeaturedInfluencers';
import AdminUserManagement from '../components/AdminUserManagement';
import AdminContactManagement from '../components/AdminContactManagement';
import AdminInquiryManagement from '../components/AdminInquiryManagement';

import { useAdminData } from '../hooks/useAdminData';
import { useToast } from '../hooks/useToast';
import { useDebounce } from '../hooks/useDebounce';
import { adminApi } from '../services/adminApiService';
import { API_BASE_URL } from '../data/config';


const AdminDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const { showToast, ToastContainer } = useToast();

  // ── centralised data via custom hook ──────────────────────────────────────
  const {
    overview,
    users, influencers, inquiries, contacts, notifications,
    loadingOverview, loadingUsers, loadingInfluencers, loadingInquiries, loadingContacts,
    errors,
    loadTab, refreshTab, fetchNotifications,
    updateInquiryInState, updateUserInState, removeUserFromState,
    updateInfluencerInState, updateContactInState,
    markNotificationReadInState, markAllNotificationsReadInState,
    setInfluencers, setInquiries,
  } = useAdminData();

  // ── UI-only state ─────────────────────────────────────────────────────────
  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive analytics from overview (backwards-compat shape)
  const analytics = useMemo(() => ({
    totalRevenue: 245678,
    thisMonthRevenue: 45678,
    lastMonthRevenue: 38956,
    totalUsers: overview?.totalUsers ?? 0,
    totalInfluencers: overview?.totalInfluencers ?? 0,
    totalInquiries: overview?.totalInquiries ?? 0,
    pendingInquiries: overview?.pendingInquiries ?? 0,
    processedInquiries: overview?.processedInquiries ?? 0,
    completedInquiries: overview?.completedInquiries ?? 0,
    topInquirer: overview?.topInquirer ?? null,
  }), [overview]);

  // Loading flag for initial page load (overview only)
  const loading = loadingOverview && !overview;

  // Modal state
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

  // Forward modal
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardInquiryId, setForwardInquiryId] = useState(null);
  const [forwardRecipients, setForwardRecipients] = useState(new Set());
  const [isFilteringInfluencers, setIsFilteringInfluencers] = useState(false);
  const [smartMatches, setSmartMatches] = useState([]);
  const [loadingSmartMatches, setLoadingSmartMatches] = useState(false);
  const [smartMatchInquiryId, setSmartMatchInquiryId] = useState(null);

  // Pagination
  const [inquiryCurrentPage, setInquiryCurrentPage] = useState(1);
  const [inquiryItemsPerPage] = useState(10);
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userItemsPerPage] = useState(10);
  const [contactCurrentPage, setContactCurrentPage] = useState(1);
  const [contactItemsPerPage] = useState(10);

  // Filter state (raw — debounced versions used for filtering)
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatusInquiry, setFilterStatusInquiry] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [searchTermInquiry, setSearchTermInquiry] = useState('');

  // Forward modal filters
  const [forwardSearchCategory, setForwardSearchCategory] = useState('');
  const [forwardFilterBudgetMin, setForwardFilterBudgetMin] = useState('');
  const [forwardFilterBudgetMax, setForwardFilterBudgetMax] = useState('');
  const [forwardFilterLocation, setForwardFilterLocation] = useState('');

  // Debounced search — avoids filter re-calc on every keystroke
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedSearchTermInquiry = useDebounce(searchTermInquiry, 300);
  const debouncedForwardSearchCategory = useDebounce(forwardSearchCategory, 300);
  const debouncedForwardFilterLocation = useDebounce(forwardFilterLocation, 300);

  // Reset pagination when filters change
  useEffect(() => { setInquiryCurrentPage(1); },
    [filterStatusInquiry, filterDate, debouncedSearchTermInquiry]);
  useEffect(() => { setUserCurrentPage(1); },
    [filterRole, filterStatus, debouncedSearchTerm]);

  // Lock scroll when forward modal is open
  useEffect(() => {
    document.body.style.overflow = showForwardModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForwardModal]);

  // Auth guard
  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('home'); return; }
    setAdminData(user);
  }, [user, navigate]);

  // Lazy-load data when tab changes
  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  // Memoised filtered influencers for forward modal (only recomputes when deps change)
  const smartMatchedInfluencers = useMemo(() => (
    Array.isArray(smartMatches)
      ? smartMatches.map((item) => ({
        ...(item.influencer || {}),
        matchScore: item.matchScore,
        matchReasons: item.reasons || [],
        matchProfileCompletion: item.profileCompletion,
        matchBudgetRange: item.budgetRange
      })).filter((item) => item && (item._id || item.id))
      : []
  ), [smartMatches]);

  const filteredInfluencersForForward = useMemo(() => {
    const list = Array.isArray(influencers) ? influencers : [];
    const baseList = smartMatchInquiryId === forwardInquiryId && smartMatchedInfluencers.length > 0
      ? smartMatchedInfluencers
      : list;
    const catQ = debouncedForwardSearchCategory.trim().toLowerCase();
    const locQ = debouncedForwardFilterLocation.trim().toLowerCase();
    return baseList.filter(i => {
      const cats = [
        ...(i.categories || []),
        ...(i.microCategories || []),
        ...(i.mainCategories || []),
        ...(i.niche || []),
        i.category
      ].filter(Boolean).map(c => String(c).toLowerCase());
      const matchesCategory = !catQ || cats.some(c => c.includes(catQ));
      const locStr = typeof i.location === 'string' ? i.location
        : (i.location ? `${i.location.city || ''} ${i.location.country || ''}` : '');
      const matchesLocation = !locQ || String(locStr).toLowerCase().includes(locQ);
      let matchesBudget = true;
      if (forwardFilterBudgetMin || forwardFilterBudgetMax) {
        const min = forwardFilterBudgetMin ? Number(forwardFilterBudgetMin) : -Infinity;
        const max = forwardFilterBudgetMax ? Number(forwardFilterBudgetMax) : Infinity;
        const iMin = Number(i.budgetMin || i.minBudget || i.expectedBudget || i.budget || 0) || 0;
        const iMax = Number(i.budgetMax || i.maxBudget || i.expectedBudget || i.budget || iMin) || iMin;
        matchesBudget = iMax >= min && iMin <= max;
      }
      return matchesCategory && matchesLocation && matchesBudget;
    });
  }, [influencers, debouncedForwardSearchCategory, debouncedForwardFilterLocation,
      forwardFilterBudgetMin, forwardFilterBudgetMax, smartMatchedInfluencers,
      smartMatchInquiryId, forwardInquiryId]);

  const handleLogout = useCallback(() => { logout(); navigate('home'); }, [logout, navigate]);

  const handleOpenForwardModal = useCallback(async (inquiryId) => {
    setForwardInquiryId(inquiryId);
    setForwardRecipients(new Set());
    setSmartMatches([]);
    setSmartMatchInquiryId(inquiryId);
    setShowForwardModal(true);
    setLoadingSmartMatches(true);

    try {
      const payload = await adminApi.getInquiryMatches(inquiryId, { limit: 60, minScore: 1 });
      const matches = Array.isArray(payload?.data) ? payload.data : [];
      setSmartMatches(matches);

      const recommendedIds = matches
        .filter((item) => Number(item.matchScore || 0) >= 45)
        .slice(0, 5)
        .map((item) => item.influencer?._id || item.influencer?.id)
        .filter(Boolean);

      if (recommendedIds.length > 0) {
        setForwardRecipients(new Set(recommendedIds));
      }

      if (matches.length === 0) {
        showToast('No automatic matches found yet. You can still use manual filters.', 'warning');
      }
    } catch (err) {
      showToast(err.message || 'Could not load automatic matches', 'warning');
    } finally {
      setLoadingSmartMatches(false);
    }
  }, [showToast]);

  const handleViewInquiryDetails = useCallback((inquiry) => {
    setSelectedInquiry(inquiry);
    setShowInquiryDetailsModal(true);
  }, []);

  const handleViewInfluencerDetails = useCallback(async (influencer) => {
    setLoadingInfluencerDetails(true);
    try {
      const influencerId = influencer._id || influencer.id;
      let fullData = influencer;
      if (!influencer.email || !influencer.categories) {
        const existing = influencers.find(i => (i._id || i.id) === influencerId);
        if (existing?.email) { fullData = { ...influencer, ...existing }; }
        else {
          const res = await fetch(`${API_BASE_URL}/api/admin/artists/${influencerId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` },
          });
          if (res.ok) { const d = await res.json(); if (d.data) fullData = d.data; }
        }
      }
      setSelectedForwardedInfluencer(fullData);
      setShowInfluencerDetailsModal(true);
    } catch (err) {
      showToast('Could not load full influencer details.', 'warning');
      setSelectedForwardedInfluencer(influencer);
      setShowInfluencerDetailsModal(true);
    } finally { setLoadingInfluencerDetails(false); }
  }, [influencers, showToast]);

  const fetchOverviewAnalytics = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    await refreshTab('overview');
    if (manual) setIsRefreshing(false);
  }, [refreshTab]);

  const renderLocation = (loc) => {
    if (!loc) return 'Not specified';
    if (typeof loc === 'string') return loc;
    const { city = '', country = '' } = loc;
    return [city, country].filter(Boolean).join(', ') || 'Not specified';
  };


  const handleAdminInquiryAction = useCallback(async (inquiryId, action) => {
    try {
      const updated = await adminApi.updateInquiryStatus(inquiryId, action);
      updateInquiryInState(inquiryId, updated);
      showToast(`Inquiry ${action === 'accept' ? 'accepted' : 'rejected'} successfully!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update inquiry', 'error');
    }
  }, [updateInquiryInState, showToast]);

  const handleUpdateContactStatus = useCallback(async (contactId, status) => {
    try {
      const updated = await adminApi.updateContactStatus(contactId, status);
      updateContactInState(contactId, updated);
      setSelectedContact(updated);
      showToast(`Contact status updated to ${status}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update contact', 'error');
    }
  }, [updateContactInState, showToast]);

  const handleAssignToInfluencer = useCallback(async (inquiryId, influencerId = null) => {
    if (!inquiryId) { showToast('Inquiry ID is missing', 'error'); return; }
    const targetId = influencerId ? String(influencerId).trim() : 'demo';
    if (targetId !== 'demo' && targetId.length < 10) {
      showToast('Invalid influencer ID format', 'error'); return;
    }
    try {
      const notes = influencerId ? 'Inquiry assigned to selected influencer' : 'Inquiry completed by admin';
      const updated = await adminApi.assignInquiry(inquiryId, targetId, notes);
      updateInquiryInState(inquiryId, updated);
      if (selectedInquiry && (selectedInquiry._id === inquiryId || selectedInquiry.id === inquiryId)) {
        setSelectedInquiry(updated);
      }
      showToast('Inquiry assigned! Others auto-rejected.', 'success');
    } catch (err) {
      showToast(err.message || 'Assignment failed', 'error');
    }
  }, [updateInquiryInState, selectedInquiry, showToast]);

  const handleViewUserDetails = useCallback((u) => { setSelectedUser(u); setShowUserModal(true); }, []);

  const handleCloseArtistModal = useCallback(() => {
    setShowInfluencerModal(false);
    setSelectedInfluencer(null);
  }, []);

  const handleUpdateUserStatus = useCallback(async (userId, action) => {
    try {
      const updated = await adminApi.updateUserStatus(userId, action);
      updateUserInState(userId, updated);
      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) setSelectedUser(updated);
      showToast(`User status updated to ${updated.status}!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  }, [updateUserInState, selectedUser, showToast]);

  const handleDeleteUser = useCallback(async (userId) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    try {
      await adminApi.deleteUser(userId);
      removeUserFromState(userId);
      if (selectedUser && (selectedUser._id === userId || selectedUser.id === userId)) {
        setShowUserModal(false); setSelectedUser(null);
      }
      showToast('User deleted successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  }, [removeUserFromState, selectedUser, showToast]);

  const handleToggleRecipient = useCallback((influencerId) => {
    setForwardRecipients(prev => {
      const next = new Set(prev);
      if (next.has(influencerId)) next.delete(influencerId); else next.add(influencerId);
      return next;
    });
  }, []);

  const handleConfirmForward = useCallback(async () => {
    if (!forwardInquiryId) return;
    const recipients = Array.from(forwardRecipients);
    if (recipients.length === 0) { showToast('Select at least one influencer', 'warning'); return; }
    setIsFilteringInfluencers(true);
    try {
      const updated = await adminApi.forwardInquiry(forwardInquiryId, recipients);
      updateInquiryInState(forwardInquiryId, updated);
      setShowForwardModal(false);
      setForwardInquiryId(null);
      setForwardRecipients(new Set());
      showToast('Inquiry forwarded successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to forward inquiry', 'error');
    } finally { setIsFilteringInfluencers(false); }
  }, [forwardInquiryId, forwardRecipients, updateInquiryInState, showToast]);

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await adminApi.markAllNotificationsRead();
      markAllNotificationsReadInState();
    } catch (_) { /* silent */ }
  }, [markAllNotificationsReadInState]);

  const handleMarkNotificationRead = useCallback(async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      markNotificationReadInState(id);
    } catch (_) { /* silent */ }
  }, [markNotificationReadInState]);

  const handleToggleInfluencerStatus = useCallback(async (influencerId, currentStatus) => {
    const newStatus = !currentStatus;
    // Optimistic update
    setInfluencers(prev => prev.map(i =>
      (i._id === influencerId || i.id === influencerId) ? { ...i, isActive: newStatus } : i));
    try {
      const updated = await adminApi.toggleInfluencerStatus(influencerId, newStatus);
      updateInfluencerInState(influencerId, updated);
      if (selectedInfluencer && (selectedInfluencer._id === influencerId || selectedInfluencer.id === influencerId))
        setSelectedInfluencer(updated);
      if (selectedForwardedInfluencer && (selectedForwardedInfluencer._id === influencerId || selectedForwardedInfluencer.id === influencerId))
        setSelectedForwardedInfluencer(updated);
      showToast(`Influencer ${newStatus ? 'activated' : 'deactivated'}!`, 'success');
    } catch (err) {
      // Rollback on failure
      setInfluencers(prev => prev.map(i =>
        (i._id === influencerId || i.id === influencerId) ? { ...i, isActive: currentStatus } : i));
      showToast(err.message || 'Failed to update influencer status', 'error');
    }
  }, [updateInfluencerInState, selectedInfluencer, selectedForwardedInfluencer, showToast, setInfluencers]);



  


  // Theme-consistent colors from landing page

  const getThemeColor = (type) => {

    const colors = {

      primary: config?.primary_action || '#DF7AFE',

      secondary: config?.secondary_action || '#A98BC8',

      surface: config?.surface_color || '#0D0D0D',

      background: config?.background_color || '#000000',

      text: config?.text_color || '#FFFFFF'

    };

    return colors[type] || colors.text;

  };



  // Category colors from landing page

  const getCategoryColors = (index) => {

    const categoryColors = [

      'from-[#171321] to-[#DF7AFE]',

      'from-[#3E2A55] to-[#0099FF]',

      'from-[#000000] to-[#8B4DD8]',

      'from-[#171321] to-[#8B4DD8]',

      'from-[#3E2A55] to-[#DF7AFE]',

      'from-[#000000] to-[#3E2A55]',

      'from-[#8B4DD8] to-[#DF7AFE]',

      'from-[#171321] to-[#0099FF]'

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
              : 'bg-white hover:bg-gray-50 text-white/80 hover:text-white shadow-sm hover:shadow-md'
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

                <div className="font-semibold text-white/90 truncate">

                  {analytics.topInquirer.name || 'Unknown user'}

                </div>

                <div className="text-sm text-white/60 truncate">

                  {analytics.topInquirer.email || analytics.topInquirer.userId}

                </div>

              </div>

              <div className="shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">

                {analytics.topInquirer.inquiriesCount} inquiries

              </div>

            </div>

          ) : (

            <div className="text-sm text-white/60">No inquiry data yet</div>

          )}

        </div>

      </div>



      {/* Admin Snapshot - no live polling, keeps the admin panel smooth */}

      <div className="rounded-2xl shadow-lg border border-white/10 overflow-hidden"
        style={{ backgroundColor: getThemeColor('surface') }}>
        <div className={`bg-gradient-to-r ${getCategoryColors(4)} p-6`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h10M9 17H7a2 2 0 01-2-2V5a2 2 0 012-2h5a2 2 0 012 2v4m-5 8v4m0-4h4" />
              </svg>
              Admin Snapshot
            </h3>
            <div className="text-white/90 text-sm font-medium">
              Updated on refresh
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          {[
            {
              label: 'Pending inquiries',
              value: analytics.pendingInquiries,
              note: 'Need admin action',
            },
            {
              label: 'Creator profiles',
              value: analytics.totalInfluencers,
              note: 'Available for matching',
            },
            {
              label: 'Brand accounts',
              value: analytics.totalUsers,
              note: 'Registered users',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-black/20 p-5 shadow-sm"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: getThemeColor('accent') }}>
                {item.label}
              </p>
              <p className="mt-3 text-4xl font-bold" style={{ color: getThemeColor('text') }}>
                {item.value ?? 0}
              </p>
              <p className="mt-2 text-sm" style={{ color: getThemeColor('secondary') }}>
                {item.note}
              </p>
            </div>
          ))}
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



  


  // Skeleton loader — shows nav immediately, skeletons in content area
  if (loading) {
    return (
      <div className="vm-admin-red min-h-screen pt-20" style={{ backgroundColor: getThemeColor('background') }}>
        <ToastContainer />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
          <div className="skeleton h-48 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // Add top padding to prevent overlap with fixed navbar (assume navbar height ~80px)

  return (

    <div className="vm-admin-red min-h-screen pt-20" style={{ backgroundColor: getThemeColor('background') }}>
      <ToastContainer />

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

                    <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                                <p className="text-xs text-white/70 mt-1">{notification.message}</p>

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

                    <p className="text-xs text-white/60">Administrator</p>

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

                  : 'text-white/70 hover:text-white'

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
            searchTerm={debouncedSearchTerm}
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
          />
        )}

        {activeTab === 'influencers' && (
          <AdminInfluencersManagement
            influencers={influencers}
            onRefreshInfluencers={() => refreshTab('influencers')}
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

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">

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

                          ? 'bg-green-500/20 text-green-300'

                          : 'bg-red-500/20 text-red-300'

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

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                    </svg>

                    Personal Information

                  </h3>

                  <div className="space-y-3">

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-white/60">First Name</p>

                        <p className="font-medium text-white">{selectedInfluencer.firstName || 'Not provided'}</p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Last Name</p>

                        <p className="font-medium text-white">{selectedInfluencer.lastName || 'Not provided'}</p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Email Address</p>

                      <p className="font-medium text-white">{selectedInfluencer.email || 'Not provided'}</p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Phone Number</p>

                      <p className="font-medium text-white">{selectedInfluencer.phone || 'Not provided'}</p>

                    </div>

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-white/60">Date of Birth</p>

                        <p className="font-medium text-white">

                          {selectedInfluencer.dateOfBirth ? new Date(selectedInfluencer.dateOfBirth).toLocaleDateString() : 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Gender</p>

                        <p className="font-medium text-white capitalize">

                          {selectedInfluencer.gender || 'Not specified'}

                        </p>

                      </div>

                    </div>

                  </div>

                </div>



                {/* Category Selection */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />

                    </svg>

                    Category Selection

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Influencer Type</p>

                      <p className="font-medium text-white capitalize">

                        {selectedInfluencer.InfluencerType || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Category</p>

                      <div className="flex flex-wrap gap-1 mt-1">

                        {selectedInfluencer.category ? (

                          <span className="px-2 py-1 bg-[#DF7AFE]/20 text-[#DF7AFE] text-xs rounded-full font-medium capitalize">

                            {selectedInfluencer.category}

                          </span>

                        ) : (

                          <span className="text-white/60 text-sm">No category specified</span>

                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Subcategory</p>

                      <p className="font-medium text-white capitalize">

                        {selectedInfluencer.subcategory || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Skills</p>

                      <div className="flex flex-wrap gap-1 mt-1">

                        {selectedInfluencer.skills?.length > 0 ? (

                          selectedInfluencer.skills.map((skill, idx) => (

                            <span key={idx} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">

                              {skill}

                            </span>

                          ))

                        ) : (

                          <span className="text-white/60 text-sm">No skills specified</span>

                        )}

                      </div>

                    </div>

                  </div>

                </div>



                {/* Professional Information */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                    </svg>

                    Professional Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Experience</p>

                      <p className="font-medium text-white">

                        {selectedInfluencer.experience ? `${selectedInfluencer.experience} years` : 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Bio / Description</p>

                      <p className="font-medium text-white text-sm leading-relaxed">

                        {selectedInfluencer.bio || 'No bio provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Location</p>

                      <p className="font-medium text-white">
                        {renderLocation(selectedInfluencer.location)}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Registration Date</p>

                      <p className="font-medium text-white">

                        {selectedInfluencer.createdAt ? new Date(selectedInfluencer.createdAt).toLocaleDateString() : 'Not available'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Budget Information */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />

                    </svg>

                    Expected Budget Range

                  </h3>

                  <div className="space-y-3">

                    <div className="grid grid-cols-2 gap-3">

                      <div>

                        <p className="text-sm text-white/60">Starting From</p>

                        <p className="font-medium text-white">

                          {selectedInfluencer.budgetMin ? `₹${selectedInfluencer.budgetMin}` : 'Not specified'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Upto</p>

                        <p className="font-medium text-white">

                          {selectedInfluencer.budgetMax ? `₹${selectedInfluencer.budgetMax}` : 'Not specified'}

                        </p>

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Status</p>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${selectedInfluencer.isActive !== false

                          ? 'bg-green-500/20 text-green-300'

                          : 'bg-red-500/20 text-red-300'

                        }`}>

                        <div className={`w-2 h-2 rounded-full ${selectedInfluencer.isActive !== false ? 'bg-green-500' : 'bg-red-500'

                          }`} />

                        {selectedInfluencer.isActive !== false ? 'Active' : 'Inactive'}

                      </span>

                    </div>

                  </div>

                </div>



                {/* Portfolio & Social Links */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:col-span-2">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />

                    </svg>

                    Portfolio & Social Links

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Portfolio Files</p>

                      <div className="flex flex-wrap gap-2 mt-1">

                        {selectedInfluencer.portfolio?.length > 0 ? (

                          selectedInfluencer.portfolio.map((file, idx) => (

                            <span key={idx} className="px-2 py-1 bg-gray-100 text-white/80 text-xs rounded-full">

                              {file.name || `File ${idx + 1}`}

                            </span>

                          ))

                        ) : (

                          <span className="text-white/60 text-sm">No portfolio files uploaded</span>

                        )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Social Media Links</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">

                        {selectedInfluencer.socialLinks?.instagram && (

                          <div className="flex items-center gap-2">

                            <span className="text-pink-600">📷</span>

                            <a href={selectedInfluencer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"

                              className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                              Instagram

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.youtube && (

                          <div className="flex items-center gap-2">

                            <span className="text-red-600">📺</span>

                            <a href={selectedInfluencer.socialLinks.youtube} target="_blank" rel="noopener noreferrer"

                              className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                              YouTube

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.facebook && (

                          <div className="flex items-center gap-2">

                            <span className="text-blue-600">📘</span>

                            <a href={selectedInfluencer.socialLinks.facebook} target="_blank" rel="noopener noreferrer"

                              className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                              Facebook

                            </a>

                          </div>

                        )}

                        {selectedInfluencer.socialLinks?.website && (

                          <div className="flex items-center gap-2">

                            <span className="text-white/70">🌐</span>

                            <a href={selectedInfluencer.socialLinks.website} target="_blank" rel="noopener noreferrer"

                              className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                              Website

                            </a>

                          </div>

                        )}

                        {(!selectedInfluencer.socialLinks?.instagram && !selectedInfluencer.socialLinks?.youtube &&

                          !selectedInfluencer.socialLinks?.facebook && !selectedInfluencer.socialLinks?.website) && (

                            <span className="text-white/60 text-sm">No social links provided</span>

                          )}

                      </div>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">ID Proof Status</p>

                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${selectedInfluencer.idProof ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'

                        }`}>

                        {selectedInfluencer.idProof ? '✓ Verified' : '⏳ Pending'}

                      </span>

                    </div>

                  </div>

                </div>

              </div>



              {/* Modal Footer */}

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">

                <button

                  onClick={handleCloseArtistModal}

                  className="px-6 py-2 text-white/80 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"

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

        <div className="fixed inset-0 z-50 bg-[#0D0D0D] overflow-y-auto animate-fadeIn text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-[#0D0D0D]/95 backdrop-blur animate-slideDown shadow-xl" style={{ 
              borderBottom: `3px solid ${config.primary_action}`,
              boxShadow: `0 4px 20px ${config.primary_action}30`
            }}>
              <div className="flex items-center justify-between gap-4">
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-white">Forward Inquiry</h3>
                  <p className="text-sm mt-1 text-slate-400">Select one or more creators to forward this inquiry to.</p>
                </div>
                <div className="flex items-center gap-2 animate-fadeIn">
                  <button 
                    onClick={() => setShowForwardModal(false)} 
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all border border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
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
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
              }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: config.primary_action }}></div>
                  <h4 className="text-lg font-semibold text-white">Auto Match Influencers</h4>
                </div>
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {loadingSmartMatches
                    ? 'Finding best creators from campaign category, micro-category, budget and location...'
                    : smartMatchInquiryId === forwardInquiryId && smartMatchedInfluencers.length > 0
                      ? 'Best matches loaded. Top recommended creators are pre-selected for faster forwarding.'
                      : 'No exact automatic match yet. Use filters below to search manually.'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lifestyle, Music"
                      value={forwardSearchCategory}
                      onChange={(e) => setForwardSearchCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D0D0D] text-white text-sm font-medium transition-all focus:border-[#DF7AFE] focus:ring-1 focus:ring-[#DF7AFE] placeholder-white/30"
                    />
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      Budget Min
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rs</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={forwardFilterBudgetMin}
                        onChange={(e) => setForwardFilterBudgetMin(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#0D0D0D] text-white text-sm font-medium transition-all focus:border-[#DF7AFE] focus:ring-1 focus:ring-[#DF7AFE] placeholder-white/30"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      Budget Max
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">Rs</span>
                      <input
                        type="number"
                        placeholder="100000"
                        value={forwardFilterBudgetMax}
                        onChange={(e) => setForwardFilterBudgetMax(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#0D0D0D] text-white text-sm font-medium transition-all focus:border-[#DF7AFE] focus:ring-1 focus:ring-[#DF7AFE] placeholder-white/30"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-semibold text-slate-300 mb-1 block flex items-center gap-1">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="City or Country"
                      value={forwardFilterLocation}
                      onChange={(e) => setForwardFilterLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0D0D0D] text-white text-sm font-medium transition-all focus:border-[#DF7AFE] focus:ring-1 focus:ring-[#DF7AFE] placeholder-white/30"
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
                      className="px-5 py-2.5 rounded-xl border border-white/10 text-white bg-white/[0.05] hover:bg-white/[0.08] transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      Clear Filters
                    </button>
                    <div className="text-sm text-white/70 sm:ml-auto flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Showing best-fit creators first
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl shadow-xl p-4 sm:p-6" style={{ 
                background: '#121212',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)'
              }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Available Influencers</h4>
                  <div className="text-sm text-slate-400">
                    {filteredInfluencersForForward.length} matching
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

                  {(isFilteringInfluencers || loadingSmartMatches) ? (
                    // Loading skeleton
                    Array.from({ length: 6 }).map((_, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 border border-white/10 rounded-xl animate-pulse">
                        <div className="w-5 h-5 bg-white/[0.08] rounded mt-1"></div>
                        <div className="flex-1 min-w-0">
                          <div className="h-4 bg-white/[0.08] rounded mb-2"></div>
                          <div className="h-3 bg-white/[0.05] rounded w-3/4"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Check if any filters are applied
                    (forwardSearchCategory || forwardFilterBudgetMin || forwardFilterBudgetMax || forwardFilterLocation || (smartMatchInquiryId === forwardInquiryId && smartMatchedInfluencers.length > 0)) ? (
                      // Automatic matches or filters are applied - show matching results
                      filteredInfluencersForForward.length === 0 ? (
                        // No influencers match filters
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-white/[0.05] border border-white/10 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">??</span>
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">No Influencers Match Your Filters</h4>
                          <p className="text-sm text-slate-400 max-w-md mb-4">
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
                          const matchScore = Number(i.matchScore || 0);
                          const matchReasons = Array.isArray(i.matchReasons) ? i.matchReasons : [];

                          return (
                            <label key={aid} className="flex items-start gap-3 p-4 border rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all hover:shadow-lg" style={{ 
                              borderColor: checked ? config.primary_action : 'rgba(255,255,255,0.1)',
                              backgroundColor: checked ? `${config.primary_action}15` : '#0D0D0D',
                              boxShadow: checked ? `0 4px 15px ${config.primary_action}30` : 'none'
                            }}>
                              <input className="mt-1 w-5 h-5 rounded focus:ring-2 focus:ring-brand-100" type="checkbox" checked={checked} onChange={() => handleToggleRecipient(aid)} style={{ 
                                color: checked ? 'white' : config.primary_action,
                                backgroundColor: checked ? config.primary_action : '#0D0D0D'
                              }} />
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate text-[#f8fafc]">
                                  {i.fullName || i.name || `Influencer ${aid?.slice(-6)}`}
                                </div>
                                <div className="text-xs mt-1 break-words text-slate-400">
                                  {i.categories?.join(', ') || i.category || 'General'} · {i.email}
                                </div>
                                {matchScore > 0 && (
                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                                      {matchScore}% match
                                    </span>
                                    {matchReasons.slice(0, 2).map((reason) => (
                                      <span key={reason} className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-slate-300 border border-white/5">
                                        {reason}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </label>
                          );
                        })
                      )
                    ) : (
                      // No filters applied - show empty state
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-white/[0.05] border border-white/10 rounded-full flex items-center justify-center mb-4">
                          <span className="text-2xl">??</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-2">Apply Filters to See Influencers</h4>
                        <p className="text-sm text-slate-400 max-w-md mb-4">
                          Use the filters above to search for influencers by category, budget, or location.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span>Category</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <span>Budget</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
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

          <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">

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

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                    </svg>

                    User Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Name</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.userId?.name || selectedInquiry.name || 'Not provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Email</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.userId?.email || selectedInquiry.email || 'Not provided'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Phone</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.phone || 'Not provided'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Event Information */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />

                    </svg>

                    Event Information

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Category</p>

                      <p className="font-medium text-white capitalize">

                        {selectedInquiry.category || 'Not specified'}

                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-white/60">Hiring Of</p>

                      <p className="font-medium text-white capitalize">

                        {selectedInquiry.hiringFor || 'Not specified'}

                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-white/60">inquiry date</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.eventDate ? new Date(selectedInquiry.eventDate).toLocaleDateString('en-IN') : 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="font-medium text-white">
                        {renderLocation(selectedInquiry.location)}
                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Budget</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.budget ? `₹${Number(selectedInquiry.budget).toLocaleString('en-IN')}` : 'Not specified'}

                      </p>

                    </div>

                  </div>

                </div>



                {/* Requirements */}

                <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:col-span-2">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                    </svg>

                    Requirements

                  </h3>

                  <p className="font-medium text-white text-sm leading-relaxed whitespace-pre-wrap">

                    {selectedInquiry.requirements || 'No specific requirements mentioned'}

                  </p>

                </div>

              </div>



              {/* Unified Forwarded Influencers Tracking Section */}

              {selectedInquiry.forwardedTo && selectedInquiry.forwardedTo.length > 0 && (

                <div className="bg-gradient-to-br from-[#171321] to-[#3E2A55] rounded-xl p-6 md:col-span-2 mb-6 border border-white/10 shadow-sm mt-6">

                  <div className="flex items-center justify-between mb-6">

                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">

                      <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

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

                            {accepted > 0 && <span className="px-3 py-1 bg-green-500/20 text-green-300 font-semibold rounded-full">✓ Accepted: {accepted}</span>}

                            {rejected > 0 && <span className="px-3 py-1 bg-red-500/20 text-red-300 font-semibold rounded-full">✕ Rejected: {rejected}</span>}

                            {pending > 0 && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 font-semibold rounded-full">⏳ Pending: {pending}</span>}

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

                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'

                          : accepted > 0

                          ? 'bg-blue-950/40 border-blue-800 text-blue-300'

                          : 'bg-amber-950/40 border-amber-800 text-amber-300'

                      }`}>

                        <p className="text-sm font-semibold text-white/90 flex items-center gap-2">

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

                              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-800'

                              : acceptanceStatus === 'accepted'

                              ? 'bg-green-950/40 border-green-500/50'

                              : acceptanceStatus === 'rejected' || acceptanceStatus === 'auto-rejected'

                              ? 'bg-red-950/40 border-red-500/50 opacity-75'

                              : 'bg-[#121212] border-white/10 hover:border-[#DF7AFE]'

                          }`}

                        >

                          <div className="flex-1">

                            <div className="flex items-center gap-2 mb-2">

                              <p className="font-semibold text-white flex items-center gap-1">

                                {isAssigned && (

                                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">

                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />

                                  </svg>

                                )}

                                {influencerName}

                              </p>

                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${

                                isAssigned

                                  ? 'bg-emerald-500/20 text-emerald-300'

                                  : acceptanceStatus === 'accepted'

                                  ? 'bg-green-500/20 text-green-300'

                                  : acceptanceStatus === 'rejected'

                                  ? 'bg-red-500/20 text-red-300'

                                  : acceptanceStatus === 'auto-rejected'

                                  ? 'bg-red-500/30 text-red-400'

                                  : 'bg-yellow-500/20 text-yellow-300'

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



                            <div className="text-sm text-white/70 space-y-1">

                              <p>

                                <span className="font-medium text-white/80">Category:</span> {influencerCategory}

                              </p>

                              <p>

                                <span className="font-medium text-white/80">Email:</span>{' '}

                                <a href={`mailto:${influencerEmail}`} className="text-[#DF7AFE] hover:underline">

                                  {influencerEmail}

                                </a>

                              </p>

                              <p>

                                <span className="font-medium text-white/80">Forwarded:</span> {forwardedDate}

                              </p>

                              {responseDate && (

                                <p>

                                  <span className="font-medium text-white/80">

                                    {acceptanceStatus === 'accepted' ? '✓ Accepted' : '✕ Responded'}:

                                  </span>{' '}

                                  {responseDate}

                                </p>

                              )}

                              {forward.response && (

                                <div className="mt-2 p-2 bg-black/40 rounded border-l-2 border-white/20">

                                  <p className="text-xs text-white/80 whitespace-pre-wrap">

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
                                    showToast('Cannot get influencer ID. Please refresh and try again.', 'error');
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

                <div className="bg-blue-950/30 border border-blue-800/50 rounded-xl p-6 md:col-span-2 mb-6 text-white mt-6">

                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />

                    </svg>

                    Accepted By Admin

                  </h3>

                  <div className="space-y-3">

                    <div>

                      <p className="text-sm text-white/60">Admin Name</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.acceptedByAdmin?.name || selectedInquiry.acceptedByAdminName || 'Not specified'}

                      </p>

                    </div>

                    <div>

                      <p className="text-sm text-white/60">Admin Email</p>

                      <p className="font-medium text-white">

                        {selectedInquiry.acceptedByAdmin?.email || selectedInquiry.acceptedByAdminEmail || 'Not specified'}

                      </p>

                    </div>

                    {selectedInquiry.acceptedAt && (

                      <div>

                        <p className="text-sm text-white/60">Accepted On</p>

                        <p className="font-medium text-white">

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

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">

                <button

                  onClick={() => setShowInquiryDetailsModal(false)}

                  className="px-6 py-2 text-white/80 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"

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

              <div className="w-12 h-12 border-4 border-[#DF7AFE]/20 border-t-[#DF7AFE] rounded-full animate-spin mb-4"></div>

              <p className="text-white/70 font-medium">Loading Influencer Details...</p>

            </div>

          ) : selectedForwardedInfluencer ? (

            <div className="bg-[#0D0D0D] border border-white/10 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto text-white">

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

                  <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />

                      </svg>

                      Personal Information

                    </h3>

                    <div className="space-y-3">

                      <div>

                        <p className="text-sm text-white/60">Full Name</p>

                        <p className="font-medium text-white">

                          {selectedForwardedInfluencer.fullName || selectedForwardedInfluencer.name || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Email Address</p>

                        <p className="font-medium text-white">

                          {selectedForwardedInfluencer.email || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Phone Number</p>

                        <p className="font-medium text-white">

                          {selectedForwardedInfluencer.phone || 'Not provided'}

                        </p>

                      </div>

                      <div>

                        <p className="font-medium text-white">
                          {renderLocation(selectedForwardedInfluencer.location)}
                        </p>

                      </div>

                    </div>

                  </div>



                  {/* Professional Information */}

                  <div className="bg-[#121212] border border-white/10 rounded-xl p-6">

                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />

                      </svg>

                      Professional Information

                    </h3>

                    <div className="space-y-3">

                      <div>

                        <p className="text-sm text-white/60">Profile Type</p>

                        <p className="font-medium text-white capitalize">

                          {selectedForwardedInfluencer.profileType || selectedForwardedInfluencer.InfluencerType || 'Not specified'}

                        </p>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Categories</p>

                        <div className="flex flex-wrap gap-1 mt-1">

                          {selectedForwardedInfluencer.categories && selectedForwardedInfluencer.categories.length > 0 ? (

                            selectedForwardedInfluencer.categories.map((cat, idx) => (

                              <span key={idx} className="px-2 py-1 bg-[#DF7AFE]/20 text-[#DF7AFE] text-xs rounded-full font-medium capitalize">

                                {cat}

                              </span>

                            ))

                          ) : (

                            <span className="px-2 py-1 bg-gray-100 text-white/70 text-xs rounded-full font-medium capitalize">

                              {selectedForwardedInfluencer.category || 'General'}

                            </span>

                          )}

                        </div>

                      </div>

                      <div>

                        <p className="text-sm text-white/60">Experience</p>

                        <p className="font-medium text-white">

                          {selectedForwardedInfluencer.experience ? `${selectedForwardedInfluencer.experience} years` : 'Not specified'}

                        </p>

                      </div>

                    </div>

                  </div>



                  {/* Bio */}

                  <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:col-span-2">

                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />

                      </svg>

                      Bio / Description

                    </h3>

                    <p className="font-medium text-white text-sm leading-relaxed">

                      {selectedForwardedInfluencer.bio || 'No bio provided'}

                    </p>

                  </div>



                  {/* Social Links */}

                  <div className="bg-[#121212] border border-white/10 rounded-xl p-6 md:col-span-2">

                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">

                      <svg className="w-5 h-5 text-[#DF7AFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />

                      </svg>

                      Social Media Links

                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">

                      {selectedForwardedInfluencer.socialLinks?.instagram && (

                        <div className="flex items-center gap-2">

                          <span className="text-pink-600">📷</span>

                          <a href={selectedForwardedInfluencer.socialLinks.instagram} target="_blank" rel="noopener noreferrer"

                            className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                            Instagram

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.youtube && (

                        <div className="flex items-center gap-2">

                          <span className="text-red-600">📺</span>

                          <a href={selectedForwardedInfluencer.socialLinks.youtube} target="_blank" rel="noopener noreferrer"

                            className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                            YouTube

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.facebook && (

                        <div className="flex items-center gap-2">

                          <span className="text-blue-600">📘</span>

                          <a href={selectedForwardedInfluencer.socialLinks.facebook} target="_blank" rel="noopener noreferrer"

                            className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                            Facebook

                          </a>

                        </div>

                      )}

                      {selectedForwardedInfluencer.socialLinks?.website && (

                        <div className="flex items-center gap-2">

                          <span className="text-white/70">🌐</span>

                          <a href={selectedForwardedInfluencer.socialLinks.website} target="_blank" rel="noopener noreferrer"

                            className="text-[#DF7AFE] hover:text-purple-700 text-sm">

                            Website

                          </a>

                        </div>

                      )}

                      {(!selectedForwardedInfluencer.socialLinks?.instagram && !selectedForwardedInfluencer.socialLinks?.youtube &&

                        !selectedForwardedInfluencer.socialLinks?.facebook && !selectedForwardedInfluencer.socialLinks?.website) && (

                          <span className="text-white/60 text-sm">No social links provided</span>

                        )}

                    </div>

                  </div>

                </div>



                {/* Modal Footer */}

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
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
                    className="px-6 py-2 text-white/80 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>

              </div>

            </div>

          ) : (

            <div className="p-12 text-center">

              <p className="text-white/70">No influencer data available</p>

            </div>

          )}

        </div>
      )}


    </div>
  );

};



export default AdminDashboard;

