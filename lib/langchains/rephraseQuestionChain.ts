import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence } from '@langchain/core/runnables'

const reformatPrompt = PromptTemplate.fromTemplate(`
    Given the following chat history and question, please rephrase the question in such a way, that it can be understood independently of the chat history. 
    If the chat history is empty or the question does not seem to be related to the history, please just return the original Question without modifying it in any way.
    
    <Chat History>
    {chat_history}
    </Chat History>
    
    <Question>
    {input}
    </Question>
        `)

export function getrephraseQuestionChain() {
  return RunnableSequence.from([
    {
      input: input => input.input,
      chat_history: input => input.chat_history
    },
    reformatPrompt,
    new ChatOpenAI({
      temperature: 0
    }),
    new StringOutputParser()
  ])
}
