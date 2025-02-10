import { s3 } from "../utils/s3Client.js";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const method1 = (req, res) => {
  res.json({ message: "Hello World" });
};

/**
 * @description Uploads a PDF to R2 bucket
 * @param {Object} req - Get a pdf file from the request (stored in req.file)
 * @param {Object} res - Send a response to the client with the key of the uploaded file when successful, or an error message if unsuccessful
 * @returns {Promise<void>} - Returns a promise that resolves when the file is uploaded successfully
 */
const r2PDFUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // * Step 1: Define the parameters for the PutObjectCommand with the file buffer and a unique key
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `pdfs-${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: "application/pdf",
    };
    // * Step 2: Create a PutObjectCommand with the parameters
    const command = new PutObjectCommand(params);
    // * Step 3: Send the command to the S3 client
    const result = await s3.send(command);
    console.log("Upload result:", result);
    res.json({ message: "Upload successful", key: params.Key });
  } catch (error) {
    console.log("Error uploading to S3:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * @description Retrieves a signed URL for downloading a PDF from the R2 bucket using the specified key.
 * @param {Object} req - The request object containing parameters, including the key of the PDF.
 * @param {Object} res - The response object used to send the signed URL or an error message back to the client.
 * @returns {Promise<void>} - Returns a promise that resolves when the signed URL is successfully generated or an error occurs.
 */

const r2PDFGet = async (req, res) => {
  try {
    const { key } = req.params;
    if (!key) return res.status(400).send("No key provided");

    // * Step 1: Define the parameters for the GetObjectCommand with the specified key
    const params = { Bucket: process.env.BUCKET_NAME, Key: key };
    // * Step 2: Create a GetObjectCommand with the parameters
    const command = new GetObjectCommand(params);
    // * Step 3: Generate a signed URL using the GetObjectCommand and the S3 client
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // * 3600 seconds = 1 hour
    console.log("Generated signed URL:", url);
    res.json({ url });
  } catch (error) {
    console.log("Error getting URL:", error);
    res.status(500).json({ error: error.message });
  }
};

export const controller = { method1, r2PDFUpload, r2PDFGet };
