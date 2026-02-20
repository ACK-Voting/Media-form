import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
            <div className="flex min-h-screen items-center justify-center p-4">
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-6">📝</div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            ACK Media Team Registration
                        </h1>
                        <p className="text-xl text-gray-600 mb-2">
                            Mombasa Memorial Cathedral
                        </p>
                        <p className="text-base text-gray-500">
                            Join our media team and help spread the word through creative content and technical excellence.
                        </p>
                    </div>

                    <div className="mt-12 mb-8">
                        <Link href="/register">
                            <Button variant="primary" size="lg" className="w-full text-lg py-4">
                                Apply Now
                            </Button>
                        </Link>
                    </div>

                    <div className="border-t pt-8 mt-8 text-center space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Already a team member?
                            </p>
                            <Link href="/login" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                Member Login →
                            </Link>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Are you an administrator?
                            </p>
                            <Link href="/admin" className="text-gray-500 hover:text-gray-600 text-sm font-medium">
                                Admin Login →
                            </Link>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-gray-400 text-sm">
                        <p>Built with ❤️ for ACK Mombasa Memorial Cathedral Media Team</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
