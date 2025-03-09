import { Router } from "express";
import { commentController } from "../controller/comment.controller";
const router = Router();

router.get("/getComments", commentController.getCompanyComments);
router.post("/CreateComment", commentController.createComment);
router.delete("/deleteComment", commentController.deleteComment);
export default router;