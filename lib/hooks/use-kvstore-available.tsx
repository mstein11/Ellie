'use client'

import { create } from 'zustand'


interface KvStoreAvailableResultContext {
    isRateLimited: boolean
    setIsRateLimited: (islimited: boolean) => void
}

const useKvStoreAvailableResult = create<KvStoreAvailableResultContext>((set) => ({
    isRateLimited: false,
    setIsRateLimited: (islimited) => set({ isRateLimited: islimited }),
}))

export default useKvStoreAvailableResult;