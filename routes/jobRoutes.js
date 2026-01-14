const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// Public job listing
router.get('/', auth, jobController.getAllJobs);
router.get('/:id', auth, jobController.getJobDetails);

// Apply for job (Personal accounts)
router.post('/:jobId/apply', auth, jobController.applyForJob);

// Post job (Company accounts)
router.get('/post-job/form', auth, jobController.getPostJobForm);
router.post('/post-job', auth, jobController.postJob);

// Company job management
router.get('/my-jobs/list', auth, jobController.getCompanyJobs);
router.get('/my-jobs/:jobId/applications', auth, jobController.getJobApplications);
router.post('/applications/:appId/status', auth, jobController.updateApplicationStatus);
router.get('/my-jobs/:jobId/delete', auth, jobController.deleteJob);

module.exports = router;
