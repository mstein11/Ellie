import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function GET() {
    console.log("GET /api/content");

    const repo = new VectoreStoreRepository({ config: { tableName: "documents_unittest", functionName: "match_documents_unittest" } });
    const content = await repo.getAsContent();
    //return a nextjs Response object
    const responseData = content.map(doc => { return { id: doc.id, content: doc.content } });
    return Response.json(responseData);
}