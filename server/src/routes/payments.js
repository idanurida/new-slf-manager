// server/src/routes/payments.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPendingPayments,
  getPaymentById,
  verifyPayment,
  rejectPayment,
  getPaymentStats
} = require('../controllers/paymentController');

// Payment verification routes (Admin Lead only)
router.get('/pending', protect, authorize(['admin_lead']), getPendingPayments);
router.get('/:id', protect, authorize(['admin_lead']), getPaymentById);
router.put('/:id/verify', protect, authorize(['admin_lead']), verifyPayment);
router.put('/:id/reject', protect, authorize(['admin_lead']), rejectPayment);
router.get('/stats', protect, authorize(['admin_lead']), getPaymentStats);

module.exports = router;