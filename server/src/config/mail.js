import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter = null;

export const isLiveEmailActive = () => {
  return !!(
    env.GMAIL_USER &&
    env.GMAIL_APP_PASSWORD &&
    !env.GMAIL_USER.includes('your_') &&
    !env.GMAIL_USER.includes('example.com') &&
    !env.GMAIL_APP_PASSWORD.includes('your_') &&
    !env.GMAIL_APP_PASSWORD.includes('demo_') &&
    env.GMAIL_APP_PASSWORD.length >= 16
  );
};

export const getMailTransporter = () => {
  if (!transporter) {
    if (isLiveEmailActive()) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.GMAIL_USER,
          pass: env.GMAIL_APP_PASSWORD,
        },
      });
      console.log(`[Email] Configured Live Gmail SMTP for user: ${env.GMAIL_USER}`);
    } else {
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n================== REAL-TIME OTP DISPATCH ==================');
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Text Preview: ${mailOptions.text || 'HTML Content Sent'}`);
          console.log('============================================================\n');
          return { messageId: `realtime-console-${Date.now()}` };
        },
      };
      console.log('[Email] Running in Local Console Mode. Real-time cryptographic OTPs are printed to the console.');
      console.log('[Email] (To dispatch live emails to real inboxes, set valid GMAIL_USER and GMAIL_APP_PASSWORD in server/.env)');
    }
  }
  return transporter;
};
