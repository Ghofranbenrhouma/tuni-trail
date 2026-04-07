import { useCart } from '../context/CartContext'
import { useOrders } from '../context/OrdersContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function CartDrawer({ open, onClose, onToast }) {
  const { items, removeItem, updateQty, total, count, clearCart } = useCart()
  const { placeOrder } = useOrders()
  const { user } = useAuth()
  const [checkout, setCheckout] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!user) { onToast('⚠️ Connectez-vous pour commander'); return }
    setLoading(true)
    const order = await placeOrder(items, total + 5)
    await clearCart()
    setLoading(false)
    setCheckout(true)
    onToast(`✓ Commande #${order.id} confirmée !`)
    setTimeout(() => { setCheckout(false); onClose() }, 3000)
  }

  return (
    <>
      <div className={`cart-bg-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer${open ? ' open' : ''}`}>
        <div className="cart-header">
          <span className="cart-title">Mon panier {count > 0 && `(${count})`}</span>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {!user && (
          <div style={{ padding: '10px 16px', background: 'rgba(125,184,83,.07)', borderBottom: '1px solid var(--border)', fontSize: '.78rem', color: 'var(--lime2)' }}>
            💡 Connectez-vous pour sauvegarder votre panier
          </div>
        )}

        {checkout ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--lime)', marginBottom: 8 }}>Commande confirmée !</div>
            <div style={{ color: 'var(--fg3)', fontSize: '.85rem' }}>Votre commande est en cours de préparation.</div>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <div className="cart-empty-icon">🎒</div>
                  <div className="cart-empty-text">Votre panier est vide</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--fg3)', marginTop: 6 }}>Ajoutez des équipements depuis la boutique</div>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className={`cart-item-img ${item.cls || 'th-z'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.icon && <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>}
                    </div>
                    <div className="cart-item-body">
                      <div className="cart-item-title">{item.name}</div>
                      <div className="cart-item-meta">🏷 {item.cat || item.category}</div>
                      <div className="cart-item-qty">
                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                        <span className="qty-n">{item.qty}</span>
                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <div className="cart-item-price">{item.price}</div>
                      <button className="cart-remove" onClick={() => removeItem(item.id)}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total-row"><span>Sous-total</span><span>{total.toFixed(0)} DT</span></div>
                <div className="cart-total-row"><span>Frais de service</span><span>5 DT</span></div>
                <div className="cart-total-row main"><span>Total</span><span>{(total + 5).toFixed(0)} DT</span></div>
                <button className="btn-checkout" onClick={handleCheckout} disabled={loading}>
                  {loading ? '⏳ Confirmation...' : 'Confirmer la commande'}
                </button>
                <button
                  onClick={() => { clearCart(); onToast('Panier vidé') }}
                  style={{ background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', fontSize: '.75rem', marginTop: 8, textAlign: 'center', width: '100%' }}
                >
                  Vider le panier
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
