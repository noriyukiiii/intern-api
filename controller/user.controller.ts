import { Request, Response } from "express";
import { userRepository } from "../repository/user.repository";

class UserController {
  // ฟังก์ชันยืนยันอีเมล
  async verify(req: Request, res: Response) {
    const token = req.query.token as string; // ดึง token จาก query string

    // ตรวจสอบว่า token มาหรือไม่
    if (!token) {
      res.status(400).send("Token is required");
      return;
    }

    try {
      // เรียกใช้ verifyUser จาก UserRepository เพื่อยืนยันอีเมล
      const result = await userRepository.verifyUser(token);

      // ส่งผลลัพธ์กลับไป
      res
        .status(200)
        .redirect(
          "http://localhost:3000/verification/?message=Email%20verified%20successfully"
        );
      return;
    } catch (error: any) {
      // ส่งข้อผิดพลาดกลับไป
      res.status(500).send(error.message);
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
}

export const userController = new UserController();
