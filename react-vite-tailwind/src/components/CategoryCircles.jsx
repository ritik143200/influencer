import { useRef } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { categories } from '../data/mockData';

const CategoryCircles = ({ config }) => {
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
    <section className="py-12 lg:py-16" style={{ backgroundColor: config.surface_color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold" style={{ color: config.text_color }}>
            Browse Categories
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
          {categories.map((cat, index) => (
            <button
              key={cat.id}
              onClick={() => navigate('category', { category: cat })}
              className="flex-shrink-0 group animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-24 h-24 lg:w-28 lg:h-28 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-4xl lg:text-5xl shadow-lg group-hover:shadow-xl transition-all group-hover:scale-110`}>
                {cat.icon}
              </div>
              <div className="mt-3 text-center">
                <div className="font-semibold text-gray-900">{cat.name}</div>
                <div className="text-sm text-gray-500">{cat.count.toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCircles;
