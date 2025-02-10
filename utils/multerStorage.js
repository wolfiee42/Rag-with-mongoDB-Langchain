import multer from "multer";
import path from "path";

export const uploadToMemory = multer({
  storage: multer.memoryStorage(), // * Keep file in memory before uploading
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== ".pdf") {
      return cb(new Error("Only PDFs are allowed"), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 30 * 1024 * 1024 }, // * 30MB limit
});
