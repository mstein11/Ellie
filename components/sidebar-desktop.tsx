import { Sidebar } from '@/components/sidebar'

import { auth } from '@/auth'
import { ChatHistory } from '@/components/chat-history'
import { Rulebook } from './rulebook';
import { SidebarRight } from './sidebar-right';

const getRightSidebar = () => {
  return <SidebarRight className='peer absolute right-0 inset-y-0 z-30 hidden border-l bg-muted duration-300 ease-in-out lg:flex lg:w-[500px] xl:w-[500px] data-[state-right=closed]:hidden'>
    <Rulebook />
  </SidebarRight>;
}

const getLeftSidebar = (userId: string) => {
  return <Sidebar isRight={false} className="peer absolute inset-y-0 z-30 hidden -translate-x-full border-r bg-muted duration-300 ease-in-out data-[state=open]:translate-x-0 lg:flex lg:w-[250px] xl:w-[300px]">
    <ChatHistory userId={userId} /> 
  </Sidebar>;
}

export async function SidebarDesktop({isRight}:{isRight?: boolean}) {
  const session = await auth()

  if (isRight) {
    return getRightSidebar();
  }

  if (!session?.user?.id) {
    return null
  }

  return getLeftSidebar(session.user.id);
}
