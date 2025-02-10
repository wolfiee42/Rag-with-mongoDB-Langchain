import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MongoClient } from "mongodb";
import getEmbeddings from "./get-embeddings.js";
import * as fs from "fs";

// main function of the operation. i.e. starting of the operation

/**
 * The function `ingestData` fetches a PDF file, splits its text into chunks, generates embeddings for
 * each chunk, and inserts the chunked PDF data along with embeddings into an Atlas cluster in batches.
 */
async function ingestData() {
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

  try {
    // * step 1: getting the pdf file from the r2 bucket
    const rawData = await fetch(
      "https://pub-5cd27299eac74caa8dfae0dc8ee78e15.r2.dev/test-bucket/Sci.Tech-RevandScience.pdf"
    );

    // * step 2: writing the pdf file to the local machine
    const pdfBuffer = await rawData.arrayBuffer();
    const pdfData = Buffer.from(pdfBuffer);
    fs.writeFileSync("Sci.Tech-RevandScience.pdf", pdfData); //! should be changed to the website's concept name

    // * step 3: loading the pdf file
    const loader = new PDFLoader(`Sci.Tech-RevandScience.pdf`); //! should be changed to the website's concept name
    const data = await loader.load();

    // * step 4: chunking the text from the pdf file
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 20,
    });

    // * step 5: splitting the text into chunks
    const docs = await textSplitter.splitDocuments(data);
    console.log(`Successfully chunked the PDF into ${docs.length} documents.`);

    // * step 6: connecting to the atlas cluster
    await client.connect();
    const db = client.db("rag_db");
    const collection = db.collection("test");

    // * step 7: processing the documents in batches of 50 so that it doesn't overload the memory
    console.log("Generating embeddings and inserting documents.");
    let docCount = 0;

    // * step 8: processing the documents in batches of 50 so that it doesn't overload the memory
    const batchSize = 50;
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (doc) => {
          try {
            const embeddings = await getEmbeddings(doc.pageContent);

            // * step 9: inserting the embeddings and the chunked PDF data into the atlas
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
