import { Router } from "express";
import { bannerController } from "../controller/banner.controller";

const router = Router();

router.get("/getActiveBanner", bannerController.getActiveBanner);

router.get("/", bannerController.getBanner);

router.get("/:id", bannerController.getBannerDetail);

router.post("/createBanner", bannerController.createBanner);

router.delete("/deleteBanner/:id", bannerController.deleteBanner);

router.patch("/update_banner", bannerController.updateBanner);

router.patch("/update_order", bannerController.updateOrder);

router.patch("/update_isActive/:id", bannerController.updateIsActive);

export default router;
