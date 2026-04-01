import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const OrdersContext = createContext(null)

function ordersKey(userId) { return `tuniTrail_orders_${userId}` }

export function OrdersProvider({ children }) {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!user) { setOrders([]); return }
    try {
      const saved = localStorage.getItem(ordersKey(user.id))
      setOrders(saved ? JSON.parse(saved) : [])
    } catch { setOrders([]) }
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(ordersKey(user.id), JSON.stringify(orders))
  }, [orders, user?.id])

  // placeOrder = commandes boutique uniquement (produits physiques, SANS QR)
  const placeOrder = (items, total) => {
    const order = {
      id: 'TT-' + Date.now().toString().slice(-6),
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: items.map(i => ({ ...i })),
      total,
      status: 'confirmed',
    }
    setOrders(prev => [order, ...prev])
    return order
  }

  return (
    <OrdersContext.Provider value={{ orders, placeOrder }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() { return useContext(OrdersContext) }

