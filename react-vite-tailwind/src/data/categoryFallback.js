export const fallbackCategoryDirectory = [
  {
    slug: 'creator-influencer',
    name: 'Creator / Influencer',
    description: 'Digital-first creators, influencers, models, storytellers, and emerging internet personalities.',
    legacyHiringValue: 'influencer',
    iconKey: 'sparkles',
    accentFrom: '#8b5cf6',
    accentTo: '#22d3ee',
    microCategories: [
      { slug: 'education-information', name: 'Education & Information', iconKey: 'graduationCap', accentFrom: '#6366f1', accentTo: '#3b82f6' },
      { slug: 'food', name: 'Food', starterCount: 890, spotlight: true, spotlightOrder: 6, iconKey: 'utensils', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'ugc-creator', name: 'UGC Creator', starterCount: 1540, spotlight: true, spotlightOrder: 2, iconKey: 'smartphone', accentFrom: '#f97316', accentTo: '#ec4899' },
      { slug: 'vlogs', name: 'Vlogs', iconKey: 'clapperboard', accentFrom: '#3b82f6', accentTo: '#8b5cf6' },
      { slug: 'entertainment-comedy', name: 'Entertainment & Comedy', iconKey: 'theater', accentFrom: '#fb7185', accentTo: '#f97316' },
      { slug: 'lifestyle', name: 'Lifestyle', starterCount: 2450, spotlight: true, spotlightOrder: 1, iconKey: 'sparkles', accentFrom: '#a855f7', accentTo: '#3b82f6' },
      { slug: 'fashion-beauty', name: 'Fashion & Beauty', starterCount: 980, spotlight: true, spotlightOrder: 3, iconKey: 'shirt', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'ai', name: 'AI', iconKey: 'bot', accentFrom: '#6366f1', accentTo: '#22d3ee' },
      { slug: 'motivational-self-growth', name: 'Motivational and self growth', iconKey: 'rocket', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'travel', name: 'Travel', starterCount: 540, spotlight: true, spotlightOrder: 5, iconKey: 'plane', accentFrom: '#0ea5e9', accentTo: '#14b8a6' },
      { slug: 'fitness-health', name: 'Fitness & Health', starterCount: 1820, spotlight: true, spotlightOrder: 4, iconKey: 'dumbbell', accentFrom: '#ec4899', accentTo: '#f97316' },
      { slug: 'technology', name: 'Technology', starterCount: 3100, spotlight: true, spotlightOrder: 7, iconKey: 'cpu', accentFrom: '#3b82f6', accentTo: '#06b6d4' },
      { slug: 'finance-investment', name: 'Finance & investment', starterCount: 1200, spotlight: true, spotlightOrder: 8, iconKey: 'badgeIndianRupee', accentFrom: '#10b981', accentTo: '#22c55e' },
      { slug: 'gaming', name: 'Gaming', starterCount: 620, spotlight: true, spotlightOrder: 9, iconKey: 'gamepad2', accentFrom: '#f59e0b', accentTo: '#f97316' },
      { slug: 'news-social-commentary', name: 'News & Social Commentary', iconKey: 'newspaper', accentFrom: '#3b82f6', accentTo: '#22d3ee' },
      { slug: 'actor', name: 'Actor', iconKey: 'camera', accentFrom: '#ef4444', accentTo: '#8b5cf6' },
      { slug: 'model', name: 'Model', iconKey: 'gem', accentFrom: '#f472b6', accentTo: '#a855f7' },
      { slug: 'celebrity', name: 'Celebrity', iconKey: 'crown', accentFrom: '#f59e0b', accentTo: '#ec4899' },
      { slug: 'spiritual-astrology', name: 'Spritual and astrology', iconKey: 'moonStar', accentFrom: '#8b5cf6', accentTo: '#c084fc' }
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
    microCategories: [
      { slug: 'food-pages', name: 'Food Pages', iconKey: 'utensils', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'local-city-pages', name: 'Local City Pages', iconKey: 'mapPinned', accentFrom: '#0ea5e9', accentTo: '#3b82f6' },
      { slug: 'state-pages', name: 'State Pages', iconKey: 'building2', accentFrom: '#8b5cf6', accentTo: '#6366f1' }
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
    microCategories: [
      { slug: 'meme-pages', name: 'Meme Pages', iconKey: 'laugh', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'music-pages', name: 'Music Pages', iconKey: 'music4', accentFrom: '#8b5cf6', accentTo: '#3b82f6' },
      { slug: 'celebrity-pages', name: 'Celebrity Pages', iconKey: 'star', accentFrom: '#f59e0b', accentTo: '#ef4444' },
      { slug: 'motivation-pages', name: 'Motivation Pages', iconKey: 'rocket', accentFrom: '#f97316', accentTo: '#ef4444' },
      { slug: 'devotional-pages', name: 'Devotional Pages', iconKey: 'sunMoon', accentFrom: '#c084fc', accentTo: '#f59e0b' },
      { slug: 'media-pages', name: 'Media Pages', iconKey: 'newspaper', accentFrom: '#3b82f6', accentTo: '#22d3ee' },
      { slug: 'political-pages', name: 'Political Pages', iconKey: 'landmark', accentFrom: '#ef4444', accentTo: '#f97316' },
      { slug: 'other', name: 'Other', iconKey: 'shapes', accentFrom: '#64748b', accentTo: '#94a3b8' }
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
    microCategories: [
      { slug: 'singers', name: 'Singers', iconKey: 'music', accentFrom: '#f59e0b', accentTo: '#f97316' },
      { slug: 'rappers', name: 'Rappers', iconKey: 'mic', accentFrom: '#ec4899', accentTo: '#8b5cf6' },
      { slug: 'musicians', name: 'Musicians', iconKey: 'music4', accentFrom: '#3b82f6', accentTo: '#8b5cf6' },
      { slug: 'sketch-painting', name: 'Sketch/painting', iconKey: 'palette', accentFrom: '#f97316', accentTo: '#eab308' },
      { slug: 'dance', name: 'Dance', iconKey: 'sparkles', accentFrom: '#a855f7', accentTo: '#3b82f6' },
      { slug: 'choreographer', name: 'Choreographer', iconKey: 'crown', accentFrom: '#f59e0b', accentTo: '#ec4899' },
      { slug: 'performing-arts', name: 'Performing arts', iconKey: 'theater', accentFrom: '#fb7185', accentTo: '#f97316' },
      { slug: 'writers-storyteller', name: 'Writers/storyteller', iconKey: 'scrollText', accentFrom: '#f59e0b', accentTo: '#b45309' },
      { slug: 'art-craft', name: 'Art and craft', iconKey: 'palette', accentFrom: '#f97316', accentTo: '#eab308' },
      { slug: 'filmmaker', name: 'Filmmaker', iconKey: 'film', accentFrom: '#f97316', accentTo: '#b91c1c' },
      { slug: 'anchor', name: 'Anchor', iconKey: 'megaphone', accentFrom: '#8b5cf6', accentTo: '#ec4899' }
    ]
  }
];

export const fallbackCategorySummary = {
  spotlightCategories: fallbackCategoryDirectory
    .flatMap((category) => category.microCategories.map((microCategory) => ({
      id: microCategory.slug,
      name: microCategory.name,
      mainCategorySlug: category.slug,
      mainCategoryName: category.name,
      iconKey: microCategory.iconKey || category.iconKey,
      accentFrom: microCategory.accentFrom || category.accentFrom,
      accentTo: microCategory.accentTo || category.accentTo,
      count: microCategory.starterCount || 0,
      spotlightOrder: microCategory.spotlightOrder ?? 999
    })))
    .filter((category) => Number.isFinite(category.spotlightOrder) && category.spotlightOrder < 99)
    .sort((a, b) => a.spotlightOrder - b.spotlightOrder),
  mainCategorySummary: fallbackCategoryDirectory.map((category) => ({
    id: category.slug,
    name: category.name,
    description: category.description,
    iconKey: category.iconKey,
    accentFrom: category.accentFrom,
    accentTo: category.accentTo,
    count: 0,
    microCategoryCount: category.microCategories.length
  }))
};
