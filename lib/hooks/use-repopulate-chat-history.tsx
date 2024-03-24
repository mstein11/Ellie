'use client'

import { create } from 'zustand'


interface RepopulateChatHistoryResultContext {
    lastPopulationRequest: number
    requestRepopulation: () => void
}

const useRepopulateChatHistoryResult = create<RepopulateChatHistoryResultContext>((set) => ({
    lastPopulationRequest: 0,
    requestRepopulation: () => set({ lastPopulationRequest: new Date().getTime() }),
}))

export default useRepopulateChatHistoryResult;