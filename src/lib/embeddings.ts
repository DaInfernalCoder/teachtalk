import { OpenAIApi, Configuration } from "openai-edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openapi = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    if (!text) {
      throw new Error("Input text is undefined or empty");
    }
    //create embedding- text as an array of numbers
    const response = await openapi.createEmbedding({
      model: "text-embedding-ada-002",
      input: text.replace(/\n/g, " "),
    });

    if (!response.ok) {
      console.error(
        "Failed to get embeddings, status:",
        response.status,
        "response:",
        await response.text()
      );
      throw new Error(`Failed to get embeddings, status: ${response.status}`);
    }

    //convert response to json
    const result = await response.json();
    return result.data[0].embedding as number[];
  } catch (error) {
    console.error("error in embeddings.ts- get openai api embeddings", error);
    return error;
  }
}
