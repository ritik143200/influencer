import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import InfluencerCard from './InfluencerCard';

const TrendingInfluencers = ({ config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dbFeaturedProfiles, setDbFeaturedProfiles] = useState([]);
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001').replace(/\/$/, '');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/featured-profiles`);
        const data = await res.json();
        if (res.ok && data.success) {
          if (data.data.length > 0) {
            setDbFeaturedProfiles(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch featured profiles:', err);
      }
    };
    fetchFeatured();
  }, [API_BASE_URL]);

  const defaultFeaturedProfiles = useMemo(() => [], []);

  const featuredProfiles = useMemo(() => {
    if (dbFeaturedProfiles.length > 0) {
      return dbFeaturedProfiles.map(inf => {
        let instagramHandle = '';
        if (inf.socialLinks?.instagram) {
          // Extract handle if it's a URL, otherwise use as is
          const parts = inf.socialLinks.instagram.split('?')[0].split('/').filter(Boolean);
          instagramHandle = parts[parts.length - 1] || inf.socialLinks.instagram;
        }

        return {
          id: inf._id,
          name: inf.name,
          handle: instagramHandle || inf.name.toLowerCase().replace(/\s+/g, ''),
          followers: inf.followers || '0',
          posts: inf.posts || '0',
          category: inf.category || 'Influencer',
          verified: true, // Manual featured are considered verified
          instagramLink: inf.socialLinks?.instagram || '',
          youtubeLink: inf.socialLinks?.youtube || '',
          image: inf.image || null,
          bio: inf.bio || '',
          budget: inf.budget || ''
        };
      });
    }
    return defaultFeaturedProfiles;
  }, [dbFeaturedProfiles, defaultFeaturedProfiles]);

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
    <section id="featured-profiles" className="py-12 lg:py-16" style={{ backgroundColor: config.surface_color }}>
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
              <InfluencerCard 
                p={p} 
                config={config} 
                navigate={navigate} 
                initials={initials} 
              />
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
