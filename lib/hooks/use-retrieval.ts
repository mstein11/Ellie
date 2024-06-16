'use client'

import { ApiResonseDocumentRetrieval } from '@/app/api/chat/retrieve/route'
import { get } from 'http'
import { create } from 'zustand'

interface RetrievalResultContextItem {
  retrievalResults: ApiResonseDocumentRetrieval[]
  relatesToMessageId: string | undefined
}

interface RetrievalResultContext {
  selectedRetrievalResultId: string | null
  retrievalResultContextItems: RetrievalResultContextItem[]
  pushRetrievalResultContextItems: (item: RetrievalResultContextItem) => void
  setSelectedRetrievalResultId: (id: string) => void
  getSelectedRetrievalResult: () => ApiResonseDocumentRetrieval | undefined
  resetState: () => void
}

const useRetrievalResult = create<RetrievalResultContext>((set, get) => ({
  retrievalResultContextItems: [],
  selectedRetrievalResultId: null,
  pushRetrievalResultContextItems: item =>
    set(state => {
      state.setSelectedRetrievalResultId(item.retrievalResults[0].id)
      return {
        retrievalResultContextItems: [
          ...state.retrievalResultContextItems,
          item
        ]
      }
    }),
    setSelectedRetrievalResultId: id => set({ selectedRetrievalResultId: id }),
    getSelectedRetrievalResult: () => get().retrievalResultContextItems.find(item => item.retrievalResults.some(res => res.id === get().selectedRetrievalResultId))?.retrievalResults?.find(result => result.id === get().selectedRetrievalResultId) ?? undefined,
    resetState: () => set({ retrievalResultContextItems: [], selectedRetrievalResultId: null })
}))

export default useRetrievalResult
