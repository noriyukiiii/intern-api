import { db } from "../lib/prisma";

class CompanyRepository {
  async getCompany() {
    try {
      // ดึงข้อมูลบริษัทที่ยังไม่ถูกลบ (เช่น is_deleted: false) พร้อมข้อมูลที่เกี่ยวข้อง
      const companies = await db.company.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          positions: {
            include: {
              position_description: {
                include: {
                  skills: {
                    include: {
                      tools: true, // รวมข้อมูล tools
                    },
                  },
                },
              },
            },
          },
        },
      });
      return companies;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getCompanyDetail(companyId: string) {
    try {
      const company = await db.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          positions: {
            include: {
              position_description: {
                include: {
                  skills: {
                    include: {
                      tools: true, // ดึงข้อมูล tools ด้วย
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!company) {
        return "company not found"; // กรณีไม่เจอข้อมูลบริษัท
      }

      // จัดรูปแบบข้อมูล
      const positionNames = Array.from(
        new Set(company.positions.map((position) => position.name))
      ).join(", ");

      const positionDescriptions = Array.from(
        new Set(
          company.positions.flatMap((position) =>
            position.position_description.map((desc) => desc.description)
          )
        )
      ).join(", ");

      const skillNames = Array.from(
        new Set(
          company.positions.flatMap((position) =>
            position.position_description.flatMap((desc) =>
              desc.skills.map((skill) => skill.name)
            )
          )
        )
      ).join(", ");

      const toolsNames = Array.from(
        new Set(
          company.positions.flatMap((position) =>
            position.position_description.flatMap((desc) =>
              desc.skills.flatMap((skill) =>
                skill.tools.map((tool) => tool.name)
              )
            )
          )
        )
      ).join(", ");

      // ส่งข้อมูลกลับในรูปแบบที่จัดไว้
      return {
        company_id: company.id,
        company_name_th: company.companyNameTh,
        company_name_en: company.companyNameEn,
        company_description: company.description,
        company_location: company.location,
        company_province: company.province,
        company_website: company.website,
        company_benefit: company.benefit,
        company_logo: company.imgLink,
        contract_name: company.contractName,
        contract_email: company.contractEmail,
        contract_tel: company.contractTel,
        contract_social: company.contractSocial,
        contract_line: company.contractSocial_line,
        position_names: positionNames,
        position_descriptions: positionDescriptions,
        skill_names: skillNames,
        tools_names: toolsNames,
      };
    } catch (error) {
      console.error("Error fetching company details:", error);
      return null;
    }
  }
  async getChartData({
    occupation,
    position,
    province,
    benefit,
    userId, // สมมุติว่าเราได้รับ userId มาด้วย
  }: {
    occupation?: string;
    position?: string;
    province?: string;
    benefit?: string;
    userId?: string;
  }) {
    try {
      // ดึงข้อมูลบริษัทที่ตรงกับเงื่อนไข
      const companies = await db.company.findMany({
        where: {
          occupation:
            occupation === "ไม่มีข้อมูล"
              ? "No_Info"
              : occupation === "Network"
              ? "Network"
              : occupation === "Database"
              ? "database"
              : occupation === "ทั้งสองสาย"
              ? "both"
              : undefined,

          benefit:
            benefit === "มีสวัสดิการ"
              ? { not: "" }
              : benefit === "ไม่มีข้อมูล"
              ? { equals: "" }
              : undefined,

          positions: {
            some: {
              name:
                position === "ไม่มีข้อมูล" ? "Unknown" : position || undefined,
            },
          },
          province: province || undefined,
        },
        include: {
          positions: true,
        },
      });

      // ถ้ามี userId (user login) ให้ดึง favorite ของ user นั้นออกมา
      let favoriteCompanyIds: string[] = [];
      if (userId) {
        const favorites = await db.favoriteCompanies.findMany({
          where: { userId },
          select: { companyId: true },
        });
        favoriteCompanyIds = favorites.map((fav) => fav.companyId);
      }

      // นับข้อมูลเพื่อ chart
      const occupationCount: Record<string, number> = {};
      const positionCount: Record<string, number> = {};
      const provinceCount: Record<string, number> = {};
      const benefitCount: { มีสวัสดิการ: number; ไม่มีข้อมูล: number } = {
        มีสวัสดิการ: 0,
        ไม่มีข้อมูล: 0,
      };

      // เพิ่ม property isFavorite ให้กับแต่ละ company ตาม favoriteCompanyIds
      companies.forEach((company) => {
        // เพิ่ม property isFavorite
        (company as any).isFavorite = favoriteCompanyIds.includes(company.id);

        if (company.occupation) {
          occupationCount[company.occupation] =
            (occupationCount[company.occupation] || 0) + 1;
        }

        if (company.benefit && company.benefit.trim() !== "") {
          benefitCount["มีสวัสดิการ"] += 1;
        } else {
          benefitCount["ไม่มีข้อมูล"] += 1;
        }

        // ถ้ามีการส่งค่า position เข้ามา ให้เลือกนับแค่ตำแหน่งที่ตรงกับเงื่อนไขเพียงตำแหน่งเดียว
        if (position) {
          const targetName = position === "ไม่มีข้อมูล" ? "Unknown" : position;
          const match = company.positions.find(
            (pos) => pos.name === targetName
          );
          if (match) {
            const posName =
              match.name === "Unknown" ? "ไม่มีข้อมูล" : match.name;
            positionCount[posName] = (positionCount[posName] || 0) + 1;
          }
        } else {
          // ถ้าไม่มี filter position ให้วนลูปนับทุกตำแหน่ง
          company.positions.forEach((pos) => {
            const posName = pos.name === "Unknown" ? "ไม่มีข้อมูล" : pos.name;
            positionCount[posName] = (positionCount[posName] || 0) + 1;
          });
        }

        if (company.province) {
          provinceCount[company.province] =
            (provinceCount[company.province] || 0) + 1;
        }
      });

      // กรองค่าที่เป็น 0 ออก
      const filterZeroValues = (data: Record<string, number>) =>
        Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value > 0)
        );

      return {
        occupation: filterZeroValues(occupationCount),
        position: filterZeroValues(positionCount),
        province: filterZeroValues(provinceCount),
        benefit: filterZeroValues(benefitCount),
        company: companies,
      };
    } catch (error) {
      console.error("Error fetching chart data:", error);
      throw error;
    }
  }
  async getCompanyByUserId(id: string) {
    try {
      const favoriteCompanies = await db.favoriteCompanies.findMany({
        where: { userId: id },
        include: {
          company: {
            include: {
              positions: true, // ดึงข้อมูล positions ของแต่ละ company มาด้วย
            },
          },
        },
      });

      // ดึงเฉพาะข้อมูลของ Company ออกมา
      const companies = favoriteCompanies.map((fav) => fav.company);
      return companies;
    } catch (error) {
      console.error("Error fetching company by user ID:", error);
      return null;
    }
  }
  async getInternedCompanyByUserId(id: string) {
    try {
      // ใช้ findMany เพื่อดึงข้อมูลทั้งหมดที่ตรงกับ userId
      const internedCompanies = await db.company_Student_Interned.findMany({
        where: { userId: id },
        include: {
          company: {
            include: {
              positions: true,
            },
          },
        },
      });

      // ดึงข้อมูล company พร้อมกับเพิ่ม status ใน company
      const companies = internedCompanies.map((interned) => {
        // เพิ่ม status เข้าไปใน company
        return {
          ...interned.company, // ข้อมูลบริษัทเดิม
          status: interned.status, // เพิ่ม status ที่ได้จาก company_Student_Interned
        };
      });

      return companies; // คืนค่าบริษัทที่รวม status แล้ว
    } catch (error) {
      console.error("Error fetching interned company by user ID:", error);
      return null; // ถ้าเกิดข้อผิดพลาด ให้คืนค่า null
    }
  }
  async selectCompany(userId: string, companyId: string) {
    try {
      // 1. ตรวจสอบว่า User ที่มี userId ที่ส่งมามีอยู่ในฐานข้อมูล
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        console.error("User not found");
        return null; // ถ้าไม่พบ User
      }

      // 2. ตรวจสอบว่า Company ที่มี companyId ที่ส่งมามีอยู่ในฐานข้อมูล
      const company = await db.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        console.error("Company not found");
        return null; // ถ้าไม่พบ Company
      }

      // 3. สร้างข้อมูลใน Company_Student_Interned
      const selectedCompany = await db.company_Student_Interned.create({
        data: {
          userId: userId, // ใส่ userId ของผู้ใช้ที่เลือก
          companyId: companyId, // ใส่ companyId ของบริษัทที่นักศึกษาจะทำการฝึกงาน
          student_name: user.firstName + " " + user.lastName, // ดึง student_name จาก User
          status: "approved",
        },
      });

      const updateStatus = await db.user.update({
        where: { id: userId },
        data: { status: "InternSuccess" },
      });

      return selectedCompany; // คืนค่าบันทึกที่สร้างขึ้น
    } catch (error) {
      console.error("Error selecting company:", error);
      return null; // ถ้าเกิดข้อผิดพลาด
    }
  }
  async cancelCompany(userId: string, companyId: string) {
    try {
      // 1. ตรวจสอบว่า User ที่มี userId ที่ส่งมามีอยู่ในฐานข้อมูล
      const user = await db.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) {
        console.error("User not found");
        return null; // ถ้าไม่พบ User
      }

      // 2. ตรวจสอบว่า Company ที่มี companyId ที่ส่งมามีอยู่ในฐานข้อมูล
      const company = await db.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        console.error("Company not found");
        return null; // ถ้าไม่พบ Company
      }
      const companyStudent = await db.company_Student_Interned.findFirst({
        where: {
          userId: userId,
          companyId: companyId,
        },
      });
      // 3. ลบข้อมูลใน Company_Student_Interned
      if (companyStudent) {
        const cancelCompany = await db.company_Student_Interned.update({
          where: {
            id: companyStudent.id,
          },
          data: {
            status: "pending",
          },
        });
      }

      const checkstatus = await db.favoriteCompanies.findMany({
        where: {
          userId: userId,
        },
      });
      if (checkstatus.length === 0) {
        const updateStatus = await db.user.update({
          where: { id: userId },
          data: { status: "No_Intern" },
        });
      } else {
        const updateStatus = await db.user.update({
          where: { id: userId },
          data: { status: "Interning" },
        });
      }

      return { message: "Canceling Company have been sent" }; // คืนค่าบันทึกที่ลบ
    } catch (error) {
      console.error("Error canceling company:", error);
      return null; // ถ้าเกิดข้อผิดพลาด
    }
  }
  async createCompany(data: any) {
    try {
      const positions = data.positions;
      const company = await db.company.create({
        data: {
          benefit: data.benefit,
          companyNameEn: data.companyNameEn,
          companyNameTh: data.companyNameTh,
          contractEmail: data.contractEmail,
          contractName: data.contractName,
          contractSocial: data.contractSocial,
          contractSocial_line: data.contractSocial_line,
          contractTel: data.contractTel,
          description: data.description,
          establishment: data.establishment,
          imgLink: data.imgLink,
          isMou: data.isMou,
          location: data.location,
          occupation: data.occupation,
          province: data.province,
          website: data.website,
          approvalStatus: data.approvalStatus, // ให้สถานะการอนุมัติเป็น pending
          positions: {
            create: positions.map((position: any) => ({
              name: position.name,
              position_description: {
                create: position.position_description.map((desc: any) => ({
                  description: desc.description,
                  skills: {
                    create: desc.skills.map((skill: any) => ({
                      name: skill.name,
                      // เพิ่ม tools เป็น array ในแต่ละ skill
                      tools: {
                        create: skill.tools.map((tool: any) => ({
                          name: tool.name,
                        })),
                      },
                    })),
                  },
                })),
              },
            })),
          },
          companyCreators: {
            create: {
              user: {
                connect: {
                  id: data.userId, // เชื่อมโยงกับ user โดยใช้ userId ที่ส่งมา
                },
              },
            },
          },
        },
      });
      return company;
    } catch (error) {
      console.error("Error creating company:", error);
      return null;
    }
  }

  async deleteCompany(companyId: string) {
    try {
      const company = await db.company.delete({
        where: {
          id: companyId,
        },
      });
      return company;
    } catch (error) {
      console.error("Error deleting company:", error);
      return null;
    }
  }
  async softdeleteCompany(companyId: string) {
    try {
      const company = await db.company.update({
        where: {
          id: companyId,
        },
        data: {
          deletedAt: new Date(),
        },
      });
      return company;
    } catch (error) {
      console.error("Error soft deleting company:", error);
      return null;
    }
  }
  async updateCompany(data: any) {
    try {
      // ลบตำแหน่งที่มี delete: true
      const deletePositions = data.positions?.filter(
        (position: any) => position.isDelete === true
      );
      if (deletePositions?.length) {
        await db.positions.deleteMany({
          where: {
            id: {
              in: deletePositions.map((position: any) => position.id),
            },
          },
        });
      }

      const deletePositionDescriptions = data.positions
        ?.flatMap((position: any) => position.position_description)
        ?.filter((desc: any) => desc?.isDelete === true)
        ?.map((desc: any) => desc?.id)
        ?.filter((id: any) => id !== undefined);

      if (deletePositionDescriptions?.length) {
        await db.position_description.deleteMany({
          where: { id: { in: deletePositionDescriptions } },
        });
      }
      // ลบ skills ที่มี delete: true
      const deleteSkills = data.positions
        ?.flatMap((position: any) =>
          position.position_description?.flatMap((desc: any) =>
            desc.skills
              ?.filter((skill: any) => skill.isDelete === true)
              .map((skill: any) => skill.id)
          )
        )
        ?.filter((id: any) => id !== undefined);

      if (deleteSkills?.length) {
        await db.skills.deleteMany({
          where: { id: { in: deleteSkills } },
        });
      }

      // ลบ tools ที่มี delete: true
      const deleteTools = data.positions
        ?.flatMap((position: any) =>
          position.position_description?.flatMap((desc: any) =>
            desc.skills?.flatMap((skill: any) =>
              skill.tools
                ?.filter((tool: any) => tool.isDelete === true)
                .map((tool: any) => tool.id)
            )
          )
        )
        ?.filter((id: any) => id !== undefined);

      if (deleteTools?.length) {
        await db.tools.deleteMany({
          where: { id: { in: deleteTools } },
        });
      }

      const sanitizedPositions = data.positions?.filter((position: any) => {
        if (!position.name) {
          console.warn(
            `Position with ID ${
              position.id || "unknown"
            } is missing name. This Data will be deleted.`
          );
          return false;
        }

        position.position_description = position.position_description?.filter(
          (desc: any) => {
            if (!desc.description) {
              console.warn(
                `Description for position ID ${position.id} is missing name. This Data will be deleted.`
              );
              return false;
            }

            desc.skills = desc.skills?.filter((skill: any) => {
              if (!skill.name) {
                console.warn(
                  `Skill for description ID ${desc.id} is missing name. This Data will be deleted.`
                );
                return false;
              }

              skill.tools = skill.tools?.filter((tool: any) => {
                if (!tool.name) {
                  console.warn(
                    `Tool for skill ID ${skill.id} is missing name. This Data will be deleted.`
                  );
                  return false;
                }
                return true;
              });

              return true;
            });

            return true;
          }
        );

        return true;
      });

      const updatedCompany = await db.company.update({
        where: { id: data.id },
        data: {
          companyNameTh: data.companyNameTh,
          companyNameEn: data.companyNameEn,
          description: data.description,
          location: data.location,
          province: data.province,
          contractName: data.contractName,
          contractTel: data.contractTel,
          contractEmail: data.contractEmail,
          contractSocial: data.contractSocial,
          contractSocial_line: data.contractSocial_line,
          establishment: data.establishment,
          website: data.website,
          benefit: data.benefit,
          occupation: data.occupation,
          imgLink: data.imgLink,
          isMou: data.isMou,
          positions: {
            upsert: sanitizedPositions.map((position: any) => ({
              where: { id: position.id || "" },
              create: {
                name: position.name,
                position_description: {
                  create: position.position_description.map((desc: any) => ({
                    description: desc.description,
                    skills: {
                      create: desc.skills.map((skill: any) => ({
                        name: skill.name,
                        tools: {
                          create: skill.tools.map((tool: any) => ({
                            name: tool.name,
                          })),
                        },
                      })),
                    },
                  })),
                },
              },
              update: {
                name: position.name,
                position_description: {
                  upsert: position.position_description.map((desc: any) => ({
                    where: { id: desc.id || "" },
                    create: {
                      description: desc.description,
                      skills: {
                        create: desc.skills.map((skill: any) => ({
                          name: skill.name,
                          tools: {
                            create: skill.tools.map((tool: any) => ({
                              name: tool.name,
                            })),
                          },
                        })),
                      },
                    },
                    update: {
                      description: desc.description,
                      skills: {
                        upsert: desc.skills.map((skill: any) => ({
                          where: { id: skill.id || "" },
                          create: {
                            name: skill.name,
                            tools: {
                              create: skill.tools.map((tool: any) => ({
                                name: tool.name,
                              })),
                            },
                          },
                          update: {
                            name: skill.name,
                            tools: {
                              upsert: skill.tools.map((tool: any) => ({
                                where: { id: tool.id || "" },
                                create: { name: tool.name },
                                update: { name: tool.name },
                              })),
                            },
                          },
                        })),
                      },
                    },
                  })),
                },
              },
            })),
          },
        },
      });

      console.log(updatedCompany);
      return updatedCompany;
    } catch (error) {
      console.error("Error updating company:", error);
      return null;
    }
  }
}

export const companyRepository = new CompanyRepository();
