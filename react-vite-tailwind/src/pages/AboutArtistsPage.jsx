import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const AboutArtistsPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            About ArtistHub - Artists
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connecting talented artists with opportunities worldwide
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-3xl mb-6">
              🎯
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: config.text_color }}>
              Our Mission for Artists
            </h2>
            <p className="text-gray-600 leading-relaxed">
              ArtistHub is dedicated to creating a seamless platform where talented artists can showcase their skills, 
              connect with clients, and grow their careers. We believe in empowering artists and providing 
              them with the tools they need to succeed in the digital age.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-3xl mb-6">
              🔮
            </div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: config.text_color }}>
              Our Vision for Artists
            </h2>
            <p className="text-gray-600 leading-relaxed">
              To become the world's leading platform for artistic talent, where every artist can find 
              their perfect audience and every client can discover their ideal creative partner. We envision 
              a world where art and creativity know no boundaries.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            What We Offer Artists
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎤',
                title: 'Diverse Talent Pool',
                description: 'Access to thousands of talented artists across 27+ categories and 100+ specializations.'
              },
              {
                icon: '🔍',
                title: 'Smart Search',
                description: 'Advanced search functionality to find the perfect artist for your specific needs.'
              },
              {
                icon: '✅',
                title: 'Verified Artists',
                description: 'All artists are verified to ensure quality and reliability for every project.'
              },
              {
                icon: '💬',
                title: 'Direct Communication',
                description: 'Connect directly with artists without intermediaries or hidden fees.'
              },
              {
                icon: '📅',
                title: 'Easy Booking',
                description: 'Simple and secure booking process with transparent pricing.'
              },
              {
                icon: '🌟',
                title: 'Portfolio Showcase',
                description: 'Display your work beautifully with photos, videos, and detailed descriptions.'
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

        {/* Artist Categories Preview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: config.text_color }}>
            Explore Artist Categories
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
                  onClick={() => navigate('category', { 
                    category: { 
                      name: category.split(' ')[1], 
                      icon: category.split(' ')[0] 
                    } 
                  })}
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
              Ready to Join Our Artist Community?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're an artist looking for opportunities or a client seeking artistic talent, 
              ArtistHub is your perfect platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('auth')}
                className="px-8 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Join as Artist
              </button>
              <button 
                onClick={() => navigate('home')}
                className="px-8 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors"
              >
                Browse Artists
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutArtistsPage;
