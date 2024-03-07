import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { Rulebook } from './rulebook'

export async function SidebarDesktopRight() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  return (

    <Sidebar className="peer absolute right-0 inset-y-0 z-30 hidden -translate-x-full border-l bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[500px] xl:w-[500px]">
      {/* @ts-ignore */}
      <Rulebook />
    </Sidebar>
  )
}
