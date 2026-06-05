import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import InfluencerCard from './InfluencerCard';
import { API_BASE_URL } from '../data/config';

const defaultFeaturedProfiles = [
  {
    id: 'ayushi-sikarwar',
    name: 'Ayushi Sikarwar',
    handle: 'ayushisikarwar',
    followers: '1.2M',
    posts: '120',
    category: 'Lifestyle & Travel',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/ayushi/400/400.jpg',
    bio: 'Travel enthusiast exploring the hidden gems of the world. Capturing stories one photo at a time.',
    budget: '₹45,000'
  },
  {
    id: 'pooja-patel',
    name: 'Pooja Patel',
    handle: 'poojapatel',
    followers: '850K',
    posts: '310',
    category: 'Fashion & Beauty',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/pooja/400/400.jpg',
    bio: 'Style curator and beauty advisor. Showing you how to dress well and feel confident every day.',
    budget: '₹35,000'
  },
  {
    id: 'rohan-sharma',
    name: 'Rohan Sharma',
    handle: 'rohansharma',
    followers: '520K',
    posts: '85',
    category: 'Fitness & Health',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/rohan/400/400.jpg',
    bio: 'Certified personal trainer and nutritionist. Helping you reach your fitness goals sustainably.',
    budget: '₹28,000'
  },
  {
    id: 'ananya-iyer',
    name: 'Ananya Iyer',
    handle: 'ananyaiyer',
    followers: '980K',
    posts: '412',
    category: 'Food & Cooking',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/ananya/400/400.jpg',
    bio: 'Recipe creator and food blogger. Quick and easy recipes that make home cooking simple and fun.',
    budget: '₹40,000'
  },
  {
    id: 'kabir-mehta',
    name: 'Kabir Mehta',
    handle: 'kabirmehta',
    followers: '1.5M',
    posts: '150',
    category: 'Technology & Gadgets',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/kabir/400/400.jpg',
    bio: 'Unboxing the latest tech, smartphones, and smart devices. Making technology easy to understand.',
    budget: '₹55,000'
  },
  {
    id: 'sneha-reddy',
    name: 'Sneha Reddy',
    handle: 'snehareddy',
    followers: '640K',
    posts: '95',
    category: 'Finance & Growth',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/sneha/400/400.jpg',
    bio: 'Personal finance tips, investment strategies, and self-growth advice. Build your wealth early.',
    budget: '₹32,000'
  },
  {
    id: 'vikram-singh',
    name: 'Vikram Singh',
    handle: 'vikramsingh',
    followers: '2.1M',
    posts: '520',
    category: 'Comedy & Vlogs',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/vikram/400/400.jpg',
    bio: 'Making you laugh with daily vlogs and comedy sketches. Spread positivity and good vibes.',
    budget: '₹75,000'
  },
  {
    id: 'dia-kapoor',
    name: 'Dia Kapoor',
    handle: 'diakapoor',
    followers: '430K',
    posts: '108',
    category: 'Art & Craft',
    verified: true,
    instagramLink: 'https://instagram.com',
    youtubeLink: '',
    image: 'https://picsum.photos/seed/dia/400/400.jpg',
    bio: 'Illustrator and craft artist. Transforming blank canvases into colorful stories and DIY guides.',
    budget: '₹25,000'
  }
];

const TrendingInfluencers = ({ config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dbFeaturedProfiles, setDbFeaturedProfiles] = useState([]);

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
  }, []);

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
  }, [dbFeaturedProfiles]);

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
