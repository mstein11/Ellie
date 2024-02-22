import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function POST(req: Request) {
    console.log("GET /api/chat/init");
    const { content } = await req.json()
    console.log("req1: " + content);


    const repo = new VectoreStoreRepository();
    const retriever = await repo.getRetriever(1);

    const documents = await retriever.getRelevantDocuments(content);
    console.log(documents);

    //return a nextjs Response object
    return new Response(JSON.stringify(documents), {
        headers: {
            'content-type': 'application/json',
        },
    });
}