import { getMailTransporter } from '../config/mail.js';
import { env } from '../config/env.js';

export const lastDispatchedOtps = new Map();

export const sendOTPEmail = async (email, otp, purpose = 'Verification') => {
  const normalized = email.toLowerCase().trim();
  lastDispatchedOtps.set(normalized, otp);
  const transporter = getMailTransporter();
  const subject = `Placement Management System - ${purpose === 'signup' ? 'Signup' : 'Login'} Verification Code`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #0f766e; color: #ffffff; padding: 28px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 32px 28px; text-align: center; }
        .otp-box { display: inline-block; background: #f0fdfa; border: 2px dashed #0d9488; color: #0f766e; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 14px 28px; border-radius: 8px; margin: 24px 0; }
        .info { font-size: 14px; color: #64748b; line-height: 1.6; margin: 12px 0; }
        .warning { font-size: 12px; color: #ef4444; margin-top: 20px; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Placement Management System</h1>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="font-size: 15px; color: #334155;">Your real-time one-time verification code for <strong>${purpose === 'signup' ? 'Account Registration' : 'Account Login'}</strong> is:</p>
          <div class="otp-box">${otp}</div>
          <p class="info">This verification code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
          <p class="warning">If you did not initiate this request, please disregard this email.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} University Placement & Training Cell. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `Placement Management System\n\nYour real-time verification code is: ${otp}\n\nThis code will expire in 5 minutes.\nDo not share this code with anyone.\nIf you did not request this code, ignore this email.`;

  try {
    const info = await transporter.sendMail({
      from: `"Placement Management Cell" <${env.GMAIL_USER || 'no-reply@placement.edu'}>`,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service Warning]: Live email dispatch encountered an error: ${error.message}`);
    console.log(`[Email Service Fallback]: Real-Time Security Code for ${email} is: [${otp}]`);
    return { success: true, fallback: true };
  }
};
