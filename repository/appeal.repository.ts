import { db } from "../lib/prisma";

class AppealRepository {
  async findAppealById(id: string) {
    return await db.companyAppeal.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc", // เรียงจากใหม่ → เก่า
      },
    });
  }
}

export const appealRepository = new AppealRepository();