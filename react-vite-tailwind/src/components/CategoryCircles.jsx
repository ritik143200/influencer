import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { categories } from '../data/mockData';

const CategoryCircles = ({ config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();
  // Removed dynamic counts since artist browsing APIs are removed
  const [dynamicCounts] = useState({});

  const normalizeCategoryName = (value) => String(value || '').trim().toLowerCase();

  // Removed API fetching since artist browsing functionality is removed

  const resolvedCategories = useMemo(
    () =>
      categories.map((category) => {
        const key = normalizeCategoryName(category.name);
        const dynamicCount = dynamicCounts[key];
        return {
          ...category,
          count: typeof dynamicCount === 'number' ? dynamicCount : category.count
        };
      }),
    [dynamicCounts]
  );

  const totalArtists = resolvedCategories.reduce((total, category) => total + category.count, 0);

  const quickHighlights = [
    {
      id: 'verified',
      icon: '🛡️',
      title: 'Trusted Profiles',
      description: 'work with verified influencers with clear audience and engagement.'
    },
    {
      id: 'fast',
      icon: '⚡',
      title: 'Faster Discovery',
      description: 'lanuch campaigns quickly and connect with the real creators.'
    },
    {
      id: 'connect',
      icon: '🤝',
      title: 'Direct Connections',
      description: 'brands and influencers cannect easily for smooth deals.'
    }
  ];

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: config.surface_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: config.text_color }}>
            Influencer Categories
          </h2>
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
        >
          {resolvedCategories.map((cat, index) => (
            <div
              key={cat.id}
              className="flex-shrink-0 group animate-fadeIn opacity-75 cursor-not-allowed"
              style={{ animationDelay: `${index * 0.05}s` }}
              title="Artist browsing functionality has been disabled"
            >
              <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-4xl lg:text-5xl shadow-lg transition-all group-hover:scale-110`}>
                {cat.icon}
              </div>
              <div className="mt-3 text-center">
                <div className="font-semibold text-gray-900">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-10 lg:mt-12 rounded-3xl p-6 lg:p-8 border"
          style={{
            background: `linear-gradient(135deg, ${config.primary_action}12 0%, ${config.surface_color} 45%, ${config.secondary_action}10 100%)`,
            borderColor: `${config.primary_action}25`,
            boxShadow: `0 18px 40px -28px ${config.primary_action}66`
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="text-center lg:text-left">
              <p
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ color: config.secondary_action }}
              >
                Influencer Platform
              </p>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mt-2" style={{ color: config.text_color }}>
                Connect with talented Influencers
              </h3>
              <p className="text-sm lg:text-base mt-2" style={{ color: config.secondary_action }}>
                 brands can find the right influencers for campaigns, and influencers can  get real collaboration oporunities.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end">
              <span
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border"
                style={{
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                  borderColor: `${config.secondary_action}30`
                }}
              >
                {/* {resolvedCategories.length}  */}
                30+ Categories
              </span>
              <span
                className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border"
                style={{
                  backgroundColor: config.surface_color,
                  color: config.text_color,
                  borderColor: `${config.primary_action}35`
                }}
              >
                {totalArtists.toLocaleString()} Influencers
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {quickHighlights.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl p-4 sm:p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: config.surface_color,
                  border: `1px solid ${config.secondary_action}22`
                }}
              >
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3"
                  style={{ backgroundColor: `${config.primary_action}14` }}
                >
                  {item.icon}
                </div>
                <h4 className="font-semibold text-sm sm:text-base mb-2" style={{ color: config.text_color }}>
                  {item.title}
                </h4>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: config.secondary_action }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryCircles;
