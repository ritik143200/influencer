import React from 'react';
import {
  BadgeIndianRupee,
  BarChart3,
  BriefcaseBusiness,
  Compass,
  LayoutGrid,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const offerCards = [
  {
    icon: Users,
    title: 'Curated creator discovery',
    description: 'Find creators, meme pages, city communities, and celebrity-facing profiles through cleaner category logic and better filtering.'
  },
  {
    icon: ShieldCheck,
    title: 'Verified collaboration flow',
    description: 'Creators submit structured profiles and brands send clear briefs that route into the admin layer with review-ready metadata.'
  },
  {
    icon: BarChart3,
    title: 'Performance-led decision making',
    description: 'Campaigns, creator surfaces, and category segments are prepared for deeper analytics and reporting.'
  },
  {
    icon: BriefcaseBusiness,
    title: 'Brand partnership pipeline',
    description: 'From discovery to inquiry to confirmation, the platform is designed to shorten the collaboration cycle.'
  },
  {
    icon: BadgeIndianRupee,
    title: 'Monetization-ready operations',
    description: 'Profiles, briefs, and admin tracking are being shaped for future payout and commercial workflow expansion.'
  },
  {
    icon: Compass,
    title: 'Premium creator positioning',
    description: 'Every creator-facing touchpoint is moving away from generic forms toward a stronger premium network experience.'
  }
];

const categoryHighlights = [
  'Creator / Influencer',
  'City Pages',
  'Meme Pages',
  'Celebrity',
  'Lifestyle',
  'UGC Creator',
  'Fashion',
  'Fitness & Health',
  'Travel',
  'Food',
  'Technology',
  'Finance & Investment'
];

const AboutInfluencersPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-28 text-white">
      <div className="section-shell">
        <div className="glass-panel rounded-[2.2rem] p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Creator ecosystem overview
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                What ViralMantrix offers creators and brands.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                ViralMantrix is being rebuilt as a premium creator economy platform where creators, influencers, meme pages,
                city communities, celebrities, and brands can connect through structured discovery, better category logic,
                and collaboration-first workflows.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Discovery', value: 'Multi-layer', sub: 'Creators, communities, and culture pages' },
                  { label: 'Collaboration', value: 'Structured', sub: 'Brand briefs and creator metadata' },
                  { label: 'Scalability', value: 'Backend-ready', sub: 'Dynamic category architecture' }
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
                  <LayoutGrid className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Current product options</div>
                  <div className="mt-1 text-xl font-black text-white">Platform surfaces</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  'Premium landing page for discovery and conversion',
                  'Creator registration with dynamic categories',
                  'Brand brief submission flow',
                  'Brand dashboard for inquiry tracking',
                  'Influencer dashboard for response workflow',
                  'Admin-facing category-ready data pipeline'
                ].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offerCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel rounded-[1.8rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <h2 className="text-2xl font-black text-white">Category preview</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            The website is being aligned around dynamic main categories and micro categories so creators and brands use the same
            structured language throughout onboarding, discovery, and admin review.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {categoryHighlights.map((item) => (
              <div key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <h2 className="text-2xl font-black text-white">Preview summary</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-bold text-white">For brands</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Launch campaign briefs, choose creator surfaces, set budget and location, and send structured inquiries that land directly in admin workflows.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-bold text-white">For creators</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Build a profile with category metadata, social links, and creator identity details so discovery and matching feel more premium and accurate.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('registration')}
              className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white"
            >
              Preview creator signup
            </button>
            <button
              type="button"
              onClick={() => navigate('inquiry')}
              className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85"
            >
              Preview brand brief flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutInfluencersPage;
