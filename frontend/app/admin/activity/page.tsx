'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { activityAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface Activity {
  _id: string;
  adminId: {
    _id: string;
    username: string;
    email: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  metadata: any;
  ipAddress?: string;
  createdAt: string;
}

function ActivityPage() {
  const { showError } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch activities
  const fetchActivities = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await activityAPI.getRecent(currentPage, 20);
      if (response.success) {
        setActivities(response.data);
        setTotalPages(response.pagination.pages);
      }
    } catch (error: any) {
      showError('Failed to Load Activities', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(page);
  }, [page]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchActivities(page);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, page]);

  // Get icon for activity type
  const getActivityIcon = (action: string) => {
    const icons: Record<string, string> = {
      application_approved: '✅',
      application_rejected: '❌',
      application_deleted: '🗑️',
      event_created: '📅',
      event_updated: '📝',
      event_deleted: '🗑️',
      role_assigned: '👥',
      role_removed: '👤',
      user_status_changed: '🔄',
      admin_login: '🔐',
      user_created: '➕',
    };
    return icons[action] || '📌';
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Activity Monitor</h1>
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Auto-refresh (30s)</span>
            </label>
            <Button variant="secondary" onClick={() => fetchActivities(page)}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Activities List */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="mt-4 text-gray-600">No activities recorded yet</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-3xl">{getActivityIcon(activity.action)}</span>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(activity.createdAt)}
                        </p>
                        <p className="text-sm text-purple-600">
                          by {activity.adminId?.username || 'System'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function Activity() {
  return (
    <ProtectedRoute>
      <ActivityPage />
    </ProtectedRoute>
  );
}
