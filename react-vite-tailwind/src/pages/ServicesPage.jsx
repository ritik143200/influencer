import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const ServicesPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive platform solutions designed for both artists and influencers to showcase their talent 
            and grow their careers
          </p>
        </div>

        {/* Service Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Artists Services Card */}
          <div 
            onClick={() => navigate('services-artists')}
            className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-8 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🎨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Artist Services</h2>
                <p className="text-white/80">For creative performers and artists</p>
              </div>
            </div>
            
            <p className="text-white/90 mb-6 leading-relaxed">
              Comprehensive services for artists including portfolio showcase, booking management, 
              secure payments, and talent discovery tools.
            </p>
            
            <div className="space-y-2">
              {[
                '🎤 Portfolio Showcase',
                '📅 Booking Management',
                '💳 Secure Payments'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
            
            <button className="mt-6 px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Explore Artist Services →
            </button>
          </div>

          {/* Influencers Services Card */}
          <div 
            onClick={() => navigate('services-influencers')}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📱</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Influencer Services</h2>
                <p className="text-white/80">For social media influencers</p>
              </div>
            </div>
            
            <p className="text-white/90 mb-6 leading-relaxed">
              Advanced platform features for influencers including brand partnerships, audience analytics, 
              monetization tools, and content creation resources.
            </p>
            
            <div className="space-y-2">
              {[
                '🤝 Brand Partnerships',
                '📈 Audience Analytics',
                '💰 Monetization Tools',
                '📱 Social Media Integration'
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
            
            <button className="mt-6 px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Explore Influencer Services →
            </button>
          </div>
        </div>

        {/* Platform Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Secure Platform',
                description: 'Advanced security measures to protect your data and ensure safe transactions.'
              },
              {
                icon: '📱',
                title: 'Mobile Optimized',
                description: 'Access all features on the go with our responsive mobile experience.'
              },
              {
                icon: '🎯',
                title: 'Smart Matching',
                description: 'AI-powered matching to connect you with the right opportunities.'
              },
              {
                icon: '💬',
                title: 'Direct Communication',
                description: 'Connect directly with clients and brands without intermediaries.'
              },
              {
                icon: '📊',
                title: 'Analytics Dashboard',
                description: 'Comprehensive insights to track your growth and performance.'
              },
              {
                icon: '🌍',
                title: 'Global Reach',
                description: 'Connect with opportunities and talent from around the world.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: config.text_color }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Choose Your Path to Success
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're an artist looking to showcase your talent or an influencer ready to 
              amplify your reach, we have the right tools and services for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('artist-registration')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started
              </button>
              <button 
                onClick={() => navigate('home')}
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Browse Talent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
