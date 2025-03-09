import { Router } from "express";
import { newsBannerController } from "../controller/newsbanner.controller";

const router = Router();

router.get("/getActiveBanner", newsBannerController.getActiveBanner);

router.get("/", newsBannerController.getBanner);

router.get("/:id", newsBannerController.getBannerDetail);

router.post("/createBanner", newsBannerController.createBanner);

router.delete("/deleteBanner/:id", newsBannerController.deleteBanner);

router.patch("/update_banner", newsBannerController.updateBanner);

router.patch("/update_order", newsBannerController.updateOrder);

router.patch("/update_isActive/:id", newsBannerController.updateIsActive);

export default router;
