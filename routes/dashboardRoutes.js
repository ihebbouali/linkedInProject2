const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Config Upload Image
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Routes
router.get('/', auth, dashboardController.getDashboard);
router.post('/update', auth, upload.single('photo'), dashboardController.updateProfile);

router.post('/skills', auth, dashboardController.addSkill);
router.get('/skills/delete/:id', auth, dashboardController.deleteSkill);

router.post('/experiences', auth, dashboardController.addExperience);
router.get('/experiences/delete/:id', auth, dashboardController.deleteExperience);

router.get('/download-cv', auth, dashboardController.downloadPDF);

module.exports = router;