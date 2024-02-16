import { StreamingTextResponse, Message as VercelChatMessage } from 'ai/dist'

import { PromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { VectoreStoreRepository } from '@/lib/vectorstore/VectorstoreRepository';
import { Document } from "langchain/document";


import { HttpResponseOutputParser } from "langchain/output_parsers";
import {
  RunnableSequence
} from "langchain/schema/runnable";
import { auth } from '@/auth'

export const runtime = 'edge'

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const withLangchain = async (question: string) => {

  const repo = new VectoreStoreRepository();
  const retriever = await repo.getRetriever(5);

  console.log(await retriever.getRelevantDocuments(question));

  const prompt =
    PromptTemplate.fromTemplate(`You are Elminster, a all knowing wizard whose purpose is it to answer questions about the rules of Dungeons and Dragons. 
    When you answer questions, please only use the given context. 
    
    Context: 
    {context}

    Question: 
    {input}`);

  const retrievalChain = retriever.pipe(combineDocumentsFn);

  const chain = RunnableSequence.from([
    {
      context: RunnableSequence.from([
        (input) => input.input,
        retrievalChain,
      ]),
      input: (input) => input.input,
    },
    prompt,
    new ChatOpenAI({
      temperature: 0
    }),
    new HttpResponseOutputParser(),
  ]);

  return chain;
}

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const userId = (await auth())?.user.id
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;


  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (previewToken) {
    openai.apiKey = previewToken
  }


  //the above OpenAIStream but now with langchain follows here

  const chain = await withLangchain(currentMessageContent);

  var stream = await chain.stream({
    input: currentMessageContent,
    chat_history: formattedPreviousMessages.join("\n")
  })
  return new StreamingTextResponse(stream)
}



// const res = await openai.chat.completions.create({
//   model: 'gpt-3.5-turbo',
//   messages,
//   temperature: 0.7,
//   stream: true
// })



// const stream = OpenAIStream(res, {
//   async onCompletion(completion) {
//     const title = json.messages[0].content.substring(0, 100)
//     const id = json.id ?? nanoid()
//     const createdAt = Date.now()
//     const path = `/chat/${id}`
//     const payload = {
//       id,
//       title,
//       userId,
//       createdAt,
//       path,
//       messages: [
//         ...messages,
//         {
//           content: completion,
//           role: 'assistant'
//         }
//       ]
//     }
//     await kv.hmset(`chat:${id}`, payload)
//     await kv.zadd(`user:chat:${userId}`, {
//       score: createdAt,
//       member: `chat:${id}`
//     })
//   }
// })
