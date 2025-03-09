import { Router } from "express";
const router = Router();
import { adminController } from "../controller/admin.controller";

router.get("/dashboard", adminController.getDashboardStats);

router.patch("/approve/:companyId", adminController.approveCompany);

router.delete("/reject/:companyId", adminController.rejectCompany);


export default router;