import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

// * load env variables
dotenv.config({ path: ".env" });

export const s3 = new S3Client({
  region: process.env.REGION,
  endpoint: process.env.ENDPOINT,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});
