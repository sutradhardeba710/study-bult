import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, User, Upload, ArrowRight } from 'lucide-react';
import Button from './Button';

interface GuestUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinueAsGuest: (guestInfo: { name: string; email: string }) => void;
    onCreateAccount: () => void;
}

const GuestUploadModal = ({ isOpen, onClose, onContinueAsGuest, onCreateAccount }: GuestUploadModalProps) => {
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    if (!isOpen) return null;

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleContinue = () => {
        const newErrors: { name?: string; email?: string } = {};

        // Validate name
        if (!guestName.trim()) {
            newErrors.name = 'Name is required';
        } else if (guestName.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Validate email
        if (!guestEmail.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(guestEmail)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);

        // If no errors and agreed to terms, continue
        if (Object.keys(newErrors).length === 0 && agreedToTerms) {
            onContinueAsGuest({
                name: guestName.trim(),
                email: guestEmail.toLowerCase().trim(),
            });
        } else if (!agreedToTerms) {
            setErrors({ ...newErrors, name: newErrors.name || 'Please agree to the terms to continue' });
        }
    };

    const handleClose = () => {
        setGuestName('');
        setGuestEmail('');
        setErrors({});
        setAgreedToTerms(false);
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh] transform transition-all animate-fade-in">
                {/* Gradient Header */}
                <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-4 sm:px-6 py-6 sm:py-8 text-white overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white opacity-10 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white opacity-10 rounded-full -ml-8 -mb-8 sm:-ml-12 sm:-mb-12"></div>

                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-all z-20"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 backdrop-blur-sm">
                            <Upload className="w-5 h-5 sm:w-7 sm:h-7" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Upload as Guest</h2>
                        <p className="text-primary-100 text-xs sm:text-sm leading-relaxed">
                            Share your semester papers with students everywhere
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Your Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="guestName"
                                    value={guestName}
                                    onChange={(e) => {
                                        setGuestName(e.target.value);
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div>
                            <label htmlFor="guestEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    id="guestEmail"
                                    value={guestEmail}
                                    onChange={(e) => {
                                        setGuestEmail(e.target.value);
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="your.email@gmail.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                            <p className="text-xs text-primary-900 leading-relaxed">
                                <span className="font-semibold">📧 Why do we need this?</span>
                                <br />
                                We'll notify you when your paper is approved and published. Your email won't be shared publicly.
                            </p>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600 cursor-pointer">
                                I agree to share my paper with the student community and accept the{' '}
                                <a href="/terms" target="_blank" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Terms of Service
                                </a>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 sm:mt-6 space-y-2 sm:space-y-3">
                        <Button
                            type="button"
                            onClick={handleContinue}
                            variant="primary"
                            className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300 group"
                        >
                            <span>Continue as Guest</span>
                            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <Button
                            type="button"
                            onClick={onCreateAccount}
                            variant="outline"
                            className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-medium border-2 hover:bg-gray-50 transition-all"
                        >
                            Create Free Account Instead
                        </Button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default GuestUploadModal;
