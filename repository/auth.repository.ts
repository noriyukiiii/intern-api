import { db } from "../lib/prisma";
import { hashSync } from "bcryptjs";

class AuthRepository {
  async findUserByEmail(email: string) {
    if (!email) {
      throw new Error("Email is required");
    }

    return db.user.findUnique({
      where: {
        email: email, // ต้องให้แน่ใจว่า email ไม่ใช่ undefined
      },
    });
  }

  async findUserByResetToken(resetPasswordToken: string) {
    if (!resetPasswordToken) {
      throw new Error("Token is required");
    }

    return db.user.findFirst({
      where: {
        resetPasswordToken: resetPasswordToken, // ใช้ resetPasswordToken ใน where
      },
    });
  }

  async updateUserResetToken(
    userId: string,
    resetToken: string,
    resetTokenExpires: Date
  ) {
    return db.user.update({
      where: { id: userId },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      },
    });
  }

  async updateUserPassword(userId: string, password: string) {
    return db.user.update({
      where: { id: userId },
      data: {
        password,
        resetPasswordToken: null, // ลบ Token หลังจากใช้งาน
        resetPasswordExpires: null, // ลบวันหมดอายุ
      },
    });
  }

  async hashPassword(password: string) {
    return hashSync(password, 10);
  }
}

export const authRepository = new AuthRepository();
