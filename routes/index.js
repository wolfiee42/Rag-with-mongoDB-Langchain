import { Router } from "express";
import { controller } from "../controller/index.js";
import { uploadPDFToMulterMemory } from "../utils/multerStorage.js";

const router = Router();

router.post(
  "/upload-pdf-to-r2",
  uploadPDFToMulterMemory.single("file"),
  controller.uploadPDFToR2
);

router.post("/file-upload", controller.fileUpload);

router.post("/vector-index", controller.vectorIndex);

router.post("/test-document", controller.testDocument);

router.get("/generate-responses", controller.generateResponsesFromAI);

export default router;
