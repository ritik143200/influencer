import { useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';

const CategorySection = ({ category, config }) => {
  const scrollRef = useRef(null);
  const { navigate } = useRouter();

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      });
    }
  };

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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-4"
        >
          <div className="w-full text-center py-12 px-6 rounded-2xl border" style={{ 
            backgroundColor: `${config.primary_action}08`,
            borderColor: `${config.primary_action}20`
          }}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${config.primary_action}15` }}>
              <span className="text-2xl opacity-50">🎭</span>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: config.text_color }}>
              Influencer Browsing Disabled
            </h3>
            <p className="text-sm mb-4" style={{ color: config.secondary_action }}>
              The influencer browsing functionality has been removed. Please register as an influencer or sign in to access the platform.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => navigate('influencer-registration')}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: config.primary_action,
                  color: 'white'
                }}
              >
                Register as Influencer
              </button>
              <button 
                onClick={() => navigate('registration', { type: 'user' })}
                className="px-4 py-2 rounded-lg font-semibold text-sm border transition-colors"
                style={{
                  borderColor: config.primary_action,
                  color: config.primary_action
                }}
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
