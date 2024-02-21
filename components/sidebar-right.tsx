'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import useRightSidebar from '@/lib/hooks/use-right-sidebar'

export interface SidebarProps extends React.ComponentProps<'div'> {}


export function SidebarRight({ className, children }: SidebarProps) {
  const rightIsOpen = useRightSidebar((state: any) => state.rightSidebarOpen);
  
  return (
    <div
      data-state-right={(rightIsOpen) ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
    </div>
  )
}
