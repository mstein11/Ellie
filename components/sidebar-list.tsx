import { clearChats, getChats } from '@/app/actions'
import { ClearHistory } from '@/components/clear-history'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { SidebarListClient } from './sidebar-list-client'
import { Chat } from '@/lib/types'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}

const loadChats = cache(async (userId?: string, start = 0, limit = -1) => {
  return await getChats(userId, start, limit)
})

export async function SidebarList({ userId }: SidebarListProps) {
  const chatsOrRateLimit = await loadChats(userId, 0, 10)

  let chats = [] as Chat[];
  let isRateLimited = false;
  if (chatsOrRateLimit === 'rate-limited') {
    isRateLimited = true;
  } else {
    chats = chatsOrRateLimit;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <SidebarListClient userId={userId} isRateLimited={isRateLimited} chats={chats} />
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory clearChats={clearChats} isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}
