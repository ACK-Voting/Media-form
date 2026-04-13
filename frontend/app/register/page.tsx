import Link from 'next/link';
import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="relative h-56 md:h-72 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Background.jpeg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/75" />

        {/* Back link */}
        <Link
          href="/"
          className="absolute top-5 left-5 flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <p className="text-white/60 text-xs font-medium tracking-[0.2em] uppercase mb-2">
            ACK Mombasa Memorial Cathedral
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            Media Team <span className="text-yellow-300">Registration</span>
          </h1>
          <p className="text-white/70 text-sm md:text-base mt-2 max-w-lg">
            Fill in the form below to apply as a volunteer with the ACK Media Team
          </p>
        </div>
      </div>

      {/* Form area */}
      <div className="max-w-4xl mx-auto px-4 py-10 pb-16">
        <RegistrationForm />
      </div>
    </div>
  );
}
