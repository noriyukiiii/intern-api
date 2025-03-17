import { Request, Response } from "express";
import { appealRepository } from "../repository/appeal.repository";

class AppealController {
  async getAppeal(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const appeal = await appealRepository.findAppealById(id);
      res.status(200).json(appeal);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
}

export const appealController = new AppealController();
