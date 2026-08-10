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
        if (user) {
            loadDashboardData();
        }
    }, [user]);

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
                console.log('Roles loaded:', rolesRes.value.roles);
                setRoles(rolesRes.value.roles || []);
            } else if (rolesRes.status === 'fulfilled') {
                console.error('Roles request failed:', rolesRes.value);
            } else if (rolesRes.status === 'rejected') {
                console.error('Roles request rejected:', rolesRes.reason);
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
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'application_approved':
                return (
                    <svg className={`${iconClass} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'role_assigned':
                return (
                    <svg className={`${iconClass} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                );
            case 'event_created':
                return (
                    <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                );
            case 'meeting_minutes_uploaded':
                return (
                    <svg className={`${iconClass} text-indigo-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className={`${iconClass} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
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
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-2">
                        <svg className="w-8 h-8 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <h1 className="text-3xl lg:text-4xl font-bold">
                            Welcome back, {user?.fullName?.split(' ')[0]}!
                        </h1>
                    </div>
                    <p className="mt-2 text-purple-100 text-base lg:text-lg">
                        Stay up to date with team activities, events, and announcements.
                    </p>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/portal/calendar" className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{upcomingEvents.length}</p>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                </Link>

                <Link href="/portal/notifications" className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{recentNotifications.filter(n => !n.isRead).length}</p>
                    <p className="text-sm text-gray-600">Unread Alerts</p>
                </Link>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{roles.length}</p>
                    <p className="text-sm text-gray-600">Assigned Roles</p>
                </div>

                <Link href="/portal/profile" className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{user?.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-sm text-gray-600">Account Status</p>
                </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Upcoming Events</h2>
                        <Link href="/portal/calendar" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="px-5 pb-5">
                        {upcomingEvents.length === 0 ? (
                            <p className="text-gray-400 text-base py-6 text-center">No upcoming events</p>
                        ) : (
                            <div className="space-y-4">
                                {upcomingEvents.map((event) => (
                                    <div
                                        key={event._id}
                                        className="flex items-start gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors"
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
                                            <p className="font-medium text-gray-900 text-base truncate">{event.title}</p>
                                            <p className="text-sm text-gray-500 mt-0.5">{event.eventTime} • {event.location}</p>
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
                        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Recent Notifications</h2>
                        <Link href="/portal/notifications" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                            View All →
                        </Link>
                    </div>
                    <div className="px-5 pb-5">
                        {recentNotifications.length === 0 ? (
                            <p className="text-gray-400 text-base py-6 text-center">No notifications yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentNotifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 border ${notif.isRead ? 'bg-white border-gray-100 hover:border-gray-200' : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex-shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(notif.createdAt)}</p>
                                        </div>
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2 animate-pulse"></div>
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
                        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">Your Roles</h2>
                    </div>
                    <div className="px-5 pb-5">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {roles.map((userRole: any) => (
                                <div
                                    key={userRole._id}
                                    className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100"
                                >
                                    <h3 className="font-semibold text-purple-900 text-base">{userRole.roleId?.name || 'Role'}</h3>
                                    <p className="text-sm text-purple-600 mt-1">{userRole.roleId?.description || ''}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
