const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String },
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'freelance'], required: true },
    experienceLevel: { type: String, enum: ['entry', 'mid', 'senior'], required: true },
    skills: [String],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobApplication' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
