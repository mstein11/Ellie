import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function POST(req: Request) {
    const { content } = await req.json()

    const repo = new VectoreStoreRepository();
    const retriever = await repo.getRetriever(1);

    const documents = await retriever.getRelevantDocuments(content);
    const res = documents.map(doc => { return { ...doc, id: doc.metadata.id } });

    return Response.json(res);
}