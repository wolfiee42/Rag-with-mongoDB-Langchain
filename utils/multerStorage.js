import multer from "multer";
import path from "path";

// * multer memory storage, it will store file in memory before uploading to r2
export const uploadPDFToMulterMemory = multer({
  storage: multer.memoryStorage(), // * Keep file in memory before uploading
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(new Error("Only PDFs are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 200 * 1024 * 1024 }, // * 200MB limit
});
