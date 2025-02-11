import { MongoClient } from "mongodb";
import dotenv from "dotenv";

// * step 0: loading the environment variables
dotenv.config({ path: ".env" });

/**
 * The purpose of this function is to create a vector index in the Atlas cluster.
 */
async function createVectorIndex() {
  // * step 1: connecting to the atlas cluster
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);
  try {
    const db = client.db("test");
    const collection = db.collection("ingesteddocuments");
    console.log("creating vector index");
    // * step 3: defining the atlas vector search index
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            numDimensions: 768,
            path: "chunks.embedding", // * Updated to match ingesteddocument model (embeddings stored in each chunk)
            similarity: "cosine",
          },
        ],
      },
    };

    // * step 4: calling the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log("Vector index created:", result);
    return result;
  } finally {
    await client.close();
  }
}

export default createVectorIndex;
