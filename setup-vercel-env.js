// Script to help set up Vercel environment variables
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Function to read .env.local file and extract variables
function readEnvFile(filePath) {
  try {
    const envContent = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    // Split by lines and process each line
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) return;
      
      // Extract key and value
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error(`Error reading .env file: ${error.message}`);
    return {};
  }
}

// Function to set Vercel environment variables
function setVercelEnvVars(envVars) {
  console.log('Setting up Vercel environment variables...');
  
  // Filter for only VITE_ variables
  const viteVars = Object.entries(envVars).filter(([key]) => key.startsWith('VITE_'));
  
  if (viteVars.length === 0) {
    console.log('No VITE_ environment variables found.');
    return;
  }
  
  console.log(`Found ${viteVars.length} VITE_ environment variables to set.`);
  
  // Create commands to set each variable
  viteVars.forEach(([key, value]) => {
    try {
      // Escape quotes in the value
      const escapedValue = value.replace(/"/g, '\\"');
      
      console.log(`Setting ${key}...`);
      execSync(`vercel env add ${key} production`, { 
        stdio: 'inherit',
        shell: true
      });
    } catch (error) {
      console.error(`Error setting ${key}: ${error.message}`);
    }
  });
  
  console.log('Environment variables setup complete.');
  console.log('You may need to redeploy your project for changes to take effect.');
}

// Main execution
const envFilePath = path.join(__dirname, '.env.local');
console.log(`Reading environment variables from ${envFilePath}`);

const envVars = readEnvFile(envFilePath);
const varCount = Object.keys(envVars).length;

if (varCount > 0) {
  console.log(`Found ${varCount} environment variables.`);
  console.log('Make sure you have the Vercel CLI installed and are logged in.');
  console.log('Run "vercel login" if you haven\'t logged in yet.');
  
  // Confirm project linking
  console.log('Make sure you are in your project directory and it\'s linked to Vercel.');
  console.log('Run "vercel link" if needed.');
  
  // Set the variables
  setVercelEnvVars(envVars);
} else {
  console.log('No environment variables found. Make sure .env.local exists and is properly formatted.');
} 