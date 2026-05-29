const hasValue = (value) => {
  if (Array.isArray(value)) return value.some(hasValue);
  if (value && typeof value === 'object') return Object.values(value).some(hasValue);
  return String(value || '').trim().length > 0;
};

const hasRealCategory = (profile = {}) => {
  const mainCategories = Array.isArray(profile.mainCategories) ? profile.mainCategories : [];
  const microCategories = Array.isArray(profile.microCategories)
    ? profile.microCategories
    : Array.isArray(profile.niche)
      ? profile.niche
      : profile.niche
        ? [profile.niche]
        : [];
  const category = String(profile.category || profile.profileType || '').trim().toLowerCase();

  return mainCategories.length > 0 || microCategories.length > 0 || (category && category !== 'influencer');
};

const hasLocation = (location) => {
  if (!location) return false;
  if (typeof location === 'string') return Boolean(location.trim());
  return Boolean(String(location.city || location.state || location.country || '').trim());
};

const hasPortfolio = (portfolio) =>
  Array.isArray(portfolio) &&
  portfolio.some((item) => {
    if (typeof item === 'string') return Boolean(item.trim());
    return Boolean(String(item?.title || item?.url || '').trim());
  });

const hasPricing = (pricing = {}, profile = {}) =>
  hasValue(pricing.reel) ||
  hasValue(pricing.story) ||
  hasValue(pricing.collab) ||
  hasValue(pricing.staticPost) ||
  hasValue(pricing.other) ||
  hasValue(pricing.custom) ||
  hasValue(profile.budgetMin) ||
  hasValue(profile.budgetMax) ||
  hasValue(profile.budget);

const hasFollowers = (profile = {}) =>
  hasValue(profile.followers) ||
  hasValue(profile.platforms?.instagram?.followers) ||
  hasValue(profile.platforms?.youtube?.followers) ||
  hasValue(profile.platforms?.facebook?.followers);

const BASE_COMPLETION = 25;

export const calculateProfileCompletion = (profile = {}) => {
  const profileSteps = [
    { done: hasValue(profile.bio || profile.description), weight: 12 },
    { done: hasValue(profile.experience), weight: 8 },
    { done: hasValue(profile.gender), weight: 5 },
    { done: hasFollowers(profile), weight: 15 },
    { done: hasPricing(profile.pricing, profile), weight: 18 },
    { done: hasPortfolio(profile.portfolio), weight: 12 },
    {
      done:
        hasValue(profile.socialLinks?.instagram || profile.instagram || profile.platforms?.instagram?.url) &&
        hasLocation(profile.location) &&
        hasRealCategory(profile),
      weight: 5
    }
  ];

  const completedProfile = profileSteps.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  return Math.min(100, Math.max(BASE_COMPLETION, BASE_COMPLETION + completedProfile));
};
