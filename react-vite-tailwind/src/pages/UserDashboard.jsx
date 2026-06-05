import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  ChevronDown,
  ClipboardList,
  FolderOpen,
  Headphones,
  Heart,
  Megaphone,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';
import BrandTopNav from '../components/BrandTopNav';

const surfaceCardClass =
  'rounded-[24px] border border-[#3E2A55] bg-[linear-gradient(180deg,rgba(18,9,10,0.96)_0%,rgba(6,6,6,0.92)_100%)] shadow-[0_18px_45px_rgba(6,6,6,0.42)] backdrop-blur-xl';

const formatDateRange = (createdAt) => {
  const start = new Date(createdAt || Date.now());
  const end = new Date(start);
  end.setDate(start.getDate() + 30);
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
};

const getStoredBrand = () => {
  try {
    const raw = localStorage.getItem('userData') || localStorage.getItem('loggedInUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// BrandTopNav is imported from '../components/BrandTopNav'

const BrandHeroArt = () => (
  <div className="relative h-40 overflow-hidden">
    <div className="absolute left-0 right-0 bottom-0 h-20 bg-[radial-gradient(circle_at_center,rgba(190,154,255,0.2),transparent_70%)]" />
    <div className="absolute left-[18%] top-[28%] flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE] shadow-sm">
      <Users className="h-5 w-5" strokeWidth={2} />
    </div>
    <div className="absolute left-[38%] top-[12%] flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE] shadow-sm">
      <BarChart3 className="h-6 w-6" strokeWidth={2} />
    </div>
    <div className="absolute right-[18%] top-[26%] flex h-10 w-10 items-center justify-center rounded-full bg-[#171321] text-[#0099FF] shadow-sm">
      <Heart className="h-5 w-5" strokeWidth={2} />
    </div>
    <div className="absolute right-[24%] bottom-[22%] flex h-10 w-10 items-center justify-center rounded-full bg-[#171321] text-[#DF7AFE] shadow-sm">
      <MessageSquare className="h-5 w-5" strokeWidth={2} />
    </div>

    <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(0,153,255,0.45)_0%,rgba(20,16,32,0.35)_55%,transparent_72%)]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(145deg,#171321_0%,#8B4DD8_100%)] text-[#DF7AFE] shadow-[0_18px_45px_rgba(223,122,254,0.18)]">
        <Megaphone className="h-10 w-10 rotate-[-12deg]" strokeWidth={2.2} />
      </div>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, description, onClick }) => {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex items-start text-left w-full gap-4 rounded-[18px] border border-[#3E2A55] bg-[#0D0D0D] px-5 py-4 transition ${
        onClick ? 'hover:border-[#DF7AFE]/40 hover:bg-[#171321]/30 cursor-pointer' : ''
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <div>
        <div className="text-sm font-semibold text-[#FFFFFF]">{title}</div>
        <div className="mt-1 text-xs leading-5 text-[#FFFFFF]/72">{description}</div>
      </div>
    </Component>
  );
};

const getStoredCampaignPreview = () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const queryCampaignName = params.get('previewCampaign');
    const queryRequirements = params.get('previewRequirements');
    if (queryCampaignName) {
      return {
        _id: params.get('campaignId') || 'preview-campaign',
        name: params.get('previewBrand') || '',
        email: params.get('previewEmail') || '',
        phone: params.get('previewPhone') || '',
        campaignName: queryCampaignName,
        requirements: queryRequirements || 'Campaign details from brand form',
        budget: Number(params.get('previewBudget')) || 0,
        category: params.get('previewCategory') || '',
        hiringFor: params.get('previewHiringFor') || '',
        location: params.get('previewLocation') || '',
        mainCategories: params.get('previewMainCategory') ? [params.get('previewMainCategory')] : [],
        microCategories: params.get('previewMicroCategory') ? [params.get('previewMicroCategory')] : [],
        createdAt: new Date().toISOString(),
        status: 'sent'
      };
    }

    const raw = localStorage.getItem('lastSubmittedInquiryPreview');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      _id: parsed._id || 'preview-campaign',
      name: parsed.name || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      campaignName: parsed.campaignName || 'Campaign',
      requirements: parsed.requirements || 'Campaign details pending',
      budget: Number(parsed.budget || 0),
      category: parsed.category || parsed.hiringFor || '',
      hiringFor: parsed.hiringFor || '',
      location: parsed.location || '',
      mainCategories: parsed.mainCategories || [],
      microCategories: parsed.microCategories || [],
      createdAt: parsed.createdAt || new Date().toISOString(),
      status: parsed.status || 'sent'
    };
  } catch {
    return null;
  }
};

