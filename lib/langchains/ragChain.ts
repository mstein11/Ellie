import { PromptTemplate } from '@langchain/core/prompts'
import { VectoreStoreRepository } from '@/lib/vectorstore/VectorstoreRepository'
import { ChatOpenAI } from '@langchain/openai'
import { HttpResponseOutputParser } from 'langchain/output_parsers'
import { Document } from 'langchain/document'
import { RunnableSequence } from '@langchain/core/runnables'
import { LLMResult } from 'langchain/schema'

const combineDocumentsFn = (docs: Document[]) => {
  const serializedDocs = docs.map(doc => doc.pageContent)
  return serializedDocs.join('\n\n')
}

const prompt =
  PromptTemplate.fromTemplate(`You are Ellie, a all knowing wizard whose purpose is it to answer questions about the rules of Dungeons and Dragons. 
When you answer questions, please only use the given context. 

Conversation History:
{chat_history}

Context: 
{context}

Question: 
{input}`)

export function getRagChain(
  chainCompletionCallback?: (output: LLMResult) => Promise<void>
) {
  const repo = new VectoreStoreRepository()
  const retriever = repo.getRetriever(5)

  const retrievalChain = retriever.pipe(combineDocumentsFn)

  const newChain = RunnableSequence.from([
    {
      context: RunnableSequence.from([input => input.input, retrievalChain]),
      input: input => input.input,
      chat_history: input => input.chat_history
    },
    prompt,
    new ChatOpenAI({
      temperature: 0,
      callbacks: [
        {
          handleLLMEnd: chainCompletionCallback
        }
      ]
    }),
    new HttpResponseOutputParser()
  ])

  return newChain
}
