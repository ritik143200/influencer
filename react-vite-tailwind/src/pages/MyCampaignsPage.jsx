import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Inbox,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Send,
  Settings,
  UserRound,
  Wallet,
  XCircle,
  Clock,
  X,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';

/* ─── Constants ──────────────────────────────────────────── */
const PAGE_SIZE = 8;

const STATUS_CONFIG = {
  forwarded: { label: 'Pending', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  artist_accepted: { label: 'Accepted', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  artist_rejected: { label: 'Declined', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  completed: { label: 'Completed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  sent: { label: 'Submitted', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  admin_accepted: { label: 'Under Review', color: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
  admin_rejected: { label: 'Rejected', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
};

const ALL_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'forwarded', label: 'Pending' },
  { value: 'artist_accepted', label: 'Accepted' },
  { value: 'artist_rejected', label: 'Declined' },
  { value: 'completed', label: 'Completed' },
];

/* ─── Helpers ────────────────────────────────────────────── */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('userData') || localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const creatorName = (user) =>
  user?.fullName || user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '';

const creatorHandle = (user) =>
  user?.username ||
  String(creatorName(user) || 'creator').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14) ||
  'creator';

const creatorInitial = (user) =>
  creatorName(user) ? creatorName(user).slice(0, 1).toUpperCase() : 'VM';

const creatorCategory = (user) => {
  if (user?.category) return user.category;
  if (Array.isArray(user?.microCategories) && user.microCategories[0]) return user.microCategories[0];
  return 'Influencer';
};

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const normalizeInquiries = (payload) => {
  const source = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return source
    .filter(Boolean)
    .map((item) => ({
      ...item,
      _id: item._id || item.id || `${item.campaignName}-${item.createdAt}`,
      campaignName: item.campaignName || item.campaign || item.name || 'Campaign',
      brandName: item.userId?.name || item.brandName || item.name || 'Brand',
      brandEmail: item.userId?.email || item.email || '',
      category: item.category || item.hiringFor || 'Campaign',
      requirements: item.requirements || item.description || '',
      status: item.artistStatus || item.acceptanceStatus || item.status || 'forwarded',
      budget: item.budget || 0,
      location: item.location || '',
      eventDate: item.eventDate || null,
      createdAt: item.createdAt || null,
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/* ─── Sidebar Item ───────────────────────────────────────── */
const SidebarItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
      active
        ? 'bg-[#FFFFFF] text-[#DF7AFE] shadow-[0_14px_34px_rgba(20,16,32,0.36)]'
        : 'text-white/78 hover:bg-white/10 hover:text-white'
    }`}
  >
    <Icon className="h-4 w-4" strokeWidth={2.1} />
    <span className="flex-1">{label}</span>
    {badge ? <span className="rounded-full bg-white/18 px-2 py-0.5 text-[0.68rem] text-white">{badge}</span> : null}
  </button>
);

/* ─── Status Badge ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.forwarded;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

/* ─── Campaign Card ──────────────────────────────────────── */
const CampaignCard = ({ inquiry, onRespond, respondingId }) => {
  const isPending = inquiry.status === 'forwarded';
  const isResponding = respondingId === inquiry._id;

  return (
    <article className="rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D] p-5 transition hover:border-[#DF7AFE]/40 hover:shadow-[0_8px_32px_rgba(223,122,254,0.08)]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[#FFFFFF]">{inquiry.campaignName}</h3>
            <StatusBadge status={inquiry.status} />
          </div>
          <div className="mt-1 text-xs text-[#A98BC8]">by {inquiry.brandName}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-[#DF7AFE]">{formatMoney(inquiry.budget)}</div>
          <div className="mt-0.5 text-[0.68rem] text-[#A98BC8]">Budget</div>
        </div>
      </div>

      {/* Details Row */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {inquiry.category && (
          <span className="flex items-center gap-1.5 text-xs text-[#A98BC8]">
            <Tag className="h-3 w-3" strokeWidth={2} />
            {inquiry.category}
          </span>
        )}
        {inquiry.location && (
          <span className="flex items-center gap-1.5 text-xs text-[#A98BC8]">
            <MapPin className="h-3 w-3" strokeWidth={2} />
            {inquiry.location}
          </span>
        )}
        {inquiry.eventDate && (
          <span className="flex items-center gap-1.5 text-xs text-[#A98BC8]">
            <Calendar className="h-3 w-3" strokeWidth={2} />
            {formatDate(inquiry.eventDate)}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-xs text-[#A98BC8]">
          <Clock className="h-3 w-3" strokeWidth={2} />
          Received {formatDate(inquiry.createdAt)}
        </span>
      </div>

      {/* Requirements */}
      {inquiry.requirements && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#A98BC8]">{inquiry.requirements}</p>
      )}

      {/* Action Buttons (only for pending) */}
      {isPending && (
        <div className="mt-4 flex flex-wrap gap-2.5 border-t border-[#171321] pt-4">
          <button
            type="button"
            disabled={isResponding}
            onClick={() => onRespond(inquiry._id, 'accept')}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#DF7AFE] px-4 text-xs font-semibold text-white transition hover:bg-[#c958e8] disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />
            {isResponding ? 'Processing…' : 'Accept'}
          </button>
          <button
            type="button"
            disabled={isResponding}
            onClick={() => onRespond(inquiry._id, 'reject')}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#3E2A55] bg-[#000000] px-4 text-xs font-semibold text-[#A98BC8] transition hover:bg-[#171321] disabled:opacity-60"
          >
            <XCircle className="h-3.5 w-3.5" strokeWidth={2.2} />
            Decline
          </button>
        </div>
      )}
    </article>
  );
};

/* ─── Pagination ─────────────────────────────────────────── */
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] transition hover:bg-[#171321] disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold transition ${
            p === page
              ? 'bg-[#DF7AFE] text-white shadow-[0_4px_16px_rgba(223,122,254,0.3)]'
              : 'border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] hover:bg-[#171321]'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] transition hover:bg-[#171321] disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */
const MyCampaignsPage = () => {
  const { logout } = useAuth();
  const { navigate } = useRouter();

  const [creator, setCreator] = useState(() => getStoredUser());
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [respondingId, setRespondingId] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  const handleLogout = () => { logout(); navigate('home'); };

  /* ── Fetch inquiries ─────────────────────────────────────── */
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('auth'); return; }

    try {
      const [profileRes, inquiryRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/influencer/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/influencer/inquiries`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData?.data) setCreator((prev) => ({ ...(prev || {}), ...profileData.data }));
      }

      if (inquiryRes.ok) {
        const inquiryData = await inquiryRes.json();
        setInquiries(normalizeInquiries(inquiryData));
      } else {
        setError('Failed to load campaigns. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  /* ── Respond to inquiry ─────────────────────────────────── */
  const handleRespond = async (inquiryId, action) => {
    setRespondingId(inquiryId);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE_URL}/api/influencer/inquiries/${inquiryId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: action === 'accept' ? 'accepted' : 'rejected' }),
      });
      if (res.ok) {
        const nextStatus = action === 'accept' ? 'artist_accepted' : 'artist_rejected';
        setInquiries((prev) => prev.map((item) => (item._id === inquiryId ? { ...item, status: nextStatus } : item)));
      }
    } finally {
      setRespondingId('');
    }
  };

  /* ── Derived category list ──────────────────────────────── */
  const categories = useMemo(() => {
    const cats = [...new Set(inquiries.map((i) => i.category).filter(Boolean))];
    return cats;
  }, [inquiries]);

  /* ── Filtered & paginated data ──────────────────────────── */
  const filtered = useMemo(() => {
    let list = inquiries;
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter);
    if (categoryFilter !== 'all') list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.campaignName.toLowerCase().includes(q) ||
          i.brandName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.requirements || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, statusFilter, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: inquiries.length,
    pending: inquiries.filter((i) => i.status === 'forwarded').length,
    accepted: inquiries.filter((i) => i.status === 'artist_accepted').length,
    completed: inquiries.filter((i) => i.status === 'completed').length,
  }), [inquiries]);

  const activeFilterCount = [statusFilter !== 'all', categoryFilter !== 'all', search.trim() !== ''].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#000000] text-[#FFFFFF]">
      <div className="grid min-h-screen lg:grid-cols-[210px_1fr]">

        {/* ── Sidebar ──────────────────────────────────────────── */}
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
            <SidebarItem icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('influencer-dashboard')} />
            <SidebarItem icon={UserRound} label="Profile" onClick={() => navigate('profile')} />
            <SidebarItem icon={Inbox} label="Inbox" badge={stats.pending || null} />
            <SidebarItem icon={Send} label="My Campaigns" active onClick={() => navigate('my-campaigns')} />
            <SidebarItem icon={Wallet} label="Earnings" />
            <SidebarItem icon={CreditCard} label="Payments" />
            <SidebarItem icon={Settings} label="Settings" />
          </nav>

          <button type="button" onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Logout
          </button>
        </aside>

        {/* ── Main Content ──────────────────────────────────────── */}
        <section className="min-w-0 px-5 py-5 lg:px-8">

          {/* Header */}
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.04em]">My Campaigns</h1>
              <p className="mt-1 text-xs font-medium text-[#A98BC8]">All incoming campaign inquiries.</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleLogout}
                className="flex h-11 items-center gap-2 rounded-xl border border-rose-500/20 bg-[#0D0D0D] px-4 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 shadow-sm transition-all" title="Logout">
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
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[#DF7AFE]">{creatorInitial(creator)}</div>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <div className="max-w-[120px] truncate text-sm font-semibold">{creatorHandle(creator)}</div>
                  <div className="text-xs text-[#A98BC8]">{creatorCategory(creator)}</div>
                </div>
              </button>
            </div>
          </header>

          {/* Stats Row */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-[#DF7AFE]' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
              { label: 'Accepted', value: stats.accepted, color: 'text-emerald-400' },
              { label: 'Completed', value: stats.completed, color: 'text-blue-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] px-5 py-4 shadow-sm">
                <div className={`text-2xl font-semibold tracking-[-0.04em] ${color}`}>{value}</div>
                <div className="mt-0.5 text-xs font-medium text-[#A98BC8]">{label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter Bar */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A98BC8]" strokeWidth={2} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns, brands…"
                className="w-full rounded-xl border border-[#3E2A55] bg-[#0D0D0D] py-2.5 pl-10 pr-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#A98BC8] focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#DF7AFE]/10"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98BC8] hover:text-white">
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Filter toggle (mobile-friendly) */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-semibold transition ${
                showFilters || activeFilterCount > 0
                  ? 'border-[#DF7AFE] bg-[#DF7AFE]/10 text-[#DF7AFE]'
                  : 'border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] hover:bg-[#171321] hover:text-white'
              }`}
            >
              <Filter className="h-3.5 w-3.5" strokeWidth={2.2} />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#DF7AFE] text-[0.6rem] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-3.5 w-3.5 transition ${showFilters ? 'rotate-180' : ''}`} strokeWidth={2} />
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchInquiries}
              disabled={loading}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] transition hover:bg-[#171321] hover:text-white disabled:opacity-60"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mb-4 flex flex-wrap gap-3 rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] p-4">
              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#A98BC8]">Status</span>
                <div className="flex flex-wrap gap-2">
                  {ALL_STATUSES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStatusFilter(value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        statusFilter === value
                          ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white'
                          : 'border-[#3E2A55] bg-[#000000] text-[#A98BC8] hover:bg-[#171321]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              {categories.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#A98BC8]">Category</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryFilter('all')}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        categoryFilter === 'all'
                          ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white'
                          : 'border-[#3E2A55] bg-[#000000] text-[#A98BC8] hover:bg-[#171321]'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategoryFilter(cat)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                          categoryFilter === cat
                            ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white'
                            : 'border-[#3E2A55] bg-[#000000] text-[#A98BC8] hover:bg-[#171321]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset */}
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setSearch(''); }}
                  className="ml-auto self-end text-xs font-semibold text-rose-400 hover:text-rose-300"
                >
                  Reset all
                </button>
              )}
            </div>
          )}

          {/* Results count */}
          {!loading && (
            <div className="mb-3 text-xs text-[#A98BC8]">
              Showing {paginated.length} of {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
              {filtered.length !== inquiries.length ? ` (filtered from ${inquiries.length})` : ''}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[140px] animate-pulse rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D]" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 rounded-[20px] border border-rose-500/20 bg-rose-500/5 py-16 text-center">
              <XCircle className="h-10 w-10 text-rose-400" strokeWidth={1.5} />
              <p className="text-sm text-rose-400">{error}</p>
              <button
                type="button"
                onClick={fetchInquiries}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-500/10 px-5 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
              >
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={2} />
                Retry
              </button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D] py-20 text-center">
              <BriefcaseBusiness className="h-12 w-12 text-[#3E2A55]" strokeWidth={1.5} />
              <div className="text-base font-semibold text-[#FFFFFF]">
                {filtered.length === 0 && inquiries.length > 0 ? 'No campaigns match your filters' : 'No campaigns yet'}
              </div>
              <p className="max-w-xs text-sm text-[#A98BC8]">
                {filtered.length === 0 && inquiries.length > 0
                  ? 'Try adjusting your search or filter criteria.'
                  : 'When brands send you campaign inquiries, they will appear here.'}
              </p>
              {filtered.length === 0 && inquiries.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setSearch(''); }}
                  className="mt-2 text-xs font-semibold text-[#DF7AFE] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {paginated.map((inquiry) => (
                  <CampaignCard
                    key={inquiry._id}
                    inquiry={inquiry}
                    onRespond={handleRespond}
                    respondingId={respondingId}
                  />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}

        </section>
      </div>
    </main>
  );
};

export default MyCampaignsPage;
