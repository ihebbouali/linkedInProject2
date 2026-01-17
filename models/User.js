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
    companyName: { type: String },
    companyWebsite: { type: String },
    
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