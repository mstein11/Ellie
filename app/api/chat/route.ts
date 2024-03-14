import { StreamingTextResponse, Message as VercelChatMessage } from 'ai'
import { type LLMResult } from "langchain/schema";

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils';
import { kv } from '@vercel/kv';
import { getRagRephraseCombinedChain } from '@/lib/langchains/ragRephraseCombinedChain';

const saveChat = async ({ title, chatId, userId, newMessage, oldMessages} : {title: string, chatId: string, userId: string, newMessage: string, oldMessages: string[]}) => {
  const createdAt = Date.now()
  const path = `/chat/${chatId}`
  const payload = {
    id: chatId,
    title,
    userId,
    createdAt,
    path,
    messages: [
      ...oldMessages,
      {
        content: newMessage,
        role: 'assistant'
      }
    ]
  }
  await kv.hmset(`chat:${chatId}`, payload)
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${chatId}`
  })
}

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};


export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json
  const userId = (await auth())?.user.id
  
  const chain = getRagRephraseCombinedChain(async (output: LLMResult) => { 
    if (!userId) {
      return; 
    } 
    const title = messages[0].content.substring(0, 100)
    const chatId = json.id ?? nanoid()
    await saveChat({title, chatId, userId, newMessage: output.generations[0][0].text, oldMessages: messages });
  })

  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  var stream = await chain.stream({
    input: currentMessageContent,
    chat_history: formattedPreviousMessages.join("\n")
  })
  return new StreamingTextResponse(stream)
}
