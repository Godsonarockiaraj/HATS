const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get notifications for current user
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let query = { user: req.user._id };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('applicationId', 'job')
      .populate('jobId', 'title department isTechnical')
      .populate({
        path: 'applicationId',
        populate: {
          path: 'job',
          select: 'title department isTechnical'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read and auto-delete after viewing
router.put('/:notificationId/read', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { autoDelete = true } = req.body;
    
    if (autoDelete) {
      // Delete the notification immediately after marking as read
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: req.user._id
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification viewed and deleted', notification });
    } else {
      // Just mark as read without deleting
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing notification', error: error.message });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const { autoDelete = false } = req.body;
    
    if (autoDelete) {
      // Delete all unread notifications
      const result = await Notification.deleteMany({
        user: req.user._id,
        read: false
      });

      res.json({ 
        message: 'All unread notifications deleted', 
        deletedCount: result.deletedCount 
      });
    } else {
      // Just mark as read
      await Notification.updateMany(
        { user: req.user._id, read: false },
        { read: true }
      );

      res.json({ message: 'All notifications marked as read' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error processing notifications', error: error.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;


