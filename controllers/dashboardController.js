const User = require('../models/User');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('followers following', 'nom prenom companyName accountType');
        res.render('dashboard', { user, pageTitle: 'Mon Profil' });
    } catch (err) {
        res.redirect('/auth/login');
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const profileUser = await User.findById(req.params.userId).populate('followers following', 'nom prenom companyName accountType');
        
        if (!profileUser) {
            return res.redirect('/dashboard');
        }
        
        // If viewing own profile, redirect to dashboard
        if (req.params.userId === req.session.userId) {
            return res.redirect('/dashboard');
        }
        
        // Check if current user is following this profile
        const isFollowing = currentUser.following.includes(req.params.userId);
        
        res.render('user-profile', { 
            user: currentUser, 
            profileUser, 
            isFollowing,
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

        // 1. Lancement optimisé de Puppeteer (évite les blocages)
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdf = await page.pdf({ format: 'A4', printBackground: true });

        await browser.close();

        // 2. Gestion du mode : "view" (afficher) ou "download" (télécharger)
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
// Follow user
exports.followUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const targetUser = await User.findById(req.params.userId);
        
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        
        // Check if already following
        if (currentUser.following.includes(req.params.userId)) {
            return res.json({ message: 'Vous suivez d�j� cet utilisateur' });
        }
        
        // Add to following list
        currentUser.following.push(req.params.userId);
        await currentUser.save();
        
        // Add to followers list
        targetUser.followers.push(req.session.userId);
        await targetUser.save();
        
        res.json({ message: 'Utilisateur suivi', following: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Unfollow user
exports.unfollowUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const targetUser = await User.findById(req.params.userId);
        
        if (!targetUser) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }
        
        // Remove from following list
        currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId);
        await currentUser.save();
        
        // Remove from followers list
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.session.userId);
        await targetUser.save();
        
        res.json({ message: 'Utilisateur ne sera plus suivi', following: false });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Get followers list
exports.getFollowers = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const targetUser = await User.findById(req.params.userId).populate('followers', 'nom prenom companyName accountType email photo_url');
        
        if (!targetUser) {
            return res.redirect('/dashboard');
        }
        
        res.render('followers-list', { 
            user: currentUser, 
            profileUser: targetUser, 
            users: targetUser.followers, 
            listType: 'followers',
            pageTitle: 'Abonn�s' 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get following list
exports.getFollowing = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const targetUser = await User.findById(req.params.userId).populate('following', 'nom prenom companyName accountType email photo_url');
        
        if (!targetUser) {
            return res.redirect('/dashboard');
        }
        
        res.render('followers-list', { 
            user: currentUser, 
            profileUser: targetUser, 
            users: targetUser.following, 
            listType: 'following',
            pageTitle: 'Abonnements' 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get own followers
exports.getOwnFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('followers', 'nom prenom companyName accountType email photo_url');
        res.render('followers-list', { 
            user, 
            profileUser: user, 
            users: user.followers, 
            listType: 'followers',
            pageTitle: 'Mes Abonnés' 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get own following
exports.getOwnFollowing = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('following', 'nom prenom companyName accountType email photo_url');
        res.render('followers-list', { 
            user, 
            profileUser: user, 
            users: user.following, 
            listType: 'following',
            pageTitle: 'Mes Abonnements' 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};
