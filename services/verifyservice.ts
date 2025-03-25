import nodemailer from "nodemailer";

export async function sendVerificationEmail(email: string, token: string, firstname: string, lastname: string) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // ใช้อีเมลที่ใช้ส่ง
      pass: process.env.EMAIL_PASS, // ใช้ App Password
    },
  });

  // const url = `${process.env.NEXT_PUBLIC_BASE_RES_API}`;
  // const verificationUrl = `${url}/user/verify?token=${token}`;
//   const urlmain = `${process.env.NEXT_PUBLIC_BASE_URL}`;
  const verificationUrl = `https://intern-guide-web.vercel.app/verify?token=${token}`;
//   const verificationUrl = `http://localhost:3000/verify?token=${token}`;
// ${firstname} ${lastname}
  const emailTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 12px; background: linear-gradient(to bottom right, #ffffff, #f3f4f6); box-shadow: 4px 4px 10px rgba(0,0,0,0.1);">
    <h2 style="text-align: center; color: #ff6600; font-size: 24px;">👋 Hello,!</h2>
    <p style="font-size: 16px; color: #555; text-align: center;">
      Thank you for registering! If you submitted this request, please click the button below to complete the verification process.
    </p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${verificationUrl}" style="background-color: #ff6600; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 2px 2px 5px rgba(0,0,0,0.2); display: inline-block;">
        ✅ Verify Email
      </a>
    </div>
    <p style="font-size: 16px; color: #555; text-align: center;">
      Sincerely,<br/>
      <strong style="color: #333;">Information Technology, RMUTT</strong>
    </p>
  </div>
`;

  try {
    await transporter.sendMail({
      from: `"No-Reply RMUTT" <no-reply@rmutt.ac.th>`,
      to: email,
      subject: "Verify Your Email - RMUTT",
      html: emailTemplate,
    });
    console.log(`✅ Verification email sent to: ${email}`);
  } catch (error) {
    console.error("❌ Error sending verification email:", error);
  }
}
