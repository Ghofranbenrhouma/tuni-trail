import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const EventCartContext = createContext(null)

function eventCartKey(userId) { return `tuniTrail_eventCart_${userId}` }

export function EventCartProvider({ children }) {
  const { user } = useAuth()
  const [eventItems, setEventItems] = useState([])

  useEffect(() => {
    if (!user) { setEventItems([]); return }
    try {
      const saved = localStorage.getItem(eventCartKey(user.id))
      setEventItems(saved ? JSON.parse(saved) : [])
    } catch { setEventItems([]) }
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(eventCartKey(user.id), JSON.stringify(eventItems))
  }, [eventItems, user?.id])

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
    const price = parseFloat(String(i.price).replace(/[^0-9.]/g, '')) || 0
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
