'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { notificationsAPI } from '@/lib/api';
import { useUserAuth } from '@/contexts/UserAuthContext';
import type { Notification } from '@/types';

export default function NotificationsPage() {
    const { refreshUnreadCount } = useUserAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, [page]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const res = await notificationsAPI.getAll(page, 20);
            if (res.success) {
                setNotifications(res.notifications || []);
                setTotalPages(res.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
            refreshUnreadCount();
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            refreshUnreadCount();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await notificationsAPI.delete(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
            refreshUnreadCount();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getIcon = (type: string) => {
        const icons: Record<string, string> = {
            application_approved: '✅',
            application_rejected: '❌',
            role_assigned: '🏷️',
            role_removed: '🔓',
            event_created: '📅',
            event_updated: '📝',
            meeting_minutes_uploaded: '📄',
        };
        return icons[type] || '🔔';
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHrs < 24) return `${diffHrs}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="text-5xl mb-3">🔔</div>
                    <p className="text-lg text-gray-400">No notifications yet</p>
                    <p className="text-sm text-gray-300 mt-1">You&apos;ll be notified about important updates here</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${notif.isRead ? 'border-gray-100' : 'border-purple-200 bg-purple-50/30'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-xl flex-shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h3 className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                                            {formatTime(notif.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-2">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="text-xs text-gray-400 hover:text-red-500 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                {!notif.isRead && (
                                    <div className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
