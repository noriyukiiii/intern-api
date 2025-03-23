import { Router } from "express";
import { userController } from "../controller/user.controller";

const router = Router();

router.get("/verify", userController.verify);

router.get("/edit-form-options", userController.editFormOptions);

router.get("/recommand", userController.recommand);

router.patch("/update", userController.updateUser);

router.delete("/delete/:id", userController.delete);

export default router;
