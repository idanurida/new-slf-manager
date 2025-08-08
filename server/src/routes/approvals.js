// server/src/routes/approvals.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getApprovalsByRole,
  getReportApprovals,
  approveByRole,
  rejectByRole,
  getApprovalStatus
} = require('../controllers/approvalController');

// Get approvals by role
router.get('/role/:role', protect, authorize('project_lead', 'head_consultant', 'klien'), getApprovalsByRole);

// Get report approvals
router.get('/reports/:reportId', protect, getReportApprovals);

// Get approval status
router.get('/reports/:reportId/status', protect, getApprovalStatus);

// Approve by role
router.post('/reports/:reportId/approve/:role', protect, authorize('project_lead', 'head_consultant', 'klien'), approveByRole);

// Reject by role
router.post('/reports/:reportId/reject/:role', protect, authorize('project_lead', 'head_consultant', 'klien'), rejectByRole);

module.exports = router;