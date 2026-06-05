import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  UserRound,
  Wallet,
  XCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';
import { calculateProfileCompletion } from '../utils/profileCompletion';

const previewUser = {
  fullName: '',
  username: '',
  category: 'Influencer',
  location: '',
  profileImage: '',
  budgetMax: 0
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('userData') || localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const creatorName = (user) =>
  user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '';

const creatorHandle = (user) =>
  user?.username || String(creatorName(user) || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) || 'creator';

const creatorInitial = (user) => (creatorName(user) ? creatorName(user).slice(0, 1).toUpperCase() : 'VM');

const creatorCategory = (user) => {
  if (user?.category) return user.category;
  if (Array.isArray(user?.microCategories) && user.microCategories[0]) return user.microCategories[0];
  if (Array.isArray(user?.niche) && user.niche[0]) return user.niche[0];
  return 'Influencer';
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (!amount) return '0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const normalizeInquiries = (payload) => {
  const source = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return source
    .filter(Boolean)
    .map((item) => ({
      ...item,
      _id: item._id || item.id || `${item.campaignName || item.name}-${item.createdAt || Date.now()}`,
      campaignName: item.campaignName || item.campaign || item.name || 'Campaign',
      brandName: item.userId?.name || item.brandName || item.name || 'Brand',
      category: item.category || item.hiringFor || 'Campaign',
      requirements: item.requirements || item.description || '',
      status: item.artistStatus || item.acceptanceStatus || item.status || 'forwarded'
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
      active ? 'bg-[#FFFFFF] text-[#DF7AFE] shadow-[0_14px_34px_rgba(20,16,32,0.36)]' : 'text-white/78 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon className="h-4 w-4" strokeWidth={2.1} />
    <span className="flex-1">{label}</span>
    {badge ? <span className="rounded-full bg-white/18 px-2 py-0.5 text-[0.68rem] text-white">{badge}</span> : null}
  </button>
);

const ProgressRing = ({ value }) => (
  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-[conic-gradient(#DF7AFE_var(--score),#171321_0)]" style={{ '--score': `${value}%` }}>
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#000000] text-2xl font-semibold text-[#FFFFFF]">
      {value}%
    </div>
  </div>
);

const DashboardMetric = ({ icon: Icon, label, value, action, onClick }) => (
  <div className="flex min-h-[150px] flex-col justify-between border-[#171321] px-6 py-5 md:border-l first:border-l-0">
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#FFFFFF]">{label}</div>
        <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#FFFFFF]">{value}</div>
      </div>
    </div>
    {action && (
      <button
        type="button"
        onClick={onClick}
        className="mt-4 w-fit rounded-xl border border-[#3E2A55] px-4 py-2 text-xs font-semibold text-[#DF7AFE]"
      >
        {action}
      </button>
    )}
  </div>
);

const onboardingSteps = [
  'Complete profile',
  'Receive inquiries',
  'Collaborate with brands'
];

const JellyMascotPanel = () => (
  <div className="relative min-h-[260px] overflow-hidden rounded-[28px] border border-[#3E2A55] bg-[#000000] px-5 py-6 shadow-[0_24px_70px_rgba(6,6,6,0.42)] md:min-h-[300px]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_54%,rgba(223,122,254,0.20),transparent_42%),radial-gradient(circle_at_62%_44%,rgba(0,153,255,0.12),transparent_34%)]" />
    <div className="relative z-10 grid items-center gap-5 md:grid-cols-[1fr_1.2fr]">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#DF7AFE]">Creator Flow</div>
        <h2 className="mt-3 max-w-md text-3xl font-semibold leading-none tracking-[-0.04em] text-[#FFFFFF] md:text-5xl">
          Grow your creator profile.
        </h2>
        <div className="mt-6 grid gap-3">
          {onboardingSteps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-2xl border border-[#3E2A55] bg-[#0D0D0D]/80 px-4 py-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#171321] text-xs font-semibold text-[#DF7AFE]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-sm font-semibold text-[#FFFFFF]">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mx-auto flex h-[220px] w-full max-w-[360px] items-center justify-center md:h-[300px]">
        <img
          src="/creator-aura-mascot.svg"
          alt="Creator mascot"
          className="h-full w-full object-contain drop-shadow-[0_30px_65px_rgba(223,122,254,0.28)]"
        />
      </div>
    </div>
  </div>
);

const InfluencerDashboard = ({ previewMode = false }) => {
  const { logout } = useAuth();
  const { navigate } = useRouter();
  const [creator, setCreator] = useState(() => (previewMode ? previewUser : getStoredUser()));
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(!previewMode);
  const [respondingId, setRespondingId] = useState('');

  useEffect(() => {
    if (previewMode) return;

    const fetchDashboard = async () => {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const [profileResponse, inquiriesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/influencer/me`, { headers }),
          fetch(`${API_BASE_URL}/api/influencer/inquiries`, { headers })
        ]);

        if (profileResponse.ok) {
          const profilePayload = await profileResponse.json();
          if (profilePayload?.data) setCreator((current) => ({ ...(current || {}), ...profilePayload.data }));
        }

        if (inquiriesResponse.ok) {
          const inquiryPayload = await inquiriesResponse.json();
          setInquiries(normalizeInquiries(inquiryPayload));
        } else {
          setInquiries([]);
        }
      } catch {
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [previewMode]);

  const score = calculateProfileCompletion(creator || {});
  const pendingInquiries = inquiries.filter((item) => {
    const status = String(item.status || '').toLowerCase();
    return !status.includes('accepted') && !status.includes('rejected') && !status.includes('completed');
  });
  const acceptedInquiries = inquiries.filter((item) => String(item.status || '').toLowerCase().includes('accepted'));
  const balance = useMemo(
    () => acceptedInquiries.reduce((sum, item) => sum + Number(item.budget || 0), 0) || Number(creator?.budgetMax || creator?.budget || 0),
    [acceptedInquiries, creator?.budget, creator?.budgetMax]
  );

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  const handleInquiryResponse = async (inquiryId, action) => {
    setRespondingId(inquiryId);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`${API_BASE_URL}/api/influencer/inquiries/${inquiryId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' })
      });

      if (response.ok) {
        const nextStatus = action === 'accept' ? 'artist_accepted' : 'artist_rejected';
        setInquiries((current) => current.map((item) => (item._id === inquiryId ? { ...item, status: nextStatus } : item)));
      }
    } finally {
      setRespondingId('');
    }
  };

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="grid min-h-screen lg:grid-cols-[210px_1fr]">
        <aside className="hidden bg-[linear-gradient(180deg,#000000_0%,#171321_55%,#3E2A55_100%)] px-4 py-6 text-white lg:flex lg:flex-col">
          <button type="button" onClick={() => navigate('home')} className="mb-7 px-2 text-left text-2xl font-semibold">
            ViralMantrix
          </button>

          <div className="mb-7 flex flex-col items-center rounded-[24px] bg-white/10 px-4 py-5 text-center">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/35 bg-white/16">
              {creator?.profileImage || creator?.profilePicture ? (
                <img src={creator.profileImage || creator.profilePicture} alt={creatorName(creator)} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold">{creatorInitial(creator)}</div>
              )}
            </div>
            <div className="mt-3 max-w-full truncate text-sm font-semibold">{creatorHandle(creator)}</div>
            <div className="text-xs text-white/70">{creatorCategory(creator)}</div>
          </div>

          <nav className="space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active onClick={() => navigate('influencer-dashboard')} />
            <SidebarItem icon={UserRound} label="Profile" onClick={() => navigate('profile')} />
            <SidebarItem icon={Inbox} label="Inbox" badge={pendingInquiries.length || null} />
            <SidebarItem icon={Send} label="My Campaigns" onClick={() => navigate('my-campaigns')} />
            <SidebarItem icon={Wallet} label="Earnings" />
            <SidebarItem icon={CreditCard} label="Payments" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>

          <button type="button" onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Logout
          </button>
        </aside>

        <section className="min-w-0 px-5 py-5 lg:px-8">
          <header className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[clamp(1.9rem,3vw,3rem)] font-semibold leading-none tracking-[-0.05em]">
                {previewMode ? 'Welcome back' : `Welcome back, ${creatorName(creator).split(' ')[0] || 'Creator'}`}
              </h1>
              <p className="mt-2 text-sm font-medium text-[#A98BC8]">Your influencer workspace.</p>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={handleLogout} className="flex h-11 items-center gap-2 rounded-xl border border-rose-500/20 bg-[#0D0D0D] px-4 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 shadow-sm transition-all" title="Logout">
                <LogOut className="h-4 w-4" strokeWidth={2.2} />
                <span>Logout</span>
              </button>
              <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0D0D0D] text-[#DF7AFE] shadow-sm">
                <Bell className="h-5 w-5" strokeWidth={2} />
              </button>
              <button type="button" onClick={() => navigate('profile')} className="flex items-center gap-3 rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] px-4 py-2 shadow-sm">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-[#171321]">
                  {creator?.profileImage || creator?.profilePicture ? (
                    <img src={creator.profileImage || creator.profilePicture} alt={creatorName(creator)} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#DF7AFE]">
                      {creatorInitial(creator)}
                    </div>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="max-w-[120px] truncate text-sm font-semibold text-[#FFFFFF]">{creatorHandle(creator)}</div>
                  <div className="text-xs text-[#A98BC8]">{creatorCategory(creator)}</div>
                </div>
              </button>
            </div>
          </header>

          <JellyMascotPanel />

          <section className="mt-5 rounded-[28px] border border-[#3E2A55] bg-[#0D0D0D] shadow-[0_24px_70px_rgba(6,6,6,0.42)]">
            <div className="grid md:grid-cols-3">
              <div className="flex min-h-[170px] items-center gap-6 px-6 py-6">
                <ProgressRing value={score} />
                <div>
                  <div className="text-sm font-semibold">Profile Completion</div>
                  <button type="button" onClick={() => navigate('profile')} className="mt-4 rounded-xl border border-[#3E2A55] px-4 py-2 text-xs font-semibold text-[#DF7AFE]">
                    View Profile
                  </button>
                </div>
              </div>
              <DashboardMetric icon={Inbox} label="Inquiry Received" value={loading ? '...' : inquiries.length} action="View Inquiries" />
              <DashboardMetric icon={BriefcaseBusiness} label="Total Balance" value={formatMoney(balance)} action="View Earnings" />
            </div>
            <div className="border-t border-[#171321] px-6 py-4 text-center">
              <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                View All Activity
              </button>
            </div>
          </section>

          {pendingInquiries.length > 0 && (
            <section className="mt-5 rounded-[28px] border border-[#3E2A55] bg-[#0D0D0D] p-5 shadow-[0_24px_70px_rgba(6,6,6,0.42)]">
              <h2 className="text-2xl font-semibold tracking-[-0.04em]">Campaign Invites</h2>
              <div className="mt-4 space-y-4">
                {pendingInquiries.map((inquiry) => (
                  <article key={inquiry._id} className="rounded-[24px] border border-[#171321] bg-[#0D0D0D] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-xl font-semibold">{inquiry.campaignName}</div>
                        <div className="mt-2 text-sm text-[#A98BC8]">{inquiry.brandName}</div>
                      </div>
                      <div className="text-lg font-semibold">{formatMoney(inquiry.budget)}</div>
                    </div>
                    {inquiry.requirements && <p className="mt-4 text-sm leading-6 text-[#A98BC8]">{inquiry.requirements}</p>}
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={respondingId === inquiry._id}
                        onClick={() => handleInquiryResponse(inquiry._id, 'accept')}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#DF7AFE] px-5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={respondingId === inquiry._id}
                        onClick={() => handleInquiryResponse(inquiry._id, 'reject')}
                        className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#3E2A55] bg-[#000000] px-5 text-sm font-semibold text-[#A98BC8] disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" strokeWidth={2.2} />
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
};

export default InfluencerDashboard;
