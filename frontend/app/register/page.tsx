import Link from 'next/link';
import RegistrationForm from '@/components/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Media Team Registration
          </h1>
          <p className="text-xl text-gray-600">
            ACK Mombasa Memorial Cathedral
          </p>
          <Link href="/" className="inline-block mt-4 text-purple-600 hover:text-purple-700">
            ← Back to Home
          </Link>
        </div>

        <RegistrationForm />
      </div>
    </div>
  );
}
