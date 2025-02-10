import { s3 } from "../utils/s3Client.js";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mongoose from "mongoose";
import pdfModel from "../utils/pdfModel.js";
import ingestData from "../services/ingest-data.js";
import createVectorIndex from "../services/rag-vector-index.js";
import generateResponses from "../services/generate-responses.js";
import testDocumentRetrieval from "../services/retrieve-documents-test.js";

const uploadPDFToR2 = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // * Upload the PDF to R2
    const key = `pdfs/${Date.now()}_${req.file.originalname}`;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: "application/pdf",
    };

    await s3.send(new PutObjectCommand(params));

    // * Get the public URL of the uploaded PDF
    const r2PublicURL = `${process.env.BUCKET_URL}/${key}`;

    // * first check if the pdf already exists in the database
    const existingPDF = await pdfModel.findOne();
    // * If it does, update the existing record
    if (existingPDF) {
      existingPDF.key = key;
      existingPDF.url = r2PublicURL;

      await existingPDF.save();

      await session.commitTransaction();
      session.endSession();
      return res.json({
        message: "PDF updated successfully",
        key,
        url: r2PublicURL,
      });
    }

    // * If it doesn't, create a new record in the database
    const pdfData = new pdfModel({
      key,
      url: r2PublicURL,
      uploadedAt: new Date(),
    });

    await pdfData.save({ session });

    // * Step 4: Commit the transaction if everything succeeds
    await session.commitTransaction();
    session.endSession();

    res.json({ message: "PDF Stored Successfully", key, url: r2PublicURL });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error uploading to R2:", error);
    res.status(500).json({ error: error.message });
  }
};

// scraping the file and uploading the file to the database
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

// creating the vector index
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

// generateResponses
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

// test Document
const testDocument = async (req, res) => {
  const documents = await testDocumentRetrieval();
  res.status(200).json({
    message: "Documents retrieved",
    response: documents,
  });
};
export const controller = {
  fileUpload,
  vectorIndex,
  generateResponsesFromAI,
  testDocument,
  uploadPDFToR2,
};
