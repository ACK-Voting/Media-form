'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import { analyticsAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsData {
  applicationTrends: { _id: string; count: number }[];
  skillsDistribution: { _id: string; count: number }[];
  approvalRateByMonth: { _id: string; approved: number; rejected: number; total: number }[];
  geographicDistribution: { _id: string; count: number }[];
  genderDistribution: { _id: string; count: number }[];
  ageRangeDistribution: { _id: string; count: number }[];
}

interface EventAnalytics {
  eventCountByType: { _id: string; count: number }[];
  avgAttendanceByType: { _id: string; avgAttendees: number; totalEvents: number }[];
  upcomingCount: number;
  pastCount: number;
  eventsTimeline: { _id: string; count: number }[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

function AnalyticsPage() {
  const { showError } = useToast();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, eventsRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getEvents(),
      ]);

      if (overviewRes.success) {
        setAnalyticsData(overviewRes.data);
      }
      if (eventsRes.success) {
        setEventAnalytics(eventsRes.data);
      }
    } catch (error: any) {
      showError('Failed to Load Analytics', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>
          <Card>
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

        {/* Application Trends */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Trends (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData?.applicationTrends || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="Applications" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Skills Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData?.skillsDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gender Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData?.genderDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {(analyticsData?.genderDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Approval Rate by Month */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Rate by Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.approvalRateByMonth || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
              <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Geographic Distribution */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Geographic Distribution (Top 10 Parishes)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.geographicDistribution || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="_id" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Age Range Distribution */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Age Range Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData?.ageRangeDistribution || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" name="Members" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Event Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Events by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventAnalytics?.eventCountByType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="_id"
                >
                  {(eventAnalytics?.eventCountByType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Events Timeline (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventAnalytics?.eventsTimeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#ec4899" strokeWidth={2} name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Event Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Upcoming Events</p>
              <p className="text-4xl font-bold text-green-600">{eventAnalytics?.upcomingCount || 0}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 mb-1">Past Events</p>
              <p className="text-4xl font-bold text-gray-600">{eventAnalytics?.pastCount || 0}</p>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsPage />
    </ProtectedRoute>
  );
}
