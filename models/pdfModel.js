import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const PDF = mongoose.model("PDF", pdfSchema);
export default PDF;
