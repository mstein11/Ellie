import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function GET(req: Request, res: Response) {
    return res.end('This is not a valid GET endpoint');
}
export async function POST(req: Request, res: Response) {
    const repo = new VectoreStoreRepository();
    repo.initStore();

    //return status code 200 and a message saying ok
    return res.end('ok');
}