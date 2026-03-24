import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import InquiryProgressBar from '../components/InquiryProgressBar';
import AdminArtistsManagement from '../components/AdminArtistsManagement';

const AdminDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { user, logout } = useAuth();
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002').replace(/\/$/, '');
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
  const [artists, setArtists] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  // Artist detail modal state
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showArtistModal, setShowArtistModal] = useState(false);
  // Forward inquiry modal state
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardInquiryId, setForwardInquiryId] = useState(null);
  const [forwardRecipients, setForwardRecipients] = useState(new Set());
  const [analytics, setAnalytics] = useState({
    totalRevenue: 245678,
    thisMonthRevenue: 45678,
    lastMonthRevenue: 38956,
    totalUsers: users.length,
    totalArtists: artists.length,
    pendingInquiries: inquiries.filter(i => (i.status || '').toLowerCase() === 'pending').length,
    activeUsers: Math.floor(users.length * 0.8),
    conversionRate: 12.5
  });

  // Check admin role
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      console.log('🚫 Access denied: Not an admin');
      navigate('home');
      return;
    }
    setAdminData(user);
  }, [user, navigate]);

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
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

      // Fetch artists data
      const artistsRes = await fetch(`${API_BASE_URL}/api/artist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        }
      });
      
      console.log('Artists fetch response status:', artistsRes.status);
      
      if (artistsRes.ok) {
        const artistsData = await artistsRes.json();
        console.log('Artists data received:', artistsData);
        const artistsArray = Array.isArray(artistsData.data) ? artistsData.data : 
                            Array.isArray(artistsData) ? artistsData : 
                            Array.isArray(artistsData.artists) ? artistsData.artists : [];
        console.log('Artists array after processing:', artistsArray);
        
        // Filter out artists with missing required fields and create demo artists if needed
        const validArtists = artistsArray.filter(artist => 
          artist && (artist.fullName || artist.name) && artist.email && 
          (artist.categories && artist.categories.length > 0 || artist.category)
        );
        
        console.log('Valid artists after filtering:', validArtists.length);
        
        // If no valid artists exist, create demo artists for testing
        if (validArtists.length === 0) {
          const demoArtists = [
            {
              _id: 'demo1',
              fullName: 'Demo Artist 1',
              email: 'artist1@example.com',
              categories: ['Singer'],
              profileType: 'artist'
            },
            {
              _id: 'demo2',
              fullName: 'Demo Artist 2',
              email: 'artist2@example.com',
              categories: ['DJ'],
              profileType: 'artist'
            }
          ];
          console.log('Using demo artists:', demoArtists);
          setArtists(demoArtists);
        } else {
          console.log('Using real artists:', validArtists);
          setArtists(validArtists);
        }
      } else {
        console.error('Failed to fetch artists:', artistsRes.status, artistsRes.statusText);
        try {
          const errorData = await artistsRes.json();
          console.error('Error response:', errorData);
        } catch (e) {
          const errorText = await artistsRes.text();
          console.error('Error text:', errorText);
        }
        
        // Set demo artists as fallback
        const demoArtists = [
          {
            _id: 'demo1',
            fullName: 'Demo Artist 1',
            email: 'artist1@example.com',
            categories: ['Singer'],
            profileType: 'artist'
          }
        ];
        setArtists(demoArtists);
      }

      // Update analytics with real data (ensure arrays exist)
      setAnalytics({
        totalRevenue: 245678,
        thisMonthRevenue: 45678,
        lastMonthRevenue: 38956,
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalArtists: Array.isArray(artists) ? artists.length : 0,
        pendingInquiries: Array.isArray(inquiries) ? inquiries.filter(i => (i.status || '').toLowerCase() === 'pending').length : 0,
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

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!adminData) return;
    fetchDashboardData();
  }, [adminData, API_BASE_URL]);

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
    // For now, just show an alert with inquiry details
    // In a real implementation, this would open a modal with full details
    const details = `
Inquiry Details:
- ID: ${inquiry._id?.slice(-6)}
- Name: ${inquiry.name}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone}
- Category: ${inquiry.category}
- Event: ${inquiry.eventType}
- Date: ${inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString() : 'Not specified'}
- Budget: ₹${inquiry.budget ? Number(inquiry.budget).toLocaleString('en-IN') : 'Not specified'}
- Status: ${inquiry.status}
- Progress: ${inquiry.progressPercentage || 10}%
    `;
    alert(details.trim());
  };

  const handleAssignToArtist = async (inquiryId) => {
    // For now, just complete the inquiry
    // In a real implementation, this would open a modal to select an artist
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${inquiryId}/assign/demo`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          notes: 'Inquiry completed by admin' 
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInquiries(prev => prev.map(i =>
          (i._id === inquiryId || i.id === inquiryId) ? data.data : i
        ));
        setSuccessMessage('Inquiry completed successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert(data.message || 'Failed to complete inquiry');
      }
    } catch (err) {
      console.error('Error completing inquiry:', err);
      alert('Network error while completing inquiry.');
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

  // Artist detail view functions
  const handleViewArtist = (artist) => {
    setSelectedArtist(artist);
    setShowArtistModal(true);
  };

  const handleCloseArtistModal = () => {
    setShowArtistModal(false);
    setSelectedArtist(null);
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
                {analytics.totalBookings}
              </span>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Total Bookings</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                This month: {Math.floor(analytics.thisMonthRevenue / 25000)}
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
                {analytics.pendingInquiries}
              </span>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: getThemeColor('secondary') }}>Pending Inquiries</h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Needs review
              </span>
            </div>
          </div>
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
          <div className="p-6 space-y-4">
            {[
              { icon: '👤', text: 'New user registered', time: '2 minutes ago' },
              { icon: '📅', text: 'New booking created', time: '5 minutes ago' },
              { icon: '💬', text: 'New inquiry received', time: '10 minutes ago' },
              { icon: '🎨', text: 'Artist profile updated', time: '15 minutes ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: getThemeColor('text') }}>{activity.text}</p>
                  <p className="text-sm" style={{ color: getThemeColor('secondary') }}>{activity.time}</p>
                </div>
              </div>
            ))}
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
              <span className="font-medium text-green-800">Total Artists</span>
              <span className="text-2xl font-bold text-green-600">{analytics.totalArtists}</span>
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
  const renderUsers = () => (
    <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      style={{ backgroundColor: getThemeColor('surface') }}>
      <div className={`bg-gradient-to-r ${getCategoryColors(1)} p-6 flex justify-between items-center`}>
        <h3 className="text-xl font-bold text-white">User Management</h3>
        <button className="px-4 py-2 bg-white text-green-600 rounded-xl font-medium hover:bg-green-50 transition-colors">
          Add New User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
            ) : users.map((user) => (
              <tr key={user._id || user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium" style={{ color: getThemeColor('text') }}>{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  );




  const renderInquiries = () => (
    <div className="rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      style={{ backgroundColor: getThemeColor('surface') }}>
      <div className={`bg-gradient-to-r ${getCategoryColors(6)} p-6 flex justify-between items-center`}>
        <h3 className="text-xl font-bold text-white">Inquiry Management</h3>
        <div className="text-white/90 text-sm font-semibold">
          Total: {Array.isArray(inquiries) ? inquiries.length : 0}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(Array.isArray(inquiries) ? inquiries : []).map((inquiry) => {
              const inquiryId = inquiry._id || inquiry.id;
              const status = inquiry.status || 'sent';
              return (
              <tr key={inquiryId} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: getThemeColor('text') }}>#{String(inquiryId).slice(-6)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {inquiry.userId?.name || inquiry.name}
                  <div className="text-xs text-gray-400">{inquiry.userId?.email || inquiry.email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="font-semibold text-gray-700 capitalize">{inquiry.hiringFor}</div>
                  <div className="text-xs text-gray-500">{inquiry.category} · {inquiry.location}</div>
                  {inquiry.budget !== undefined && inquiry.budget !== null && (
                    <div className="text-xs text-gray-500">Budget: ₹{Number(inquiry.budget).toLocaleString('en-IN')}</div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="font-medium text-gray-700">{inquiry.eventType}</div>
                  <div className="text-xs text-gray-500 truncate">{inquiry.requirements || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString('en-IN') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="w-24">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    status === 'admin_accepted' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'admin_rejected' ? 'bg-red-100 text-red-800' :
                    status === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                    status === 'artist_accepted' ? 'bg-green-100 text-green-800' :
                    status === 'artist_rejected' ? 'bg-red-100 text-red-800' :
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {status === 'sent' && (
                      <>
                        <button
                          onClick={() => handleAdminInquiryAction(inquiryId, 'accept')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleAdminInquiryAction(inquiryId, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {status === 'admin_accepted' && (
                      <button
                        onClick={() => handleOpenForwardModal(inquiryId)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Forward
                      </button>
                    )}
                    {(status === 'artist_accepted' || status === 'artist_rejected') && (
                      <button
                        onClick={() => handleAssignToArtist(inquiryId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => handleViewInquiryDetails(inquiry)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
                    Indori Artist Platform - Real-time Management
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
            {['overview', 'users', 'artists', 'inquiries', 'analytics', 'settings'].map((tab, index) => (
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
                    {tab === 'artists' && '🎨'}
                    {tab === 'inquiries' && '💬'}
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
        {activeTab === 'artists' && (
          <AdminArtistsManagement 
            artists={artists} 
            onRefreshArtists={fetchDashboardData}
          />
        )}
        {activeTab === 'inquiries' && renderInquiries()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Artist Detail Modal */}
      {showArtistModal && selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${getCategoryColors(2)} p-6 rounded-t-2xl`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    {selectedArtist.profileImage ? (
                      <img src={selectedArtist.profileImage} alt={selectedArtist.firstName} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {selectedArtist.firstName?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedArtist.firstName} {selectedArtist.lastName}
                    </h2>
                    <p className="text-white/80 mt-1">
                      {selectedArtist.artistType || 'Professional Artist'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        selectedArtist.isActive !== false 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedArtist.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {selectedArtist.isActive !== false ? 'Active' : 'Inactive'}
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
                        <p className="font-medium text-gray-900">{selectedArtist.firstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Name</p>
                        <p className="font-medium text-gray-900">{selectedArtist.lastName || 'Not provided'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{selectedArtist.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{selectedArtist.phone || 'Not provided'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtist.dateOfBirth ? new Date(selectedArtist.dateOfBirth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium text-gray-900 capitalize">
                          {selectedArtist.gender || 'Not specified'}
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
                        {selectedArtist.artistType || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedArtist.category ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
                            {selectedArtist.category}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">No category specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subcategory</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {selectedArtist.subcategory || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Skills</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedArtist.skills?.length > 0 ? (
                          selectedArtist.skills.map((skill, idx) => (
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
                        {selectedArtist.experience ? `${selectedArtist.experience} years` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Bio / Description</p>
                      <p className="font-medium text-gray-900 text-sm leading-relaxed">
                        {selectedArtist.bio || 'No bio provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {selectedArtist.location || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium text-gray-900">
                        {selectedArtist.createdAt ? new Date(selectedArtist.createdAt).toLocaleDateString() : 'Not available'}
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
                          {selectedArtist.budgetMin ? `₹${selectedArtist.budgetMin}` : 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Upto</p>
                        <p className="font-medium text-gray-900">
                          {selectedArtist.budgetMax ? `₹${selectedArtist.budgetMax}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        selectedArtist.isActive !== false 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          selectedArtist.isActive !== false ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {selectedArtist.isActive !== false ? 'Active' : 'Inactive'}
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
                        {selectedArtist.portfolio?.length > 0 ? (
                          selectedArtist.portfolio.map((file, idx) => (
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
                        {selectedArtist.socialLinks?.instagram && (
                          <div className="flex items-center gap-2">
                            <span className="text-pink-600">📷</span>
                            <a href={selectedArtist.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                               className="text-purple-600 hover:text-purple-700 text-sm">
                              Instagram
                            </a>
                          </div>
                        )}
                        {selectedArtist.socialLinks?.youtube && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600">📺</span>
                            <a href={selectedArtist.socialLinks.youtube} target="_blank" rel="noopener noreferrer"
                               className="text-purple-600 hover:text-purple-700 text-sm">
                              YouTube
                            </a>
                          </div>
                        )}
                        {selectedArtist.socialLinks?.facebook && (
                          <div className="flex items-center gap-2">
                            <span className="text-blue-600">📘</span>
                            <a href={selectedArtist.socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                               className="text-purple-600 hover:text-purple-700 text-sm">
                              Facebook
                            </a>
                          </div>
                        )}
                        {selectedArtist.socialLinks?.website && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">🌐</span>
                            <a href={selectedArtist.socialLinks.website} target="_blank" rel="noopener noreferrer"
                               className="text-purple-600 hover:text-purple-700 text-sm">
                              Website
                            </a>
                          </div>
                        )}
                        {(!selectedArtist.socialLinks?.instagram && !selectedArtist.socialLinks?.youtube && 
                          !selectedArtist.socialLinks?.facebook && !selectedArtist.socialLinks?.website) && (
                          <span className="text-gray-500 text-sm">No social links provided</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID Proof Status</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
                        selectedArtist.idProof ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedArtist.idProof ? '✓ Verified' : '⏳ Pending'}
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
              <p className="text-sm text-gray-600">Select one or more artists/influencers to forward this inquiry to.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artists.length === 0 ? (
                  <div className="text-gray-400">No artists available</div>
                ) : artists.map(a => {
                  const aid = a._id || a.id;
                  const checked = forwardRecipients.has(aid);
                  return (
                    <label key={aid} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => handleToggleRecipient(aid)} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {a.fullName || a.name || `Artist ${aid?.slice(-6)}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {a.categories?.join(', ') || a.category || 'General'} · {a.email}
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
    </div>
  );
};

export default AdminDashboard;
