import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import InquiryProgressBar from '../components/InquiryProgressBar';

const InfluencerDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [influencerData, setInfluencerData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0
  });

  // Fetch inquiries for this influencer (moved outside useEffect)
  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    console.log('🎨 Starting real-time influencer inquiries fetch');
    
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const influencerData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
      const influencerId = influencerData?._id || influencerData?.id;
      
      console.log('🎨 Current influencer data:', influencerData);
      console.log('🎨 Influencer ID for filtering:', influencerId);
      
      if (!influencerId) {
        console.error('🎨 No influencer ID found, cannot fetch inquiries');
        setLoadingInquiries(false);
        return;
      }
      
      // Fetch inquiries directly from influencer inquiries endpoint
      console.log('🎨 Fetching from influencer inquiries endpoint...');
      const res = await fetch(`${API_BASE_URL}/api/influencer/inquiries`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });
      
      if (res.ok) {
        const result = await res.json();
        console.log('🎨 Inquiry data fetched:', result);
        
        if (result.success && result.data) {
          setInquiries(result.data);
        } else {
          setInquiries([]);
        }
      } else {
        console.error('🎨 Failed to fetch inquiries:', res.status);
        setInquiries([]);
      }
      
    } catch (error) {
      console.error('🎨 Error fetching real-time inquiries:', error);
      setInquiries([]);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    // Load influencer data from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setInfluencerData(JSON.parse(storedUser));
    }

    const fetchInfluencerData = async () => {
      try {
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      } catch (error) {
        console.error('Error fetching influencer dashboard data:', error);
      }
    };

    fetchInfluencerData();

    fetchInquiries();

  }, []);

  // Debug useEffect to monitor inquiries state (real-time only)
  useEffect(() => {
    console.log('🎨 Real-time inquiries state updated:', inquiries);
    console.log('🎨 Real-time inquiries length:', inquiries.length);
    console.log('🎨 Loading state:', loadingInquiries);
  }, [inquiries, loadingInquiries]);


  const handleLogout = () => {
    logout();
    navigate('home');
  };


  const renderOverview = () => {
    // Enhanced inquiry statistics with comprehensive tracking
    const totalInquiries = inquiries.length;
    
    // Process Flow Stages - Enhanced tracking
    const receivedInquiries = inquiries.filter(inq => 
      inq.status === 'forwarded' || inq.status === 'sent' || 
      (!inq.status && !inq.adminStatus) || 
      (inq.status === 'pending' && !inq.adminStatus)
    ).length;
    
    const viewedByInfluencer = inquiries.filter(inq => 
      (inq.status === 'forwarded' || inq.status === 'sent' || 
      (!inq.status && !inq.adminStatus)) && 
      inq.viewedByInfluencer
    ).length;
    
    const acceptedByInfluencer = inquiries.filter(inq => 
      inq.status === 'accepted' || inq.status === 'artist_accepted'
    ).length;
    
    const pendingAdminConfirmation = inquiries.filter(inq => 
      (inq.status === 'accepted' || inq.status === 'artist_accepted') && 
      (!inq.adminStatus || inq.adminStatus === 'pending' || 
       (inq.adminStatus !== 'accepted' && inq.adminStatus !== 'rejected' && inq.adminStatus !== 'confirmed'))
    ).length;
    
    const confirmedByBoth = inquiries.filter(inq => 
      (inq.status === 'accepted' || inq.status === 'artist_accepted') && 
      (inq.adminStatus === 'accepted' || inq.adminStatus === 'confirmed')
    ).length;
    
    const rejectedByInfluencer = inquiries.filter(inq => 
      inq.status === 'rejected' || inq.status === 'artist_rejected'
    ).length;
    
    const rejectedByAdmin = inquiries.filter(inq => 
      (inq.status === 'accepted' || inq.status === 'artist_accepted') && 
      inq.adminStatus === 'rejected'
    ).length;

    return (
    <>
      {/* Enhanced Process Flow Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">📋 Complete Inquiry Journey</h3>
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-gray-800">{totalInquiries}</span> inquiries tracked
          </div>
        </div>
        
        {/* Enhanced Visual Process Flow */}
        <div className="flex items-center justify-between mb-6 overflow-x-auto">
          <div className="flex items-center min-w-max">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                receivedInquiries > 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">Received</div>
              <div className="text-xs text-gray-500">{receivedInquiries}</div>
            </div>
            
            <div className="flex items-center mx-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                viewedByInfluencer > 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 8C4.732 6 7.823 6 9.5c0 1.097.865 2 1.932 2h8.136c1.067 0 1.932-.903 1.932-2V8.5c0-1.097-.865-2-1.932-2H9.5C7.823 6 6.732 6 5.458 6c-.5 0-.903.402-.903.903v2.194c0 .5.403.903.903.903h8.136c1.067 0 1.932-.903 1.932-2V8.5c0-1.097-.865-2-1.932-2H9.5C7.823 6 6.732 6 5.458 6c-.5 0-.903.402-.903.903v2.194c0 .5.403.903.903.903h8.136c1.067 0 1.932-.903 1.932-2V8.5c0-1.097-.865-2-1.932-2H9.5z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">Viewed</div>
              <div className="text-xs text-gray-500">{viewedByInfluencer}</div>
            </div>
            
            <div className="flex items-center mx-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                acceptedByInfluencer > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">Your Action</div>
              <div className="text-xs text-gray-500">{acceptedByInfluencer} accepted</div>
            </div>
            
            <div className="flex items-center mx-4">
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                confirmedByBoth > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 011.618 6.376A11.955 11.955 0 0112 21a11.955 11.955 0 01-6.618-1.64A11.955 11.955 0 013.382 12.016 11.945 11.945 0 0112 3.024a11.945 11.945 0 018.618 8.992z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">Confirmed</div>
              <div className="text-xs text-gray-500">{confirmedByBoth}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Detailed Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Received Inquiries */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">{receivedInquiries}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">📥 Received</h3>
          <p className="text-xs text-gray-500 mt-1">New inquiries forwarded</p>
        </div>

        {/* Viewed by Influencer */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 8C4.732 6 7.823 6 9.5c0 1.097.865 2 1.932 2h8.136c1.067 0 1.932-.903 1.932-2V8.5c0-1.097-.865-2-1.932-2H9.5C7.823 6 6.732 6 5.458 6c-.5 0-.903.402-.903.903v2.194c0 .5.403.903.903.903h8.136c1.067 0 1.932-.903 1.932-2V8.5c0-1.097-.865-2-1.932-2H9.5z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">{viewedByInfluencer}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">👁️ Viewed</h3>
          <p className="text-xs text-gray-500 mt-1">Inquiries you've seen</p>
        </div>

        {/* Accepted by Influencer */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">{acceptedByInfluencer}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">✅ Accepted by You</h3>
          <p className="text-xs text-gray-500 mt-1">Inquiries you've approved</p>
        </div>

        {/* Pending Admin Confirmation */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">{pendingAdminConfirmation}</span>
          </div>
          <h3 className="text-gray-600 text-sm font-medium">⏳ Pending Admin</h3>
          <p className="text-xs text-gray-500 mt-1">Waiting admin approval</p>
        </div>
      </div>

      {/* Enhanced Rejection Tracking Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">❌ Rejection Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rejected by Influencer */}
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">{rejectedByInfluencer}</div>
            <div className="text-lg font-semibold text-red-700 mb-1">Rejected by You</div>
            <div className="text-sm text-gray-600">Inquiries you declined</div>
            <div className="text-xs text-gray-500 mt-2">
              {rejectedByInfluencer > 0 && (
                <div>These inquiries were rejected by you and cannot be recovered</div>
              )}
            </div>
          </div>

          {/* Rejected by Admin */}
          <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h-6m-6 0h6m-6 0h6v2m0 4h6m-6 0h6v2m0 4h6m-6 0h6v2m0 4h6m-6 0h6v2m0 4h6m-6 0h6v2" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-2">{rejectedByAdmin}</div>
            <div className="text-lg font-semibold text-orange-700 mb-1">Rejected by Admin</div>
            <div className="text-sm text-gray-600">Your acceptances rejected by admin</div>
            <div className="text-xs text-gray-500 mt-2">
              {rejectedByAdmin > 0 && (
                <div>Admin rejected inquiries you had accepted</div>
              )}
            </div>
          </div>

          {/* Total Rejected */}
          <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0017.977 21.48l.463 1.463A2 2 0 0021.48 17.977l-1.463-1.463A2 2 0 0017.977 2.52V7a2 2 0 00-2-2h-4z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-600 mb-2">{rejectedByInfluencer + rejectedByAdmin}</div>
            <div className="text-lg font-semibold text-gray-700 mb-1">Total Rejected</div>
            <div className="text-sm text-gray-600">All rejected inquiries</div>
            <div className="text-xs text-gray-500 mt-2">
              Combined total of all rejections
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016a11.955 11.955 0 011.618 6.376A11.955 11.955 0 0112 21a11.955 11.955 0 01-6.618-1.64A11.955 11.955 0 013.382 12.016 11.945 11.945 0 0112 3.024a11.945 11.945 0 018.618 8.992z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">{confirmedByBoth}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">🎯 Confirmed by Both</h3>
        <p className="text-xs text-gray-500 mt-1">Final approved inquiries</p>
      </div>

      {/* Enhanced Summary Statistics */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">📈 Complete Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">View Rate</span>
                <span className="text-lg font-bold text-indigo-600">
                  {receivedInquiries > 0 ? Math.round((viewedByInfluencer / receivedInquiries) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Acceptance Rate</span>
                <span className="text-lg font-bold text-yellow-600">
                  {receivedInquiries > 0 ? Math.round((acceptedByInfluencer / receivedInquiries) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Admin Confirmation Rate</span>
                <span className="text-lg font-bold text-green-600">
                  {acceptedByInfluencer > 0 ? Math.round((confirmedByBoth / acceptedByInfluencer) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Actions Taken</span>
                <span className="text-lg font-bold text-purple-600">
                  {acceptedByInfluencer + rejectedByInfluencer}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

  const renderInquiries = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">Inquiries Forwarded to You</h3>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              console.log('🎨 Debug: Refreshing real-time inquiries');
              fetchInquiries();
            }}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Refresh Real-time
          </button>
          <p className="text-sm text-gray-500">{inquiries.length} total</p>
        </div>
      </div>

      {loadingInquiries ? (
        <div className="p-6 text-center text-gray-500">Loading inquiries…</div>
      ) : inquiries.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No inquiries have been forwarded to you yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inquiries.map((inq) => {
            const id = inq._id || inq.id;
            const status = inq.status || 'forwarded';
            const progressPercentage = inq.progressPercentage || 60;

            return (
              <div key={id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex flex-col gap-4">
                {/* Top: Client Info, Event Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {inq.userId?.name || inq.name || 'Client Request'}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span className="inline-block px-2 py-0.5 bg-brand-50 text-brand-600 rounded-full font-medium">
                        {inq.category || inq.hiringFor || '—'}
                      </span>
                      <span className="inline-block px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full font-medium">
                        <svg className="inline w-4 h-4 mr-1 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {inq.eventDate ? new Date(inq.eventDate).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 sm:mt-0">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      status === 'forwarded' ? 'bg-purple-100 text-purple-800' :
                      status === 'artist_accepted' ? 'bg-green-100 text-green-800' :
                      status === 'artist_rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Component */}
                <div className="mt-2">
                  <InquiryProgressBar status={status} progressPercentage={progressPercentage} />
                </div>

                {/* Inquiry Details */}
                <div className="mt-2 text-sm text-gray-700">
                  <div className="mb-2">
                    <span className="font-medium text-gray-600">Event Type:</span> 
                    <span className="ml-2 text-gray-800">{inq.eventType || 'Not specified'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-600">Requirements:</span> 
                    <span className="ml-2 break-words text-gray-800">{inq.requirements || '—'}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span><strong>Budget:</strong> {inq.budget ? `₹${Number(inq.budget).toLocaleString('en-IN')}` : '—'}</span>
                    <span><strong>Location:</strong> {inq.location || '—'}</span>
                    <span><strong>Forwarded:</strong> {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : '—'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {status === 'forwarded' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleInquiryResponse(id, 'accept')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      Accept Inquiry
                    </button>
                    <button
                      onClick={() => handleInquiryResponse(id, 'reject')}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Decline Inquiry
                    </button>
                  </div>
                )}

                {(status === 'artist_accepted' || status === 'artist_rejected') && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    You have already {status.includes('accepted') ? 'accepted' : 'declined'} this inquiry
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const handleInquiryResponse = async (inquiryId, action) => {
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const response = await fetch(`${API_BASE_URL}/api/influencer/inquiries/${inquiryId}/respond`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' })
      });

      if (response.ok) {
        const data = await response.json();
        setInquiries(prev => prev.map(inq => 
          (inq._id === inquiryId || inq.id === inquiryId) ? data.data : inq
        ));
        alert(`Inquiry ${action}ed successfully!`);
      } else {
        const errData = await response.json();
        alert(errData.message || `Failed to ${action} inquiry`);
      }
    } catch (error) {
      console.error(`Error ${action}ing inquiry:`, error);
      alert('Network error occurred while updating inquiry.');
    }
  };

  return (
    <div className="min-h-full pt-20 lg:pt-24" style={{ backgroundColor: config.background_color }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Influencer Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {influencerData?.fullName || influencerData?.email || 'Influencer'}!</p>
                <p className="text-xs text-brand-500 mt-1">Indori Influencer Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
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
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'inquiries'].map((tab) => (
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'inquiries' && renderInquiries()}
      </div>
    </div>
  );
};

export default InfluencerDashboard;
