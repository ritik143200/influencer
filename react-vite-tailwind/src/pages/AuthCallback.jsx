import React, { useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback = () => {
  const { navigate } = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = async () => {
      try {
        console.log('🔵 Auth Callback - Starting OAuth callback handling...');
        const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');
        
        console.log('🔵 Fetching user from session:', `${API_BASE_URL}/api/auth/google/user`);
        
        // Get user data from session (passport session)
        const response = await fetch(`${API_BASE_URL}/api/auth/google/user`, {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔵 Session response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('🔵 User session data:', data);
          
          if (data.success && data.user) {
            console.log('🔵 User found in session, fetching token...');
            // Get JWT token for the user
            const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/google/success`, {
              credentials: 'include',
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            
            console.log('🔵 Token response status:', tokenResponse.status);
            
            if (tokenResponse.ok) {
              const tokenData = await tokenResponse.json();
              console.log('🔵 Token data received:', tokenData);
              
              if (tokenData.success) {
                // Store token and login user
                localStorage.setItem('userToken', tokenData.token);
                login(tokenData.user);
                console.log('🟢 OAuth successful, user role:', tokenData.user.role);
                
                // Redirect based on user role
                if (tokenData.user.role === 'admin') {
                  console.log('🟢 Redirecting to admin-dashboard');
                  navigate('admin-dashboard');
                } else if (tokenData.user.role === 'influencer' || tokenData.user.role === 'artist') {
                  console.log('🟢 Redirecting to influencer-dashboard');
                  navigate('influencer-dashboard');
                } else {
                  console.log('🟢 Redirecting to user-dashboard');
                  navigate('user-dashboard');
                }
              } else {
                console.error('❌ Token generation failed');
                navigate('auth');
              }
            } else {
              console.error('❌ Token generation failed, status:', tokenResponse.status);
              navigate('auth');
            }
          } else {
            console.error('❌ No user data in session');
            navigate('auth');
          }
        } else {
          console.error('❌ Session fetch failed, status:', response.status);
          navigate('auth');
        }
      } catch (error) {
        console.error('❌ Callback error:', error);
        navigate('auth');
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up your account...</p>
        <p className="text-sm text-gray-500 mt-2">Creating your profile with Google</p>
      </div>
    </div>
  );
};

export default AuthCallback;