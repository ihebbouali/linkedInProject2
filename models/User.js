const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo_url: { type: String, default: '/images/default-avatar.png' },
    summary: { type: String }, // À propos
    
    // Tableaux pour les sous-documents
    skills: [{
        title: String,
        level: String
    }],
    experiences: [{
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);