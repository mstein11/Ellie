'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { cn } from '@/lib/utils'
import useRightSidebar from '@/lib/hooks/use-right-sidebar'

export interface SidebarProps extends React.ComponentProps<'div'> {}


export function Sidebar({ isRight, className, children }: SidebarProps & {isRight?: boolean}) {
  const { isSidebarOpen, isLoading } = useSidebar()
  const rightIsOpen = useRightSidebar((state: any) => state.rightSidebarOpen);

  return (
    <div
      data-state={(isRight && rightIsOpen) || (!isRight && isSidebarOpen) && !isLoading ? 'open' : 'closed'}
      className={cn(className, 'h-full flex-col dark:bg-zinc-950')}
    >
      {children}
    </div>
  )
}
