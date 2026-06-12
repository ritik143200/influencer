import { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import AboutInfluencersPage from './pages/AboutInfluencersPage';
import ServicesPage from './pages/ServicesPage';
import ServicesInfluencersPage from './pages/ServicesInfluencersPage';
import HowItWorksPage from './pages/HowItWorksPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import InfluencerRegistrationPage from './pages/InfluencerRegistrationPage';
import RegistrationPage from './pages/RegistrationPage';
import ExploreInfluencersPage from './pages/ExploreInfluencersPage';
import InquiryPage from './pages/InquiryPage';
import BrandCampaignPage from './pages/BrandCampaignPage';
import UserDashboard from './pages/UserDashboard';
import InfluencerDashboard from './pages/InfluencerDashboard';
import MyCampaignsPage from './pages/MyCampaignsPage';
import MyInquiriesPage from './pages/MyInquiriesPage';
import AdminDashboard from './pages/AdminDashboard';
import TermsAndCondition from './pages/TermsAndCondition';
import PrivacyPolicy from './pages/privetPolice';
import AuthCallback from './pages/AuthCallback';
import InfluencerDetailPage from './pages/InfluencerDetailPage';
import { defaultConfig } from './data/mockData';

const getUserRole = (user) => {
  const role = String(user?.role || user?.profileType || '').trim().toLowerCase();

  if (role === 'admin') return 'admin';
  if (['influencer', 'artist', 'creator'].includes(role)) return 'influencer';
  if (['brand', 'user', 'client', 'customer'].includes(role)) return 'brand';

  return user ? 'brand' : '';
};

const isRoleAllowed = (userRole, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  if (allowedRoles.includes(userRole)) return true;
  if (userRole === 'brand' && allowedRoles.some((role) => role === 'brand' || role === 'user')) return true;
  if (userRole === 'influencer' && allowedRoles.some((role) => role === 'influencer' || role === 'artist')) return true;
  return false;
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const { navigate } = useRouter();
  const userRole = getUserRole(user);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('auth');
      } else if (allowedRoles && !isRoleAllowed(userRole, allowedRoles)) {
        if (userRole === 'admin') navigate('admin-dashboard');
        else if (userRole === 'influencer') navigate('influencer-dashboard');
        else navigate('user-dashboard');
      }
    }
  }, [isAuthenticated, userRole, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles && !isRoleAllowed(userRole, allowedRoles))) {
    return null;
  }

  return children;
};

const AppContent = ({ config }) => {
  const { currentPath } = useRouter();

  const isAuthPage = currentPath === 'auth' || currentPath === 'influencer-registration' || currentPath === 'registration';
  const hideNavbar =
    currentPath === 'home' ||
    currentPath === 'user-dashboard' ||
    currentPath === 'brand-dashboard-preview' ||
    currentPath === 'brand-dashboard-active-preview' ||
    currentPath === 'brand-campaign-create' ||
    currentPath === 'brand-campaign-details' ||
    currentPath === 'influencer-dashboard' ||
    currentPath === 'influencer-dashboard-preview' ||
    currentPath === 'my-campaigns' ||
    currentPath === 'my-inquiries' ||
    currentPath === 'profile' ||
    currentPath === 'profile-preview';
  const hideFooter =
    currentPath === 'inquiry' ||
    currentPath === 'user-dashboard' ||
    currentPath === 'brand-dashboard-preview' ||
    currentPath === 'brand-dashboard-active-preview' ||
    currentPath === 'brand-campaign-create' ||
    currentPath === 'brand-campaign-details' ||
    currentPath === 'influencer-dashboard' ||
    currentPath === 'influencer-dashboard-preview' ||
    currentPath === 'my-campaigns' ||
    currentPath === 'my-inquiries' ||
    currentPath === 'profile' ||
    currentPath === 'profile-preview';

  return (
    <div
      className="min-h-full w-full overflow-x-hidden overflow-y-auto"
      style={{
        backgroundColor: config.background_color,
        fontFamily: `${config.font_family}, sans-serif`
      }}
    >
      {!isAuthPage && !hideNavbar && <Navbar config={config} />}
      <NotificationToast />
      {currentPath === 'auth' && <AuthPage />}
      {currentPath === 'registration' && <RegistrationPage config={config} />}
      {currentPath === 'influencer-registration' && <InfluencerRegistrationPage config={config} />}
      {currentPath === 'about' && <AboutPage config={config} />}
      {currentPath === 'about-influencers' && <AboutInfluencersPage config={config} />}
      {currentPath === 'services' && <ServicesPage config={config} />}
      {currentPath === 'services-influencers' && <ServicesInfluencersPage config={config} />}
      {currentPath === 'how-it-works' && <HowItWorksPage config={config} />}
      {currentPath === 'terms-and-condition' && <TermsAndCondition config={config} />}
      {currentPath === 'privet-policy' && <PrivacyPolicy config={config} />}
      {currentPath === 'profile-preview' && <ProfilePage config={config} previewMode />}
      {currentPath === 'profile' && (
        <ProtectedRoute>
          <ProfilePage config={config} />
        </ProtectedRoute>
      )}
      {currentPath === 'faq' && <FAQPage config={config} />}
      {currentPath === 'contact' && <ContactPage config={config} />}
      {currentPath === 'reset-password' && <AuthPage />}
      {currentPath === 'inquiry' && <InquiryPage config={config} />}
      {currentPath === 'brand-campaign-create' && <BrandCampaignPage mode="create" />}
      {currentPath === 'brand-campaign-details' && <BrandCampaignPage mode="details" />}
      {currentPath === 'explore-influencers' && <ExploreInfluencersPage config={config} />}
      {currentPath === 'influencer-detail' && <InfluencerDetailPage config={config} />}
      {currentPath === 'auth/callback' && <AuthCallback />}
      {currentPath === 'home' && <HomePage config={config} />}
      {currentPath === 'user-dashboard' && (
        <ProtectedRoute allowedRoles={['user', 'brand']}>
          <UserDashboard config={config} />
        </ProtectedRoute>
      )}
      {currentPath === 'brand-dashboard-preview' && <UserDashboard config={config} previewMode="empty" />}
      {currentPath === 'brand-dashboard-active-preview' && <UserDashboard config={config} previewMode="active" />}
      {currentPath === 'influencer-dashboard-preview' && <InfluencerDashboard config={config} previewMode />}
      {currentPath === 'influencer-dashboard' && (
        <ProtectedRoute allowedRoles={['influencer', 'artist']}>
          <InfluencerDashboard config={config} />
        </ProtectedRoute>
      )}
      {currentPath === 'my-campaigns' && (
        <ProtectedRoute allowedRoles={['influencer', 'artist']}>
          <MyCampaignsPage config={config} />
        </ProtectedRoute>
      )}
      {currentPath === 'my-inquiries' && (
        <ProtectedRoute allowedRoles={['user', 'brand']}>
          <MyInquiriesPage config={config} />
        </ProtectedRoute>
      )}
      {currentPath === 'admin-dashboard' && (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard config={config} />
        </ProtectedRoute>
      )}
      {!isAuthPage && !hideFooter && <Footer config={config} />}
    </div>
  );
};

function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050816]">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-500 mx-auto mb-4 animate-pulse">ViralMantrix</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider>
          <AppContent config={config} />
        </RouterProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
