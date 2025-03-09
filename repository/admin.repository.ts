import { db } from "../lib/prisma";

class AdminRepository {
  async getDashboardStats() {
    // ดึงข้อมูลสถิติทั้งหมด
    const positionCountByType = await db.positions.groupBy({
      by: ["name"], // แยกนับตามชื่อประเภทตำแหน่ง
      _count: {
        name: true, // นับจำนวนตำแหน่งในแต่ละประเภท
      },
    });

    // แปลงข้อมูลจากกลุ่มเป็นรูปแบบที่ต้องการ
    const formattedPositionCountByType: Record<string, number> =
      positionCountByType.reduce((acc, { name, _count }) => {
        acc[name] = _count.name; // เก็บจำนวนในแต่ละประเภท
        return acc;
      }, {} as Record<string, number>); // กำหนดประเภทให้กับตัวแปร acc

    return {
      // จำนวนผู้ใช้ทั้งหมด (Admin, Member)
      totalUsers: await db.user.count(),

      // จำนวนบริษัททั้งหมด (รวม MOU และ Non-MOU)
      totalCompanies: {
        company: await db.company.count({
          where: { approvalStatus: "approved" },
        }),

        mou: await db.company.count({
          where: { isMou: true },
        }),

        nonMou: await db.company.count({
          where: { isMou: false },
        }),
      },

      // จำนวนบริษัทที่รอการอนุมัติ
      pendingCompanies: await db.company.count({
        where: { approvalStatus: "pending" },
      }),

      // จำนวนตำแหน่งตามประเภท
      positionCountByType: formattedPositionCountByType,

      // จำนวนตำแหน่งฝึกงานที่มีอยู่
      totalPositions: await db.positions.count(),

      interning: await db.user.count({
        where: { status: "Interning" },
      }),

      // จำนวนผู้ที่ฝึกงานสำเร็จ
      successfulInterns: await db.company_Student_Interned.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), 0, 1), // 1 ม.ค. ของปีนี้
            lt: new Date(new Date().getFullYear() + 1, 0, 1), // 1 ม.ค. ของปีถัดไป
          },
        },
      }),
    };
  }

  async approveCompany(companyId: string) {
    try {
      const company = await db.company.update({
        where: { id: companyId },
        data: { approvalStatus: "approved" },
      });
    } catch (error: any) {
      console.error("Error approving company:", error);
      throw new Error("Unable to approve company");
    }
  }
  async rejectCompany(companyId: string) {
    try {
      const company = await db.company.delete({
        where: { id: companyId },
      });
    } catch (error: any) {
      console.error("Error rejecting company:", error);
      throw new Error("Unable to reject company");
    }
  }
}

export default new AdminRepository();
