const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for CV uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'cv-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Seuls les fichiers PDF et DOC sont autorisés'));
    }
});

router.get('/', auth, messageController.getConversations);
router.get('/blocked', auth, messageController.getBlockedUsers);
router.get('/start/:userId', auth, messageController.startConversation);
router.get('/:id', auth, messageController.getConversation);
router.post('/:conversationId/send', auth, upload.single('cvFile'), messageController.sendMessage);
router.delete('/:messageId/delete', auth, messageController.deleteMessage);
router.delete('/conversation/:conversationId/delete', auth, messageController.deleteConversation);
router.post('/block/:userId', auth, messageController.blockUser);
router.post('/unblock/:userId', auth, messageController.unblockUser);
router.get('/api/unread-count', auth, messageController.getUnreadCount);

module.exports = router;

