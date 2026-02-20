'use client';

import React, { useEffect, useState } from 'react';
import { meetingMinutesAPI } from '@/lib/api';
import type { MeetingMinutes } from '@/types';

export default function MeetingMinutesPage() {
    const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
    const [selectedMinutes, setSelectedMinutes] = useState<MeetingMinutes | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMinutes();
    }, [page, search]);

    const loadMinutes = async () => {
        setLoading(true);
        try {
            const res = await meetingMinutesAPI.getAll(page, 10, search);
            if (res.success) {
                setMinutes(res.minutes || []);
                setTotalPages(res.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to load minutes:', error);
        } finally {
            setLoading(false);
        }
    };

    const viewDetails = async (id: string) => {
        try {
            const res = await meetingMinutesAPI.getOne(id);
            if (res.success) {
                setSelectedMinutes(res.minutes);
            }
        } catch (error) {
            console.error('Failed to load details:', error);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        });

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimetype: string) => {
        if (mimetype.includes('pdf')) return '📕';
        if (mimetype.includes('word') || mimetype.includes('doc')) return '📘';
        if (mimetype.includes('image')) return '🖼️';
        return '📄';
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Meeting Minutes</h1>
                <p className="text-sm text-gray-500 mt-1">Browse and download meeting documentation</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search meeting minutes..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
            ) : minutes.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <p className="text-lg text-gray-400">No meeting minutes found</p>
                    <p className="text-sm text-gray-300 mt-1">Check back later for updates</p>
                </div>
            ) : (
                <>
                    {/* Minutes List */}
                    <div className="space-y-3">
                        {minutes.map((m) => (
                            <button
                                key={m._id}
                                onClick={() => viewDetails(m._id)}
                                className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all text-left"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900">{m.title}</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {formatDate(m.meetingDate)}
                                        </p>
                                        {m.summary && (
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{m.summary}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2">
                                            {m.attachments && m.attachments.length > 0 && (
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    📎 {m.attachments.length} file{m.attachments.length > 1 ? 's' : ''}
                                                </span>
                                            )}
                                            {m.uploadedBy && (
                                                <span className="text-xs text-gray-400">
                                                    By {typeof m.uploadedBy === 'object' ? m.uploadedBy.username : 'Admin'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
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
                </>
            )}

            {/* Meeting Minutes Detail Modal */}
            {selectedMinutes && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedMinutes(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{selectedMinutes.title}</h2>
                            <button
                                onClick={() => setSelectedMinutes(null)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span>📅 {formatDate(selectedMinutes.meetingDate)}</span>
                                {selectedMinutes.uploadedBy && (
                                    <span>• Uploaded by {typeof selectedMinutes.uploadedBy === 'object' ? selectedMinutes.uploadedBy.username : 'Admin'}</span>
                                )}
                            </div>

                            {selectedMinutes.summary && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Summary</h3>
                                    <p className="text-sm text-gray-600">{selectedMinutes.summary}</p>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Content</h3>
                                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 rounded-xl p-4 whitespace-pre-wrap">
                                    {selectedMinutes.content}
                                </div>
                            </div>

                            {/* Attachments */}
                            {selectedMinutes.attachments && selectedMinutes.attachments.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h3>
                                    <div className="space-y-2">
                                        {selectedMinutes.attachments.map((file, idx) => (
                                            <a
                                                key={idx}
                                                href={meetingMinutesAPI.downloadAttachment(selectedMinutes._id, idx)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
                                            >
                                                <span className="text-xl">{getFileIcon(file.mimetype)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{file.originalName}</p>
                                                    <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                                                </div>
                                                <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
