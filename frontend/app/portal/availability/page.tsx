'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { availabilityAPI } from '@/lib/api';

// ── Constants ─────────────────────────────────────────────────────────────────

const SERVICES = [
    { id: '0700', label: '0700', sublabel: 'Early Morning' },
    { id: '0900', label: '0900', sublabel: 'Morning' },
    { id: '1100', label: '1100', sublabel: 'Mid-Morning' },
    { id: '1800', label: '1800', sublabel: 'Evensong' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a YYYY-MM-DD string in local time (avoids UTC offset issues) */
function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Safely format any date value coming from the server (ISO string, Date, or
 * already a YYYY-MM-DD string) into a readable locale string.
 * Forces noon local time so no timezone shift flips the day.
 */
function fmtDate(raw: string, opts: Intl.DateTimeFormatOptions): string {
    // Strip time component if present, keeping only YYYY-MM-DD
    const dateOnly = raw.split('T')[0];
    const d = new Date(dateOnly + 'T12:00:00');
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', opts);
}

/**
 * Returns all Sundays from the next upcoming Sunday through the end of
 * the month after next (roughly 8–10 dates).
 */
function getUpcomingSundays(): Date[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find next Sunday (or today if it IS Sunday)
    const firstSunday = new Date(today);
    const dayOfWeek = today.getDay(); // 0 = Sunday
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
    firstSunday.setDate(today.getDate() + daysUntilSunday);

    // Collect all Sundays through the end of next month
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); // last day of next month
    const sundays: Date[] = [];
    const cursor = new Date(firstSunday);
    while (cursor <= endOfNextMonth) {
        sundays.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 7);
    }
    return sundays;
}

/** Group Sundays by month label */
function groupByMonth(sundays: Date[]): { month: string; dates: Date[] }[] {
    const map = new Map<string, Date[]>();
    for (const d of sundays) {
        const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(d);
    }
    return Array.from(map.entries()).map(([month, dates]) => ({ month, dates }));
}

function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
    return blockedDates.some(b => {
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
    });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DateAvailability {
    date: string; // YYYY-MM-DD
    services: string[];
}

interface BlockedDate {
    _id?: string;
    startDate: string;
    endDate: string;
    reason: string;
}

interface AvailabilityData {
    dateAvailability: DateAvailability[];
    blockedDates: BlockedDate[];
    googleCalendarConnected: boolean;
    notes: string;
}

// ── DateRangePicker ───────────────────────────────────────────────────────────

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface DateRangePickerProps {
    startDate: string;   // YYYY-MM-DD
    endDate: string;
    reason: string;
    onChange: (patch: Partial<{ startDate: string; endDate: string; reason: string }>) => void;
    onCancel: () => void;
    isLoading: boolean;
}

