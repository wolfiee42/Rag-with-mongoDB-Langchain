import { s3 } from "../utils/s3Client.js";
import mongoose from "mongoose";
import ingestData from "../services/ingest-data.js";
import createVectorIndex from "../services/rag-vector-index.js";
import generateResponses from "../services/generate-responses.js";
import testDocumentRetrieval from "../services/retrieve-documents-test.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import PDF from "../models/pdfModel.js";
import WhoAreYou from "../models/whoareyouModel.js";

// * file upload
const uploadPDFToR2 = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // * Upload the PDF to R2
    const key = `pdfs/${Date.now()}_${req.file.originalname}`;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: "application/pdf",
    };

    await s3.send(new PutObjectCommand(params));

    // * Construct the file's public URL
    const r2PublicURL = `${process.env.BUCKET_URL}/${key}`;

    // * Check if a PDF already exists in the database within the session
    const existingPDF = await PDF.findOne({}, null, { session });

    if (existingPDF) {
      // * If PDF exists, update the existing record
      existingPDF.key = key;
      existingPDF.url = r2PublicURL;
      await existingPDF.save({ session });

      await session.commitTransaction();
      return res.json({
        message: "PDF updated successfully",
        key,
        url: r2PublicURL,
      });
    }

    // * If it doesn't exist, create a new record in the database
    const newPDF = new PDF({
      key,
      url: r2PublicURL,
      uploadedAt: new Date(),
    });

    await newPDF.save({ session });

    // * Commit the transaction
    await session.commitTransaction();
    res.json({ message: "PDF Stored Successfully", key, url: r2PublicURL });
  } catch (error) {
    // * Abort transaction in case of error
    await session.abortTransaction();
    res.status(500).json({ error: error.message });
  } finally {
    // * Always end the session
    session.endSession();
  }
};

// * scraping the file and uploading the file to the database
const fileUpload = async (req, res) => {
  try {
    const uploadingFile = await ingestData();
    // because void returns undefined, we need to check if it's not undefined
    if (!uploadingFile) {
      res.json({ message: "File uploaded" });
    }
  } catch (err) {
    console.error(`Error during ingestData execution: ${err.message}`);
    res.status(500).json({
      message: "An error occurred during file upload",
      error: err.message,
    });
  }
};

// * creating the vector index
const vectorIndex = async (req, res) => {
  try {
    const vectorIndex = await createVectorIndex();
    if (vectorIndex) {
      res.json({ message: "Vector index created" });
    }
  } catch (error) {
    console.error(`Error during createVectorIndex execution: ${error.message}`);
    res.status(500).json({
      message: "An error occurred during vector index creation",
      error: error.message,
      response: "Already Index created.",
    });
  }
};

// * generateResponses
const generateResponsesFromAI = async (req, res) => {
  const { whoAreYou, input } = req.body;
  try {
    const responses = await generateResponses({ whoAreYou, input });
    res.status(200).json({
      message: "Responses generated",
      response: responses,
    });
  } catch (error) {
    console.error(`Error during generateResponses execution: ${error.message}`);
  }
};

// * test Document
const testDocument = async (req, res) => {
  const documents = await testDocumentRetrieval();
  res.status(200).json({
    message: "Documents retrieved",
    response: documents,
  });
};

// * create or update a whoAreYou
const createOrUpdateWhoAreYou = async (req, res) => {
  const { whoAreYou } = req.body;

  try {
    // Find the existing prompt and update it, or create a new one if none exists.
    const prompt = await WhoAreYou.findOneAndUpdate(
      {}, // empty query matches the first document found (assuming only one prompt exists)
      { whoAreYou },
      { new: true, upsert: true } // new: return the updated document; upsert: create if not found
    );

    res.status(200).json({
      message: "Prompt created or updated successfully",
      response: prompt,
    });
  } catch (error) {
    console.error(
      `Error during createOrUpdateWhoAreYou execution: ${error.message}`
    );
    res.status(500).json({
      message: "An error occurred while creating or updating the prompt",
      error: error.message,
    });
  }
};

export const controller = {
  fileUpload,
  vectorIndex,
  generateResponsesFromAI,
  testDocument,
  uploadPDFToR2,
  createOrUpdateWhoAreYou,
};
