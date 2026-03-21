import { useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';

const TrendingArtists = ({ config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 lg:py-16" style={{ backgroundColor: config.surface_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2" style={{ color: config.text_color }}>
              Featured Profiles
            </h2>
            <p className="text-gray-600">Discover talented artists and influencers on our platform</p>
          </div>
          <div className="flex gap-2">
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
          <div className="w-full text-center py-16 px-8 rounded-2xl border" style={{ 
            backgroundColor: `${config.primary_action}08`,
            borderColor: `${config.primary_action}20`
          }}>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.primary_action}15` }}>
              <span className="text-3xl opacity-50">🌟</span>
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: config.text_color }}>
              Featured Profiles Coming Soon
            </h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: config.secondary_action }}>
              Our featured artists and influencers section is currently being updated. Register now to be featured when we launch our new discovery system.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('artist-registration')}
                className="px-6 py-3 rounded-xl font-semibold text-white transition-colors"
                style={{ backgroundColor: config.primary_action }}
              >
                Create Profile
              </button>
              <button 
                onClick={() => navigate('auth')}
                className="px-6 py-3 rounded-xl font-semibold border transition-colors"
                style={{
                  borderColor: config.primary_action,
                  color: config.primary_action
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingArtists;
