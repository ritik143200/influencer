import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath, navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userRole = user?.role || user?.profileType || '';
  const dashboardRoute =
    userRole === 'admin'
      ? 'admin-dashboard'
      : userRole === 'artist' || userRole === 'influencer'
        ? 'influencer-dashboard'
        : 'user-dashboard';

  const homeNavItems = useMemo(
    () => [
      { label: 'Home', action: () => navigate('home') },
      { label: 'Service', action: () => navigate('services') },
      { label: 'Hire Influencer', action: () => navigate('inquiry'), pill: true },
      { label: 'Login', action: () => navigate('inquiry') }
    ],
    [navigate]
  );

  const prototypeNavItems = useMemo(
    () => [
      { label: 'Home', action: () => navigate('home') },
      { label: 'Services', action: () => navigate('services') },
      { label: 'Hire Influencer', action: () => navigate('inquiry') }
    ],
    [navigate]
  );

  const defaultNavItems = useMemo(
    () => [
      { label: 'Home', action: () => navigate('home') },
      { label: 'Service', action: () => navigate('services') },
      { label: 'Hire Influencer', action: () => navigate('inquiry') }
    ],
    [navigate]
  );

  const isHomeRoute = currentPath === 'home';
  const isPrototypeBrandRoute =
    currentPath === 'inquiry' ||
    currentPath === 'user-dashboard' ||
    currentPath === 'brand-dashboard-preview' ||
    currentPath === 'brand-dashboard-active-preview';

  if (isHomeRoute) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 bg-[linear-gradient(90deg,#6d30d9_0%,#7d45e1_34%,#9c60ef_68%,#b57cf7_100%)] shadow-[0_14px_40px_rgba(90,35,176,0.18)]">
        <div className="hidden border-y border-white/50 lg:grid lg:grid-cols-[360px,1fr,1fr,1.2fr,140px]">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center border-r border-white/16 px-7 text-left text-[0.95rem] font-semibold text-white"
          >
            Viral mantra X
          </button>

          {homeNavItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex h-[78px] items-center justify-center ${
                index < homeNavItems.length - 1 ? 'border-r border-white/16' : ''
              }`}
            >
              <button
                type="button"
                onClick={item.action}
                className={
                  item.pill
                    ? 'rounded-full bg-[#f5ecff] px-8 py-3 text-sm font-semibold text-[#DF7AFE] shadow-[0_12px_28px_rgba(255,255,255,0.12)]'
                    : 'text-sm font-semibold text-white'
                }
              >
                {item.label}
              </button>
            </div>
          ))}
        </div>

        <div className="flex h-16 items-center justify-between px-5 lg:hidden">
          <button type="button" onClick={() => navigate('home')} className="text-left text-base font-semibold text-white">
            Viral mantra X
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/16 bg-[rgba(108,49,216,0.98)] p-4 lg:hidden">
            <div className="space-y-2">
              {homeNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                    item.pill ? 'bg-white text-[#DF7AFE]' : 'text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }

  if (isPrototypeBrandRoute) {
    return (
      <nav className="fixed left-0 right-0 top-0 z-50 border-t-2 border-[#DF7AFE] border-b border-[#171321] bg-[#000000]/96 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
          <button type="button" onClick={() => navigate('home')} className="text-left text-[1.7rem] font-semibold leading-none tracking-[-0.04em]">
            <span className="text-[#FFFFFF]">Viral</span>
            <span className="text-[#DF7AFE]">Mantrix</span>
          </button>

          <div className="hidden items-center gap-10 lg:flex">
            {prototypeNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`relative text-sm font-semibold transition ${
                  (item.label === 'Home' && currentPath === 'user-dashboard') ||
                  (item.label === 'Home' && currentPath === 'home') ||
                  (item.label === 'Services' && currentPath === 'services') ||
                  (item.label === 'Hire Influencer' && currentPath === 'inquiry')
                    ? 'text-[#FFFFFF]'
                    : 'text-[#FFFFFF]/68 hover:text-[#FFFFFF]'
                }`}
              >
                {item.label}
                {((item.label === 'Home' && currentPath === 'user-dashboard') ||
                  (item.label === 'Services' && currentPath === 'services') ||
                  (item.label === 'Hire Influencer' && currentPath === 'inquiry')) && (
                  <span className="absolute -bottom-[22px] left-1/2 h-[2px] w-10 -translate-x-1/2 rounded-full bg-[#DF7AFE]" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) navigate(dashboardRoute);
                else navigate('inquiry');
              }}
              className="inline-flex items-center gap-3 rounded-full border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(223,122,254,0.10)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171321] text-[11px] font-semibold text-[#DF7AFE]">
                {(user?.name || user?.email || 'Brand')[0]?.toUpperCase()}
              </span>
              Brand Account
              <ChevronDown className="h-4 w-4 text-[#FFFFFF]/70" strokeWidth={2} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3E2A55] bg-[#0D0D0D] text-[#FFFFFF] lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#171321] bg-[#000000] p-4 lg:hidden">
            <div className="space-y-2">
              {prototypeNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF] hover:bg-[#0D0D0D]"
                >
                  {item.label}
                </button>
              ))}
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF]"
                >
                  Log out
                </button>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/82 shadow-[0_16px_45px_rgba(123,79,210,0.08)] backdrop-blur-xl' : 'bg-white/60 backdrop-blur'
      }`}
    >
      <div className="section-shell">
        <div className="flex h-20 items-center justify-between gap-4">
          <button type="button" onClick={() => navigate('home')} className="text-left">
            <div className="text-left text-sm font-semibold uppercase tracking-[0.34em] text-[#DF7AFE]">ViralMantrix</div>
          </button>

          <div className="hidden items-center gap-2 rounded-full bg-white/75 px-3 py-2 shadow-sm lg:flex">
            {defaultNavItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  (item.label === 'Home' && currentPath === 'home') ||
                  (item.label === 'Service' && currentPath === 'services') ||
                  (item.label === 'Hire Influencer' && currentPath === 'inquiry')
                    ? 'bg-[#DF7AFE] text-white'
                    : 'text-slate-600 hover:text-[#DF7AFE]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(dashboardRoute)}
                  className="rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="rounded-full border border-white/70 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-600"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate('registration')}
                className="rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-slate-700"
              >
                Sign Up
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mb-4 rounded-[1.6rem] border border-white/80 bg-white/92 p-4 shadow-[0_16px_45px_rgba(123,79,210,0.08)] backdrop-blur lg:hidden">
            <div className="space-y-2">
              {defaultNavItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-[#f6efff]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
