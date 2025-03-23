import { db } from "../lib/prisma";

class CompanyCreaterRepository {
  async getCompanyCreater() {
    try {
      const companyCreator = await db.companyCreator.findMany({
        where: {
          company: {
            approvalStatus: "pending",
          },
        },
        include: {
          company: {
            include: {
              positions: {
                include: {
                  position_description: {
                    include: {
                      skills: {
                        include: {
                          tools: true, // ดึงทุกอย่างใน tool
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
            },
          },
        },
      });

      return companyCreator;
    } catch (error: any) {
      console.error("Error retrieving company creators:", error);
      throw new Error("Unable to retrieve company creators");
    }
  }
  async getCompanyCancel() {
    try {
      const CompanyCencel = await db.company_Student_Interned.findMany({
        where: {
          status: "pending",
        },
        include: {
          company: {
            include: {
              positions: {
                include: {
                  position_description: {
                    include: {
                      skills: {
                        include: {
                          tools: true, // ดึงทุกอย่างใน tool
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              studentId: true,
            },
          },
        },
      });
      return CompanyCencel;
    } catch (error: any) {
      console.error("Error retrieving company cancel:", error);
      throw new Error("Unable to retrieve company cancel");
    }
  }
  async ApproveCancelCompany(id: string, compId: string, userId: string) {
    try {
      // ลบ company_Student_Interned ที่ต้องการ
      const companyCancel = await db.company_Student_Interned.delete({
        where: { id },
      });

      // หา companyAppeal ที่ตรงกับ compId และ userId
      const companyAppeal = await db.companyAppeal.findFirst({
        where: {
          companyId: compId,
          userId: userId,
          content : "ยกเลิกการเลือกบริษัท"
        },
        orderBy: {
          createdAt: "desc", // จัดเรียงจากวันที่ล่าสุด
        },
        select: { id: true }, // เอาแค่ id มาใช้
      });

      // ถ้าเจอ companyAppeal ให้ทำการอัปเดต
      if (companyAppeal) {
        await db.companyAppeal.update({
          where: { id: companyAppeal.id },
          data: { status: "approved" },
        });
      } else {
        console.log(
          "No companyAppeal found for the given companyId and userId"
        );
      }

      return;
    } catch (error: any) {
      console.error("Error approving cancel company:", error);
      throw new Error("Unable to approve cancel company");
    }
  }
  async RejectCancelCompany(id: string, compId: string, userId: string) {
    try {
      
      const user = await db.company_Student_Interned.update({
        where: { id },
        data: { status: "approved" },
      });

      // หา companyAppeal ที่ตรงกับ compId และ userId
      const companyAppeal = await db.companyAppeal.findFirst({
        where: {
          companyId: compId,
          userId: userId,
        },
        orderBy: {
          createdAt: "desc", // จัดเรียงจากวันที่ล่าสุด
        },
        select: { id: true }, // เอาแค่ id มาใช้
      });

      // ถ้าเจอ companyAppeal ให้ทำการอัปเดต
      if (companyAppeal) {
        await db.companyAppeal.update({
          where: { id: companyAppeal.id },
          data: { status: "rejected" },
        });
      } else {
        console.log(
          "No companyAppeal found for the given companyId and userId"
        );
      }
    } catch (error: any) {
      console.error("Error rejecting cancel company:", error);
      throw new Error("Unable to reject cancel company");
    }
  }
}

export const companyCreaterRepository = new CompanyCreaterRepository();
