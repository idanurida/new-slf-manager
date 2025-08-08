// server/src/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPendingPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  uploadPaymentProof,
  getProjectPayments,
  getPaymentStats
} = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Configure multer for payment proof uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payments/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image and PDF files
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and PDF are allowed!'), false);
    }
  }
});

// Payment verification routes (Admin Lead only)
router.get('/payments/pending', protect, authorize(['admin_lead']), getPendingPayments);
router.get('/payments/:id', protect, authorize(['admin_lead']), getPaymentById);
router.put('/payments/:id/verify', protect, authorize(['admin_lead']), verifyPayment);
router.put('/payments/:id/reject', protect, authorize(['admin_lead']), rejectPayment);
router.get('/payments/stats', protect, authorize(['admin_lead']), getPaymentStats);

// Payment upload routes (Client/Project Lead)
router.post('/projects/:projectId/payments/upload', protect, authorize(['klien', 'project_lead']), upload.single('proof'), uploadPaymentProof);
router.get('/projects/:projectId/payments', protect, getProjectPayments);

module.exports = router;