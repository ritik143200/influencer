import React from 'react';
import {
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  LayoutPanelTop,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const serviceCards = [
  {
    icon: BriefcaseBusiness,
    title: 'Brand campaign launch',
    description: 'Brands can submit structured briefs with creator type, category direction, budget intent, and collaboration notes.',
    points: ['Brand brief submission flow', 'Category-aware campaign targeting', 'Cleaner handoff into admin review']
  },
  {
    icon: Users,
    title: 'Creator network discovery',
    description: 'The platform is being redesigned to help brands discover creators, meme pages, city communities, and artist-facing profiles more intentionally.',
    points: ['Main categories plus micro categories', 'Better creator segmentation', 'Premium discovery positioning']
  },
  {
    icon: BarChart3,
    title: 'Performance-ready data layer',
    description: 'The frontend and backend are moving toward reusable data structures that support filtering, moderation, analytics, and future campaign systems.',
    points: ['Dynamic category directory', 'Scalable admin filtering', 'Reporting-ready architecture']
  },
  {
    icon: BadgeIndianRupee,
    title: 'Commercial workflow readiness',
    description: 'Creator details, inquiry metadata, and collaboration states are being shaped for future monetization and payout operations.',
    points: ['Brief-to-collaboration tracking', 'Structured creator details', 'Future finance system compatibility']
  }
];

const platformOptions = [
  'Premium creator-tech landing page',
  'Brand registration and login flow',
  'Creator onboarding with dynamic categories',
  'Brand brief submission experience',
  'Brand dashboard for inquiry tracking',
  'Influencer dashboard for collaboration response',
  'Admin-ready data architecture'
];

const ServicesPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-28 text-white">
      <div className="section-shell">
        <div className="glass-panel rounded-[2.2rem] p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Platform services
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                What the ViralMantrix platform is built to offer.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                ViralMantrix is not being positioned as a generic listing site. The product is moving toward a premium creator
                ecosystem where brand campaigns, creator discovery, category intelligence, and admin control work together.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Experience', value: 'Motion-first', sub: 'Premium public-facing product feel' },
                  { label: 'System', value: 'Category-led', sub: 'Dynamic creator and campaign structure' },
                  { label: 'Operations', value: 'Admin-ready', sub: 'Filtering, tracking, and moderation support' }
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                    <div className="text-lg font-black text-white">{item.value}</div>
                    <div className="mt-1 text-sm font-semibold text-white/80">{item.label}</div>
                    <div className="mt-2 text-xs leading-6 text-slate-400">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-[#0a1226] p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  <LayoutPanelTop className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Current product options</div>
                  <div className="mt-1 text-xl font-black text-white">Available surfaces</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {platformOptions.map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {serviceCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel rounded-[1.8rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
                <div className="mt-5 space-y-2">
                  {card.points.map((point) => (
                    <div key={point} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <MessageSquareText className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Brand-side outcome</div>
                <div className="mt-1 text-xl font-black text-white">What brands get</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Brands get a cleaner campaign launch experience, more structured creator targeting, and a more scalable path from discovery to inquiry.
            </p>
          </div>

          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Creator-side outcome</div>
                <div className="mt-1 text-xl font-black text-white">What creators get</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Creators get stronger profile onboarding, better category-based discoverability, and a more premium network identity than simple form-led portals.
            </p>
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black text-white sm:text-3xl">Preview the strongest live flows in this redesign branch.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The most meaningful preview pages right now are the cinematic homepage, creator-side offering view, dynamic onboarding flows, and brand inquiry experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('about-influencers')}
                className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white"
              >
                View creator-side offering
              </button>
              <button
                type="button"
                onClick={() => navigate('inquiry')}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85"
              >
                View brand brief flow
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
