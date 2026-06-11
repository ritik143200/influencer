const CATEGORY_TREE_SEED = [
  {
    slug: 'creator-influencer',
    name: 'Creator / Influencer',
    description: 'Digital-first creators, influencers, models, storytellers, and emerging internet personalities.',
    legacyHiringValue: 'influencer',
    iconKey: 'sparkles',
    accentFrom: '#8b5cf6',
    accentTo: '#22d3ee',
    sortOrder: 1,
    microCategories: [
      { slug: 'education-information', name: 'Education & Information', aliases: ['education', 'study', 'career', 'kids learning', 'education and information'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'graduationCap', accentFrom: '#6366f1', accentTo: '#3b82f6' },
      { slug: 'food', name: 'Food', aliases: ['food creator', 'food and cooking'], starterCount: 890, spotlight: true, spotlightOrder: 6, iconKey: 'utensils', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'ugc-creator', name: 'UGC Creator', aliases: ['ugc', 'user generated content'], starterCount: 1540, spotlight: true, spotlightOrder: 2, iconKey: 'smartphone', accentFrom: '#f97316', accentTo: '#ec4899' },
      { slug: 'vlogs', name: 'Vlogs', aliases: ['vlog', 'vlogging'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'clapperboard', accentFrom: '#3b82f6', accentTo: '#8b5cf6' },
      { slug: 'entertainment-comedy', name: 'Entertainment & Comedy', aliases: ['comedy', 'entertainment', 'roasting', 'comedy and entertainment', 'entertainment and comedy'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'theater', accentFrom: '#fb7185', accentTo: '#f97316' },
      { slug: 'lifestyle', name: 'Lifestyle', aliases: ['life style'], starterCount: 2450, spotlight: true, spotlightOrder: 1, iconKey: 'sparkles', accentFrom: '#a855f7', accentTo: '#3b82f6' },
      { slug: 'fashion-beauty', name: 'Fashion & Beauty', aliases: ['style', 'fashion', 'beauty', 'fashion and beauty'], starterCount: 980, spotlight: true, spotlightOrder: 3, iconKey: 'shirt', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'ai', name: 'AI', aliases: ['artificial intelligence'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'bot', accentFrom: '#6366f1', accentTo: '#22d3ee' },
      { slug: 'motivational-self-growth', name: 'Motivational and self growth', aliases: ['motivation', 'self growth', 'personal branding', 'motivation and self growth', 'motivational and self growth'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'rocket', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'travel', name: 'Travel', aliases: ['travelling'], starterCount: 540, spotlight: true, spotlightOrder: 5, iconKey: 'plane', accentFrom: '#0ea5e9', accentTo: '#14b8a6' },
      { slug: 'fitness-health', name: 'Fitness & Health', aliases: ['fitness', 'health', 'fitness and health'], starterCount: 1820, spotlight: true, spotlightOrder: 4, iconKey: 'dumbbell', accentFrom: '#ec4899', accentTo: '#f97316' },
      { slug: 'technology', name: 'Technology', aliases: ['tech', 'gadgets', 'technology creator'], starterCount: 3100, spotlight: true, spotlightOrder: 7, iconKey: 'cpu', accentFrom: '#3b82f6', accentTo: '#06b6d4' },
      { slug: 'finance-investment', name: 'Finance & investment', aliases: ['finance', 'investment', 'finance and investment', 'stock market', 'finance and investment'], starterCount: 1200, spotlight: true, spotlightOrder: 8, iconKey: 'badgeIndianRupee', accentFrom: '#10b981', accentTo: '#22c55e' },
      { slug: 'gaming', name: 'Gaming', aliases: ['games'], starterCount: 620, spotlight: true, spotlightOrder: 9, iconKey: 'gamepad2', accentFrom: '#f59e0b', accentTo: '#f97316' },
      { slug: 'news-social-commentary', name: 'News & Social Commentary', aliases: ['news', 'social commentary', 'street interviews'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'newspaper', accentFrom: '#3b82f6', accentTo: '#22d3ee' },
      { slug: 'actor', name: 'Actor', aliases: ['actors'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'camera', accentFrom: '#ef4444', accentTo: '#8b5cf6' },
      { slug: 'model', name: 'Model', aliases: ['models'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'gem', accentFrom: '#f472b6', accentTo: '#a855f7' },
      { slug: 'celebrity', name: 'Celebrity', aliases: ['celeb', 'celebrity'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'crown', accentFrom: '#f59e0b', accentTo: '#ec4899' },
      { slug: 'spiritual-astrology', name: 'Spritual and astrology', aliases: ['spiritual', 'astrology', 'spiritual and astrology', 'spritual and astrology'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'moonStar', accentFrom: '#8b5cf6', accentTo: '#c084fc' }
    ]
  },
  {
    slug: 'city-pages',
    name: 'City Pages',
    description: 'Hyperlocal pages, food communities, and location-led digital discovery networks.',
    legacyHiringValue: 'city page',
    iconKey: 'mapPinned',
    accentFrom: '#0ea5e9',
    accentTo: '#8b5cf6',
    sortOrder: 2,
    microCategories: [
      { slug: 'food-pages', name: 'Food Pages', aliases: ['food page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'utensils', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'local-city-pages', name: 'Local City Pages', aliases: ['local city page', 'city page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'mapPinned', accentFrom: '#0ea5e9', accentTo: '#3b82f6' },
      { slug: 'state-pages', name: 'State Pages', aliases: ['state page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'building2', accentFrom: '#8b5cf6', accentTo: '#6366f1' }
    ]
  },
  {
    slug: 'meme-pages',
    name: 'Meme Pages',
    description: 'Internet-native communities built on memes, music, fan culture, and daily shareability.',
    legacyHiringValue: 'meme page',
    iconKey: 'laugh',
    accentFrom: '#ec4899',
    accentTo: '#f97316',
    sortOrder: 3,
    microCategories: [
      { slug: 'meme-pages', name: 'Meme Pages', aliases: ['meme page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'laugh', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'music-pages', name: 'Music Pages', aliases: ['music page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'music4', accentFrom: '#8b5cf6', accentTo: '#3b82f6' },
      { slug: 'celebrity-pages', name: 'Celebrity Pages', aliases: ['celebrity page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'star', accentFrom: '#f59e0b', accentTo: '#ef4444' },
      { slug: 'motivation-pages', name: 'Motivation Pages', aliases: ['motivation page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'rocket', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'devotional-pages', name: 'Devotional Pages', aliases: ['devotional page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'sunMoon', accentFrom: '#c084fc', accentTo: '#f59e0b' },
      { slug: 'media-pages', name: 'Media Pages', aliases: ['media page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'newspaper', accentFrom: '#3b82f6', accentTo: '#22d3ee' },
      { slug: 'political-pages', name: 'Political Pages', aliases: ['political page'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'landmark', accentFrom: '#ef4444', accentTo: '#f97316' },
      { slug: 'other', name: 'Other', aliases: ['others'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'shapes', accentFrom: '#64748b', accentTo: '#94a3b8' }
    ]
  },
  {
    slug: 'artist',
    name: 'Artist',
    description: 'Artist-led collaborations, public figures, and high-visibility personality-driven campaigns.',
    legacyHiringValue: 'artist',
    iconKey: 'crown',
    accentFrom: '#f59e0b',
    accentTo: '#ec4899',
    sortOrder: 4,
    microCategories: [
      { slug: 'singers', name: 'Singers', aliases: ['singer'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'music', accentFrom: '#f59e0b', accentTo: '#f97316' },
      { slug: 'rappers', name: 'Rappers', aliases: ['rapper'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'mic', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'musicians', name: 'Musicians', aliases: ['musician'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'music4', accentFrom: '#3b82f6', accentTo: '#8b5cf6' },
      { slug: 'sketch-painting', name: 'Sketch/painting', aliases: ['sketch', 'painting', 'sketching'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'palette', accentFrom: '#f97316', accentTo: '#eab308' },
      { slug: 'dance', name: 'Dance', aliases: ['dancer', 'dancing'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'sparkles', accentFrom: '#a855f7', accentTo: '#3b82f6' },
      { slug: 'choreographer', name: 'Choreographer', aliases: ['choreography'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'crown', accentFrom: '#f59e0b', accentTo: '#ec4899' },
      { slug: 'performing-arts', name: 'Performing arts', aliases: ['performing art', 'theater'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'theater', accentFrom: '#fb7185', accentTo: '#f97316' },
      { slug: 'writers-storyteller', name: 'Writers/storyteller', aliases: ['writer', 'storyteller', 'writing'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'scrollText', accentFrom: '#f59e0b', accentTo: '#b45309' },
      { slug: 'art-craft', name: 'Art and craft', aliases: ['art', 'craft'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'palette', accentFrom: '#f97316', accentTo: '#eab308' },
      { slug: 'filmmaker', name: 'Filmmaker', aliases: ['film maker'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'film', accentFrom: '#f97316', accentTo: '#b91c1c' },
      { slug: 'anchor', name: 'Anchor', aliases: ['anchoring'], starterCount: 0, spotlight: false, spotlightOrder: 99, iconKey: 'megaphone', accentFrom: '#8b5cf6', accentTo: '#ec4899' }
    ]
  }
];

module.exports = {
  CATEGORY_TREE_SEED
};
