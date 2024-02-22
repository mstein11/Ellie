'use client'

import { create } from 'zustand'

interface ChatHistoryState {
    lastUpdate: number
    triggerUpdate: () => void
}

const useChatHistory = create<ChatHistoryState>((set) => ({
    lastUpdate: 0,
    triggerUpdate: () => set({ lastUpdate: Date.now() }),
}))

export default useChatHistory;