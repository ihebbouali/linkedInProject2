const User = require('../models/User');

// Search profiles
exports.searchProfiles = async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || query.length < 2) {
            return res.json([]);
        }
        
        // Search by name, company name, or email
        const users = await User.find({
            _id: { $ne: req.session.userId }, // Exclude current user
            $or: [
                { nom: { $regex: query, $options: 'i' } },
                { prenom: { $regex: query, $options: 'i' } },
                { companyName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        })
        .select('nom prenom companyName email accountType photo_url')
        .limit(10);
        
        res.json(users);
    } catch (err) {
        console.error(err);
        res.json([]);
    }
};
