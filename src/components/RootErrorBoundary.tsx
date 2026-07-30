import { useRouteError } from 'react-router-dom';

export default function RootErrorBoundary() {
    const error = useRouteError() as Error | any;

    // Check if it's a chunk loading error or a Vite dev server HTML/JSON parse error
    const isChunkError = 
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('is not valid JSON') ||
        error?.message?.includes('Unexpected token \'<\'');

    if (isChunkError) {
        // This means the user is on an old version of the site and tried to load a new chunk,
        // or the dev server restarted. A hard reload will fetch the fresh assets.
        window.location.reload();
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong.</h1>
                <p className="text-gray-600 mb-6">
                    {error?.message || "An unexpected error occurred while loading this page."}
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    Go back Home
                </button>
            </div>
        </div>
    );
}
