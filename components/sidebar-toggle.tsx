'use client'

import * as React from 'react'

import { useSidebar } from '@/lib/hooks/use-sidebar'
import { Button } from '@/components/ui/button'
import { IconSidebar } from '@/components/ui/icons'
import useRightSidebar from '@/lib/hooks/use-right-sidebar'

export function SidebarToggle({isRight}: {isRight?: boolean}) {
  const { toggleSidebar } = useSidebar()
  const toggleRightSidebar = useRightSidebar((state) => state.toggleRightSidebar)
  console.log('iconRight isRight:', isRight)
  return (
    <Button
      variant="ghost"
      className="-ml-2 hidden size-9 p-0 lg:flex"
      onClick={() => {
        if (isRight) {
          console.log("insideIsRight")
          toggleRightSidebar();
        } else {
          toggleSidebar();
        }
      }}
    >
      <IconSidebar className="size-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
