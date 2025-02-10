import { s3 } from "../utils/s3Client.js";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const method1 = (req, res) => {
  res.json({ message: "Hello World" });
};

const r2PDFUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `pdfs-${Date.now()}_${req.file.originalname}`,
      Body: req.file.buffer,
      ContentType: "application/pdf",
    };
    console.log("Params:", params);
    const result = await s3.send(new PutObjectCommand(params));
    console.log("Upload result:", result);

    res.json({ message: "Upload successful", key: params.Key });
    console.log("Upload successful");
  } catch (error) {
    console.log("Error uploading to S3:", error);
    res.status(500).json({ error: error.message });
  }
};

const r2PDFGet = async (req, res) => {
  try {
    const params = { Bucket: process.env.BUCKET_NAME, Key: req.params.key };
    const command = new GetObjectCommand(params);
    console.log("Command:", command);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    console.log("URL:", url);
    res.json({ url });
  } catch (error) {
    console.log("Error getting URL:", error);
    res.status(500).json({ error: error.message });
  }
};

export const controller = { method1, r2PDFUpload, r2PDFGet };
