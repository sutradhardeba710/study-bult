import { Link } from 'react-router-dom';
import { Upload, Search, Download, BookOpen, Users, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandingLoggedIn from './LandingLoggedIn';

const Home = () => {
  const { userProfile, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }
  if (userProfile) {
    return <LandingLoggedIn />;
  }

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Upload your question papers with just a few clicks. Support for PDF format with drag & drop.',
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find papers by college, semester, course, or subject. Advanced filtering options available.',
    },
    {
      icon: Download,
      title: 'Quick Download',
      description: 'Download papers instantly. No registration required for browsing and downloading.',
    },
    {
      icon: BookOpen,
      title: 'Paper Preview',
      description: 'Preview papers before downloading. See content and quality before you commit.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of students sharing and accessing question papers from various colleges.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is safe with us. Secure file storage and privacy protection.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Papers Available' },
    { number: '500+', label: 'Colleges' },
    { number: '50,000+', label: 'Students' },
    { number: '100,000+', label: 'Downloads' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Gateway to
              <span className="block text-primary-200">Academic Success</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Access thousands of question papers from colleges across the country. 
              Upload, search, and download papers to ace your exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Browse Papers
              </Link>
              <Link
                to="/register"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose StudyVault?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to excel in your academic journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-lg transition-shadow duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Academic Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using StudyVault to ace their exams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Create Account
            </Link>
            <Link
              to="/browse"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200"
            >
              Explore Papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 