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
        const iconClass = "w-6 h-6";
        switch (type) {
            case 'application_approved':
                return (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'application_rejected':
                return (
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'role_assigned':
                return (
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-purple-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                    </div>
                );
            case 'role_removed':
                return (
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-orange-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            case 'event_created':
                return (
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            case 'event_updated':
                return (
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-indigo-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                );
            case 'meeting_minutes_uploaded':
                return (
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-teal-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className={`${iconClass} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                );
        }
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
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-base text-gray-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-base font-medium text-purple-600 hover:text-purple-700 px-3 py-1.5 hover:bg-purple-50 rounded-lg transition-colors"
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
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <p className="text-xl font-semibold text-gray-700">No notifications yet</p>
                    <p className="text-base text-gray-400 mt-1">You&apos;ll be notified about important updates here</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notif) => (
                        <div
                            key={notif._id}
                            className={`bg-white rounded-xl border shadow-sm p-4 transition-all hover:shadow-md ${notif.isRead ? 'border-gray-100 hover:border-gray-200' : 'border-purple-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 hover:from-purple-50 hover:to-indigo-50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">{getIcon(notif.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                            <h3 className={`text-base ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                                                {notif.title}
                                            </h3>
                                            <p className="text-base text-gray-500 mt-0.5">{notif.message}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatTime(notif.createdAt)}
                                            </span>
                                            {!notif.isRead && (
                                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!notif.isRead && (
                                            <button
                                                onClick={() => markAsRead(notif._id)}
                                                className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Mark as read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteNotification(notif._id)}
                                            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                            </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-base text-gray-500">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-base font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
