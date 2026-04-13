'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { rotaAPI } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Assignment {
    role: string;
    userId: string | null;
    memberName: string;
}

interface ServiceBlock {
    time: string;
    assignments: Assignment[];
}

interface AvailableMember {
    userId: string;
    fullName: string;
    email?: string;
    services: string[];
    notes?: string;
}

interface Rota {
    sundayDate: string;
    services: ServiceBlock[];
    closingMessage: string;
    published: boolean;
    _scaffold?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_ORDER = ['0700', '0900', '1100', '1800'];

const SERVICE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
    '0700': { label: '0700hrs Service', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    '0900': { label: '0900hrs Service', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    '1100': { label: '1100hrs Service', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    '1800': { label: '1800hrs Service', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const DEFAULT_ROLES: Record<string, string[]> = {
    '0700': ['Projections', 'Sound', 'Camera'],
    '0900': ['Projections', 'Sound', 'Cam1', 'Cam2'],
    '1100': ['Projections', 'Sound', 'Cam 1', 'Cam 2'],
    '1800': ['Projection', 'Camera'],
};

const CLOSING_DEFAULT = "Let's all Prepare well.\nThank you.";

// ── Sunday Picker ─────────────────────────────────────────────────────────────

function SundayPicker({ value, onChange }: { value: string; onChange: (date: string) => void }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedD = value ? new Date(value + 'T00:00:00') : null;

    const [viewYear, setViewYear] = useState(() => {
        const d = selectedD || new Date();
        return d.getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
        const d = selectedD || new Date();
        return d.getMonth();
    });

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build calendar grid
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    return (
        <div className="select-none">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <span className="text-sm font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className={`text-center text-xs font-semibold py-1 ${d === 'Su' ? 'text-purple-600' : 'text-gray-400'}`}>
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, idx) => {
                    if (!day) return <div key={idx} />;
                    const isSunday = idx % 7 === 0;
                    const cellDate = new Date(viewYear, viewMonth, day);
                    cellDate.setHours(0, 0, 0, 0);
                    const isPast = cellDate < today;
                    const isToday = cellDate.getTime() === today.getTime();
                    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isSelected = value === dateStr;

                    if (!isSunday) {
                        return (
                            <div key={idx} className="flex items-center justify-center h-8">
                                <span className="text-xs text-gray-300">{day}</span>
                            </div>
                        );
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => !isPast && onChange(dateStr)}
                            disabled={isPast}
                            className={`flex items-center justify-center h-8 w-full rounded-lg text-sm font-semibold transition-all
                                ${isSelected
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                                    : isPast
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : isToday
                                            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                            : 'text-purple-700 hover:bg-purple-50'
                                }`}
                        >
                            {day}
                            {isToday && !isSelected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toLocalDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function nextSunday(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
    return toLocalDateStr(d);
}

function sortServices(services: ServiceBlock[]): ServiceBlock[] {
    return [...services].sort(
        (a, b) => SERVICE_ORDER.indexOf(a.time) - SERVICE_ORDER.indexOf(b.time)
    );
}

function scaffoldRota(dateStr: string): Rota {
    return {
        sundayDate: dateStr,
        published: false,
        closingMessage: CLOSING_DEFAULT,
        services: SERVICE_ORDER.map(time => ({
            time,
            assignments: DEFAULT_ROLES[time].map(role => ({ role, userId: null, memberName: '' })),
        })),
        _scaffold: true,
    };
}

function generateRotaText(rota: Rota): string {
    const labels: Record<string, string> = {
        '0700': '0700hrs Service',
        '0900': '0900hrs service',
        '1100': '1100hrs service',
        '1800': '1800hrs service',
    };

    let text = '';
    for (const svc of rota.services) {
        text += `${labels[svc.time] || svc.time} \n \n`;
        for (const a of svc.assignments) {
            const pad = 12;
            text += `${a.role.padEnd(pad)}: ${a.memberName || '—'}\n`;
        }
        text += '\n';
    }
    text += rota.closingMessage;
    return text;
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function RotaPage() {
    const [selectedDate, setSelectedDate] = useState<string>(nextSunday());
    const [rota, setRota] = useState<Rota | null>(null);
    const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [pastRotas, setPastRotas] = useState<any[]>([]);

    // Load past rotas list on mount
    useEffect(() => {
        rotaAPI.list().then(res => {
            if (res.success) setPastRotas(res.rotas || []);
        }).catch(() => {});
    }, []);

    const loadRota = useCallback(async (date: string) => {
        setLoading(true);
        setMessage(null);
        try {
            const [rotaRes, availRes] = await Promise.allSettled([
                rotaAPI.getByDate(date),
                rotaAPI.getAvailableMembers(date),
            ]);

            if (rotaRes.status === 'fulfilled' && rotaRes.value.success) {
                const r = rotaRes.value.rota;
                setRota({ ...r, services: sortServices(r.services) });
            } else {
                setRota(scaffoldRota(date));
            }

            if (availRes.status === 'fulfilled' && availRes.value.success) {
                setAvailableMembers(availRes.value.available || []);
            } else {
                setAvailableMembers([]);
            }
        } catch {
            setRota(scaffoldRota(date));
            setAvailableMembers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedDate) loadRota(selectedDate);
    }, [selectedDate, loadRota]);

    const assignMember = (serviceTime: string, role: string, memberId: string) => {
        const member = memberId === ''
            ? null
            : availableMembers.find(m => m.userId === memberId);

        setRota(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                services: prev.services.map(svc => {
                    if (svc.time !== serviceTime) return svc;
                    return {
                        ...svc,
                        assignments: svc.assignments.map(a => {
                            if (a.role !== role) return a;
                            return {
                                ...a,
                                userId: member?.userId || null,
                                memberName: member?.fullName || '',
                            };
                        }),
                    };
                }),
            };
        });
    };

    const handleSave = async (publish = false) => {
        if (!rota) return;
        setSaving(true);
        setMessage(null);
        try {
            const res = await rotaAPI.save(selectedDate, {
                services: rota.services,
                closingMessage: rota.closingMessage,
                published: publish,
            });
            if (res.success) {
                setRota({ ...res.rota, services: sortServices(res.rota.services) });
                if (publish) {
                    // Refresh past list
                    const listRes = await rotaAPI.list();
                    if (listRes.success) setPastRotas(listRes.rotas || []);
                }
                setMessage({ type: 'success', text: publish ? 'Rota published and members can now see it!' : 'Rota saved as draft.' });
                setTimeout(() => setMessage(null), 4000);
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to save rota.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCopyText = () => {
        if (!rota) return;
        const text = generateRotaText(rota);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    // Members available for a specific service on selected date
    const membersForService = (serviceTime: string) =>
        availableMembers.filter(m => m.services.includes(serviceTime));

    const rotaText = rota ? generateRotaText(rota) : '';

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Sunday Rota Builder</h1>
                        <p className="text-sm text-gray-500 mt-1">Assign team members to each service based on their availability.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => setPreviewOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Preview
                        </button>
                        <button onClick={handleCopyText} disabled={!rota}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                            {copied ? (
                                <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied!</>
                            ) : (
                                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy text</>
                            )}
                        </button>
                        <button onClick={() => handleSave(false)} disabled={saving || !rota}
                            className="px-4 py-2 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 disabled:opacity-50 transition-colors">
                            {saving ? 'Saving…' : 'Save Draft'}
                        </button>
                        <button onClick={() => handleSave(true)} disabled={saving || !rota}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
                            Publish Rota
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`px-4 py-3 rounded-xl text-sm ${
                        message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ── Left: Date picker + availability summary ── */}
                    <div className="space-y-4">
                        {/* Date selector */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-semibold text-gray-700">Sunday Date</span>
                                {rota && !rota._scaffold && (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        rota.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {rota.published ? 'Published' : 'Draft'}
                                    </span>
                                )}
                            </div>
                            {selectedDate && (
                                <div className="mb-3 px-3 py-2 bg-purple-50 rounded-lg text-center">
                                    <p className="text-sm font-bold text-purple-800">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                            <SundayPicker value={selectedDate} onChange={setSelectedDate} />
                        </div>

                        {/* Available members per service */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Available Members
                                {availableMembers.length > 0 && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{availableMembers.length}</span>
                                )}
                            </h3>
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                                </div>
                            ) : availableMembers.length === 0 ? (
                                <p className="text-xs text-gray-400 py-2">No members have set availability for this Sunday.</p>
                            ) : (
                                <div className="space-y-3">
                                    {['0700', '0900', '1100', '1800'].map(time => {
                                        const members = membersForService(time);
                                        const meta = SERVICE_META[time];
                                        return (
                                            <div key={time}>
                                                <p className={`text-xs font-semibold ${meta.color} mb-1`}>{meta.label}</p>
                                                {members.length === 0 ? (
                                                    <p className="text-xs text-gray-300 italic">None available</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {members.map(m => (
                                                            <span key={m.userId}
                                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.bg} ${meta.color}`}>
                                                                {m.fullName}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Past rotas */}
                        {pastRotas.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Rotas</h3>
                                <div className="space-y-1.5">
                                    {pastRotas.slice(0, 6).map(r => (
                                        <button key={r._id}
                                            onClick={() => setSelectedDate(toLocalDateStr(new Date(r.sundayDate.split('T')[0] + 'T12:00:00')))}
                                            className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <span className="text-sm text-gray-700">
                                                {new Date(r.sundayDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                r.published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {r.published ? 'Published' : 'Draft'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: Rota Builder ── */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
                                <div className="w-8 h-8 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                            </div>
                        ) : rota ? (
                            <>
                                {rota.services.map(svc => {
                                    const meta = SERVICE_META[svc.time];
                                    const availForService = membersForService(svc.time);

                                    return (
                                        <div key={svc.time} className={`bg-white rounded-xl border-2 ${meta.border} shadow-sm overflow-hidden`}>
                                            {/* Service header */}
                                            <div className={`${meta.bg} px-5 py-3 flex items-center justify-between`}>
                                                <h3 className={`font-bold text-base ${meta.color}`}>{meta.label}</h3>
                                                <span className="text-xs text-gray-400">
                                                    {availForService.length} member{availForService.length !== 1 ? 's' : ''} available
                                                </span>
                                            </div>

                                            {/* Role assignments */}
                                            <div className="p-4 space-y-3">
                                                {svc.assignments.map(assignment => {
                                                    const assignedId = assignment.userId || '';
                                                    return (
                                                        <div key={assignment.role} className="flex items-center gap-3">
                                                            <div className="w-32 flex-shrink-0">
                                                                <span className="text-sm font-semibold text-gray-700">{assignment.role}</span>
                                                            </div>
                                                            <div className="flex-1 relative">
                                                                <select
                                                                    value={assignedId}
                                                                    onChange={e => assignMember(svc.time, assignment.role, e.target.value)}
                                                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none appearance-none pr-8 transition-colors ${
                                                                        assignedId
                                                                            ? 'border-green-300 bg-green-50 text-green-800'
                                                                            : 'border-gray-300 bg-white text-gray-500'
                                                                    }`}
                                                                >
                                                                    <option value="">— Not assigned —</option>
                                                                    {/* Members available for this service */}
                                                                    {availForService.length > 0 && (
                                                                        <optgroup label="Available for this service">
                                                                            {availForService.map(m => (
                                                                                <option key={m.userId} value={m.userId}>{m.fullName}</option>
                                                                            ))}
                                                                        </optgroup>
                                                                    )}
                                                                    {/* All other members */}
                                                                    {availableMembers.filter(m => !m.services.includes(svc.time)).length > 0 && (
                                                                        <optgroup label="Other members (not available for this service)">
                                                                            {availableMembers
                                                                                .filter(m => !m.services.includes(svc.time))
                                                                                .map(m => (
                                                                                    <option key={m.userId} value={m.userId}>{m.fullName}</option>
                                                                                ))}
                                                                        </optgroup>
                                                                    )}
                                                                </select>
                                                                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            {assignedId && (
                                                                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Closing message */}
                                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Closing Message</label>
                                    <textarea
                                        rows={2}
                                        value={rota.closingMessage}
                                        onChange={e => setRota(prev => prev ? { ...prev, closingMessage: e.target.value } : prev)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            </div>

            {/* ── Preview Modal ── */}
            {previewOpen && rota && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setPreviewOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full z-10 overflow-hidden">
                        {/* WhatsApp-style dark header */}
                        <div className="bg-[#1d3c34] px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-xs">M</div>
                                <div>
                                    <p className="text-white text-sm font-semibold">ACK Media Team</p>
                                    <p className="text-green-300 text-xs">Sunday Rota</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewOpen(false)} className="text-white/70 hover:text-white p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Message bubble */}
                        <div className="bg-[#0b1f19] p-4 min-h-[200px]">
                            <div className="bg-[#1d3c34] rounded-lg rounded-tl-none p-4 max-w-xs ml-2">
                                <pre className="text-[#e9fcd9] text-sm whitespace-pre-wrap font-sans leading-relaxed">{rotaText}</pre>
                                <div className="flex items-center justify-end gap-1 mt-2">
                                    <span className="text-[#7ab69a] text-xs">
                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2.3 9.3l1.4-1.4 4 4L14.3 5.3l1.4 1.4-8 8z" />
                                        <path d="M5.3 9.3l1.4-1.4 4 4 6.6-6.6 1.4 1.4-8 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Copy button */}
                        <div className="bg-white border-t border-gray-100 p-4">
                            <button onClick={() => { handleCopyText(); setPreviewOpen(false); }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
