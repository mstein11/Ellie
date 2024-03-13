import { StreamingTextResponse, Message as VercelChatMessage } from 'ai'
import { type LLMResult } from "langchain/schema";

import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { VectoreStoreRepository } from '@/lib/vectorstore/VectorstoreRepository';
import { Document } from "langchain/document";


import { HttpResponseOutputParser } from "langchain/output_parsers";
import {
  RunnableSequence
} from "@langchain/core/runnables";
import { auth } from '@/auth'
import { nanoid } from '@/lib/utils';
import { kv } from '@vercel/kv';

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join("\n\n");
};

const saveChat = async (json: any, userId: string, content: string) => {
  const title = json.messages[0].content.substring(0, 100)
  const id = json.id ?? nanoid()
  const createdAt = Date.now()
  const path = `/chat/${id}`
  const payload = {
    id,
    title,
    userId,
    createdAt,
    path,
    messages: [
      ...json.messages,
      {
        content: content,
        role: 'assistant'
      }
    ]
  }
  await kv.hmset(`chat:${id}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${id}`
  })
}

const withLangchain = async (json: any) => {

  const userId = (await auth())?.user.id

  const repo = new VectoreStoreRepository();
  const retriever = await repo.getRetriever(5);

  const prompt =
    PromptTemplate.fromTemplate(`You are Elminster, a all knowing wizard whose purpose is it to answer questions about the rules of Dungeons and Dragons. 
    When you answer questions, please only use the given context. 
    
    Conversation History:
    {chat_history}

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
      chat_history: (input) => input.chat_history,
    },
    prompt,
    new ChatOpenAI({
      temperature: 0,
      callbacks: [{
        handleLLMEnd: async (output: LLMResult) => {
          if (userId) {
            console.log("saving chat")
            await saveChat(json, userId ?? "no-id", output.generations[0][0].text)
          } else {
            console.log("no user id found, not saving chat")
          }
        },
      }]
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
  const { messages } = json

  const chain = await withLangchain(json);

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  var stream = await chain.stream({
    input: currentMessageContent,
    chat_history: formattedPreviousMessages.join("\n")
  })
  return new StreamingTextResponse(stream)
}
