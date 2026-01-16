const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get blocked users list
exports.getBlockedUsers = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).populate('blockedUsers', 'nom prenom companyName accountType email photo_url');
        res.render('blocked-users', { user, blockedUsers: user.blockedUsers, pageTitle: 'Utilisateurs bloqués' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Start conversation with a user
exports.startConversation = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const targetUser = await User.findById(req.params.userId);
        
        if (!targetUser) {
            return res.redirect('/messages');
        }
        
        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            $and: [
                { 'participants.user': req.session.userId },
                { 'participants.user': req.params.userId }
            ]
        });
        
        // If no conversation exists, create one
        if (!conversation) {
            conversation = new Conversation({
                participants: [
                    { user: req.session.userId },
                    { user: req.params.userId }
                ],
                lastMessage: '',
                lastMessageAt: new Date()
            });
            await conversation.save();
        }
        
        res.redirect(`/messages/${conversation._id}`);
    } catch (err) {
        console.error(err);
        res.redirect('/messages');
    }
};

// Get all conversations for a user
exports.getConversations = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const conversations = await Conversation.find({
            'participants.user': req.session.userId
        })
        .populate('participants.user', 'nom prenom companyName accountType photo_url')
        .populate('jobApplication')
        .sort({ lastMessageAt: -1 });
        
        // Filter out conversations with blocked users
        const filteredConversations = conversations.filter(conv => {
            const otherParticipant = conv.participants.find(p => p.user._id.toString() !== user._id.toString());
            if (!otherParticipant || !otherParticipant.user) return false;
            return !user.blockedUsers.some(blockedId => blockedId.toString() === otherParticipant.user._id.toString());
        });

        res.render('messages', { user, conversations: filteredConversations, pageTitle: 'Messagerie' });
    } catch (err) {
        console.error(err);
        res.redirect('/dashboard');
    }
};

// Get conversation details
exports.getConversation = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const conversation = await Conversation.findById(req.params.id)
            .populate('participants.user', 'nom prenom companyName accountType email photo_url')
            .populate('jobApplication');

        const messages = await Message.find({ conversation: req.params.id })
            .populate('sender', 'nom prenom companyName accountType')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { conversation: req.params.id, sender: { $ne: req.session.userId }, read: false },
            { read: true }
        );

        res.render('conversation', { user, conversation, messages, pageTitle: 'Conversation' });
    } catch (err) {
        console.error(err);
        res.redirect('/messages');
    }
};

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const { content } = req.body;
        const user = await User.findById(req.session.userId);
        const senderName = user.accountType === 'company' ? user.companyName : `${user.prenom} ${user.nom}`;
        
        // Verify conversation exists and user is participant
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation introuvable' });
        }
        
        const isParticipant = conversation.participants.some(p => p.user.toString() === req.session.userId);
        if (!isParticipant) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const messageData = {
            conversation: req.params.conversationId,
            sender: req.session.userId,
            senderName
        };

        // Handle CV attachment
        if (req.file) {
            messageData.attachment = {
                type: 'cv',
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            };
            messageData.content = content || 'CV envoyé';
        } else {
            if (!content || content.trim() === '') {
                return res.status(400).json({ message: 'Le message ne peut pas être vide' });
            }
            messageData.content = content;
        }

        const message = new Message(messageData);
        await message.save();

        // Update conversation
        const lastMessageText = messageData.attachment ? '📎 Fichier joint' : (content ? content.substring(0, 50) : '');
        await Conversation.findByIdAndUpdate(req.params.conversationId, {
            lastMessage: lastMessageText,
            lastMessageAt: new Date()
        });

        res.status(200).json({ message: 'Message envoyé', data: message });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Delete message
exports.deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message introuvable' });
        }

        if (message.sender.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        message.deleted = true;
        message.deletedAt = new Date();
        message.content = 'Ce message a été supprimé';
        await message.save();

        res.status(200).json({ message: 'Message supprimé' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            'participants.user': req.session.userId
        });

        let unreadCount = 0;
        for (const conv of conversations) {
            const count = await Message.countDocuments({
                conversation: conv._id,
                sender: { $ne: req.session.userId },
                read: false
            });
            unreadCount += count;
        }

        res.json({ unreadCount });
    } catch (err) {
        console.error(err);
        res.json({ unreadCount: 0 });
    }
};

// Block user
exports.blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user.blockedUsers.includes(req.params.userId)) {
            user.blockedUsers.push(req.params.userId);
            await user.save();
        }
        res.json({ message: 'Utilisateur bloqué' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Unblock user
exports.unblockUser = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== req.params.userId);
        await user.save();
        res.json({ message: 'Utilisateur débloqué' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};

// Delete conversation
exports.deleteConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation introuvable' });
        }
        
        // Delete all messages in conversation
        await Message.deleteMany({ conversation: req.params.conversationId });
        
        // Delete conversation
        await Conversation.findByIdAndDelete(req.params.conversationId);
        
        res.json({ message: 'Conversation supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur' });
    }
};
