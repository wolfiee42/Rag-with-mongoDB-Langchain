import ingestData from "../services/ingest-data.js";

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

export const controller = { method1, fileUpload };
