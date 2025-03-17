import { Router } from "express";
import { companyCreaterController } from "../controller/companycreater.controller";

const router = Router();

router.get("/", companyCreaterController.getCompanyCreater);

router.get("/cancel", companyCreaterController.getCompanyCancel);

router.patch("/reject", companyCreaterController.RejecteCancelCompany);

router.delete("/approve", companyCreaterController.ApproveCancelCompany);
export default router;
