import { useState } from 'react'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import { useEventCart } from '../context/EventCartContext'
import { diffClass } from '../utils/helpers'

export default function EventCard({ event, onToast, onViewDetail, onGoCart }) {
  const { toggle, has } = useWishlist()
  const { user } = useAuth()
  const { addEventItem, hasEventInCart } = useEventCart()
  const [justAdded, setJustAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const liked = has(event.id)
  const inCart = hasEventInCart(event.id)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!user) { onToast && onToast('⚠️ Connectez-vous pour réserver'); return }
    if (inCart) {
      onToast && onToast('ℹ️ Cet événement est déjà dans votre panier')
      onGoCart && onGoCart()
      return
    }
    addEventItem(event)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2200)
    onToast && onToast(`🛒 ${event.title} ajouté au panier !`)
  }

  const handleWish = (e) => {
    e.stopPropagation()
    if (!user) { onToast && onToast('⚠️ Connectez-vous pour ajouter aux souhaits'); return }
    toggle(event)
    onToast && onToast(liked ? '💔 Retiré des souhaits' : `♥ ${event.title} ajouté aux souhaits`)
  }

  const btnLabel = inCart ? '✓ Dans le panier' : justAdded ? '✓ Ajouté !' : '🎫 Réserver'

  return (
    <div
      className="ev-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: 'relative' }}
    >
      <div className={`ev-img ${event.cls}`}>
        <div className="ev-img-overlay" />
        <span className={`ev-badge-diff ${diffClass(event.diff)}`}>{event.diff}</span>
        <button className={`ev-wish${liked ? ' liked' : ''}`} onClick={handleWish}>
          {liked ? '♥' : '♡'}
        </button>
        <div className="ev-price-tag">{event.price}</div>

        <div className={`ev-hover-overlay${hovered ? ' visible' : ''}`}>
          <div className="ev-hover-preview">
            <div className="ev-hover-preview-row"><span className="ev-hover-icon">📅</span><span>{event.date}</span></div>
            <div className="ev-hover-preview-row"><span className="ev-hover-icon">📍</span><span>{event.loc}</span></div>
            <div className="ev-hover-preview-row"><span className="ev-hover-icon">💰</span><span>{event.price}</span></div>
            <div className="ev-hover-preview-row"><span className="ev-hover-icon">⏱</span><span>{event.dur}</span></div>
          </div>
          <button
            className="ev-hover-detail-btn"
            onClick={(e) => { e.stopPropagation(); onViewDetail && onViewDetail(event.id) }}
          >
            🔍 Voir plus de détails
          </button>
        </div>
      </div>

      <div className="ev-body">
        <div className="ev-cat">{event.cat}</div>
        <div className="ev-title">{event.title}</div>
        <div className="ev-meta">
          <span>📍 {event.loc}</span>
          <span>📅 {event.date}</span>
          <span>⏱ {event.dur}</span>
        </div>
        <div className="ev-foot">
          <div className="ev-org">
            <div className="ev-av">{event.org?.[0]}</div>
            {event.org}
          </div>
          <div className="ev-rating">
            <span>★</span>{event.rating} ({event.rev})
          </div>
        </div>
        <button
          className={`btn-add-cart${inCart || justAdded ? ' added' : ''}`}
          onClick={handleAddToCart}
          style={inCart ? { opacity: 0.75 } : {}}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}
