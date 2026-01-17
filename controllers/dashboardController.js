const User = require('../models/User');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('dashboard', { user, pageTitle: 'Mon Profil' });
    } catch (err) {
        res.redirect('/auth/login');
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const profileUser = await User.findById(req.params.userId);
        
        if (!profileUser) {
            return res.redirect('/dashboard');
        }
        
        if (req.params.userId === req.session.userId) {
            return res.redirect('/dashboard');
        }
        
        res.render('user-profile', { 
            user: currentUser, 
            profileUser, 
            pageTitle: profileUser.accountType === 'company' ? profileUser.companyName : `${profileUser.prenom} ${profileUser.nom}` 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            summary: req.body.summary,
            email: req.body.email,
            companyName: req.body.companyName,
            companyWebsite: req.body.companyWebsite
        };
        if (req.file) {
            updates.photo_url = `/uploads/${req.file.filename}`;
        }
        await User.findByIdAndUpdate(req.session.userId, updates);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

exports.addSkill = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.skills.push({ title: req.body.title, level: req.body.level });
        await user.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
};

exports.deleteSkill = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.skills.pull({ _id: req.params.id });
        await user.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
};

exports.addExperience = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.experiences.push(req.body); // title, company, description...
        await user.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
};

exports.deleteExperience = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.experiences.pull({ _id: req.params.id });
        await user.save();
        res.redirect('/dashboard');
    } catch (err) {
        res.redirect('/dashboard');
    }
};

exports.downloadPDF = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const filePath = path.join(__dirname, '../views/cv-template.ejs');
        const html = await ejs.renderFile(filePath, { user });

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });

        await browser.close();

        const mode = req.query.mode; 
        const disposition = mode === 'download' ? 'attachment' : 'inline';

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdf.length,
            'Content-Disposition': `${disposition}; filename="${user.nom}_${user.prenom}_CV.pdf"`
        });

        res.send(pdf);

    } catch (err) {
        console.error("Erreur PDF:", err);
        res.status(500).send("Erreur lors de la génération du PDF");
    }
};
