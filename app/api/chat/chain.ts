import { PromptTemplate } from "@langchain/core/prompts";
import { VectoreStoreRepository } from "@/lib/vectorstore/VectorstoreRepository";
import { ChatOpenAI } from "@langchain/openai";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { LLMResult } from "langchain/schema";
import { Document } from "langchain/document";
import {
    RunnableSequence
  } from "@langchain/core/runnables";
const combineDocumentsFn = (docs: Document[]) => {
    const serializedDocs = docs.map((doc) => doc.pageContent);
    return serializedDocs.join("\n\n");
  };

export async function getChainWithRephrase(chainCompletionCallback?: (output: LLMResult) => Promise<void>) {

    const reformatPrompt = PromptTemplate.fromTemplate(`
Given the following chat history and question, please rephrase the question in such a way, that it can be understood independently of the chat history. 
If the chat history is empty or the question does not seem to be related to the history, please just return the original Question without modifying it in any way.

<Chat History>
{chat_history}
</Chat History>

<Question>
{input}
</Question>
    `);

    const chain = RunnableSequence.from([
        {
            input: (input) => input.input,
            chat_history: (input) => input.chat_history,
        },
        reformatPrompt,
        new ChatOpenAI({
            temperature: 0,
        }),
        new StringOutputParser(),
    ]);

    const prompt =
        PromptTemplate.fromTemplate(`You are Elminster, a all knowing wizard whose purpose is it to answer questions about the rules of Dungeons and Dragons. 
        When you answer questions, please only use the given context. 
        
        Conversation History:
        {chat_history}

        Context: 
        {context}

        Question: 
        {input}`);

    const repo = new VectoreStoreRepository();
    const retriever = await repo.getRetriever(5);

    const retrievalChain = retriever.pipe(combineDocumentsFn);
  
    const newChain = RunnableSequence.from([
        {
            input: chain,
            chat_history: (input) => input.chat_history,
        },
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
          handleLLMEnd: chainCompletionCallback
        }]
      }),
      new HttpResponseOutputParser(),
    ]);

    return newChain;
}

export async function getChain(chainCompletionCallback?: (output: LLMResult) => Promise<void>) {
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
          handleLLMEnd: chainCompletionCallback
        }]
      }),
      new HttpResponseOutputParser(),
    ]);
  
    return chain;
}