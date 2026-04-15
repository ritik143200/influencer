import React, { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';
import AuthInput from '../components/AuthInput';
import AuthButton from '../components/AuthButton';

const AuthPage = ({ initialTab, embedded = false }) => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(initialTab !== 'register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab === 'register' ? 'register' : 'login');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { navigate, params, currentPath } = useRouter();

  useEffect(() => {
    if (currentPath === 'reset-password') {
      setIsResetPassword(true);
      setIsLogin(false);
      setResetToken(params.token || '');
    }
  }, [currentPath, params]);

  useEffect(() => {
    if (initialTab === 'register') {
      toggleMode('register');
    } else {
      toggleMode('login');
    }
  }, [initialTab]);

  // Track mouse position for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Pre-fill from pendingInquiry if it exists
  useEffect(() => {
    if (!isLogin && !isForgotPassword) {
      const pending = localStorage.getItem('pendingInquiry');
      if (pending) {
        try {
          const data = JSON.parse(pending);
          setFormData(prev => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone
          }));
        } catch (e) {
          console.error('Error parsing pendingInquiry', e);
        }
      }
    }
  }, [isLogin, isForgotPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isResetPassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (isForgotPassword) {
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const endpoint = isResetPassword ? 'reset-password' : (isForgotPassword ? 'forgot-password' : (isLogin ? 'login' : 'register'));
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
      
      const payload = isResetPassword ? {
        token: resetToken,
        password: formData.password
      } : (isForgotPassword ? {
        email: formData.email
      } : (isLogin ? {
        email: formData.email,
        password: formData.password
      } : {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      }));

      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Success!' });

        if (isForgotPassword) return;
        
        if (isResetPassword) {
          setTimeout(() => {
            setIsResetPassword(false);
            setIsLogin(true);
            toggleMode('login');
          }, 2000);
          return;
        }

        // Save user data to localStorage and auth context
        if (data.token) {
          localStorage.setItem('userToken', data.token);
          const userData = { ...data };
          delete userData.message; 

          login(userData);
          localStorage.setItem('userData', JSON.stringify(userData));

          // Auto-submit pending inquiry if it exists
          let hadPendingInquiry = false;
          const pending = localStorage.getItem('pendingInquiry');
          if (pending) {
            hadPendingInquiry = true;
            try {
              const inquiryData = JSON.parse(pending);
              console.log('Auto-submitting pending inquiry:', inquiryData);
              
              const inquiryResponse = await fetch(`${API_BASE_URL}/api/inquiries`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${data.token}`
                },
                body: JSON.stringify({
                  ...inquiryData,
                  budget: Number(inquiryData.budget)
                })
              });

              const inquiryResult = await inquiryResponse.json();
              
              if (inquiryResponse.ok && inquiryResult.success) {
                console.log('Inquiry auto-submitted successfully:', inquiryResult.data._id);
              } else {
                console.error('Failed to auto-submit inquiry:', inquiryResult.message);
              }
            } catch (err) {
              console.error('Error during inquiry auto-submit:', err);
            } finally {
              localStorage.removeItem('pendingInquiry');
            }
          }

          // Redirect based on user role - with proper timing for inquiry submission
          const redirectDelay = hadPendingInquiry ? 1500 : 1200; // Longer delay if inquiry was auto-submitted
          setTimeout(() => {
            if (data.role === 'admin') {
              navigate('admin-dashboard');
            } else if (data.role === 'artist' || data.role === 'influencer') {
              navigate('influencer-dashboard');
            } else {
              navigate('user-dashboard');
            }
          }, redirectDelay);
        } else {
          setMessage({ type: 'error', text: data.message || 'Action failed' });
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Error occurred' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setIsForgotPassword(mode === 'forgot-password');
    setIsLogin(mode === 'login' || mode === 'forgot-password');
    setActiveTab(mode === 'forgot-password' ? 'login' : mode);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setMessage({ type: '', text: '' });
  };

  const handleGoogleLogin = () => {
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className={embedded ? 'py-10 sm:py-14' : 'min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 relative overflow-hidden'}>
      {!embedded && (
        <>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-brand-200 to-brand-300 opacity-20 blur-3xl"
              style={{
                left: `${mousePosition.x * 0.05}px`,
                top: `${mousePosition.y * 0.05}px`,
                transition: 'all 0.3s ease-out'
              }}
            />
            <div
              className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-orange-200 to-orange-300 opacity-20 blur-3xl"
              style={{
                right: `${-mousePosition.x * 0.03}px`,
                bottom: `${-mousePosition.y * 0.03}px`,
                transition: 'all 0.3s ease-out'
              }}
            />
            <div className="absolute top-20 left-20 w-32 h-32 bg-brand-200 rounded-full opacity-10 animate-pulse" />
            <div className="absolute bottom-20 right-20 w-48 h-48 bg-orange-200 rounded-full opacity-10 animate-pulse" />
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-brand-300 rounded-full opacity-10 animate-pulse" />
          </div>
        </>
      )}

      {/* Main Content */}
      <div className={embedded ? 'relative z-10 flex items-start justify-center px-4' : 'relative z-10 min-h-screen flex items-center justify-center px-4'}>
        <div className="w-full max-w-6xl flex items-center justify-center">
          {/* Left Side - Brand Content */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center text-center p-12">
            <div className="mb-6 max-w-lg">
              <div className="mb-6">
                <h1 className="text-4xl font-medium text-brand-500 mb-4 tracking-tight drop-shadow-sm">Indori Influencer</h1>
                <h2 className="text-2xl text-gray-800 font-medium leading-tight">
                  Hire the <span className="bg-gradient-to-r from-brand-500 to-orange-500 bg-clip-text text-transparent">Crème de la Crème</span> of Indore's Talent
                </h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-4">
                Direct access to the city's most influential creators and storytellers
              </p>
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur rounded-full border border-white/40 shadow-sm mb-8 scale-105 transition-transform hover:scale-110">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-6 h-6 rounded-full bg-brand-100 border-2 border-white" />)}
                </div>
                <span className="text-sm font-medium text-gray-800">★ 4.9/5 Rating by 100+ Brands</span>
              </div>
            </div>

            <div className="w-full max-w-md bg-white/40 backdrop-blur-md rounded-[32px] p-8 border border-white/60 shadow-xl space-y-8">
              {[
                { title: 'Find Amazing Influencers', subtitle: 'Discover talented creators for your brand', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
                { title: 'Verified Professionals', subtitle: 'All influencers are verified and reviewed', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                { title: 'Easy Booking', subtitle: 'Simple and secure booking process', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4 group cursor-default">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-gray-900 leading-none mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full lg:w-1/2 max-w-2xl">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20">
              {!embedded && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => navigate('home')}
                    className="mb-6 flex items-center text-gray-600 hover:text-brand-500 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                  </button>
                </>
              )}



              {/* Form Title */}
              <h2 className="text-3xl font-medium text-gray-800 mb-2">
                {isResetPassword ? 'Reset Password' : (isForgotPassword ? 'Forgot Password' : (isLogin ? 'Welcome Back!' : ''))}
              </h2>
              <p className="text-gray-600 mb-8">
                {isResetPassword
                  ? 'Enter your new password below'
                  : (isForgotPassword
                    ? 'Enter your email to receive a password reset link'
                    : (isLogin
                      ? 'Sign in to manage your influencer profile'
                      : 'Find the right influencers, run campaigns, and grow your brand.'
                    )
                  )
                }
              </p>

              {/* Message Display */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.text.includes('success') || message.type === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                  {message.text}
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && !isForgotPassword && (
                  <div>
                    <AuthInput
                      label="Full Name/Brand Name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      placeholder="Enter your full name/Brand name"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                    />
                  </div>
                )}

                {!isLogin && !isForgotPassword && (
                  <div>
                    <AuthInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="Enter your phone number"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      }
                    />
                  </div>
                )}


                {!isResetPassword && (
                  <div>
                    <AuthInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      placeholder="your.email@example.com"
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                    />
                  </div>
                )}

                {(!isForgotPassword || isResetPassword) && (
                  <div>
                    <AuthInput
                      label={isResetPassword ? "New Password" : "Password"}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder={isResetPassword ? "Enter new password" : "Enter your password"}
                      showPasswordToggle={true}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      }
                    />
                  </div>
                )}

                {(!isLogin || isResetPassword) && !isForgotPassword && (
                  <div>
                    <AuthInput
                      label={isResetPassword ? "Confirm New Password" : "Confirm Password"}
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      placeholder={isResetPassword ? "Re-enter new password" : "Confirm your password"}
                      showPasswordToggle={true}
                      onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                      icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      }
                    />
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 font-medium text-lg text-white rounded-[20px] transition-all duration-300 shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2
                    ${isLogin || isForgotPassword || isResetPassword 
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 hover:shadow-brand-500/30 hover:scale-[1.02]' 
                      : 'bg-[#e65c00] hover:bg-[#d45500] hover:-translate-y-1 hover:scale-[1.01]'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isLoading && (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {isResetPassword ? 'Reset Password' : (isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Register as a Brand →'))}
                </button>

                {!isLogin && !isForgotPassword && (
                  <div className="text-center mt-6">
                    <p className="text-gray-500 font-medium">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          if (embedded) {
                            toggleMode('login');
                          } else {
                            navigate('auth');
                          }
                        }}
                        className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                )}

                {isLogin && !isResetPassword && (
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      {isForgotPassword ? (
                        <button
                          type="button"
                          onClick={() => toggleMode('login')}
                          className="text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
                        >
                          Back to Sign In
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleMode('forgot-password')}
                          className="ml-auto text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    
                    {!isForgotPassword && (
                      <div className="text-center pt-2">
                        <p className="text-gray-500 font-medium whitespace-nowrap">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              if (embedded) {
                                toggleMode('register');
                              } else {
                                navigate('registration');
                              }
                            }}
                            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                          >
                            Sign Up
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Divider */}
                {!isForgotPassword && (
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>
                )}

                {/* Social Login Buttons */}
                {!isForgotPassword && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
