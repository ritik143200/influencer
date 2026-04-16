import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import InquiryProgressBar from '../components/InquiryProgressBar';
// import { DayPicker } from 'react-day-picker';
// import 'react-day-picker/dist/style.css';

const InfluencerDashboard = ({ config }) => {
  const { navigate } = useRouter();
  const { logout } = useAuth();
  const [influencerData, setInfluencerData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  // const [unavailableDates, setUnavailableDates] = useState([]);
  // const [availabilityLoading, setAvailabilityLoading] = useState(false);
  // const [savingAvailability, setSavingAvailability] = useState(false);
  // const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0
  });

  // Filter states for inquiries
  const [inquiryFilterStatus, setInquiryFilterStatus] = useState('all');
  const [inquiryFilterCategory, setInquiryFilterCategory] = useState('all');
  const [inquirySearchTerm, setInquirySearchTerm] = useState('');
  const [respondingInquiry, setRespondingInquiry] = useState(null);

  // Fetch inquiries for this influencer (moved outside useEffect)
  const toYmd = (dateLike) => {
    const d = new Date(dateLike);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  };

  // Format location into a readable string
  const formatLocationString = (loc) => {
    if (!loc) return '—';
    if (typeof loc === 'string') return loc;
    const { city, country } = parseLocation(loc);
    const out = [city, country].filter(Boolean).join(', ');
    return out || '—';
  };

  const fromYmd = (ymd) => new Date(`${ymd}T00:00:00.000Z`);

  // --- Availability Calendar (commented out) ---
  // const fetchAvailability = async () => {
  //   setAvailabilityLoading(true);
  //   try {
  //     const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
  //     const res = await fetch(`${API_BASE_URL}/api/influencer/me/availability`, {
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
  //     });
  //     if (!res.ok) { setUnavailableDates([]); return; }
  //     const result = await res.json();
  //     const parsed = Array.isArray(result?.data?.unavailableDates)
  //       ? result.data.unavailableDates.map(fromYmd).filter((d) => !Number.isNaN(d.getTime()))
  //       : [];
  //     setUnavailableDates(parsed);
  //   } catch (error) {
  //     console.error('Error fetching availability:', error);
  //     setUnavailableDates([]);
  //   } finally {
  //     setAvailabilityLoading(false);
  //   }
  // };
  // const saveAvailability = async () => {
  //   setSavingAvailability(true);
  //   setAvailabilityMessage('');
  //   try {
  //     const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
  //     const payload = { unavailableDates: (unavailableDates || []).map(toYmd).filter(Boolean) };
  //     const res = await fetch(`${API_BASE_URL}/api/influencer/me/availability`, {
  //       method: 'PUT',
  //       headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}`, 'Content-Type': 'application/json' },
  //       body: JSON.stringify(payload)
  //     });
  //     const result = await res.json().catch(() => ({}));
  //     if (!res.ok) { setAvailabilityMessage(result.message || 'Failed to update availability'); return; }
  //     setAvailabilityMessage('Availability updated successfully');
  //     if (Array.isArray(result?.data?.unavailableDates)) {
  //       setUnavailableDates(result.data.unavailableDates.map(fromYmd));
  //     }
  //   } catch (error) {
  //     console.error('Error saving availability:', error);
  //     setAvailabilityMessage('Network error while saving availability');
  //   } finally {
  //     setSavingAvailability(false);
  //     setTimeout(() => setAvailabilityMessage(''), 3000);
  //   }
  // };
  // --- End Availability Calendar ---

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      const influencerData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : null;
      const influencerId = influencerData?._id || influencerData?.id;

      if (!influencerId) {
        setLoadingInquiries(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/influencer/inquiries`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` }
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) setInquiries(result.data);
        else setInquiries([]);
      } else {
        setInquiries([]);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setLoadingInquiries(false);
    }
  };

  // Get filtered inquiries based on status, category, and search term
  const getFilteredInquiries = () => {
    return inquiries.filter((inq) => {
      const status = inq.status || 'forwarded';
      const category = inq.category || inq.hiringFor || '';
      const clientName = inq.userId?.name || inq.name || '';
      const requirements = inq.requirements || '';
      
      // Filter by status
      if (inquiryFilterStatus !== 'all' && status !== inquiryFilterStatus) {
        return false;
      }
      
      // Filter by category
      if (inquiryFilterCategory !== 'all' && category.toLowerCase() !== inquiryFilterCategory.toLowerCase()) {
        return false;
      }
      
      // Filter by search term (search in client name and requirements)
      if (inquirySearchTerm.trim()) {
        const searchLower = inquirySearchTerm.toLowerCase();
        const matchesName = clientName.toLowerCase().includes(searchLower);
        const matchesReqs = requirements.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesReqs) {
          return false;
        }
      }
      
      return true;
    });
  };

  useEffect(() => {
    // Load influencer data from localStorage
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      setInfluencerData(JSON.parse(storedUser));
    }

    // Initialize data
    fetchInquiries();
    // fetchAvailability(); // Availability Calendar commented out

  }, []);

  // --- Availability Calendar disabled (returns null) ---
  const renderAvailabilityManager = () => null;


  // Helper to parse location - handle both string and object formats
  const parseLocation = (location) => {
    let city = '';
    let country = '';
    
    if (typeof location === 'string') {
      // Handle old format: "Indore, India" or just "Indore"
      const parts = location.split(',').map(p => p.trim());
      city = parts[0] || '';
      country = parts[1] || '';
    } else if (location && typeof location === 'object') {
      city = (location.city || '').trim();
      country = (location.country || '').trim();
    }
    
    return { city, country };
  };

  // Helper to check which required fields are missing
  const getMissingFields = (data) => {
    if (!data) return [];
    
    const missing = [];
    
    // Required fields check
    const fullName = (data.fullName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()).trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || (data.contact && data.contact.phone) || '').trim();
    const bio = (data.bio || '').trim();
    
    // Location check - use parseLocation helper
    const { city, country } = parseLocation(data.location);
    
    const hasCategory = !!(data.niche || data.category || (data.categories && data.categories.length > 0));
    const experience = (data.experience || '').trim();
    const budgetMin = data.budgetMin;
    const budgetMax = data.budgetMax;
    const budgetDefault = data.budget;
    const instagramLink = (data.socialLinks?.instagram || data.platforms?.instagram?.url || data.instagram || '').trim();
    
    // Track missing fields with readable names
    if (!fullName) missing.push('Full Name');
    if (!email) missing.push('Email Address');
    if (!phone) missing.push('Phone Number');
    if (!bio) missing.push('About You (Bio)');
    if (!city) missing.push('City');
    if (!country) missing.push('Country');
    if (!hasCategory) missing.push('Niche/Category');
    if (!experience) missing.push('Experience');
    if (!budgetMin) missing.push('Budget Min');
    if (!budgetMax) missing.push('Budget Max');
    if (!budgetDefault) missing.push('Default Budget');
    if (!instagramLink) missing.push('Instagram Link');
    
    // Debug info intentionally removed for cleaner logs
    
    return missing;
  };

  // Helper to get the count of completed fields
  const getProfileCompletionPercentage = (data) => {
    if (!data) return 0;
    const missing = getMissingFields(data);
    const completed = 12 - missing.length;
    return Math.round((completed / 12) * 100);
  };

  // Helper to determine which required fields are missing
  const isProfileComplete = (data) => {
    if (!data) return false;
    
    // Required fields check with more robust validation
    const fullName = (data.fullName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim()).trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || (data.contact && data.contact.phone) || '').trim();
    const bio = (data.bio || '').trim();
    
    // Location check - use parseLocation helper
    const { city, country } = parseLocation(data.location);
    
    // Category/Niche check - more flexible validation
    const hasCategory = !!(data.niche || data.category || (data.categories && data.categories.length > 0));
    
    // Experience check - allow various formats
    const experience = (data.experience || '').trim();
    
    // Budget check - ensure they're valid numbers, not just empty strings
    const budgetMin = data.budgetMin;
    const budgetMax = data.budgetMax;
    const budgetDefault = data.budget;
    
    // Instagram link check - more comprehensive
    const instagramLink = (data.socialLinks?.instagram || 
                          data.platforms?.instagram?.url || 
                          data.instagram || '').trim();
    
    // Debug logging with actual values
    
    // All required fields must be filled and not empty/whitespace
    const isComplete = !!(
      fullName && 
      email && 
      phone && 
      bio && 
      city && 
      country && 
      hasCategory && 
      experience && 
      budgetMin && 
      budgetMax && 
      budgetDefault && 
      instagramLink
    );
    
    // Profile completion computed
    return isComplete;
  };

  // Debug useEffect to monitor inquiries state (real-time only)
  useEffect(() => {
    // Inquiries state updated (logging removed)
  }, [inquiries, loadingInquiries]);

  // Auto-hide popup when profile becomes complete
  useEffect(() => {
    if (!showProfileModal) return;

    const checkAndHidePopup = () => {
      const stored = localStorage.getItem('userData');
      const data = stored ? JSON.parse(stored) : influencerData;
      
      if (data && isProfileComplete(data)) {
        setShowProfileModal(false);
        setActiveTab('inquiries');
      }
    };

    // Check immediately
    checkAndHidePopup();

    // Also listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'userData' && showProfileModal) checkAndHidePopup();
    };

    // Listen for custom profile update event - fetch fresh data from server
    const handleProfileUpdate = async (event) => {
      try {
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
        const token = localStorage.getItem('userToken');
        
        const res = await fetch(`${API_BASE_URL}/api/influencer/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const result = await res.json();
          const freshData = result.data;
          setInfluencerData(freshData);
          localStorage.setItem('userData', JSON.stringify(freshData));
          if (isProfileComplete(freshData)) {
            setShowProfileModal(false);
            setActiveTab('inquiries');
          }
        } else {
          console.error('Failed to fetch fresh profile data');
          checkAndHidePopup();
        }
      } catch (error) {
        console.error('Error fetching fresh profile on update:', error);
        // Fall back to checking cached data
        checkAndHidePopup();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [showProfileModal, influencerData]);

  // Additional check on component mount and when localStorage changes
  useEffect(() => {
    const checkProfileOnMount = () => {
      const stored = localStorage.getItem('userData');
      if (stored) {
        const data = JSON.parse(stored);
        if (isProfileComplete(data)) setShowProfileModal(false);
      }
    };

    checkProfileOnMount();
  }, []);

  const renderOverview = () => {
    // Enhanced inquiry statistics with comprehensive tracking
    const totalInquiries = inquiries.length;
    
    // Process Flow Stages - Enhanced tracking
    // ... (rest of the code remains the same)
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
      {/* Enhanced Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-orange-500/10 via-white to-orange-50/20 px-5 py-4 md:px-6 md:py-4 rounded-2xl border border-orange-100/50 mb-6 relative overflow-hidden transition-all hover:shadow-xl group">
        {/* Decorative Shapes */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-400/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-orange-400/10 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/5 rounded-full blur-2xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Inquiry Center Active
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2 tracking-tight">
            🚀 Elevate Your Digital Presence
          </h2>
          
          <p className="text-sm md:text-base text-gray-600 leading-relaxed font-medium">
            Welcome back, <span className="text-orange-600 font-bold italic">{influencerData?.fullName || influencerData?.firstName || 'Creator'}</span>. 
            Every inquiry is a new opportunity to showcase your craft. Stay responsive, 
            track your growth, and let's build something iconic together.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-green-100 shadow-sm transition-transform hover:scale-105">
              <span className="relative flex h-1 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-bold text-gray-700">
                {receivedInquiries} New Opportunities Waiting
              </span>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-blue-100 shadow-sm transition-transform hover:scale-105">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold text-gray-700">Top Rated Creator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              How you earn here
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Complete your profile. Get inquiries. Earn money.</h3>
            <p className="text-sm md:text-base text-gray-600 mt-2 leading-relaxed font-medium max-w-2xl">
              Brands can only send you inquiries when your profile has the important details (bio, niche, location, budget, and social links).
              A complete profile helps you get noticed faster and convert inquiries into paid collaborations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <div className="flex items-start gap-3 p-4 rounded-2xl border bg-brand-50 text-brand-600 border-brand-100">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">🧾</div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider opacity-80">Step 1</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Complete profile</p>
                <p className="text-xs text-gray-600 mt-1">Add bio, niche, budget</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl border bg-purple-50 text-purple-600 border-purple-100">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">📩</div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider opacity-80">Step 2</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Receive inquiries</p>
                <p className="text-xs text-gray-600 mt-1">Brands contact you</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl border bg-green-50 text-green-600 border-green-100">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">💸</div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wider opacity-80">Step 3</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Earn money</p>
                <p className="text-xs text-gray-600 mt-1">Close paid deals</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
            Tip: keep your budget & social links updated for faster matches.
          </div>
          <button
            type="button"
            onClick={() => navigate('profile')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            Complete Profile
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Redesigned Compact & Attractive Inquiry Journey */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-orange-100 p-1.5 rounded-lg text-lg">📋</span> Complete Inquiry Journey
            </h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">Your progress from first contact to final confirmation</p>
          </div>
          <div className="flex items-center gap-5 bg-gray-50/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-gray-100 shadow-inner">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Total inquiries</p>
              <p className="text-xl font-black text-gray-900 leading-none">{totalInquiries}</p>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <button
              type="button"
              onClick={() => navigate('profile')}
              className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 active:scale-95"
            >
              View Profile
            </button>
          </div>
        </div>
        
        {/* The Journey Track */}
        <div className="relative px-2">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-6 left-12 right-12 h-1 bg-gray-100 rounded-full hidden md:block">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-1000"
              style={{ width: confirmedByBoth > 0 ? '100%' : (acceptedByInfluencer > 0 ? '66%' : (viewedByInfluencer > 0 ? '33%' : '0%')) }}
            ></div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 md:gap-0 relative z-10">
            {/* Step 1: Received */}
            <div className="flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                receivedInquiries > 0 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50' 
                  : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <span className={`text-[13px] font-black uppercase tracking-tight ${receivedInquiries > 0 ? 'text-gray-900' : 'text-gray-400'}`}>Received</span>
              <div className="mt-1.5 px-3 py-0.5 bg-blue-50 rounded-full border border-blue-100">
                <span className="text-xs font-bold text-blue-600">{receivedInquiries}</span>
              </div>
            </div>

            {/* Step 2: Viewed */}
            <div className="flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                viewedByInfluencer > 0 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-4 ring-indigo-50' 
                  : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C2.458 5.458 12 2.458 12 2.458s9.542 3 9.542 9.542z" />
                </svg>
              </div>
              <span className={`text-[13px] font-black uppercase tracking-tight ${viewedByInfluencer > 0 ? 'text-gray-900' : 'text-gray-400'}`}>Viewed</span>
              <div className="mt-1.5 px-3 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                <span className="text-xs font-bold text-indigo-600">{viewedByInfluencer}</span>
              </div>
            </div>

            {/* Step 3: Your Action */}
            <div className="flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                acceptedByInfluencer > 0 
                  ? 'bg-amber-500 text-white shadow-xl shadow-amber-200 ring-4 ring-amber-50' 
                  : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`text-[13px] font-black uppercase tracking-tight ${acceptedByInfluencer > 0 ? 'text-gray-900' : 'text-gray-400'}`}>Accepted</span>
              <div className="mt-1.5 px-3 py-0.5 bg-amber-50 rounded-full border border-amber-100">
                <span className="text-xs font-bold text-amber-600">{acceptedByInfluencer}</span>
              </div>
            </div>

            {/* Step 4: Confirmed */}
            <div className="flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                confirmedByBoth > 0 
                  ? 'bg-green-600 text-white shadow-xl shadow-green-200 ring-4 ring-green-50' 
                  : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className={`text-[13px] font-black uppercase tracking-tight ${confirmedByBoth > 0 ? 'text-gray-900' : 'text-gray-400'}`}>Confirmed</span>
              <div className="mt-1.5 px-3 py-0.5 bg-green-50 rounded-full border border-green-100">
                <span className="text-xs font-bold text-green-600">{confirmedByBoth}</span>
              </div>
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

  const renderInquiries = () => {
    const filteredInquiries = getFilteredInquiries();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Inquiries Forwarded to You</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchInquiries()}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Refresh Real-time
            </button>
            <p className="text-sm text-gray-500">{inquiries.length} total</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={inquiryFilterStatus}
                onChange={(e) => setInquiryFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="forwarded">⏳ Pending</option>
                <option value="artist_accepted">✓ Accepted</option>
                <option value="artist_rejected">✕ Rejected</option>
                <option value="completed">✓ Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={inquiryFilterCategory}
                onChange={(e) => setInquiryFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="artist">Artist</option>
                <option value="influencer">Influencer</option>
                <option value="creator">Creator</option>
                <option value="celebrity">Celebrity</option>
                <option value="city page">City Page</option>
                <option value="meme page">Meme Page</option>
              </select>
            </div>

            {/* Search Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by client name or requirements..."
                value={inquirySearchTerm}
                onChange={(e) => setInquirySearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Reset Filters Button */}
          {(inquiryFilterStatus !== 'all' || inquiryFilterCategory !== 'all' || inquirySearchTerm) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => {
                  setInquiryFilterStatus('all');
                  setInquiryFilterCategory('all');
                  setInquirySearchTerm('');
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {filteredInquiries.length !== inquiries.length && (
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            Showing {filteredInquiries.length} of {inquiries.length} inquiries
          </div>
        )}

        {loadingInquiries ? (
          <div className="p-6 text-center text-gray-500">Loading inquiries…</div>
        ) : inquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No inquiries have been forwarded to you yet.</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No inquiries match your filters. Try adjusting them.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInquiries.map((inq) => {
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
                      status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {status === 'completed' ? 'Completed' : status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Component */}
                <div className="mt-2">
                  <InquiryProgressBar status={status} progressPercentage={progressPercentage} assignedInfluencer={inq.assignedInfluencer} />
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
                    <span><strong>Location:</strong> {formatLocationString(inq.location)}</span>
                    <span><strong>Forwarded:</strong> {inq.createdAt ? new Date(inq.createdAt).toLocaleString() : '—'}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {status === 'forwarded' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleInquiryResponse(id, 'accept')}
                      disabled={respondingInquiry === id}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {respondingInquiry === id ? 'Accepting...' : 'Accept Inquiry'}
                    </button>
                    <button
                      onClick={() => handleInquiryResponse(id, 'reject')}
                      disabled={respondingInquiry === id}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {respondingInquiry === id ? 'Declining...' : 'Decline Inquiry'}
                    </button>
                  </div>
                )}

                {status === 'artist_accepted' && (
                  <div className="text-center mt-4">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">Accepted</span>
                    </div>
                  </div>
                )}

                {status === 'artist_rejected' && (
                  <div className="text-center text-sm text-gray-500 mt-2">
                    You have declined this inquiry
                  </div>
                )}

                {status === 'completed' && (
                  <div className="text-center text-sm text-blue-600 mt-2 bg-blue-50 p-2 rounded">
                    ✓ This inquiry has been assigned to another professional and is now completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>
    );
  };

  const handleInquiryResponse = async (inquiryId, action) => {
    // Prevent multiple submissions
    if (respondingInquiry) {
      return;
    }

    try {
      setRespondingInquiry(inquiryId);
      
      // Optimistic update - update UI immediately
      const newStatus = action === 'accept' ? 'artist_accepted' : 'artist_rejected';
      const newArtistStatus = action === 'accept' ? 'accepted' : 'rejected';
      
      setInquiries(prev => prev.map(inq => {
        if (inq._id === inquiryId || inq.id === inquiryId) {
          console.log('Optimistic update:', { 
            oldStatus: inq.status, 
            newStatus, 
            action,
            inquiryId 
          });
          return {
            ...inq,
            status: newStatus,
            artistStatus: newArtistStatus,
            progressPercentage: action === 'accept' ? 70 : inq.progressPercentage,
            assignedInfluencer: action === 'accept' ? {
              userId: influencerData._id,
              assignedBy: influencerData._id,
              assignedAt: new Date()
            } : inq.assignedInfluencer
          };
        }
        return inq;
      }));

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
        console.log('Server response:', data); // Debug log
        
        // Update with server response data but preserve optimistic changes
        setInquiries(prev => prev.map(inq => {
          if (inq._id === inquiryId || inq.id === inquiryId) {
            const updatedInquiry = data.data;
            console.log('Merging server data:', { 
              serverStatus: updatedInquiry.status,
              optimisticStatus: newStatus,
              serverData: updatedInquiry,
              originalInquiry: inq
            });
            
            // Create merged inquiry with priority to optimistic changes
            const mergedInquiry = {
              ...inq,                    // Keep original inquiry data
              ...updatedInquiry,         // Merge server data
              // Force status to remain as expected (don't let server override)
              status: newStatus,
              artistStatus: newArtistStatus,
              // Preserve optimistic assignment if it was an accept action
              assignedInfluencer: action === 'accept' ? {
                userId: influencerData._id,
                assignedBy: influencerData._id,
                assignedAt: new Date()
              } : (updatedInquiry.assignedInfluencer || inq.assignedInfluencer),
              // Preserve progress percentage
              progressPercentage: action === 'accept' ? 70 : (updatedInquiry.progressPercentage || inq.progressPercentage)
            };
            
            console.log('Final merged inquiry:', mergedInquiry);
            return mergedInquiry;
          }
          return inq;
        }));
        
        // Show success message without blocking alert
        console.log(`Inquiry ${action}ed successfully!`);
        // Optional: Show a toast notification instead of alert
      } else {
        // Revert optimistic update on error
        console.log('Error occurred, reverting optimistic update');
        setInquiries(prev => prev.map(inq => {
          if (inq._id === inquiryId || inq.id === inquiryId) {
            return {
              ...inq,
              status: 'forwarded',
              artistStatus: null,
              progressPercentage: 60,
              assignedInfluencer: null
            };
          }
          return inq;
        }));
        const errData = await response.json();
        alert(errData.message || `Failed to ${action} inquiry`);
      }
    } catch (error) {
      console.error(`Error ${action}ing inquiry:`, error);
      // Revert optimistic update on error
      console.log('Network error, reverting optimistic update');
      setInquiries(prev => prev.map(inq => {
        if (inq._id === inquiryId || inq.id === inquiryId) {
          return {
            ...inq,
            status: 'forwarded',
            artistStatus: null,
            progressPercentage: 60,
            assignedInfluencer: null
          };
        }
        return inq;
      }));
      alert('Network error occurred while updating inquiry.');
    } finally {
      setRespondingInquiry(null);
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

            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', /* 'availability', */ 'inquiries'].map((tab) => (
              <button
                key={tab}
                onClick={async () => {
                  if (tab === 'inquiries') {
                    // Fetch fresh profile data from server when user attempts to access inquiries
                    try {
                      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
                      const token = localStorage.getItem('userToken');
                      
                      // Refresh profile before opening inquiries
                      const res = await fetch(`${API_BASE_URL}/api/influencer/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (res.ok) {
                        const result = await res.json();
                        const freshData = result.data;
                        
                        
                        // Update state and localStorage with fresh data
                        setInfluencerData(freshData);
                        localStorage.setItem('userData', JSON.stringify(freshData));
                        
                        // Check profile completion with fresh data
                        if (!isProfileComplete(freshData)) {
                          setShowProfileModal(true);
                          return;
                        } else {
                          setShowProfileModal(false);
                        }
                      } else {
                        // Fallback to cached data if server fetch fails
                        console.warn('Failed to fetch fresh profile, using cached data');
                        const stored = localStorage.getItem('userData');
                        const data = stored ? JSON.parse(stored) : influencerData;
                        
                        if (!isProfileComplete(data)) {
                          setShowProfileModal(true);
                          return;
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching profile on inquiries tab click:', error);
                      // Fallback to cached data
                      const stored = localStorage.getItem('userData');
                      const data = stored ? JSON.parse(stored) : influencerData;
                      
                      if (!isProfileComplete(data)) {
                        setShowProfileModal(true);
                        return;
                      }
                    }
                  }
                  setActiveTab(tab);
                }}
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
        {/* activeTab === 'availability' && renderAvailabilityManager() */}
        {activeTab === 'inquiries' && renderInquiries()}
      </div>
      {/* Profile completion modal (blocks access to inquiries until complete) */}
      {showProfileModal && (() => {
        const stored = localStorage.getItem('userData');
        const data = stored ? JSON.parse(stored) : influencerData;
        const missingFields = getMissingFields(data);
        const completionPercent = getProfileCompletionPercentage(data);
        const totalFields = 12;
        const completedFields = totalFields - missingFields.length;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn" onClick={(e) => e.target === e.currentTarget && setShowProfileModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100 transform transition-all animate-slideUp">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-1 text-center">Complete Your Profile</h3>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-gray-600">Profile Completion</p>
                  <span className="text-sm font-bold text-brand-600">{completedFields}/{totalFields}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-brand-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{completionPercent}% Complete</p>
              </div>

              {/* Missing Fields */}
              {missingFields.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-red-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Fields to Complete:
                  </p>
                  <ul className="text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                    {missingFields.map((field, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="text-red-500">•</span>
                        <span>{field}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {completionPercent === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    All fields completed! ✅
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate('profile')}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Go to Profile Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const stored = localStorage.getItem('userData');
                    const data = stored ? JSON.parse(stored) : influencerData;
                    if (isProfileComplete(data)) {
                      setShowProfileModal(false);
                      setActiveTab('inquiries');
                    } else {
                      const still = getMissingFields(data);
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Check Again
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-5 text-center">💡 We need all details to match you with the best opportunities!</p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default InfluencerDashboard;
