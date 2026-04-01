import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

function Stars({ rating }) {
  const full = Math.round(parseFloat(rating))
  return (
    <span style={{ color: 'var(--amber)', fontSize: '1rem', letterSpacing: 2 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

const SPECS = {
  'Tentes': [['Matière', 'Polyester 210T ripstop'], ['Imperméabilité', '3000mm colonne d\'eau'], ['Poids', '1.8 kg'], ['Saisons', '3 saisons']],
  'Sacs de couchage': [['Garnissage', 'Synthétique creux'], ['Forme', 'Momie'], ['Fermeture', 'Gauche'], ['Compression', '3.2L']],
  'Sacs à dos': [['Volume', '45L'], ['Matière', 'Nylon 420D'], ['Dos', 'Ergonomique réglable'], ['Accès', 'Frontal + supérieur']],
  'Éclairage': [['Technologie', 'LED CREE'], ['Étanchéité', 'IPX4'], ['Recharge', 'USB-C'], ['Poids', '88g']],
  'Cuisine': [['Matière', 'Aluminium anodisé'], ['Puissance', '2600W'], ['Gaz', 'Butane/Propane'], ['Allumage', 'Piézoélectrique']],
  'Vêtements': [['Matière', 'Gore-Tex® 3L'], ['Coutures', 'Soudées'], ['Capuche', 'Ajustable'], ['Poches', '4 extérieures']],
  'Navigation': [['Précision', '±1°'], ['Boîtier', 'Polycarbonate'], ['Graduation', '2°'], ['Usage', 'Topographie']],
  'Premiers secours': [['Contenu', '42 pièces'], ['Sac', 'Étanche IPX5'], ['Norme', 'EN 13485'], ['Poids', '320g']],
  'Accessoires': [['Matière', 'Aluminium T6'], ['Longueur', '18 cm'], ['Résistance', '200 kg'], ['Poids', '12g']],
}

export default function ProductDrawer({ product, open, onClose, onToast }) {
  const { addItem, items, updateQty } = useCart()
  const { user } = useAuth()
  const [added, setAdded] = useState(false)
  const [qty, setQty] = useState(1)

  if (!product) return null

  const cartItem = items.find(i => i.id === product.id)
  const specs = SPECS[product.cat] || []

  const handleAdd = () => {
    if (!user) { onToast && onToast('⚠️ Connectez-vous pour ajouter au panier'); return }
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    onToast && onToast(`✓ ${product.name} ajouté au panier (x${qty})`)
  }

  return (
    <>
      <div className={`cart-bg-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`product-drawer${open ? ' open' : ''}`}>
        <button className="cart-close" onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>✕</button>

        {/* Product hero */}
        <div className={`prod-drawer-img ${product.cls}`}>
          <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.5))' }}>{product.icon}</span>
          {product.badge && (
            <span className={`prod-badge ${product.badgeCls}`} style={{ fontSize: '.78rem', padding: '4px 12px' }}>{product.badge}</span>
          )}
        </div>

        <div className="prod-drawer-body">
          <div className="prod-cat-tag" style={{ fontSize: '.75rem' }}>{product.cat}</div>
          <h2 className="prod-drawer-name">{product.name}</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Stars rating={product.rating} />
            <span style={{ color: 'var(--fg3)', fontSize: '.82rem' }}>{product.rating} ({product.rev} avis)</span>
          </div>

          <p style={{ color: 'var(--fg2)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 20 }}>{product.desc}</p>

          {/* Specs */}
          {specs.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: 'var(--fg)', fontSize: '.85rem', marginBottom: 10 }}>Caractéristiques techniques</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {specs.map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--ink1)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: '.7rem', color: 'var(--fg3)', marginBottom: 2 }}>{k}</div>
                    <div style={{ fontSize: '.82rem', color: 'var(--fg)', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price & add */}
          <div style={{ background: 'var(--ink1)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginTop: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--lime)' }}>{product.price}</span>
              <span style={{ fontSize: '.78rem', color: 'var(--fg3)' }}>
                {product.inStock ? '✅ En stock' : '❌ Rupture de stock'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: '.82rem', color: 'var(--fg2)' }}>Quantité :</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-n">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>

            <button
              className={`btn-checkout${added ? '' : ''}`}
              style={{ background: added ? '#2a9d3a' : undefined }}
              onClick={handleAdd}
            >
              {added ? '✓ Ajouté au panier !' : `🛒 Ajouter au panier — ${product.priceNum * qty} DT`}
            </button>

            {cartItem && (
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: '.78rem', color: 'var(--lime2)' }}>
                Déjà dans votre panier : x{cartItem.qty}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
