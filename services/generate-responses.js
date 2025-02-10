import { getQueryResults } from "./retrieve-documents.js";
import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function generateResponses({ whoAreYou, input }) {
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

    // const input =
    //   "can you explain the importance of the topic in our life based on the given context? make it short and concise and bullet points";
    // const whoAreYou =
    //   "You are a scientist who is an expert in the field of science and technology. and recently published a paper on the topic of quran in science and technology. and your publish paper is attacted to you by the context. ";

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
