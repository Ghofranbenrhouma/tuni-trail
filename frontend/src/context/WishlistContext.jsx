import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext(null)

function wishKey(userId) { return `tuniTrail_wish_${userId}` }

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!user) { setItems([]); return }
    try {
      const saved = localStorage.getItem(wishKey(user.id))
      setItems(saved ? JSON.parse(saved) : [])
    } catch { setItems([]) }
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(wishKey(user.id), JSON.stringify(items))
  }, [items, user?.id])

  const toggle = (item) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      return exists ? prev.filter(i => i.id !== item.id) : [...prev, item]
    })
  }

  const has = (id) => items.some(i => i.id === id)

  return (
    <WishlistContext.Provider value={{ items, toggle, has }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() { return useContext(WishlistContext) }