function DateRangePicker({ startDate, endDate, reason, onChange, onCancel, isLoading }: DateRangePickerProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [calMonth, setCalMonth] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [hovered, setHovered] = useState<string | null>(null);

    const prevMonth = () => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    const nextMonth = () => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

    // Build calendar grid for the current month
    const calDays = (() => {
        const firstDay = calMonth.getDay(); // 0 = Sunday
        const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
        const cells: (Date | null)[] = Array(firstDay).fill(null);
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
        }
        // Pad to full rows
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    })();

    const handleDayClick = (date: Date) => {
        const ds = toDateStr(date);
        if (!startDate || (startDate && endDate)) {
            // Start a new selection
            onChange({ startDate: ds, endDate: '' });
        } else {
            // Second click: set end (ensure order)
            if (ds < startDate) {
                onChange({ startDate: ds, endDate: startDate });
            } else {
                onChange({ endDate: ds });
            }
        }
    };

    const getDayState = (date: Date | null) => {
        if (!date) return 'empty';
        const ds = toDateStr(date);
        const isPast = date < today;
        const isStart = ds === startDate;
        const isEnd = ds === endDate;
        const effectiveEnd = endDate || hovered || startDate;
        const low = startDate && effectiveEnd ? (startDate < effectiveEnd ? startDate : effectiveEnd) : null;
        const high = startDate && effectiveEnd ? (startDate < effectiveEnd ? effectiveEnd : startDate) : null;
        const inRange = low && high && ds > low && ds < high;
        return { isPast, isStart, isEnd, inRange, ds };
    };

    const formattedStart = startDate
        ? new Date(startDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;
    const formattedEnd = endDate
        ? new Date(endDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    const canSubmit = !!startDate && !!endDate;

    return (
        <div className="rounded-2xl border border-purple-200 bg-white shadow-lg overflow-hidden">
            {/* Calendar header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={prevMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <span className="text-white font-semibold text-base">
                        {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button type="button" onClick={nextMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Selection summary */}
                <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2">
                    <div className="flex-1 text-center">
                        <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">From</p>
                        <p className={`font-semibold text-sm mt-0.5 ${formattedStart ? 'text-white' : 'text-white/40'}`}>
                            {formattedStart || 'Pick a date'}
                        </p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="flex-1 text-center">
                        <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">To</p>
                        <p className={`font-semibold text-sm mt-0.5 ${formattedEnd ? 'text-white' : 'text-white/40'}`}>
                            {formattedEnd || (startDate ? 'Pick end date' : 'Pick a date')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            <div className="px-4 py-3">
                {/* Day name headers */}
                <div className="grid grid-cols-7 mb-1">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                    ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                    {calDays.map((date, idx) => {
                        if (!date) return <div key={idx} />;
                        const state = getDayState(date);
                        if (state === 'empty') return <div key={idx} />;

                        const { isPast, isStart, isEnd, inRange, ds } = state as any;
                        const isToday = toDateStr(date) === toDateStr(today);

                        return (
                            <button
                                type="button"
                                key={idx}
                                disabled={isPast}
                                onClick={() => handleDayClick(date)}
                                onMouseEnter={() => startDate && !endDate && setHovered(ds)}
                                onMouseLeave={() => setHovered(null)}
                                className={`
                                    relative h-9 text-sm font-medium transition-all duration-100 select-none
                                    ${isPast ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                                    ${isStart || isEnd
                                        ? 'bg-purple-600 text-white rounded-lg z-10 shadow-sm'
                                        : inRange
                                        ? 'bg-purple-100 text-purple-800'
                                        : !isPast
                                        ? 'hover:bg-purple-50 text-gray-700 rounded-lg'
                                        : ''
                                    }
                                    ${isStart && endDate ? 'rounded-r-none' : ''}
                                    ${isEnd && startDate ? 'rounded-l-none' : ''}
                                    ${inRange && !isStart && !isEnd ? 'rounded-none' : ''}
                                `}
                            >
                                {isToday && !isStart && !isEnd && (
                                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-400" />
                                )}
                                {date.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Instruction hint */}
            {!startDate && (
                <p className="text-center text-xs text-gray-400 pb-2">Click a start date to begin</p>
            )}
            {startDate && !endDate && (
                <p className="text-center text-xs text-purple-500 font-medium pb-2">Now click an end date</p>
            )}

            {/* Reason + actions */}
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Reason <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="e.g. Holiday, travel, family event…"
                            value={reason}
                            onChange={e => onChange({ reason: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={!canSubmit || isLoading}
                        className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Adding…
                            </span>
                        ) : (
                            canSubmit ? `Block ${formattedStart}${startDate !== endDate ? ` → ${formattedEnd}` : ''}` : 'Select dates above'
                        )}
                    </button>
                    <button type="button" onClick={onCancel}
                        className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AvailabilityPage() {
    const [availability, setAvailability] = useState<AvailabilityData>({
        dateAvailability: [],
        blockedDates: [],
        googleCalendarConnected: false,
        notes: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [showBlockForm, setShowBlockForm] = useState(false);
    const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' });
    const [addingBlock, setAddingBlock] = useState(false);

    const [gcalLoading, setGcalLoading] = useState(false);
    const [gcalBusyDates, setGcalBusyDates] = useState<string[]>([]); // YYYY-MM-DD strings

    const upcomingSundays = getUpcomingSundays();
    const grouped = groupByMonth(upcomingSundays);

    // ── Load ──────────────────────────────────────────────────────────────────

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await availabilityAPI.getMyAvailability();
            if (res.success) {
                setAvailability({
                    dateAvailability: (res.availability.dateAvailability || []).map((d: any) => ({
                        date: toDateStr(new Date(d.date)),
                        services: d.services || [],
                    })),
                    blockedDates: res.availability.blockedDates || [],
                    googleCalendarConnected: res.availability.googleCalendarConnected || false,
                    notes: res.availability.notes || '',
                });
            }
        } catch {
            // start with defaults
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // ── Service toggle ────────────────────────────────────────────────────────

    const toggleService = (dateStr: string, serviceId: string) => {
        setAvailability(prev => {
            const existing = prev.dateAvailability.find(d => d.date === dateStr);
            let updated: DateAvailability[];

            if (existing) {
                const has = existing.services.includes(serviceId);
                if (has && existing.services.length === 1) {
                    // Remove the whole entry if last service unchecked
                    updated = prev.dateAvailability.filter(d => d.date !== dateStr);
                } else {
                    updated = prev.dateAvailability.map(d =>
                        d.date !== dateStr ? d : {
                            ...d,
                            services: has
                                ? d.services.filter(s => s !== serviceId)
                                : [...d.services, serviceId],
                        }
                    );
                }
            } else {
                updated = [...prev.dateAvailability, { date: dateStr, services: [serviceId] }];
            }

            return { ...prev, dateAvailability: updated };
        });
    };

    const toggleAllServices = (dateStr: string) => {
        setAvailability(prev => {
            const existing = prev.dateAvailability.find(d => d.date === dateStr);
            const allSelected = existing?.services.length === SERVICES.length;
            const updated = allSelected
                ? prev.dateAvailability.filter(d => d.date !== dateStr)
                : [
                    ...prev.dateAvailability.filter(d => d.date !== dateStr),
                    { date: dateStr, services: SERVICES.map(s => s.id) },
                ];
            return { ...prev, dateAvailability: updated };
        });
    };

    const getServicesForDate = (dateStr: string): string[] =>
        availability.dateAvailability.find(d => d.date === dateStr)?.services || [];

    // ── Save ──────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await availabilityAPI.saveAvailability({
                dateAvailability: availability.dateAvailability,
                notes: availability.notes,
                googleCalendarConnected: availability.googleCalendarConnected,
            });
            if (res.success) {
                setMessage({ type: 'success', text: 'Availability saved!' });
                setTimeout(() => setMessage(null), 4000);
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to save. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    // ── Blocked dates ─────────────────────────────────────────────────────────

    const handleAddBlockedDate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (blockForm.endDate < blockForm.startDate) {
            setMessage({ type: 'error', text: 'End date must be on or after start date.' });
            return;
        }
        setAddingBlock(true);
        try {
            const res = await availabilityAPI.addBlockedDate(blockForm.startDate, blockForm.endDate, blockForm.reason);
            if (res.success) {
                setAvailability(prev => ({ ...prev, blockedDates: res.availability.blockedDates || [] }));
                setBlockForm({ startDate: '', endDate: '', reason: '' });
                setShowBlockForm(false);
                setMessage({ type: 'success', text: 'Unavailable period added.' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to add unavailable period.' });
        } finally {
            setAddingBlock(false);
        }
    };

    const handleRemoveBlockedDate = async (dateId: string) => {
        try {
            const res = await availabilityAPI.removeBlockedDate(dateId);
            if (res.success) {
                setAvailability(prev => ({ ...prev, blockedDates: res.availability.blockedDates || [] }));
            }
        } catch {
            setMessage({ type: 'error', text: 'Failed to remove period.' });
        }
    };

    // ── Google Calendar ───────────────────────────────────────────────────────

    const handleConnectGoogleCalendar = () => {
        setGcalLoading(true);

        const initGIS = () => {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            if (!clientId) {
                setMessage({ type: 'error', text: 'Google Calendar requires NEXT_PUBLIC_GOOGLE_CLIENT_ID to be configured.' });
                setGcalLoading(false);
                return;
            }

            const gis = (window as any).google?.accounts?.oauth2;
            if (!gis) {
                setMessage({ type: 'error', text: 'Google Identity Services failed to load. Please refresh.' });
                setGcalLoading(false);
                return;
            }

            const tokenClient = gis.initTokenClient({
                client_id: clientId,
                scope: 'https://www.googleapis.com/auth/calendar.freebusy',
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        setMessage({ type: 'error', text: 'Google authorisation cancelled.' });
                        setGcalLoading(false);
                        return;
                    }
                    try {
                        const timeMin = upcomingSundays[0].toISOString();
                        const timeMax = new Date(upcomingSundays[upcomingSundays.length - 1].getTime() + 86400000).toISOString();

                        const fbRes = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${tokenResponse.access_token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ timeMin, timeMax, items: [{ id: 'primary' }] }),
                        });
                        const fbData = await fbRes.json();
                        const busySlots: Array<{ start: string; end: string }> = fbData?.calendars?.primary?.busy || [];

                        const busyDateStrs = upcomingSundays
                            .filter(sunday => {
                                const dayEnd = new Date(sunday);
                                dayEnd.setHours(23, 59, 59, 999);
                                return busySlots.some(s => new Date(s.start) < dayEnd && new Date(s.end) > sunday);
                            })
                            .map(d => toDateStr(d));

                        setGcalBusyDates(busyDateStrs);
                        await availabilityAPI.saveAvailability({ googleCalendarConnected: true });
                        setAvailability(prev => ({ ...prev, googleCalendarConnected: true }));
                        setMessage({
                            type: 'success',
                            text: `Google Calendar connected! ${busyDateStrs.length} busy Sunday(s) detected.`,
                        });
                    } catch {
                        setMessage({ type: 'error', text: 'Connected but could not fetch calendar data.' });
                    } finally {
                        setGcalLoading(false);
                    }
                },
            });
            tokenClient.requestAccessToken({ prompt: 'consent' });
        };

        if ((window as any).google?.accounts?.oauth2) {
            initGIS();
        } else {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initGIS;
            script.onerror = () => { setMessage({ type: 'error', text: 'Could not load Google Identity Services.' }); setGcalLoading(false); };
            document.head.appendChild(script);
        }
    };

    const handleDisconnectGoogle = async () => {
        await availabilityAPI.saveAvailability({ googleCalendarConnected: false });
        setAvailability(prev => ({ ...prev, googleCalendarConnected: false }));
        setGcalBusyDates([]);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">My Availability</h1>
                <p className="text-base text-gray-500 mt-1">
                    Select which services you can attend each Sunday so the admin can build the rota.
                </p>
            </div>

            {message && (
                <div className={`px-4 py-3 rounded-xl text-base ${
                    message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Google Calendar card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.8" fill="white" />
                            <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5" />
                            <path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round" />
                            <text x="12" y="18" textAnchor="middle" fontSize="6" fill="#EA4335" fontWeight="bold">GCal</text>
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">Google Calendar</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Connect to auto-detect busy Sundays from your calendar.</p>

                        {availability.googleCalendarConnected ? (
                            <div className="mt-3 flex flex-wrap gap-3 items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Connected
                                </span>
                                <button onClick={handleConnectGoogleCalendar} disabled={gcalLoading}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                                    {gcalLoading ? 'Refreshing…' : 'Refresh busy times'}
                                </button>
                                <button onClick={handleDisconnectGoogle} className="text-sm text-red-500 hover:text-red-600 font-medium">Disconnect</button>
                            </div>
                        ) : (
                            <button onClick={handleConnectGoogleCalendar} disabled={gcalLoading}
                                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition-colors">
                                {gcalLoading ? (
                                    <><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />Connecting…</>
                                ) : (
                                    <><svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                                        <rect x="3" y="4" width="18" height="17" rx="2" stroke="#4285F4" strokeWidth="1.8" fill="white" />
                                        <path d="M3 9h18" stroke="#4285F4" strokeWidth="1.5" />
                                        <path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>Connect Google Calendar</>
                                )}
                            </button>
                        )}

                        {gcalBusyDates.length > 0 && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs font-medium text-amber-800 mb-1.5">Busy Sundays from your Google Calendar:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {gcalBusyDates.map(d => (
                                        <span key={d} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                            {fmtDate(d, { day: 'numeric', month: 'short' })}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-amber-600 mt-1.5">These dates are marked as busy below.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sundays grouped by month */}
            {grouped.map(({ month, dates }) => (
                <div key={month} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Month header */}
                    <div className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600">
                        <h2 className="text-base font-bold text-white">{month}</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {dates.map(sunday => {
                            const dateStr = toDateStr(sunday);
                            const services = getServicesForDate(dateStr);
                            const isBlocked = isDateBlocked(sunday, availability.blockedDates);
                            const isGcalBusy = gcalBusyDates.includes(dateStr);
                            const allSelected = services.length === SERVICES.length;

                            return (
                                <div key={dateStr} className={`p-4 ${isBlocked ? 'bg-red-50/50' : isGcalBusy ? 'bg-amber-50/50' : ''}`}>
                                    {/* Date row */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {/* Date badge */}
                                            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                                                services.length > 0 ? 'bg-purple-600' : 'bg-gray-100'
                                            }`}>
                                                <span className={`text-xs font-bold uppercase leading-none ${services.length > 0 ? 'text-purple-200' : 'text-gray-400'}`}>
                                                    {sunday.toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className={`text-xl font-bold leading-tight ${services.length > 0 ? 'text-white' : 'text-gray-600'}`}>
                                                    {sunday.getDate()}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {sunday.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                {isBlocked && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Blocked — unavailable
                                                    </span>
                                                )}
                                                {isGcalBusy && !isBlocked && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Busy on Google Calendar
                                                    </span>
                                                )}
                                                {!isBlocked && !isGcalBusy && services.length === 0 && (
                                                    <span className="text-xs text-gray-400">Tap services below to mark availability</span>
                                                )}
                                            </div>
                                        </div>

                                        {!isBlocked && (
                                            <button
                                                onClick={() => toggleAllServices(dateStr)}
                                                className={`text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                                                    allSelected
                                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {allSelected ? 'Deselect all' : 'All services'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Service buttons */}
                                    {!isBlocked && (
                                        <div className="grid grid-cols-4 gap-2 ml-0">
                                            {SERVICES.map(service => {
                                                const checked = services.includes(service.id);
                                                const isBusyService = isGcalBusy; // whole day busy
                                                return (
                                                    <button
                                                        key={service.id}
                                                        onClick={() => toggleService(dateStr, service.id)}
                                                        className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border-2 transition-all duration-150 ${
                                                            checked
                                                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                                                                : isBusyService
                                                                ? 'border-amber-200 bg-amber-50/50 text-amber-500 hover:border-amber-300'
                                                                : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-white'
                                                        }`}
                                                    >
                                                        {checked && (
                                                            <svg className="w-3.5 h-3.5 text-purple-500 mb-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                        <span className="text-sm font-bold leading-none">{service.label}</span>
                                                        <span className="text-xs text-gray-400 mt-0.5 leading-none">{service.sublabel}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Selected summary */}
                                    {services.length > 0 && !isBlocked && (
                                        <p className="mt-2 text-xs text-purple-600 font-medium ml-0">
                                            Available for: {services.map(s => `${s}hrs`).join(', ')}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Unavailable periods */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Unavailable Periods</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Block out dates when you are away or unavailable.</p>
                    </div>
                    <button onClick={() => setShowBlockForm(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add period
                    </button>
                </div>

                {showBlockForm && (
                    <form onSubmit={handleAddBlockedDate} className="mb-5">
                        <DateRangePicker
                            startDate={blockForm.startDate}
                            endDate={blockForm.endDate}
                            reason={blockForm.reason}
                            onChange={patch => setBlockForm(f => ({ ...f, ...patch }))}
                            onCancel={() => { setShowBlockForm(false); setBlockForm({ startDate: '', endDate: '', reason: '' }); }}
                            isLoading={addingBlock}
                        />
                    </form>
                )}

                {availability.blockedDates.length === 0 ? (
                    <p className="text-sm text-gray-400 py-3 text-center">No unavailable periods set.</p>
                ) : (
                    <div className="space-y-2">
                        {availability.blockedDates.map(b => (
                            <div key={b._id} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-red-800">
                                            {fmtDate(b.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {b.startDate.split('T')[0] !== b.endDate.split('T')[0] && (
                                                <span className="mx-1.5 text-red-400">→</span>
                                            )}
                                            {b.startDate.split('T')[0] !== b.endDate.split('T')[0] && fmtDate(b.endDate, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        {b.reason
                                            ? <p className="text-xs text-red-500 mt-0.5">{b.reason}</p>
                                            : <p className="text-xs text-red-300 mt-0.5 italic">No reason given</p>
                                        }
                                    </div>
                                </div>
                                <button onClick={() => b._id && handleRemoveBlockedDate(b._id)}
                                    className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                    title="Remove">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Notes for Admin</h2>
                <textarea rows={3} placeholder="e.g. Prefer mornings, only available after 8am, etc."
                    value={availability.notes}
                    onChange={e => setAvailability(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none" />
            </div>

            {/* Save */}
            <div className="flex justify-end pb-6">
                <button onClick={handleSave} disabled={saving}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold text-base hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
                    {saving ? 'Saving…' : 'Save Availability'}
                </button>
            </div>
        </div>
    );
}
