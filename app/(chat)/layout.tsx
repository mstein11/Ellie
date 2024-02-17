import { SidebarDesktop } from '@/components/sidebar-desktop'
import { SidebarDesktopRight } from '@/components/sidebar-desktop-right';


interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {

  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      <div className="group w-full overflow-auto pl-0 animate-in duration-300 ease-in-out pr-[500px] peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px] ${isRightSidebarOpen ? 'pr-[250px] xl:pr-[300px]' : ''}">
        {children}
      </div>
      <SidebarDesktopRight />
    </div>
  )
}
