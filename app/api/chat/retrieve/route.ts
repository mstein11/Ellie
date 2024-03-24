import { getrephraseQuestionChain } from "@/lib/langchains/rephraseQuestionChain";
import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";

export async function POST(req: Request) {
    const { newMessage, messages } = await req.json()
    const repo = new VectoreStoreRepository();
    const retriever = repo.getRetriever(1);

    const rephraseQuestionChain = getrephraseQuestionChain();

    const rephrasedQuestion = await rephraseQuestionChain.invoke({ input: newMessage, chat_history: messages });
    const documents = await retriever.getRelevantDocuments(rephrasedQuestion);

    const res = documents.map(doc => { return { ...doc, id: doc.metadata.id } });

    return Response.json(res);
}