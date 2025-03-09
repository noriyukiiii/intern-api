import { Request, Response } from "express";
import { bannerRepository } from "../repository/banner.repository";
import { fileRepository } from "../repository/uploadthing.repository";

class BannerController {
  async getBanner(req: Request, res: Response) {
    try {
      const banner = await bannerRepository.getBanner();
      res.status(200).json(banner);
      return;
    } catch (error: any) {
      console.error(error); // ล็อก error ใน console
      res.status(500).json({ message: "Server error while fetching banner" }); // ใช้ return เพื่อส่ง response เดียว
      return;
    }
  }
  async getBannerDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ message: "Banner ID is required" });
        return;
      }

      const banner = await bannerRepository.getBannerDetail(id);

      if (!banner) {
        res.status(404).json({ message: "Banner not found" });
        return;
      }

      res.status(200).json(banner); // ใช้  เพื่อหยุดการทำงานหลังจากส่ง response
      return;
    } catch (error: any) {
      console.error(error); // ล็อก error ใน console
      res.status(500).json({ message: "Server error while fetching banner" }); // ใช้ return เพื่อส่ง response เดียว
      return;
    }
  }
  async getActiveBanner(req: Request, res: Response) {
    try {
      const banner = await bannerRepository.getActiveBanner();
      if (banner.length === 0) {
        res.status(404).json({ message: "No active banners found" });
        return;
      }
      res.status(200).json(banner);
      return;
    } catch (error: any) {
      console.error(error); // ล็อก error ใน console
      res.status(500).json({ message: "Server error while fetching banner" }); // ใช้ return เพื่อส่ง response เดียว
      return;
    }
  }
  async createBanner(req: Request, res: Response) {
    try {
      const { title, image, isActive, userId } = req.body;
      // ตรวจสอบว่า userId ถูกต้องและมีค่าหรือไม่
      if (!userId) {
        res
          .status(400)
          .json({ message: "userId is required to create a banner" });
        return;
      }

      // เรียกใช้ repository เพื่อสร้างแบนเนอร์
      const banner = await bannerRepository.createBanner({
        title,
        image,
        isActive,
        userId, // ส่ง userId ไปยัง repository
      });

      res.status(200).json(banner); // ส่งข้อมูลแบนเนอร์ที่ถูกสร้างไปใน response
      return;
    } catch (error: any) {
      console.error(error); // แสดงข้อผิดพลาดใน console
      res.status(500).json({ message: error.message }); // ส่งข้อผิดพลาดใน response
      return;
    }
  }
  async deleteBanner(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bannerId = id;
      if (!bannerId) {
        throw new Error("Banner ID is required");
      }

      const bannerdeleteimage = await bannerRepository.getBannerDetail(
        bannerId
      );
      const fileName = bannerdeleteimage.image.split("/").pop(); // ใช้ .split() เพื่อดึงแค่ชื่อไฟล์จาก URL

      await bannerRepository.deleteBanner(bannerId);
      await fileRepository.deleteFile(fileName); // ลบไฟล์จาก UploadThing
      res.status(200).json("Banner deleted successfully");
      return;
    } catch (error: any) {
      console.error(error); // แสดงข้อผิดพลาดใน console
      res.status(500).json({ message: error.message }); // ส่งข้อผิดพลาดใน response
      return;
    }
  }
  async updateBanner(req: Request, res: Response) {
    const { id, title, image, isActive, userId } = req.body;
    try {
      if (!id) {
        res.status(400).json({ message: "Banner ID is required" });
        return;
      }
      const banner = await bannerRepository.updateBanner({
        id,
        title,
        image,
        isActive,
        userId,
      });
      res.json(banner);
      return;
    } catch (error: any) {
      console.error(error); // แสดงข้อผิดพลาดใน console
      res.status(500).json({ message: error.message }); // ส่งข้อผิดพลาดใน response
      return;
    }
  }
  async updateOrder(req: Request, res: Response) {
    try {
      const { banners } = req.body; // รับข้อมูลแบนเนอร์และลำดับใหม่จาก client

      if (!Array.isArray(banners) || banners.length === 0) {
        res.status(400).json({ message: "Invalid banners data" });
        return;
      }

      // ทำการอัปเดตลำดับของแบนเนอร์
      const updatedBanners = await bannerRepository.updateBannerOrder(banners);

      if (updatedBanners.length === 0) {
        res.status(404).json({ message: "No banners were updated" });
        return;
      }

      res.status(200).json({ message: "Banners reordered successfully" });
      return;
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
      return;
    }
  }
  async updateIsActive(req: Request, res: Response) {
    const { id } = req.params;
    try {
      if (!id) {
        res.status(400).json({ message: "Banner ID is required" });
        return;
      }

      // เรียกใช้ฟังก์ชัน updateIsActive เพื่ออัปเดตข้อมูล
      const banner = await bannerRepository.updateIsActive(id);

      // ส่งข้อมูลกลับไปว่าอัปเดตสำเร็จ
      res.json("Banner isActive updated successfully");
      return;
    } catch (error: any) {
      console.error(error); // แสดงข้อผิดพลาดใน console

      // ตรวจสอบว่า error.message คืออะไรและส่ง status code ที่เหมาะสม
      if (error.message === "Cannot activate more than 5 banners.") {
        res
          .status(400)
          .json({ message: "Cannot activate more than 5 banners." });
      } else if (error.message === "Banner not found") {
        res.status(404).json({ message: "Banner not found" });
      } else {
        res
          .status(500)
          .json({ message: "An error occurred while updating the banner." });
      }
      return;
    }
  }
}

export const bannerController = new BannerController();
