import { Router } from "express";
import { controller } from "../controller/index.js";
import { uploadToMemory } from "../utils/multerStorage.js";

const router = Router();

router.get("/init", controller.method1);
router.post("/upload-pdf", uploadToMemory.single("file"), controller.r2PDFUpload);
router.get("/get-pdf/:key", controller.r2PDFGet);

export default router;
