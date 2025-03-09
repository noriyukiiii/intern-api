import { Request, Response } from "express";
import { authRepository } from "../repository/auth.repository";
import { sendResetPasswordEmail } from "../services/emailService";
import { generateResetToken } from "../utils/tokenUtils";

class AuthController {
  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    try {
      const user = await authRepository.findUserByEmail(email);
      if (!user) {
        res
          .status(400)
          .json({ success: false, message: "ไม่มีอีเมลนี้ในระบบ" });
        return;
      }

      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 ชั่วโมง

      await authRepository.updateUserResetToken(
        user.id,
        resetToken,
        resetTokenExpires
      );

      await sendResetPasswordEmail(user.email, resetToken);

      res.status(200).json({
        success: true,
        message: "ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว",
      });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }
  }
  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    console.log(token, newPassword);
    try {
      const user = await authRepository.findUserByResetToken(token);
      if (!user) {
        res
          .status(400)
          .json({ success: false, message: "Token ไม่ถูกต้องหรือหมดอายุ" });
        return;
      }

      const hashedPassword = await authRepository.hashPassword(newPassword);

      await authRepository.updateUserPassword(user.id, hashedPassword);

      res
        .status(200)
        .json({ success: true, message: "รหัสผ่านได้ถูกเปลี่ยนเรียบร้อยแล้ว" });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }
  }
}

export const authController = new AuthController();
