'use client'

import * as React from 'react'

interface ChatSendContext {
  chatMessage: string;
}

const ChatSendContext = React.createContext<ChatSendContext | undefined>(
    undefined
  )

  interface ChatSendProviderProps {
    children: React.ReactNode
  }
  

  export function SidebarProvider({ children }: ChatSendProviderProps) {
    const [isSidebarOpen, setSidebarOpen] = React.useState(true)
    const [isLoading, setLoading] = React.useState(true)
  
    React.useEffect(() => {
      const value = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (value) {
        setSidebarOpen(JSON.parse(value))
      }
      setLoading(false)
    }, [])
  
    const toggleSidebar = () => {
      setSidebarOpen(value => {
        const newState = !value
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState))
        return newState
      })
    }
  
    if (isLoading) {
      return null
    }
  
    return (
      <ChatSendContext.Provider
        value={{ isSidebarOpen, toggleSidebar, isLoading }}
      >
        {children}
      </ChatSendContext.Provider>
    )
  }