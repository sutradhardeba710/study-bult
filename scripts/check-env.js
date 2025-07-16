/**
 * Environment Variables Checker Script
 * 
 * This script checks if all required environment variables are set.
 * It's useful for CI/CD pipelines and deployment verification.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define required environment variables by category
const requiredVars = {
  firebase: [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ],
  email: [
    'VITE_EMAIL_HOST',
    'VITE_EMAIL_PORT',
    'VITE_EMAIL_USER',
    'VITE_EMAIL_PASS',
    'VITE_EMAIL_FROM'
  ],
  google: [
    'VITE_GOOGLE_ANALYTICS_ID'
  ]
};

// Check if a value appears to be a placeholder
function isPlaceholder(value) {
  if (!value) return true;
  return value.includes('your-') || 
         value.includes('example') || 
         value === 'undefined' || 
         value.length < 3;
}

// Load .env file if it exists
function loadEnvFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      return {};
    }
    
    const envContent = readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.log(`Could not load ${filePath}: ${error.message}`);
    return {};
  }
}

// Check environment variables
function checkEnvironment() {
  // Try to load .env files - prioritize .env.local
  const rootDir = join(__dirname, '..');
  const envLocalPath = join(rootDir, '.env.local');
  
  // Check if .env.local exists
  const hasEnvLocal = existsSync(envLocalPath);
  
  // Load environment variables
  const envVars = {
    ...(hasEnvLocal ? loadEnvFile(envLocalPath) : loadEnvFile(join(rootDir, '.env'))),
    ...process.env
  };
  
  const missing = {};
  const invalid = {};
  let hasIssues = false;
  
  // Check each category
  Object.entries(requiredVars).forEach(([category, vars]) => {
    missing[category] = [];
    invalid[category] = [];
    
    vars.forEach(varName => {
      const value = envVars[varName];
      if (!value) {
        missing[category].push(varName);
        hasIssues = true;
      } else if (isPlaceholder(value)) {
        invalid[category].push(varName);
        hasIssues = true;
      }
    });
  });
  
  // Print results
  console.log('\n=== Environment Variables Check ===\n');
  
  // Print which env file is being used
  if (hasEnvLocal) {
    console.log('✅ Using .env.local for environment variables');
  } else {
    console.log('⚠️ .env.local not found, using .env or process environment');
  }
  
  Object.entries(requiredVars).forEach(([category, vars]) => {
    console.log(`\n${category.toUpperCase()} Configuration:`);
    console.log('-'.repeat(category.length + 14));
    
    if (missing[category].length === 0 && invalid[category].length === 0) {
      console.log('✅ All required variables are set correctly.');
    } else {
      if (missing[category].length > 0) {
        console.log(`❌ Missing variables: ${missing[category].join(', ')}`);
      }
      if (invalid[category].length > 0) {
        console.log(`⚠️  Variables with placeholder values: ${invalid[category].join(', ')}`);
      }
    }
  });
  
  console.log('\n=== Summary ===');
  if (hasIssues) {
    console.log('❌ Some environment variables are missing or invalid.');
    console.log('   Please check your .env.local file or deployment configuration.');
    process.exit(1);
  } else {
    console.log('✅ All environment variables are properly configured.');
  }
}

// Run the check
checkEnvironment(); 