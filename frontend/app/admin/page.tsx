'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { submissionsAPI, activityAPI } from '@/lib/api';
import type { Registration, Stats } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Activity {
  _id: string;
  adminId: {
    username: string;
  };
  action: string;
  description: string;
  createdAt: string;
}

function DashboardOverview() {
  const { admin } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<Registration[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, submissionsRes, activitiesRes] = await Promise.all([
        submissionsAPI.getStats(),
        submissionsAPI.getAll(1, 5, '', '', 'submittedAt', 'desc'),
        activityAPI.getRecent(1, 5),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (submissionsRes.success) setRecentSubmissions(submissionsRes.data || []);
      if (activitiesRes.success) setRecentActivities(activitiesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    const icons: Record<string, JSX.Element> = {
      application_approved: (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      application_rejected: (
        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      application_deleted: (
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      event_created: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      event_updated: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      event_deleted: (
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      role_assigned: (
        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      role_removed: (
        <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
        </svg>
      ),
      user_status_changed: (
        <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      admin_login: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
      user_created: (
        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    };
    return icons[action] || (
      <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'account_created':
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    }
  };

  const quickActions = [
    {
      name: 'Review Applications',
      description: 'View and approve pending applications',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/applications',
      count: stats?.pending || 0,
    },
    {
      name: 'View Analytics',
      description: 'Detailed insights and reports',
      icon: (
        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-purple-500 to-pink-500',
      href: '/admin/analytics',
    },
    {
      name: 'Manage Events',
      description: 'Create and schedule team events',
      icon: (
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-green-500 to-emerald-500',
      href: '/admin/events',
    },
    {
      name: 'Team Members',
      description: 'Manage active team members',
      icon: (
        <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-red-500',
      href: '/admin/members',
      count: (stats?.approved || 0) + (stats?.accountCreated || 0),
    },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {admin?.username}!
            </h1>
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          </div>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your media team today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
                {stats?.recentSubmissions !== undefined && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    +{stats.recentSubmissions} this week
                  </p>
                )}
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pending || 0}</p>
                {stats?.pending && stats.pending > 0 && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-3"
                    onClick={() => router.push('/admin/applications?status=pending')}
                  >
                    Review Now
                  </Button>
                )}
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {(stats?.approved || 0) + (stats?.accountCreated || 0)}
                </p>
                {stats?.total && stats?.approved !== undefined && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    {Math.round(((stats.approved + (stats.accountCreated || 0)) / stats.total) * 100)}% approval rate
                  </p>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.recentSubmissions || 0}
                </p>
                <p className="text-xs text-purple-600 mt-2 font-medium">
                  Last 7 days
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.name}
                className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
                onClick={() => router.push(action.href)}
              >
                <div className={`h-1.5 bg-gradient-to-r ${action.color}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 bg-gray-100 rounded-lg group-hover:bg-white transition-colors">
                      {action.icon}
                    </div>
                    {action.count !== undefined && action.count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {action.count}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{action.name}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/applications')}
              >
                View All
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No recent applications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => router.push('/admin/applications')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                        {submission.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{submission.fullName}</p>
                        <p className="text-sm text-gray-500">
                          {submission.mediaSkills?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(submission.status)}`}>
                        {submission.status === 'account_created' ? 'Approved' : submission.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Feed */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/admin/activity')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Service</p>
                <p className="text-xs text-gray-500">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full absolute top-0 left-0 animate-ping"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Portal</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardOverview />
    </ProtectedRoute>
  );
}
