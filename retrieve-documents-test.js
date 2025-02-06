import { getQueryResults } from "./retrieve-documents.js";

async function run() {
  try {
    const query = "What is the purpose of the document?";
    const documents = await getQueryResults(query);

    documents.forEach((doc) => {
      console.log(doc.document.pageContent);
    });
  } catch (err) {
    console.log(err.stack);
  }
}
run().catch(console.dir);
