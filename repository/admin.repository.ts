import { approvalStatus } from "@prisma/client";
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
      // อัปเดตสถานะของบริษัทเป็น 'approved'
      const company = await db.company.update({
        where: { id: companyId },
        data: { approvalStatus: "approved" },
      });

      // ค้นหาผู้ที่เกี่ยวข้องกับบริษัทนี้ (ผู้ที่สร้างบริษัท)
      const companyCreator = await db.companyCreator.findFirst({
        where: { companyId: companyId },
        select: {
          userId: true, // ดึงแค่ userId จาก companyCreators
        },
      });

      if (!companyCreator) {
        throw new Error("CompanyCreator not found for this company");
      }

      const userId = companyCreator.userId; // ดึง userId จาก companyCreator

      // ค้นหา CompanyAppeal โดยใช้ companyId และ userId
      const companyAppeal = await db.companyAppeal.findFirst({
        where: {
          companyId: companyId,
          userId: userId,
        },
      });

      if (!companyAppeal) {
        throw new Error("CompanyAppeal not found for this company and user");
      }

      // อัปเดตสถานะของ CompanyAppeal เป็น 'approved'
      const approvedCompanyAppeal = await db.companyAppeal.update({
        where: {
          id: companyAppeal.id, // ใช้ id ในการอัปเดต
        },
        data: {
          status: "approved", // เปลี่ยนสถานะการอุทธรณ์เป็น 'approved'
        },
      });

      return approvedCompanyAppeal; // ส่งกลับข้อมูลของ CompanyAppeal ที่ได้รับการอัปเดต
    } catch (error: any) {
      console.error("Error approving company:", error);
      throw new Error("Unable to approve company");
    }
  }

  async rejectCompany(companyId: string) {
    try {
      // ค้นหาข้อมูลก่อนการลบ
      const company = await db.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new Error("Company not found");
      }

      // ค้นหาผู้ที่เกี่ยวข้องกับบริษัทนี้ (ผู้ที่สร้างบริษัท)
      const companyCreator = await db.companyCreator.findFirst({
        where: { companyId: companyId },
        select: {
          userId: true, // ดึงแค่ userId จาก companyCreators
        },
      });

      if (!companyCreator) {
        throw new Error("CompanyCreator not found for this company");
      }

      const userId = companyCreator.userId; // ดึง userId จาก companyCreator

      // ค้นหา CompanyAppeal โดยใช้ companyId และ userId
      const companyAppeal = await db.companyAppeal.findFirst({
        where: {
          companyId: companyId,
          userId: userId,
        },
      });

      if (!companyAppeal) {
        throw new Error("CompanyAppeal not found for this company and user");
      }

      // อัปเดตสถานะของ CompanyAppeal เป็น 'rejected' และเปลี่ยน companyId ให้เป็น null
      const rejectedCompanyAppeal = await db.companyAppeal.update({
        where: {
          id: companyAppeal.id, // ใช้ id ในการอัปเดต
        },
        data: {
          status: "rejected", // เปลี่ยนสถานะการอุทธรณ์เป็น 'rejected'
          companyId: { set: null }, // ทำให้ companyId เป็น null
        },
      });

      // ลบบริษัท
      await db.company.delete({
        where: { id: companyId },
      });
    } catch (error: any) {
      console.error("Error rejecting company:", error);
      throw new Error("Unable to reject company");
    }
  }
}

export default new AdminRepository();
