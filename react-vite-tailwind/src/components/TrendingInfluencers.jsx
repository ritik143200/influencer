import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';

const TrendingInfluencers = ({ config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);

  const featuredProfiles = useMemo(
    () => [
      {
        id: 'justayushi__',
        name: 'Ayushi Sikarwar',
        handle: 'justayushi__',
        followers: '17.4K',
        posts: '534',
        category: 'Food & Travel',
        verified: false,
        href: 'https://www.instagram.com/justayushi__/'
      },
      {
        id: 'unscripted.pooja',
        name: 'Pooja Patel',
        handle: 'unscripted.pooja',
        followers: '491K',
        posts: '408',
        category: 'Digital Creator',
        verified: true,
        href: 'https://www.instagram.com/unscripted.pooja/'
      },
      {
        id: 'drx_akshat_mishra',
        name: 'Drx Akshat Mishra',
        handle: 'drx_akshat_mishra',
        followers: '115K',
        posts: '609',
        category: 'Sports & Voice',
        verified: true,
        href: 'https://www.instagram.com/drx_akshat_mishra/'
      },
      {
        id: 'yourviikas',
        name: 'Vikas Choudhary',
        handle: 'yourviikas',
        followers: '718K',
        posts: '796',
        category: 'Relationship & EI',
        verified: true,
        href: 'https://www.instagram.com/yourviikas/'
      },
      {
        id: 'indoreshorts',
        name: 'Indore shorts',
        handle: 'indoreshorts',
        followers: '235K',
        posts: '2,904',
        category: 'Local City Page',
        verified: true,
        href: 'https://www.instagram.com/indoreshorts/'
      }
    ],
    []
  );

  const scrollToIndex = (index) => {
    const el = scrollRef.current;
    if (!el) return;

    const child = el.children?.[index];
    if (!child) return;

    child.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };

  const scroll = (direction) => {
    const nextIndex = direction === 'left'
      ? Math.max(0, activeIndex - 1)
      : Math.min(featuredProfiles.length - 1, activeIndex + 1);

    scrollToIndex(nextIndex);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(el.children || []);
        if (!children.length) return;

        const left = el.scrollLeft;
        const distances = children.map((child) => Math.abs(child.offsetLeft - left));
        let minIndex = 0;
        let min = distances[0] ?? 0;
        for (let i = 1; i < distances.length; i += 1) {
          if (distances[i] < min) {
            min = distances[i];
            minIndex = i;
          }
        }
        setActiveIndex(minIndex);
      });
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [featuredProfiles.length]);

  const initials = (name) =>
    (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');

  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: config.surface_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2" style={{ color: config.text_color }}>
              Featured Profiles
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Discover talented influencers on our platform</p>
          </div>
          <div className="flex gap-2 justify-center sm:justify-end">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={activeIndex === 0}
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={activeIndex === featuredProfiles.length - 1}
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory"
        >
          {featuredProfiles.map((p) => (
            <div
              key={p.id}
              className="min-w-[280px] w-[280px] sm:min-w-[340px] sm:w-[340px] snap-start"
            >
              <div className="h-full rounded-3xl border bg-white shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden" style={{ borderColor: `${config.primary_action}18` }}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-gray-900" style={{ backgroundColor: `${config.primary_action}12` }}>
                            {initials(p.name)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-900 truncate">
                          {p.handle}
                        </div>
                        {p.verified && (
                          <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2l2.39 2.95 3.78.57-2.75 2.67.66 3.76L12 10.9 8.92 13.95l.66-3.76L6.83 7.52l3.78-.57L12 2zm0 6.1L10.7 9.4l1.3 1.28 2.6-2.55-1.02-1.03L12 8.63z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">{p.name}</div>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: `${config.primary_action}10`, color: config.primary_action }}>
                          {p.followers} followers
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {p.posts} posts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold text-gray-700">Category</div>
                    <div className="mt-1 text-sm text-gray-600">{p.category}</div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm text-white text-center shadow-sm hover:shadow-md transition-all"
                      style={{ backgroundColor: config.primary_action }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => navigate('contact')}
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm border transition-colors"
                      style={{ borderColor: config.primary_action, color: config.primary_action }}
                    >
                      Hire
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {featuredProfiles.map((p, i) => (
            <button
              key={p.id}
              onClick={() => scrollToIndex(i)}
              className="h-2.5 rounded-full transition-all"
              style={{
                width: i === activeIndex ? 24 : 10,
                backgroundColor: i === activeIndex ? config.primary_action : '#D1D5DB'
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 flex gap-4 justify-center">
          <button
            onClick={() => navigate('influencer-registration')}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{ backgroundColor: config.primary_action }}
          >
            Become an Influencer
          </button>
          <button
            onClick={() => navigate('registration', { type: 'user' })}
            className="px-6 py-3 rounded-xl font-semibold border transition-colors"
            style={{
              borderColor: config.primary_action,
              color: config.primary_action
            }}
          >
            Create Profile
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingInfluencers;
