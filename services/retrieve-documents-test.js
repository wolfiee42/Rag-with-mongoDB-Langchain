/**
 * The function `testDocumentRetrieval` retrieves documents based on a query and logs the page content
 * of each document.
 */
import { getQueryResults } from "./retrieve-documents.js";

async function testDocumentRetrieval() {
  try {
    const query = "What is the purpose of the pdf?";
    const documents = await getQueryResults(query);

    let textDocuments = "";
    documents.forEach((document) => {
      document.chunks.forEach((chunk) => {
        textDocuments += chunk.text + "\n";
      });
    });
    console.log("textDocuments", textDocuments);

    return textDocuments;
  } catch (err) {
    console.log(err.stack);
  }
}
export default testDocumentRetrieval;
