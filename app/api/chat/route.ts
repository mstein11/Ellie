import { StreamingTextResponse, Message as VercelChatMessage } from 'ai'
import { type LLMResult } from "langchain/schema";

import { auth } from '@/auth'
import { nanoid } from '@/lib/utils';
import { kv } from '@vercel/kv';
import { getChainWithRephrase } from './chain';


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

  const chainCompletionCallback = async (output: LLMResult) => {
    if (userId) {
      console.log('saving chat')
      await saveChat(json, userId ?? 'no-id', output.generations[0][0].text)
    } else {
      console.log('no user id found, not saving chat')
    }
  }

  return await getChainWithRephrase(chainCompletionCallback);
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
