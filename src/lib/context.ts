import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  //Search query for top 5 vectors and return the top 5 vectors
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = await pc.index("teachtalk");

  try {
    const namespace = convertToAscii(fileKey);
    const queryResponse = await index.query({
      vector: embeddings,
      topK: 5,
      includeMetadata: true,
    });
    return queryResponse.matches || {};
  } catch (error) {
    console.log("error querying embeddings, src/lib/context.ts", error);
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(
    queryEmbeddings as number[],
    fileKey
  );

  const qualifyingDocs = matches?.filter(
    (match) => match.score && match.score > 0.7
  );

  type MetaData = {
    text: string; 
    pageNumber: number;
  }

  let docs = qualifyingDocs?.map(match => (match.metadata as MetaData).text) || [];
  // 5 vectors joined
  return docs.join("\n").substring(0, 3000);
}
