const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Config Upload Image
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, 'post-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/', auth, postController.getFeed);
router.post('/create', auth, upload.single('image'), postController.createPost);
router.post('/:postId/like', auth, postController.likePost);
router.post('/:postId/comment', auth, postController.commentPost);
router.get('/:postId/delete', auth, postController.deletePost);

module.exports = router;
