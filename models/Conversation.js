const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String },
        lastRead: { type: Date, default: Date.now }
    }],
    jobApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' },
    lastMessage: { type: String },
    lastMessageAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', ConversationSchema);
