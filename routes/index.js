import { Router } from "express";
import { controller } from "../controller/index.js";
import { uploadPDFToMulterMemory } from "../utils/multerStorage.js";

const router = Router();

router.get("/init", controller.method1);
// * upload pdf with multer ans aws s3 to r2, after successful  upload, return the key
router.post(
  "/upload-pdf",
  uploadPDFToMulterMemory.single("file"),
  controller.r2PDFUpload
);
// * get pdf from r2 by key (returned by previous endpoint)
router.get("/get-pdf/:key", controller.r2PDFGet);

export default router;
