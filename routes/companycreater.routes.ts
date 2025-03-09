import { Router } from "express";
import { companyCreaterController } from "../controller/companycreater.controller";

const router = Router();

router.get("/", companyCreaterController.getCompanyCreater);

export default router;
