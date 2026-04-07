import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { wishlistApi } from '../services/api'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])

  const normalize = (row) => ({
    id: row.product_id,
    wishItemId: row.id,
    name: row.name,
    price: row.price,
    price_num: row.price_num,
    icon: row.icon,
    category: row.category,
    css_class: row.css_class,
    badge: row.badge,
    badge_cls: row.badge_cls,
    rating: row.rating,
    description: row.description,
  })

  const load = useCallback(async () => {
    if (!user) { setItems([]); return }
    try {
      const rows = await wishlistApi.get()
      setItems((rows || []).map(normalize))
    } catch { setItems([]) }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const toggle = async (product) => {
    const productId = product.id
    const exists = items.find(i => i.id === productId)
    // Optimistic update
    if (exists) {
      setItems(prev => prev.filter(i => i.id !== productId))
    } else {
      setItems(prev => [...prev, { ...product, wishItemId: null }])
    }
    try { await wishlistApi.toggle(productId) }
    catch { await load() }
  }

  const has = (id) => items.some(i => i.id === id)

  return (
    <WishlistContext.Provider value={{ items, toggle, has, reload: load }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() { return useContext(WishlistContext) }
