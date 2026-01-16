const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String },
    content: { type: String, required: true },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        authorName: { type: String },
        content: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
