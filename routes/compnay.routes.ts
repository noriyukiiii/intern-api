import { Router } from "express";
import { companyController } from "../controller/company.controller";

const router = Router();

router.get("/", companyController.getCompany);

router.get("/getCompanyFavoite", companyController.getFavoriteCompanyByUserId);

router.get("/get_chart", companyController.getChartData);

router.get("/:id", companyController.getCompanyDetail);

router.get("/getFavoriteCompany/:id", companyController.getCompanyByUserId);

router.get(
  "/getInternedCompany/:id",
  companyController.getInternedCompanyByUserId
);

router.patch("/cancelCompany", companyController.cancelCompany);

router.post("/selectCompany", companyController.selectCompany);

router.post("/createCompany", companyController.createCompany);

router.patch("/softdeleteCompany/:id", companyController.softdeleteCompany);

router.delete("/deleteCompany/:id", companyController.deleteCompany);

router.post("/update_company", companyController.updateCompany);

export default router;
