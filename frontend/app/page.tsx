import Link from 'next/link';

export default function Home() {
    return (
        <div className="relative min-h-screen flex flex-col">
            {/* Background image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/Background.jpeg')" }}
            />
            {/* Gradient overlay — dark at bottom, lighter at top */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />

            {/* Content */}
            <div className="relative flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11 2a1 1 0 012 0v2h2a1 1 0 010 2h-2v2a1 1 0 01-2 0V6H9a1 1 0 010-2h2V2z"/>
                                <path fillRule="evenodd" d="M4 10a1 1 0 011-1h14a1 1 0 011 1v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10zm2 1v9h12v-9H6z" clipRule="evenodd"/>
                            </svg>
                        </div>
                        <span className="text-white/90 text-sm font-medium tracking-wide">ACK Mombasa</span>
                    </div>
                    <Link
                        href="/login"
                        className="text-white/80 hover:text-white text-sm font-medium transition-colors border border-white/30 hover:border-white/60 rounded-full px-4 py-1.5 backdrop-blur-sm"
                    >
                        Member Login
                    </Link>
                </header>

                {/* Hero */}
                <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
                    {/* Cross icon */}
                    <div className="mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center mx-auto shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2v20M2 12h20" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-white/70 text-sm font-medium tracking-[0.2em] uppercase mb-3">
                        ACK Mombasa Memorial Cathedral
                    </p>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                        Media Team
                        <br />
                        <span className="text-yellow-300">Registration</span>
                    </h1>

                    <p className="text-white/75 text-lg md:text-xl max-w-xl mb-12 leading-relaxed">
                        Join our media team and help spread the Gospel through creative content, photography, and technical excellence.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-base px-8 py-4 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 hover:shadow-yellow-400/30"
                        >
                            Apply to Join
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-white/85 hover:text-white text-base font-medium transition-colors"
                        >
                            Already a member? Sign in
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                </main>

                {/* Footer */}
                <footer className="relative px-6 py-6 text-center">
                    <p className="text-white/40 text-xs tracking-wide">
                        &quot;Each of you should use whatever gift you have received to serve others.&quot; — 1 Peter 4:10
                    </p>
                </footer>
            </div>
        </div>
    );
}
