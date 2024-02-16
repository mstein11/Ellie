import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import data from './rulebook-combat-srd-data';


export async function loadSource(): Promise<Document[]> {

    const splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
        chunkSize: 500,
        chunkOverlap: 0,
    });
    const output = await splitter.createDocuments([data]);
    return output;
}