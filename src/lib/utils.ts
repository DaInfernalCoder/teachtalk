import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { UpsertRequest, Vector } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertToAscii(inputString: string) {
  //remove any non ascii characters
  const asciiString = inputString.replace(/[^\x00-\x7F]+/g, "");
  return asciiString;
}
