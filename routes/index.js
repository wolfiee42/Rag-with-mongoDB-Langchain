import { Router } from "express";
import { controller } from "../controller/index.js";

const router = Router();

router.get("/init", controller.method1);

router.post("/file-upload", controller.fileUpload);

router.post("/vector-index", controller.vectorIndex);

router.post("/test-document", controller.testDocument);

router.get("/generate-responses", controller.generateResponsesFromAI);

export default router;
