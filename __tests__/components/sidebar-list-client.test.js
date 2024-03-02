/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { getChats } from './../../app/actions'
jest.mock('./../../app/actions.ts', () => {
  return { getChats: jest.fn() }
})
jest.mock('./../../lib/utils.ts', () => {
  return { cn: jest.fn() }
})
jest.mock('./../../components/sidebar-items', () => {
  return {
    SidebarItems: props => (
      <div
        data-testid="sidebaritems"
        data-test-length={props.chats.length}
      ></div>
    )
  }
})

import { SidebarListClient } from './../../components/sidebar-list-client'

describe('should load the sidebar list', () => {
  it('should display No Chat History if empty', async () => {
    getChats.mockReturnValue([])
    await act(async () => render(<SidebarListClient />))

    const sidebarList = screen.getByText('No chat history')
    expect(sidebarList).toBeInTheDocument()
  })

  it('should load more chats by click on button', async () => {
    //create an array with 10 entries

    const exampleChats = new Array(10).fill({ id: '1', name: 'Chat 1' }, 0, 10)
    getChats.mockResolvedValue(exampleChats)
    await act(async () => render(<SidebarListClient />))

    expect(getChats).toHaveBeenCalledWith(undefined, 0, 10)
    expect(
        screen.getByTestId('sidebaritems').getAttribute('data-test-length')
      ).toBe('10')

    await act(async () => screen.getByText('Load more').click())

    expect(getChats).toHaveBeenCalledWith(undefined, 10, 20)
    expect(
      screen.getByTestId('sidebaritems').getAttribute('data-test-length')
    ).toBe('20')
  })
})
