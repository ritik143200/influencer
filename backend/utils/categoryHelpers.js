const Category = require('../models/Category');
const { CATEGORY_TREE_SEED } = require('../data/categorySeed');

const normalizeKey = (value = '') => String(value)
  .trim()
  .toLowerCase()
  .replace(/&/g, 'and')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const uniqueArray = (values = []) => Array.from(new Set(values.filter(Boolean)));

const toArray = (value) => {
  if (Array.isArray(value)) return value.flatMap((item) => toArray(item));
  if (value === undefined || value === null) return [];
  if (typeof value === 'string') {
    if (!value.trim()) return [];
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [value];
};

const ensureCategoryDirectory = async () => {
  await Category.bulkWrite(
    CATEGORY_TREE_SEED.map((category) => ({
      updateOne: {
        filter: { slug: category.slug },
        update: { $set: category },
        upsert: true
      }
    }))
  );

  return Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
};

const buildCategoryIndex = (categories = []) => {
  const mainLookup = new Map();
  const mainBySlug = new Map();
  const microLookup = new Map();
  const microBySlug = new Map();

  categories.forEach((category) => {
    const categoryEntry = {
      slug: category.slug,
      name: category.name,
      legacyHiringValue: category.legacyHiringValue,
      iconKey: category.iconKey,
      accentFrom: category.accentFrom,
      accentTo: category.accentTo
    };

    mainBySlug.set(category.slug, categoryEntry);
    uniqueArray([
      category.slug,
      category.name,
      category.legacyHiringValue,
      ...(category.aliases || [])
    ]).forEach((token) => {
      mainLookup.set(normalizeKey(token), categoryEntry);
    });

    (category.microCategories || []).forEach((microCategory) => {
      const microEntry = {
        slug: microCategory.slug,
        name: microCategory.name,
        parentSlug: category.slug,
        parentName: category.name,
        iconKey: microCategory.iconKey || category.iconKey,
        accentFrom: microCategory.accentFrom || category.accentFrom,
        accentTo: microCategory.accentTo || category.accentTo,
        starterCount: microCategory.starterCount || 0,
        spotlight: !!microCategory.spotlight,
        spotlightOrder: microCategory.spotlightOrder ?? 999
      };

      microBySlug.set(microCategory.slug, microEntry);
      uniqueArray([
        microCategory.slug,
        microCategory.name,
        ...(microCategory.aliases || [])
      ]).forEach((token) => {
        microLookup.set(normalizeKey(token), microEntry);
      });
    });
  });

  return {
    mainLookup,
    mainBySlug,
    microLookup,
    microBySlug
  };
};

const resolveMainCategory = (value, index) => {
  const normalized = normalizeKey(value);
  return normalized ? index.mainLookup.get(normalized) || null : null;
};

const resolveMicroCategory = (value, index) => {
  const normalized = normalizeKey(value);
  return normalized ? index.microLookup.get(normalized) || null : null;
};

const normalizeCategoryPayload = (payload = {}, categories = []) => {
  const directory = Array.isArray(categories) && categories.length ? categories : CATEGORY_TREE_SEED;
  const index = buildCategoryIndex(directory);

  const mainCategorySet = new Set();
  const microCategorySet = new Set();
  const normalizedSelections = [];

  const pushMain = (value) => {
    const match = resolveMainCategory(value, index);
    if (match) mainCategorySet.add(match.slug);
    return match;
  };

  const pushMicro = (value) => {
    const match = resolveMicroCategory(value, index);
    if (match) {
      microCategorySet.add(match.slug);
      mainCategorySet.add(match.parentSlug);
    }
    return match;
  };

  toArray(payload.mainCategories || payload.mainCategory || payload.hiringFor).forEach(pushMain);
  toArray(payload.microCategories).forEach(pushMicro);
  toArray(payload.categories).forEach(pushMicro);
  toArray(payload.category).forEach(pushMicro);
  toArray(payload.niche).forEach(pushMicro);

  if (Array.isArray(payload.categorySelections)) {
    payload.categorySelections.forEach((selection) => {
      if (!selection) return;

      const mainMatch = pushMain(
        selection.mainCategorySlug ||
        selection.mainCategory ||
        selection.mainCategoryName
      );

      const microMatch = pushMicro(
        selection.microCategorySlug ||
        selection.microCategory ||
        selection.microCategoryName
      );

      if (mainMatch && !microMatch) {
        normalizedSelections.push({
          mainCategorySlug: mainMatch.slug,
          microCategorySlug: null
        });
      }

      if (microMatch) {
        normalizedSelections.push({
          mainCategorySlug: microMatch.parentSlug,
          microCategorySlug: microMatch.slug
        });
      }
    });
  }

  microCategorySet.forEach((microSlug) => {
    const microEntry = index.microBySlug.get(microSlug);
    if (!microEntry) return;

    const alreadyExists = normalizedSelections.some(
      (selection) =>
        selection.mainCategorySlug === microEntry.parentSlug &&
        selection.microCategorySlug === microSlug
    );

    if (!alreadyExists) {
      normalizedSelections.push({
        mainCategorySlug: microEntry.parentSlug,
        microCategorySlug: microSlug
      });
    }
  });

  const mainCategories = Array.from(mainCategorySet);
  const microCategories = Array.from(microCategorySet);

  const mainCategoryLabels = mainCategories
    .map((slug) => index.mainBySlug.get(slug)?.name)
    .filter(Boolean);

  const microCategoryLabels = microCategories
    .map((slug) => index.microBySlug.get(slug)?.name)
    .filter(Boolean);

  const primaryMainSlug = mainCategories[0];
  const primaryMain = primaryMainSlug ? index.mainBySlug.get(primaryMainSlug) : null;

  return {
    mainCategories,
    microCategories,
    categorySelections: normalizedSelections,
    mainCategoryLabels,
    microCategoryLabels,
    primaryLegacyHiringValue: primaryMain?.legacyHiringValue || null
  };
};

const collectInfluencerMicroCategoryCounts = (influencers = [], categories = []) => {
  const index = buildCategoryIndex(categories);
  const microCounts = {};
  const mainCounts = {};

  const increment = (microSlug) => {
    const microEntry = index.microBySlug.get(microSlug);
    if (!microEntry) return;

    microCounts[microSlug] = (microCounts[microSlug] || 0) + 1;
    mainCounts[microEntry.parentSlug] = (mainCounts[microEntry.parentSlug] || 0) + 1;
  };

  influencers.forEach((influencer) => {
    const normalized = normalizeCategoryPayload({
      mainCategories: influencer.mainCategories,
      microCategories: influencer.microCategories,
      categorySelections: influencer.categorySelections,
      categories: influencer.categories,
      niche: influencer.niche
    }, categories);

    uniqueArray(normalized.microCategories).forEach(increment);
  });

  return { microCounts, mainCounts, index };
};

module.exports = {
  normalizeKey,
  uniqueArray,
  toArray,
  ensureCategoryDirectory,
  buildCategoryIndex,
  normalizeCategoryPayload,
  collectInfluencerMicroCategoryCounts
};
