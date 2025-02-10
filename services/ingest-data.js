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
  try {
    // * Step 1: Get the PDF file from the database
    const doc = await PDF.findOne({});
    if (!doc) throw new Error("No PDF found in the database");

    // * Step 2: Fetch the raw PDF data from the stored URL
    const response = await fetch(doc.url);
    if (!response.ok) throw new Error("Failed to fetch PDF");

    // * Step 3: Convert response to Buffer
    const pdfBuffer = await response.arrayBuffer();
    const pdfData = Buffer.from(pdfBuffer);

    // * store path to pdf file
    const path = process.cwd() + "/data/";
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
    fs.writeFileSync(path + "document.pdf", pdfData); // * Temporary storage for processing

    // * Step 4: Load the PDF
    const loader = new PDFLoader(path + "document.pdf");
    const data = await loader.load();

    // * Step 5: Chunk the text
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
    });
    const docs = await textSplitter.splitDocuments(data);
    console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

    // * Step 6: Process the chunks
    console.log("Generating embeddings and storing in MongoDB...");
    const processedChunks = [];

    for (const doc of docs) {
      try {
        const embeddings = await getEmbeddings(doc.pageContent);
        processedChunks.push({ text: doc.pageContent, embedding: embeddings });
      } catch (error) {
        console.error("Error generating embedding:", error);
      }
    }

    // * Step 7: Store chunked data in MongoDB
    await IngestedDocument.create({
      pdfKey: doc.key,
      chunks: processedChunks,
    });

    console.log(
      `Successfully stored ${processedChunks.length} document chunks.`
    );
  } catch (err) {
    console.error(`Error during ingestData execution: ${err.message}`);
  }
}

export default ingestData;
