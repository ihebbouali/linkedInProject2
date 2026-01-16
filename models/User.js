const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nom: { type: String },
    prenom: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    accountType: { type: String, enum: ['personal', 'company'], required: true },
    photo_url: { type: String, default: function() {
        return this.accountType === 'company' ? '/images/default-company.svg' : '/images/default-personal.svg';
    }},
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
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);