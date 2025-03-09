import { db } from "../lib/prisma";

class UserRepository {
  async verifyUser(token: string) {
    try {
      // ค้นหาผู้ใช้ที่มี verificationToken ตรงกับที่ส่งมา
      const user = await db.user.findUnique({
        where: {
          verificationToken: token,
        },
      });

      // หากไม่พบผู้ใช้ที่มี token นี้
      if (!user) {
        throw new Error("Token not found");
      }

      // อัพเดตสถานะการยืนยันอีเมลและลบ verificationToken
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true, // ตั้งค่า emailVerified เป็น true
          verificationToken: null, // ลบ token ออก
        },
      });

      return { success: true, message: "Email verified successfully" };
    } catch (error: any) {
      throw new Error("Error verifying user: " + error.message);
    }
  }
  async deleteUser(id: string) {
    try {
      if (!id) {
        throw new Error("ID is required");
      }
      await db.user.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error("Error deleting user: " + error.message);
    }
  }
  async updateUser(data : any) {
    try {
      if (!data.id) {
        throw new Error("ID is required");
      }
      await db.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          studentId : data.studentId,
          phone: data.phone,
          role: data.role,
        },
      });
    } catch (error: any) {
      throw new Error("Error updating user: " + error.message);
    }
  }
}

export const userRepository = new UserRepository();
