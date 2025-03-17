import { Request, Response } from "express";
import { companyCreaterRepository } from "../repository/companycreater.repository";

class CompanyCreaterController {
  async getCompanyCreater(req: Request, res: Response) {
    try {
      const companyCreator = await companyCreaterRepository.getCompanyCreater();
      res.json(companyCreator);
      return;
    } catch (error: any) {
      console.error("Error in controller:", error);
      res.status(500).json({ message: "Error retrieving company creators" });
      return;
    }
  }
  async getCompanyCancel(req: Request, res: Response) {
    try {
      const companyCancel = await companyCreaterRepository.getCompanyCancel();
      res.json(companyCancel);
      return;
    } catch (error: any) {
      console.error("Error in controller:", error);
      res.status(500).json({ message: "Error retrieving company cancel" });
      return;
    }
  }
  async ApproveCancelCompany(req: Request, res: Response) {
    try {
      const { id, userId, compId } = req.query; // ใช้ req.query แทน req.params
      const companyCancel = await companyCreaterRepository.ApproveCancelCompany(
        id as string,
        compId as string,
        userId as string,
      );
      res.json(companyCancel);
      return;
    } catch (error: any) {
      console.error("Error in controller:", error);
      res.status(500).json({ message: "Error Approve Cancel Company" });
    }
  }
  async RejecteCancelCompany(req: Request, res: Response) {
    try {
      const { id, userId, compId } = req.body;

      const companyCancel = await companyCreaterRepository.RejectCancelCompany(
        id,
        compId,
        userId
      );
      res.json(companyCancel);
      return;
    } catch (error: any) {
      console.error("Error in controller:", error);
      res.status(500).json({ message: "Error Rejecte Cancel Company" });
    }
  }
}

export const companyCreaterController = new CompanyCreaterController();
