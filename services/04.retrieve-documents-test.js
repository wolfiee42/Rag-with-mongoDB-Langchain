import { getQueryResults } from "./05.retrieve-documents.js";

async function testDocumentRetrieval() {
  try {
    const query = "What is the purpose of the pdf?";
    const documents = await getQueryResults(query);

    documents.forEach((doc) => {
      console.log(doc.document.pageContent);
    });
  } catch (err) {
    console.log(err.stack);
  }
}
testDocumentRetrieval().catch(console.dir);
