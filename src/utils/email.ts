import nodemailer from 'nodemailer';

const { GMAIL_USER, GMAIL_PASS } = process.env;

if (!GMAIL_USER || !GMAIL_PASS) {
  throw new Error('GMAIL_USER and GMAIL_PASS must be set in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  const mailOptions = {
    from: GMAIL_USER,
    ...options,
  };
  return transporter.sendMail(mailOptions);
} 