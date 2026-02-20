'use client';

import React, { useEffect, useState } from 'react';
import { eventsAPI } from '@/lib/api';
import type { Event } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_TYPES = ['all', 'service', 'rehearsal', 'meeting', 'training', 'special', 'other'];

export default function CalendarPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'calendar' | 'list'>('calendar');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        loadEvents();
    }, [month, year, filterType]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0).toISOString();
            const eventType = filterType === 'all' ? undefined : filterType;
            const res = await eventsAPI.getAll(startDate, endDate, eventType);
            if (res.success) {
                setEvents(res.events || []);
            }
        } catch (error) {
            console.error('Failed to load events:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = () => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(i);
        return days;
    };

    const getEventsForDay = (day: number) => {
        return events.filter((e) => {
            const eventDay = new Date(e.eventDate).getDate();
            const eventMonth = new Date(e.eventDate).getMonth();
            const eventYear = new Date(e.eventDate).getFullYear();
            return eventDay === day && eventMonth === month && eventYear === year;
        });
    };

    const getEventTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            service: 'bg-blue-500',
            rehearsal: 'bg-green-500',
            meeting: 'bg-purple-500',
            training: 'bg-orange-500',
            special: 'bg-pink-500',
            other: 'bg-gray-500',
        };
        return colors[type] || colors.other;
    };

    const getEventTypeBadge = (type: string) => {
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

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday = () => setCurrentDate(new Date());

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-base text-gray-500 mt-1">View team events and activities</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setView('calendar')}
                            className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors ${view === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            Calendar
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`px-3 py-1.5 rounded-md text-base font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter & Navigation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 min-w-[180px] text-center">{monthName}</h2>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                        <button onClick={goToday} className="ml-2 px-3 py-1.5 text-base font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                            Today
                        </button>
                    </div>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    >
                        {EVENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                </div>
            ) : view === 'calendar' ? (
                /* Calendar Grid View */
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-7">
                        {DAYS.map((day) => (
                            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 bg-gray-50 border-b">
                                {day}
                            </div>
                        ))}
                        {getDaysInMonth().map((day, idx) => {
                            const dayEvents = day ? getEventsForDay(day) : [];
                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[100px] p-2 border-b border-r border-gray-100 ${day === null ? 'bg-gray-50/50' : 'hover:bg-gray-50/50 cursor-pointer'
                                        } ${isToday(day || 0) ? 'bg-purple-50/30' : ''}`}
                                >
                                    {day && (
                                        <>
                                            <span
                                                className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${isToday(day) ? 'bg-purple-600 text-white font-bold' : 'text-gray-700'
                                                    }`}
                                            >
                                                {day}
                                            </span>
                                            <div className="mt-1 space-y-1">
                                                {dayEvents.slice(0, 3).map((event) => (
                                                    <button
                                                        key={event._id}
                                                        onClick={() => setSelectedEvent(event)}
                                                        className={`w-full text-left px-1.5 py-0.5 rounded text-sm text-white truncate ${getEventTypeColor(event.eventType)}`}
                                                    >
                                                        {event.title}
                                                    </button>
                                                ))}
                                                {dayEvents.length > 3 && (
                                                    <p className="text-xs text-gray-400 px-1">+{dayEvents.length - 3} more</p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* List View */
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                    {events.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p className="text-xl">No events this month</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {events
                                .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
                                .map((event) => (
                                    <button
                                        key={event._id}
                                        onClick={() => setSelectedEvent(event)}
                                        className="w-full flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <div className="flex-shrink-0 w-14 h-14 bg-purple-50 rounded-xl flex flex-col items-center justify-center">
                                            <span className="text-xs font-bold text-purple-600 uppercase">
                                                {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-bold text-purple-700 leading-tight">
                                                {new Date(event.eventDate).getDate()}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                                            <p className="text-base text-gray-500 mt-0.5">
                                                {event.eventTime} {event.location && `• ${event.location}`}
                                            </p>
                                            {event.description && (
                                                <p className="text-base text-gray-400 mt-1 line-clamp-2">{event.description}</p>
                                            )}
                                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getEventTypeBadge(event.eventType)}`}>
                                                {event.eventType}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Event Detail Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedEvent(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getEventTypeBadge(selectedEvent.eventType)}`}>
                            {selectedEvent.eventType}
                        </span>

                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-3">{selectedEvent.title}</h2>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-3 text-base text-gray-600">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </div>
                            {selectedEvent.eventTime && (
                                <div className="flex items-center gap-3 text-base text-gray-600">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {selectedEvent.eventTime}
                                </div>
                            )}
                            {selectedEvent.location && (
                                <div className="flex items-center gap-3 text-base text-gray-600">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {selectedEvent.location}
                                </div>
                            )}
                        </div>

                        {selectedEvent.description && (
                            <p className="mt-4 text-base text-gray-600 leading-relaxed">
                                {selectedEvent.description}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
