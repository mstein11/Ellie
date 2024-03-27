/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { render, screen, renderHook } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { getChats } from './../../app/actions'
import { SidebarItems } from '../../components/sidebar-items'

import useRepopulateChatHistoryResult from '../../lib/hooks/use-repopulate-chat-history'


jest.mock('./../../app/actions.ts', () => {
  return { getChats: jest.fn() }
})

jest.mock('./../../lib/utils.ts', () => {
  return { cn: jest.fn() }
})

jest.mock('./../../components/sidebar-items', () => {
  return {
    SidebarItems: jest.fn()
  }
})

import { SidebarListClient } from './../../components/sidebar-list-client'

describe('should load the sidebar list', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should display No Chat History if empty', async () => {
    getChats.mockReturnValue([])
    await act(async () => render(<SidebarListClient />))

    const sidebarList = screen.getByText('No chat history')
    expect(sidebarList).toBeInTheDocument()
  })

  it('should load more chats by click on button', async () => {
    let exampleChats = new Array(10).fill("someChatObj", 0, 10)
    getChats.mockResolvedValue([...exampleChats])
    
    await act(async () => render(<SidebarListClient chats={exampleChats} />))

    expect(getChats).not.toHaveBeenCalled()
    expect(SidebarItems).toHaveBeenCalled();
    expect(SidebarItems).toHaveBeenCalledWith({ chats: new Array(10).fill("someChatObj", 0, 10) }, expect.anything())

    exampleChats = new Array(20).fill("someChatObj", 0, 20)
    getChats.mockResolvedValue([...exampleChats])

    await act(async () => screen.getByText('Load more').click())

    expect(getChats).toHaveBeenCalledTimes(1)
    expect(getChats).toHaveBeenCalledWith(undefined, 0, 20)
    expect(SidebarItems).toHaveBeenCalledWith({ chats: new Array(20).fill("someChatObj", 0, 20) }, expect.anything())

  });

  it('should reload chats when repopulate chats is triggered', async () => {
    let exampleChats = new Array(10).fill("someChatObj", 0, 10)

    await act(async () => render(<SidebarListClient chats={exampleChats} />))

    const { result } = renderHook(() => useRepopulateChatHistoryResult());
    await act(async () => {
      result.current.requestRepopulation()
    })

    expect(getChats).toHaveBeenCalledTimes(1);

  });
})
