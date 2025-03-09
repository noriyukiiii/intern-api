import { Router } from "express";
import { filecontroller } from "../controller/uploadthing.controller";

const router = Router();

router.delete("/delete/:id", filecontroller.deleteFile)

export default router; 