// server/src/routes/reports.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  generatePDFReport,
  generateDOCXReport,
  getProjectReports,
  approveReport,
  rejectReport,
  sendToClient,
  getClientApproval,
  submitToGovernment,
  getSLFIssued,
  getReportStatus
} = require('../controllers/reportController');

// Report management
router.get('/', protect, getReports);
router.get('/projects/:projectId', protect, getProjectReports);
router.get('/:id', protect, getReportById);
router.post('/', protect, authorize('drafter', 'project_lead'), createReport);
router.put('/:id', protect, authorize('drafter', 'project_lead'), updateReport);
router.delete('/:id', protect, authorize('project_lead', 'head_consultant'), deleteReport);

// Report generation
router.post('/:id/pdf', protect, authorize('drafter'), generatePDFReport);
router.post('/:id/docx', protect, authorize('drafter'), generateDOCXReport);

// Approval workflow
router.put('/:id/approve', protect, authorize('project_lead'), approveReport);
router.put('/:id/reject', protect, authorize('project_lead'), rejectReport);
router.put('/:id/send-to-client', protect, authorize('project_lead'), sendToClient);
router.get('/:id/client-approval', protect, getClientApproval);
router.put('/:id/submit-to-government', protect, authorize('project_lead'), submitToGovernment);
router.get('/:id/slf-issued', protect, getSLFIssued);
router.get('/:id/status', protect, getReportStatus);

module.exports = router;