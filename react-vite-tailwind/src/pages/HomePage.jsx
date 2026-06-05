import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  Heart,
  Instagram,
  MapPin,
  Menu,
  RadioTower,
  Star,
  Users
} from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';
import { API_BASE_URL } from '../data/config';

const categories = [
  {
    title: 'Influencers',
    icon: Users,
    tone: 'from-[#000000] via-[#0D0D0D] to-[#222222]'
  },
  {
    title: 'Celebrities',
    icon: Star,
    tone: 'from-[#000000] via-[#0D0D0D] to-[#0D0D0D]'
  },
  {
    title: 'Meme Pages',
    icon: RadioTower,
    tone: 'from-[#000000] via-[#0D0D0D] to-[#0D0D0D]'
  },
  {
    title: 'City Pages',
    icon: MapPin,
    tone: 'from-[#000000] via-[#0D0D0D] to-[#0D0D0D]'
  }
];

const fallbackProfiles = [
  {
    id: 'ayushi-sikarwar',
    name: 'Ayushi Sikarwar',
    category: 'Lifestyle & Travel',
    followers: '1.2M',
    engagement: '120 posts',
    image: 'https://picsum.photos/seed/ayushi/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'pooja-patel',
    name: 'Pooja Patel',
    category: 'Fashion & Beauty',
    followers: '850K',
    engagement: '310 posts',
    image: 'https://picsum.photos/seed/pooja/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'rohan-sharma',
    name: 'Rohan Sharma',
    category: 'Fitness & Health',
    followers: '520K',
    engagement: '85 posts',
    image: 'https://picsum.photos/seed/rohan/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'ananya-iyer',
    name: 'Ananya Iyer',
    category: 'Food & Cooking',
    followers: '980K',
    engagement: '412 posts',
    image: 'https://picsum.photos/seed/ananya/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'kabir-mehta',
    name: 'Kabir Mehta',
    category: 'Technology & Gadgets',
    followers: '1.5M',
    engagement: '150 posts',
    image: 'https://picsum.photos/seed/kabir/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'sneha-reddy',
    name: 'Sneha Reddy',
    category: 'Finance & Growth',
    followers: '640K',
    engagement: '95 posts',
    image: 'https://picsum.photos/seed/sneha/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'vikram-singh',
    name: 'Vikram Singh',
    category: 'Comedy & Vlogs',
    followers: '2.1M',
    engagement: '520 posts',
    image: 'https://picsum.photos/seed/vikram/400/400.jpg',
    instagramLink: 'https://instagram.com'
  },
  {
    id: 'dia-kapoor',
    name: 'Dia Kapoor',
    category: 'Art & Craft',
    followers: '430K',
    engagement: '108 posts',
    image: 'https://picsum.photos/seed/dia/400/400.jpg',
    instagramLink: 'https://instagram.com'
  }
];

const getFeaturedNameKey = (name = '') => String(name).trim().replace(/\s+/g, ' ').toLowerCase();

const normalizeProfile = (profile) => {
  const instagramLink = profile?.socialLinks?.instagram || profile?.instagramLink || '';
  return {
    id: profile?._id || profile?.id || profile?.name,
    name: profile?.name || 'Creator',
    category: profile?.category || 'Creator',
    followers: profile?.followers || '0',
    engagement: profile?.engagementRate || profile?.engagement || (profile?.posts ? `${profile.posts} posts` : 'Verified'),
    image: profile?.image || profile?.profileImage || '',
    instagramLink
  };
};

