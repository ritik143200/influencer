import { useEffect } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  Bot,
  Building2,
  Camera,
  Clapperboard,
  Cpu,
  Crown,
  Dumbbell,
  Film,
  Gamepad2,
  Gem,
  GraduationCap,
  Landmark,
  Laugh,
  MapPinned,
  Megaphone,
  Mic2,
  MoonStar,
  Music4,
  Newspaper,
  Palette,
  Plane,
  Rocket,
  ScrollText,
  Shapes,
  Shirt,
  Smartphone,
  Sparkles,
  Star,
  SunMoon,
  TrendingUp,
  Users,
  Utensils
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { useCategoryDirectory } from '../hooks/useCategoryDirectory';
import { getMainCategoryCards } from '../utils/categoryDirectory';

const iconMap = {
  badgeIndianRupee: BadgeIndianRupee,
  bot: Bot,
  building2: Building2,
  camera: Camera,
  clapperboard: Clapperboard,
  cpu: Cpu,
  crown: Crown,
  dumbbell: Dumbbell,
  film: Film,
  gamepad2: Gamepad2,
  gem: Gem,
  graduationCap: GraduationCap,
  landmark: Landmark,
  laugh: Laugh,
  mapPinned: MapPinned,
  megaphone: Megaphone,
  mic2: Mic2,
  moonStar: MoonStar,
  music4: Music4,
  newspaper: Newspaper,
  palette: Palette,
  plane: Plane,
  rocket: Rocket,
  scrollText: ScrollText,
  shapes: Shapes,
  shirt: Shirt,
  smartphone: Smartphone,
  sparkles: Sparkles,
  star: Star,
  sunMoon: SunMoon,
  utensils: Utensils
};

const heroMetrics = [
  { label: 'Creator clusters', value: '04', hint: 'Creators, city pages, meme pages, celebrities' },
  { label: 'Culture verticals', value: '30+', hint: 'From UGC and lifestyle to meme-led fandoms' },
  { label: 'Campaign energy', value: '24/7', hint: 'Built for always-on internet culture' }
];

const ecosystemFlows = [
  {
    title: 'Brands launch faster',
    description: 'Move from idea to campaign brief with category-aware targeting and creator-ready collaboration flows.'
  },
  {
    title: 'Creators get discovered',
    description: 'Micro-categories, profile metadata, and dynamic filtering make the right creators easier to match and approve.'
  },
  {
    title: 'Admin sees everything',
    description: 'Every submission flows into a scalable system for moderation, filtering, follow-ups, and future analytics.'
  }
];

const interactionHighlights = [
  'Motion-first landing experience with cinematic depth',
  'Dynamic category system for creators, meme pages, city pages, and celebrities',
  'Brand-side campaign briefs that feel like an app, not a boring form',
  'Admin-ready data architecture for filtering, moderation, and analytics'
];

