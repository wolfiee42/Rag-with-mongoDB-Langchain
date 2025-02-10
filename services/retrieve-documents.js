import { MongoClient } from "mongodb";
import getEmbeddings from "./get-embeddings.js";

// Function to get the results of a vector query
export async function getQueryResults(query) {
  // Connect to your Atlas cluster
  const client = new MongoClient(process.env.ATLAS_CONNECTION_STRING);

  try {
    // Get embeddings for a query
    const queryEmbeddings = await getEmbeddings(query);

    await client.connect();
    const db = client.db("test");
    const collection = db.collection("ingesteddocuments");

    const pipeline = [
      {
        $vectorSearch: {
          index: "vector_index_v1",
          queryVector: queryEmbeddings,
          path: "chunks.embedding",
          exact: true,
          limit: 5,
        },
      },
      {
        $project: {
          _id: 0,
          chunks: 1,
        },
      },
    ];

    // Retrieve documents from Atlas using this Vector Search query
    const result = collection.aggregate(pipeline);

    const arrayOfQueryDocs = [];
    for await (const doc of result) {
      arrayOfQueryDocs.push(doc);
    }
    return arrayOfQueryDocs;
  } catch (err) {
    console.log(err.stack);
  } finally {
    await client.close();
  }
}
