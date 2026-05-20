const Influencer = require('../models/influencer');
const {
  ensureCategoryDirectory,
  collectInfluencerMicroCategoryCounts
} = require('../utils/categoryHelpers');

const getCategoryDirectory = async (req, res) => {
  try {
    const categories = await ensureCategoryDirectory();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching category directory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category directory',
      error: error.message
    });
  }
};

const getCategorySummary = async (req, res) => {
  try {
    const categories = await ensureCategoryDirectory();
    const influencers = await Influencer.find({ profileType: 'influencer' })
      .select('mainCategories microCategories categorySelections categories niche')
      .lean();

    const { microCounts, mainCounts, index } = collectInfluencerMicroCategoryCounts(influencers, categories);

    const spotlightCategories = categories
      .flatMap((category) =>
        (category.microCategories || [])
          .filter((microCategory) => microCategory.spotlight)
          .map((microCategory) => {
            const liveCount = microCounts[microCategory.slug] || 0;
            return {
              id: microCategory.slug,
              name: microCategory.name,
              mainCategorySlug: category.slug,
              mainCategoryName: category.name,
              iconKey: microCategory.iconKey || category.iconKey,
              accentFrom: microCategory.accentFrom || category.accentFrom,
              accentTo: microCategory.accentTo || category.accentTo,
              starterCount: microCategory.starterCount || 0,
              liveCount,
              count: liveCount || microCategory.starterCount || 0,
              spotlightOrder: microCategory.spotlightOrder ?? 999
            };
          })
      )
      .sort((a, b) => a.spotlightOrder - b.spotlightOrder);

    const mainCategorySummary = categories.map((category) => ({
      id: category.slug,
      name: category.name,
      description: category.description,
      iconKey: category.iconKey,
      accentFrom: category.accentFrom,
      accentTo: category.accentTo,
      count: mainCounts[category.slug] || 0,
      microCategoryCount: (category.microCategories || []).filter((microCategory) => microCategory.isActive !== false).length
    }));

    res.status(200).json({
      success: true,
      data: {
        spotlightCategories,
        mainCategorySummary,
        totalCreatorsIndexed: Object.values(microCounts).reduce((sum, value) => sum + value, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching category summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category summary',
      error: error.message
    });
  }
};

module.exports = {
  getCategoryDirectory,
  getCategorySummary
};
