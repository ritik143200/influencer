export const categories = [
  { id: 1, name: 'Lifestyle', icon: '🌟', color: 'from-purple-500 to-indigo-600', count: 2450 },
  { id: 2, name: 'Fitness', icon: '💪', color: 'from-pink-500 to-rose-600', count: 1820 },
  { id: 3, name: 'Tech', icon: '💻', color: 'from-blue-500 to-cyan-600', count: 3100 },
  { id: 4, name: 'Fashion', icon: '👗', color: 'from-amber-500 to-orange-600', count: 980 },
  { id: 5, name: 'Travel', icon: '✈️', color: 'from-emerald-500 to-teal-600', count: 540 },
  { id: 6, name: 'Beauty', icon: '💄', color: 'from-violet-500 to-purple-600', count: 1650 },
  { id: 7, name: 'Food', icon: '🍕', color: 'from-red-500 to-pink-600', count: 890 },
  { id: 8, name: 'Gaming', icon: '🎮', color: 'from-yellow-500 to-amber-600', count: 620 },
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
  hero_title: 'Discover & Connect with Amazing Influencers',
  hero_subtitle: 'The ultimate platform to find, hire, and manage talented influencers for your campaigns',
  cta_button_text: 'Explore Influencers',
  background_color: '#f9fafb',
  surface_color: '#ffffff',
  text_color: '#1f2937',
  primary_action: '#ee7711',
  secondary_action: '#6b7280',
  font_family: 'Outfit'
};
