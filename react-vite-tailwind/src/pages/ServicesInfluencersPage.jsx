import React from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Camera,
  Film,
  LayoutGrid,
  Megaphone,
  MessageSquareText,
  Sparkles,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const creatorServiceCards = [
  {
    icon: BriefcaseBusiness,
    title: 'Brand deal readiness',
    description: 'Creator onboarding is moving toward a richer profile system that helps brands understand category fit, creator identity, and collaboration intent.',
    features: ['Structured creator profile', 'Clearer collaboration signals', 'Better discovery context']
  },
  {
    icon: BarChart3,
    title: 'Category-led visibility',
    description: 'Main categories and micro categories help creators be discovered through more accurate taxonomy instead of flat generic filters.',
    features: ['Main category selection', 'Multiple micro categories', 'Scalable backend mapping']
  },
  {
    icon: Camera,
    title: 'Social and content positioning',
    description: 'Profiles capture social presence and creator identity details so the network feels closer to a premium creator marketplace.',
    features: ['Social link collection', 'Content identity context', 'Professional presentation layer']
  },
  {
    icon: MessageSquareText,
    title: 'Inquiry response workflow',
    description: 'Influencer-side dashboard flows are being shaped around campaign response, opportunity visibility, and better collaboration follow-through.',
    features: ['Inquiry review workflow', 'Cleaner opportunity visibility', 'Response status handling']
  },
  {
    icon: Film,
    title: 'Creator ecosystem expansion',
    description: 'The platform direction supports not only classic influencers, but also UGC creators, actors, models, filmmakers, and culture-led talent.',
    features: ['Multi-format creator support', 'Broader talent representation', 'Premium roster positioning']
  },
  {
    icon: Megaphone,
    title: 'Brand-facing compatibility',
    description: 'Creator data is being aligned with brand brief requirements so both sides operate with the same category language and collaboration expectations.',
    features: ['Shared category system', 'Brand-ready metadata', 'Admin-compatible structure']
  }
];

const categorySurfaces = [
  'Lifestyle',
  'Travel',
  'Fitness & Health',
  'Food',
  'Technology',
  'Finance & Investment',
  'Gaming',
  'Education',
  'Motivation & Self Growth',
  'Spiritual & Astrology',
  'Fashion',
  'Comedy & Entertainment',
  'Historical',
  'Art & Craft',
  'AI',
  'Vlogs',
  'Street Interviews',
  'UGC Creator',
  'Influencer',
  'Actor',
  'Model',
  'Filmmaker',
  'Celebrity'
];

const ServicesInfluencersPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-28 text-white">
      <div className="section-shell">
        <div className="glass-panel rounded-[2.2rem] p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Creator-side services
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                The creator-facing side of ViralMantrix.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                This side of the platform is designed for creators, influencers, celebrities, city communities, and meme pages
                that want stronger discovery, better campaign opportunities, and a more premium creator-network experience.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Onboarding', value: 'Structured', sub: 'More than a basic signup form' },
                  { label: 'Discovery', value: 'Category-driven', sub: 'Better matching through taxonomy' },
                  { label: 'Direction', value: 'Commercial-ready', sub: 'Built for brand collaboration growth' }
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
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Creator product scope</div>
                  <div className="mt-1 text-xl font-black text-white">What creators can expect</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  'Creator registration with main and micro category selection',
                  'Profile data collection with social and identity context',
                  'Brand inquiry visibility through creator-side workflows',
                  'Discovery architecture aligned with brand-side filtering',
                  'Admin-ready profile data for moderation and matching'
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
          {creatorServiceCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel rounded-[1.8rem] p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{card.description}</p>
                <div className="mt-5 space-y-2">
                  {card.features.map((feature) => (
                    <div key={feature} className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <Users className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Supported creator surfaces</div>
              <div className="mt-1 text-2xl font-black text-white">Micro-category preview</div>
            </div>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            These are the kinds of creator identities and content verticals the new category system is preparing to support across onboarding and discovery.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {categorySurfaces.map((item) => (
              <div key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black text-white sm:text-3xl">Preview the creator-facing flows next.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                The strongest next preview after this page is the creator registration flow, followed by the homepage category sections and brand brief experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('influencer-registration')}
                className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white"
              >
                Preview creator signup
              </button>
              <button
                type="button"
                onClick={() => navigate('home', { scroll: 'categories' })}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85"
              >
                View category experience
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesInfluencersPage;
