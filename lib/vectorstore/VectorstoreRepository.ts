import { Embeddings } from "@langchain/core/embeddings"
import { loadSource } from "./dataloader";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorStore } from "@langchain/core/vectorstores";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { Document } from "langchain/document";
import { metadata } from '../../app/layout';

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
    private sourceLoaders: (() => Promise<{ documents: Document[], ids: string[] | number[] }>)[];
    private supabaseClient: SupabaseClient;
    private loadedVectoreStore: VectorStore;

    constructor(deps?: VectoreStoreRepositoryDeps) {
        this.config = deps?.config ?? { tableName: "documents", functionName: "match_documents" };
        this.sourceLoaders = deps?.sourceLoader ?? [loadSource];
        this.supabaseClient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PRIVATE_KEY!,
        );
        this.loadedVectoreStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
            client: this.supabaseClient,
            tableName: this.config.tableName,
            queryName: this.config.functionName,
        });
    }



    async initStore() {
        console.log(await this.supabaseClient.from(this.config.tableName).delete().neq("id", "0"));

        for (const sourceLoader of this.sourceLoaders) {
            const sourceLoaderResult = await sourceLoader();
            await this.loadedVectoreStore.addDocuments(sourceLoaderResult.documents, { ids: sourceLoaderResult.ids });

            await (this.loadedVectoreStore as SupabaseVectorStore).addDocuments(sourceLoaderResult.documents, { ids: sourceLoaderResult.ids });
        }
    }

    async getRetriever(k: number = 5) {
        //use supabase client to check if entries in database
        const res = await this.supabaseClient.from(this.config.tableName).select('*', { count: 'exact' });
        if (!res.count) {
            await this.initStore();
        }
        if (!this.loadedVectoreStore) {
            throw new Error("Vectorestore need to be loaded, call loadStore first.")
        }
        return this.loadedVectoreStore.asRetriever(k);
    }

    async getAsContent(): Promise<DocumentModel[]> {
        const res = await this.supabaseClient.from(this.config.tableName).select('*');
        return res.data?.sort((docA: any, docB: any) => docA.metadata.loc.lines.from - docB.metadata.loc.lines.from) as DocumentModel[];
    }

    protected getEmbeddings(): Embeddings {
        return new OpenAIEmbeddings();
    }

    protected getName(): string {
        return "OpenAI";
    }
}