'use client'

import { useEffect, useState } from 'react'
import { SidebarItems } from './sidebar-items'
import { Button } from './ui/button'
import { IconSpinner } from './ui/icons'
import { getChats } from '@/app/actions'
import { Chat } from '@/lib/types'
import useKvStoreAvailableResult from '@/lib/hooks/use-kvstore-available'
import useRepopulateChatHistoryResult from '@/lib/hooks/use-repopulate-chat-history'

export function SidebarListClient({ userId, isRateLimited, chats = [] }: { userId?: string, isRateLimited: boolean, chats?: Chat[] }) {
  const [chatsState, setChatsState] = useState<Chat[]>(chats)
  const [isLoading, setLoading] = useState(false)
  const [maxChats, setMaxChats] = useState(chats.length || 0)
  const { isRateLimitedClientState , setIsRateLimited } = useKvStoreAvailableResult((state) => { return { isRateLimitedClientState: state.isRateLimited, setIsRateLimited: state.setIsRateLimited } });

  if (isRateLimited) {
    setIsRateLimited(true);
  }

  useEffect(() => {
    const unsub = useRepopulateChatHistoryResult.subscribe((cur, prev) => {
      loadChats(maxChats);
    });
    return unsub;
  })
  

  const loadChats = async (n: number) => {
    const retrievedChats = await getChats(userId, 0, n);
    if (retrievedChats === "rate-limited") {
      setIsRateLimited(true);
      setChatsState(chats)
      setLoading(false)
      return;
    }
    setChatsState(retrievedChats)
    setLoading(false)
  }

  return (
    <div className="flex-1 overflow-auto">
      {chatsState?.length ? (
        <div className="space-y-2 px-2">
          <SidebarItems chats={chatsState} />
        </div>
      ) : (
        <div className="p-8 text-center">
          {isRateLimitedClientState ? (
            <p className="text-sm text-muted-foreground">Chat store rate limited, try again later</p>
          ) : (
            <p className="text-sm text-muted-foreground">No chat history</p>
          )}
          
        </div>
      )}
      <div className="flex justify-center p-4">
        <Button variant="ghost" onClick={() => {
            setLoading(true);
            const newMaxChats = maxChats + 10;
            setMaxChats(newMaxChats);
            loadChats(newMaxChats);
        }}>
          {isLoading && <IconSpinner className="mr-2" />}
          Load more
        </Button>
      </div>
    </div>
  )
}
