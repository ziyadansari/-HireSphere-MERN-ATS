
const Notification = require("../models/notificationModel");

// Get logged-in user's notifications
const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user.id
        }).sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            unreadCount,
            notifications
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark one notification as read
const markNotificationRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                recipient: req.user.id
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Mark all notifications as read
const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                recipient: req.user.id,
                isRead: false
            },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: "All notifications marked as read"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
