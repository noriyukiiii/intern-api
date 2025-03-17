import { Router } from "express";
import { appealController } from "../controller/appeal.controller";
const router = Router();

router.get("/getAppeal/:id", appealController.getAppeal);

export default router;
