import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const ServicesInfluencersPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            Influencer Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive platform services designed to help influencers grow their brand and monetize their content
          </p>
        </div>

        {/* Platform Overview (independent section) */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: config.text_color }}>
              Platform Overview
            </h2>
            <p className="text-center max-w-3xl mx-auto text-gray-600 mb-6">
              Our influencer toolkit centralizes campaign workflows, analytics, and payments in a single, secure platform. We help creators streamline collaborations, understand performance, and scale monetization with transparency.
            </p>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Campaign Management', desc: 'Create, track, and optimize brand campaigns with easy briefs and centralized assets.' },
                { title: 'Payouts & Finance', desc: 'Reliable payouts, clear transaction history, and tax-ready reports.' },
                { title: 'Creator Insights', desc: 'Actionable analytics to improve reach, engagement, and conversion.' }
              ].map((item, idx) => (
                <div key={idx} className="p-6">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: config.text_color }}>{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              icon: '🤝',
              title: 'Brand Partnerships',
              description: 'Connect with top brands for sponsored content, collaborations, and long-term partnerships.',
              features: ['Brand matching', 'Campaign management', 'Negotiation support', 'Partnership tracking']
            },
            {
              icon: '📈',
              title: 'Audience Analytics',
              description: 'Deep insights into your audience demographics, engagement rates, and content performance.',
              features: ['Real-time analytics', 'Audience demographics', 'Engagement tracking', 'Content insights']
            },
            {
              icon: '💰',
              title: 'Monetization Tools',
              description: 'Multiple revenue streams including sponsorships, affiliate marketing, and content monetization.',
              features: ['Sponsorship deals', 'Affiliate programs', 'Content monetization', 'Revenue tracking']
            },
            {
              icon: '📱',
              title: 'Social Media Integration',
              description: 'Seamlessly connect all your social platforms and manage your presence from one dashboard.',
              features: ['Multi-platform sync', 'Cross-posting', 'Unified messaging', 'Profile management']
            },
            {
              icon: '🎨',
              title: 'Content Creation Tools',
              description: 'Professional tools, templates, and resources to create compelling content that converts.',
              features: ['Content templates', 'Design tools', 'Video editing', 'Asset library']
            },
            {
              icon: '📊',
              title: 'Performance Tracking',
              description: 'Monitor your growth, engagement metrics, and campaign performance with detailed reports.',
              features: ['Growth analytics', 'Campaign reports', 'ROI tracking', 'Performance benchmarks']
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

        {/* Influencer Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Supported Influencer Categories
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                '👗 Fashion', '🌟 Lifestyle', '💄 Beauty', '💪 Fitness',
                '✈️ Travel', '🍕 Food', '💻 Technology', '🎮 Gaming',
                '🎬 Entertainment', '📚 Education', '🏃 Sports', '🏠 Home',
                '🐾 Pets', '🚗 Automotive', '💰 Finance', '🎯 Business',
                '🎨 Art & Design', '🎵 Music', '📖 Books',
                '🌿 Wellness', '👶 Parenting', '💑 Relationships', '🎪 Comedy'
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
              Ready to Amplify Your Influence?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of influencers who are already using our platform to grow their brand, 
              connect with brands, and monetize their content effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('influencer-registration')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Register as Influencer
              </button>
              <button 
                onClick={() => navigate('about-influencers')}
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

export default ServicesInfluencersPage;
