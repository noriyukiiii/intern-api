import nodemailer from 'nodemailer';

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetUrl = `https://intern-guide-web.vercel.app/reset-password?token=${token}`;

  const mailOptions = {
    from: `"MyApp" <no-reply@myapp.com>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f4f4f4;">
        <h2 style="color: #4CAF50; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #555;">
          We received a request to reset your password. Click the button below to reset it:
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
             Reset Password
          </a>
        </div>
        <p style="font-size: 16px; color: #555; margin-top: 20px;">
          If you didn't request this, please ignore this email.
        </p>
        <p style="font-size: 16px; color: #555;">
          Thank you,<br/>
          The Computer Technology Team
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
