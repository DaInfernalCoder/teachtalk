import {
  Index,
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3.server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import md5 from "md5";
import { convertToAscii } from "./utils";

let pinecone: Pinecone | null = null;
const api = process.env.PINECONE_API_KEY || "";

export const getPineconeClient = () => {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: api,
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> download and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name as string);
  const pages = (await loader.load()) as PDFPage[];
  console.log(`Number of pages loaded from PDF: ${pages.length}`);

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));
  const flattenedComponents =
    "flattened components: " + documents.flat().length;
  
    // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));
  console.log(`Number of vectors created: ${vectors.length}`);
  
  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("teachtalk");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  try {
    await namespace.upsert(vectors);
    console.log("vectors: " + vectors.length);
    return documents[0];
  } catch (error) {
    console.log("error inserting vectors into pinecone", error);
    throw error;
  }
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  let { pageContent, metadata } = page;
  pageContent = pageContent.replace(/\n/g, "");
  // split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