const makeImageUrl = (image) => {
  if (!image) return '';
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL}/${String(image).replace(/^\/+/, '')}`;
};

const OrbitBadge = ({ icon: Icon, label, className, delay = 0, tone = 'from-[#814AC8] to-[#DF7AFE]' }) => (
  <motion.div
    animate={{ y: [0, -8, 0], x: [0, 4, 0], scale: [1, 1.035, 1] }}
    transition={{ duration: 7.2, delay, repeat: Infinity, ease: 'easeInOut' }}
    className={`absolute z-20 flex origin-center scale-[0.68] items-center gap-1.5 rounded-full border border-[#FFFFFFBF]/35 bg-[#0D0D0D]/78 px-2 py-1.5 shadow-[0_20px_55px_rgba(20,16,32,0.38)] backdrop-blur-xl sm:scale-100 sm:gap-2 sm:px-3 sm:py-2 ${className}`}
  >
    <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${tone} text-white shadow-[0_12px_24px_rgba(223,122,254,0.22)] sm:h-10 sm:w-10`}>
      <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.2} />
    </span>
    <span className="hidden text-[0.62rem] font-semibold text-[#FFFFFF] min-[430px]:inline sm:text-xs">{label}</span>
  </motion.div>
);

const ViralMascot = ({ compact = false }) => {
  const idSuffix = compact ? 'Compact' : 'Full';
  const shellId = `vmShell${idSuffix}`;
  const bodyId = `vmBody${idSuffix}`;
  const limbId = `vmLimb${idSuffix}`;
  const markId = `vmMark${idSuffix}`;
  const faceGlowId = `vmFaceGlow${idSuffix}`;
  const shadowId = `vmShadow${idSuffix}`;
  const softGlowId = `vmSoftGlow${idSuffix}`;

  return (
  <div className="relative mx-auto h-[245px] w-full max-w-[310px] sm:h-[430px] sm:max-w-[640px] lg:h-[410px] lg:max-w-[600px]">
    <div className="absolute inset-0 rounded-[46%] bg-[radial-gradient(circle_at_50%_48%,rgba(244,240,239,0.2),rgba(0,153,255,0.20)_34%,transparent_64%)]" />
    <div className="absolute left-1/2 top-[48%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FFFFFF]/24 sm:h-[390px] sm:w-[390px] lg:h-[430px] lg:w-[430px]" />
    <div className="absolute left-[22%] top-[54%] h-[2px] w-[48%] rounded-full bg-[linear-gradient(90deg,transparent,#0099FF,#DF7AFE,transparent)] shadow-[0_0_26px_rgba(223,122,254,0.55)]" />

    {!compact ? (
      <>
        <OrbitBadge icon={Users} label="Creators" className="left-[6%] top-[5%] sm:left-[14%] lg:left-[13%]" />
        <OrbitBadge icon={BriefcaseBusiness} label="Brands" className="right-[4%] top-[12%] sm:right-[11%] lg:right-[8%]" delay={0.5} tone="from-[#222222] to-[#DF7AFE]" />
        <OrbitBadge icon={RadioTower} label="Meme Pages" className="right-[1%] top-[42%] sm:right-[7%] lg:right-[3%]" delay={0.9} tone="from-[#814AC8] to-[#0099FF]" />
        <OrbitBadge icon={MapPin} label="City Pages" className="left-[1%] top-[40%] sm:left-[8%] lg:left-[3%]" delay={1.2} tone="from-[#0D0D0D] to-[#0099FF]" />
        <OrbitBadge icon={Star} label="Celebrities" className="bottom-[17%] right-[8%] sm:right-[15%] lg:right-[9%]" delay={1.6} tone="from-[#222222] to-[#DF7AFE]" />
        <OrbitBadge icon={Heart} label="Communities" className="bottom-[15%] left-[5%] sm:left-[11%] lg:left-[7%]" delay={2} tone="from-[#222222] to-[#DF7AFE]" />
      </>
    ) : null}

    <div
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 ${
        compact
          ? 'left-1/2 top-[47%] w-[170px]'
          : 'left-1/2 top-[50%] w-[220px] sm:w-[360px] lg:w-[340px]'
      }`}
    >
      <motion.img
        src="/creator-aura-mascot.svg"
        alt="ViralMantrix creator mascot"
        animate={{ y: [0, -12, 0], rotate: [-0.6, 0.6, -0.6] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
        className="h-auto w-full object-contain drop-shadow-[0_30px_70px_rgba(223,122,254,0.34)]"
      />
    </div>

    <div
      className={`pointer-events-none absolute z-0 -translate-x-1/2 -translate-y-1/2 opacity-0 ${
        compact
          ? 'left-1/2 top-[47%] w-[150px]'
          : 'left-1/2 top-[50%] w-[190px] sm:w-[340px] lg:w-[310px]'
      }`}
    >
    <motion.div
      animate={{ y: [0, -12, 0], rotate: [-0.8, 0.8, -0.8] }}
      transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
      className="w-full"
    >
      <svg viewBox="0 0 620 620" className="h-auto w-full overflow-visible" role="img" aria-label="ViralMantrix mascot">
        <defs>
          <linearGradient id={shellId} x1="165" x2="450" y1="120" y2="330" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.45" stopColor="#FFFFFFBF" />
            <stop offset="1" stopColor="#222222" />
          </linearGradient>
          <linearGradient id={bodyId} x1="185" x2="458" y1="335" y2="545" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.47" stopColor="#0099FF" />
            <stop offset="1" stopColor="#DF7AFE" />
          </linearGradient>
          <linearGradient id={limbId} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#222222" />
          </linearGradient>
          <linearGradient id={markId} x1="242" x2="373" y1="204" y2="264" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.38" stopColor="#DF7AFE" />
            <stop offset="1" stopColor="#0099FF" />
          </linearGradient>
          <radialGradient id={faceGlowId} cx="0.35" cy="0.25" r="0.85">
            <stop stopColor="#FFFFFF" stopOpacity="0.26" />
            <stop offset="0.55" stopColor="#0D0D0D" stopOpacity="0.22" />
            <stop offset="1" stopColor="#000000" />
          </radialGradient>
          <filter id={shadowId} x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="28" stdDeviation="34" floodColor="#000000" floodOpacity="0.42" />
            <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#DF7AFE" floodOpacity="0.20" />
          </filter>
          <filter id={softGlowId} x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.58" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="1.5">
          <path d="M116 419C200 268 364 220 520 290" fill="none" />
          <path d="M170 526C190 372 330 194 540 250" fill="none" opacity="0.45" />
          <path d="M505 236C551 315 552 421 489 500" fill="none" opacity="0.35" />
        </g>

        <ellipse cx="314" cy="536" rx="188" ry="32" fill="#DF7AFE" opacity="0.22" filter={`url(#${softGlowId})`} />
        <ellipse cx="314" cy="526" rx="160" ry="23" fill="none" stroke="#DF7AFE" strokeWidth="11" opacity="0.74" />
        <ellipse cx="314" cy="526" rx="122" ry="13" fill="#FFFFFF" opacity="0.14" />

        <g filter={`url(#${shadowId})`}>
          <path
            d="M176 305C176 218 236 158 314 158C392 158 452 218 452 305"
            fill="none"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="28"
            opacity="0.86"
          />
          <rect x="186" y="145" width="256" height="178" rx="78" fill={`url(#${shellId})`} />
          <rect x="219" y="174" width="190" height="110" rx="42" fill={`url(#${faceGlowId})`} />
          <path d="M247 214C268 201 300 198 329 205" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="9" opacity="0.12" />
          <text
            x="314"
            y="248"
            dominantBaseline="middle"
            fill={`url(#${markId})`}
            fontFamily="Poppins, Arial, sans-serif"
            fontSize="54"
            fontWeight="800"
            letterSpacing="-8"
            textAnchor="middle"
          >
            VM
          </text>

          <path
            d="M196 342C207 311 238 296 314 296C390 296 421 311 432 342L455 455C464 499 433 532 389 532H239C195 532 164 499 173 455L196 342Z"
            fill={`url(#${bodyId})`}
          />
          <path d="M224 355C260 336 368 334 405 357" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="10" opacity="0.20" />
          <rect x="132" y="355" width="58" height="142" rx="29" fill={`url(#${limbId})`} transform="rotate(-26 161 426)" />
          <rect x="430" y="355" width="58" height="142" rx="29" fill={`url(#${limbId})`} transform="rotate(26 459 426)" />
          <rect x="243" y="470" width="58" height="102" rx="29" fill={`url(#${limbId})`} />
          <rect x="319" y="470" width="58" height="102" rx="29" fill={`url(#${limbId})`} />
          <text
            x="314"
            y="456"
            dominantBaseline="middle"
            fill="#FFFFFF"
            fontFamily="Poppins, Arial, sans-serif"
            fontSize="28"
            fontWeight="800"
            letterSpacing="-4"
            opacity="0.62"
            textAnchor="middle"
          >
            VM
          </text>
        </g>
      </svg>
    </motion.div>
    </div>
  </div>
  );
};

