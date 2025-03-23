import { db } from "../lib/prisma";

class UserRepository {
  async verifyUser(token: string) {
    try {
      // ค้นหาผู้ใช้ที่มี verificationToken ตรงกับที่ส่งมา
      const user = await db.user.findUnique({
        where: {
          verificationToken: token,
        },
      });

      // หากไม่พบผู้ใช้ที่มี token นี้
      if (!user) {
        throw new Error("Token not found");
      }

      // อัพเดตสถานะการยืนยันอีเมลและลบ verificationToken
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true, // ตั้งค่า emailVerified เป็น true
          verificationToken: null, // ลบ token ออก
        },
      });

      return { success: true, message: "Email verified successfully" };
    } catch (error: any) {
      throw new Error("Error verifying user: " + error.message);
    }
  }
  async deleteUser(id: string) {
    try {
      if (!id) {
        throw new Error("ID is required");
      }
      await db.user.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new Error("Error deleting user: " + error.message);
    }
  }
  async updateUser(data: any) {
    try {
      if (!data.id) {
        throw new Error("ID is required");
      }
      await db.user.update({
        where: { id: data.id },
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          studentId: data.studentId,
          phone: data.phone,
          role: data.role,
        },
      });
    } catch (error: any) {
      throw new Error("Error updating user: " + error.message);
    }
  }
  async changeStatus(userId: string) {
    try {
      if (!userId) {
        throw new Error("ID is required");
      }
      const internedCompany = await db.company_Student_Interned.findFirst({
        where: {
          userId: userId,
        },
      });
      console.log(userId);
      // ถ้า userId อยู่ใน Company_Student_Interned ให้เปลี่ยนสถานะเป็น 'InternSuccess'
      if (internedCompany) {
        await db.user.update({
          where: { id: userId },
          data: { status: "InternSuccess" },
        });
        console.log("อัพเดทตรง InternSuccess");
        return;
      }

      // เช็คว่า userId มี FavoriteCompanies หรือไม่
      const favoriteCompaniesCount = await db.favoriteCompanies.count({
        where: { userId },
      });

      const newStatus = favoriteCompaniesCount > 0 ? "Interning" : "No_Intern";

      //ถ้าไม่มี FavoriteCompanies จะเป็น No_Intern
      await db.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });
    } catch (error: any) {
      throw new Error("Error changing user status: " + error.message);
    }
  }
  async editFormOptions() {
    try {
      const provinceData = await db.company.findMany({
        select: { province: true },
      });

      const positionData = await db.positions.findMany({
        select: { name: true },
      });

      // ใช้ Set เพื่อลบค่าซ้ำ และ filter เอา null ออก
      const province = Array.from(
        new Set(provinceData.map((item) => item.province))
      ).filter((province) => province !== null);

      const position = Array.from(
        new Set(positionData.map((item) => item.name))
      ).filter((position) => position !== "Unknown");
      return { province, position };
    } catch (error: any) {
      throw new Error("Error getting form options: " + error);
    }
  }
  async recommand(userId: string) {
    try {
      // ดึงข้อมูลของผู้ใช้จากฐานข้อมูล
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // สร้างเงื่อนไขการค้นหาที่ยืดหยุ่น
      const whereConditions: any = {};

      // ตรวจสอบค่าของ benefit
      if (user.benefit !== undefined) {
        // ถ้า benefit เป็น true ให้ค้นหาค่า String ที่ไม่ใช่ ""
        whereConditions.benefit = user.benefit ? { not: "" } : undefined;
      }

      // ตรวจสอบค่า occupation ถ้ามี
      if (user.occupation) {
        whereConditions.occupation = user.occupation;
      }

      // ตรวจสอบค่า province ถ้ามี
      if (user.province) {
        whereConditions.province = user.province;
      }

      // ตรวจสอบและเพิ่มค่า position ถ้ามี
      if (user.position) {
        whereConditions.positions = {
          some: {
            name: user.position,
          },
        };
      }

      // ค้นหาบริษัทที่ตรงกับเงื่อนไขที่กำหนด
      const recommendedCompanies = await db.company.findMany({
        where: whereConditions,
        take: 3, // จำกัดการค้นหาให้แค่ 3 บริษัท
        include: {
          positions: true, // ดึงข้อมูล positions มาด้วย
        },
      });

      // ดึงรายการโปรดของผู้ใช้ (บริษัทที่ถูกบันทึกใน FavoriteCompanies)
      const favoriteCompanyIds = await db.favoriteCompanies
        .findMany({
          where: { userId: userId },
          select: { companyId: true },
        })
        .then((favorites) => favorites.map((fav) => fav.companyId));

      // กรองบริษัทที่อยู่ในรายการโปรดออก
      let filteredCompanies = recommendedCompanies.filter(
        (company) => !favoriteCompanyIds.includes(company.id)
      );

      // ถ้ามีบริษัทที่ถูกกรองออกไป เราจะต้องเอาบริษัทที่เหลือจากการค้นหาในลำดับที่ 4 5 6 เป็นต้นมา
      if (filteredCompanies.length < 3) {
        // ถ้าบริษัทที่กรองออกไปยังไม่ถึง 3 บริษัท ให้ดึงบริษัทที่เหลือมาจากการค้นหา
        const remainingCompanies = await db.company.findMany({
          where: whereConditions,
          skip: 3, // ข้ามไป 3 บริษัทแรก
          take: 3 - filteredCompanies.length, // ดึงเพิ่มมาให้ครบ 3 บริษัท
          include: {
            positions: true,
          },
        });

        // รวมบริษัทที่กรองแล้วกับบริษัทที่ดึงมา
        filteredCompanies = [...filteredCompanies, ...remainingCompanies];
      }

      // ส่งคืนผลลัพธ์บริษัทที่ตรงกับเงื่อนไขและไม่อยู่ในรายการโปรด
      return filteredCompanies;
    } catch (error: any) {
      throw new Error("Error recommending user: " + error.message);
    }
  }
}

export const userRepository = new UserRepository();
