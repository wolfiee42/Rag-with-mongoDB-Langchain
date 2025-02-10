import ingestData from "../services/ingest-data.js";
import createVectorIndex from "../services/rag-vector-index.js";
const method1 = (req, res) => {
  res.json({ message: "Hello World" });
};

const fileUpload = async (req, res) => {
  try {
    const uploadingFile = await ingestData();
    // because void returns undefined, we need to check if it's not undefined
    if (!uploadingFile) {
      res.json({ message: "File uploaded" });
    }
  } catch (err) {
    console.error(`Error during ingestData execution: ${err.message}`);
    res.status(500).json({
      message: "An error occurred during file upload",
      error: err.message,
    });
  }
};

const vectorIndex = async (req, res) => {
  try {
    const vectorIndex = await createVectorIndex();
    if (vectorIndex) {
      res.json({ message: "Vector index created" });
    }
  } catch (error) {
    console.error(`Error during createVectorIndex execution: ${error.message}`);
    res.status(500).json({
      message: "An error occurred during vector index creation",
      error: error.message,
      response: "Already Index created.",
    });
  }
};

export const controller = { method1, fileUpload, vectorIndex };
