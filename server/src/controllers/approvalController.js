// server/src/controllers/approvalController.js
const Approval = require('../models/Approval');
const Report = require('../models/Report');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Op } = require('sequelize');

/**
 * Mendapatkan approval berdasarkan role pengguna
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getApprovalsByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for approval' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Ambil approval berdasarkan role
    const approvals = await Approval.findAll({
      where: {
        role: role,
        user_id: userId
      },
      include: [
        {
          model: Report,
          attributes: ['id', 'title', 'project_id', 'status'],
          include: [
            {
              model: Project,
              attributes: ['id', 'name', 'owner_name', 'address']
            }
          ]
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(approvals);
  } catch (error) {
    console.error('Get approvals by role error:', error);
    res.status(500).json({ error: 'Server error while fetching approvals' });
  }
};

/**
 * Mendapatkan approval berdasarkan ID report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getReportApprovals = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Verifikasi report
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Ambil semua approval untuk report ini
    const approvals = await Approval.findAll({
      where: {
        report_id: reportId
      },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json(approvals);
  } catch (error) {
    console.error('Get report approvals error:', error);
    res.status(500).json({ error: 'Server error while fetching report approvals' });
  }
};

/**
 * Memberikan approval oleh role tertentu
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.approveByRole = async (req, res) => {
  try {
    const { reportId, role } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for approval' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Verifikasi report
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Cek apakah sudah ada approval dari role ini
    const existingApproval = await Approval.findOne({
      where: {
        report_id: reportId,
        role: role
      }
    });

    if (existingApproval) {
      return res.status(400).json({ error: `Approval by ${role} already exists` });
    }

    // Buat approval baru
    const approval = await Approval.create({
      report_id: reportId,
      user_id: userId,
      role: role,
      status: 'approved',
      comment: comment || null,
      approved_at: new Date()
    });

    // Update status report berdasarkan role
    let updateData = {};
    switch (role) {
      case 'project_lead':
        updateData.status = 'approved_by_project_lead';
        updateData.project_lead_approved = true;
        updateData.project_lead_approved_at = new Date();
        updateData.project_lead_comment = comment || null;
        break;
      case 'head_consultant':
        updateData.status = 'approved_by_head_consultant';
        updateData.head_consultant_approved = true;
        updateData.head_consultant_approved_at = new Date();
        updateData.head_consultant_comment = comment || null;
        break;
      case 'klien':
        updateData.status = 'approved_by_client';
        updateData.client_approved = true;
        updateData.client_approved_at = new Date();
        updateData.client_comment = comment || null;
        break;
    }

    await report.update(updateData);

    // Kirim notifikasi ke role berikutnya
    let nextRole = null;
    let nextUserId = null;
    switch (role) {
      case 'project_lead':
        nextRole = 'head_consultant';
        nextUserId = await User.findOne({ where: { role: 'head_consultant' } }).then(u => u ? u.id : null);
        break;
      case 'head_consultant':
        nextRole = 'klien';
        nextUserId = report.client_id;
        break;
      case 'klien':
        nextRole = null;
        // Laporan siap dikirim ke pemerintah
        await report.update({
          status: 'sent_to_government',
          sent_to_government_at: new Date()
        });
        break;
    }

    if (nextRole && nextUserId) {
      await Notification.create({
        user_id: nextUserId,
        title: 'Laporan SLF Butuh Persetujuan',
        message: `Laporan "${report.title}" telah disetujui oleh ${role}. Silakan berikan persetujuan Anda.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/${nextRole}/reports/${reportId}`
      });
    }

    res.json({
      message: `Laporan berhasil disetujui oleh ${role}`,
      approval
    });
  } catch (error) {
    console.error('Approve by role error:', error);
    res.status(500).json({ error: 'Server error while approving report' });
  }
};

/**
 * Menolak approval oleh role tertentu
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.rejectByRole = async (req, res) => {
  try {
    const { reportId, role } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    // Validasi role
    const validRoles = ['project_lead', 'head_consultant', 'klien'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role for rejection' });
    }

    // Verifikasi bahwa pengguna memiliki role yang benar
    if (req.user.role !== role) {
      return res.status(403).json({ error: `You are not authorized as ${role}` });
    }

    // Verifikasi report
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Cek apakah sudah ada approval dari role ini
    const existingApproval = await Approval.findOne({
      where: {
        report_id: reportId,
        role: role
      }
    });

    if (existingApproval) {
      return res.status(400).json({ error: `Approval by ${role} already exists` });
    }

    // Buat approval dengan status rejected
    const approval = await Approval.create({
      report_id: reportId,
      user_id: userId,
      role: role,
      status: 'rejected',
      comment: comment || null,
      rejected_at: new Date()
    });

    // Update status report berdasarkan role
    let updateData = {};
    switch (role) {
      case 'project_lead':
        updateData.status = 'rejected_by_project_lead';
        updateData.project_lead_approved = false;
        updateData.project_lead_rejected_at = new Date();
        updateData.project_lead_comment = comment || null;
        break;
      case 'head_consultant':
        updateData.status = 'rejected_by_head_consultant';
        updateData.head_consultant_approved = false;
        updateData.head_consultant_rejected_at = new Date();
        updateData.head_consultant_comment = comment || null;
        break;
      case 'klien':
        updateData.status = 'rejected_by_client';
        updateData.client_approved = false;
        updateData.client_rejected_at = new Date();
        updateData.client_comment = comment || null;
        break;
    }

    await report.update(updateData);

    // Kirim notifikasi ke role sebelumnya
    let previousRole = null;
    let previousUserId = null;
    switch (role) {
      case 'project_lead':
        // Tidak ada role sebelumnya, kembali ke drafter
        previousRole = 'drafter';
        previousUserId = report.drafter_id;
        break;
      case 'head_consultant':
        previousRole = 'project_lead';
        previousUserId = report.project_lead_id;
        break;
      case 'klien':
        previousRole = 'head_consultant';
        previousUserId = await User.findOne({ where: { role: 'head_consultant' } }).then(u => u ? u.id : null);
        break;
    }

    if (previousRole && previousUserId) {
      await Notification.create({
        user_id: previousUserId,
        title: 'Laporan SLF Ditolak',
        message: `Laporan "${report.title}" ditolak oleh ${role}. Komentar: ${comment || 'Tidak ada komentar.'}`,
        priority: 'urgent',
        action_required: true,
        action_url: `/dashboard/${previousRole}/reports/${reportId}`
      });
    }

    res.json({
      message: `Laporan ditolak oleh ${role}`,
      approval
    });
  } catch (error) {
    console.error('Reject by role error:', error);
    res.status(500).json({ error: 'Server error while rejecting report' });
  }
};

/**
 * Mendapatkan status approval untuk sebuah report
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getApprovalStatus = async (req, res) => {
  try {
    const { reportId } = req.params;

    // Verifikasi report
    const report = await Report.findByPk(reportId);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Ambil semua approval untuk report ini
    const approvals = await Approval.findAll({
      where: {
        report_id: reportId
      },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // Buat summary status
    const statusSummary = {
      project_lead: approvals.find(a => a.role === 'project_lead'),
      head_consultant: approvals.find(a => a.role === 'head_consultant'),
      klien: approvals.find(a => a.role === 'klien')
    };

    res.json({
      report_status: report.status,
      approvals: statusSummary,
      all_approvals: approvals
    });
  } catch (error) {
    console.error('Get approval status error:', error);
    res.status(500).json({ error: 'Server error while fetching approval status' });
  }
};