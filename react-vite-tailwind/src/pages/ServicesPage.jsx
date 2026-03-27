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
            Comprehensive platform solutions designed for influencers to showcase their talent 
            and grow their careers
          </p>
        </div>

        {/* Platform Overview (independent section) */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: config.text_color }}>
              Platform Overview
            </h2>
            <p className="text-center max-w-3xl mx-auto text-gray-600 mb-6">
              Our platform brings together creators and brands with a modern, secure, and data-driven experience. From campaign management to payment reconciliation,
              we provide an end-to-end toolkit that helps influencers grow sustainably while keeping operations simple and transparent.
            </p>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Campaigns', desc: 'Create, manage, and measure brand collaborations with intuitive workflows.' },
                { title: 'Payments', desc: 'Fast, reliable payouts with clear transaction records and protections.' },
                { title: 'Insights', desc: 'Actionable analytics to optimize content performance and audience growth.' }
              ].map((item, idx) => (
                <div key={idx} className="p-6">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: config.text_color }}>{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service Categories - Influencer focused */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-10 text-white hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold">Influencer Services</h2>
                <p className="text-white/90 mt-2 max-w-3xl">Tailored tools for creators to scale their content business: find brand deals, track performance, manage campaigns, and receive secure payouts — all in one place.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { icon: '🤝', title: 'Brand Partnerships', desc: 'Match with vetted brands and streamlined campaign workflows.' },
                { icon: '📈', title: 'Audience Analytics', desc: 'Deep insights into follower growth, reach, and engagement.' },
                { icon: '💰', title: 'Monetization Tools', desc: 'Multiple revenue options and fast, transparent payouts.' },
                { icon: '📱', title: 'Content Tools', desc: 'Scheduling, collaboration, and creative resources.' }
              ].map((svc, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{svc.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{svc.title}</h3>
                      <p className="text-white/90 text-sm mt-1">{svc.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button onClick={() => navigate('services-influencers')} className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
                Explore Influencer Services
              </button>
            </div>
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
              Whether you're an influencer looking to amplify your reach or a content creator ready to 
              showcase your talent, we have the right tools and services for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('influencer-registration')}
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
