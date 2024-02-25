'use client'

import { create } from 'zustand'


interface RightSidebarContext {
  rightSidebarOpen: boolean
  openRightSidebar: () => void
  closeRightSidebar: () => void
  toggleRightSidebar: () => void
}

const useRightSidebar = create<RightSidebarContext>((set) => ({
  rightSidebarOpen: true,
  openRightSidebar: () => set({ rightSidebarOpen: true }),
  closeRightSidebar: () => set({ rightSidebarOpen: false }),
  toggleRightSidebar: () => set((state: any) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
}))

export default useRightSidebar;