import React, { useMemo, useState } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { categories, influencers } from '../data/mockData';

const ExploreInfluencersPage = ({ config }) => {
  const { navigate } = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const visibleCategories = useMemo(() => {
    const names = Array.from(new Set(categories.map(c => c.name)));
    return ['All', ...names];
  }, []);

  const filteredInfluencers = useMemo(() => {
    const list = selectedCategory === 'All'
      ? influencers
      : influencers.filter(i => (i.category || '').toLowerCase() === selectedCategory.toLowerCase());

    return [...list].sort((a, b) => {
      const aTrending = a.trending ? 1 : 0;
      const bTrending = b.trending ? 1 : 0;
      if (bTrending !== aTrending) return bTrending - aTrending;

      const aVerified = a.verified ? 1 : 0;
      const bVerified = b.verified ? 1 : 0;
      if (bVerified !== aVerified) return bVerified - aVerified;

      return (b.rating || 0) - (a.rating || 0);
    }).slice(0, 6);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen pt-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-orange-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: config.text_color }}>
                Explore Top Influencers
              </h1>
              <p className="mt-2 text-gray-600">
                Browse a curated selection of top creators. Filter by category to keep the results clean and focused.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition-colors text-sm font-semibold"
              style={{ color: config.text_color }}
            >
              Back
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {visibleCategories.map(name => {
              const active = name === selectedCategory;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSelectedCategory(name)}
                  className={
                    active
                      ? 'px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg'
                      : 'px-4 py-2 rounded-full text-sm font-semibold border border-gray-200 bg-white/70 backdrop-blur hover:bg-white transition-colors'
                  }
                  style={active ? { backgroundColor: config.primary_action } : { color: config.text_color }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInfluencers.map(inf => (
            <div
              key={inf.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${config.primary_action}15` }}
                    >
                      {inf.image || '✨'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate">{inf.name}</h3>
                        {inf.verified && (
                          <span
                            className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                            style={{ backgroundColor: `${config.primary_action}15`, color: config.primary_action }}
                          >
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{inf.specialty}</p>
                    </div>
                  </div>
                  {inf.trending && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                      Trending
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${config.primary_action}10`, color: config.primary_action }}
                  >
                    {inf.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-100">
                    {inf.price}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{inf.rating}</span>
                    <span className="text-sm text-gray-500">({inf.reviews} reviews)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('inquiry')}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: config.primary_action }}
                  >
                    Hire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredInfluencers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600 font-medium">No influencers found for this category.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ExploreInfluencersPage;
