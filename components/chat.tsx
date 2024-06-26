'use client'

import { useChat, type Message, CreateMessage } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { ChatRequestOptions } from 'ai'
import useRetrievalResult from '@/lib/hooks/use-retrieval'
import useKvStoreAvailableResult from '@/lib/hooks/use-kvstore-available'
import useRepopulateChatHistoryResult from '@/lib/hooks/use-repopulate-chat-history'
import { ApiResonseDocumentRetrieval } from '@/app/api/chat/retrieve/route'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export interface MessageWithRetrievalResult extends Message {
  retrievalResults?: any | undefined
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const { data: session } = useSession();

  

  const { pushRetrievalResultContextItems, retrievalResultContextItems, resetState, selectedRetrievalResultId } = useRetrievalResult()
  const { isRateLimited } = useKvStoreAvailableResult();
  const { requestRepopulation } = useRepopulateChatHistoryResult();
  
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const {
    messages,
    append,
    reload,
    stop,
    isLoading,
    input,
    setInput  } = useChat({
    initialMessages,
    id,
    body: {
      id,
      previewToken
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error(response.statusText)
      }
    },
    onFinish() {
      if (!path.includes('chat') && !isRateLimited && session?.user?.id) {
        router.push(`/chat/${id}`, { scroll: false })
        requestRepopulation()
      }
    }
  })

  
  const messagesWithRetrievalResults: MessageWithRetrievalResult[] = [
    ...messages
  ]
  messages.forEach((message, index) => {
    if (
      retrievalResultContextItems.some(
        retrievalContextItem =>
          retrievalContextItem.relatesToMessageId === message.id
      ) &&
      messagesWithRetrievalResults.length > index + 1
    ) {
      messagesWithRetrievalResults[index + 1].retrievalResults =
        retrievalResultContextItems.find(
          retrievalContextItem =>
            retrievalContextItem.relatesToMessageId === message.id
        )?.retrievalResults
    }
  })

  const chatMessageSubmit = async (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ): Promise<string | null | undefined> => {
    fetch('/api/chat/retrieve', {
      method: 'POST',
      body: JSON.stringify({ newMessage: message.content, messages: messages.map(m => m.content)}),
      headers: { 'Content-Type': 'application/json' }
    }).then(async res => {
      const json = await res.json() as ApiResonseDocumentRetrieval[]
      if (json && json.length) {
        pushRetrievalResultContextItems({
          retrievalResults: json,
          relatesToMessageId: message.id
        })
      }
    })

    return await append(message, chatRequestOptions)
  }

  if (!messages.length && selectedRetrievalResultId) {
    resetState();
  }

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <EmptyScreen setInput={setInput} />
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={chatMessageSubmit}
        reload={reload}
        messages={messagesWithRetrievalResults}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter your OpenAI Key</DialogTitle>
            <DialogDescription>
              If you have not obtained your OpenAI API key, you can do so by{' '}
              <a
                href="https://platform.openai.com/signup/"
                className="underline"
              >
                signing up
              </a>{' '}
              on the OpenAI website. This is only necessary for preview
              environments so that the open source community can test the app.
              The token will be saved to your browser&apos;s local storage under
              the name <code className="font-mono">ai-token</code>.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={previewTokenInput}
            placeholder="OpenAI API key"
            onChange={e => setPreviewTokenInput(e.target.value)}
          />
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput)
                setPreviewTokenDialog(false)
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
