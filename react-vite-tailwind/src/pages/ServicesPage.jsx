import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const ServicesPage = ({ config }) => {
  const { navigate } = useRouter();

  const services = [
    {
      icon: '🎤',
      title: 'Artist Booking',
      description: 'Book talented artists for your events, weddings, corporate functions, and special occasions.',
      features: ['Verified Artists', 'Easy Booking', 'Secure Payments', '24/7 Support']
    },
    {
      icon: '🔍',
      title: 'Artist Discovery',
      description: 'Discover and connect with artists from various categories and specializations.',
      features: ['Advanced Search', 'Category Filters', 'Artist Profiles', 'Reviews & Ratings']
    },
    {
      icon: '📅',
      title: 'Event Management',
      description: 'Complete event management solutions with artist coordination and scheduling.',
      features: ['Event Planning', 'Artist Scheduling', 'Timeline Management', 'Coordination']
    },
    {
      icon: '💼',
      title: 'Artist Promotion',
      description: 'Promote your artistic talent and grow your audience and client base.',
      features: ['Profile Showcase', 'Portfolio Display', 'Social Integration', 'Analytics']
    },
    {
      icon: '🎯',
      title: 'Custom Matching',
      description: 'AI-powered matching to find the perfect artist for your specific needs.',
      features: ['Smart Matching', 'Recommendation Engine', 'Personalized Results', 'Quick Connect']
    },
    {
      icon: '📞',
      title: 'Consultation Services',
      description: 'Professional consultation for event planning and artist selection.',
      features: ['Expert Advice', 'Planning Support', 'Budget Guidance', 'Vendor Coordination']
    }
  ];

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            Our Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive solutions for artists and event organizers
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: config.text_color }}>
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
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

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of satisfied artists and event organizers using our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('home')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Browse Artists
              </button>
              <button 
                onClick={() => navigate('auth')}
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Join as Artist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
