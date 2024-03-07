/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { getChats } from './../../app/actions'
import { SidebarItems } from '../../components/sidebar-items'

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
    const exampleChats = new Array(10).fill("someChatObj", 0, 10)
    getChats.mockResolvedValue([...exampleChats])
    
    await act(async () => render(<SidebarListClient />))

    expect(getChats).toHaveBeenCalledWith(undefined, 0, 10)
    expect(SidebarItems).toHaveBeenCalledWith({ chats: new Array(10).fill("someChatObj", 0, 10) }, expect.anything())

    await act(async () => screen.getByText('Load more').click())

    expect(getChats).toHaveBeenCalledWith(undefined, 10, 20)
    expect(SidebarItems).toHaveBeenCalledWith({ chats: new Array(20).fill("someChatObj", 0, 20) }, expect.anything())

  })
})
