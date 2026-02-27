import { useRef } from 'react';
import ArtistCard from './ArtistCard';
import { useRouter } from '../contexts/RouterContext';
import { artists } from '../data/mockData';

const CategorySection = ({ category, config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();
  const categoryArtists = artists.filter(a => a.category === category.name);

  if (categoryArtists.length === 0) return null;

  return (
    <section className="py-10 lg:py-14" style={{ backgroundColor: config.surface_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl shadow-lg`}>
              {category.icon}
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold" style={{ color: config.text_color }}>
                {category.name}
              </h2>
              <p className="text-sm text-gray-500">{category.count.toLocaleString()} artists</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('category', { category })}
            className="text-sm font-semibold hover:underline transition-colors"
            style={{ color: config.primary_action }}
          >
            View All →
          </button>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
        >
          {categoryArtists.map((artist, index) => (
            <div 
              key={artist.id}
              className="animate-slideIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ArtistCard artist={artist} config={config} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
