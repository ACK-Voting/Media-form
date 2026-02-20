'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { eventsAPI, notificationsAPI, rolesAPI } from '@/lib/api';
import type { Event, Notification, Role } from '@/types';

export default function PortalDashboard() {
    const { user } = useUserAuth();
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [eventsRes, notifRes, rolesRes] = await Promise.allSettled([
                eventsAPI.getUpcoming(5),
                notificationsAPI.getAll(1, 5),
                user?._id ? rolesAPI.getUserRoles(user._id) : Promise.resolve({ success: true, roles: [] }),
            ]);

            if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
                setUpcomingEvents(eventsRes.value.events || []);
            }
            if (notifRes.status === 'fulfilled' && notifRes.value.success) {
                setRecentNotifications(notifRes.value.notifications || []);
            }
            if (rolesRes.status === 'fulfilled' && rolesRes.value.success) {
                setRoles(rolesRes.value.roles || []);
            }
        } catch (error) {
            console.error('Dashboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getEventTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            service: 'bg-blue-100 text-blue-700',
            rehearsal: 'bg-green-100 text-green-700',
            meeting: 'bg-purple-100 text-purple-700',
            training: 'bg-orange-100 text-orange-700',
            special: 'bg-pink-100 text-pink-700',
            other: 'bg-gray-100 text-gray-700',
        };
        return colors[type] || colors.other;
    };

    const getNotifIcon = (type: string) => {
        switch (type) {
            case 'application_approved':
                return '✅';
            case 'role_assigned':
                return '🏷️';
            case 'event_created':
                return '📅';
            case 'meeting_minutes_uploaded':
                return '📄';
            default:
                return '🔔';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 lg:p-8 text-white">
                <h1 className="text-2xl lg:text-3xl font-bold">
                    Welcome back, {user?.fullName?.split(' ')[0]} 👋
                </h1>
                <p className="mt-2 text-purple-100 text-sm lg:text-base">
                    Stay up to date with team activities, events, and announcements.
                </p>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl mb-1">📅</div>
                    <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                    <p className="text-sm text-gray-500">Upcoming Events</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl mb-1">🔔</div>
                    <p className="text-2xl font-bold text-gray-900">{recentNotifications.filter(n => !n.isRead).length}</p>
                    <p className="text-sm text-gray-500">Unread Alerts</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl mb-1">🏷️</div>
                    <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                    <p className="text-sm text-gray-500">Assigned Roles</p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <div className="text-2xl mb-1">👤</div>
                    <p className="text-2xl font-bold text-gray-900">{user?.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm text-gray-500">Account Status</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
                        <Link href="/portal/calendar" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="px-5 pb-5">
                        {upcomingEvents.length === 0 ? (
                            <p className="text-gray-400 text-sm py-6 text-center">No upcoming events</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event._id}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex flex-col items-center justify-center">
                                            <span className="text-xs font-bold text-purple-600 uppercase">
                                                {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-lg font-bold text-purple-700 leading-tight">
                                                {new Date(event.eventDate).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{event.eventTime} • {event.location}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                                                {event.eventType}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className="font-semibold text-gray-900">Recent Notifications</h2>
                        <Link href="/portal/notifications" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="px-5 pb-5">
                        {recentNotifications.length === 0 ? (
                            <p className="text-gray-400 text-sm py-6 text-center">No notifications yet</p>
                        ) : (
                            <div className="space-y-2">
                                {recentNotifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${notif.isRead ? 'bg-white' : 'bg-purple-50/50'
                                            }`}
                                    >
                                        <span className="text-lg flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(notif.createdAt)}</p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Assigned Roles */}
            {roles.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="px-5 pt-5 pb-3">
                        <h2 className="font-semibold text-gray-900">Your Roles</h2>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {roles.map((userRole: any) => (
                                <div
                                    key={userRole._id}
                                    className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                                >
                                    <h3 className="font-semibold text-purple-900 text-sm">{userRole.roleId?.name || 'Role'}</h3>
                                    <p className="text-xs text-purple-600 mt-1">{userRole.roleId?.description || ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
