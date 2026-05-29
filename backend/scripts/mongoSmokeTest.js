const mongoose = require('mongoose');
require('dotenv').config();

const { connectDB, getDBStatus } = require('../config/db');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const { ensureCategoryDirectory } = require('../utils/categoryHelpers');

const run = async () => {
  const created = {
    userId: null,
    inquiryId: null
  };

  try {
    await connectDB();
    const categories = await ensureCategoryDirectory();

    const email = `mongo-smoke-${Date.now()}@viralmantrix.test`;
    const brand = await User.create({
      name: 'Mongo Smoke Brand',
      email,
      phone: '9999999999',
      password: 'Test1234',
      role: 'brand'
    });
    created.userId = brand._id;

    const inquiry = await Inquiry.create({
      userId: brand._id,
      name: 'Mongo Smoke Brand',
      email,
      phone: '9999999999',
      campaignName: 'Mongo Smoke Campaign',
      hiringFor: 'influencer',
      category: 'UGC Creator',
      mainCategories: ['creator-influencer'],
      microCategories: ['ugc-creator'],
      categorySelections: [{ mainCategorySlug: 'creator-influencer', microCategorySlug: 'ugc-creator' }],
      location: 'Indore',
      budget: 50000,
      requirements: 'Smoke test campaign for MongoDB verification',
      workflowHistory: [{
        stage: 'submitted',
        status: 'sent',
        updatedBy: brand._id,
        notes: 'Mongo smoke test',
        updatedAt: new Date()
      }]
    });
    created.inquiryId = inquiry._id;

    const brandCampaign = await Inquiry.findOne({ _id: inquiry._id, userId: brand._id }).lean();
    const adminFiltered = await Inquiry.findOne({
      mainCategories: 'creator-influencer',
      microCategories: 'ugc-creator'
    }).lean();

    if (!brandCampaign || !adminFiltered) {
      throw new Error('Mongo smoke test read/filter verification failed.');
    }

    console.log('Mongo smoke test passed');
    console.log(JSON.stringify({
      db: getDBStatus(),
      categoriesSeeded: categories.length,
      brandCampaignId: String(inquiry._id),
      brandReadOk: Boolean(brandCampaign),
      adminFilterOk: Boolean(adminFiltered)
    }, null, 2));
  } finally {
    if (created.inquiryId) {
      await Inquiry.deleteOne({ _id: created.inquiryId });
    }
    if (created.userId) {
      await User.deleteOne({ _id: created.userId });
    }
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error('Mongo smoke test failed:', error.message);
  process.exit(1);
});
