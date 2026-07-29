const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');

// Load environment variables from .env.local if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
// Then load from .env (which would override any duplicates)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// Define allowed origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.VITE_PRODUCTION_URL, // Add your production URL here
    'https://study-vault.vercel.app',
    'https://study-vault2.vercel.app',
    'https://www.study-volte.site'
].filter(Boolean); // Filter out undefined values

// Configure CORS with proper origin validation
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(express.json({ limit: '100kb' })); // Limit payload size

// Rate limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to email endpoints
app.use('/api/', apiLimiter);

// Validate email addresses
const validateEmail = (email) => {
    return validator.isEmail(email);
};

// Sanitize HTML content to prevent XSS
const sanitizeHtml = (html) => {
    // Basic sanitization - in production you'd want to use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/g, '');
};

const transporter = nodemailer.createTransport({
    host: process.env.VITE_EMAIL_HOST,
    port: process.env.VITE_EMAIL_PORT,
    secure: process.env.VITE_EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.VITE_EMAIL_USER,
        pass: process.env.VITE_EMAIL_PASS,
    },
});

// Test the email connection
const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('SMTP connection successful');
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error.message);
        return false;
    }
};

// Run the test on startup
testEmailConnection();

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/send-email', async (req, res) => {
    // Log minimal information
    console.log('Received email request');

    try {
        const { to, subject, html } = req.body;

        // Input validation
        if (!to || !subject || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate email
        if (!validateEmail(to)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }

        // Sanitize HTML content
        const sanitizedHtml = sanitizeHtml(html);

        // Send email
        const info = await transporter.sendMail({
            from: process.env.VITE_EMAIL_FROM,
            to,
            subject,
            html: sanitizedHtml,
        });

        console.log('Email sent successfully');
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        console.error('Email send error:', error.message);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Test endpoint to send a test email - only available in development
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/test-email', async (req, res) => {
        const testEmail = req.query.email;

        // Validate email
        if (!testEmail || !validateEmail(testEmail)) {
            return res.status(400).json({ error: 'Valid email address required' });
        }

        try {
            const info = await transporter.sendMail({
                from: process.env.VITE_EMAIL_FROM,
                to: testEmail,
                subject: 'Study Volte Email Test',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Study Volte Email Test</h2>
            <p>This is a test email from Study Volte.</p>
            <p>If you received this email, the email service is working correctly!</p>
            <p>Time sent: ${new Date().toLocaleString()}</p>
          </div>
        `,
            });

            console.log('Test email sent successfully');
            res.json({ success: true, messageId: info.messageId, sentTo: testEmail });
        } catch (error) {
            console.error('Test email error:', error.message);
            res.status(500).json({ error: 'Failed to send test email' });
        }
    });
}

// Import the sitemap routes
const sitemapRoutes = require('./routes/sitemap');

// Import Google Search API routes
const googleSearchRoutes = require('./routes/google-search');

// Add sitemap routes
app.use('/', sitemapRoutes);

// Add Google Search API routes
app.use('/api/google-search', googleSearchRoutes);

// Add a health check for diagnostics
app.get('/api/health-check', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            email: !!process.env.VITE_EMAIL_HOST,
            firebase: !!process.env.VITE_FIREBASE_PROJECT_ID,
            server: true,
            googleSearch: true
        }
    });
});

app.get('/', (req, res) => {
    res.send('Study Volte API Server is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Email service initialized`);
}); 