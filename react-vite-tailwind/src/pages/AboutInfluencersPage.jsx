import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const AboutInfluencersPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            About ArtistHub - Influencers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talented influencers with brands and opportunities worldwide
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-3xl mb-6">
              📱
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: config.text_color }}>
              Our Mission for Influencers
            </h2>
            <p className="text-gray-600 leading-relaxed">
              ArtistHub is dedicated to creating a seamless platform where talented influencers can showcase their content, 
              connect with brands, and grow their digital presence. We believe in empowering influencers and providing 
              them with the tools they need to succeed in the social media age.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl mb-6">
              🚀
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: config.text_color }}>
              Our Vision for Influencers
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To become the world's leading platform for influencer talent, where every influencer can find 
              their perfect brand partnerships and every company can discover their ideal creative collaborator. We envision 
              a world where influence and creativity drive meaningful connections.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            What We Offer Influencers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🌟',
                title: 'Diverse Influencer Pool',
                description: 'Access to thousands of talented influencers across 20+ niches and specializations.'
              },
              {
                icon: '🔍',
                title: 'Smart Discovery',
                description: 'Advanced search functionality to find the perfect influencer for your brand campaigns.'
              },
              {
                icon: '✅',
                title: 'Verified Influencers',
                description: 'All influencers are verified to ensure authenticity and engagement quality.'
              },
              {
                icon: '💬',
                title: 'Direct Collaboration',
                description: 'Connect directly with influencers without intermediaries or hidden fees.'
              },
              {
                icon: '📈',
                title: 'Campaign Management',
                description: 'Simple and secure campaign process with transparent analytics and reporting.'
              },
              {
                icon: '🎯',
                title: 'Audience Insights',
                description: 'Detailed audience demographics and engagement metrics for informed decisions.'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
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

        {/* Influencer Categories Preview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Discover Influencer Categories
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
              Ready to Join Our Influencer Community?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're an influencer looking for brand partnerships or a company seeking creative talent, 
              ArtistHub is your perfect platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('auth')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Join as Influencer
              </button>
              <button 
                onClick={() => navigate('home')}
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Browse Influencers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutInfluencersPage;
