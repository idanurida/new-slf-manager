// server/src/routes/index.js (YANG BENAR)
const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./auth');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const inspectionRoutes = require('./inspections');
const reportRoutes = require('./reports');
const paymentRoutes = require('./payments'); // ← DIKEMBALIKAN
const adminRoutes = require('./admin');     // ← DITAMBAHKAN
const notificationRoutes = require('./notifications');

// Route middleware
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/inspections', inspectionRoutes);
router.use('/reports', reportRoutes);
router.use('/payments', paymentRoutes);     // ← PAYMENT ROUTES
router.use('/admin', adminRoutes);         // ← ADMIN ROUTES (VERIFIKASI)
router.use('/notifications', notificationRoutes);

module.exports = router;