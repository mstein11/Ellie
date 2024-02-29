import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export const fetchCache = 'force-no-store';

export async function GET() {
    console.log("GET /api/content");

    const repo = new VectoreStoreRepository();
    const content = await repo.getAsContent();
    const responseData = content.map(doc => { return { id: doc.id.trim(), content: doc.content } });
    return Response.json(responseData);
}