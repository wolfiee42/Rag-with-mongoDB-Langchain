import { MongoClient } from "mongodb";

// Connect to your Atlas cluster
const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

// creating a vector index
async function createVectorIndex() {
  try {
    const database = client.db("rag_db");
    const collection = database.collection("test");

    // Define your Atlas Vector Search index
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

    // Call the method to create the index
    const result = await collection.createSearchIndex(index);
    console.log(result);
  } finally {
    await client.close();
  }
}
createVectorIndex().catch(console.dir);
