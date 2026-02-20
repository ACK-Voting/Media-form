const Notification = require('../models/Notification');

class NotificationService {
    /**
     * Create a notification for a user
     */
    async createNotification(userId, type, title, message, link = null, metadata = null) {
        try {
            const notification = new Notification({
                userId,
                type,
                title,
                message,
                link,
                metadata
            });
            await notification.save();
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Notify user when their application is approved
     */
    async notifyApplicationApproved(user, temporaryPassword) {
        return this.createNotification(
            user._id,
            'application_approved',
            'Welcome to ACK Media Team!',
            `Your application has been approved! You can now login with your email (${user.email}) and the temporary password sent to your email.`,
            '/profile',
            { temporaryPassword }
        );
    }

    /**
     * Notify user when their application is rejected
     */
    async notifyApplicationRejected(userId, reason) {
        return this.createNotification(
            userId,
            'application_rejected',
            'Application Update',
            `Unfortunately, your application was not approved. ${reason ? `Reason: ${reason}` : ''}`,
            null
        );
    }

    /**
     * Notify user when a role is assigned
     */
    async notifyRoleAssigned(user, role) {
        return this.createNotification(
            user._id,
            'role_assigned',
            'New Role Assigned',
            `You have been assigned the role of ${role.name}. Check your profile to see your new responsibilities.`,
            '/profile',
            { roleId: role._id, roleName: role.name }
        );
    }

    /**
     * Notify user when a role is removed
     */
    async notifyRoleRemoved(user, role) {
        return this.createNotification(
            user._id,
            'role_removed',
            'Role Removed',
            `The role of ${role.name} has been removed from your account.`,
            '/profile',
            { roleId: role._id, roleName: role.name }
        );
    }

    /**
     * Notify all users when a new event is created
     */
    async notifyEventCreated(event, userIds) {
        try {
            const notifications = userIds.map(userId => ({
                userId,
                type: 'event_created',
                title: 'New Event Added',
                message: `${event.title} has been scheduled for ${new Date(event.eventDate).toLocaleDateString()}`,
                link: `/calendar`,
                metadata: { eventId: event._id }
            }));

            await Notification.insertMany(notifications);
            return notifications.length;
        } catch (error) {
            console.error('Error creating event notifications:', error);
            throw error;
        }
    }

    /**
     * Notify users when event is updated
     */
    async notifyEventUpdated(event, userIds) {
        try {
            const notifications = userIds.map(userId => ({
                userId,
                type: 'event_updated',
                title: 'Event Updated',
                message: `${event.title} has been updated. Check the calendar for details.`,
                link: `/calendar`,
                metadata: { eventId: event._id }
            }));

            await Notification.insertMany(notifications);
            return notifications.length;
        } catch (error) {
            console.error('Error creating event update notifications:', error);
            throw error;
        }
    }

    /**
     * Notify all users when meeting minutes are uploaded
     */
    async notifyMeetingUploaded(minutes, userIds) {
        try {
            const notifications = userIds.map(userId => ({
                userId,
                type: 'meeting_uploaded',
                title: 'New Meeting Minutes Available',
                message: `Minutes for "${minutes.title}" have been uploaded.`,
                link: `/meeting-minutes/${minutes._id}`,
                metadata: { minutesId: minutes._id }
            }));

            await Notification.insertMany(notifications);
            return notifications.length;
        } catch (error) {
            console.error('Error creating meeting minutes notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread notifications count for a user
     */
    async getUnreadCount(userId) {
        return await Notification.countDocuments({ userId, isRead: false });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId, userId) {
        return await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        return await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
    }

    /**
     * Get user notifications (paginated)
     */
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ userId });

        return {
            notifications,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Delete old read notifications (cleanup)
     */
    async cleanupOldNotifications(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        return await Notification.deleteMany({
            isRead: true,
            createdAt: { $lt: cutoffDate }
        });
    }
}

module.exports = new NotificationService();
