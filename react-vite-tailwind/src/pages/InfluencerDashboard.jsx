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


  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">₹{earnings.total.toLocaleString()}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Total Earnings</h3>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">₹{earnings.thisMonth.toLocaleString()}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">This Month</h3>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-gray-800">₹{earnings.pending.toLocaleString()}</span>
        </div>
        <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
      </div>
    </div>
  );

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
