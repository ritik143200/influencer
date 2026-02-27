export const categories = [
  { id: 1, name: 'Musicians', icon: '🎵', color: 'from-purple-500 to-indigo-600', count: 2450 },
  { id: 2, name: 'Painters', icon: '🎨', color: 'from-pink-500 to-rose-600', count: 1820 },
  { id: 3, name: 'Photographers', icon: '📸', color: 'from-blue-500 to-cyan-600', count: 3100 },
  { id: 4, name: 'Dancers', icon: '💃', color: 'from-amber-500 to-orange-600', count: 980 },
  { id: 5, name: 'Sculptors', icon: '🗿', color: 'from-emerald-500 to-teal-600', count: 540 },
  { id: 6, name: 'Writers', icon: '✍️', color: 'from-violet-500 to-purple-600', count: 1650 },
  { id: 7, name: 'Filmmakers', icon: '🎬', color: 'from-red-500 to-pink-600', count: 890 },
  { id: 8, name: 'Comedians', icon: '🎭', color: 'from-yellow-500 to-amber-600', count: 620 },
];

export const artists = [
  { id: 1, name: 'Elena Rodriguez', category: 'Musicians', rating: 4.9, reviews: 128, price: '$500/hr', image: '🎸', specialty: 'Jazz Guitar', trending: true, verified: true },
  { id: 2, name: 'Marcus Chen', category: 'Photographers', rating: 4.8, reviews: 256, price: '$350/hr', image: '📷', specialty: 'Portrait Photography', trending: true, verified: true },
  { id: 3, name: 'Aria Williams', category: 'Painters', rating: 5.0, reviews: 89, price: '$800/hr', image: '🖼️', specialty: 'Abstract Art', trending: true, verified: true },
  { id: 4, name: 'David Kim', category: 'Dancers', rating: 4.7, reviews: 167, price: '$400/hr', image: '🩰', specialty: 'Contemporary Dance', trending: true, verified: false },
  { id: 5, name: 'Sophie Laurent', category: 'Musicians', rating: 4.9, reviews: 312, price: '$600/hr', image: '🎹', specialty: 'Classical Piano', trending: false, verified: true },
  { id: 6, name: 'James Mitchell', category: 'Filmmakers', rating: 4.6, reviews: 78, price: '$1200/hr', image: '🎥', specialty: 'Documentary', trending: true, verified: true },
  { id: 7, name: 'Luna Martinez', category: 'Writers', rating: 4.8, reviews: 145, price: '$200/hr', image: '📝', specialty: 'Poetry & Lyrics', trending: false, verified: true },
  { id: 8, name: 'Alex Thompson', category: 'Comedians', rating: 4.9, reviews: 234, price: '$450/hr', image: '😂', specialty: 'Stand-up Comedy', trending: true, verified: true },
  { id: 9, name: 'Nina Patel', category: 'Photographers', rating: 4.7, reviews: 189, price: '$300/hr', image: '🌅', specialty: 'Landscape Photography', trending: false, verified: false },
  { id: 10, name: 'Oscar Rivera', category: 'Sculptors', rating: 5.0, reviews: 56, price: '$900/hr', image: '🏺', specialty: 'Bronze Sculptures', trending: true, verified: true },
  { id: 11, name: 'Emma Stone', category: 'Painters', rating: 4.8, reviews: 198, price: '$650/hr', image: '🎭', specialty: 'Oil Portraits', trending: false, verified: true },
  { id: 12, name: 'Ryan Lee', category: 'Musicians', rating: 4.6, reviews: 423, price: '$750/hr', image: '🥁', specialty: 'Session Drummer', trending: true, verified: true },
];

export const heroSlides = [
  {
    id: 1,
    title: 'Find Your Perfect Artist',
    subtitle: 'Connect with thousands of talented professionals',
    gradient: 'from-brand-500 via-brand-400 to-amber-400',
    emoji: '✨'
  },
  {
    id: 2,
    title: 'Book with Confidence',
    subtitle: 'Verified artists with authentic reviews',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    emoji: '🎯'
  },
  {
    id: 3,
    title: 'Showcase Your Talent',
    subtitle: 'Join our community of creative professionals',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    emoji: '🌟'
  }
];

export const defaultConfig = {
  platform_name: 'ArtistHub',
  hero_title: 'Discover & Connect with Amazing Artists',
  hero_subtitle: 'The ultimate platform to find, book, and manage talented artists for your events and projects',
  cta_button_text: 'Explore Artists',
  background_color: '#f9fafb',
  surface_color: '#ffffff',
  text_color: '#1f2937',
  primary_action: '#ee7711',
  secondary_action: '#6b7280',
  font_family: 'Outfit'
};
