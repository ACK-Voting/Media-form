'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ACKCathedralMockup() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [scrollY, setScrollY] = useState(0);

    // Hero carousel slides
    const heroSlides = [
        {
            title: "A House of Prayer for All Nations",
            subtitle: "Join us in worship, fellowship, and service",
            cta: "Join Us This Sunday"
        },
        {
            title: "Growing Together in Faith",
            subtitle: "Building a community rooted in Christ's love",
            cta: "Explore Our Ministries"
        },
        {
            title: "Serving Mombasa Since 1903",
            subtitle: "Over 120 years of faithful ministry",
            cta: "Discover Our History"
        }
    ];

    // Auto-rotate hero slides
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Parallax effect
    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <div className="bg-blue-950 text-white text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="flex items-center gap-4">
                            <a href="tel:+254700123456" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                +254 700 123 456
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
                            <a href="#youtube" className="hover:text-amber-400 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-blue-900">ACK Cathedral Mombasa</h1>
                                <p className="text-xs text-gray-600">Anglican Church of Kenya</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            <a href="#home" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Home</a>
                            <div className="relative group">
                                <button className="text-gray-700 hover:text-blue-900 font-medium transition-colors flex items-center gap-1">
                                    About
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <a href="/mockup/history" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Cathedral History</a>
                                    <a href="#leadership" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Leadership</a>
                                    <a href="#mission" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Mission & Vision</a>
                                </div>
                            </div>
                            <a href="#worship" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Worship</a>
                            <div className="relative group">
                                <button className="text-gray-700 hover:text-blue-900 font-medium transition-colors flex items-center gap-1">
                                    Ministries
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <a href="#children" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Children's Ministry</a>
                                    <a href="#youth" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Youth Ministry</a>
                                    <a href="#women" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Women's Fellowship</a>
                                    <a href="#men" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-blue-900 transition-colors">Men's Fellowship</a>
                                </div>
                            </div>
                            <a href="#events" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Events</a>
                            <a href="#sermons" className="text-gray-700 hover:text-blue-900 font-medium transition-colors">Sermons</a>
                            <a href="#give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all">Give</a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-gray-200">
                            <div className="flex flex-col gap-3">
                                <a href="#home" className="text-gray-700 hover:text-blue-900 font-medium py-2">Home</a>
                                <a href="#about" className="text-gray-700 hover:text-blue-900 font-medium py-2">About</a>
                                <a href="#worship" className="text-gray-700 hover:text-blue-900 font-medium py-2">Worship</a>
                                <a href="#ministries" className="text-gray-700 hover:text-blue-900 font-medium py-2">Ministries</a>
                                <a href="#events" className="text-gray-700 hover:text-blue-900 font-medium py-2">Events</a>
                                <a href="#sermons" className="text-gray-700 hover:text-blue-900 font-medium py-2">Sermons</a>
                                <a href="#give" className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-5 py-2.5 rounded-lg font-semibold text-center">Give</a>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Dynamic Hero Section with Carousel */}
            <section id="home" className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 text-white overflow-hidden h-[600px]">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" style={{ transform: `translateY(${scrollY * 0.5}px)` }}></div>

                {/* Carousel Slides */}
                <div className="relative h-full">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <div className="relative h-full flex items-center">
                                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                                    <div className="max-w-3xl">
                                        <div className="inline-block bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 mb-6 animate-pulse">
                                            <p className="text-amber-300 text-sm font-medium">Welcome to Our Cathedral</p>
                                        </div>
                                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
                                            {slide.title}
                                        </h1>
                                        <p className="text-xl text-blue-100 mb-8 leading-relaxed animate-fade-in-delay">
                                            {slide.subtitle}
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <a href="#worship" className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {slide.cta}
                                            </a>
                                            <a href="#visit" className="bg-blue-800/50 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800/70 hover:scale-105 transition-all inline-flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                Visit Us
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Indicators */}
                <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-8' : 'bg-white/50 w-2'
                                }`}
                        />
                    ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
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
                        <a href="#livestream" className="bg-white text-red-600 px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
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
                            <div className="space-y-1">
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
                            <div className="space-y-1">
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
                            <div className="space-y-1">
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
                            <div className="space-y-1">
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
                                Founded in 1903, ACK Cathedral Mombasa has been a cornerstone of faith and community in the coastal region. Our rich heritage spans over a century of worship, mission, and service to the people of Mombasa.
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
                            <a href="/mockup/history" className="inline-flex items-center gap-2 bg-blue-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 hover:scale-105 transition-all">
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
                                members: "350+ children",
                                schedule: "Sundays 9 AM & 11 AM"
                            },
                            {
                                name: "Youth Ministry",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                                color: "from-blue-500 to-indigo-500",
                                bgColor: "from-blue-50 to-indigo-50",
                                members: "200+ youth",
                                schedule: "Fridays 6 PM"
                            },
                            {
                                name: "Women's Fellowship",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
                                color: "from-purple-500 to-pink-500",
                                bgColor: "from-purple-50 to-pink-50",
                                members: "500+ women",
                                schedule: "Thursdays 2 PM"
                            },
                            {
                                name: "Men's Fellowship",
                                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
                                color: "from-green-500 to-emerald-500",
                                bgColor: "from-green-50 to-emerald-50",
                                members: "400+ men",
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {ministry.members}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {ministry.schedule}
                                    </p>
                                </div>
                                <button className="mt-4 text-sm font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1">
                                    Learn More
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Additional Ministries */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">More Ministries</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {['Choir & Music', 'Prayer Ministry', 'Ushers & Hospitality', 'Media Team', 'Counseling', 'Missions & Outreach'].map((ministry, index) => (
                                <a key={index} href={`#${ministry.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center gap-3 bg-white rounded-lg p-4 hover:shadow-md transition-all group">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <svg className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                    <span className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{ministry}</span>
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

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Walking in Faith",
                                preacher: "Rev. Dr. James Mwangi",
                                date: "Sunday, Feb 18, 2024",
                                views: "2.5K views",
                                duration: "45:20"
                            },
                            {
                                title: "The Power of Prayer",
                                preacher: "Rev. Sarah Kamau",
                                date: "Sunday, Feb 11, 2024",
                                views: "3.1K views",
                                duration: "38:15"
                            },
                            {
                                title: "God's Unfailing Love",
                                preacher: "Rev. Dr. James Mwangi",
                                date: "Sunday, Feb 4, 2024",
                                views: "2.8K views",
                                duration: "42:30"
                            }
                        ].map((sermon, index) => (
                            <div key={index} className="group bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                                {/* Video Thumbnail */}
                                <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-indigo-600 overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
                                    <div className="relative h-full flex items-center justify-center">
                                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                                        {sermon.duration}
                                    </div>
                                </div>
                                {/* Video Info */}
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">{sermon.title}</h3>
                                    <p className="text-sm text-blue-200 mb-1">{sermon.preacher}</p>
                                    <div className="flex items-center justify-between text-xs text-blue-300">
                                        <span>{sermon.date}</span>
                                        <span>{sermon.views}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <a href="#all-sermons" className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 hover:scale-105 transition-all">
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
                            WHAT'S HAPPENING
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
                        <p className="text-lg text-gray-600">Join us for fellowship, learning, and community activities</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setActiveTab('upcoming')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'upcoming'
                                ? 'bg-blue-900 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Upcoming Events
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'past'
                                ? 'bg-blue-900 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            Past Events
                        </button>
                    </div>

                    {/* Events Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeTab === 'upcoming' ? (
                            <>
                                {[
                                    {
                                        title: "Cathedral Choir Concert",
                                        date: "March 15, 2024",
                                        time: "6:00 PM - 8:00 PM",
                                        category: "Music",
                                        color: "blue"
                                    },
                                    {
                                        title: "Youth Leadership Training",
                                        date: "March 22, 2024",
                                        time: "2:00 PM - 5:00 PM",
                                        category: "Workshop",
                                        color: "purple"
                                    },
                                    {
                                        title: "Community Outreach Day",
                                        date: "March 29, 2024",
                                        time: "8:00 AM - 2:00 PM",
                                        category: "Outreach",
                                        color: "green"
                                    }
                                ].map((event, index) => (
                                    <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all group">
                                        <div className={`relative h-48 bg-gradient-to-br ${event.color === 'blue' ? 'from-blue-600 to-indigo-600' :
                                            event.color === 'purple' ? 'from-purple-600 to-pink-600' :
                                                'from-green-600 to-emerald-600'
                                            } overflow-hidden`}>
                                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>
                                            <div className="absolute top-4 right-4 bg-white rounded-lg px-3 py-1.5 shadow-md">
                                                <p className="text-xs font-semibold text-gray-600">{event.date.split(' ')[0]}</p>
                                                <p className="text-xl font-bold text-gray-900">{event.date.split(' ')[1].replace(',', '')}</p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${event.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                                event.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>{event.category}</span>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">{event.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {event.time}
                                            </div>
                                            <button className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors">
                                                Register Now
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-gray-600 mb-4">Past events will be displayed here</p>
                                <p className="text-sm text-gray-500">Browse through our event archive and photo galleries</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CMS Features Banner */}
            {/* <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Dynamic Content Management</h2>
            <p className="text-lg text-blue-100">This website features a powerful admin portal for easy content updates</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />, title: "Easy Editing", desc: "Update content without technical knowledge" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, title: "Event Management", desc: "Add and manage events in real-time" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />, title: "Video Integration", desc: "Embed YouTube sermons automatically" },
              { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />, title: "Member Portal", desc: "Secure login for members and staff" }
            ].map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-blue-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

            {/* Footer */}
            <footer className="bg-gray-900 text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                        {/* About */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-lg">ACK Mombasa</span>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                A House of Prayer for All Nations - Serving the Mombasa community since 1903.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                                <li><a href="/mockup/history" className="hover:text-white transition-colors">Cathedral History</a></li>
                                <li><a href="#worship" className="hover:text-white transition-colors">Worship Services</a></li>
                                <li><a href="#events" className="hover:text-white transition-colors">Events</a></li>
                                <li><a href="#sermons" className="hover:text-white transition-colors">Sermons</a></li>
                                <li><a href="#give" className="hover:text-white transition-colors">Give Online</a></li>
                            </ul>
                        </div>

                        {/* Ministries */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Ministries</h3>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#children" className="hover:text-white transition-colors">Children's Ministry</a></li>
                                <li><a href="#youth" className="hover:text-white transition-colors">Youth Ministry</a></li>
                                <li><a href="#women" className="hover:text-white transition-colors">Women's Fellowship</a></li>
                                <li><a href="#men" className="hover:text-white transition-colors">Men's Fellowship</a></li>
                                <li><a href="#music" className="hover:text-white transition-colors">Music & Worship</a></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
                            <ul className="space-y-3 text-gray-400 text-sm">
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    <span>Nkrumah Road, Mombasa, Kenya</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span>+254 700 123 456</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>info@ackmombasa.org</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-gray-800">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                            <p>&copy; 2024 ACK Cathedral Mombasa. All rights reserved.</p>
                            {/* <p className="text-amber-400 font-semibold">🚀 Built with Dynamic Content Management System</p> */}
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s backwards;
        }
      `}</style>
        </div>
    );
}
