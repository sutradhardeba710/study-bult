const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
// Then load from .env (which would override any duplicates)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

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
    console.error('SMTP connection failed:', error);
    return false;
  }
};

// Run the test on startup
testEmailConnection();

app.post('/api/send-email', async (req, res) => {
  console.log('Received email request:', {
    to: req.body.to,
    subject: req.body.subject
  });
  
  const { to, subject, html } = req.body;
  if (!to || !subject || !html) {
    console.error('Missing required fields:', { to, subject, htmlProvided: !!html });
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    console.log('Sending email to:', to);
    const info = await transporter.sendMail({
      from: process.env.VITE_EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Test endpoint to send a test email
app.get('/api/test-email', async (req, res) => {
  const testEmail = req.query.email || process.env.VITE_EMAIL_USER;
  
  try {
    const info = await transporter.sendMail({
      from: process.env.VITE_EMAIL_FROM,
      to: testEmail,
      subject: 'StudyVault Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>StudyVault Email Test</h2>
          <p>This is a test email from StudyVault.</p>
          <p>If you received this email, the email service is working correctly!</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    
    console.log('Test email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId, sentTo: testEmail });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Email API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Email configuration loaded from: ${process.env.VITE_EMAIL_HOST}`);
}); 