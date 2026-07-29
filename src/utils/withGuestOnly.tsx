import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// HOC to prevent logged-in users from accessing auth pages
export function withGuestOnly<P extends object>(Component: React.ComponentType<P>) {
    return (props: P) => {
        const { currentUser } = useAuth();
        const navigate = useNavigate();

        useEffect(() => {
            if (currentUser) {
                navigate('/dashboard', { replace: true });
            }
        }, [currentUser, navigate]);

        // Don't render the component if user is logged in
        if (currentUser) {
            return null;
        }

        return <Component {...props} />;
    };
}
