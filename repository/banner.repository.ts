import { db } from "../lib/prisma";

class BannerRepository {
  async getBanner() {
    try {
      return await db.banner.findMany({
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
      return await db.banner.findUnique({
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
      return await db.banner.findMany({
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
      const lastBanner = await db.banner.findFirst({
        orderBy: {
          order: "desc", // ดึงลำดับที่สูงสุด
        },
      });

      const nextOrder = lastBanner ? lastBanner.order + 1 : 1; // ถ้ามีแบนเนอร์ก่อนหน้า ให้เพิ่ม 1, ถ้าไม่มีเริ่มที่ 1

      if (!data.userId) {
        throw new Error("userId is required to create a banner");
      }

      const banner = await db.banner.create({
        data: {
          title: data.title,
          image: data.image,
          isActive: data.isActive,
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
      const bannerToDelete = await db.banner.delete({
        where: {
          id: bannerId,
        },
      });

      // รีเซ็ตค่า order ของแบนเนอร์ที่เหลือ
      const banners = await db.banner.findMany({
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
  
      return await db.banner.update({
        where: { id: data.id },
        data: {
          title: data.title,
          image: data.image,
          isActive: data.isActive,
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
        db.banner.update({
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
      const banner = await db.banner.findUnique({
        where: {
          id: bannerId,
        },
      });

      if (!banner) {
        throw new Error("Banner not found");
      }

      // เช็คสถานะ isActive ก่อนอัปเดต
      const isActive = banner.isActive;

      // อัปเดต isActive ของ Banner
      return await db.banner.update({
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

export const bannerRepository = new BannerRepository();
