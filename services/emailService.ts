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

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: linear-gradient(to bottom right, #ffffff, #f3f4f6); box-shadow: 4px 4px 10px rgba(0,0,0,0.1);">
      <h2 style="text-align: center; color: #4CAF50; font-size: 24px;">🔒 Reset Your Password</h2>
      <p style="font-size: 16px; color: #555; text-align: center;">
        We received a request to reset your password. If you made this request, click the button below to reset it.
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); display: inline-block;">
          🔑 Reset Password
        </a>
      </div>
      <p style="font-size: 16px; color: #555; text-align: center;">
        If you didn't request this, please ignore this email.
      </p>
      <p style="font-size: 16px; color: #555; text-align: center;">
        Sincerely,<br/>
        <strong style="color: #333;">Information Technology, RMUTT</strong>
      </p>
    </div>
  `;

  const mailOptions = {
    from: `"No-Reply RMUTT" <no-reply@rmutt.ac.th>`,
    to: email,
    subject: 'Reset Your Password - RMUTT',
    html: emailTemplate,
  };

  await transporter.sendMail(mailOptions);
};
