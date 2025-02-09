import { Router } from "express";
import { controller } from "../controller/index.js";

const router = Router();

router.get("/init", controller.method1);

export default router;
