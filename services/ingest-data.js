import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoClient } from "mongodb";
import getEmbeddings from "./02.get-embeddings.js";
import * as fs from "fs";

// main function of the operation. i.e. starting of the operation
async function ingestData() {
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

  try {
    // Save online PDF as a file
    const rawData = await fetch(
      "https://pub-5cd27299eac74caa8dfae0dc8ee78e15.r2.dev/test-bucket/Sci.Tech-RevandScience.pdf"
    );
    const pdfBuffer = await rawData.arrayBuffer();
    const pdfData = Buffer.from(pdfBuffer);
    fs.writeFileSync("Sci.Tech-RevandScience.pdf", pdfData);

    const loader = new PDFLoader(`Sci.Tech-RevandScience.pdf`);
    const data = await loader.load();

    // Chunk the text from the PDF
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
    });
    const docs = await textSplitter.splitDocuments(data);
    console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

    // Connect to your Atlas cluster
    await client.connect();
    const db = client.db("rag_db");
    const collection = db.collection("test");

    console.log("Generating embeddings and inserting documents.");
    let docCount = 0;

    // Process documents in batches of 50
    const batchSize = 50;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (doc) => {
          try {
            const embeddings = await getEmbeddings(doc.pageContent);

            // Insert the embeddings and the chunked PDF data into Atlas
            await collection.insertOne({
              document: doc,
              embedding: embeddings,
            });
            docCount += 1;
          } catch (insertError) {
            console.error("Error inserting document:", insertError);
          }
        })
      );
      console.log(`Successfully inserted ${docCount} documents in this batch.`);
    }
    console.log(`Successfully inserted a total of ${docCount} documents.`);
  } catch (err) {
    console.error(`Error during ingestData execution: ${err.message}`);
  } finally {
    await client.close();
  }
}

export default ingestData;
