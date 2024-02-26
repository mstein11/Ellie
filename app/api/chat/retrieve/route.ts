import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export const revalidate = 0

export async function POST(req: Request) {
    console.log("GET /api/chat/init");
    const { content } = await req.json()
    console.log("req1: " + content);


    const repo = new VectoreStoreRepository();
    const retriever = await repo.getRetriever(1);

    const documents = await retriever.getRelevantDocuments(content);

    const res = documents.map(doc => { return { ...doc, id: repo.hashDocument(doc) } });

    return Response.json(res);
}