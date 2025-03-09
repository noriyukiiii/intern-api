import { Router } from "express";
import { userController } from "../controller/user.controller";

const router = Router();

router.get("/verify", userController.verify);

router.patch("/update", userController.updateUser);

router.delete("/delete/:id", userController.delete);

export default router;
