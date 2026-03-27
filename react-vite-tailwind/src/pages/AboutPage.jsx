import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const AboutPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            About InfluencerHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our platform dedicated to empowering influencers and creators to showcase their talent 
            and grow their brands worldwide
          </p>
        </div>

        {/* Platform Overview */}
        <div className="mb-12">
          <div 
            onClick={() => navigate('about-influencers')}
            className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-10 text-white cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                <span className="text-4xl">📱</span>
              </div>
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold">For Influencers</h2>
                <p className="text-white/90 mt-2 max-w-3xl">InfluencerHub is designed to empower social media creators and influencers with industry-leading tools to grow audiences, secure brand partnerships, and monetize content at scale. Our platform centralizes campaign management, analytics, and payment workflows so you can focus on creating.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What we offer</h3>
                <ul className="list-disc list-inside space-y-2 text-white/90">
                  <li>Brand Partnership Marketplace and campaign management</li>
                  <li>Advanced audience insights & performance analytics</li>
                  <li>Multiple monetization channels and payout tools</li>
                  <li>Content planning, collaboration, and scheduling tools</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Why creators choose us</h3>
                <ul className="list-disc list-inside space-y-2 text-white/90">
                  <li>Transparent campaign briefs and secure payments</li>
                  <li>Direct brand communication with negotiation support</li>
                  <li>Data-driven recommendations to increase engagement</li>
                  <li>Dedicated creator support and growth programs</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors" onClick={() => navigate('services-influencers')}>
                Explore Influencer Services →
              </button>
              <button className="px-6 py-3 bg-white/20 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors" onClick={() => navigate('faq')}>
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Platform Stats */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '18K+', label: 'Active Users', icon: '👥' },
              { number: '75K+', label: 'Bookings & Deals', icon: '📊' },
              { number: '4.8★', label: 'Average Rating', icon: '⭐' },
              { number: '150+', label: 'Countries', icon: '🌍' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-brand-600 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🔒',
                title: 'Secure Platform',
                description: 'Advanced security measures to protect your data and ensure safe transactions.'
              },
              {
                icon: '�',
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
                icon: '�',
                title: 'Analytics Dashboard',
                description: 'Comprehensive insights to track your growth and performance.'
              },
              {
                icon: '�',
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

        {/* Success Stories Preview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Priya', role: 'Lifestyle Influencer', story: '15+ deals in first month', icon: '✨' },
              { name: 'Rahul', role: 'Painter', story: 'Doubled income through platform', icon: '�' },
              { name: 'Ananya', role: 'Fashion Influencer', story: '20+ brand collaborations', icon: '�' },
              { name: 'Rohit', role: 'Gaming Influencer', story: 'Tripled income in 6 months', icon: '🎮' }
            ].map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">{story.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{story.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{story.role}</p>
                <p className="text-xs text-brand-600 font-medium">"{story.story}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Join Our Creative Community
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're an influencer looking to amplify your reach or a content creator ready to 
              showcase your talent, InfluencerHub is your platform for success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('influencer-registration')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Get Started Today
              </button>
              <button 
                onClick={() => navigate('faq')}
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

export default AboutPage;
