import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutPanelTop,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const coreSteps = [
  {
    step: '01',
    title: 'Choose your entry point',
    description: 'Creators and brands enter through dedicated flows so onboarding feels purposeful from the first screen.'
  },
  {
    step: '02',
    title: 'Submit structured information',
    description: 'Profiles and brand briefs use category-aware fields, collaboration intent, and reusable metadata instead of flat generic forms.'
  },
  {
    step: '03',
    title: 'Move into campaign workflow',
    description: 'Inquiries, creator responses, and admin review all connect into a system that is easier to scale and easier to manage.'
  }
];

const creatorFlow = [
  'Create a creator account',
  'Select main and micro categories',
  'Add creator identity and socials',
  'Enter the collaboration pipeline'
];

const brandFlow = [
  'Create a brand account',
  'Submit a campaign brief',
  'Target creator categories',
  'Track inquiry progression'
];

const platformCapabilities = [
  { icon: ShieldCheck, title: 'Secure data flow', description: 'Structured submissions that are easier to review and moderate.' },
  { icon: Search, title: 'Better discovery logic', description: 'Category-led creator matching and more relevant campaign targeting.' },
  { icon: MessageSquareText, title: 'Clear collaboration handoff', description: 'Brand intent and creator data move through shared system logic.' },
  { icon: BarChart3, title: 'Analytics-ready architecture', description: 'The product is being shaped for deeper reporting and filtering.' }
];

const HowItWorksPage = () => {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-transparent pb-16 pt-28 text-white">
      <div className="section-shell">
        <div className="glass-panel rounded-[2.2rem] p-8 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
            <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
            Product flow
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">
                How ViralMantrix is designed to work.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 sm:text-base">
                The platform is being rebuilt so discovery, onboarding, campaign briefs, and admin control feel like parts
                of one modern creator operating system instead of disconnected pages.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Flow', value: 'Structured', sub: 'Purposeful user journeys' },
                  { label: 'Matching', value: 'Category-aware', sub: 'Shared creator and brand language' },
                  { label: 'Ops', value: 'Scalable', sub: 'Ready for filtering and moderation' }
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
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Preview summary</div>
                  <div className="mt-1 text-xl font-black text-white">Current user paths</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  'Homepage introduces the creator ecosystem and category logic',
                  'Creators onboard through a structured registration experience',
                  'Brands submit campaign briefs through a dedicated flow',
                  'Dashboards provide collaboration and inquiry visibility',
                  'Admin receives structured data for review and filtering'
                ].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {coreSteps.map((step) => (
            <div key={step.step} className="glass-panel rounded-[1.8rem] p-6">
              <div className="text-sm font-black tracking-[0.28em] text-cyan-300">{step.step}</div>
              <h2 className="mt-4 text-xl font-bold text-white">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <Users className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Creator flow</div>
                <div className="mt-1 text-2xl font-black text-white">For creators and influencers</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {creatorFlow.map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black text-cyan-300">
                    0{index + 1}
                  </div>
                  <div className="text-sm font-semibold text-white/85">{item}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
                <Building2 className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Brand flow</div>
                <div className="mt-1 text-2xl font-black text-white">For brands and campaign teams</div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {brandFlow.map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-[1.2rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-black text-cyan-300">
                    0{index + 1}
                  </div>
                  <div className="text-sm font-semibold text-white/85">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white">
              <BriefcaseBusiness className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">System capabilities</div>
              <div className="mt-1 text-2xl font-black text-white">What supports the flow underneath</div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {platformCapabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 glass-panel rounded-[2rem] p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-black text-white sm:text-3xl">Open the strongest preview routes from here.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                If you want to understand the experience quickly, go from homepage to creator-side offering, then creator signup, then brand brief flow.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('home')}
                className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white"
              >
                View homepage
              </button>
              <button
                type="button"
                onClick={() => navigate('influencer-registration')}
                className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/85"
              >
                Preview creator signup
              </button>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
            <UserRoundPlus className="h-4 w-4 text-cyan-300" strokeWidth={2} />
            <span>Onboarding, discovery, and brand brief submission are the clearest live product stories right now.</span>
            <ArrowRight className="hidden h-4 w-4 text-cyan-300 sm:block" strokeWidth={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
