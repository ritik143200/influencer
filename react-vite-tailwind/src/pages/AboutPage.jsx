import React from 'react';
import {
  BarChart3,
  Globe2,
  LayoutPanelTop,
  MessageSquareText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const featureCards = [
  {
    icon: ShieldCheck,
    title: 'Secure collaboration flow',
    description: 'Creators, brands, and admins all move through a more structured and reviewable workflow.'
  },
  {
    icon: LayoutPanelTop,
    title: 'Modern creator-tech experience',
    description: 'The platform is shifting away from generic SaaS layouts into a more premium creator-economy interface.'
  },
  {
    icon: BarChart3,
    title: 'Scalable analytics base',
    description: 'Submissions, categories, and collaboration states are being wired for future insights and reporting.'
  },
  {
    icon: MessageSquareText,
    title: 'Better campaign clarity',
    description: 'Brand briefs can express creator types, micro categories, budgets, and location more clearly.'
  },
  {
    icon: Globe2,
    title: 'Community-driven discovery',
    description: 'The platform is designed not only for influencers, but also meme pages, city pages, and digital communities.'
  },
  {
    icon: Sparkles,
    title: 'Premium network positioning',
    description: 'Copy, visuals, and information architecture are moving toward a stronger high-value creator network identity.'
  }
];

const AboutPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-28 text-white">
      <div className="section-shell">
        <div className="glass-panel rounded-[2.2rem] p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            About ViralMantrix
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight text-white sm:text-5xl">
            A premium ecosystem for creators, brands, and internet-native communities.
          </h1>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-300 sm:text-base">
            ViralMantrix is being shaped as a social-tech platform where creator discovery, campaign flow, and admin intelligence work together.
            The goal is not just to list influencers, but to build a stronger operating layer for internet culture collaborations.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Platform role', value: 'Creator network', sub: 'Discovery, briefs, and collaboration flow' },
              { label: 'Core users', value: 'Brands + creators', sub: 'Influencers, city pages, meme pages, celebrity talent' },
              { label: 'Direction', value: 'Premium and scalable', sub: 'Cleaner UI, better taxonomy, stronger systems' }
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="text-lg font-black text-white">{item.value}</div>
                <div className="mt-1 text-sm font-semibold text-white/80">{item.label}</div>
                <div className="mt-2 text-xs leading-6 text-slate-400">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card) => {
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
          <h2 className="text-2xl font-black text-white">What the website currently offers in this redesign branch</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-bold text-white">Public-facing experience</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Cinematic landing page, stronger creator-economy positioning, premium navigation, and category-led discovery sections.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-bold text-white">Structured product flows</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Creator onboarding, brand inquiry flow, and backend category APIs that keep creator and brand data aligned.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
              View brand-side flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
