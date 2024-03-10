import { loadSource } from "./dataloader";
import { OpenAIEmbeddings } from "@langchain/openai";
import { VectorStore } from "@langchain/core/vectorstores";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma'
import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { Document } from "langchain/document";
import { Prisma, PrismaClient, Document as DocumentEntity } from '@prisma/client'


export interface DocumentModel {
    id: string
    content: string,
    metadata: any,
    embeddings: any
}


export interface VectoreStoreRepositoryDeps {
    sourceLoader?: (() => Promise<{ documents: Document[], ids: number[] }>)[],
    config?: VectoreStoreRepositoryConfig
}

export interface LoadSourceResult {
    paragraphs: string[]
    metadata: any[]
}

export interface VectoreStoreRepositoryConfig {
    tableName: string,
    functionName: string
}

export class VectoreStoreRepository {

    private config: VectoreStoreRepositoryConfig;
    private loadedVectoreStore: VectorStore;

    constructor(deps?: VectoreStoreRepositoryDeps) {
        this.config = deps?.config ?? { tableName: "documents", functionName: "match_documents" };

        const prisma = new PrismaClient();
        this.loadedVectoreStore = PrismaVectorStore.withModel<DocumentEntity>(prisma).create(
            new OpenAIEmbeddings(),
            {
              prisma: Prisma,
              tableName: 'Document',
              vectorColumnName: 'embedding',
              columns: {
                id: PrismaVectorStore.IdColumn,
                content: PrismaVectorStore.ContentColumn
              }
            }
          )
    }

    async getRetriever(k: number = 5) {
        return this.loadedVectoreStore.asRetriever(k);
    }
    
    protected getEmbeddings(): OpenAIEmbeddings {
        return new OpenAIEmbeddings();
    }

    protected getName(): string {
        return "OpenAI";
    }
}