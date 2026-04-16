import { useState, useEffect } from 'react';
import { useRouter } from '../contexts/RouterContext';
import { heroSlides, categories } from '../data/mockData';

const HeroSlider = ({ config }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { navigate } = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative pt-20 lg:pt-24 overflow-hidden">
      <div className="relative min-h-[500px] lg:min-h-[600px]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-10`} />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div className="space-y-6 animate-fadeIn">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 font-medium">
                    <span className="text-lg">{slide.emoji}</span>
                    New: AI-Powered Matching
                  </div>
                  <h1 
                    className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight"
                    style={{ color: config.text_color, fontFamily: config.font_family }}
                  >
                    {config.hero_title}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 max-w-lg">
                    {config.hero_subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button 
                      onClick={() => navigate('category', { category: categories[0] })}
                      className="px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105 text-sm sm:text-base"
                      style={{ backgroundColor: config.primary_action }}
                    >
                      {config.cta_button_text}
                    </button>
                    <button className="px-6 py-3 sm:px-8 sm:py-4 rounded-full font-semibold border-2 border-gray-300 hover:border-brand-500 hover:text-brand-600 transition-all text-sm sm:text-base">
                      Watch Demo
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4">
                    <div className="flex gap-1 sm:gap-2">
                      {['�', '👨', '🤖', '📸'].map((emoji, i) => (
                        <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center text-lg sm:text-xl shadow-sm hover:shadow-md transition-shadow relative z-20">
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="font-bold text-gray-900 text-sm sm:text-base">10,000+ Influencers</div>
                      <div className="text-xs sm:text-sm text-gray-500">Joined this month</div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center lg:flex">
                  <div className="relative">
                    <div className="w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 opacity-20 blur-3xl absolute -inset-10" />
                    
                    <div>
                      <img src='/hero.png' alt='Hero'/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-brand-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
