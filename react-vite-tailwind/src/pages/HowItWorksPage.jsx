import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const HowItWorksPage = ({ config }) => {
  const { navigate } = useRouter();

  return (
    <div className="pt-24 pb-16 min-h-full" style={{ backgroundColor: config.background_color }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: config.text_color }}>
            How It Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your simple journey to connect with talented artists and influencers
          </p>
        </div>

        {/* Interactive Timeline Design */}
        <div className="relative mb-20">
          {/* Main Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-brand-500 to-purple-500 rounded-full"></div>
          
          {/* Step 1 - Left Side */}
          <div className="relative flex items-center mb-16">
            <div className="w-1/2 pr-8 text-right">
              <div className="inline-block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md">
                <div className="flex items-center justify-end mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-2xl">👤</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: config.text_color }}>
                    Create Account
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Sign up in seconds with your email or social account. Choose whether you're looking for talent or want to showcase your skills.
                </p>
                <div className="flex justify-end space-x-2">
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                    Quick Registration
                  </span>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                    User Types
                  </span>
                </div>
              </div>
            </div>
            
            {/* Center Circle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
              1
            </div>
            
            <div className="w-1/2 pl-8"></div>
          </div>

          {/* Step 2 - Right Side */}
          <div className="relative flex items-center mb-16">
            <div className="w-1/2 pr-8"></div>
            
            {/* Center Circle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
              2
            </div>
            
            <div className="w-1/2 pl-8">
              <div className="inline-block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: config.text_color }}>
                    Complete Profile
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Build your comprehensive profile with photos, skills, and preferences. The more complete your profile, the better your matches.
                </p>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Portfolio
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Skills
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Availability
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Left Side */}
          <div className="relative flex items-center mb-16">
            <div className="w-1/2 pr-8 text-right">
              <div className="inline-block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 max-w-md">
                <div className="flex items-center justify-end mb-4">
                  <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center mr-3">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: config.text_color }}>
                    Connect & Collaborate
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Search for talent or opportunities, connect directly, and start collaborating. Manage everything through your dashboard.
                </p>
                <div className="flex justify-end space-x-2">
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                    Search
                  </span>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                    Message
                  </span>
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium">
                    Book
                  </span>
                </div>
              </div>
            </div>
            
            {/* Center Circle */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-16 bg-brand-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
              3
            </div>
            
            <div className="w-1/2 pl-8"></div>
          </div>
        </div>

        {/* User Type Workflows - Hexagon Design */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: config.text_color }}>
            Choose Your Path
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Artists/Influencers Path */}
            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🎨</span>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: config.text_color }}>
                  For Artists & Influencers
                </h3>
                <p className="text-gray-600">Showcase your talent and grow your career</p>
              </div>
              
              {/* Hexagon Flow */}
              <div className="relative flex justify-center items-center">
                <div className="flex flex-wrap justify-center gap-4 max-w-md">
                  <div className="w-24 h-24 bg-brand-100 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">📝</span>
                    <span className="text-xs font-medium text-center">Register</span>
                  </div>
                  <div className="w-24 h-24 bg-brand-100 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">🎨</span>
                    <span className="text-xs font-medium text-center">Showcase</span>
                  </div>
                  <div className="w-24 h-24 bg-brand-100 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">📅</span>
                    <span className="text-xs font-medium text-center">Get Booked</span>
                  </div>
                  <div className="w-24 h-24 bg-brand-100 rounded-2xl flex flex-col items-center justify-center hover:bg-brand-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">💰</span>
                    <span className="text-xs font-medium text-center">Earn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Clients/Brands Path */}
            <div className="relative">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl">🏢</span>
                </div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: config.text_color }}>
                  For Clients & Brands
                </h3>
                <p className="text-gray-600">Find perfect talent for your projects</p>
              </div>
              
              {/* Hexagon Flow */}
              <div className="relative flex justify-center items-center">
                <div className="flex flex-wrap justify-center gap-4 max-w-md">
                  <div className="w-24 h-24 bg-purple-100 rounded-2xl flex flex-col items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">👤</span>
                    <span className="text-xs font-medium text-center">Sign Up</span>
                  </div>
                  <div className="w-24 h-24 bg-purple-100 rounded-2xl flex flex-col items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">🔍</span>
                    <span className="text-xs font-medium text-center">Search</span>
                  </div>
                  <div className="w-24 h-24 bg-purple-100 rounded-2xl flex flex-col items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">💬</span>
                    <span className="text-xs font-medium text-center">Connect</span>
                  </div>
                  <div className="w-24 h-24 bg-purple-100 rounded-2xl flex flex-col items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer">
                    <span className="text-2xl mb-1">🎉</span>
                    <span className="text-xs font-medium text-center">Hire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Pills - Horizontal Scroll */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: config.text_color }}>
            Platform Features
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '🔒', label: 'Secure Platform', color: 'brand' },
              { icon: '📱', label: 'Mobile Friendly', color: 'purple' },
              { icon: '💬', label: 'Direct Messaging', color: 'purple' },
              { icon: '📊', label: 'Analytics Dashboard', color: 'brand' },
              { icon: '🌍', label: 'Global Reach', color: 'purple' },
              { icon: '🎯', label: 'Smart Matching', color: 'brand' },
              { icon: '💳', label: 'Safe Payments', color: 'purple' }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group relative overflow-hidden rounded-full px-6 py-4 bg-gradient-to-r from-${feature.color}-50 to-${feature.color}-100 border-2 border-${feature.color}-200 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="font-medium text-gray-800">{feature.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Wave Design */}
        <div className="relative">
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-3xl p-12 text-white relative overflow-hidden">
            {/* Decorative Waves */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
                <path d="M0,150 C300,100 600,200 1200,150 L1200,300 L0,300 Z" fill="white"/>
                <path d="M0,200 C300,150 600,250 1200,200 L1200,300 L0,300 Z" fill="white" opacity="0.5"/>
              </svg>
            </div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of users already connecting through ArtistHub. Your journey is just a few clicks away.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('artist-registration')}
                  className="px-8 py-4 bg-white text-brand-600 font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => navigate('home')}
                  className="px-8 py-4 bg-brand-700 text-white font-semibold rounded-2xl hover:bg-brand-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Browse Talent
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
