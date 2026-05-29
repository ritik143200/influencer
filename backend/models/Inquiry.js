const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    campaignName: {
        type: String,
        trim: true,
        default: ''
    },
    hiringFor: {
        type: String,
        enum: ['artist', 'influencer', 'creator', 'celebrity', 'city page', 'meme page'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    mainCategories: [{
        type: String,
        trim: true
    }],
    microCategories: [{
        type: String,
        trim: true
    }],
    categorySelections: [{
        mainCategorySlug: { type: String, trim: true },
        microCategorySlug: { type: String, trim: true, default: null }
    }],
    location: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        default: Date.now
    },
    budget: {
        type: Number,
        required: true
    },
    requirements: {
        type: String,
        default: '',
        trim: true
    },
    status: {
        type: String,
        enum: [
            'sent',           // User submitted inquiry
            'admin_accepted', // Admin accepted inquiry
            'admin_rejected', // Admin rejected inquiry
            'forwarded',      // Admin forwarded to artist
            'artist_accepted', // Artist accepted inquiry
            'artist_rejected', // Artist rejected inquiry
            'completed'       // Final completion
        ],
        default: 'sent'
    },
    progressPercentage: {
        type: Number,
        default: 10, // Start with 10% when sent
        min: 0,
        max: 100
    },
    adminStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    artistStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    assignedInfluencer: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date }
    },
    forwardedTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Influencer' },
            forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            forwardedAt: { type: Date, default: Date.now },
            acceptanceStatus: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'auto-rejected'],
                default: 'pending'
            },
            acceptedAt: { type: Date },
            rejectedAt: { type: Date },
            response: { type: String, trim: true }
        }
    ],
    workflowHistory: [
        {
            stage: { type: String, required: true },
            status: { type: String, required: true },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            updatedAt: { type: Date, default: Date.now },
            notes: { type: String }
        }
    ]
}, {
    timestamps: true
});

inquirySchema.index({ userId: 1, createdAt: -1 });
inquirySchema.index({ status: 1, createdAt: -1 });
inquirySchema.index({ adminStatus: 1, createdAt: -1 });
inquirySchema.index({ hiringFor: 1, createdAt: -1 });
inquirySchema.index({ category: 1 });
inquirySchema.index({ mainCategories: 1 });
inquirySchema.index({ microCategories: 1 });
inquirySchema.index({ 'forwardedTo.userId': 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
