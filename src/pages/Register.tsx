import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeta } from '../context/MetaContext';
import { Eye, EyeOff, Mail, Lock, User, BookOpen, GraduationCap } from 'lucide-react';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import GoogleProfileCompletion from '../components/GoogleProfileCompletion';
import type { UserProfile } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        college: '',
        semester: '',
        course: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [authError, setAuthError] = useState('');
    const [showProfileCompletion, setShowProfileCompletion] = useState(false);
    const [googleUserProfile, setGoogleUserProfile] = useState<UserProfile | null>(null);

    const { register, loginWithGoogle, checkGoogleRedirect } = useAuth();
    const navigate = useNavigate();
    const { colleges, semesters, courses, loading: metaLoading } = useMeta();

    // Check for Google redirect result on component mount
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await checkGoogleRedirect();
                if (result) {
                    if (!result.isProfileComplete) {
                        setGoogleUserProfile(result.profile);
                        setShowProfileCompletion(true);
                    } else {
                        navigate('/dashboard');
                    }
                }
            } catch (error) {
                console.error('Error handling redirect result:', error);
                setAuthError('Failed to sign in with Google. Please try again.');
            }
        };

        handleRedirectResult();
    }, [checkGoogleRedirect, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        if (authError) {
            setAuthError('');
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        } else if (formData.fullName.trim().length < 2) {
            newErrors.fullName = 'Full name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.college) {
            newErrors.college = 'Please select your college';
        }

        if (!formData.semester) {
            newErrors.semester = 'Please select your semester';
        }

        if (!formData.course) {
            newErrors.course = 'Please select your course';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setAuthError('');

        try {
            console.log('Starting registration process...');
            const profile = {
                name: formData.fullName,
                email: formData.email,
                college: formData.college,
                semester: formData.semester,
                course: formData.course,
                role: 'student' as const
            };

            await register(formData.email, formData.password, profile);
            console.log('Registration successful, welcome email should be sent');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                setAuthError('An account with this email already exists');
            } else if (error.code === 'auth/invalid-email') {
                setAuthError('Invalid email address');
            } else if (error.code === 'auth/weak-password') {
                setAuthError('Password is too weak. Please choose a stronger password');
            } else {
                setAuthError('Failed to create account. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setAuthError('');

        try {
            const result = await loginWithGoogle();
            if (!result.isProfileComplete) {
                setGoogleUserProfile(result.profile);
                setShowProfileCompletion(true);
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error('Google login error:', error);
            setAuthError('Failed to sign in with Google. Please try again.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleProfileCompletionCancel = () => {
        setShowProfileCompletion(false);
        setGoogleUserProfile(null);
        // The user will be signed out in the GoogleProfileCompletion component
    };

    const handleProfileCompletionSuccess = () => {
        setShowProfileCompletion(false);
        setGoogleUserProfile(null);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {showProfileCompletion && googleUserProfile && (
                <GoogleProfileCompletion
                    user={googleUserProfile}
                    onComplete={handleProfileCompletionSuccess}
                    onCancel={handleProfileCompletionCancel}
                />
            )}

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Study Volte</span>
                    </Link>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{' '}
                    <Link
                        to="/login"
                        className="font-medium text-primary-600 hover:text-primary-500"
                    >
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {authError && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-sm text-red-600">{authError}</p>
                        </div>
                    )}

                    {/* Google Sign In Button */}
                    <div className="mb-6">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                            onClick={handleGoogleSignIn}
                            loading={isGoogleLoading}
                            disabled={isLoading || isGoogleLoading}
                        >
                            <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.79-1.677-4.184-2.702-6.735-2.702-5.522 0-10 4.478-10 10s4.478 10 10 10c8.396 0 10.249-7.85 9.449-11.666l-9.449 0z" />
                            </svg>
                            <span className="ml-2">Sign up with Google</span>
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                        </div>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.fullName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.fullName && (
                                <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                            )}
                        </div>

                        {/* Email */}
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
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        variant="outline"
                                        className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    autoComplete="new-password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`appearance-none block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Confirm your password"
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <Button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        variant="outline"
                                        className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* College */}
                        <div>
                            <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                                College
                            </label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <GraduationCap className="h-5 w-5 text-gray-400" />
                                </div>
                                {metaLoading ? (
                                    <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
                                ) : (
                                    <select
                                        id="college"
                                        name="college"
                                        value={formData.college}
                                        onChange={handleChange}
                                        className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.college ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select your college</option>
                                        {colleges.length === 0 ? (
                                            <option value="">No colleges found</option>
                                        ) : (
                                            colleges.map((college) => (
                                                <option key={college.id} value={college.name}>{college.name}</option>
                                            ))
                                        )}
                                    </select>
                                )}
                            </div>
                            {errors.college && (
                                <p className="mt-2 text-sm text-red-600">{errors.college}</p>
                            )}
                        </div>

                        {/* Semester and Course */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
                                    Semester
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GraduationCap className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {metaLoading ? (
                                        <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
                                    ) : (
                                        <select
                                            id="semester"
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.semester ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select semester</option>
                                            {semesters.length === 0 ? (
                                                <option value="">No semesters found</option>
                                            ) : (
                                                semesters.map((semester) => (
                                                    <option key={semester.id} value={semester.name}>{semester.name}</option>
                                                ))
                                            )}
                                        </select>
                                    )}
                                </div>
                                {errors.semester && (
                                    <p className="mt-2 text-sm text-red-600">{errors.semester}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                                    Course
                                </label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GraduationCap className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {metaLoading ? (
                                        <Skeleton variant="rect" width="100%" height={40} className="mb-2" />
                                    ) : (
                                        <select
                                            id="course"
                                            name="course"
                                            value={formData.course}
                                            onChange={handleChange}
                                            className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${errors.course ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select course</option>
                                            {courses.length === 0 ? (
                                                <option value="">No courses found</option>
                                            ) : (
                                                courses.map((course) => (
                                                    <option key={course.id} value={course.name}>{course.name}</option>
                                                ))
                                            )}
                                        </select>
                                    )}
                                </div>
                                {errors.course && (
                                    <p className="mt-2 text-sm text-red-600">{errors.course}</p>
                                )}
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
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 