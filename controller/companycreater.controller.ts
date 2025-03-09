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
}

export const companyCreaterController = new CompanyCreaterController();
