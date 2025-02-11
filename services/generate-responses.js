import { getQueryResults } from "./retrieve-documents.js";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";
import WhoAreYou from "../models/whoareyouModel.js";

dotenv.config({ path: ".env" });

async function generateResponses({ input }) {
  try {
    // Specify search query and retrieve relevant documents
    const query = "Context";
    const documents = await getQueryResults(query);
    console.log("documents", documents);

    // Build a string representation of the retrieved documents to use in the prompt
    let textDocuments = "";
    documents.forEach((document) => {
      document.chunks.forEach((chunk) => {
        textDocuments += chunk.text + "\n";
      });
    });
    console.log("textDocuments", textDocuments);

    const whoAreYouData = await WhoAreYou.findOne({});
    const whoAreYou = whoAreYouData?.whoAreYou;
    console.log("whoAreYou", whoAreYou);
   

    // Create a prompt consisting of the question and context to pass to the LLM
    const prompt = `Analysis the given input, based on the given context.
            Who are you? : {${whoAreYou}}
            Input: {${input}}
            Context: {${textDocuments}}
        `;
    // Connect to Hugging Face, using the access token from the environment file
    const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);
    const llm = hf.endpoint(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"
    );
    // Prompt the LLM to answer the question using the
    // retrieved documents as the context
    const output = await llm.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.2",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    // Output the LLM's response as text.
    console.log(output.choices[0].message.content);
    return output.choices[0].message.content;
  } catch (err) {
    console.log(err.stack);
  }
}
export default generateResponses;
