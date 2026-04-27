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
        href: 'https://www.instagram.com/justayushi__/',
        image: '/profiles/584350929_18019297550792574_1321395050260371907_n.jpg',
        bio: 'Foodie | adventurer | explorer🚀 Follow me for mouth watering eats, hidden gems, local insights and travel inspiration 📍INDORE 📩 justayushi22@gmail.com'
      },
      {
        id: 'unscripted.pooja',
        name: 'Pooja Patel',
        handle: 'unscripted.pooja',
        followers: '491K',
        posts: '408',
        category: 'Digital Creator',
        verified: true,
        href: 'https://www.instagram.com/unscripted.pooja/',
        image: '/profiles/469720261_881068083858099_1445535093418220669_n.jpg',
        bio: 'Digital content creator sharing lifestyle, fashion, and daily vlogs'
      },
      {
        id: 'drx_akshat_mishra',
        name: 'Drx Akshat Mishra',
        handle: 'drx_akshat_mishra',
        followers: '115K',
        posts: '609',
        category: 'Sports & Voice',
        verified: true,
        href: 'https://www.instagram.com/drx_akshat_mishra/',
        image: '/profiles/587307255_18335776141235669_2254666820855514781_n.jpg',
        bio: 'Sports enthusiast & voice artist creating engaging content'
      },
      {
        id: 'yourviikas',
        name: 'Vikas Choudhary',
        handle: 'yourviikas',
        followers: '718K',
        posts: '796',
        category: 'Relationship & EI',
        verified: true,
        href: 'https://www.instagram.com/yourviikas/',
        image: '/profiles/605220975_18521599786067256_6899526771075247176_n.jpg',
        bio: 'Relationship expert & emotional intelligence coach sharing valuable insights'
      },
      {
        id: 'indoreshorts',
        name: 'Indore shorts',
        handle: 'indoreshorts',
        followers: '235K',
        posts: '2,904',
        category: 'Local City Page',
        verified: true,
        href: 'https://www.instagram.com/indoreshorts/',
        image: '/profiles/467582962_510159548650448_339588672127858553_n.jpg',
        bio: 'Showcasing the best of Indore city through short videos and local updates'
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
              <div className="h-full rounded-3xl border bg-white shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group" style={{ borderColor: `${config.primary_action}18` }}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] transition-all duration-300">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
                          <img
                            src={p.image || ''}
                            alt={p.name}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `<div class="w-18 h-18 rounded-full flex items-center justify-center text-sm font-bold text-gray-900" style="background-color: ${config.primary_action}12">${initials(p.name)}</div>`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {p.handle}
                        </div>
                        <a
                          href={p.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 hover:scale-110 transition-transform"
                        >
                          <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                        {p.verified && (
                          <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2l2.39 2.95 3.78.57-2.75 2.67.66 3.76L12 10.9 8.92 13.95l.66-3.76L6.83 7.52l3.78-.57L12 2zm0 6.1L10.7 9.4l1.3 1.28 2.6-2.55-1.02-1.03L12 8.63z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 truncate">{p.name}</div>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold group-hover:shadow-md transition-shadow" style={{ backgroundColor: `${config.primary_action}10`, color: config.primary_action }}>
                          {p.followers} followers
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                          {p.posts} posts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-sm font-semibold text-gray-700">Category</div>
                    <div className="mt-1 text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{p.category}</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-gray-700">Bio</div>
                    <div className="mt-1 text-sm text-gray-600 group-hover:text-gray-800 transition-colors line-clamp-2">{p.bio}</div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm text-white text-center shadow-sm hover:shadow-lg hover:scale-105 transition-all"
                      style={{ backgroundColor: config.primary_action }}
                    >
                      View
                    </a>
                    <button
                      onClick={() => navigate('contact')}
                      className="px-4 py-2.5 rounded-2xl font-semibold text-sm border transition-all hover:shadow-md hover:scale-105"
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
