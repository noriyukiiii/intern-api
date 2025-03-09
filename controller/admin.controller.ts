import { Request, Response } from "express";
import adminRepository from "../repository/admin.repository";

class AdminController {
  async getDashboardStats(req: Request, res: Response) {
    if (req.method !== "GET") {
      res.status(405).json({ message: "Method Not Allowed" });
      return;
    }

    try {
      const stats = await adminRepository.getDashboardStats();
      res.status(200).json(stats);
      return;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
  }
  async approveCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      await adminRepository.approveCompany(companyId);
      res.status(200).json({ message: "Company approved" });
      return;
    } catch (error: any) {
      console.error("Error approving company:", error);
      res.status(500).json({ message: "Unable to approve company" });
      return;
    }
  }
  async rejectCompany(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      await adminRepository.rejectCompany(companyId);
      res.status(200).json({ message: "Company rejected" });
      return;
    } catch (error: any) {
      console.error("Error rejecting company:", error);
      res.status(500).json({ message: "Unable to reject company" });
      return;
    }
  }
}

export const adminController = new AdminController();
