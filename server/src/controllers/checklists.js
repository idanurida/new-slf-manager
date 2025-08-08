// server/src/routes/checklists.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getChecklistTemplate,
  getChecklistItems,
  getChecklistItemById,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getChecklistResponses,
  addChecklistResponse,
  updateChecklistResponse,
  deleteChecklistResponse,
  getSimakItems,
  getSimakResponses,
  addSimakResponse
} = require('../controllers/checklistController');

// Public routes
router.get('/template', getChecklistTemplate);

// Protected routes
router.get('/items', protect, getChecklistItems);
router.get('/items/:id', protect, getChecklistItemById);
router.post('/items', protect, authorize(['superadmin']), createChecklistItem);
router.put('/items/:id', protect, authorize(['superadmin']), updateChecklistItem);
router.delete('/items/:id', protect, authorize(['superadmin']), deleteChecklistItem);

// Inspection checklist responses
router.get('/inspections/:inspectionId/responses', protect, getChecklistResponses);
router.post('/inspections/:inspectionId/responses', protect, authorize(['inspektor']), addChecklistResponse);
router.put('/responses/:responseId', protect, authorize(['inspektor']), updateChecklistResponse);
router.delete('/responses/:responseId', protect, authorize(['inspektor']), deleteChecklistResponse);

// Simak items and responses
router.get('/simak/items', protect, getSimakItems);
router.get('/inspections/:inspectionId/simak/responses', protect, getSimakResponses);
router.post('/inspections/:inspectionId/simak/responses', protect, authorize(['inspektor']), addSimakResponse);

module.exports = router;