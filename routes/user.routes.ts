import { Router } from "express";
import { userController } from "../controller/user.controller";

const router = Router();

router.get("/edit-form-options", userController.editFormOptions);

router.get("/recommand", userController.recommand);

router.patch("/verify", userController.verify);

router.patch("/update", userController.updateUser);

router.post("/send-verify-email", userController.sendVerifyEmail);

router.delete("/delete/:id", userController.delete);

export default router;
