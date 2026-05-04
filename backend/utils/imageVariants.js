const sharp = require('sharp');
const { cloudinary } = require('../config/cloudinary');

const DEFAULTS = {
  optimizedMaxWidth: 1000,
  thumbMaxWidth: 300,
  webpQuality: 75
};

const cloudinaryUploadBuffer = (buffer, { folder, publicId, resourceType = 'image' } = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    stream.end(buffer);
  });
};

const toWebpBuffer = async (inputBuffer, { maxWidth, quality } = {}) => {
  const w = maxWidth || DEFAULTS.optimizedMaxWidth;
  const q = quality || DEFAULTS.webpQuality;

  return sharp(inputBuffer)
    .rotate()
    .resize({ width: w, withoutEnlargement: true })
    .webp({ quality: q })
    .toBuffer();
};

const createOptimizedAndThumbWebp = async (inputBuffer, opts = {}) => {
  const optimized = await toWebpBuffer(inputBuffer, {
    maxWidth: opts.optimizedMaxWidth || DEFAULTS.optimizedMaxWidth,
    quality: opts.webpQuality || DEFAULTS.webpQuality
  });

  const thumb = await toWebpBuffer(inputBuffer, {
    maxWidth: opts.thumbMaxWidth || DEFAULTS.thumbMaxWidth,
    quality: opts.webpQuality || DEFAULTS.webpQuality
  });

  return { optimized, thumb };
};

const uploadOptimizedAndThumbToCloudinary = async (inputBuffer, {
  folder,
  basePublicId,
  optimizedMaxWidth,
  thumbMaxWidth,
  webpQuality
} = {}) => {
  const { optimized, thumb } = await createOptimizedAndThumbWebp(inputBuffer, {
    optimizedMaxWidth,
    thumbMaxWidth,
    webpQuality
  });

  const [optimizedRes, thumbRes] = await Promise.all([
    cloudinaryUploadBuffer(optimized, {
      folder,
      publicId: basePublicId ? `${basePublicId}_opt` : undefined
    }),
    cloudinaryUploadBuffer(thumb, {
      folder,
      publicId: basePublicId ? `${basePublicId}_thumb` : undefined
    })
  ]);

  return {
    optimized: {
      url: optimizedRes.secure_url || optimizedRes.url,
      publicId: optimizedRes.public_id
    },
    thumb: {
      url: thumbRes.secure_url || thumbRes.url,
      publicId: thumbRes.public_id
    }
  };
};

const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    // best effort cleanup
  }
};

// Best-effort extractor for cloudinary public_id from secure_url
const extractCloudinaryPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  // Typical: https://res.cloudinary.com/<cloud>/image/upload/v123/folder/name.webp
  const uploadIdx = url.indexOf('/upload/');
  if (uploadIdx === -1) return null;

  let rest = url.slice(uploadIdx + '/upload/'.length);
  // strip version prefix v123/
  rest = rest.replace(/^v\d+\//, '');
  // remove query
  rest = rest.split('?')[0];
  // remove extension
  rest = rest.replace(/\.[^.\/]+$/, '');

  return rest || null;
};

module.exports = {
  uploadOptimizedAndThumbToCloudinary,
  deleteCloudinaryAsset,
  extractCloudinaryPublicIdFromUrl
};
