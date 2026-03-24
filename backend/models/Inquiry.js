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
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
    ,
    forwardedTo: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            forwardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            forwardedAt: { type: Date, default: Date.now }
        }
    ]
}, {
    timestamps: true
});

module.exports = mongoose.model('Inquiry', inquirySchema);
