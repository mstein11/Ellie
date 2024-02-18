import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function GET(req: Request) {

}
export async function POST(req: Request) {
    const repo = new VectoreStoreRepository();
    repo.initStore();

}