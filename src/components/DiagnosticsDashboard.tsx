import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw, Bug } from 'lucide-react';
import { runDiagnostics, type DiagnosticResult } from '../utils/diagnostics';

const DiagnosticsDashboard: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runCheck = async () => {
    setLoading(true);
    try {
      const results = await runDiagnostics();
      setDiagnostics(results);
      setLastRun(new Date());
    } catch (error) {
      console.error('Diagnostic check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bug className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const groupedDiagnostics = diagnostics.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  const summary = {
    total: diagnostics.length,
    errors: diagnostics.filter(d => d.status === 'error').length,
    warnings: diagnostics.filter(d => d.status === 'warning').length,
    passing: diagnostics.filter(d => d.status === 'pass').length
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">System Diagnostics</h2>
              <p className="text-gray-600 mt-1">
                Check your application health and troubleshoot issues
              </p>
            </div>
            <button
              onClick={runCheck}
              disabled={loading}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running...' : 'Run Check'}
            </button>
          </div>

          {lastRun && (
            <p className="text-sm text-gray-500 mt-2">
              Last checked: {lastRun.toLocaleString()}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Checks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.passing}</div>
              <div className="text-sm text-gray-600">Passing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.errors}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
          <div className="space-y-6">
            {Object.entries(groupedDiagnostics).map(([category, results]) => (
              <div key={category}>
                <h4 className="text-md font-medium text-gray-900 mb-3">{category}</h4>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(result.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {result.message}
                          </div>
                          {result.fix && (
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Fix:</strong> {result.fix}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Fixes */}
        <div className="p-6 bg-gray-50 rounded-b-lg">
          <h3 className="text-lg font-semibold mb-3">Quick Troubleshooting</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div>• <strong>Content.js errors:</strong> Try disabling browser extensions or use incognito mode</div>
            <div>• <strong>Firebase errors:</strong> Check your .env.local file has correct Firebase configuration</div>
            <div>• <strong>Sitemap issues:</strong> Ensure you've deployed the latest code to Vercel</div>
            <div>• <strong>Console errors:</strong> Open browser DevTools (F12) and check Console tab for details</div>
            <div>• <strong>Network issues:</strong> Check your internet connection and firewall settings</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsDashboard; 