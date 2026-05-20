import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Sparkles, X } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentPath, navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryNav = useMemo(() => ([
    { label: 'Home', action: () => navigate('home') },
    { label: 'Ecosystem', action: () => navigate('home', { scroll: 'ecosystem' }) },
    { label: 'Categories', action: () => navigate('home', { scroll: 'categories' }) },
    { label: 'Contact', action: () => navigate('contact') }
  ]), [navigate]);

  const dashboardRoute = user?.role === 'admin'
    ? 'admin-dashboard'
    : (user?.role === 'artist' || user?.role === 'influencer' ? 'influencer-dashboard' : 'user-dashboard');

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'border-b border-white/10 bg-[#050816]/78 backdrop-blur-2xl shadow-[0_12px_50px_rgba(5,8,22,0.45)]' : 'bg-transparent'
      }`}
    >
      <div className="section-shell">
        <div className="flex h-20 items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_14px_35px_rgba(139,92,246,0.32)]">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.28em] text-white">ViralMantrix</div>
              <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">Creator ecosystem OS</div>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 lg:flex">
            {primaryNav.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  (item.label === 'Home' && currentPath === 'home')
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/8 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              onClick={() => navigate('inquiry')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              Launch Brief
            </button>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(dashboardRoute)}
                  className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_40px_rgba(139,92,246,0.28)] transition hover:brightness-110"
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('home');
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('auth')}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('registration')}
                  className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_40px_rgba(139,92,246,0.28)] transition hover:brightness-110"
                >
                  Join now
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" strokeWidth={2} /> : <Menu className="h-5 w-5" strokeWidth={2} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="glass-panel mb-4 rounded-[1.8rem] p-4 lg:hidden">
            <div className="space-y-2">
              {primaryNav.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    item.action();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/85"
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  navigate('inquiry');
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/85"
              >
                Launch Brief
              </button>

              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(dashboardRoute);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3 text-left text-sm font-bold text-white"
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('home');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/75"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm font-semibold text-white/85"
                  >
                    Sign in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigate('registration');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3 text-left text-sm font-bold text-white"
                  >
                    Join now
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
