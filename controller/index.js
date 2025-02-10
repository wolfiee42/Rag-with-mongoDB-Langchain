import ingestData from "../services/ingest-data.js";
import createVectorIndex from "../services/rag-vector-index.js";
import generateResponses from "../services/generate-responses.js";
import testDocumentRetrieval from "../services/retrieve-documents-test.js";

const method1 = (req, res) => {
  res.json({ message: "Hello World" });
};

// scraping the file and uploading the file to the database
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

// creating the vector index
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

// generateResponses
const generateResponsesFromAI = async (req, res) => {
  const { whoAreYou, input } = req.body;
  try {
    const responses = await generateResponses({ whoAreYou, input });
    res.status(200).json({
      message: "Responses generated",
      response: responses,
    });
  } catch (error) {
    console.error(`Error during generateResponses execution: ${error.message}`);
  }
};

// test Document
const testDocument = async (req, res) => {
  const documents = await testDocumentRetrieval();
  res.status(200).json({
    message: "Documents retrieved",
    response: documents,
  });
};
export const controller = {
  method1,
  fileUpload,
  vectorIndex,
  generateResponsesFromAI,
  testDocument,
};
