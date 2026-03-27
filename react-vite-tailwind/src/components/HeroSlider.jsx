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
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 animate-fadeIn">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 font-medium">
                    <span className="text-lg">{slide.emoji}</span>
                    New: AI-Powered Matching
                  </div>
                  <h1 
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                    style={{ color: config.text_color, fontFamily: config.font_family }}
                  >
                    {config.hero_title}
                  </h1>
                  <p className="text-lg lg:text-xl text-gray-600 max-w-lg">
                    {config.hero_subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => navigate('category', { category: categories[0] })}
                      className="px-8 py-4 rounded-full font-semibold text-white shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                      style={{ backgroundColor: config.primary_action }}
                    >
                      {config.cta_button_text}
                    </button>
                    <button className="px-8 py-4 rounded-full font-semibold border-2 border-gray-300 hover:border-brand-500 hover:text-brand-600 transition-all">
                      Watch Demo
                    </button>
                  </div>
                  <div className="flex items-center gap-6 pt-4">
                    <div className="flex -space-x-3">
                      {['😊', '🎨', '🎵', '📸'].map((emoji, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white flex items-center justify-center text-lg">
                          {emoji}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">10,000+ Influencers</div>
                      <div className="text-sm text-gray-500">Joined this month</div>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex justify-center">
                  <div className="relative">
                    <div className="w-80 h-80 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 opacity-20 blur-3xl absolute -inset-10" />
                    
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
