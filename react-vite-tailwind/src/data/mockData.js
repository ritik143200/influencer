export const categories = [
  { id: 1, name: 'Lifestyle', icon: '🌟', color: 'from-purple-500 to-indigo-600', count: 2450 },
  { id: 2, name: 'UGC Creator', icon: '📱', color: 'from-orange-400 to-red-500', count: 1540 },
  { id: 3, name: 'Fashion', icon: '👗', color: 'from-amber-500 to-orange-600', count: 980 },
  { id: 4, name: 'Fitness', icon: '💪', color: 'from-pink-500 to-rose-600', count: 1820 },
  { id: 5, name: 'Travel', icon: '✈️', color: 'from-emerald-500 to-teal-600', count: 540 },
  { id: 6, name: 'Food', icon: '🍔', color: 'from-red-500 to-pink-600', count: 890 },
  { id: 7, name: 'Tech', icon: '💻', color: 'from-blue-500 to-cyan-600', count: 3100 },
  { id: 8, name: 'Finance', icon: '💰', color: 'from-green-500 to-emerald-600', count: 1200 },
  { id: 9, name: 'Gaming', icon: '🎮', color: 'from-yellow-500 to-amber-600', count: 620 },
  { id: 10, name: 'Education', icon: '📚', color: 'from-blue-600 to-indigo-700', count: 2100 },
  { id: 11, name: 'Motivation', icon: '🔥', color: 'from-orange-500 to-red-600', count: 1450 },
  { id: 12, name: 'Spiritual', icon: '🧘', color: 'from-violet-400 to-purple-500', count: 780 },
  { id: 13, name: 'Actor', icon: '🎬', color: 'from-slate-600 to-slate-800', count: 1150 },
  { id: 14, name: 'Comedian', icon: '😄', color: 'from-yellow-400 to-orange-500', count: 920 },
  { id: 15, name: 'Model', icon: '👤', color: 'from-gray-400 to-gray-600', count: 1340 },
  { id: 16, name: 'Filmmaker', icon: '🎥', color: 'from-red-600 to-red-900', count: 670 },
  { id: 17, name: 'Influencer', icon: '🌟', color: 'from-brand-500 to-brand-600', count: 5400 },
  { id: 18, name: 'Historical', icon: '📜', color: 'from-amber-700 to-amber-900', count: 320 },
];

export const influencers = [
  { id: 1, name: 'Elena Rodriguez', category: 'Lifestyle', rating: 4.9, reviews: 128, price: '₹15,000/post', image: '✨', specialty: 'Luxury Travel', trending: true, verified: true },
  { id: 2, name: 'Marcus Chen', category: 'Tech', rating: 4.8, reviews: 256, price: '₹25,000/video', image: '📱', specialty: 'Gadget Reviews', trending: true, verified: true },
  { id: 3, name: 'Aria Williams', category: 'Fashion', rating: 5.0, reviews: 89, price: '₹12,000/story', image: '👗', specialty: 'Ethical Fashion', trending: true, verified: true },
  { id: 4, name: 'David Kim', category: 'Fitness', rating: 4.7, reviews: 167, price: '₹10,000/post', image: '💪', specialty: 'Home Workouts', trending: true, verified: false },
  { id: 5, name: 'Sophie Laurent', category: 'Beauty', rating: 4.9, reviews: 312, price: '₹18,000/reel', image: '💄', specialty: 'Skincare Routine', trending: false, verified: true },
  { id: 6, name: 'James Mitchell', category: 'Travel', rating: 4.6, reviews: 78, price: '₹30,000/vlog', image: '✈️', specialty: 'Solo Travel', trending: true, verified: true },
];

export const heroSlides = [
  {
    id: 1,
    title: 'Find Your Perfect Influencer',
    subtitle: 'Connect with thousands of talented professionals',
    gradient: 'from-brand-500 via-brand-400 to-amber-400',
    emoji: '✨'
  },
  {
    id: 2,
    title: 'Hire with Confidence',
    subtitle: 'Verified influencers with authentic reviews',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    emoji: '🎯'
  },
  {
    id: 3,
    title: 'Showcase Your content',
    subtitle: 'Join our community of creative professionals',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    emoji: '🌟'
  }
];

export const defaultConfig = {
  platform_name: 'InfluencerHub',
  hero_title: 'Discover & Connect with The right Influencers',
  hero_subtitle: 'we connect brands with influencers for successful campaigns and help creators get real brand deals.',
  cta_button_text: 'Explore Influencers',
  background_color: '#f9fafb',
  surface_color: '#ffffff',
  text_color: '#1f2937',
  primary_action: '#ee7711',
  secondary_action: '#6b7280',
  font_family: 'Outfit'
};
