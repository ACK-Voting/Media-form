import type { Metadata } from 'next';

// Deliberately self-contained: no CMS stores, no API calls, no client JavaScript.
// A holding page has to render even when the thing being worked on is broken.
export const metadata: Metadata = {
  title: 'ACK Mombasa Memorial Cathedral — Coming Soon',
  description:
    'The new website for ACK Mombasa Memorial Cathedral is on its way. Service times and contact details below.',
  // Keep the holding page out of search results, so the real site indexes
  // cleanly once it launches.
  robots: { index: false, follow: false },
};

const SERVICES = [
  { time: '7:00 AM', name: 'English Service' },
  { time: '9:00 AM', name: 'Swahili Service' },
  { time: '11:00 AM', name: 'Main Service' },
  { time: '6:00 PM', name: 'Evensong' },
];

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-indigo-950 text-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-xl text-center">
        <img
          src="/logo_1.jpeg"
          alt="ACK Mombasa Memorial Cathedral"
          className="w-20 h-20 rounded-full object-cover mx-auto shadow-xl ring-2 ring-white/20"
        />

        <h1 className="mt-7 text-2xl sm:text-3xl font-bold leading-snug">
          ACK Mombasa Memorial Cathedral
        </h1>
        <p className="mt-1.5 text-sm text-blue-200/80 tracking-wide">Anglican Church of Kenya</p>

        <div className="mt-9 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm px-6 py-7">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.15em]">
            Our new website is coming soon
          </p>
          <p className="mt-3.5 text-blue-100/90 leading-relaxed">
            We are putting the finishing touches to a new home for the Cathedral online.
            In the meantime, our doors are open and you are most welcome to worship with us.
          </p>
        </div>

        <div className="mt-8 text-left">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-blue-300/70 mb-3 text-center">
            Sunday Services
          </h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {SERVICES.map((s) => (
              <li
                key={s.time}
                className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 flex items-baseline justify-between gap-3"
              >
                <span className="text-sm text-blue-100">{s.name}</span>
                <span className="text-sm font-semibold text-amber-400 whitespace-nowrap">{s.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:+254724906951"
            className="rounded-xl bg-white text-blue-950 px-5 py-3 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Call the Cathedral Office
          </a>
          <a
            href="mailto:info@ackmombasa.org"
            className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Email Us
          </a>
        </div>

        <p className="mt-10 text-xs text-blue-300/50">
          &copy; {new Date().getFullYear()} ACK Mombasa Memorial Cathedral
        </p>
      </div>
    </main>
  );
}
