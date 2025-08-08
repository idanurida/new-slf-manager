// server/src/routes/projects.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStatus,
  assignProjectLead,
  assignClient,
  getMyProjects
} = require('../controllers/projectController');

// Public routes
router.get('/status/:id', protect, getProjectStatus);

// Protected routes
router.get('/', protect, getProjects);
router.get('/my-projects', protect, getMyProjects);
router.get('/:id', protect, getProjectById);
router.post('/', protect, authorize(['project_lead', 'head_consultant', 'superadmin']), createProject);
router.put('/:id', protect, authorize(['project_lead', 'head_consultant', 'superadmin']), updateProject);
router.delete('/:id', protect, authorize(['superadmin']), deleteProject);
router.put('/:id/assign/project-lead/:userId', protect, authorize(['head_consultant', 'superadmin']), assignProjectLead);
router.put('/:id/assign/client/:userId', protect, authorize(['head_consultant', 'superadmin']), assignClient);

module.exports = router;