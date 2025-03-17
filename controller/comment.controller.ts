import { Request, Response } from "express";
import { commentRepository } from "../repository/comment.repository";

class CommentController {
  async getCompanyComments(req: Request, res: Response) {
    try {
      const { compId } = req.query; // เข้าถึงจาก query string
      const comments = await commentRepository.getComments(compId);
      res.json(comments);
      return;
    } catch (error: any) {
      res.json(error.message);
      return;
    }
  }
  async createComment(req: Request, res: Response) {
    try {
      const { comment, userId, compId } = req.body;

      // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
      if (!comment || !userId) {
        res.status(400).json({
          success: false,
          message: "ไม่มีข้อมูลที่จำเป็น",
        });
        return;
      }

      // บันทึกลงฐานข้อมูล
      await commentRepository.createComment(comment, userId, compId);

      res.status(200).json({
        success: true,
        message: "Comment created successfully",
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.body;

      // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
      if (!commentId) {
        res.status(400).json({
          success: false,
          message: "ไม่มีข้อมูลที่จำเป็น",
        });
        return;
      }

      // ลบคอมเมนต์
      await commentRepository.deleteComment(commentId);

      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }
  async updateComment(req: Request, res: Response) {
    try {
      const { commentId, comment } = req.body;

      // ตรวจสอบว่ามีข้อมูลที่จำเป็นหรือไม่
      if (!commentId || !comment) {
        res.status(400).json({
          success: false,
          message: "ไม่มีข้อมูลที่จำเป็น",
        });
        return;
      }

      // อัพเดทคอมเมนต์
      await commentRepository.updateComment(commentId, comment);

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
      });
      return;
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }
  }
}

export const commentController = new CommentController();
