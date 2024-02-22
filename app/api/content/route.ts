import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function GET(req: Request) {


    const repo = new VectoreStoreRepository({ config: { tableName: "documents_unittest", functionName: "match_documents_unittest" } });
    const content = await repo.getAsContent();
    //return a nextjs Response object
    const responseString = JSON.stringify(content.map(doc => { return { id: doc.id, content: doc.content } }));
    return new Response(responseString, {
        headers: {
            'content-type': 'application/json',
        },
    });
}