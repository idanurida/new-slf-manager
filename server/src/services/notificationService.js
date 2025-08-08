// server/src/services/notificationService.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const Project = require('../models/Project');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Create notification for user
 * @param {number} userId - User ID to notify
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Additional options
 * @returns {Promise<Notification>}
 */
exports.createNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null,
      related_project_id: options.projectId || null,
      related_type: options.relatedType || null,
      related_id: options.relatedId || null,
      is_read: false
    });

    // Send email notification if enabled
    if (options.sendEmail) {
      await this.sendEmailNotification(userId, title, message, options);
    }

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Send email notification
 * @param {number} userId - User ID
 * @param {string} title - Email title
 * @param {string} message - Email message
 * @param {object} options - Email options
 */
exports.sendEmailNotification = async (userId, title, message, options = {}) => {
  try {
    // Get user email
    const user = await User.findByPk(userId);
    if (!user || !user.email) {
      console.warn(`No email found for user ID: ${userId}`);
      return;
    }

    // Configure email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER || 'noreply@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@slf-one.com',
      to: user.email,
      subject: `[SLF One] ${title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f8fafc; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { 
              display: inline-block; 
              padding: 10px 20px; 
              background: #2563eb; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>SLF One Manager</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${message}</p>
              ${options.actionUrl ? `<a href="${options.actionUrl}" class="btn">Lihat Detail</a>` : ''}
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} SLF One Manager. Hak Cipta Dilindungi.</p>
              <p>Email ini dikirim secara otomatis. Mohon tidak membalas.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email notification sent to ${user.email}`);
  } catch (error) {
    console.error('Send email notification error:', error);
  }
};

/**
 * Get user notifications
 * @param {number} userId - User ID
 * @param {object} options - Query options
 * @returns {Promise<object>}
 */
exports.getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const whereConditions = { user_id: userId };
    if (unreadOnly) {
      whereConditions.is_read = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Project,
          as: 'relatedProject',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      notifications: rows,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };
  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID
 * @returns {Promise<Notification>}
 */
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Not authorized to update this notification');
    }

    await notification.update({ is_read: true });
    return notification;
  } catch (error) {
    console.error('Mark notification as read error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @param {number} userId - User ID
 * @returns {Promise<number>}
 */
exports.markAllAsRead = async (userId) => {
  try {
    const [updatedCount] = await Notification.update(
      { is_read: true },
      { where: { user_id: userId, is_read: false } }
    );
    return updatedCount;
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    throw error;
  }
};

/**
 * Delete notification
 * @param {number} notificationId - Notification ID
 * @param {number} userId - User ID
 * @returns {Promise<boolean>}
 */
exports.deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new Error('Not authorized to delete this notification');
    }

    await notification.destroy();
    return true;
  } catch (error) {
    console.error('Delete notification error:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @param {number} userId - User ID
 * @returns {Promise<number>}
 */
exports.getUnreadCount = async (userId) => {
  try {
    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
    return count;
  } catch (error) {
    console.error('Get unread notification count error:', error);
    throw error;
  }
};

/**
 * Create bulk notifications
 * @param {Array<number>} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Additional options
 * @returns {Promise<Array<Notification>>}
 */
exports.createBulkNotifications = async (userIds, title, message, options = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null,
      related_project_id: options.projectId || null,
      related_type: options.relatedType || null,
      related_id: options.relatedId || null,
      is_read: false
    }));

    const createdNotifications = await Notification.bulkCreate(notifications);
    return createdNotifications;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
};

/**
 * Send notification to project team
 * @param {number} projectId - Project ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {object} options - Additional options
 */
exports.notifyProjectTeam = async (projectId, title, message, options = {}) => {
  try {
    // Get project with team members
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: 'projectLead',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'client',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Collect team member IDs
    const teamMemberIds = [];
    
    // Add project lead
    if (project.project_lead_id) {
      teamMemberIds.push(project.project_lead_id);
    }
    
    // Add client
    if (project.client_id) {
      teamMemberIds.push(project.client_id);
    }

    // Create notifications for team members
    if (teamMemberIds.length > 0) {
      await this.createBulkNotifications(teamMemberIds, title, message, {
        ...options,
        projectId,
        relatedType: 'project',
        relatedId: projectId
      });
    }

    console.log(`🔔 Project team notified for project ${projectId}`);
  } catch (error) {
    console.error('Notify project team error:', error);
    throw error;
  }
};

module.exports = exports;