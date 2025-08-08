// server/src/controllers/paymentController.js
const Payment = require('../models/Payment');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const fs = require('fs').promises;

exports.getPendingPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: {
        status: 'pending'
      },
      include: [
        {
          model: Project,
          as: 'project',
          attributes: ['id', 'name', 'owner_name', 'address']
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

exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id, {
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
      ]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment by ID error:', error);
    res.status(500).json({ error: 'Server error while fetching payment' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findByPk(id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    await payment.update({
      status: 'verified',
      verified_by: userId,
      verified_at: new Date(),
      notes: notes || payment.notes
    });

    // Send notification to Project Lead
    const project = payment.project;
    if (project && project.project_lead_id) {
      await Notification.create({
        user_id: project.project_lead_id,
        title: 'Payment Verified',
        message: `Payment for project "${project.name}" has been verified by Admin Lead.`,
        priority: 'medium',
        action_required: true,
        action_url: `/dashboard/project-lead/projects/${project.id}/payments`
      });
    }

    res.json({
      message: 'Payment verified successfully',
      payment
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Server error while verifying payment' });
  }
};

exports.rejectPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason, notes } = req.body;
    const userId = req.user.id;

    if (!rejection_reason || rejection_reason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const payment = await Payment.findByPk(id, {
      include: [{
        model: Project,
        as: 'project'
      }]
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment already processed' });
    }

    await payment.update({
      status: 'rejected',
      verified_by: userId,
      verified_at: new Date(),
      rejection_reason: rejection_reason.trim(),
      notes: notes || payment.notes
    });

    // Send notification to Project Lead
    const project = payment.project;
    if (project && project.project_lead_id) {
      await Notification.create({
        user_id: project.project_lead_id,
        title: 'Payment Rejected',
        message: `Payment for project "${project.name}" was rejected. Reason: ${rejection_reason}`,
        priority: 'high',
        action_required: true,
        action_url: `/dashboard/project-lead/projects/${project.id}/payments`
      });
    }

    res.json({
      message: 'Payment rejected successfully',
      payment
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({ error: 'Server error while rejecting payment' });
  }
};

exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.count();
    const pendingPayments = await Payment.count({ where: { status: 'pending' } });
    const verifiedPayments = await Payment.count({ where: { status: 'verified' } });
    const rejectedPayments = await Payment.count({ where: { status: 'rejected' } });

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