import { MongoClient } from "mongodb";
import dotenv from "dotenv";
// Connect to your Atlas cluster

/**
 * The purpose of this function is to create a vector index in the Atlas cluster.
 */

// * step 0: loading the environment variables
dotenv.config({ path: ".env" });

// * step 1: connecting to the atlas cluster
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

// * step 2: creating a vector index
async function createVectorIndex() {
  try {
    const database = client.db("rag_db");
    const collection = database.collection("test");

    // * step 3: defining the atlas vector search index
    const index = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            numDimensions: 768,
            path: "embedding",
            similarity: "cosine",
          },
        ],
      },
    };

    // * step 4: calling the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
export default createVectorIndex;
