
import { AzureOpenAIInput, ChatOpenAI, ClientOptions, LegacyOpenAIInput, OpenAIChatInput } from '@langchain/openai'
import { type BaseChatModelParams } from "@langchain/core/language_models/chat_models";

    

export default class EllieBaseChatModel extends  ChatOpenAI {
  
constructor(fields?: Partial<OpenAIChatInput> & Partial<AzureOpenAIInput> & BaseChatModelParams & {
        configuration?: ClientOptions & LegacyOpenAIInput;
    }, 
    /** @deprecated */
    configuration?: ClientOptions & LegacyOpenAIInput)
   {
    super()
    this.modelName = "gpt-4o-mini";
  }
}