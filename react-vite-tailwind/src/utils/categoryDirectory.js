export const normalizeCategoryKey = (value = '') =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildCategoryIndex = (directory = []) => {
  const mainBySlug = new Map();
  const microBySlug = new Map();

  directory.forEach((category) => {
    mainBySlug.set(category.slug, category);
    (category.microCategories || []).forEach((microCategory) => {
      microBySlug.set(microCategory.slug, {
        ...microCategory,
        parentSlug: category.slug,
        parentName: category.name
      });
    });
  });

  return {
    mainBySlug,
    microBySlug
  };
};

export const getGroupedMicroCategories = (directory = [], selectedMainCategories = []) =>
  directory.filter((category) => selectedMainCategories.includes(category.slug));

export const getCategorySelectionPayload = (directory = [], selectedMainCategories = [], selectedMicroCategories = []) => {
  const index = buildCategoryIndex(directory);
  const normalizedMain = Array.from(new Set(selectedMainCategories));
  const normalizedMicro = Array.from(new Set(selectedMicroCategories));

  const categorySelections = normalizedMicro
    .map((microSlug) => index.microBySlug.get(microSlug))
    .filter(Boolean)
    .map((microCategory) => ({
      mainCategorySlug: microCategory.parentSlug,
      microCategorySlug: microCategory.slug
    }));

  return {
    mainCategories: normalizedMain,
    microCategories: normalizedMicro,
    categorySelections
  };
};

export const getMicroCategoryNames = (directory = [], selectedMicroCategories = []) => {
  const index = buildCategoryIndex(directory);
  return selectedMicroCategories
    .map((microSlug) => index.microBySlug.get(microSlug)?.name)
    .filter(Boolean);
};

export const getMainCategoryCards = (summary = {}, directory = []) => {
  if (summary?.mainCategorySummary?.length) return summary.mainCategorySummary;

  return directory.map((category) => ({
    id: category.slug,
    name: category.name,
    description: category.description,
    iconKey: category.iconKey,
    accentFrom: category.accentFrom,
    accentTo: category.accentTo,
    count: 0,
    microCategoryCount: (category.microCategories || []).length
  }));
};
