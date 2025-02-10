import mongoose from "mongoose";

/**
 * @description Mongoose schema for storing processed PDF text chunks with embeddings.
 */
const ingestedDocumentSchema = new mongoose.Schema({
  pdfUrl: { type: String, required: true, index: true }, // * The key of the original PDF (from R2)
  chunks: [
    {
      text: { type: String, required: true }, // * A chunk of text extracted from the PDF
      embedding: { type: [Number], required: true }, // * Corresponding embedding vector for the chunk
    },
  ],
  createdAt: { type: Date, default: Date.now }, // * Timestamp for when the document was processed
});

/**
 * @description Mongoose model for ingested PDF data.
 */
const IngestedDocument = mongoose.model("IngestedDocument", ingestedDocumentSchema);

export default IngestedDocument;
