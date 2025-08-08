// server/src/controllers/adminController.js
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs').promises;
const path = require('path');

/**
 * Mendapatkan semua pembayaran yang perlu diverifikasi (status: pending)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getPendingPayments = async (req, res) => {
  try {
    // Hanya Admin Lead yang bisa mengakses
    if (req.user.role !== 'admin_lead') {
      return res.status(403).json({ error: 'Hanya Admin Lead yang bisa mengakses halaman ini' });
    }

    const payments = await Payment.findAll({
      where: {
        status: 'pending'
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name', 'address']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get pending payments error:', error);
    res.status(500).json({ error: 'Server error while fetching pending payments' });
  }
};

/**
 * Mendapatkan detail pembayaran berdasarkan ID
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Hanya Admin Lead yang bisa mengakses
    if (req.user.role !== 'admin_lead') {
      return res.status(403).json({ error: 'Hanya Admin Lead yang bisa mengakses halaman ini' });
    }

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name', 'address', 'building_function']
        },
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching payment' });
  }
};

/**
 * Memverifikasi pembayaran (approve)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    // Hanya Admin Lead yang bisa memverifikasi
    if (req.user.role !== 'admin_lead') {
      return res.status(403).json({ error: 'Hanya Admin Lead yang bisa memverifikasi pembayaran' });
    }

    // Cari pembayaran
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }

    // Cek apakah status masih pending
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Pembayaran sudah diverifikasi' });
    }

    // Update status pembayaran
    await payment.update({
      status: 'verified',
      verified_by: userId,
      verified_at: new Date(),
      notes: notes || payment.notes
    });

    // Kirim notifikasi ke Project Lead dan Drafter
    const project = payment.project;
    if (project) {
      // Notifikasi ke Project Lead
      if (project.project_lead_id) {
        await Notification.create({
          user_id: project.project_lead_id,
          title: 'Pembayaran Diverifikasi',
          message: `Pembayaran untuk proyek "${project.name}" telah diverifikasi oleh Admin Lead.`,
          priority: 'medium',
          action_required: true,
          action_url: `/dashboard/project-lead/projects/${project.id}/payments`
        });
      }

      // Notifikasi ke Drafter
      if (project.drafter_id) {
        await Notification.create({
          user_id: project.drafter_id,
          title: 'Pembayaran Diverifikasi',
          message: `Pembayaran untuk proyek "${project.name}" telah diverifikasi oleh Admin Lead.`,
          priority: 'medium',
          action_required: false,
          action_url: `/dashboard/drafter/projects/${project.id}/payments`
        });
      }
    }

    // Kirim notifikasi ke Klien
    if (project && project.client_id) {
      await Notification.create({
        user_id: project.client_id,
        title: 'Pembayaran Diverifikasi',
        message: `Pembayaran untuk proyek "${project.name}" telah diverifikasi. Laporan akan segera dibuat.`,
        priority: 'medium',
        action_required: false,
        action_url: `/dashboard/client/projects/${project.id}/payments`
      });
    }

    res.json({
      message: 'Pembayaran berhasil diverifikasi',
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Server error while verifying payment' });
  }
};

/**
 * Menolak pembayaran (reject)
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason, notes } = req.body;
    const userId = req.user.id;

    // Hanya Admin Lead yang bisa menolak
    if (req.user.role !== 'admin_lead') {
      return res.status(403).json({ error: 'Hanya Admin Lead yang bisa menolak pembayaran' });
    }

    // Validasi input
    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({ error: 'Alasan penolakan wajib diisi' });
    }

    // Cari pembayaran
    const payment = await Payment.findByPk(id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }

    // Cek apakah status masih pending
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Pembayaran sudah diverifikasi' });
    }

    // Update status pembayaran
    await payment.update({
      status: 'rejected',
      verified_by: userId,
      verified_at: new Date(),
      rejection_reason: rejection_reason.trim(),
      notes: notes || payment.notes
    });

    // Kirim notifikasi ke Project Lead
    const project = payment.project;
    if (project && project.project_lead_id) {
      await Notification.create({
        user_id: project.project_lead_id,
        title: 'Pembayaran Ditolak',
        message: `Pembayaran untuk proyek "${project.name}" ditolak oleh Admin Lead. Alasan: ${rejection_reason}`,
        priority: 'high',
        action_required: true,
        action_url: `/dashboard/project-lead/projects/${project.id}/payments`
      });
    }

    // Kirim notifikasi ke Klien
    if (project && project.client_id) {
      await Notification.create({
        user_id: project.client_id,
        title: 'Pembayaran Ditolak',
        message: `Pembayaran untuk proyek "${project.name}" ditolak. Alasan: ${rejection_reason}`,
        priority: 'high',
        action_required: true,
        action_url: `/dashboard/client/projects/${project.id}/payments`
      });
    }

    res.json({
      message: 'Pembayaran berhasil ditolak',
      payment
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Server error while rejecting payment' });
  }
};

/**
 * Upload bukti pembayaran
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.uploadPaymentProof = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, payment_date, due_date, notes } = req.body;

    // Validasi file upload
    if (!req.file) {
      return res.status(400).json({ error: 'File bukti pembayaran wajib diunggah' });
    }

    // Validasi input
    if (!amount || !payment_date) {
      return res.status(400).json({ error: 'Jumlah dan tanggal pembayaran wajib diisi' });
    }

    // Cari project
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    // Buat pembayaran baru
    const payment = await Payment.create({
      project_id: projectId,
      amount: parseFloat(amount),
      payment_date: new Date(payment_date),
      due_date: due_date ? new Date(due_date) : null,
      proof_file_path: req.file.path,
      status: 'pending',
      notes: notes || null
    });

    // Kirim notifikasi ke Admin Lead
    const adminLead = await User.findOne({ where: { role: 'admin_lead' } });
    if (adminLead) {
      await Notification.create({
        user_id: adminLead.id,
        title: 'Bukti Pembayaran Baru',
        message: `Bukti pembayaran baru untuk proyek "${project.name}" telah diunggah oleh klien.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/admin-lead/payments/${payment.id}`
      });
    }

    res.status(201).json({
      message: 'Bukti pembayaran berhasil diunggah',
      payment
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    
    // Hapus file jika ada error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file after failed upload:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Server error while uploading payment proof' });
  }
};

/**
 * Mendapatkan riwayat pembayaran untuk sebuah proyek
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getProjectPayments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const payments = await Payment.findAll({
      where: {
        project_id: projectId
      },
      include: [
        {
          model: User,
          as: 'verifier',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get project payments error:', error);
    res.status(500).json({ error: 'Server error while fetching project payments' });
  }
};

/**
 * Mendapatkan statistik pembayaran untuk dashboard Admin Lead
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getPaymentStats = async (req, res) => {
  try {
    // Hanya Admin Lead yang bisa mengakses
    if (req.user.role !== 'admin_lead') {
      return res.status(403).json({ error: 'Hanya Admin Lead yang bisa mengakses halaman ini' });
    }

    // Hitung statistik
    const totalPayments = await Payment.count();
    const pendingPayments = await Payment.count({ where: { status: 'pending' } });
    const verifiedPayments = await Payment.count({ where: { status: 'verified' } });
    const rejectedPayments = await Payment.count({ where: { status: 'rejected' } });

    // Hitung total amount
    const totalAmountResult = await Payment.sum('amount');
    const totalAmount = totalAmountResult || 0;

    res.json({
      stats: {
        totalPayments,
        pendingPayments,
        verifiedPayments,
        rejectedPayments,
        totalAmount
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Server error while fetching payment statistics' });
  }
};