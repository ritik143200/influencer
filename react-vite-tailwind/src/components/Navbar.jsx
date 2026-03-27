import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../data/mockData';

const Navbar = ({ config }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDashboardMenu, setShowDashboardMenu] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showAboutDropdown, setShowAboutDropdown] = useState(false);
  const { navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDashboardMenu && !event.target.closest('.dashboard-menu')) {
        setShowDashboardMenu(false);
      }
      if (showServicesDropdown && !event.target.closest('.services-dropdown')) {
        setShowServicesDropdown(false);
      }
      if (showAboutDropdown && !event.target.closest('.about-dropdown')) {
        setShowAboutDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDashboardMenu, showServicesDropdown, showAboutDropdown]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo - Left Side */}
          <div 
            className="flex items-center cursor-pointer flex-shrink-0" 
            onClick={() => navigate('home')}
          >
            <img 
              src="/IndoriArtist_Logo.avif" 
              alt="Indori Influencer" 
              className="h-8 w-auto sm:h-10 lg:h-12"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='20' font-weight='bold' fill='%233b82f6'%3EIndori Influencer%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
            {/* Removed Search Bar - artist browsing functionality removed */}
          </div>

          {/* Right Side Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {/* Navigation Links */}
            <div className="hidden xl:flex items-center gap-4 xl:gap-6">
              {/* Home Link */}
              <button 
                onClick={() => navigate('home')}
                className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                Home
              </button>

              {/* How It Works Link */}
              <button 
                onClick={() => navigate('how-it-works')}
                className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                How It Works
              </button>

              {/* Services Link */}
              <div className="relative services-dropdown">
                <button 
                  onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                  className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  Services
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Services Dropdown */}
                {showServicesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          navigate('services-influencers');
                          setShowServicesDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.55c-.9.35-1.45-1.97-1.45H13c-.55 0-1.05.45-1.05 1.45v1c0 1.1.9 2 2 2h3c.55 0 1.05-.45 1.05-1.45v-1c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <div>
                          <div className="font-medium">Influencer Services</div>
                          <div className="text-xs text-gray-500">Brand partnerships & tools</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* About Link */}
              <div className="relative about-dropdown">
                <button 
                  onClick={() => setShowAboutDropdown(!showAboutDropdown)}
                  className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  About
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* About Dropdown */}
                {showAboutDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                      <button
                        onClick={() => {
                          navigate('about');
                          setShowAboutDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <div className="font-medium">Platform Overview</div>
                          <div className="text-xs text-gray-500">Learn about InfluencerHub</div>
                        </div>
                      </button>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      {/* Removed 'For Artists' — keeping influencer content only */}
                      <button
                        onClick={() => {
                          navigate('about-influencers');
                          setShowAboutDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.55c-.9.35-1.45-1.97-1.45H13c-.55 0-1.05.45-1.05 1.45v1c0 1.1.9 2 2 2h3c.55 0 1.05-.45 1.05-1.45v-1c0-1.1-.9-2-2-2z"/>
                        </svg>
                        <div>
                          <div className="font-medium">For Influencers</div>
                          <div className="text-xs text-gray-500">Brand partnerships & growth</div>
                        </div>
                      </button>
                    </div>
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          navigate('faq');
                          setShowAboutDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-.55.848-1.326.848-2.127V6.332c0-.8-.299-1.578-.848-2.127-.848l-3.162 0c-.549 0-1.578.848-2.127.848C4.651 4.549 4.651 6.332 4.651 8.186v1.164c0 .801.299 1.578.848 2.127.848l3.162 0c.549 0 1.578-.848 2.127-.848.549-.55.848-1.326.848-2.127V8.186c0-.8-.299-1.578-.848-2.127-.848z"/>
                        </svg>
                        <div>
                          <div className="font-medium">FAQ</div>
                          <div className="text-xs text-gray-500">Get help & support</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* FAQ Link */}
              <button 
                onClick={() => navigate('faq')}
                className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                FAQ
              </button>


              {/* Inquiry Link */}
              <button 
                onClick={() => navigate('inquiry')}
                className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap"
              >
                Inquiry
              </button>

              {/* Profile Link - Only for authenticated users */}
              {isAuthenticated && (
                <button 
                  onClick={() => navigate('profile')}
                  className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </button>
              )}
            </div>

                          {/* Dashboard Menu - Only for authenticated users */}
            {isAuthenticated && (
              <div className="relative dashboard-menu">
                <button 
                  onClick={() => setShowDashboardMenu(!showDashboardMenu)}
                  className="font-medium text-gray-700 hover:text-brand-600 transition-colors flex items-center gap-1 whitespace-nowrap"
                >
                  Dashboard
                  <svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dashboard Dropdown */}
                {showDashboardMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                    {user?.role === 'user' && (
                      <button
                        onClick={() => {
                          navigate('user-dashboard');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 007 7z" />
                        </svg>
                        <div>
                          <div className="font-medium">User Dashboard</div>
                          <div className="text-xs text-gray-500">Manage your bookings</div>
                        </div>
                      </button>
                    )}
                    
                    {(user?.role === 'artist' || user?.role === 'influencer') && (
                      <button
                        onClick={() => {
                          navigate('influencer-dashboard');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293.707.293V17a2 2 0 01-2 2H8a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <div className="font-medium">Influencer Dashboard</div>
                          <div className="text-xs text-gray-500">Manage your portfolio</div>
                        </div>
                      </button>
                    )}
                    
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          navigate('admin-dashboard');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                        <div>
                          <div className="font-medium">Admin Dashboard</div>
                          <div className="text-xs text-gray-500">System administration</div>
                        </div>
                      </button>
                    )}
                    
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          logout();
                          navigate('home');
                          setShowDashboardMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 hover:text-red-900 transition-colors flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4-4H3m2 4h6M5 12H3m2 4h6m6 4h6m2 4h6a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <div className="font-medium">Logout</div>
                          <div className="text-xs text-red-500">Sign out of your account</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Registration CTA - Hidden for authenticated users */}
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate('auth')}
                  className="font-medium text-gray-700 hover:text-brand-600 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('registration')}
                  className="px-4 xl:px-5 py-2.5 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap flex items-center gap-2"
                  style={{ backgroundColor: config.primary_action }}
                >
                  Registration
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 py-4 animate-fadeIn absolute top-full left-0 right-0 shadow-lg z-50">
            {/* Removed Search Bar from mobile menu */}
            <div className="space-y-1 px-2">
              <button
                onClick={() => {
                  navigate('home');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">Home</span>
              </button>
              <button
                onClick={() => {
                  navigate('how-it-works');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">How It Works</span>
              </button>
              <button
                onClick={() => {
                  navigate('services-influencers');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">Services</span>
              </button>
              <button
                onClick={() => {
                  navigate('about');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">About</span>
              </button>
              <button
                onClick={() => {
                  navigate('faq');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">FAQ</span>
              </button>
              <button
                onClick={() => {
                  navigate('inquiry');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
              >
                <span className="font-medium">Inquiry</span>
              </button>
                              {isAuthenticated && (
                <>
                  <button
                    onClick={() => {
                      navigate('profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
                  >
                    <span className="font-medium">Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate(`${user.role}-dashboard`);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50"
                  >
                    <span className="font-medium">Dashboard</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      navigate('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600"
                  >
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="space-y-2 px-2 mt-2">
                  <button
                    onClick={() => {
                      navigate('auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    <span>Sign In</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('registration', { type: 'user' });
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold border-2 transition-all flex items-center justify-center gap-2"
                    style={{ 
                      color: config.primary_action, 
                      borderColor: config.primary_action,
                      backgroundColor: '#ffffff'
                    }}
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => {
                      navigate('registration');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: config.primary_action }}
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                    Registration
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
