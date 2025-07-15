import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useMeta } from '../context/MetaContext';
import { useAuth } from '../context/AuthContext';
import { GraduationCap } from 'lucide-react';
import Button from './Button';
import Skeleton from './Skeleton';
import type { UserProfile } from '../context/AuthContext';

interface GoogleProfileCompletionProps {
  user: UserProfile;
  onComplete: () => void;
  onCancel: () => void;
}

const GoogleProfileCompletion: React.FC<GoogleProfileCompletionProps> = ({ 
  user, 
  onComplete,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    college: user.college || '',
    semester: user.semester || '',
    course: user.course || '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { colleges, semesters, courses, loading: metaLoading } = useMeta();
  const { updateUserProfileAfterGoogleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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
    
    try {
      // Update user profile and send welcome email
      await updateUserProfileAfterGoogleSignIn(user, {
        college: formData.college,
        semester: formData.semester,
        course: formData.course,
      });
      
      onComplete();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      // Sign out the user when they cancel profile completion
      await signOut(auth);
      onCancel();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
        <p className="text-gray-600 mb-6">
          Please provide the following information to complete your registration. 
          <span className="font-bold text-red-600 block mt-2">
            Your account will not be created if you cancel or close this window.
          </span>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.college ? 'border-red-300' : 'border-gray-300'
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
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.semester ? 'border-red-300' : 'border-gray-300'
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
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                    errors.course ? 'border-red-300' : 'border-gray-300'
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

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Complete Registration'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleProfileCompletion; 