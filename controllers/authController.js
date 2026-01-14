const User = require('../models/User');

exports.getLogin = (req, res) => {
    res.render('login', { errorMessage: null });
};

exports.getRegister = (req, res) => {
    res.render('register', { errorMessage: null });
};

exports.register = async (req, res) => {
    try {
        const { nom, prenom, email, password, accountType, companyName, companyWebsite } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { errorMessage: 'Cet email est déjà utilisé' });
        }

        const newUser = new User({
            nom: accountType === 'personal' ? nom : null,
            prenom: accountType === 'personal' ? prenom : null,
            email,
            password: password,
            accountType: accountType || 'personal',
            companyName: accountType === 'company' ? companyName : null,
            companyWebsite: accountType === 'company' ? companyWebsite : null
        });

        await newUser.save();

        req.session.userId = newUser._id;
        req.session.accountType = newUser.accountType;
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.render('register', { errorMessage: "Erreur lors de l'inscription" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.render('login', { errorMessage: 'Email incorrect' });
        }

        if (password !== user.password) {
            return res.render('login', { errorMessage: 'Mot de passe incorrect' });
        }

        req.session.userId = user._id;
        req.session.accountType = user.accountType;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { errorMessage: "Erreur lors de la connexion" });
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};