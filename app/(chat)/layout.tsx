import { SidebarDesktop } from '@/components/sidebar-desktop'
import { SidebarDesktopRight } from '@/components/sidebar-desktop-right';
import useRightSidebar from '@/lib/hooks/use-right-sidebar';
import { useSidebar } from '@/lib/hooks/use-sidebar';


interface ChatLayoutProps {
  children: React.ReactNode
}

function useRightSideOpen(): boolean {
  'use client'
  return useRightSidebar((state) => state.rightSidebarOpen)
}

export default async function ChatLayout({ children }: ChatLayoutProps) {

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop isRight={false} />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] xl:pr-[500px] {useRightSideOpen() ? '' : ''}">
        {children}
      </div>

      <SidebarDesktop isRight={true} />
      {/* <SidebarDesktopRight /> */}
    </div>
  )
}