const HomePage = ({ config }) => {
  const { navigate, params } = useRouter();
  const { directory, summary, loading } = useCategoryDirectory();

  useEffect(() => {
    if (params.scroll) {
      const el = document.getElementById(params.scroll);
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 250);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [params.scroll]);

  const spotlightCategories = summary?.spotlightCategories || [];
  const mainCategoryCards = getMainCategoryCards(summary, directory);

  const renderIcon = (iconKey, className = 'w-5 h-5') => {
    const Icon = iconMap[iconKey] || Sparkles;
    return <Icon className={className} strokeWidth={1.8} />;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <section className="relative overflow-hidden pt-28 pb-18 md:pt-32 md:pb-24">
        <div className="absolute inset-0">
          <div className="absolute inset-x-[-10%] top-[-10%] h-[28rem] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.34),transparent_62%)] blur-3xl" />
          <div className="absolute right-[-8%] top-[12%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.26),transparent_64%)] blur-3xl" />
          <div className="absolute left-[8%] bottom-[6%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.18),transparent_64%)] blur-3xl" />
        </div>

        <div className="section-shell relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                <Sparkles className="h-4 w-4 text-cyan-300" strokeWidth={1.8} />
                ViralMantrix Creator Ecosystem
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[0.95] text-shadow-soft sm:text-6xl lg:text-7xl">
                Internet culture,
                <span className="gradient-text block">campaign energy, creator gravity.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                ViralMantrix brings creators, influencers, celebrities, meme pages, city communities, and brands into one
                motion-first operating system for discovery, collaboration, and scale.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate('inquiry')}
                  className="magnetic-button inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_50px_rgba(139,92,246,0.35)]"
                >
                  Launch a Campaign
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('registration', { type: 'influencer' })}
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                >
                  Join the Creator Network
                </button>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="glass-panel rounded-3xl px-5 py-5">
                    <div className="text-3xl font-black text-white">{metric.value}</div>
                    <div className="mt-1 text-sm font-semibold text-white/80">{metric.label}</div>
                    <div className="mt-2 text-xs leading-6 text-slate-400">{metric.hint}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="glass-panel mesh-card rounded-[2rem] p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/50">Creator signal</div>
                    <div className="mt-2 text-2xl font-black">Premium internet-native roster</div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-cyan-300">
                    <TrendingUp className="h-6 w-6" strokeWidth={2} />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    { name: 'Creators & influencers', status: 'High intent', glow: 'from-violet-500/30 to-fuchsia-500/10' },
                    { name: 'City & culture pages', status: 'Hyperlocal reach', glow: 'from-cyan-500/25 to-sky-500/10' },
                    { name: 'Meme communities', status: 'Virality engines', glow: 'from-pink-500/25 to-orange-500/10' }
                  ].map((card, index) => (
                    <div
                      key={card.name}
                      className={`animate-float-slow rounded-[1.6rem] border border-white/10 bg-gradient-to-r ${card.glow} p-4`}
                      style={{ animationDelay: `${index * 0.8}s` }}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold text-white">{card.name}</div>
                          <div className="mt-1 text-xs text-slate-300">{card.status}</div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white/90">
                          {index === 0 && <Users className="h-5 w-5" strokeWidth={1.8} />}
                          {index === 1 && <MapPinned className="h-5 w-5" strokeWidth={1.8} />}
                          {index === 2 && <Sparkles className="h-5 w-5" strokeWidth={1.8} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[#0f1630]/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Live taxonomy</div>
                      <div className="mt-2 text-lg font-black text-white">Dynamic category engine</div>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      backend-ready
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mainCategoryCards.map((category) => (
                      <span
                        key={category.id}
                        className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/75"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute -right-3 top-12 hidden h-20 w-20 rounded-full border border-cyan-300/20 bg-cyan-300/10 blur-sm lg:block" />
              <div className="absolute -left-4 bottom-8 hidden h-28 w-28 rounded-full border border-violet-300/20 bg-violet-300/10 blur-sm lg:block" />
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="section-shell pb-10">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Category system</div>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Discover the categories driving the network</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              Categories are rendered dynamically from the backend so creator onboarding, campaign briefs, and admin filters all speak the same language.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(spotlightCategories.length ? spotlightCategories : []).map((category) => (
              <div
                key={category.id}
                className="group rounded-[1.75rem] border border-white/10 bg-[#0e1731]/70 p-5 transition hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${category.accentFrom || '#8b5cf6'}, ${category.accentTo || '#22d3ee'})`
                  }}
                >
                  {renderIcon(category.iconKey)}
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-white">{category.name}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">{category.mainCategoryName}</div>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-bold text-white/80">
                    {loading ? '...' : `${category.count.toLocaleString('en-IN')}+`}
                  </div>
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-300">
                  Built for high-intent collaborations across viral content, community, and creator-led growth.
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="ecosystem" className="section-shell py-10">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Who belongs here</div>
            <h2 className="mt-2 text-3xl font-black text-white">One network, four creator-powered surfaces</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              ViralMantrix is not a cold corporate roster. It is a layered ecosystem for creators, meme culture, fandoms, local communities, and brands that want relevance.
            </p>

            <div className="mt-8 space-y-3">
              {mainCategoryCards.map((category) => (
                <div
                  key={category.id}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                      style={{
                        background: `linear-gradient(135deg, ${category.accentFrom || '#8b5cf6'}, ${category.accentTo || '#22d3ee'})`
                      }}
                    >
                      {renderIcon(category.iconKey)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="text-base font-bold text-white">{category.name}</div>
                        <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                          {category.microCategoryCount} micro categories
                        </span>
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-300">{category.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Product flow</div>
              <h3 className="mt-2 text-2xl font-black text-white">How the ecosystem moves</h3>
              <div className="mt-6 space-y-4">
                {ecosystemFlows.map((flow, index) => (
                  <div key={flow.title} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-black text-cyan-300">
                        0{index + 1}
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">{flow.title}</div>
                        <div className="mt-1 text-sm leading-7 text-slate-300">{flow.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Build direction</div>
              <h3 className="mt-2 text-2xl font-black text-white">What this redesign is optimizing for</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {interactionHighlights.map((item) => (
                  <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell pb-20 pt-8">
        <div className="glass-panel rounded-[2.4rem] border border-violet-300/10 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Start now</div>
              <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">Launch briefs, onboard creators, and make the network feel alive.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Whether you're a brand building a campaign or a creator building momentum, ViralMantrix is being rebuilt to feel like a premium social-tech product from the first click.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('registration')}
                className="magnetic-button rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-900"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => navigate('explore-influencers')}
                className="rounded-full border border-white/10 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Explore creators
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
