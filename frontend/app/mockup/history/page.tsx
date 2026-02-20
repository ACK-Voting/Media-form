'use client';

import { useState } from 'react';

export default function CathedralHistory() {
    const [activeEra, setActiveEra] = useState('all');

    const historicalEvents = [
        {
            era: 'founding',
            year: '1903',
            title: 'Foundation of ACK Cathedral Mombasa',
            description: 'Anglican missionaries established the cathedral as a beacon of faith on the Kenyan coast. The mission began with a small congregation meeting in a modest building near the Old Town.',
            image: '🏛️',
            significance: 'Major Milestone'
        },
        {
            era: 'founding',
            year: '1905',
            title: 'First Permanent Structure Built',
            description: 'Construction completed on the first permanent church building, featuring traditional coastal architecture with coral stone walls.',
            image: '⛪',
            significance: 'Building'
        },
        {
            era: 'early',
            year: '1920',
            title: 'Establishment of Mission School',
            description: 'Cathedral opened its first mission school, providing education to local children and becoming a center of learning in the community.',
            image: '📚',
            significance: 'Education'
        },
        {
            era: 'early',
            year: '1935',
            title: 'First Kenyan Bishop Consecrated',
            description: 'A historic moment as the first Kenyan bishop was consecrated at the cathedral, marking the beginning of indigenous leadership in the Anglican Church of Kenya.',
            image: '⛪',
            significance: 'Major Milestone'
        },
        {
            era: 'growth',
            year: '1952',
            title: 'Cathedral Expanded',
            description: 'Major expansion project completed, doubling the seating capacity to accommodate the growing congregation.',
            image: '🏗️',
            significance: 'Building'
        },
        {
            era: 'growth',
            year: '1963',
            title: 'Kenya Independence Celebration',
            description: 'Cathedral hosted special thanksgiving service for Kenya\'s independence, attended by local and national leaders.',
            image: '🇰🇪',
            significance: 'Major Milestone'
        },
        {
            era: 'growth',
            year: '1970',
            title: 'Youth Ministry Established',
            description: 'Formal youth ministry program launched, focusing on discipleship and community engagement for young people.',
            image: '👥',
            significance: 'Ministry'
        },
        {
            era: 'modern',
            year: '1985',
            title: 'Major Renovation Completed',
            description: 'Comprehensive renovation of the cathedral structure, preserving historical elements while modernizing facilities for worship and community programs.',
            image: '🔧',
            significance: 'Building'
        },
        {
            era: 'modern',
            year: '1995',
            title: 'Community Outreach Programs',
            description: 'Launched extensive community outreach initiatives including medical clinics, food programs, and skills training centers.',
            image: '🤝',
            significance: 'Ministry'
        },
        {
            era: 'modern',
            year: '2010',
            title: 'Digital Ministry Launch',
            description: 'Cathedral embraced technology with live streaming services, online sermons, and digital engagement platforms reaching believers worldwide.',
            image: '📡',
            significance: 'Major Milestone'
        },
        {
            era: 'modern',
            year: '2015',
            title: 'Interfaith Dialogue Center',
            description: 'Established interfaith dialogue center promoting understanding and cooperation among different religious communities in Mombasa.',
            image: '☮️',
            significance: 'Ministry'
        },
        {
            era: 'modern',
            year: '2024',
            title: 'New Website & Digital Platform',
            description: 'Launched comprehensive digital platform with dynamic CMS, enhanced online engagement, and improved member communication systems.',
            image: '💻',
            significance: 'Major Milestone'
        }
    ];

    const keyFigures = [
        {
            name: 'Rev. John Thompson',
            role: 'Founding Missionary',
            years: '1903-1920',
            contribution: 'Established the cathedral and led the early mission work among the coastal communities.'
        },
        {
            name: 'Bishop Samuel Mwangi',
            role: 'First Kenyan Bishop',
            years: '1935-1955',
            contribution: 'First indigenous bishop, championed local leadership and expanded community programs.'
        },
        {
            name: 'Canon Margaret Nyambura',
            role: 'Education Pioneer',
            years: '1960-1985',
            contribution: 'Established numerous schools and literacy programs, transforming education in the region.'
        },
        {
            name: 'Archbishop Peter Njenga',
            role: 'Community Leader',
            years: '1985-2005',
            contribution: 'Led major renovation projects and established lasting community development initiatives.'
        }
    ];

    const architecturalFeatures = [
        {
            feature: 'Coral Stone Construction',
            description: 'Traditional coastal architecture using locally-sourced coral stone, reflecting Swahili building traditions.',
            icon: '🏛️'
        },
        {
            feature: 'Stained Glass Windows',
            description: 'Beautiful stained glass windows installed in 1952, depicting biblical scenes and local saints.',
            icon: '🎨'
        },
        {
            feature: 'Bell Tower',
            description: 'Historic bell tower with three bells cast in England, ringing daily to call the faithful to prayer.',
            icon: '🔔'
        },
        {
            feature: 'Main Sanctuary',
            description: 'Seats 800 worshippers with excellent acoustics for both speech and choral performances.',
            icon: '⛪'
        }
    ];

    const filteredEvents = activeEra === 'all'
        ? historicalEvents
        : historicalEvents.filter(event => event.era === activeEra);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <a href="/mockup" className="flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Main Site
                        </a>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <span className="font-bold text-gray-900">ACK Mombasa</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full text-sm font-semibold mb-6">
                            OUR HERITAGE
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            Cathedral History Timeline
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Discover the rich heritage of ACK Cathedral Mombasa — 120+ years of faith, service, and community transformation on the Kenyan coast.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <div className="text-4xl font-bold mb-2">1903</div>
                                <div className="text-blue-200 text-sm">Founded</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <div className="text-4xl font-bold mb-2">120+</div>
                                <div className="text-blue-200 text-sm">Years of Ministry</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <div className="text-4xl font-bold mb-2">2,500+</div>
                                <div className="text-blue-200 text-sm">Active Members</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Era Filter */}
            <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => setActiveEra('all')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                                activeEra === 'all'
                                    ? 'bg-blue-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Events
                        </button>
                        <button
                            onClick={() => setActiveEra('founding')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                                activeEra === 'founding'
                                    ? 'bg-blue-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Founding Era (1903-1919)
                        </button>
                        <button
                            onClick={() => setActiveEra('early')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                                activeEra === 'early'
                                    ? 'bg-blue-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Early Growth (1920-1950)
                        </button>
                        <button
                            onClick={() => setActiveEra('growth')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                                activeEra === 'growth'
                                    ? 'bg-blue-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Expansion (1951-1984)
                        </button>
                        <button
                            onClick={() => setActiveEra('modern')}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                                activeEra === 'modern'
                                    ? 'bg-blue-900 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Modern Era (1985-Present)
                        </button>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Historical Timeline</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Key moments that shaped our cathedral and community over 120+ years
                        </p>
                    </div>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 h-full"></div>

                        {/* Timeline Events */}
                        <div className="space-y-12">
                            {filteredEvents.map((event, index) => (
                                <div
                                    key={index}
                                    className={`relative flex items-center ${
                                        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                    } flex-col gap-8`}
                                >
                                    {/* Content Card */}
                                    <div className={`w-full lg:w-5/12 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                                        <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 group hover:scale-105">
                                            <div className="flex items-center gap-3 mb-4 justify-start">
                                                <span className="text-4xl">{event.image}</span>
                                                <div className={index % 2 === 0 ? 'lg:text-right' : 'text-left'}>
                                                    <div className="text-3xl font-bold text-blue-900">{event.year}</div>
                                                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                                        event.significance === 'Major Milestone'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : event.significance === 'Building'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {event.significance}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className={`text-xl font-bold text-gray-900 mb-3 ${index % 2 === 0 ? 'lg:text-right' : 'text-left'}`}>
                                                {event.title}
                                            </h3>
                                            <p className={`text-gray-600 leading-relaxed ${index % 2 === 0 ? 'lg:text-right' : 'text-left'}`}>
                                                {event.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>

                                    {/* Spacer */}
                                    <div className="hidden lg:block w-5/12"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Figures Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            CATHEDRAL LEADERS
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Key Figures in Our History</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Visionary leaders who shaped the cathedral's mission and ministry
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {keyFigures.map((figure, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold">
                                    {figure.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1 text-center">{figure.name}</h3>
                                <p className="text-sm text-blue-600 font-medium mb-2 text-center">{figure.role}</p>
                                <p className="text-xs text-gray-500 mb-3 text-center">{figure.years}</p>
                                <p className="text-sm text-gray-600 text-center">{figure.contribution}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architectural Heritage Section */}
            <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-blue-100 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                            ARCHITECTURAL HERITAGE
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cathedral Architecture</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Unique architectural features blending traditional Swahili design with Anglican heritage
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {architecturalFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:scale-105">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.feature}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Legacy Section */}
            <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Our Enduring Legacy</h2>
                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                        From a small mission church in 1903 to a vibrant cathedral community serving over 2,500 members today,
                        ACK Cathedral Mombasa continues to be a beacon of hope, faith, and service on the Kenyan coast.
                    </p>
                    <p className="text-lg text-blue-200 mb-8">
                        Our history is not just about the past — it's the foundation for our future. As we embrace digital
                        ministry and innovative outreach, we remain rooted in the timeless mission of sharing Christ's love
                        and transforming our community.
                    </p>
                    <a
                        href="/mockup"
                        className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-all hover:scale-105"
                    >
                        Return to Main Site
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <span className="font-bold text-lg">ACK Cathedral Mombasa</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} ACK Cathedral Mombasa. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
