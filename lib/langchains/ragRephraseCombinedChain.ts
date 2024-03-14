import { LLMResult } from "langchain/schema";
import { getrephraseQuestionChain } from "./rephraseQuestionChain";
import { getRagChain } from "./ragChain";
import { RunnableSequence } from '@langchain/core/runnables'

export function getRagRephraseCombinedChain(chainCompletionCallback?: (output: LLMResult) => Promise<void>) {

    const rephraseQuestionChain = getrephraseQuestionChain();
    const ragChain = getRagChain(chainCompletionCallback);

    return RunnableSequence.from([
      {
        input: rephraseQuestionChain,
        chat_history: input => input.chat_history
      },
      ragChain
    ]);
}
