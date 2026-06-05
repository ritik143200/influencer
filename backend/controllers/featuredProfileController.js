const FeaturedProfile = require('../models/FeaturedProfile');
const {
  uploadOptimizedAndThumbToCloudinary,
  deleteCloudinaryAsset,
  extractCloudinaryPublicIdFromUrl
} = require('../utils/imageVariants');

const PUBLIC_FEATURED_PROFILE_NAMES = ['ayushi sikarwar', 'pooja patel'];
const normalizeFeaturedName = (value = '') => String(value).trim().replace(/\s+/g, ' ').toLowerCase();

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
        const uploaded = await uploadOptimizedAndThumbToCloudinary(req.files.image[0].buffer, {
          folder: 'featured_profiles',
          basePublicId: `featured_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
          optimizedMaxWidth: 1000,
          thumbMaxWidth: 300,
          webpQuality: 75
        });
        newProfile.image = uploaded.optimized.url;
        newProfile.imageThumb = uploaded.thumb.url;
        newProfile.imagePublicId = uploaded.optimized.publicId;
        newProfile.imageThumbPublicId = uploaded.thumb.publicId;
      }
      if (req.files.portfolio) {
        const uploads = await Promise.all(
          req.files.portfolio.map((f) =>
            uploadOptimizedAndThumbToCloudinary(f.buffer, {
              folder: 'featured_profiles/portfolio',
              basePublicId: `featured_port_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
              optimizedMaxWidth: 1000,
              thumbMaxWidth: 300,
              webpQuality: 75
            })
          )
        );
        newProfile.portfolio = uploads.map(u => u.optimized.url);
        newProfile.portfolioThumbs = uploads.map(u => u.thumb.url);
        newProfile.portfolioPublicIds = uploads.map(u => u.optimized.publicId);
        newProfile.portfolioThumbPublicIds = uploads.map(u => u.thumb.publicId);
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

    const existing = await FeaturedProfile.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    let currentPortfolio = [];
    if (existingPortfolio) {
      currentPortfolio = Array.isArray(existingPortfolio) ? existingPortfolio : [existingPortfolio];
    }

    // Align portfolio metadata arrays (thumbs, public IDs) with remaining images
    const prevPortfolio = Array.isArray(existing.portfolio) ? existing.portfolio : [];
    const prevThumbs = Array.isArray(existing.portfolioThumbs) ? existing.portfolioThumbs : [];
    const prevPids = Array.isArray(existing.portfolioPublicIds) ? existing.portfolioPublicIds : [];
    const prevThumbPids = Array.isArray(existing.portfolioThumbPublicIds) ? existing.portfolioThumbPublicIds : [];

    const remainingIndices = prevPortfolio
      .map((url, idx) => (currentPortfolio.includes(url) ? idx : -1))
      .filter((idx) => idx !== -1);

    const updatedThumbs = remainingIndices.map((idx) => prevThumbs[idx]).filter(Boolean);
    const updatedPids = remainingIndices.map((idx) => prevPids[idx]).filter(Boolean);
    const updatedThumbPids = remainingIndices.map((idx) => prevThumbPids[idx]).filter(Boolean);

    // If admin removed some existing portfolio items, delete orphaned cloudinary assets (best effort)
    const removedPortfolio = prevPortfolio.filter((u) => !currentPortfolio.includes(u));
    for (const url of removedPortfolio) {
      const pid = extractCloudinaryPublicIdFromUrl(url);
      await deleteCloudinaryAsset(pid);
      await deleteCloudinaryAsset(pid ? `${pid}_thumb` : null);
      await deleteCloudinaryAsset(pid ? `${pid}_opt` : null);
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        const uploaded = await uploadOptimizedAndThumbToCloudinary(req.files.image[0].buffer, {
          folder: 'featured_profiles',
          basePublicId: `featured_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
          optimizedMaxWidth: 1000,
          thumbMaxWidth: 300,
          webpQuality: 75
        });

        // delete old image assets
        const oldPid = existing.imagePublicId || extractCloudinaryPublicIdFromUrl(existing.image);
        await deleteCloudinaryAsset(oldPid);
        await deleteCloudinaryAsset(existing.imageThumbPublicId);
        await deleteCloudinaryAsset(oldPid ? `${oldPid}_thumb` : null);
        await deleteCloudinaryAsset(oldPid ? `${oldPid}_opt` : null);

        updateFields.image = uploaded.optimized.url;
        updateFields.imageThumb = uploaded.thumb.url;
        updateFields.imagePublicId = uploaded.optimized.publicId;
        updateFields.imageThumbPublicId = uploaded.thumb.publicId;
      }
      if (req.files.portfolio) {
        const uploads = await Promise.all(
          req.files.portfolio.map((f) =>
            uploadOptimizedAndThumbToCloudinary(f.buffer, {
              folder: 'featured_profiles/portfolio',
              basePublicId: `featured_port_${Date.now()}_${Math.round(Math.random() * 1e9)}`,
              optimizedMaxWidth: 1000,
              thumbMaxWidth: 300,
              webpQuality: 75
            })
          )
        );
        const newPortfolioUrls = uploads.map(u => u.optimized.url);
        const newThumbUrls = uploads.map(u => u.thumb.url);
        const newPids = uploads.map(u => u.optimized.publicId);
        const newThumbPids = uploads.map(u => u.thumb.publicId);

        currentPortfolio = [...currentPortfolio, ...newPortfolioUrls];
        updateFields.portfolioThumbs = [...updatedThumbs, ...newThumbUrls];
        updateFields.portfolioPublicIds = [...updatedPids, ...newPids];
        updateFields.portfolioThumbPublicIds = [...updatedThumbPids, ...newThumbPids];
      } else {
        updateFields.portfolioThumbs = updatedThumbs;
        updateFields.portfolioPublicIds = updatedPids;
        updateFields.portfolioThumbPublicIds = updatedThumbPids;
      }
    } else {
      updateFields.portfolioThumbs = updatedThumbs;
      updateFields.portfolioPublicIds = updatedPids;
      updateFields.portfolioThumbPublicIds = updatedThumbPids;
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
    const profile = await FeaturedProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    // Cleanup images (best effort)
    const pids = [];
    if (profile.imagePublicId) pids.push(profile.imagePublicId);
    if (profile.imageThumbPublicId) pids.push(profile.imageThumbPublicId);
    const derived = extractCloudinaryPublicIdFromUrl(profile.image);
    if (derived) {
      pids.push(derived, `${derived}_thumb`, `${derived}_opt`);
    }
    for (const pid of pids) {
      await deleteCloudinaryAsset(pid);
    }

    const portfolioUrls = Array.isArray(profile.portfolio) ? profile.portfolio : [];
    for (const url of portfolioUrls) {
      const pid = extractCloudinaryPublicIdFromUrl(url);
      await deleteCloudinaryAsset(pid);
      await deleteCloudinaryAsset(pid ? `${pid}_thumb` : null);
      await deleteCloudinaryAsset(pid ? `${pid}_opt` : null);
    }

    await FeaturedProfile.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    console.error('Error deleting featured profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
