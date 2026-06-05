import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BriefcaseBusiness,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Inbox,
  IndianRupee,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
  Clock,
  Tag
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';
import BrandTopNav from '../components/BrandTopNav';

/* ─── Constants ──────────────────────────────────────────── */
const PAGE_SIZE = 8;

const STATUS_CONFIG = {
  sent: { label: 'Submitted', color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  admin_accepted: { label: 'Under Review', color: 'bg-sky-500/15 text-sky-400 border-sky-500/25' },
  admin_rejected: { label: 'Rejected', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  forwarded: { label: 'Sent to Creators', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  artist_accepted: { label: 'Creator Accepted', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  artist_rejected: { label: 'Creator Declined', color: 'bg-rose-500/15 text-rose-400 border-rose-500/25' },
  completed: { label: 'Completed', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
};

const ALL_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'sent', label: 'Submitted' },
  { value: 'admin_accepted', label: 'Under Review' },
  { value: 'admin_rejected', label: 'Rejected' },
  { value: 'forwarded', label: 'Sent to Creators' },
  { value: 'artist_accepted', label: 'Creator Accepted' },
  { value: 'artist_rejected', label: 'Creator Declined' },
  { value: 'completed', label: 'Completed' },
];

const HIRING_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'artist', label: 'Artist' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'creator', label: 'Creator' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'city page', label: 'City Page' },
  { value: 'meme page', label: 'Meme Page' }
];

/* ─── Helpers ────────────────────────────────────────────── */
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('userData') || localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
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
      hiringFor: item.hiringFor || 'influencer',
      category: item.category || 'Campaign',
      requirements: item.requirements || item.description || '',
      status: item.status || 'sent',
      budget: item.budget || 0,
      location: item.location || '',
      eventDate: item.eventDate || null,
      createdAt: item.createdAt || null,
    }))
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
};

