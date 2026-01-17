const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

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

exports.applyForJob = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user.accountType !== 'personal') {
            return res.status(403).json({ message: 'Seuls les comptes personnels peuvent postuler' });
        }

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

        await Job.findByIdAndUpdate(req.params.jobId, {
            $push: { applications: application._id }
        });

        await User.findByIdAndUpdate(req.session.userId, {
            $push: { applications: application._id }
        });
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

        const initialMessage = new Message({
            conversation: conversation._id,
            sender: req.session.userId,
            senderName: applicantName,
            content: req.body.coverLetter || `Bonjour, je suis intéressé(e) par le poste de ${job.title}.`
        });

        await initialMessage.save();
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

exports.postJob = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        
        if (user.accountType !== 'company') {
            return res.status(403).json({ message: 'Seuls les comptes entreprise peuvent publier des offres' });
        }

        const { title, description, location, salary, jobType, experienceLevel, skills } = req.body;

        if (salary && (isNaN(salary) || parseFloat(salary) < 0)) {
            return res.render('post-job', { 
                user: await User.findById(req.session.userId), 
                errorMessage: 'Le salaire doit être une valeur numérique positive' 
            });
        }

        const newJob = new Job({
            title,
            description,
            company: req.session.userId,
            companyName: user.companyName,
            location,
            salary: salary || null,
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

exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        
        if (job.company.toString() !== req.session.userId) {
            return res.status(403).redirect('/dashboard');
        }

        await Job.findByIdAndDelete(req.params.jobId);
        res.redirect('/jobs/my-jobs/list');
    } catch (err) {
        console.error(err);
        res.redirect('/jobs/my-jobs/list');
    }
};
