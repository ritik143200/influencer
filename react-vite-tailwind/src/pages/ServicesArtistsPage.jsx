import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const ServicesArtistsPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            Artist Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive services designed to help artists showcase their talent and grow their career
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: '🎨',
              title: 'Portfolio Showcase',
              description: 'Create a stunning digital portfolio with photos, videos, and performance samples to impress potential clients.',
              features: ['Unlimited uploads', 'HD video support', 'Custom galleries', 'Performance tracking']
            },
            {
              icon: '📅',
              title: 'Booking Management',
              description: 'Streamline your entire booking process with our intelligent scheduling and management system.',
              features: ['Calendar integration', 'Automated reminders', 'Availability settings', 'Instant notifications']
            },
            {
              icon: '💳',
              title: 'Secure Payments',
              description: 'Get paid quickly and securely with our protected payment system and transparent pricing.',
              features: ['Instant payouts', 'Payment protection', 'Multiple payment methods', 'Tax documentation']
            },
            {
              icon: '🎯',
              title: 'Talent Discovery',
              description: 'Get discovered by clients actively searching for your specific skills and artistic style.',
              features: ['Advanced search', 'Category matching', 'Skill tags', 'Promotion tools']
            },
            {
              icon: '📊',
              title: 'Performance Analytics',
              description: 'Track your growth with detailed insights about bookings, earnings, and client engagement.',
              features: ['Booking statistics', 'Earnings reports', 'Client insights', 'Growth tracking']
            }
          ].map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: config.text_color }}>
                {service.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Artist Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Supported Artist Categories
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                '🎤 Singers', '🎸 Bands', '🎵 Instrumentalists', '💃 Dancers',
                '🎭 Cultural', '🎪 Carnival', '💄 Makeup', '💪 Fitness',
                '🎨 Painters', '✏️ Sketching', '🎙️ RJs', '🗣️ Voice',
                '✍️ Writers', '🎧 DJs', '🧘 Wellness', '👗 Fashion',
                '👨‍🍳 Culinary', '🤡 Children', '✨ Special', '🔮 Visual Tech',
                '🎪 Circus', '🎬 Actors', '🎩 Magicians', '💻 Digital'
              ].map((category, index) => (
                <div 
                  key={index}
                  className="text-center p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="text-2xl mb-1">{category.split(' ')[0]}</div>
                  <div className="text-xs text-gray-600">{category.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Grow Your Artistic Career?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of artists who are already using our platform to showcase their talent 
              and connect with clients worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('artist-registration')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Register as Artist
              </button>
              <button 
                onClick={() => navigate('about')}
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesArtistsPage;
