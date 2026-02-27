import { useRef } from 'react';
import ArtistCard from './ArtistCard';
import { artists } from '../data/mockData';

const TrendingArtists = ({ config }) => {
  const scrollRef = useRef(null);
  const trendingArtists = artists.filter(a => a.trending);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: config.text_color }}>
              🔥 Trending Artists
            </h2>
            <p className="text-gray-500 mt-1">Most booked this week</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white shadow hover:shadow-md flex items-center justify-center transition-all"
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
          {trendingArtists.map((artist, index) => (
            <div 
              key={artist.id}
              className="animate-fadeIn"
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

export default TrendingArtists;
