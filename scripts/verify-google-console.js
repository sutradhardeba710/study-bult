#!/usr/bin/env node

/**
 * Google Search Console Verification Script
 * 
 * This script helps verify that your website is properly set up for Google Search Console.
 * It checks for the verification file, meta tag, sitemap, and robots.txt.
 */

console.log('='.repeat(60));
console.log('StudyVault - Google Search Console Verification Tool');
console.log('='.repeat(60));
console.log('\nThis script will check if your website is properly set up for Google Search Console.');
console.log('\nRunning verification checks...\n');

// Import the verification script
require('./check-google-verification.js');

// The imported script will handle all the verification checks and output the results 