/* ─── Status Badge ───────────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sent;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

/* ─── Campaign Card ──────────────────────────────────────── */
const CampaignCard = ({ inquiry, onClick }) => {
  const forwardedCount = Array.isArray(inquiry.forwardedTo) ? inquiry.forwardedTo.length : 0;
  
  // Get creator assignment info
  const assignedName = inquiry.assignedInfluencer?.userId?.fullName || 
                       inquiry.assignedInfluencer?.userId?.name || 
                       inquiry.assignedInfluencer?.userId?.username;

  return (
    <article 
      onClick={onClick}
      className="cursor-pointer rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D] p-5 transition hover:border-[#DF7AFE]/40 hover:shadow-[0_8px_32px_rgba(223,122,254,0.08)]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[#FFFFFF]">{inquiry.campaignName}</h3>
            <StatusBadge status={inquiry.status} />
          </div>
          <div className="mt-1 text-xs text-[#A98BC8] capitalize">For {inquiry.hiringFor}</div>
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
          Submitted {formatDate(inquiry.createdAt)}
        </span>
      </div>

      {/* Requirements */}
      {inquiry.requirements && (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#A98BC8]">{inquiry.requirements}</p>
      )}

      {/* Influencer assignment / Contact status info */}
      <div className="mt-4 border-t border-[#171321] pt-3 flex items-center justify-between text-xs">
        {assignedName ? (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Assigned: {assignedName}
          </span>
        ) : forwardedCount > 0 ? (
          <span className="text-[#DF7AFE] font-medium flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Sent to {forwardedCount} creator{forwardedCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="text-[#A98BC8]">Pending Assignment</span>
        )}
        <span className="text-[#DF7AFE] hover:underline font-semibold">View Details &rarr;</span>
      </div>
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
        onClick={(e) => { e.stopPropagation(); onChange(page - 1); }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] transition hover:bg-[#171321] disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={2} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(p); }}
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
        onClick={(e) => { e.stopPropagation(); onChange(page + 1); }}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D] text-[#A98BC8] transition hover:bg-[#171321] disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" strokeWidth={2} />
      </button>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────── */
const MyInquiriesPage = () => {
  const { navigate, currentPath } = useRouter();

  const [brand, setBrand] = useState(() => getStoredUser());
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hiringFilter, setHiringFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);

  /* ── Fetch inquiries ─────────────────────────────────────── */
  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('auth'); return; }

    try {
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const inquiryData = await res.json();
        setInquiries(normalizeInquiries(inquiryData));
      } else {
        setError('Failed to load inquiries. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleCardClick = (inquiry) => {
    // Save snapshot to simulate the preview mode details
    const campaignSnapshot = {
      ...inquiry,
      name: inquiry.name || brand?.brandName || brand?.name || '',
      email: inquiry.email || brand?.email || '',
      phone: inquiry.phone || brand?.phone || ''
    };
    localStorage.setItem('lastSubmittedInquiryPreview', JSON.stringify(campaignSnapshot));

    navigate('brand-campaign-details', {
      campaignId: inquiry._id || inquiry.id || 'preview-campaign',
      previewBrand: campaignSnapshot.name,
      previewEmail: campaignSnapshot.email,
      previewPhone: campaignSnapshot.phone,
      previewCampaign: campaignSnapshot.campaignName,
      previewRequirements: campaignSnapshot.requirements,
      previewLocation: campaignSnapshot.location,
      previewBudget: campaignSnapshot.budget,
      previewCategory: campaignSnapshot.category,
      previewHiringFor: campaignSnapshot.hiringFor,
      previewMainCategory: campaignSnapshot.mainCategories?.[0] || '',
      previewMicroCategory: campaignSnapshot.microCategories?.[0] || '',
      previewMicroCategories: Array.isArray(campaignSnapshot.microCategories)
        ? campaignSnapshot.microCategories.join(',')
        : ''
    });
  };

  /* ── Filtered & paginated data ──────────────────────────── */
  const filtered = useMemo(() => {
    let list = inquiries;
    if (statusFilter !== 'all') list = list.filter((i) => i.status === statusFilter);
    if (hiringFilter !== 'all') list = list.filter((i) => i.hiringFor === hiringFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.campaignName.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.hiringFor.toLowerCase().includes(q) ||
          (i.requirements || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [inquiries, statusFilter, hiringFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter, hiringFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = inquiries.length;
    const submitted = inquiries.filter((i) => i.status === 'sent').length;
    const reviewing = inquiries.filter((i) => ['admin_accepted', 'forwarded'].includes(i.status)).length;
    const completed = inquiries.filter((i) => i.status === 'completed').length;
    return { total, submitted, reviewing, completed };
  }, [inquiries]);

  const activeFilterCount = [statusFilter !== 'all', hiringFilter !== 'all', search.trim() !== ''].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(223,122,254,0.16),transparent_32%),linear-gradient(180deg,#000000_0%,#171321_100%)] text-[#FFFFFF]">
      {/* Brand Top Navigation */}
      <BrandTopNav brand={brand} navigate={navigate} currentPath="my-inquiries" />

      <div className="mx-auto max-w-[1280px] px-5 py-6 pb-12 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">My Campaigns</h1>
            <p className="mt-1.5 text-sm font-medium text-[#A98BC8]">
              Manage and track all your submitted inquiries and hiring campaigns.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('brand-campaign-create')}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.20)] transition hover:opacity-90 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Create Campaign
          </button>
        </header>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Inquiries', value: stats.total, color: 'text-[#DF7AFE]' },
            { label: 'Submitted', value: stats.submitted, color: 'text-purple-400' },
            { label: 'Under Review', value: stats.reviewing, color: 'text-amber-400' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#3E2A55] bg-[#0D0D0D]/60 backdrop-blur-md px-5 py-4 shadow-sm">
              <div className={`text-2xl font-bold tracking-[-0.04em] ${color}`}>{value}</div>
              <div className="mt-0.5 text-xs font-semibold text-[#A98BC8]">{label}</div>
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
              placeholder="Search campaigns, categories, objectives…"
              className="w-full rounded-xl border border-[#3E2A55] bg-[#0D0D0D]/80 py-2.5 pl-10 pr-4 text-sm text-[#FFFFFF] outline-none placeholder:text-[#A98BC8] focus:border-[#DF7AFE] focus:ring-4 focus:ring-[#DF7AFE]/10"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A98BC8] hover:text-white">
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-xs font-semibold transition ${
              showFilters || activeFilterCount > 0
                ? 'border-[#DF7AFE] bg-[#DF7AFE]/10 text-[#DF7AFE]'
                : 'border-[#3E2A55] bg-[#0D0D0D]/80 text-[#A98BC8] hover:bg-[#171321] hover:text-white'
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#3E2A55] bg-[#0D0D0D]/80 text-[#A98BC8] transition hover:bg-[#171321] hover:text-white disabled:opacity-60"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-[#3E2A55] bg-[#0D0D0D] p-4">
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#A98BC8]">Campaign Status</span>
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

            {/* Hiring Type Filter */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-[#A98BC8]">Hiring Profile</span>
              <div className="flex flex-wrap gap-2">
                {HIRING_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHiringFilter(value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      hiringFilter === value
                        ? 'border-[#DF7AFE] bg-[#DF7AFE] text-white'
                        : 'border-[#3E2A55] bg-[#000000] text-[#A98BC8] hover:bg-[#171321]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => { setStatusFilter('all'); setHiringFilter('all'); setSearch(''); }}
                className="self-start text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-3 text-xs text-[#A98BC8]">
            Showing {paginated.length} of {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
            {filtered.length !== inquiries.length ? ` (filtered from ${inquiries.length})` : ''}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[170px] animate-pulse rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D]" />
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
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[#3E2A55] bg-[#0D0D0D] py-20 text-center">
            <BriefcaseBusiness className="h-12 w-12 text-[#3E2A55]" strokeWidth={1.5} />
            <div className="text-base font-semibold text-[#FFFFFF]">
              {filtered.length === 0 && inquiries.length > 0 ? 'No campaigns match your filters' : 'No campaigns submitted yet'}
            </div>
            <p className="max-w-xs text-sm text-[#A98BC8] leading-6">
              {filtered.length === 0 && inquiries.length > 0
                ? 'Try adjusting your search query or reset status/hiring type filters.'
                : 'Create your first hiring inquiry to start connecting with top influencers and creators.'}
            </p>
            {filtered.length === 0 && inquiries.length > 0 ? (
              <button
                type="button"
                onClick={() => { setStatusFilter('all'); setHiringFilter('all'); setSearch(''); }}
                className="mt-2 text-xs font-semibold text-[#DF7AFE] hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('brand-campaign-create')}
                className="mt-2 inline-flex h-10 items-center gap-2 rounded-xl bg-[#DF7AFE] px-5 text-xs font-semibold text-white transition hover:bg-[#c958e8]"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                Get Started
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {paginated.map((inquiry) => (
                <CampaignCard
                  key={inquiry._id}
                  inquiry={inquiry}
                  onClick={() => handleCardClick(inquiry)}
                />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </div>
    </main>
  );
};

export default MyInquiriesPage;
