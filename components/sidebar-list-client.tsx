'use client'

import { useEffect, useState } from 'react'
import { SidebarItems } from './sidebar-items'
import { Button } from './ui/button'
import { IconSpinner } from './ui/icons'
import { getChats } from '@/app/actions'
import { Chat } from '@/lib/types'

export function SidebarListClient({ userId }: { userId?: string }) {
  const [chats, setData] = useState<Chat[]>([])
  const [currentlyLoadedChats, setCurrentlyLoadedChats] = useState(0)
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async (start = 0, limit = 10) => {
    const retrievedChats = await getChats(userId, start, limit);
    const newChats = [...chats, ...retrievedChats]
    setData(newChats)
    setLoading(false)
    setCurrentlyLoadedChats(newChats.length);
  }

  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          <SidebarItems chats={chats} />
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
      <div className="flex justify-center p-4">
        <Button variant="ghost" onClick={() => {
            setLoading(true)
            loadChats(currentlyLoadedChats, currentlyLoadedChats + 10)
        }}>
          {isLoading && <IconSpinner className="mr-2" />}
          Load more
        </Button>
      </div>
    </div>
  )
}
