import { db } from "../lib/prisma";

class NewsBannerRepository {
  async getBanner() {
    try {
      return await db.newsBanner.findMany({
        orderBy: {
          order: "asc",
        },
        include: {
          user: {
            // เพิ่มการ join กับตาราง User
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching banners: " + error.message);
    }
  }
  async getBannerDetail(bannerId: string): Promise<any> {
    try {
      return await db.newsBanner.findUnique({
        where: {
          id: bannerId,
        },
      });
    } catch (error: any) {
      throw new Error("Banner not found");
    }
  }
  async getActiveBanner() {
    try {
      return await db.newsBanner.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          order: "asc",
        },
      });
    } catch (error: any) {
      throw new Error("Error fetching active banners: " + error.message);
    }
  }
  async createBanner(data: any) {
    try {
      const lastBanner = await db.newsBanner.findFirst({
        orderBy: {
          order: "desc", // ดึงลำดับที่สูงสุด
        },
      });

      const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // ถ้ามีแบนเนอร์ก่อนหน้า ให้เพิ่ม 1, ถ้าไม่มีเริ่มที่ 1

      if (!data.userId) {
        throw new Error("userId is required to create a banner");
      }

      const banner = await db.newsBanner.create({
        data: {
          title: data.title,
          image: data.image,
          isActive: data.isActive,
          linkUrl : data.linkUrl,
          order: nextOrder,
          user: {
            connect: { id: data.userId }, // เชื่อมโยงกับ User ที่มี userId ตรง
          },
        },
      });

      return banner;
    } catch (error: any) {
      throw new Error("Error creating banner: " + error.message);
    }
  }
  async deleteBanner(bannerId: string) {
    try {
      // ลบแบนเนอร์
      const bannerToDelete = await db.newsBanner.delete({
        where: {
          id: bannerId,
        },
      });

      // รีเซ็ตค่า order ของแบนเนอร์ที่เหลือ
      const banners = await db.newsBanner.findMany({
        orderBy: { order: "asc" }, // เรียงลำดับจากน้อยไปมาก
      });

      // อัปเดต order ของแบนเนอร์ที่เหลือ
      for (let i = 0; i < banners.length; i++) {
        await db.banner.update({
          where: { id: banners[i].id },
          data: { order: i + 1 }, // รีเซ็ต `order` ให้เป็นลำดับที่ถูกต้อง
        });
      }

      return bannerToDelete; // ส่งคืนแบนเนอร์ที่ถูกลบ
    } catch (error: any) {
      throw new Error("Error deleting banner: " + error.message);
    }
  }
  async updateBanner(data: any) {
    try {
      const existingUser = await db.user.findUnique({
        where: { id: data.userId },
      });
  
      if (!existingUser) {
        throw new Error("User not found");
      }
  
      return await db.newsBanner.update({
        where: { id: data.id },
        data: {
          title: data.title,
          image: data.image,
          isActive: data.isActive,
          linkUrl : data.linkUrl,
          user: {
            connect: { id: data.userId }, // เชื่อมโยง user ใหม่
          },
        },
      });
    } catch (error: any) {
      console.error("update banner repo : "+error);
      throw new Error("Error updating banner: " + error.message);
    }
  }
  
  async updateBannerOrder(banners: { id: string; order: number }[]) {
    try {
      const updatePromises = banners.map((banner) =>
        db.newsBanner.update({
          where: { id: banner.id },
          data: { order: banner.order },
        })
      );
      // ใช้ Promise.all เพื่อรันการอัปเดตทุกแบนเนอร์พร้อมกัน
      return await Promise.all(updatePromises);
    } catch (error: any) {
      throw new Error("Error updating banner order: " + error.message);
    }
  }
  async updateIsActive(bannerId: string) {
    try {
      // หาบ้านที่ต้องการอัปเดต
      const banner = await db.newsBanner.findUnique({
        where: {
          id: bannerId,
        },
      });

      if (!banner) {
        throw new Error("Banner not found");
      }

      // เช็คสถานะ isActive ก่อนอัปเดต
      const isActive = banner.isActive;

      // ถ้าต้องการเปิด banner และ active มากกว่า 5 ตัว ให้เกิดข้อผิดพลาด
      if (!isActive) {
        const activeCount = await db.banner.count({
          where: {
            isActive: true,
          },
        });

        // ถ้าจำนวน active มากกว่า 5, ห้ามเพิ่ม
        if (activeCount >= 5) {
          throw new Error("Cannot activate more than 5 banners.");
        }
      }

      // อัปเดต isActive ของ Banner
      return await db.newsBanner.update({
        where: {
          id: bannerId,
        },
        data: {
          isActive: !isActive, // เปลี่ยนสถานะจาก active เป็น inactive หรือกลับกัน
        },
      });
    } catch (error: any) {
      throw new Error("Error updating isActive: " + error.message);
    }
  }
}

export const newsBannerRepository = new NewsBannerRepository();
