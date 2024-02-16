import { Embeddings } from "@langchain/core/embeddings"
import { loadSource } from "./rulebook-combat.srd/rulebook-combat-srd";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorStore } from "@langchain/core/vectorstores";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { SupabaseClient, createClient } from "@supabase/supabase-js"
import { Document } from "langchain/document";



export interface VectoreStoreRepositoryDeps {
    sourceLoader: (() => Promise<Document[]>)[]
}

export interface LoadSourceResult {
    paragraphs: string[]
    metadata: any[]
}

export class VectoreStoreRepository {

    private sourceLoaders: (() => Promise<Document[]>)[];

    private supabaseClient: SupabaseClient;

    private loadedVectoreStore: VectorStore;

    constructor(deps = {
        sourceLoader: [loadSource],
        //sourceLoader: loadSunlessCitadelV2
    } as VectoreStoreRepositoryDeps) {
        this.sourceLoaders = deps.sourceLoader;
        this.supabaseClient = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PRIVATE_KEY!,
        );
        this.loadedVectoreStore = new SupabaseVectorStore(new OpenAIEmbeddings(), {
            client: this.supabaseClient,
            tableName: "documents",
            queryName: "match_documents",
        });
    }



    async initStore() {
        console.log(await this.supabaseClient.from("documents").delete().neq("id", "0"));

        for (const sourceLoader of this.sourceLoaders) {
            const sourceLoaderResult = await sourceLoader();
            this.loadedVectoreStore.addDocuments(sourceLoaderResult);
        }
    }

    async getRetriever(k: number = 5) {
        //use supabase client to check if entries in database
        const res = await this.supabaseClient.from("documents").select('*', { count: 'exact' });
        if (!res.count) {
            await this.initStore();
        }
        if (!this.loadedVectoreStore) {
            throw new Error("Vectorestore need to be loaded, call loadStore first.")
        }
        return this.loadedVectoreStore.asRetriever(k);
    }

    protected getEmbeddings(): Embeddings {
        return new OpenAIEmbeddings();
    }

    protected getName(): string {
        return "OpenAI";
    }
}