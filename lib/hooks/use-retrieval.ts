'use client'

import { create } from 'zustand'


interface RetrievalResultContext {
    retrievalResultId: string
    setRetrievalResultId: (id: string) => void
}

const useRetrievalResult = create<RetrievalResultContext>((set) => ({
    retrievalResultId: "",
    setRetrievalResultId: (id) => set({ retrievalResultId: id }),
}))

export default useRetrievalResult;