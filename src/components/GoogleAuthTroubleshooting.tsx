import { useState } from 'react';
import Button from './Button';

interface GoogleAuthTroubleshootingProps {
  onClose: () => void;
  error?: string;
}

const GoogleAuthTroubleshooting: React.FC<GoogleAuthTroubleshootingProps> = ({ onClose, error }) => {
  const [showDetails, setShowDetails] = useState(false);
  const hostname = window.location.hostname;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-3">Google Sign-In Failed</h3>
          <p className="text-sm text-gray-500 mt-1">
            {error || "We couldn't complete the Google sign-in process."}
          </p>
        </div>
        
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Possible reasons:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
            <li>The domain <strong>{hostname}</strong> is not authorized in your Google OAuth configuration</li>
            <li>Pop-up was blocked by your browser</li>
            <li>Network connectivity issues</li>
            <li>Google authentication service temporary unavailability</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide Technical Details" : "Show Technical Details"}
          </Button>
          
          {showDetails && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600 font-mono overflow-auto max-h-40">
              <p>Current domain: {window.location.origin}</p>
              <p>Error details: {error || "No specific error details available"}</p>
              <p className="mt-2 font-semibold">For site administrators:</p>
              <p>1. Go to Google Cloud Console</p>
              <p>2. Navigate to APIs &amp; Services &gt; Credentials</p>
              <p>3. Edit your OAuth 2.0 Client ID</p>
              <p>4. Add <strong>{window.location.origin}</strong> to Authorized JavaScript Origins</p>
              <p>5. Add <strong>{window.location.origin}</strong> to Authorized Redirect URIs</p>
              <p>6. Save changes and wait a few minutes for them to take effect</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Use Email Instead
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthTroubleshooting; 