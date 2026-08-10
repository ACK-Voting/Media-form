'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { submissionsAPI } from '@/lib/api';
import { exportToCSV } from '@/lib/export';
import type { Registration, Stats } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function DashboardContent() {
    const { admin, logout } = useAuth();
    const { showSuccess, showError, showInfo, showWarning } = useToast();
    const [submissions, setSubmissions] = useState<Registration[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState<string>('submittedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedSubmission, setSelectedSubmission] = useState<Registration | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkDelete, setShowBulkDelete] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        type: 'approve' | 'reject' | null;
        submissionId: string | null;
    }>({ isOpen: false, type: null, submissionId: null });

    useEffect(() => {
        fetchSubmissions();
        fetchStats();
    }, [page, search, statusFilter, sortBy, sortOrder]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await submissionsAPI.getAll(page, 10, search, statusFilter, sortBy, sortOrder);
            if (response.success && response.data) {
                setSubmissions(response.data);
                setTotalPages(response.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
            showError('Failed to Load', 'Could not fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await submissionsAPI.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleExport = async () => {
        try {
            if (submissions.length === 0) {
                showWarning('No Data', 'No submissions available to export');
                return;
            }
            exportToCSV(submissions, 'media_team_applications');
            showSuccess('Export Successful', `Exported ${submissions.length} submissions to CSV`);
        } catch (error) {
            showError('Export Failed', 'Could not export submissions');
        }
    };

    const handleExportAll = async () => {
        try {
            setLoading(true);
            const response = await submissionsAPI.getAll(1, 10000, '', '', 'submittedAt', 'desc');
            if (response.success && response.data) {
                exportToCSV(response.data, 'all_media_team_applications');
                showSuccess('Export Successful', `Exported ${response.data.length} submissions to CSV`);
            }
        } catch (error) {
            showError('Export Failed', 'Could not export all submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(submissions.map(s => s._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        }
    };

    const handleExportSelected = () => {
        const selectedSubmissions = submissions.filter(s => selectedIds.includes(s._id));
        if (selectedSubmissions.length === 0) {
            showWarning('No Selection', 'Please select submissions to export');
            return;
        }
        exportToCSV(selectedSubmissions, 'selected_applications');
        showSuccess('Export Successful', `Exported ${selectedSubmissions.length} selected submissions`);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) {
            showWarning('No Selection', 'Please select submissions to delete');
            return;
        }
        setShowBulkDelete(true);
    };

    const handleConfirmBulkDelete = async () => {
        setActionLoading(true);
        try {
            let successCount = 0;
            let errorCount = 0;

            for (const id of selectedIds) {
                try {
                    await submissionsAPI.delete(id);
                    successCount++;
                } catch (error) {
                    errorCount++;
                }
            }

            if (successCount > 0) {
                showSuccess('Bulk Delete Complete', `Deleted ${successCount} submissions${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
                await fetchSubmissions();
                await fetchStats();
                setSelectedIds([]);
            } else {
                showError('Bulk Delete Failed', 'Could not delete any submissions');
            }

            setShowBulkDelete(false);
        } catch (error) {
            showError('Bulk Delete Failed', 'An error occurred during bulk delete');
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setConfirmDialog({ isOpen: true, type: 'approve', submissionId: id });
    };

    const handleReject = async (id: string) => {
        setConfirmDialog({ isOpen: true, type: 'reject', submissionId: id });
    };

    const handleConfirmApprove = async () => {
        if (!confirmDialog.submissionId) return;

        setActionLoading(true);
        try {
            const response = await submissionsAPI.approve(confirmDialog.submissionId);
            showSuccess(
                'Application Approved!',
                `Welcome email with login credentials sent to ${response.data?.user?.email || 'user'}`
            );
            await fetchSubmissions();
            await fetchStats();
            setIsModalOpen(false);
            setConfirmDialog({ isOpen: false, type: null, submissionId: null });
        } catch (error: any) {
            console.error('Failed to approve application:', error);
            showError(
                'Approval Failed',
                error.response?.data?.message || 'Failed to approve application'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmReject = async (reason?: string) => {
        if (!confirmDialog.submissionId) return;

        setActionLoading(true);
        try {
            await submissionsAPI.reject(confirmDialog.submissionId, reason);
            showInfo(
                'Application Rejected',
                'Rejection notification sent to applicant'
            );
            await fetchSubmissions();
            await fetchStats();
            setIsModalOpen(false);
            setConfirmDialog({ isOpen: false, type: null, submissionId: null });
        } catch (error: any) {
            console.error('Failed to reject application:', error);
            showError(
                'Rejection Failed',
                error.response?.data?.message || 'Failed to reject application'
            );
        } finally {
            setActionLoading(false);
        }
    };

    const viewDetails = (submission: Registration) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) {
            return (
                <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return sortOrder === 'asc' ? (
            <svg className="w-4 h-4 ml-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ) : (
            <svg className="w-4 h-4 ml-1 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800',
                label: 'Pending'
            },
            approved: {
                color: 'bg-green-100 text-green-800',
                label: 'Approved'
            },
            account_created: {
                color: 'bg-blue-100 text-blue-800',
                label: 'Active'
            },
            rejected: {
                color: 'bg-red-100 text-red-800',
                label: 'Rejected'
            }
        };
        const badge = badges[status as keyof typeof badges] || badges.pending;
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>{badge.label}</span>;
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <Card className="border-l-4 border-purple-500 cursor-pointer" onClick={() => setStatusFilter('')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 text-sm">Total Applications</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
                                {stats?.recentSubmissions !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.recentSubmissions} recent
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-yellow-500 cursor-pointer" onClick={() => setStatusFilter('pending')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 text-sm">Pending Review</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pending || 0}</p>
                                {stats?.total && stats?.pending !== undefined && (
                                    <p className="text-xs text-yellow-600 mt-1">
                                        {Math.round((stats.pending / stats.total) * 100)}% of total
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>

                    <Card className="border-l-4 border-green-500 cursor-pointer" onClick={() => setStatusFilter('account_created')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 text-sm">Approved</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{(stats?.approved || 0) + (stats?.accountCreated || 0)}</p>
                                {stats?.total && stats?.approved !== undefined && (
                                    <p className="text-xs text-green-600 mt-1">
                                        {Math.round(((stats.approved + (stats.accountCreated || 0)) / stats.total) * 100)}% rate
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

                    <Card className="border-l-4 border-red-500 cursor-pointer" onClick={() => setStatusFilter('rejected')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-600 text-sm">Rejected</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.rejected || 0}</p>
                                {stats?.total && stats?.rejected !== undefined && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {Math.round((stats.rejected / stats.total) * 100)}% of total
                                    </p>
                                )}
                            </div>
                            <div className="p-3 bg-red-100 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <Input
                                label="Search"
                                placeholder="Search by name, email, phone..."
                                value={search}
                                onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
                            />

                            <Input
                                label="Filter by Status"
                                as="select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter((e.target as HTMLSelectElement).value)}
                                options={[
                                    { value: '', label: 'All Status' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'approved', label: 'Approved' },
                                    { value: 'account_created', label: 'Account Created' },
                                    { value: 'rejected', label: 'Rejected' },
                                ]}
                            />
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleExport}
                                disabled={loading || submissions.length === 0}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export Current ({submissions.length})
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleExportAll}
                                disabled={loading}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export All
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Bulk Actions Toolbar */}
                {selectedIds.length > 0 && (
                    <Card className="mb-4 bg-purple-50 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-purple-900">
                                    {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
                                </span>
                                <button
                                    onClick={() => setSelectedIds([])}
                                    className="text-sm text-purple-600 hover:text-purple-800 underline"
                                >
                                    Clear selection
                                </button>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleExportSelected}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Export Selected
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete Selected
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Applications Table */}
                <Card>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading applications...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-gray-600">No applications found</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {search || statusFilter ? 'Try adjusting your filters' : 'Applications will appear here when submitted'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-12">
                                            <input
                                                type="checkbox"
                                                checked={submissions.length > 0 && selectedIds.length === submissions.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 focus:ring-purple-500"
                                            />
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('fullName')}
                                        >
                                            <div className="flex items-center">
                                                Name
                                                <SortIcon column="fullName" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center">
                                                Contact
                                                <SortIcon column="email" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center">
                                                Status
                                                <SortIcon column="status" />
                                            </div>
                                        </th>
                                        <th
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('submittedAt')}
                                        >
                                            <div className="flex items-center">
                                                Date
                                                <SortIcon column="submittedAt" />
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((submission) => (
                                        <tr key={submission._id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(submission._id)}
                                                    onChange={(e) => handleSelectOne(submission._id, e.target.checked)}
                                                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                />
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{submission.fullName}</div>
                                                <div className="text-xs text-gray-500">{submission.gender}, {submission.ageRange}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="text-sm text-gray-900">{submission.email}</div>
                                                <div className="text-xs text-gray-500">{submission.phoneNumber}</div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {submission.mediaSkills?.slice(0, 2).map((skill, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {(submission.mediaSkills?.length || 0) > 2 && (
                                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                            +{submission.mediaSkills!.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {getStatusBadge(submission.status)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(submission.submittedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => viewDetails(submission)}
                                                        className="text-xs"
                                                    >
                                                        View
                                                    </Button>
                                                    {submission.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                onClick={() => handleApprove(submission._id)}
                                                                className="text-xs"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={() => handleReject(submission._id)}
                                                                className="text-xs"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-gray-600">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </Card>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.type === 'approve' ? 'Approve Application' : 'Reject Application'}
                message={
                    confirmDialog.type === 'approve'
                        ? 'This will create a user account and send login credentials via email. The applicant will be able to access the team portal.'
                        : 'The applicant will be notified of the rejection via email.'
                }
                confirmText={confirmDialog.type === 'approve' ? 'Approve & Send Email' : 'Reject'}
                variant={confirmDialog.type === 'approve' ? 'success' : 'danger'}
                showReasonInput={confirmDialog.type === 'reject'}
                reasonLabel="Rejection Reason (optional)"
                reasonPlaceholder="Provide a reason for rejection that will be sent to the applicant..."
                isLoading={actionLoading}
                onConfirm={confirmDialog.type === 'approve' ? handleConfirmApprove : handleConfirmReject}
                onCancel={() => setConfirmDialog({ isOpen: false, type: null, submissionId: null })}
            />

            {/* Bulk Delete Confirmation */}
            <ConfirmDialog
                isOpen={showBulkDelete}
                title="Delete Selected Submissions"
                message={`Are you sure you want to delete ${selectedIds.length} selected submission${selectedIds.length === 1 ? '' : 's'}? This action cannot be undone.`}
                confirmText="Delete All Selected"
                variant="danger"
                isLoading={actionLoading}
                onConfirm={handleConfirmBulkDelete}
                onCancel={() => setShowBulkDelete(false)}
            />

            {/* Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Application Details"
                size="xl"
            >
                {selectedSubmission && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.fullName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="text-sm font-medium text-gray-900 capitalize">{selectedSubmission.gender}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Age Range</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.ageRange}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.phoneNumber}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.email}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Parish Information</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Location</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.parishLocation}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Parish</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.parishName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Member</p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedSubmission.isMember ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {selectedSubmission.isMember ? 'Yes' : 'No'}
                                    </span>
                                </div>
                                {selectedSubmission.membershipNumber && (
                                    <div>
                                        <p className="text-sm text-gray-600">Membership #</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.membershipNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Experience</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Media Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedSubmission.mediaSkills?.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {selectedSubmission.otherSkills && (
                                    <div>
                                        <p className="text-sm text-gray-600">Other Skills</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.otherSkills}</p>
                                    </div>
                                )}
                                {selectedSubmission.areaOfInterest && selectedSubmission.areaOfInterest.length > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Areas of Interest</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubmission.areaOfInterest.map((interest, idx) => (
                                                <span key={idx} className="px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800">
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedSubmission.experienceDetails && (
                                    <div>
                                        <p className="text-sm text-gray-600">Experience Details</p>
                                        <p className="text-sm text-gray-900 mt-1">{selectedSubmission.experienceDetails}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability & Commitment</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Availability</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.availability}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Commitment</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.commitment}</p>
                                </div>
                                {selectedSubmission.equipmentDescription && (
                                    <div className="md:col-span-2">
                                        <p className="text-sm text-gray-600">Equipment</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedSubmission.equipmentDescription}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.emergencyContactName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.emergencyContactPhone}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Relationship</p>
                                    <p className="text-sm font-medium text-gray-900">{selectedSubmission.emergencyContactRelationship}</p>
                                </div>
                            </div>
                        </div>

                        {selectedSubmission.additionalInfo && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                                <p className="text-sm text-gray-900">{selectedSubmission.additionalInfo}</p>
                            </div>
                        )}

                        {selectedSubmission.status === 'pending' && (
                            <div className="flex gap-4 pt-4 border-t">
                                <Button
                                    variant="success"
                                    onClick={() => handleApprove(selectedSubmission._id)}
                                    className="flex-1"
                                >
                                    Approve & Send Credentials
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => handleReject(selectedSubmission._id)}
                                    className="flex-1"
                                >
                                    Reject Application
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
