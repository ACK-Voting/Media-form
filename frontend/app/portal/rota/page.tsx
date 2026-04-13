'use client';

import React, { useEffect, useState } from 'react';
import { rotaAPI } from '@/lib/api';

interface Assignment {
    role: string;
    userId: string | null;
    memberName: string;
}

interface ServiceBlock {
    time: string;
    assignments: Assignment[];
}

interface Rota {
    _id: string;
    sundayDate: string;
    services: ServiceBlock[];
    closingMessage: string;
    published: boolean;
    publishedAt?: string;
}

const SERVICE_META: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    '0700': { label: '0700hrs Service', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    '0900': { label: '0900hrs Service', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', dot: 'bg-indigo-500' },
    '1100': { label: '1100hrs Service', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500' },
    '1800': { label: '1800hrs Service', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', dot: 'bg-rose-500' },
};

const SERVICE_ORDER = ['0700', '0900', '1100', '1800'];

function fmtSundayDate(iso: string): string {
    const d = new Date(iso.split('T')[0] + 'T12:00:00');
    return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function fmtShortDate(iso: string): string {
    const d = new Date(iso.split('T')[0] + 'T12:00:00');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function sortServices(services: ServiceBlock[]): ServiceBlock[] {
    return [...services].sort((a, b) => SERVICE_ORDER.indexOf(a.time) - SERVICE_ORDER.indexOf(b.time));
}

export default function RotaPage() {
    const [rotas, setRotas] = useState<Rota[]>([]);
    const [selected, setSelected] = useState<Rota | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        rotaAPI.getPublishedForMember().then(res => {
            if (res.success && res.rotas?.length) {
                const sorted = res.rotas.map((r: Rota) => ({ ...r, services: sortServices(r.services) }));
                setRotas(sorted);
                setSelected(sorted[0]);
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const copyRota = () => {
        if (!selected) return;
        const labels: Record<string, string> = {
            '0700': '0700hrs Service', '0900': '0900hrs service',
            '1100': '1100hrs service', '1800': '1800hrs service',
        };
        let text = '';
        for (const svc of selected.services) {
            text += `${labels[svc.time] || svc.time} \n \n`;
            for (const a of svc.assignments) {
                text += `${a.role.padEnd(12)}: ${a.memberName || '—'}\n`;
            }
            text += '\n';
        }
        text += selected.closingMessage;
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Sunday Rota</h1>
                <p className="text-base text-gray-500 mt-1">Published service schedules for the media team.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
                </div>
            ) : rotas.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <p className="text-xl font-semibold text-gray-400">No rotas published yet</p>
                    <p className="text-base text-gray-300 mt-1">Check back after the admin publishes the schedule.</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Rota list */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">Recent Rotas</p>
                        {rotas.map(r => (
                            <button
                                key={r._id}
                                onClick={() => setSelected(r)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                                    selected?._id === r._id
                                        ? 'bg-purple-50 border-purple-300 shadow-sm'
                                        : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <p className={`text-sm font-semibold ${selected?._id === r._id ? 'text-purple-700' : 'text-gray-800'}`}>
                                    {fmtShortDate(r.sundayDate)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{r.services.length} services</p>
                            </button>
                        ))}
                    </div>

                    {/* Rota detail */}
                    {selected && (
                        <div className="lg:col-span-2 space-y-4">
                            {/* Date header */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Sunday Service</p>
                                    <h2 className="text-xl font-bold text-gray-900">{fmtSundayDate(selected.sundayDate)}</h2>
                                </div>
                                <button
                                    onClick={copyRota}
                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Service blocks */}
                            {selected.services.map(svc => {
                                const meta = SERVICE_META[svc.time] || { label: svc.time, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' };
                                const assigned = svc.assignments.filter(a => a.memberName);
                                return (
                                    <div key={svc.time} className={`bg-white rounded-xl border-2 ${meta.border} overflow-hidden`}>
                                        <div className={`${meta.bg} px-5 py-3 flex items-center gap-2`}>
                                            <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                                            <h3 className={`font-bold text-base ${meta.color}`}>{meta.label}</h3>
                                            <span className="ml-auto text-xs text-gray-400">
                                                {assigned.length}/{svc.assignments.length} assigned
                                            </span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {svc.assignments.map(a => (
                                                <div key={a.role} className="flex items-center justify-between px-5 py-3">
                                                    <span className="text-sm font-semibold text-gray-500 w-28">{a.role}</span>
                                                    {a.memberName ? (
                                                        <span className="text-sm font-semibold text-gray-900">{a.memberName}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-300 italic">Not assigned</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Closing message */}
                            {selected.closingMessage && (
                                <div className="bg-purple-50 border border-purple-100 rounded-xl px-5 py-4">
                                    <p className="text-sm text-purple-700 whitespace-pre-wrap">{selected.closingMessage}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
