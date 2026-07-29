import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, BookOpen, CheckCircle2 } from 'lucide-react';
import Button from '../components/Button';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await resetPassword(email);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Password reset error:', error);

            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address');
            } else if (error.code === 'auth/invalid-email') {
                setError('Invalid email address format');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later');
            } else {
                setError('Failed to send reset email. Please try again');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Study Volte</span>
                    </Link>
                </div>

                {!isSuccess ? (
                    <>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Reset your password
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Enter your email address and we'll send you instructions to reset your password
                        </p>
                    </>
                ) : (
                    <>
                        <div className="mt-6 flex justify-center">
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                        </div>
                        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                            Check your email
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            We've sent password reset instructions to <strong className="text-gray-900">{email}</strong>
                        </p>
                    </>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {!isSuccess ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            setError('');
                                        }}
                                        className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full"
                                    loading={isLoading}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Didn't receive the email?</strong>
                                    <br />
                                    • Check your spam folder
                                    <br />
                                    • Make sure you entered the correct email
                                    <br />
                                    • Wait a few minutes and check again
                                </p>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setIsSuccess(false);
                                    setEmail('');
                                }}
                            >
                                Try a different email
                            </Button>
                        </div>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Remember your password?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
