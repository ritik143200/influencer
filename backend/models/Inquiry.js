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
    hiringFor: {
        type: String,
        enum: ['artist', 'influencer'],
        required: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true
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
    assignedArtist: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        assignedAt: { type: Date }
    },
    forwardedTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            forwardedAt: { type: Date, default: Date.now }
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

module.exports = mongoose.model('Inquiry', inquirySchema);
