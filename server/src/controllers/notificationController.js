// server/src/controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Get user notifications
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0, unread_only = false } = req.query;

    const whereConditions = { user_id: req.user.id };
    if (unread_only === 'true') {
      whereConditions.is_read = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      notifications: notifications.rows,
      total: notifications.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
};

/**
 * Mark notification as read
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this notification' });
    }

    await notification.update({ is_read: true });

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
};

/**
 * Mark all notifications as read
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const updated = await Notification.update(
      { is_read: true },
      { where: { user_id: req.user.id, is_read: false } }
    );

    res.json({ 
      message: 'All notifications marked as read',
      updated_count: updated[0]
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Server error while updating notifications' });
  }
};

/**
 * Delete notification
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this notification' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error while deleting notification' });
  }
};

/**
 * Create notification (internal use)
 * @param {number} userId 
 * @param {string} title 
 * @param {string} message 
 * @param {object} options 
 * @returns {Promise<Notification>}
 */
exports.createNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      related_project_id: options.projectId,
      related_type: options.relatedType,
      related_id: options.relatedId,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null
    });

    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Bulk create notifications for multiple users
 * @param {Array<number>} userIds 
 * @param {string} title 
 * @param {string} message 
 * @param {object} options 
 * @returns {Promise<Array<Notification>>}
 */
exports.createBulkNotifications = async (userIds, title, message, options = {}) => {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      related_project_id: options.projectId,
      related_type: options.relatedType,
      related_id: options.relatedId,
      priority: options.priority || 'medium',
      action_required: options.actionRequired || false,
      action_url: options.actionUrl || null
    }));

    const created = await Notification.bulkCreate(notifications);
    
    return created;
  } catch (error) {
    console.error('Create bulk notifications error:', error);
    throw error;
  }
};