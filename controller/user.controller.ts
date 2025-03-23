import { Request, Response } from "express";
import { userRepository } from "../repository/user.repository";

class UserController {
  // ฟังก์ชันยืนยันอีเมล
  async verify(req: Request, res: Response) {
    const { token } = req.body;

    // ตรวจสอบว่า token มาหรือไม่
    if (!token) {
      res.status(400).json({
        success: false,
        message: "Token is required",
      });
      return;
    }

    try {
      // เรียกใช้ verifyUser จาก UserRepository เพื่อยืนยันอีเมล
      const result = await userRepository.verifyUser(token);

      if (result.success) {
        // ถ้ายืนยันสำเร็จ
        console.log("Email verified successfully, redirecting...");
        res.status(200).json({
          success: true,
          message: "Email verified successfully",
        });
        return;
      } else {
        // หากไม่สามารถยืนยันได้ (เช่น token ไม่ถูกต้อง)
        res.status(400).json({
          success: false,
          message: "Invalid token or token expired",
        });
        return;
      }
    } catch (error: any) {
      // ส่งข้อผิดพลาดกลับไป
      console.error("Error during email verification:", error.message);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
      return;
    }
  }
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).send("ID is required");
        return;
      }
      await userRepository.deleteUser(id);

      res.status(200).send("User deleted successfully");
      return;
    } catch (error: any) {
      res.status(500).send(error.message);
      return;
    }
  }
  async updateUser(req: Request, res: Response) {
    try {
      const data = req.body;
      console.log(data);
      if (!data.id) {
        res.status(400).send("ID is required");
        return;
      }
      await userRepository.updateUser(data);
      res.status(200).send("User updated successfully");
      return;
    } catch (error: any) {
      res.status(500).send(error.message);
      return;
    }
  }
  async editFormOptions(req: Request, res: Response) {
    try {
      const options = await userRepository.editFormOptions();
      res.status(200).json(options);
      return;
    } catch (error: any) {
      res.status(500).send(error.message);
      return;
    }
  }
  async recommand(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) {
        res.status(400).send("userId is required");
        return;
      }
      const result = await userRepository.recommand(userId as string);
      res.status(200).json(result);
      return;
    } catch (error: any) {
      res.status(500).send(error.message);
      return;
    }
  }
}

export const userController = new UserController();
