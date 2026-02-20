'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { reportsAPI } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import { exportDataToCSV } from '@/lib/export';

type ReportType = 'applications' | 'members' | 'events';

interface ReportData {
  applications?: any[];
  members?: any[];
  events?: any[];
  summary?: any;
}

function ReportsPage() {
  const { showSuccess, showError } = useToast();
  const [reportType, setReportType] = useState<ReportType>('applications');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
  });

  // Generate report
  const generateReport = async () => {
    setGenerating(true);
    try {
      let response;

      switch (reportType) {
        case 'applications':
          response = await reportsAPI.getApplications(
            filters.startDate || undefined,
            filters.endDate || undefined,
            filters.status || undefined
          );
          break;
        case 'members':
          response = await reportsAPI.getMembers();
          break;
        case 'events':
          response = await reportsAPI.getEvents(
            filters.startDate || undefined,
            filters.endDate || undefined
          );
          break;
      }

      if (response?.success) {
        setReportData(response.data);
        showSuccess('Report Generated', 'Your report is ready to view or export');
      }
    } catch (error: any) {
      showError('Failed to Generate Report', error.response?.data?.message || error.message);
    } finally {
      setGenerating(false);
    }
  };

  // Export report to CSV
  const exportReport = () => {
    if (!reportData) return;

    try {
      switch (reportType) {
        case 'applications':
          if (reportData.applications) {
            const headers = [
              'Name',
              'Email',
              'Phone',
              'Gender',
              'Age Range',
              'Parish',
              'Skills',
              'Status',
              'Submitted At',
              'Approved At',
            ];
            const rowMapper = (app: any) => [
              app.fullName,
              app.email,
              app.phoneNumber,
              app.gender,
              app.ageRange,
              app.parishLocation || '',
              app.mediaSkills?.join('; ') || '',
              app.status,
              new Date(app.submittedAt).toLocaleString(),
              app.approvedAt ? new Date(app.approvedAt).toLocaleString() : '',
            ];
            exportDataToCSV(reportData.applications, headers, rowMapper, 'applications_report');
          }
          break;

        case 'members':
          if (reportData.members) {
            const headers = [
              'Name',
              'Username',
              'Email',
              'Phone',
              'Status',
              'Roles',
              'Skills',
              'Parish',
              'Created At',
            ];
            const rowMapper = (member: any) => [
              member.fullName,
              member.username,
              member.email,
              member.phone || '',
              member.isActive ? 'Active' : 'Inactive',
              member.roles?.map((r: any) => r.name).join('; ') || '',
              member.registrationId?.mediaSkills?.join('; ') || '',
              member.registrationId?.parishLocation || '',
              new Date(member.createdAt).toLocaleString(),
            ];
            exportDataToCSV(reportData.members, headers, rowMapper, 'members_report');
          }
          break;

        case 'events':
          if (reportData.events) {
            const headers = [
              'Title',
              'Type',
              'Date',
              'Time',
              'Location',
              'Attendees',
              'Created By',
              'Created At',
            ];
            const rowMapper = (event: any) => [
              event.title,
              event.eventType,
              new Date(event.eventDate).toLocaleDateString(),
              event.eventTime || '',
              event.location || '',
              event.attendees?.length || 0,
              event.createdBy?.username || '',
              new Date(event.createdAt).toLocaleString(),
            ];
            exportDataToCSV(reportData.events, headers, rowMapper, 'events_report');
          }
          break;
      }

      showSuccess('Report Exported', 'CSV file has been downloaded');
    } catch (error: any) {
      showError('Export Failed', error.message);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>

        {/* Report Type Selection */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setReportType('applications');
                setReportData(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'applications'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">📊 Applications Report</h3>
              <p className="text-sm text-gray-600">
                Detailed breakdown of all applications with filters
              </p>
            </button>

            <button
              onClick={() => {
                setReportType('members');
                setReportData(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'members'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">👥 Members Report</h3>
              <p className="text-sm text-gray-600">Active team member statistics and roles</p>
            </button>

            <button
              onClick={() => {
                setReportType('events');
                setReportData(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                reportType === 'events'
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <h3 className="font-bold text-lg mb-2">📅 Events Report</h3>
              <p className="text-sm text-gray-600">
                Event participation and attendance data
              </p>
            </button>
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {reportType !== 'members' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </>
            )}

            {reportType === 'applications' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="account_created">Account Created</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={generateReport} isLoading={generating}>
              Generate Report
            </Button>
            {reportData && (
              <Button variant="secondary" onClick={exportReport}>
                Export to CSV
              </Button>
            )}
          </div>
        </Card>

        {/* Report Results */}
        {reportData && (
          <>
            {/* Summary Statistics */}
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Records</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.summary?.total || 0}</p>
                </div>

                {reportType === 'applications' && reportData.summary?.byStatus && (
                  <>
                    {Object.entries(reportData.summary.byStatus).map(([status, count]) => (
                      <div key={status} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1 capitalize">{status}</p>
                        <p className="text-2xl font-bold text-gray-900">{count as number}</p>
                      </div>
                    ))}
                  </>
                )}

                {reportType === 'members' && reportData.summary && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.summary.active || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Inactive</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {reportData.summary.inactive || 0}
                      </p>
                    </div>
                  </>
                )}

                {reportType === 'events' && reportData.summary && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.summary.upcoming || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Past</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {reportData.summary.past || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Avg Attendees</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {reportData.summary.avgAttendees || 0}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Data Table */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Data</h2>
              <div className="overflow-x-auto">
                <div className="text-sm text-gray-600 mb-4">
                  Showing {reportData.applications?.length || reportData.members?.length || reportData.events?.length || 0} records
                </div>
                <p className="text-sm text-gray-500">
                  Click "Export to CSV" above to download the full report with all details.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default function Reports() {
  return (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  );
}
