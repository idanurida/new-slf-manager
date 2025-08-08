// server/src/routes/inspections.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getScheduledInspections,
  getInspectionById,
  createInspection,
  updateInspection,
  deleteInspection,
  scheduleInspection,
  startInspection,
  completeInspection,
  getMyInspections,
  getInspectionChecklist,
  addChecklistResponse,
  getChecklistResponses,
  getInspectionPhotos,
  uploadPhoto,
  getInspectionSimak,
  addSimakResponse,
  getSimakResponses
} = require('../controllers/inspectionController');
const multer = require('multer');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/photos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg');
  }
});

const upload = multer({ storage: storage });

// Inspection scheduling
router.get('/scheduled', protect, authorize('project_lead', 'head_consultant'), getScheduledInspections);
router.get('/my-inspections', protect, authorize('inspektor'), getMyInspections);
router.post('/', protect, authorize('project_lead', 'head_consultant'), createInspection);
router.put('/:id/schedule', protect, authorize('project_lead', 'head_consultant'), scheduleInspection);

// Inspection lifecycle
router.get('/:id', protect, getInspectionById);
router.put('/:id', protect, authorize('project_lead', 'head_consultant'), updateInspection);
router.delete('/:id', protect, authorize('project_lead', 'head_consultant'), deleteInspection);
router.put('/:id/start', protect, authorize('inspektor'), startInspection);
router.put('/:id/complete', protect, authorize('inspektor'), completeInspection);

// Checklist management
router.get('/:id/checklist', protect, getInspectionChecklist);
router.post('/:id/checklist-responses', protect, authorize('inspektor'), addChecklistResponse);
router.get('/:id/checklist-responses', protect, getChecklistResponses);

// Simak management
router.get('/:id/simak', protect, getInspectionSimak);
router.post('/:id/simak-responses', protect, authorize('inspektor'), addSimakResponse);
router.get('/:id/simak-responses', protect, getSimakResponses);

// Photo management
router.get('/:id/photos', protect, getInspectionPhotos);
router.post('/:id/photos', protect, authorize('inspektor'), upload.single('photo'), uploadPhoto);

module.exports = router;