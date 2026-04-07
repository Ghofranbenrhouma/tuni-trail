import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { cartApi } from '../services/api'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  // Normalize API row → cart item shape used by UI
  const normalize = (row) => ({
    id: row.product_id,        // product id — used for UI keying
    cartItemId: row.id,        // cart_items.id — used for API PUT/DELETE
    name: row.name,
    price: row.price,
    price_num: row.price_num,
    icon: row.icon,
    cat: row.category,
    cls: row.css_class,
    badge: row.badge,
    badge_cls: row.badge_cls,
    rating: row.rating,
    qty: row.quantity,
  })

  const loadCart = useCallback(async () => {
    if (!user) { setItems([]); return }
    setLoading(true)
    try {
      const rows = await cartApi.get()
      setItems((rows || []).map(normalize))
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [user?.id])

  useEffect(() => { loadCart() }, [loadCart])

  const addItem = async (product) => {
    // Optimistic: bump qty if already in cart
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, cartItemId: null, cat: product.cat || product.category, qty: 1 }]
    })
    try {
      await cartApi.add(product.id)
      await loadCart() // sync to get real cartItemId
    } catch { await loadCart() }
  }

  const removeItem = async (productId) => {
    const item = items.find(i => i.id === productId)
    if (!item || !item.cartItemId) return
    setItems(prev => prev.filter(i => i.id !== productId))
    try { await cartApi.remove(item.cartItemId) }
    catch { await loadCart() }
  }

  const updateQty = async (productId, delta) => {
    const item = items.find(i => i.id === productId)
    if (!item || !item.cartItemId) return
    const newQty = item.qty + delta
    if (newQty <= 0) { await removeItem(productId); return }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, qty: newQty } : i))
    try { await cartApi.updateQty(item.cartItemId, newQty) }
    catch { await loadCart() }
  }

  const clearCart = async () => {
    setItems([])
    try { await cartApi.clear() } catch {}
  }

  const total = items.reduce((acc, i) => {
    const price = parseFloat(String(i.price_num || i.price).replace(/[^0-9.]/g, '')) || 0
    return acc + price * i.qty
  }, 0)

  const count = items.reduce((acc, i) => acc + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, loading, addItem, removeItem, updateQty, clearCart, total, count, reload: loadCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() { return useContext(CartContext) }
