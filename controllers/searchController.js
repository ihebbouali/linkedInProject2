const User = require('../models/User');

// Search profiles
exports.searchProfiles = async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || query.length < 2) {
            return res.json([]);
        }
        
        const currentUser = await User.findById(req.session.userId);
        
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
        
        // Filter out blocked users
        const filteredUsers = users.filter(user => 
            !currentUser.blockedUsers.some(blockedId => blockedId.toString() === user._id.toString())
        );
        
        res.json(filteredUsers);
    } catch (err) {
        console.error(err);
        res.json([]);
    }
};
