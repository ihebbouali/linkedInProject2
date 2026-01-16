const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String },
    content: { type: String },
    attachment: {
        type: { type: String }, // 'cv' or 'file'
        filename: String,
        path: String,
        size: Number
    },
    read: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
