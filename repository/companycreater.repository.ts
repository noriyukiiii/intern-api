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
}

export const companyCreaterRepository = new CompanyCreaterRepository();
