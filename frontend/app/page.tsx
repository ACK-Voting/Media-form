'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from './_components/Footer';
import { useYouTubeVideos, formatViews, CATHEDRAL_CHANNEL_URL, CATHEDRAL_LIVE_URL } from '@/hooks/useYouTubeVideos';

function PrayerRequestForm() {
    const [done, setDone] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', request: '', private: false });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setDone(true); };
    if (done) return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h4 className="font-bold text-gray-900 mb-1">Prayer Request Received</h4>
            <p className="text-sm text-gray-600">Our prayer team will lift you up. God bless you.</p>
        </div>
    );
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Your full name" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email (optional)</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="jane@example.com" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your Prayer Request *</label>
                <textarea required rows={5} value={form.request} onChange={e => setForm(f => ({ ...f, request: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Share what you would like our prayer team to pray about..." />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.private} onChange={e => setForm(f => ({ ...f, private: e.target.checked }))} className="w-4 h-4 accent-indigo-700 rounded" />
                <span className="text-sm text-gray-600">Keep this request private (shared with prayer team only, not publicly)</span>
            </label>
            <button type="submit" className="w-full bg-indigo-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-800 transition-colors">
                Submit Prayer Request
            </button>
        </form>
    );
}

export default function ACKCathedralMockup() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSection, setMobileSection] = useState<string | null>(null);
    const [scrollY, setScrollY] = useState(0);
    const { videos, loading: videosLoading } = useYouTubeVideos();
    const recentSermons = videos.slice(0, 3);
    const heroVideoRef = useRef<HTMLVideoElement>(null);

    // Slow the hero background video down for a calmer feel
    useEffect(() => {
        if (heroVideoRef.current) heroVideoRef.current.playbackRate = 0.5;
    }, []);

    // Parallax effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navTransparent = scrollY < 80;

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar — hidden on mobile, fixed above nav on sm+ */}
            <div className={`hidden sm:block fixed top-0 left-0 right-0 z-50 text-white text-sm py-2 transition-all duration-300 ${navTransparent ? 'bg-transparent opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-4">
                            <a href="tel:+254700123456" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +254 700 000 000
                            </a>
                            <a href="mailto:info@ackmombasa.org" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                info@ackmombasa.org
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <a href="#facebook" className="hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="#instagram" className="hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href={CATHEDRAL_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation — fixed at top-0 on mobile, offset by top bar height on sm+ */}
            <nav
                className={`fixed left-0 right-0 z-40 transition-all duration-300 ${navTransparent
                        ? 'top-0 sm:top-9 bg-transparent'
                        : 'top-0 bg-white/95 backdrop-blur-md shadow-md'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full overflow-hidden shadow-lg flex-shrink-0">
                                <img src="/logo_1.jpeg" alt="ACK Mombasa Memorial Cathedral" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <h1 className={`text-sm sm:text-xl font-bold leading-tight transition-colors duration-300 ${navTransparent ? 'text-white' : 'text-blue-900'}`}>
                                    <span className="sm:hidden">ACK Mombasa Cathedral</span>
                                    <span className="hidden sm:inline">ACK Mombasa Memorial Cathedral</span>
                                </h1>
                                <p className={`hidden sm:block text-xs transition-colors duration-300 ${navTransparent ? 'text-white/70' : 'text-gray-600'}`}>
                                    Anglican Church of Kenya
                                </p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {[
                                { label: 'Home', href: '#home' },
                                { label: 'Worship', href: '#worship' },
                                { label: 'Events', href: '/events' },
                                { label: 'Sermons', href: '/sermons' },
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={`font-medium transition-colors duration-300 ${navTransparent
                                            ? 'text-white/90 hover:text-white'
                                            : 'text-gray-700 hover:text-blue-900'
                                        }`}
                                >
                                    {item.label}
                                </a>
                            ))}
                            {/* About dropdown */}
                            <div className="relative group">
                                <button className={`font-medium transition-colors duration-300 flex items-center gap-1 ${navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-900'
                                    }`}>
                                    About
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <a href="/history" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Cathedral History</a>
                                    <a href="/about#clergy" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Cathedral Clergy & Wardens</a>
                                    <a href="/staff" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Cathedral Staff</a>
                                    <a href="/about#mission" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Mission &amp; Vision</a>
                                    <a href="/gallery" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Photo Gallery</a>
                                    <a href="/announcements" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">News &amp; Announcements</a>
                                    <a href="/resources" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Resources &amp; Downloads</a>
                                </div>
                            </div>
                            {/* Ministries dropdown */}
                            <div className="relative group">
                                <button className={`font-medium transition-colors duration-300 flex items-center gap-1 ${navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-900'
                                    }`}>
                                    Ministries
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <a href="/ministries" className="block px-4 py-3 hover:bg-gray-50 font-semibold text-blue-900 transition-colors border-b border-gray-100">All Ministries →</a>
                                    <a href="/ministries/children" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Children&apos;s Ministry</a>
                                    <a href="/ministries/kayo" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Youth Ministry (KAYO)</a>
                                    <a href="/ministries/awf" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Anglican Women&apos;s Fellowship (AWF)</a>
                                    <a href="/ministries/mothers-union" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Mother&apos;s Union</a>
                                    <a href="/ministries/amf" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Anglican Men&apos;s Fellowship (AMF)</a>
                                    <a href="/ministries/kama" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">KAMA</a>
                                    <a href="/ministries/choir" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Choir &amp; Music</a>
                                    <a href="/ministries/prayer" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Prayer Ministry</a>
                                    <a href="/ministries/missions" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Missions &amp; Outreach</a>
                                </div>
                            </div>
                            <a href="/get-involved" className={`font-medium transition-colors duration-300 ${navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-900'}`}>Get Involved</a>
                            <a href="/contact" className={`font-medium transition-colors duration-300 ${navTransparent ? 'text-white/90 hover:text-white' : 'text-gray-700 hover:text-blue-900'}`}>Contact</a>
                            <a href="/give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all">Give</a>
                        </div>

                        {/* Mobile: Give button + Menu toggle */}
                        <div className="lg:hidden flex items-center gap-2">
                            <a href="/give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold text-sm">Give</a>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg hover:bg-white/10"
                            >
                                <svg className={`w-6 h-6 transition-colors duration-300 ${navTransparent ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className={`lg:hidden py-3 border-t ${navTransparent ? 'border-white/20 bg-blue-950/90 backdrop-blur-md' : 'border-gray-200 bg-white'}`}>
                            <div className="flex flex-col">
                                {/* Simple links */}
                                {[
                                    { label: 'Home', href: '#home' },
                                    { label: 'Worship', href: '#worship' },
                                    { label: 'Events', href: '/events' },
                                    { label: 'Sermons', href: '/sermons' },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium px-1 py-3 border-b transition-colors ${navTransparent ? 'text-white/90 hover:text-white border-white/10' : 'text-gray-700 hover:text-blue-900 border-gray-100'}`}>
                                        {item.label}
                                    </a>
                                ))}

                                {/* About accordion */}
                                <div className={`border-b ${navTransparent ? 'border-white/10' : 'border-gray-100'}`}>
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'about' ? null : 'about')}
                                        className={`w-full flex justify-between items-center font-medium px-1 py-3 transition-colors ${navTransparent ? 'text-white/90' : 'text-gray-700'}`}
                                    >
                                        About
                                        <svg className={`w-4 h-4 transition-transform ${mobileSection === 'about' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {mobileSection === 'about' && (
                                        <div className={`pb-2 flex flex-col ${navTransparent ? 'bg-white/5' : 'bg-gray-50'} rounded-lg mb-2`}>
                                            {[
                                                { label: 'Cathedral History', href: '/history' },
                                                { label: 'Clergy & Wardens', href: '/about#clergy' },
                                                { label: 'Cathedral Staff', href: '/staff' },
                                                { label: 'Mission & Vision', href: '/about#mission' },
                                                { label: 'Photo Gallery', href: '/gallery' },
                                                { label: 'News & Announcements', href: '/announcements' },
                                                { label: 'Resources & Downloads', href: '/resources' },
                                            ].map((sub) => (
                                                <a key={sub.label} href={sub.href} onClick={() => setMobileMenuOpen(false)}
                                                    className={`pl-4 pr-2 py-2.5 text-sm font-medium transition-colors ${navTransparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-blue-900'}`}>
                                                    {sub.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Ministries accordion */}
                                <div className={`border-b ${navTransparent ? 'border-white/10' : 'border-gray-100'}`}>
                                    <button
                                        onClick={() => setMobileSection(mobileSection === 'ministries' ? null : 'ministries')}
                                        className={`w-full flex justify-between items-center font-medium px-1 py-3 transition-colors ${navTransparent ? 'text-white/90' : 'text-gray-700'}`}
                                    >
                                        Ministries
                                        <svg className={`w-4 h-4 transition-transform ${mobileSection === 'ministries' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {mobileSection === 'ministries' && (
                                        <div className={`pb-2 flex flex-col ${navTransparent ? 'bg-white/5' : 'bg-gray-50'} rounded-lg mb-2`}>
                                            {[
                                                { label: 'All Ministries', href: '/ministries' },
                                                { label: "Children's Ministry", href: '/ministries/children' },
                                                { label: 'Youth Ministry (KAYO)', href: '/ministries/kayo' },
                                                { label: "Women's Fellowship (AWF)", href: '/ministries/awf' },
                                                { label: "Mother's Union", href: '/ministries/mothers-union' },
                                                { label: "Men's Fellowship (AMF)", href: '/ministries/amf' },
                                                { label: 'KAMA', href: '/ministries/kama' },
                                                { label: 'Choir & Music', href: '/ministries/choir' },
                                                { label: 'Prayer Ministry', href: '/ministries/prayer' },
                                                { label: 'Missions & Outreach', href: '/ministries/missions' },
                                            ].map((sub) => (
                                                <a key={sub.label} href={sub.href} onClick={() => setMobileMenuOpen(false)}
                                                    className={`pl-4 pr-2 py-2.5 text-sm font-medium transition-colors ${navTransparent ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-blue-900'}`}>
                                                    {sub.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Remaining simple links */}
                                {[
                                    { label: 'Prayer', href: '/prayer' },
                                    { label: 'Get Involved', href: '/get-involved' },
                                    { label: 'Contact', href: '/contact' },
                                ].map((item) => (
                                    <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                                        className={`font-medium px-1 py-3 border-b transition-colors ${navTransparent ? 'text-white/90 hover:text-white border-white/10' : 'text-gray-700 hover:text-blue-900 border-gray-100'}`}>
                                        {item.label}
                                    </a>
                                ))}

                                {/* Contact info */}
                                <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${navTransparent ? 'border-white/20' : 'border-gray-200'}`}>
                                    <a href="tel:+254700000000" className={`flex items-center gap-2 text-sm py-1 ${navTransparent ? 'text-white/70' : 'text-gray-500'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        +254 700 000 000
                                    </a>
                                    <a href="mailto:info@ackmombasa.org" className={`flex items-center gap-2 text-sm py-1 ${navTransparent ? 'text-white/70' : 'text-gray-500'}`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        info@ackmombasa.org
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Full-Screen Video Hero Section */}
            <section id="home" className="relative overflow-hidden text-white" style={{ minHeight: '100vh' }}>
                {/* Background video — swap src for the cathedral's own footage */}
                <video
                    ref={heroVideoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: `scale(1.05) translateY(${scrollY * 0.08}px)` }}
                >
                    <source src="/drone%20video.mp4" type="video/mp4" />
                </video>

                {/* Layered dark overlay — deep blue tint for brand consistency */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-950/50 to-blue-950/80" />

                {/* Content centred in the viewport */}
                <div className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8" style={{ minHeight: '100vh' }}>
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8">
                            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                            <p className="text-amber-300 text-sm font-semibold tracking-widest uppercase">Welcome to Our Cathedral</p>
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-[1.15] tracking-tight mb-5 drop-shadow-2xl">
                            Christ-Centered Families,<br />
                            Renewed Churches,<br />
                            <span className="text-amber-400">Transformed Neighbourhoods</span>
                        </h1>

                        <p className="text-base sm:text-2xl text-white/80 font-light tracking-wide mb-8 drop-shadow-lg">
                            Your Cathedral &middot; 120 Years in the Making
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto px-4 sm:px-0">
                            <a href="#worship" className="bg-white text-blue-900 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Join Us This Sunday
                            </a>
                            <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer"
                                className="bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-red-700 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                                </span>
                                Watch Live on YouTube
                            </a>
                            <a href="#history" className="bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold hover:bg-white/20 hover:scale-105 transition-all inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                Visit Us
                            </a>
                        </div>
                    </div>

                    {/* Scroll-down chevron */}
                    <div className="absolute bottom-10 animate-bounce">
                        <svg className="w-7 h-7 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* White fade at the bottom so the next section blends in */}
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </section>

            {/* Live Stream Banner */}
            <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping absolute"></div>
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                            </div>
                            <div>
                                <p className="font-bold text-lg">Next Service: Sunday 11:00 AM (Main Service)</p>
                                <p className="text-sm text-red-100">Join us live or watch online</p>
                            </div>
                        </div>
                        <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            Watch Live
                        </a>
                    </div>
                </div>
            </section>

            {/* Service Times Section - Updated with 4 Services */}
            <section id="worship" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            JOIN US FOR WORSHIP
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Sunday Service Times</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Four services every Sunday to worship with us. All services are live streamed. Everyone is welcome!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {/* 7 AM English Service */}
                        <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-blue-900 mb-2">7:00 AM</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">English Service</h3>
                            <p className="text-gray-600 mb-4">Traditional Anglican liturgy in English</p>
                            <div className="space-y-1 mb-5">
                                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Live Streamed
                                </div>
                                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    1 hour
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-blue-200">
                                <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    Watch Live
                                </a>
                                <a href="#" className="flex items-center justify-center gap-2 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Service Sheet
                                </a>
                            </div>
                        </div>

                        {/* 9 AM Swahili Service */}
                        <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-green-900 mb-2">9:00 AM</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Swahili Service</h3>
                            <p className="text-gray-600 mb-4">Ibada kwa Kiswahili</p>
                            <div className="space-y-1 mb-5">
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Live Streamed
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    1.5 hours
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-green-200">
                                <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    Tazama Moja kwa Moja
                                </a>
                                <a href="#" className="flex items-center justify-center gap-2 bg-green-100 text-green-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-green-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Karatasi ya Ibada
                                </a>
                            </div>
                        </div>

                        {/* 11 AM Main Service */}
                        <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-300 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden">
                            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                POPULAR
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-purple-900 mb-2">11:00 AM</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Main Service</h3>
                            <p className="text-gray-600 mb-4">English with live streaming & translation</p>
                            <div className="space-y-1 mb-5">
                                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Live Streamed
                                </div>
                                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    2 hours
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-purple-200">
                                <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    Watch Live
                                </a>
                                <a href="#" className="flex items-center justify-center gap-2 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Service Sheet
                                </a>
                            </div>
                        </div>

                        {/* 6 PM Evensong Service */}
                        <div className="group bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                            </div>
                            <div className="text-4xl font-bold text-amber-900 mb-2">6:00 PM</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Evensong Service</h3>
                            <p className="text-gray-600 mb-4">Choral Evening Prayer</p>
                            <div className="space-y-1 mb-5">
                                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    Live Streamed
                                </div>
                                <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    1 hour
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 pt-4 border-t border-amber-200">
                                <a href={CATHEDRAL_LIVE_URL} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                    Watch Live
                                </a>
                                <a href="#" className="flex items-center justify-center gap-2 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-amber-200 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    Service Sheet
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Additional Service Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Children's Ministry</h4>
                                    <p className="text-sm text-gray-600">Sunday School during 9 AM & 11 AM services</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Online Giving</h4>
                                    <p className="text-sm text-gray-600">M-PESA Paybill available for tithes & offerings</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">First-Time Visitors</h4>
                                    <p className="text-sm text-gray-600">Welcome desk open 30 minutes before services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Daily Prayer Schedule */}
            <section className="py-14 bg-gradient-to-r from-indigo-900 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="md:max-w-sm">
                            <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                DAILY PRAYER
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Join Us in Prayer</h2>
                            <p className="text-blue-200 text-sm leading-relaxed">
                                Morning prayers are held throughout the week. All are welcome — in person or online via our prayer link.
                            </p>
                            <a href="/prayer" className="inline-flex items-center gap-2 mt-5 bg-white text-indigo-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                Submit a Prayer Request
                            </a>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4 flex-1">
                            {[
                                { day: 'Monday', time: '6:00 AM – 7:00 AM', type: 'Morning Prayer', location: 'Main Sanctuary' },
                                { day: 'Wednesday', time: '6:00 AM – 7:00 AM', type: 'Morning Prayer', location: 'Main Sanctuary' },
                                { day: 'Friday', time: '6:00 AM – 7:00 AM', type: 'Morning Prayer & Intercession', location: 'Chapel' },
                            ].map(session => (
                                <div key={session.day} className="bg-white/10 border border-white/20 rounded-2xl p-5 hover:bg-white/20 transition-colors">
                                    <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">{session.day}</div>
                                    <div className="text-lg font-bold text-white mb-1">{session.time}</div>
                                    <div className="text-sm text-blue-200 mb-2">{session.type}</div>
                                    <div className="flex items-center gap-1 text-xs text-blue-300">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {session.location}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Cathedral History Section */}
            <section id="history" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                OUR HERITAGE
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">120+ Years of Faithful Service</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Founded in 1903, ACK Mombasa Memorial Cathedral has been a cornerstone of faith and community in the coastal region. Our rich heritage spans over a century of worship, mission, and service to the people of Mombasa.
                            </p>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                From our humble beginnings as a small mission church, we have grown into a vibrant cathedral serving over 2,500 members, while maintaining our commitment to biblical truth and compassionate service.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
                                    <div className="text-4xl font-bold text-blue-900 mb-2">1903</div>
                                    <p className="text-sm text-gray-600">Cathedral Founded</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all">
                                    <div className="text-4xl font-bold text-blue-900 mb-2">2,500+</div>
                                    <p className="text-sm text-gray-600">Active Members</p>
                                </div>
                            </div>
                            <a href="/history" className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 hover:scale-105 transition-all">
                                Read Full History
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </a>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                                <div className="relative">
                                    <h3 className="text-2xl font-bold text-white mb-6">Historical Milestones</h3>
                                    <div className="space-y-6">
                                        {[
                                            { year: '1903', event: 'Cathedral established by Anglican missionaries' },
                                            { year: '1935', event: 'First Kenyan bishop consecrated' },
                                            { year: '1963', event: 'Independence celebration service held' },
                                            { year: '1985', event: 'Major cathedral renovation completed' },
                                            { year: '2010', event: 'Digital ministry & live streaming launched' },
                                            { year: '2024', event: 'New website and online engagement platform' }
                                        ].map((milestone, index) => (
                                            <div key={index} className="flex gap-4 group cursor-pointer">
                                                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-all">
                                                    <span className="text-white font-bold">{milestone.year}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-sm leading-relaxed group-hover:text-amber-200 transition-colors">{milestone.event}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ministry Groups Section */}
            <section id="ministries" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-purple-100 text-purple-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            GET INVOLVED
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Our Ministry Groups</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Find your place in our vibrant community through various ministry groups and activities
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {[
                            {
                                name: "Children's Ministry",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                                color: "from-pink-500 to-rose-500",
                                bgColor: "from-pink-50 to-rose-50",
                                href: "/ministries/children",
                                schedule: "Sundays 9 AM & 11 AM"
                            },
                            {
                                name: "Youth Ministry",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                                color: "from-blue-500 to-indigo-500",
                                bgColor: "from-blue-50 to-indigo-50",
                                href: "/ministries/kayo",
                                schedule: "Fridays 6 PM"
                            },
                            {
                                name: "Women's Fellowship",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                                color: "from-purple-500 to-pink-500",
                                bgColor: "from-purple-50 to-pink-50",
                                href: "/ministries/awf",
                                schedule: "Thursdays 2 PM"
                            },
                            {
                                name: "Men's Fellowship",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                                color: "from-green-500 to-emerald-500",
                                bgColor: "from-green-50 to-emerald-50",
                                href: "/ministries/amf",
                                schedule: "Saturdays 8 AM"
                            }
                        ].map((ministry, index) => (
                            <div key={index} className={`group bg-gradient-to-br ${ministry.bgColor} rounded-2xl p-6 border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                                <div className={`w-14 h-14 bg-gradient-to-br ${ministry.color} rounded-xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {ministry.icon}
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{ministry.name}</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {ministry.schedule}
                                    </p>
                                </div>
                                <a href={ministry.href} className="mt-4 text-sm font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1">
                                    Learn More
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Additional Ministries */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">More Ministries</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                              { label: 'Choir & Music', href: '/ministries/choir' },
                              { label: 'Prayer Ministry', href: '/ministries/prayer' },
                              { label: 'Ushers & Hospitality', href: '/ministries/ushers' },
                              { label: 'Media Team', href: '/ministries/media' },
                              { label: 'Counseling', href: '/ministries/counseling' },
                              { label: 'Missions & Outreach', href: '/ministries/missions' },
                            ].map((ministry, index) => (
                                <a key={index} href={ministry.href} className="flex items-center gap-3 bg-white rounded-lg p-4 hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{ministry.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sermon Videos Section */}
            <section id="sermons" className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                                WATCH ON YOUTUBE
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Recent Sermons</h2>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                            Watch our latest messages and catch up on services you may have missed
                        </p>
                    </div>

                    {videosLoading ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="bg-white/10 rounded-2xl overflow-hidden border border-white/20 animate-pulse">
                                    <div className="aspect-video bg-white/10" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/10 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentSermons.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-blue-200">Visit our YouTube channel to watch our latest services and sermons.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-3 gap-8">
                            {recentSermons.map((video) => (
                                <a key={video.id} href={video.url} target="_blank" rel="noopener noreferrer"
                                    className="group bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all cursor-pointer block">
                                    {/* Video Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <img src={video.thumbnail} alt={video.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                        <div className="relative h-full flex items-center justify-center">
                                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Video Info */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors line-clamp-2">{video.title}</h3>
                                        <div className="flex items-center justify-between text-xs text-blue-300">
                                            <span>{new Date(video.published).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                            <span>{formatViews(video.views)}</span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-10">
                        <a href={`${CATHEDRAL_CHANNEL_URL}/videos`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 hover:scale-105 transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            View All Sermons on YouTube
                        </a>
                    </div>
                </div>
            </section>

            {/* Events Section with Tabs */}
            <section id="events" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-green-100 text-green-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            WHAT&apos;S HAPPENING
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                        <p className="text-lg text-gray-600">Join us for fellowship, learning, and community activities</p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Upcoming events will be announced here</h3>
                        <p className="text-gray-600 mb-6">Follow our announcements or contact the church office to learn what&rsquo;s coming up.</p>
                        <a href="/contact" className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                            Contact the Church Office
                        </a>
                    </div>
                </div>
            </section>

            {/* Prayer Request & Counseling */}
            <section className="py-16 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Prayer Request Form */}
                        <div>
                            <div className="inline-block bg-indigo-100 text-indigo-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                                PRAYER REQUESTS
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Submit a Prayer Request</h2>
                            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                                Share your prayer needs with us. Our prayer team intercedes faithfully every week — your request is safe and confidential.
                            </p>
                            <PrayerRequestForm />
                        </div>
                        {/* Counseling */}
                        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl p-8 text-white">
                            <div className="inline-block bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                                PASTORAL COUNSELING
                            </div>
                            <h2 className="text-2xl font-bold mb-4">We Are Here for You</h2>
                            <p className="text-blue-200 text-sm leading-relaxed mb-8">
                                Our trained counselors and clergy offer confidential emotional and spiritual support. Whether you&apos;re facing a personal challenge, grief, marriage difficulties, or simply need someone to talk to — reach out.
                            </p>
                            <div className="space-y-4 mb-8">
                                {[
                                    { label: 'Counseling Line', value: '+254 726 000 462', icon: 'phone' },
                                    { label: 'Prayer Line', value: '0110-095-533', icon: 'phone' },
                                    { label: 'Email', value: 'care@ackmombasa.org', icon: 'email' },
                                    { label: 'Walk-In Hours', value: 'Mon – Fri, 9 AM – 4 PM', icon: 'clock' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            {item.icon === 'phone' && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
                                            {item.icon === 'email' && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                                            {item.icon === 'clock' && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        </div>
                                        <div>
                                            <div className="text-xs text-blue-300 font-semibold">{item.label}</div>
                                            <div className="text-sm font-bold text-white">{item.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                                Contact Our Pastoral Team →
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />

        </div>
    );
}
