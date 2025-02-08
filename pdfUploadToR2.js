import fs from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";
import pdf from "pdf-parse";
// Read the PDF file as a buffer
const pdfBuffer = fs.readFileSync("./demo.pdf");
const pdfData = await pdf(pdfBuffer);

const uploadFileToR2Bucket = async (file, BucketName) => {
  const payload = filePayload(file, BucketName);
  const uploadResult = await uploadFileToR2(payload, BucketName);

  //* Split key
  const finalResultKey = splitFileKey(uploadResult);

  //* generate file preview url
  const previewUrl = generatePreviewFile(
    process.env.R2_BUCKET_URL,
    process.env.R2_BUCKET_NAME,
    finalResultKey
  );

  //* remove file form local
  if (uploadResult) {
    fs.unlinkSync(file.path);
  }
  return {
    result: uploadResult,
    url: previewUrl,
  };
};

const filePayload = (file, BucketName) => {
  const fileContent = fs.readFileSync(file.path);

  //* R2 storage payload data
  const Payload = {
    Bucket: BucketName,
    Key: `${Date.now()}_${file.originalname}`,
    Body: fileContent,
    ContentType: file.mimetype,
    ACL: "public-read",
  };
  return Payload;
};

const uploadFileToR2 = async (payload, bucketName) => {
  try {
    const uploadCommand = PutObjectPayload(payload);
    const result = await r2.send(uploadCommand);
    result.Key = uploadCommand.input.Key;
    result.ETag = result.ETag ?? "";
    return result;
  } catch (error) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Error uploading file to ${bucketName}: Error uploading file:`
    );
  }
};

const splitFileKey = (uploadResult) => {
  let finalResultKey;
  const modifyKey = uploadResult?.Key?.split("/")[1];
  if (modifyKey) {
    finalResultKey = modifyKey;
    uploadResult.Key = modifyKey;
  } else {
    finalResultKey = uploadResult?.Key;
  }
  return finalResultKey;
};

const generatePreviewFile = (bucketURL, BucketName, finalResultKey) => {
  const previewURL = `${bucketURL}/${BucketName}/${finalResultKey}`;
  return previewURL;
};

const PutObjectPayload = (payload) => {
  return new PutObjectCommand({
    ...payload,
    ACL: payload.ACL,
  });
};

const createS3Client = () => {
  return new S3Client({
    endpoint: `${process.env.R2_BUCKET_URL}/pdf`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    region: "auto",
    forcePathStyle: true,
  });
};

export const r2 = createS3Client();

uploadFileToR2Bucket(pdfData, process.env.R2_BUCKET_NAME);
