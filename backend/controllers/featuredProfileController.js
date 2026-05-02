const FeaturedProfile = require('../models/FeaturedProfile');

exports.getFeaturedProfiles = async (req, res) => {
  try {
    const profiles = await FeaturedProfile.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error fetching featured profiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllFeaturedProfiles = async (req, res) => {
  try {
    const profiles = await FeaturedProfile.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error fetching all featured profiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createFeaturedProfile = async (req, res) => {
  try {
    const { name, category, followers, posts, budget, bio, socialLinks, isActive } = req.body;
    let parsedSocialLinks = {};
    if (socialLinks) {
        try {
            parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        } catch(e) {}
    }

    const newProfile = new FeaturedProfile({
      name,
      category,
      followers,
      posts,
      budget,
      bio,
      socialLinks: parsedSocialLinks,
      isActive: isActive !== undefined ? String(isActive) === 'true' : true
    });

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        newProfile.image = req.files.image[0].path;
      }
      if (req.files.portfolio) {
        newProfile.portfolio = req.files.portfolio.map(file => file.path);
      }
    }

    await newProfile.save();
    res.status(201).json({ success: true, data: newProfile });
  } catch (error) {
    console.error('Error creating featured profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateFeaturedProfile = async (req, res) => {
  try {
    const { name, category, followers, posts, budget, bio, socialLinks, isActive, order, existingPortfolio } = req.body;
    let parsedSocialLinks = {};
    if (socialLinks) {
        try {
            parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
        } catch(e) {}
    }

    const updateFields = {
      name,
      category,
      followers,
      posts,
      budget,
      bio,
    };
    if (isActive !== undefined) updateFields.isActive = String(isActive) === 'true';
    if (order !== undefined) updateFields.order = order;
    if (socialLinks) updateFields.socialLinks = parsedSocialLinks;

    let currentPortfolio = [];
    if (existingPortfolio) {
      currentPortfolio = Array.isArray(existingPortfolio) ? existingPortfolio : [existingPortfolio];
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateFields.image = req.files.image[0].path;
      }
      if (req.files.portfolio) {
        const newPortfolioUrls = req.files.portfolio.map(file => file.path);
        currentPortfolio = [...currentPortfolio, ...newPortfolioUrls];
      }
    }
    updateFields.portfolio = currentPortfolio;

    const updatedProfile = await FeaturedProfile.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.status(200).json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error('Error updating featured profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.reorderFeaturedProfiles = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } }
      }
    }));

    if (bulkOps.length > 0) {
      await FeaturedProfile.bulkWrite(bulkOps);
    }

    res.status(200).json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error reordering profiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteFeaturedProfile = async (req, res) => {
  try {
    const profile = await FeaturedProfile.findByIdAndDelete(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting featured profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
