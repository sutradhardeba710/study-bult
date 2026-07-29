/**
 * Utility to verify Firebase configuration
 * Can be used to debug configuration issues in production
 */

interface ConfigStatus {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: string[];
  message: string;
  envSource: 'env.local' | 'process' | 'unknown';
}

export const verifyFirebaseConfig = (): ConfigStatus => {
  // Required Firebase environment variables
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  const missingVariables: string[] = [];
  const invalidVariables: string[] = [];
  
  // Check for missing variables
  requiredVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      missingVariables.push(varName);
    } else if (
      typeof value === 'string' && 
      (value.includes('your-') || value.length < 5)
    ) {
      invalidVariables.push(varName);
    }
  });
  
  const isValid = missingVariables.length === 0 && invalidVariables.length === 0;
  
  // Determine environment source
  // In Vite, import.meta.env.MODE will be 'development' in dev and 'production' in prod
  const envSource = import.meta.env.VITE_ENV_SOURCE || 'unknown';
  
  let message = isValid 
    ? `Firebase configuration is valid (source: ${envSource}).` 
    : 'Firebase configuration issues detected:';
    
  if (missingVariables.length > 0) {
    message += `\n- Missing variables: ${missingVariables.join(', ')}`;
  }
  
  if (invalidVariables.length > 0) {
    message += `\n- Invalid variables: ${invalidVariables.join(', ')}`;
  }
  
  if (!isValid) {
    message += '\n\nPlease check your .env.local file or deployment configuration.';
  }
  
  return {
    isValid,
    missingVariables,
    invalidVariables,
    message,
    envSource: envSource as 'env.local' | 'process' | 'unknown'
  };
};

export const createConfigDebugElement = () => {
  const status = verifyFirebaseConfig();
  
  // Only in development or if explicitly enabled
  if (import.meta.env.DEV || import.meta.env.VITE_SHOW_CONFIG_DEBUG === 'true') {
    const debugDiv = document.createElement('div');
    debugDiv.style.position = 'fixed';
    debugDiv.style.bottom = '10px';
    debugDiv.style.right = '10px';
    debugDiv.style.padding = '10px';
    debugDiv.style.backgroundColor = status.isValid ? '#d4edda' : '#f8d7da';
    debugDiv.style.border = `1px solid ${status.isValid ? '#c3e6cb' : '#f5c6cb'}`;
    debugDiv.style.borderRadius = '4px';
    debugDiv.style.color = status.isValid ? '#155724' : '#721c24';
    debugDiv.style.zIndex = '9999';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.maxWidth = '300px';
    
    const title = document.createElement('div');
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '5px';
    title.textContent = 'Firebase Config Status';
    
    const content = document.createElement('div');
    content.style.whiteSpace = 'pre-wrap';
    content.textContent = status.message;
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '3px 8px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '3px';
    closeButton.style.backgroundColor = '#6c757d';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.onclick = () => debugDiv.remove();
    
    debugDiv.appendChild(title);
    debugDiv.appendChild(content);
    debugDiv.appendChild(closeButton);
    
    document.body.appendChild(debugDiv);
  }
  
  return status;
}; 