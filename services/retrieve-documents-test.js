/**
 * The function `testDocumentRetrieval` retrieves documents based on a query and logs the page content
 * of each document.
 */
import { getQueryResults } from "./retrieve-documents.js";

async function testDocumentRetrieval() {
  try {
    const query = "What is the purpose of the pdf?";
    const documents = await getQueryResults(query);

    documents.forEach((doc) => {
      console.log("Text: ", doc?.chunks?.text);
      console.log('Embedding: ', doc?.chunks?.embedding);
    });
  } catch (err) {
    console.log(err.stack);
  }
}
export default testDocumentRetrieval;
