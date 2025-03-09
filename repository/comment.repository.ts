import { db } from "../lib/prisma";

class CommentRepository {
  async getComments(compId: any) {
    const comments = await db.comment.findMany({
      where: {
        companyId: compId, // ค้นหาคอมเมนต์ที่เกี่ยวข้องกับ companyId
      },
      include: {
        user: true, // ดึงข้อมูลของผู้ใช้ที่เชื่อมโยงกับคอมเมนต์นี้ (จากตาราง User)
      },
      orderBy: {
        createdAt: "desc", // เรียงลำดับตามวันที่สร้างล่าสุด
      },
    });
    return comments;
  }
  async createComment(comment: string, userId: string, compId: string) {
    await db.comment.create({
      data: {
        content: comment,
        user: {
          connect: { id: userId }, // เชื่อมกับตาราง User
        },
        company: {
          connect: { id: compId }, // เชื่อมกับตาราง Company
        },
      },
    });
  }
  async deleteComment(commentId: any) {
    await db.comment.delete({
      where: {
        id: commentId,
      },
    });
    return true;
  }
}

export const commentRepository = new CommentRepository();
