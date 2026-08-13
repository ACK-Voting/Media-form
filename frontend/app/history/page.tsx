'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '../_components/Navbar';
import Footer from '../_components/Footer';
import { useHistoryStore } from '@/stores/cms/historyStore';

// Labels live here rather than in five near-identical blocks of JSX.
const ERAS: { key: string; label: string }[] = [
    { key: 'all', label: 'All Events' },
    { key: 'founding', label: 'Beginnings (1844–1901)' },
    { key: 'early', label: 'Building the Cathedral (1902–1912)' },
    { key: 'growth', label: 'Consolidation (1913–1980)' },
    { key: 'modern', label: 'Modern Era (1981–present)' },
];

export default function CathedralHistory() {
    const [activeEra, setActiveEra] = useState('all');
    const timelineRef = useRef<HTMLElement>(null);
    const filterBarRef = useRef<HTMLElement>(null);

    /**
     * Filtering shortens the page, sometimes by thousands of pixels. Without
     * this, a reader who filters while scrolled into the timeline is left far
     * below the results they just asked for — looking at the footer, with every
     * appearance of having clicked a dead button.
     *
     * The scroll runs in an effect rather than in the click handler because it
     * has to measure the *filtered* list: in the handler React has not committed
     * the shorter page yet, so the target lands thousands of pixels out.
     */
    const skipFirstScroll = useRef(true);

    useEffect(() => {
        if (skipFirstScroll.current) {
            skipFirstScroll.current = false;
            return;
        }
        const target = timelineRef.current;
        if (!target) return;
        // Clear the 72px fixed navbar and the filter bar pinned beneath it.
        const offset = 72 + (filterBarRef.current?.offsetHeight ?? 0) + 16;
        window.scrollTo({
            top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset),
            behavior: 'smooth',
        });
    }, [activeEra]);
    // Entered in /cms/history. Nothing is bundled — an empty section renders as
    // an empty page rather than as the invented history this page once carried.
    const { historicalEvents, keyFigures, architecturalFeatures, heroStats } = useHistoryStore();

    // Only stats with a value are shown. The membership card is deliberately
    // left blank until someone can supply a real figure.
    const shownStats = (heroStats ?? []).filter(s => s.value?.trim());

    const filteredEvents = activeEra === 'all'
        ? historicalEvents
        : historicalEvents.filter(event => event.era === activeEra);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-cover bg-center text-white pt-20 overflow-hidden" style={{ backgroundImage: "url('/Background.jpeg')" }}>
                <div className="absolute inset-0 bg-gray-900/70" />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2 rounded-full text-sm font-semibold mb-6">
                            OUR HERITAGE
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                            Cathedral History Timeline
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                            Discover the rich heritage of ACK Mombasa Memorial Cathedral — 120+ years of faith, service, and community transformation on the Kenyan coast.
                        </p>
                        {shownStats.length > 0 && (
                            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                                {shownStats.map((stat, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                        <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                        <div className="text-blue-200 text-sm">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Era Filter
                Sticky at every width, below the 72px navbar. What made it
                intolerable on a phone was not the pinning but the height: five
                buttons wrapped to four or five rows and, with the navbar, held
                over 40% of the screen for the whole scroll. As a single row that
                scrolls sideways it costs about 73px, so it can stay put. */}
            <section
                ref={filterBarRef}
                className="py-4 lg:py-8 bg-white border-b border-gray-200 sticky top-[72px] z-30"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-3 overflow-x-auto lg:overflow-visible lg:flex-wrap lg:justify-center [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {ERAS.map((era) => (
                            <button
                                key={era.key}
                                onClick={() => setActiveEra(era.key)}
                                className={`px-5 lg:px-6 py-2.5 rounded-lg font-semibold text-sm lg:text-base whitespace-nowrap flex-shrink-0 transition-all ${
                                    activeEra === era.key
                                        ? 'bg-blue-900 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {era.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section ref={timelineRef} className="py-16 bg-gradient-to-b from-white to-gray-50">
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
                        {filteredEvents.length === 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                                <p className="text-gray-500">
                                    {historicalEvents.length === 0
                                        ? 'The Cathedral timeline is being prepared and will appear here soon.'
                                        : 'No milestones recorded for this era yet.'}
                                </p>
                            </div>
                        )}
                        <div className="space-y-12">
                            {filteredEvents.map((event, index) => (
                                <div
                                    key={index}
                                    // justify-between matters: two w-5/12 columns plus the gap
                                    // span only 10/12 of the row, so left-aligned they sit
                                    // off-centre and the 50% timeline line lands inside a
                                    // column rather than in the gap — where wide photographs
                                    // then cover it. Pushing them to the edges keeps the row
                                    // symmetrical about the line.
                                    className={`relative flex items-center ${
                                        index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                                    } flex-col gap-8 lg:justify-between`}
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

                                    {/* Photograph, opposite the card. This column
                                        was previously an empty spacer — the layout
                                        was already reserving the space. */}
                                    <div className="w-full lg:w-5/12">
                                        {event.photo && (
                                            <figure className={index % 2 === 0 ? 'lg:pl-4' : 'lg:pr-4'}>
                                                {/* Capped by height as well as width: these crops range from
                                                    wide postcards to tall single portraits, and an uncapped
                                                    portrait stretches one timeline row to several screens. */}
                                                <img
                                                    src={event.photo}
                                                    alt={event.photoCaption || event.title}
                                                    loading="lazy"
                                                    className="max-h-80 w-auto max-w-full mx-auto rounded-2xl shadow-lg border border-blue-100 bg-white"
                                                />
                                                {event.photoCaption && (
                                                    <figcaption className="mt-2 text-xs text-gray-500 italic text-center max-w-md mx-auto">
                                                        {event.photoCaption}
                                                    </figcaption>
                                                )}
                                            </figure>
                                        )}
                                    </div>
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

                    {keyFigures.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            Profiles of the leaders who shaped the Cathedral are being prepared.
                        </p>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {keyFigures.map((figure, index) => (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
                                {/* Portrait where one survives; initials otherwise. */}
                                {figure.photo ? (
                                    <img
                                        src={figure.photo}
                                        alt={figure.name}
                                        loading="lazy"
                                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover object-top border-4 border-white shadow-md bg-white"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl text-white font-bold">
                                        {figure.name.split(' ').map(n => n[0]).join('').slice(0, 3)}
                                    </div>
                                )}
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

                    {architecturalFeatures.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            Details of the Cathedral&apos;s architecture are being prepared.
                        </p>
                    )}
                    <div className="grid md:grid-cols-2 gap-8">
                        {architecturalFeatures.map((feature, index) => (
                            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-blue-100 hover:scale-105">
                                <div className="flex items-start gap-4">
                                    {feature.photo ? (
                                        <img
                                            src={feature.photo}
                                            alt={feature.feature}
                                            loading="lazy"
                                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border border-blue-100 bg-white"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-3xl">
                                            {feature.icon}
                                        </div>
                                    )}
                                    <div className="min-w-0">
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
                        Built in 506 working days and dedicated on the Feast of St Michael and All Angels in 1904,
                        mainland East Africa&apos;s first Anglican Cathedral remains what Bishop Peel asked it to be —
                        a house of prayer and an anchor for the Diocese in times of challenge.
                    </p>
                    <p className="text-lg text-blue-200">
                        Our history is not just about the past — it's the foundation for our future. As we embrace digital
                        ministry and innovative outreach, we remain rooted in the timeless mission of sharing Christ's love
                        and transforming our community.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
