// EventCart is kept in-memory only (session state).
// Event tickets are reserved immediately via the API when the user confirms checkout.
// No persistence needed between page refreshes for the cart itself.
import { createContext, useContext, useState } from 'react'

const EventCartContext = createContext(null)

export function EventCartProvider({ children }) {
  const [eventItems, setEventItems] = useState([])

  const addEventItem = (event) => {
    setEventItems(prev => {
      if (prev.find(i => i.id === event.id)) return prev
      return [...prev, { ...event, qty: 1 }]
    })
  }

  const removeEventItem = (id) => setEventItems(prev => prev.filter(i => i.id !== id))

  const hasEventInCart = (id) => eventItems.some(i => i.id === id)

  const clearEventCart = () => setEventItems([])

  const eventCartTotal = eventItems.reduce((acc, i) => {
    const price = parseFloat(String(i.price || i.price_num || 0).replace(/[^0-9.]/g, '')) || 0
    return acc + price
  }, 0)

  const eventCartCount = eventItems.length

  return (
    <EventCartContext.Provider value={{
      eventItems, addEventItem, removeEventItem, hasEventInCart,
      clearEventCart, eventCartTotal, eventCartCount,
    }}>
      {children}
    </EventCartContext.Provider>
  )
}

export function useEventCart() { return useContext(EventCartContext) }
