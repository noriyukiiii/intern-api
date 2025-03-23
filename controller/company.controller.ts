import { Request, Response } from "express";
import { companyRepository } from "../repository/company.repository";

class CompanyController {
  async getCompany(req: Request, res: Response) {
    try {
      const company = await companyRepository.getCompany();
      res.json(company);
      return;
    } catch (error: any) {
      res.json(error.message);
      return;
    }
  }
  async getCompanyDetail(req: Request, res: Response) {
    try {
      console.time("getOccupation");
      const { id } = req.params;
      const companyId = id;
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const company = await companyRepository.getCompanyDetail(companyId);

      if (!company) {
        res.json("company not found ");
        throw Error;
      }
      console.timeEnd("getOccupation");
      res.json(company);
      return;
    } catch (error: any) {
      console.error(error); // แสดงข้อผิดพลาดใน console
      res
        .status(500)
        .json({ message: error.message, data: "Company not found" }); // ส่งข้อผิดพลาดใน response
      return;
    }
  }
  async getChartData(req: Request, res: Response) {
    try {
      // รับพารามิเตอร์จาก query หรือ body (ขึ้นอยู่กับการส่งข้อมูล)
      const { occupation, position, province, benefit, userId } = req.query;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      // เรียกใช้ฟังก์ชัน getChartData ใน repository
      const companyData = await companyRepository.getChartData({
        occupation: occupation ? String(occupation) : undefined,
        position: position ? String(position) : undefined,
        province: province ? String(province) : undefined,
        benefit: benefit ? String(benefit) : undefined,
        userId: userId ? String(userId) : undefined,
      });

      // ส่งข้อมูลที่ได้รับจาก getChartData กลับไปยัง client
      res.json(companyData);
      return;
    } catch (error: any) {
      // ถ้ามีข้อผิดพลาดเกิดขึ้น ให้ส่งข้อความข้อผิดพลาดกลับ
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async getFavoriteCompanyByUserId(req: Request, res: Response) {
    try {
      const { userId, companyId } = req.query;
      const company = await companyRepository.getFavoritebyUserId(
        userId as string,
        companyId as string
      );
      res.json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async getCompanyByUserId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await companyRepository.getCompanyByUserId(id);
      res.json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async getInternedCompanyByUserId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const company = await companyRepository.getInternedCompanyByUserId(id);
      res.status(200).json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async cancelCompany(req: Request, res: Response) {
    try {
      const { userId, companyId } = req.body;
      if (!userId || !companyId) {
        res.status(400).json({
          success: false,
          message: "userId and companyId are required",
        });
        return;
      }
      const company = await companyRepository.cancelCompany(userId, companyId);
      res.status(201).json({
        success: true,
        message: "Company canceled has been sent successfully",
      });
      return;
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Failed to cancel company" });
      return;
    }
  }
  async selectCompany(req: Request, res: Response) {
    try {
      const { userId, companyId } = req.body;
      const company = await companyRepository.selectCompany(userId, companyId);
      res.status(201).json({
        success: true,
        message: "Company selected successfully",
      });
      return;
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Failed to select company" });
      return;
    }
  }
  async createCompany(req: Request, res: Response) {
    try {
      const {
        benefit,
        companyNameEn,
        companyNameTh,
        contractEmail,
        contractName,
        contractSocial,
        contractSocial_line,
        contractTel,
        description,
        establishment,
        imgLink,
        isMou,
        location,
        occupation,
        positions,
        province,
        website,
        userId,
        approvalStatus,
      } = req.body;
      const company = await companyRepository.createCompany({
        benefit,
        companyNameEn,
        companyNameTh,
        contractEmail,
        contractName,
        contractSocial,
        contractSocial_line,
        contractTel,
        description,
        establishment,
        imgLink,
        isMou,
        location,
        occupation,
        positions,
        province,
        website,
        userId,
        approvalStatus,
      });
      res.status(201).json({
        success: true,
        message: "Company created successfully",
        company,
      });
      return;
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Failed to create company" });
      return;
    }
  }
  async deleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = id;
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const company = await companyRepository.deleteCompany(companyId);

      if (!company) {
        res.json("company not found ");
        throw Error;
      }

      res.json("Company deleted successfully");
    } catch (error: any) {
      throw new Error("Company not found");
    }
  }
  async softdeleteCompany(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const companyId = id;
      if (!companyId) {
        throw new Error("Company ID is required");
      }

      const company = await companyRepository.softdeleteCompany(companyId);

      if (!company) {
        res.json("company not found ");
        throw Error;
      }

      res.json("Company soft deleted successfully");
    } catch (error: any) {
      throw new Error("Company not found");
    }
  }
  async updateCompany(req: Request, res: Response) {
    const {
      id,
      companyNameTh,
      companyNameEn,
      description,
      location,
      province,
      contractName,
      contractTel,
      contractEmail,
      contractSocial,
      contractSocial_line,
      establishment,
      website,
      benefit,
      occupation,
      imgLink,
      isMou,
      positions,
    } = req.body;
    try {
      if (!id) {
        res.status(400).json({ message: "Company ID is required" });
        return;
      }
      const company = await companyRepository.updateCompany({
        id,
        benefit,
        companyNameEn,
        companyNameTh,
        contractEmail,
        contractName,
        contractSocial,
        contractSocial_line,
        contractTel,
        description,
        establishment,
        imgLink,
        isMou,
        location,
        occupation,
        positions,
        province,
        website,
      });
      res.status(201).json({
        success: true,
        message: "Company updated successfully",
        company,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update company" });
    }
  }
  async userUpdateCompany(req: Request, res: Response) {
    try {
      const { userId, companyId, Data } = req.body;
      if (!userId || !companyId) {
        res.status(400).json({
          success: false,
          message: "userId and companyId are required",
        });
        return;
      }
      const company = await companyRepository.userUpdateCompany(
        userId,
        companyId,
        Data
      );
      res.status(201).json({
        success: true,
        message: "Company updated successfully",
        company,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Failed to update company" });
      return;
    }
  }
  async getEditRequest(req: Request, res: Response) {
    try {
      const company = await companyRepository.getEditRequest();

      res.status(200).json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async confirmEditRequest(req: Request, res: Response) {
    try {
      const { requestId, compId, userId } = req.body;
      console.log("Received requestId in server:", requestId); // ตรวจสอบค่าที่รับมาจาก client
      if (!requestId) {
        res.status(400).json({ message: "Request ID is required" });
        return;
      }

      const company = await companyRepository.confirmEditRequest(
        requestId,
        compId,
        userId
      );
      res.status(200).json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
  async rejectEditRequest(req: Request, res: Response) {
    try {
      const { requestId, compId, userId } = req.body;
      console.log("Received requestId in server:", requestId); // ตรวจสอบค่าที่รับมาจาก client
      if (!requestId) {
        res.status(400).json({ message: "Request ID is required" });
        return;
      }

      const company = await companyRepository.rejectEditRequest(
        requestId,
        compId,
        userId
      );
      res.status(200).json(company);
      return;
    } catch (error: any) {
      res.status(500).json({ error: error.message });
      return;
    }
  }
}

export const companyController = new CompanyController();
