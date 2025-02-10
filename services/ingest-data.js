import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import getEmbeddings from "./get-embeddings.js";
import fs from "fs";
import PDF from "../models/pdfModel.js";
import IngestedDocument from "../models/ingestedDocumentModel.js";

/**
 * The function `ingestData` fetches a PDF file, splits its text into chunks, generates embeddings for
 * each chunk, and stores the chunked PDF data along with embeddings in MongoDB.
 */
async function ingestData() {
  // * Define the file path for temporary storage
  const folderPath = process.cwd() + "/data/";
  const filePath = folderPath + "document.pdf";

  try {
    // * Step 1: Get the PDF file from the database
    const doc = await PDF.findOne({});
    if (!doc) throw new Error("No PDF found in the database");

    // * Step 2: Fetch the raw PDF data from the stored URL
    const response = await fetch(doc.url);
    if (!response.ok) throw new Error("Failed to fetch PDF from URL");

    // * Step 3: Convert response to Buffer
    const pdfBuffer = await response.arrayBuffer();
    const pdfData = Buffer.from(pdfBuffer);

    // * Ensure the data folder exists, then write the PDF file to disk
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfData);
    console.log("Temporary PDF file saved:", filePath);

    // * Step 4: Load the PDF using PDFLoader
    let data;
    try {
      const loader = new PDFLoader(filePath);
      data = await loader.load();
    } catch (loadError) {
      throw new Error("Error loading PDF file: " + loadError.message);
    }

    // * Step 5: Chunk the text from the PDF file
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
    });
    const docs = await textSplitter.splitDocuments(data);
    console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

    // * Step 6: Process the chunks and generate embeddings
    console.log("Generating embeddings and preparing data for MongoDB...");
    const processedChunks = [];
    for (const chunk of docs) {
      try {
        const embeddings = await getEmbeddings(chunk.pageContent);
        processedChunks.push({ text: chunk.pageContent, embedding: embeddings });
      } catch (embedError) {
        console.error("Error generating embedding for a chunk:", embedError);
      }
    }

    // * Step 7: Store or update chunked data in MongoDB
    const existingIngested = await IngestedDocument.findOne({});
    if (existingIngested) {
      // * Update the existing document
      existingIngested.chunks = processedChunks;
      await existingIngested.save();
      console.log("Existing ingested document updated successfully.");
    } else {
      // * Create a new document if none exists
      await IngestedDocument.create({
        pdfUrl: doc.url,
        chunks: processedChunks,
      });
      console.log("New ingested document created successfully.");
    }

    console.log(`Successfully stored ${processedChunks.length} document chunks.`);
  } catch (err) {
    console.error(`Error during ingestData execution: ${err.message}`);
  } finally {
    // * Step 8: Delete the temporary file after processing
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("Temporary file deleted successfully.");
      } catch (unlinkErr) {
        console.error("Error deleting temporary file:", unlinkErr.message);
      }
    }
  }
}

export default ingestData;
