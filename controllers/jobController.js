const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get all jobs
exports.getAllJobs = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const jobs = await Job.find().populate('company', 'nom prenom companyName');
        res.render('jobs', { jobs, user, pageTitle: 'Offres d\'emploi' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get job details
exports.getJobDetails = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const job = await Job.findById(req.params.id).populate('company', 'nom prenom companyName');
        const hasApplied = await JobApplication.findOne({ job: job._id, applicant: user._id });
        res.render('job-details', { job, user, hasApplied: !!hasApplied, pageTitle: job.title });
    } catch (err) {
        console.error(err);
        res.redirect('/jobs');
    }
};

// Apply for a job (Personal accounts only)
exports.applyForJob = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        
        // Check if personal account
        if (user.accountType !== 'personal') {
            return res.status(403).json({ message: 'Seuls les comptes personnels peuvent postuler' });
        }

        // Check if already applied
        const existingApplication = await JobApplication.findOne({
            job: req.params.jobId,
            applicant: req.session.userId
        });

        if (existingApplication) {
            return res.status(400).json({ message: 'Vous avez déjà postulé à cette offre' });
        }

        const application = new JobApplication({
            job: req.params.jobId,
            applicant: req.session.userId,
            coverLetter: req.body.coverLetter
        });

        await application.save();

        // Add application to job
        await Job.findByIdAndUpdate(req.params.jobId, {
            $push: { applications: application._id }
        });

        // Add application to user
        await User.findByIdAndUpdate(req.session.userId, {
            $push: { applications: application._id }
        });

        // Create conversation between applicant and company
        const job = await Job.findById(req.params.jobId).populate('company');
        const applicant = await User.findById(req.session.userId);
        const applicantName = `${applicant.prenom} ${applicant.nom}`;
        const companyName = job.company.companyName;

        const conversation = new Conversation({
            participants: [
                { user: req.session.userId, userName: applicantName },
                { user: job.company._id, userName: companyName }
            ],
            jobApplication: application._id,
            lastMessage: `${applicantName} a postulé pour ${job.title}`
        });

        await conversation.save();

        // Send initial message with cover letter
        const initialMessage = new Message({
            conversation: conversation._id,
            sender: req.session.userId,
            senderName: applicantName,
            content: req.body.coverLetter || `Bonjour, je suis intéressé(e) par le poste de ${job.title}.`
        });

        await initialMessage.save();

        // Send CV automatically if user has one
        if (applicant.cv_url) {
            const cvMessage = new Message({
                conversation: conversation._id,
                sender: req.session.userId,
                senderName: applicantName,
                content: 'Mon CV',
                attachment: {
                    type: 'cv',
                    filename: 'CV.pdf',
                    path: applicant.cv_url,
                    size: 0
                }
            });
            await cvMessage.save();
        }

        res.status(200).json({ message: 'Application envoyée avec succès!', conversationId: conversation._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de la candidature' });
    }
};

// Get job posting form (Company only)
exports.getPostJobForm = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        
        if (user.accountType !== 'company') {
            return res.redirect('/dashboard');
        }

        res.render('post-job', { user, pageTitle: 'Publier une offre d\'emploi' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Post a new job (Company only)
exports.postJob = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        
        if (user.accountType !== 'company') {
            return res.status(403).json({ message: 'Seuls les comptes entreprise peuvent publier des offres' });
        }

        const { title, description, location, salary, jobType, experienceLevel, skills } = req.body;

        const newJob = new Job({
            title,
            description,
            company: req.session.userId,
            companyName: user.companyName,
            location,
            salary,
            jobType,
            experienceLevel,
            skills: skills ? skills.split(',').map(s => s.trim()) : []
        });

        await newJob.save();
        res.redirect('/jobs');
    } catch (err) {
        console.error(err);
        res.render('post-job', { user: await User.findById(req.session.userId), errorMessage: 'Erreur lors de la publication' });
    }
};

// Get company jobs (for managing)
exports.getCompanyJobs = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        
        if (user.accountType !== 'company') {
            return res.redirect('/dashboard');
        }

        const jobs = await Job.find({ company: req.session.userId }).populate('applications');
        res.render('company-jobs', { jobs, user, pageTitle: 'Mes offres d\'emploi' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get applications for a job
exports.getJobApplications = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const job = await Job.findById(req.params.jobId);

        if (job.company.toString() !== req.session.userId) {
            return res.status(403).redirect('/dashboard');
        }

        const applications = await JobApplication.find({ job: req.params.jobId }).populate('applicant', 'nom prenom email');
        res.render('job-applications', { job, applications, user, pageTitle: `Candidatures pour ${job.title}` });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Update application status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const application = await JobApplication.findById(req.params.appId).populate('job');
        
        if (application.job.company.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        await JobApplication.findByIdAndUpdate(req.params.appId, { status });
        res.status(200).json({ message: 'Statut mis à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Delete job
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        
        if (job.company.toString() !== req.session.userId) {
            return res.status(403).redirect('/dashboard');
        }

        await Job.findByIdAndDelete(req.params.jobId);
        res.redirect('/company-jobs');
    } catch (err) {
        console.error(err);
        res.redirect('/company-jobs');
    }
};
