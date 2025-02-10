import { pipeline } from "@xenova/transformers";

// Function to generate embeddings for a given data source

/**
 * The purpose of this function is to convert input data (like text) into numerical
 * representations (embeddings) that can be used for various machine learning tasks,
 * such as similarity comparison, clustering, or as input features for other models.
 */

async function getEmbedding(data) {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/nomic-embed-text-v1"
  );
  const results = await embedder(data, { pooling: "mean", normalize: true });
  return Array.from(results.data);
}

export default getEmbedding;
