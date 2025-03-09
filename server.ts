import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import companyRoute from "./routes/compnay.routes";
import UploadthingRoute from "./routes/uploadthing.routes";
import BannerRoute from "./routes/banner.routes";
import NewsBannerRoute from "./routes/newbanner.routes";
import userRoute from "./routes/user.routes";
import authRoute from "./routes/auth.routes";
import companycreaterRoute from "./routes/companycreater.routes";
import adminRoute from "./routes/admin.routes";
import commentRoute from "./routes/comment.routes";
const app = express();
const prisma = new PrismaClient();

// เปิดใช้งาน CORS
app.use(cors()); // เพิ่ม CORS middleware เพื่ออนุญาตการเข้าถึงจากโดเมนที่ต่างกัน

// ใช้ express.json() สำหรับรับ request ที่มีข้อมูล JSON (สำหรับ POST หรือ PUT)
app.use(express.json());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/company", companyRoute);

app.use("/uploadthing", UploadthingRoute);

app.use("/banner", BannerRoute);

app.use("/newsbanner", NewsBannerRoute);

app.use("/user", userRoute);

app.use("/auth", authRoute);

app.use("/compCreater", companycreaterRoute);

app.use("/admin", adminRoute);

app.use("/comment", commentRoute)

app.get("/companyoption", async (req, res) => {
  try {
    const companies = await prisma.company.findMany({
      where: {
        deletedAt: null, // Only include companies that are not deleted
      },
      include: {
        positions: {
          include: {
            position_description: {
              include: {
                skills: {
                  include: {
                    tools: true, // Include tools
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        companyNameTh: "asc", // Sort by company name in Thai
      },
    });

    // Initialize sets to store unique values
    const uniqueSkills = new Set<string>();
    const uniqueTools = new Set<string>();
    const uniqueProvinces = new Set<string>();
    const uniquePositions = new Set<string>();
    const uniquePositionDescriptions = new Set<string>();

    // Iterate through companies to collect data
    companies.forEach((company) => {
      if (company.province) {
        uniqueProvinces.add(company.province);
      }

      company.positions.forEach((position) => {
        uniquePositions.add(position.name);

        position.position_description.forEach((description) => {
          uniquePositionDescriptions.add(description.description);

          description.skills.forEach((skill) => {
            uniqueSkills.add(skill.name);

            skill.tools.forEach((tool) => {
              uniqueTools.add(tool.name);
            });
          });
        });
      });
    });

    // Return the combined data as an object
    res.json({
      skill: Array.from(uniqueSkills),
      tool: Array.from(uniqueTools),
      province: Array.from(uniqueProvinces),
      position: Array.from(uniquePositions),
      positiondescription: Array.from(uniquePositionDescriptions),
    });
    // console.log("Response Data:", formattedCompanies); // log ข้อมูลที่ส่งกลับ
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/get-favorite", async (req: Request, res: Response): Promise<void> => {
  const { userId, companyId } = req.query;

  if (!userId || !companyId) {
    res
      .status(400)
      .json({ success: false, message: "userId and companyId are required" });
    return;
  }

  try {
    // ตรวจสอบสถานะรายการโปรดจากฐานข้อมูล
    const favorite = await prisma.favoriteCompanies.findFirst({
      where: {
        userId: String(userId),
        companyId: String(companyId),
      },
    });

    if (favorite) {
      // ถ้ามีรายการโปรดให้ส่งสถานะที่เป็น true
      res.json({ success: true, isFavorite: true });
    } else {
      // ถ้าไม่มีรายการโปรดให้ส่งสถานะเป็น false
      res.json({ success: true, isFavorite: false });
    }
  } catch (error) {
    console.error("Error fetching favorite status:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch favorite status" });
  }
});

// POST สำหรับอัปเดตสถานะรายการโปรด
app.post(
  "/update-favorite",
  async (req: Request, res: Response): Promise<void> => {
    const { userId, companyId, isSelected } = req.body;

    try {
      // เช็คว่า userId อยู่ใน Company_Student_Interned หรือไม่
      const internedCompany = await prisma.company_Student_Interned.findFirst({
        where: {
          userId: userId,
        },
      });

      // ถ้า userId อยู่ใน Company_Student_Interned ให้เปลี่ยนสถานะเป็น 'InternSuccess'
      if (internedCompany) {
        await prisma.user.update({
          where: { id: userId },
          data: { status: "InternSuccess" },
        });
        res.json({
          success: true,
          message: "User status set to InternSuccess",
        });
        return; // ไม่ทำการเพิ่มหรือลบรายการโปรด
      }

      // ถ้าไม่มีข้อมูลใน Company_Student_Interned
      if (isSelected) {
        // ตรวจสอบว่ามีข้อมูลในรายการโปรดหรือไม่
        const existingFavorite = await prisma.favoriteCompanies.findFirst({
          where: {
            userId: userId,
            companyId: companyId,
          },
        });

        if (!existingFavorite) {
          // ถ้ายังไม่มี ให้เพิ่มสถานประกอบการในรายการโปรด
          await prisma.favoriteCompanies.create({
            data: {
              userId: userId,
              companyId: companyId,
            },
          });
        }

        // เช็คว่าผู้ใช้มีรายการโปรดหรือไม่หลังจากเพิ่ม
        const favoritesCount = await prisma.favoriteCompanies.count({
          where: {
            userId: userId,
          },
        });

        // ถ้ามีรายการโปรดอย่างน้อย 1 รายการ ให้เปลี่ยนสถานะเป็น 'Interning'
        if (favoritesCount > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { status: "Interning" },
          });
        }
      } else {
        // ลบสถานประกอบการออกจากรายการโปรด
        await prisma.favoriteCompanies.deleteMany({
          where: {
            userId: userId,
            companyId: companyId,
          },
        });

        // เช็คว่าผู้ใช้มีรายการโปรดเหลือหรือไม่หลังจากลบ
        const favoritesCount = await prisma.favoriteCompanies.count({
          where: {
            userId: userId,
          },
        });

        // ถ้าไม่มีรายการโปรดเลยให้เปลี่ยนสถานะเป็น 'Not Interning'
        if (favoritesCount === 0) {
          await prisma.user.update({
            where: { id: userId },
            data: { status: "No_Intern" },
          });
        }
      }

      res.json({ success: true, message: "Favorite updated successfully" });
    } catch (error) {
      console.error("Error updating favorite status:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update favorite status" });
    }
  }
);

// ปิดการเชื่อมต่อ PrismaClient เมื่อไม่ใช้งาน
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = 5555;

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

export default app;
