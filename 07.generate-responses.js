import { getQueryResults } from "./05.retrieve-documents.js";
import { HfInference } from "@huggingface/inference";

async function generateResponses() {
  try {
    // Specify search query and retrieve relevant documents
    const query = "Context";
    const documents = await getQueryResults(query);

    // Build a string representation of the retrieved documents to use in the prompt
    let textDocuments = "";
    documents.forEach((doc) => {
      textDocuments += doc.document.pageContent;
    });
    const question =
      "can you explain the importance of the topic in our life based on the given context? make it short and concise and bullet points";

    // Create a prompt consisting of the question and context to pass to the LLM
    const prompt = `Answer the following question based on the given context.
            Question: {${question}}
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
  } catch (err) {
    console.log(err.stack);
  }
}
generateResponses().catch(console.dir);
