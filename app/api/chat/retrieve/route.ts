import { getrephraseQuestionChain } from "@/lib/langchains/rephraseQuestionChain";
import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";


function sanitizeHeading(heading: string) {
    return heading.replace(/[^a-zA-Z0-9 ()]/g, '').replace(/\s+/g, ' ').trim();
}


export interface ApiResonseDocumentRetrieval
{
    id: string;
    pageContent: string;
    parentHeadings: string[];
}

export async function POST(req: Request) {
    const { newMessage, messages } = await req.json()
    const repo = new VectoreStoreRepository();
    const retriever = repo.getRetriever(5);

    const rephraseQuestionChain = getrephraseQuestionChain();

    const rephrasedQuestion = await rephraseQuestionChain.invoke({ input: newMessage, chat_history: messages });
    const documents = await retriever.getRelevantDocuments(rephrasedQuestion);


    const res = await Promise.all(documents.map(async doc => { 
        const fullDoc = await repo.getDocumentFromDb(doc.metadata.id);
        return { 
            id: doc.metadata.id, 
            pageContent: doc.pageContent, 
            parentHeadings: (fullDoc?.metadata as any).parentHeadings?.map(sanitizeHeading) || []
        } as ApiResonseDocumentRetrieval 
    }));
    return Response.json(res);
}