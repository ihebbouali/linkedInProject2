const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nom: { type: String },
    prenom: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, enum: ['personal', 'company'], required: true },
    photo_url: { type: String, default: '/images/default-avatar.png' },
    summary: { type: String }, // À propos
    companyName: { type: String }, // Pour les comptes entreprise
    companyWebsite: { type: String }, // Pour les comptes entreprise
    
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
    }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);