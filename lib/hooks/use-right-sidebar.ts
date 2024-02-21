'use client'

import { create } from 'zustand'

const useRightSidebar = create((set) => ({
  rightSidebarOpen: false,
  openRightSidebar: () => set({ rightSidebarOpen: true }),
  closeRightSidebar: () => set({ rightSidebarOpen: false }),
  toggleRightSidebar: () => set((state: any) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
}))

export default useRightSidebar;