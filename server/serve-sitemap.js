const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Special route for sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  
  // Check if the file exists
  if (fs.existsSync(sitemapPath)) {
    // Set the content type
    res.setHeader('Content-Type', 'application/xml');
    
    // Send the file
    res.sendFile(sitemapPath);
  } else {
    res.status(404).send('Sitemap not found');
  }
});

// Special route for robots.txt
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, '../public/robots.txt');
  
  // Check if the file exists
  if (fs.existsSync(robotsPath)) {
    // Set the content type
    res.setHeader('Content-Type', 'text/plain');
    
    // Send the file
    res.sendFile(robotsPath);
  } else {
    res.status(404).send('Robots.txt not found');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Sitemap available at http://localhost:${PORT}/sitemap.xml`);
  console.log(`Robots.txt available at http://localhost:${PORT}/robots.txt`);
}); 