const MobileXtractLanding = ({ navigate, menuOpen, setMenuOpen, profiles, profilesLoading, openInstagram }) => (
  <main className="min-h-screen overflow-hidden bg-[#000] text-white md:hidden">
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_8%,rgba(223,122,254,0.24),transparent_34%),radial-gradient(circle_at_12%_16%,rgba(0,153,255,0.16),transparent_32%),linear-gradient(180deg,#000_0%,#070707_50%,#000_100%)]" />
      <div className="absolute left-[-22%] top-[18%] h-64 w-64 rounded-full bg-[#814AC8]/24 blur-3xl" />
      <div className="absolute right-[-22%] top-[4%] h-72 w-72 rounded-full bg-[#DF7AFE]/18 blur-3xl" />

      <nav className="relative z-30 border-b border-white/10 bg-black/72 px-5 py-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-xs font-black tracking-[-0.16em] text-black shadow-[0_18px_44px_rgba(223,122,254,0.18)]">
              VM
            </span>
            <span className="text-lg font-black uppercase tracking-[-0.08em]">ViralMantrix</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_18px_44px_rgba(0,0,0,0.24)]"
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7" strokeWidth={2.15} />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 grid gap-2 rounded-[1.4rem] border border-white/10 bg-[#0D0D0D]/95 p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="rounded-2xl bg-white px-4 py-3 text-left text-sm font-black text-black"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('auth');
                }}
                className="rounded-2xl bg-white/[0.06] px-4 py-3 text-left text-sm font-black text-white"
              >
                Login
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section className="relative z-10 px-5 pb-12 pt-10">
        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[0.7rem] font-black uppercase tracking-[0.22em] text-[#DF7AFE]">
            Creator Network
          </div>
          <h1 className="max-w-[22rem] overflow-visible text-[clamp(2.55rem,11.8vw,3.45rem)] font-black leading-[1.08] tracking-[-0.055em]">
            Creators & brands
            <span className="block overflow-visible pb-4 pt-1 leading-[1.14] bg-[linear-gradient(90deg,#fff,#DF7AFE,#0099FF)] bg-clip-text text-transparent">
              go viral.
            </span>
          </h1>
          <p className="mt-6 max-w-[21rem] text-[1.05rem] font-semibold leading-7 text-white/72">
            Connect. Collaborate. Grow.
            <span className="block">All in one creator ecosystem.</span>
          </p>

          <div className="mt-8 grid w-[calc(100vw-40px)] max-w-[350px] grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate('inquiry')}
              className="inline-flex h-12 min-w-0 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#814AC8,#DF7AFE)] px-2 text-[0.68rem] font-black text-white shadow-[0_22px_54px_rgba(223,122,254,0.24)]"
            >
              Hire Influencer
            </button>
            <button
              type="button"
              onClick={() => navigate('auth')}
              className="inline-flex h-12 min-w-0 items-center justify-center rounded-lg border border-white/12 bg-black/72 px-2 text-[0.68rem] font-black text-white shadow-[0_18px_46px_rgba(0,0,0,0.22)] backdrop-blur-xl"
            >
              Influencer Login
            </button>
          </div>
        </motion.div>

        <div className="relative mt-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-3 shadow-[0_34px_90px_rgba(0,0,0,0.36)]">
          <div className="h-[276px] overflow-hidden rounded-[1.55rem] bg-[radial-gradient(circle_at_50%_46%,rgba(223,122,254,0.24),transparent_44%),linear-gradient(180deg,#0D0D0D,#000)]">
            <div className="translate-y-[4px] scale-[1.02] py-2">
              <ViralMascot compact />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            ['Discover', 'Creators'],
            ['Collaborate', 'Campaigns'],
            ['Grow', 'Reach'],
            ['Manage', 'Dashboards']
          ].map(([title, text]) => (
            <div key={title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-xl">
              <div className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#DF7AFE]">{title}</div>
              <div className="mt-1 text-sm font-bold text-white/72">{text}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-5 pb-12">
        <div className="mb-5 text-[0.74rem] font-black uppercase tracking-[0.25em] text-[#DF7AFE]">Explore</div>
        <h2 className="text-5xl font-black leading-none tracking-[-0.08em]">Categories</h2>
        <div className="mt-6 grid gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.title}
                type="button"
                onClick={() => navigate('inquiry')}
                className="flex min-h-[108px] items-center justify-between rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-left shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl"
              >
                <span className="text-2xl font-black tracking-[-0.05em]">{category.title}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-black">
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 px-5 pb-16">
        <div className="mb-5 text-[0.74rem] font-black uppercase tracking-[0.25em] text-[#DF7AFE]">Creator Network</div>
        <h2 className="text-5xl font-black leading-none tracking-[-0.08em]">Featured Creators</h2>
        <div className="mt-6 grid gap-4">
          {profilesLoading ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-sm font-bold text-white/64">Loading creators...</div>
          ) : profiles.length ? (
            profiles.slice(0, 8).map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => openInstagram(profile.instagramLink)}
                className="flex items-center gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4 text-left backdrop-blur-xl"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] bg-white/[0.08]">
                  {profile.image ? (
                    <img src={makeImageUrl(profile.image)} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-[linear-gradient(135deg,#814AC8,#DF7AFE)] text-xl font-black">
                      {profile.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-black tracking-[-0.04em]">{profile.name}</div>
                  <div className="mt-1 text-sm font-bold text-white/64">{profile.category}</div>
                  <div className="mt-3 flex gap-2 text-[0.72rem] font-black text-white/72">
                    <span className="rounded-full bg-white/[0.08] px-3 py-1">{profile.followers}</span>
                    <span className="rounded-full bg-white/[0.08] px-3 py-1">{profile.engagement}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-5 text-sm font-bold text-white/64">
              Creators will appear here after profiles are added.
            </div>
          )}
        </div>
      </section>
    </div>
  </main>
);

const LandingPage = () => {
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState(fallbackProfiles);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroDrift = useTransform(scrollYProgress, [0, 0.35], [0, -28]);
  const heroScale = useTransform(scrollYProgress, [0, 0.35], [1, 1.02]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      wheelMultiplier: 0.85
    });

    let frameId;
    const raf = (time) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/featured-profiles`);
        const data = await response.json();
        if (!ignore && response.ok && data.success && Array.isArray(data.data)) {
          const publicProfiles = data.data
            .map(normalizeProfile)
            .slice(0, 8);
          setProfiles(publicProfiles.length ? publicProfiles : fallbackProfiles);
        }
      } catch {
        if (!ignore) setProfiles(fallbackProfiles);
      } finally {
        if (!ignore) setProfilesLoading(false);
      }
    };

    fetchProfiles();
    return () => {
      ignore = true;
    };
  }, []);

  const navItems = [
    { label: 'Home', action: () => scrollToSection('hero') },
    { label: 'Hire Influencer', action: () => navigate('inquiry'), featured: true }
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openInstagram = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <MobileXtractLanding
      navigate={navigate}
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      profiles={profiles}
      profilesLoading={profilesLoading}
      openInstagram={openInstagram}
    />
    <main className="hidden min-h-screen overflow-hidden bg-[#000] text-[#FFFFFF] md:block">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#0D0D0D] bg-[#000000]/78 shadow-[0_18px_50px_rgba(20,16,32,0.34)] backdrop-blur-2xl">
        <div className="mx-auto flex h-[58px] max-w-[1760px] items-center justify-between gap-3 px-4 lg:h-[76px] lg:px-14">
          <button type="button" onClick={() => scrollToSection('hero')} className="shrink-0 text-base font-semibold text-[#FFFFFF] lg:text-lg">
            ViralMantrix
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-[#FFFFFFBF]/30 bg-[#0D0D0D]/70 p-1.5 shadow-[0_16px_42px_rgba(223,122,254,0.10)] md:flex xl:gap-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className={`h-11 rounded-full px-4 text-sm font-semibold transition xl:px-5 ${
                  item.featured
                    ? 'bg-[#DF7AFE] text-white shadow-[0_12px_24px_rgba(223,122,254,0.24)] hover:bg-[#814AC8]'
                    : 'text-[#FFFFFF] hover:bg-[#0D0D0D]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-[#FFFFFFBF]/35 bg-[#0D0D0D]/72 px-4 text-sm font-semibold text-[#FFFFFF] shadow-[0_16px_42px_rgba(223,122,254,0.10)] transition hover:bg-[#0D0D0D] xl:px-5"
            >
              Sign Up / Login as Influencer
              <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} strokeWidth={2.2} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute right-0 mt-3 w-64 rounded-[22px] border border-[#222222] bg-[#0D0D0D] p-2 shadow-[0_24px_70px_rgba(20,16,32,0.44)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('influencer-registration');
                    }}
                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#0D0D0D]"
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('auth');
                    }}
                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#0D0D0D]"
                  >
                    Login
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="absolute right-4 top-2.5 inline-flex h-9 w-[88px] shrink-0 items-center justify-center gap-1 rounded-full bg-[#DF7AFE] text-[0.68rem] font-semibold text-white md:hidden"
          >
            <span className="sm:hidden">Login</span>
            <span className="hidden sm:inline">Sign Up / Login</span>
            <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} strokeWidth={2.2} />
          </button>
        </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/35 px-4 py-2 md:hidden">
          <button type="button" onClick={() => scrollToSection('hero')} className="rounded-full bg-[#0D0D0D] px-3 py-2 text-[0.68rem] font-semibold text-[#FFFFFF]">
            Home
          </button>
          <button type="button" onClick={() => navigate('inquiry')} className="rounded-full bg-[#DF7AFE] px-3 py-2 text-[0.68rem] font-semibold text-white">
            Hire Influencer
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border-t border-[#0D0D0D] bg-[#0D0D0D] px-5 py-4 md:hidden"
            >
              <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate('influencer-registration');
                    setMenuOpen(false);
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF] hover:bg-[#0D0D0D]"
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('auth');
                    setMenuOpen(false);
                  }}
                  className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[#FFFFFF] hover:bg-[#0D0D0D]"
                >
                  Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <section id="hero" className="relative overflow-hidden pt-[98px] md:pt-[66px] lg:min-h-[calc(100vh-76px)] lg:pt-[76px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_16%,rgba(223,122,254,0.32),transparent_28%),radial-gradient(circle_at_72%_58%,rgba(139,77,216,0.34),transparent_38%),radial-gradient(circle_at_52%_48%,rgba(0,153,255,0.14),transparent_34%),linear-gradient(128deg,#000000_0%,#0D0D0D_38%,#171321_68%,#000000_100%)]" />
        <div className="absolute left-[4%] top-[20%] h-28 w-28 rounded-full bg-[#0099FF]/25 blur-3xl" />
        <div className="absolute right-[6%] top-[18%] h-36 w-36 rounded-full bg-[#DF7AFE]/30 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#000000] to-transparent" />

        <div className="relative mx-auto flex max-w-[1500px] flex-col gap-5 px-5 pb-8 pt-5 sm:gap-8 sm:px-8 md:min-h-[calc(100svh-76px)] md:py-10 lg:h-[calc(100vh-76px)] lg:max-h-[900px] lg:min-h-[680px] lg:justify-center lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative z-20 max-w-[36rem] lg:w-[46%] lg:max-w-[38rem] xl:max-w-[40rem]"
          >
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#222222,#DF7AFE_62%,#0099FF)] text-base font-extrabold tracking-[-0.16em] text-white shadow-[0_16px_36px_rgba(223,122,254,0.24)] sm:h-12 sm:w-12 sm:text-xl">
                VM
              </div>
              <span className="text-xl font-semibold tracking-[-0.05em] text-[#FFFFFF] sm:text-2xl">ViralMantrix</span>
            </div>
            <h1 className="mt-4 text-[clamp(2.35rem,11vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-[#FFFFFF] sm:mt-9 sm:text-[clamp(2.8rem,12vw,4.5rem)] lg:text-[clamp(4rem,5.35vw,5.2rem)]">
              <span className="lg:hidden">
                <span className="block">Creators &</span>
                <span className="block">brands</span>
                <span className="block bg-gradient-to-r from-[#FFFFFFBF] via-[#DF7AFE] to-[#DF7AFE] bg-clip-text text-transparent">go viral.</span>
              </span>
              <span className="hidden lg:block">
                The ecosystem where creators, brands & culture
                <span className="block bg-gradient-to-r from-[#FFFFFFBF] via-[#DF7AFE] to-[#DF7AFE] bg-clip-text text-transparent">go viral.</span>
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-sm font-medium leading-6 text-[#FFFFFF]/76 sm:mt-6 sm:text-lg sm:leading-8">
              Connect. Collaborate. Grow.
              <span className="block">All in one creator ecosystem.</span>
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('inquiry')}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#222222_0%,#814AC8_46%,#DF7AFE_100%)] px-7 py-4 text-sm font-semibold text-white shadow-[0_22px_48px_rgba(223,122,254,0.26)] transition hover:-translate-y-0.5 sm:h-13"
              >
                Hire Influencer
                <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
              </button>
              <button
                type="button"
                onClick={() => navigate('auth')}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#DF7AFE]/45 bg-[#0D0D0D]/72 px-7 py-4 text-sm font-semibold text-[#FFFFFF] shadow-[0_18px_46px_rgba(223,122,254,0.10)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#0D0D0D] sm:h-13"
              >
                Influencer Login
              </button>
            </div>
          </motion.div>

          <div className="relative z-10 mt-3 flex justify-center sm:mt-6 lg:absolute lg:right-8 lg:top-[53%] lg:mt-0 lg:w-[49%] lg:-translate-y-1/2 xl:right-16">
            <motion.div style={{ y: heroDrift, scale: heroScale }} className="w-full">
              <ViralMascot />
            </motion.div>
          </div>
        </div>

        <div className="relative border-y border-[#0D0D0D] bg-[#0D0D0D]/66 backdrop-blur-xl">
          <div className="mx-auto grid max-w-[1760px] gap-px px-6 py-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-14">
            {[
              ['Discover', 'Find creators & communities.'],
              ['Collaborate', 'Work with creators and city pages.'],
              ['Grow', 'Amplify your reach.'],
              ['Manage', 'Smart dashboards for campaigns.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl px-4 py-4">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#DF7AFE]">{title}</div>
                <div className="mt-1 text-sm font-medium text-[#FFFFFFBF]">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="relative overflow-hidden bg-[#000000] py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65 }}
            className="max-w-2xl"
          >
            <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#DF7AFE]">Explore</div>
            <h2 className="mt-3 text-4xl font-semibold leading-none text-[#FFFFFF] sm:text-5xl lg:text-6xl xl:text-7xl">
              Categories
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.title}
                  type="button"
                  onClick={() => navigate('inquiry')}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  whileHover={{ y: -10, scale: 1.015 }}
                  className={`min-h-[220px] rounded-[30px] border border-white/80 bg-gradient-to-br ${category.tone} p-6 text-left shadow-[0_24px_70px_rgba(20,16,32,0.26)] transition`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D0D0D] text-[#DF7AFE] shadow-[0_14px_34px_rgba(223,122,254,0.12)]">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </div>
                  <div className="mt-10 text-[2.35rem] font-semibold leading-none tracking-[-0.04em] text-[#FFFFFF]">{category.title}</div>
                  <div className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#DF7AFE]">
                    Explore
                    <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="profiles" className="relative overflow-hidden bg-[linear-gradient(180deg,#000000_0%,#0D0D0D_100%)] py-16 lg:py-20 xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.65 }}
              className="max-w-2xl"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.32em] text-[#DF7AFE]">Network</div>
              <h2 className="mt-3 text-4xl font-semibold leading-none text-[#FFFFFF] sm:text-5xl lg:text-6xl xl:text-7xl">
                Featured Creators
              </h2>
            </motion.div>
            <button
              type="button"
              onClick={() => navigate('explore-influencers')}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#222222] bg-[#0D0D0D] px-5 text-sm font-semibold text-[#DF7AFE] shadow-[0_18px_50px_rgba(20,16,32,0.35)]"
            >
              View all profiles
              <ArrowRight className="h-4 w-4" strokeWidth={2.3} />
            </button>
          </div>

          {profilesLoading ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-[360px] animate-pulse rounded-[32px] bg-[#0D0D0D]" />
              ))}
            </div>
          ) : profiles.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {profiles.map((profile, index) => (
                <motion.article
                  key={profile.id || `${profile.name}-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                  whileHover={{ y: -10 }}
                  className="group overflow-hidden rounded-[32px] border border-[#222222] bg-[#0D0D0D]/88 p-4 shadow-[0_24px_70px_rgba(20,16,32,0.44)] backdrop-blur-xl"
                >
                  <button
                    type="button"
                    onClick={() => openInstagram(profile.instagramLink)}
                    className="block w-full text-left"
                    disabled={!profile.instagramLink}
                  >
                    <div className="relative overflow-hidden rounded-[26px] bg-[#0D0D0D]">
                      {profile.image ? (
                        <img
                          src={makeImageUrl(profile.image)}
                          alt={profile.name}
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-64 w-full items-center justify-center bg-[linear-gradient(135deg,#0D0D0D,#222222)] text-4xl font-semibold text-[#DF7AFE]">
                          {profile.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      {profile.instagramLink ? (
                        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#DF7AFE] shadow-[0_12px_26px_rgba(41,26,68,0.12)] backdrop-blur">
                          <Instagram className="h-5 w-5" strokeWidth={2} />
                        </div>
                      ) : null}
                    </div>
                    <div className="px-2 pb-2 pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-[#FFFFFF]">{profile.name}</h3>
                          <p className="mt-1 text-sm text-[#FFFFFFBF]">{profile.category}</p>
                        </div>
                        <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-[#DF7AFE]" strokeWidth={2} />
                      </div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-[#0D0D0D] px-3 py-3">
                          <div className="text-xs text-[#FFFFFFBF]">Followers</div>
                          <div className="mt-1 text-sm font-semibold text-[#FFFFFF]">{profile.followers}</div>
                        </div>
                        <div className="rounded-2xl bg-[#0D0D0D] px-3 py-3">
                          <div className="text-xs text-[#FFFFFFBF]">Engagement</div>
                          <div className="mt-1 text-sm font-semibold text-[#FFFFFF]">{profile.engagement}</div>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[32px] border border-dashed border-[#222222] bg-[#0D0D0D] px-6 py-14 text-center shadow-[0_24px_70px_rgba(20,16,32,0.22)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0D0D0D] text-[#DF7AFE]">
                <Building2 className="h-7 w-7" strokeWidth={2} />
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-[#FFFFFF]">No featured creators yet.</h3>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#0D0D0D] bg-[#000000] px-5 py-10 text-white lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold">ViralMantrix</div>
            <div className="mt-2 text-sm text-white/62">Connecting Brands & Influencers.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollToSection('hero')} className="text-sm font-medium text-white/72 hover:text-white">
              Home
            </button>
            <button type="button" onClick={() => navigate('services')} className="text-sm font-medium text-white/72 hover:text-white">
              Services
            </button>
            <button type="button" onClick={() => navigate('contact')} className="text-sm font-medium text-white/72 hover:text-white">
              Contact
            </button>
            <button type="button" onClick={() => navigate('terms-and-condition')} className="text-sm font-medium text-white/72 hover:text-white">
              Terms & Conditions
            </button>
            <button type="button" onClick={() => navigate('inquiry')} className="text-sm font-medium text-white/72 hover:text-white">
              Hire Influencer
            </button>
            <button type="button" onClick={() => navigate('influencer-registration')} className="text-sm font-medium text-white/72 hover:text-white">
              Influencer Sign Up
            </button>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
};

export default LandingPage;

