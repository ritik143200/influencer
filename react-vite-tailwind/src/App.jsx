import { useState, useEffect } from 'react';
import { RouterProvider, useRouter } from './contexts/RouterContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Navbar from './components/Navbar';
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
import InfluencerRegistrationPage from './pages/InfluencerRegistrationPage';
import RegistrationPage from './pages/RegistrationPage';
import InquiryPage from './pages/InquiryPage';
import UserDashboard from './pages/UserDashboard';
import InfluencerDashboard from './pages/InfluencerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { defaultConfig } from './data/mockData';

function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-500 mx-auto mb-4 animate-pulse">
            Indori Influencer
          </div>
          <p className="text-gray-500">Loading...</p>
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

const AppContent = ({ config }) => {
  const { currentPath } = useRouter();

  // Auth pages don't show navbar
  const isAuthPage = currentPath === 'auth' || currentPath === 'influencer-registration' || currentPath === 'registration';

  return (
    <div 
      className="min-h-full w-full overflow-x-hidden overflow-y-auto"
      style={{ 
        backgroundColor: config.background_color,
        fontFamily: `${config.font_family}, sans-serif` 
      }}
    >
      {!isAuthPage && <Navbar config={config} />}
      <NotificationToast />
      {currentPath === 'auth' && <AuthPage />}
      {currentPath === 'registration' && <RegistrationPage config={config} />}
      {currentPath === 'influencer-registration' && <InfluencerRegistrationPage config={config} />}
      {currentPath === 'about' && <AboutPage config={config} />}
      {currentPath === 'about-influencers' && <AboutInfluencersPage config={config} />}
      {currentPath === 'services' && <ServicesPage config={config} />}
      {currentPath === 'services-influencers' && <ServicesInfluencersPage config={config} />}
      {currentPath === 'how-it-works' && <HowItWorksPage config={config} />}
      {currentPath === 'profile' && <ProfilePage config={config} />}
      {currentPath === 'faq' && <FAQPage config={config} />}
      {currentPath === 'inquiry' && <InquiryPage config={config} />}
                  {currentPath === 'home' && <HomePage config={config} />}
      {currentPath === 'user-dashboard' && <UserDashboard config={config} />}
      {currentPath === 'influencer-dashboard' && <InfluencerDashboard config={config} />}
      {currentPath === 'admin-dashboard' && <AdminDashboard config={config} />}
    </div>
  );
};

export default App;
