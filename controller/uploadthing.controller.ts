import { Request, Response } from "express";
import { fileRepository } from "../repository/uploadthing.repository";

class FileController {
  async deleteFile(req: Request, res: Response) {
    try {
      const fileId = req.params.id; // รับ ID ไฟล์จาก URL
      await fileRepository.deleteFile(fileId);
      res
        .status(200)
        .json({ success: true, message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete file" });
    }
  }
}

export const filecontroller = new FileController();
