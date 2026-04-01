import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

function cartKey(userId) { return `tuniTrail_cart_${userId}` }

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  // Load cart when user changes
  useEffect(() => {
    if (!user) { setItems([]); return }
    try {
      const saved = localStorage.getItem(cartKey(user.id))
      setItems(saved ? JSON.parse(saved) : [])
    } catch { setItems([]) }
  }, [user?.id])

  // Persist cart whenever items change
  useEffect(() => {
    if (!user) return
    localStorage.setItem(cartKey(user.id), JSON.stringify(items))
  }, [items, user?.id])

  const addItem = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((acc, i) => {
    const price = parseFloat(String(i.price).replace(/[^0-9.]/g, '')) || 0
    return acc + price * i.qty
  }, 0)

  const count = items.reduce((acc, i) => acc + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
