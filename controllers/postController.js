const Post = require('../models/Post');
const Job = require('../models/Job');
const User = require('../models/User');

exports.getFeed = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const posts = await Post.find().populate('author', 'nom prenom companyName accountType photo_url').sort({ createdAt: -1 }).limit(20);
        const jobs = await Job.find().populate('company', 'companyName').sort({ createdAt: -1 }).limit(10);

        const feedItems = [
            ...posts.map(p => ({ type: 'post', data: p, date: p.createdAt })),
            ...jobs.map(j => ({ type: 'job', data: j, date: j.createdAt }))
        ].sort((a, b) => b.date - a.date);

        res.render('feed', { user, feedItems, pageTitle: 'Fil d\'actualité' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

exports.createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.session.userId);
        const authorName = user.accountType === 'company' ? user.companyName : `${user.prenom} ${user.nom}`;

        const post = new Post({
            author: req.session.userId,
            authorName,
            content,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await post.save();
        res.redirect('/feed');
    } catch (err) {
        console.error(err);
        res.redirect('/feed');
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const userId = req.session.userId;

        if (post.likes.includes(userId)) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();
        res.json({ likes: post.likes.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

exports.commentPost = async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.session.userId);
        const authorName = user.accountType === 'company' ? user.companyName : `${user.prenom} ${user.nom}`;

        await Post.findByIdAndUpdate(req.params.postId, {
            $push: {
                comments: {
                    author: req.session.userId,
                    authorName,
                    content
                }
            }
        });

        res.redirect('/feed');
    } catch (err) {
        console.error(err);
        res.redirect('/feed');
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        
        if (post.author.toString() !== req.session.userId) {
            return res.status(403).redirect('/feed');
        }

        await Post.findByIdAndDelete(req.params.postId);
        res.redirect('/feed');
    } catch (err) {
        console.error(err);
        res.redirect('/feed');
    }
};