const normalizeInquiries = (data) => {
  const list = Array.isArray(data?.data) ? data.data : [];
  return list
    .filter((item) => item && typeof item === 'object')
    .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
};

const UserDashboard = ({ previewMode = null }) => {
  const { navigate, currentPath } = useRouter();
  const brand = useMemo(() => getStoredBrand(), []);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (previewMode === 'empty') {
      setInquiries([]);
      setLoading(false);
      return;
    }

    if (previewMode === 'active') {
      setInquiries([
        getStoredCampaignPreview() || {
          _id: 'preview-campaign',
          campaignName: 'Campaign',
          requirements: 'Increase brand awareness',
          createdAt: new Date().toISOString(),
          status: 'sent'
        }
      ]);
      setLoading(false);
      return;
    }

    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await fetch(`${API_BASE_URL}/api/inquiries`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const data = await response.json();
        setInquiries(response.ok ? normalizeInquiries(data) : []);
      } catch {
        setInquiries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [previewMode]);

  const latestInquiry = inquiries[0] || null;
  const hasCampaigns = Boolean(latestInquiry);
  const campaignTitle = latestInquiry?.campaignName || 'Campaign';
  const campaignObjective = latestInquiry?.requirements || latestInquiry?.category || 'Campaign objective';
  const campaignStatus =
    latestInquiry?.status === 'completed'
      ? 'Completed'
      : latestInquiry?.status === 'artist_rejected' || latestInquiry?.status === 'admin_rejected'
        ? 'Review'
        : 'Active';
  const forwardedCreators = Array.isArray(latestInquiry?.forwardedTo) ? latestInquiry.forwardedTo : [];
  const creatorsContacted = forwardedCreators.length || latestInquiry?.creatorsContacted || 0;
  const visibleCreatorCount =
    latestInquiry?.influencerCount ||
    latestInquiry?.creatorCount ||
    creatorsContacted ||
    (previewMode === 'active' ? 5 : 0);

  const openCampaignDetails = () => {
    const campaignSnapshot = latestInquiry
      ? {
          ...latestInquiry,
          name: latestInquiry.name || brand?.brandName || brand?.name || '',
          email: latestInquiry.email || brand?.email || '',
          phone: latestInquiry.phone || brand?.phone || ''
        }
      : null;

    if (latestInquiry) {
      localStorage.setItem('lastSubmittedInquiryPreview', JSON.stringify(campaignSnapshot));
    }

    navigate('brand-campaign-details', {
      campaignId: campaignSnapshot?._id || latestInquiry?._id || latestInquiry?.id || 'preview-campaign',
      previewBrand: campaignSnapshot?.name || '',
      previewEmail: campaignSnapshot?.email || '',
      previewPhone: campaignSnapshot?.phone || '',
      previewCampaign: campaignSnapshot?.campaignName || '',
      previewRequirements: campaignSnapshot?.requirements || '',
      previewLocation: campaignSnapshot?.location || '',
      previewBudget: campaignSnapshot?.budget || '',
      previewCategory: campaignSnapshot?.category || '',
      previewHiringFor: campaignSnapshot?.hiringFor || '',
      previewMainCategory: campaignSnapshot?.mainCategories?.[0] || '',
      previewMicroCategory: campaignSnapshot?.microCategories?.[0] || '',
      previewMicroCategories: Array.isArray(campaignSnapshot?.microCategories)
        ? campaignSnapshot.microCategories.join(',')
        : ''
    });
  };

  const quickActions = useMemo(
    () => [
      {
        icon: Search,
        title: 'Find Influencers',
        description: 'Discover creators that match your brand',
        onClick: () => navigate('explore-influencers')
      },
      {
        icon: ClipboardList,
        title: 'My Campaigns',
        description: 'Manage and track your campaigns',
        onClick: () => navigate('my-inquiries')
      },
      {
        icon: MessageSquare,
        title: 'Messages',
        description: 'Communicate with influencers'
      },
      {
        icon: Bookmark,
        title: 'Saved Influencers',
        description: 'View and manage your shortlisted creators'
      }
    ],
    [navigate]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000]">
        <BrandTopNav brand={brand} navigate={navigate} currentPath={currentPath} />
        <div className="mx-auto max-w-[1280px] px-5 py-8 lg:px-8">
          <div className={`${surfaceCardClass} flex h-48 items-center justify-center`}>
            <div className="text-sm text-[#FFFFFF]/78">Loading brand dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(223,122,254,0.16),transparent_32%),linear-gradient(180deg,#000000_0%,#171321_100%)] text-[#FFFFFF]">
      <BrandTopNav brand={brand} navigate={navigate} currentPath={currentPath} />
      <div className="mx-auto max-w-[1280px] px-5 py-5 pb-10 lg:px-8">
        <div className="space-y-5">
          <section className={`${surfaceCardClass} p-6 lg:p-7`}>
            <div className="grid gap-6 lg:grid-cols-[0.92fr_0.9fr_0.74fr] lg:items-center">
              <div>
                <div className="text-sm text-[#FFFFFF]/78">Welcome back!</div>
                <h1 className="mt-3 text-[2.2rem] font-semibold leading-[1.1] text-[#FFFFFF]">Let&apos;s make an impact</h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-[#FFFFFF]/78">
                  Manage your campaigns and connect with the right influencers.
                </p>
              </div>

              <BrandHeroArt />

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigate('brand-campaign-create')}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#DF7AFE] to-[#8B4DD8] px-5 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(223,122,254,0.20)]"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  Create New Campaign
                </button>
                <button
                  type="button"
                  onClick={() => navigate('my-inquiries')}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-5 text-sm font-semibold text-[#DF7AFE] transition hover:bg-[#171321]"
                >
                  <ClipboardList className="h-4 w-4" strokeWidth={2} />
                  View All Campaigns
                </button>
              </div>
            </div>
          </section>

          <section className={`${surfaceCardClass} p-5 lg:p-6`}>
            <h2 className="text-sm font-semibold text-[#FFFFFF]">Quick Actions</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              {quickActions.map((item) => (
                <QuickAction key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className={`${surfaceCardClass} p-5 lg:p-6`}>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-[#FFFFFF]">Your Campaign</h2>
              <MoreVertical className="h-5 w-5 text-slate-300" strokeWidth={2} />
            </div>

            {hasCampaigns ? (
              <div className="mt-4 flex flex-col gap-5 rounded-[22px] border border-[#3E2A55] bg-[#0D0D0D] p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-28 overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#171321_0%,#8B4DD8_100%)]">
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-[#DF7AFE]">
                      Campaign
                    </div>
                  </div>

                  <div>
                    <div className="text-xl font-semibold text-[#FFFFFF]">{campaignTitle}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-5 text-xs text-[#FFFFFF]/72">
                      <span>{formatDateRange(latestInquiry?.createdAt)}</span>
                      <span className="max-w-[280px] truncate">{campaignObjective}</span>
                      <span>{visibleCreatorCount} Influencers</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 lg:items-end">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {campaignStatus}
                  </span>
                  <button
                    type="button"
                    onClick={openCampaignDetails}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3E2A55] bg-[#000000] px-5 text-sm font-semibold text-[#DF7AFE]"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex min-h-[138px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#3E2A55] bg-[#0D0D0D] px-5 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
                  <FolderOpen className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="mt-4 text-base font-semibold text-[#FFFFFF]">No campaign added yet</div>
                <div className="mt-1 text-sm text-[#FFFFFF]/72">Your submitted brand campaigns will appear here.</div>
              </div>
            )}
          </section>

          <section className={`${surfaceCardClass} flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6`}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#171321] text-[#DF7AFE]">
                <Headphones className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-semibold text-[#FFFFFF]">Need help getting started?</div>
                <div className="mt-1 text-sm text-[#FFFFFF]/72">Our team is here to help you succeed.</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('contact')}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#3E2A55] bg-[#0D0D0D] px-5 text-sm font-semibold text-[#DF7AFE]"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
