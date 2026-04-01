import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onOpenModal, onOpenCart, onGoLanding, onGoStore, onGoDestinations, onGoCommunity, currentView }) {
  const [scrolled, setScrolled] = useState(false)
  const { count } = useCart()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav id="mainNav" className={`nav${scrolled ? ' up' : ''}`}>
      <div className="nav-logo" onClick={onGoLanding}>
        <div className="nav-logo-mark">
          <svg viewBox="0 0 24 24">
            <path d="M3 17l4-8 4 4 3-6 4 10"/>
            <path d="M3 20h18"/>
          </svg>
        </div>
        <span className="nav-logo-text">TuniTrail</span>
      </div>

      <div className="nav-links">
        <span className={`nav-link${currentView === 'landing' ? ' active' : ''}`} onClick={onGoLanding}>Explorer</span>
        <span
          className={`nav-link${currentView === 'store' ? ' active' : ''}`}
          onClick={onGoStore}
        >
          Boutique
        </span>
        <span 
          className={`nav-link${currentView === 'destinations' ? ' active' : ''}`}
          onClick={onGoDestinations}
        >
          Destinations
        </span>
        <span 
          className={`nav-link${currentView === 'community' ? ' active' : ''}`}
          onClick={onGoCommunity}
        >
          Communauté
        </span>
      </div>

      <div className="nav-right">
        {user && (
          <button
            id="navCartBtn"
            className="nav-cart"
            onClick={onOpenCart}
            style={{ display: 'flex' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>
        )}
        {!user ? (
          <>
            <button className="btn-ghost" onClick={() => onOpenModal('login')}>Connexion</button>
            <button className="btn-prime" onClick={() => onOpenModal('register')}>S'inscrire</button>
          </>
        ) : (
          <button className="btn-ghost" onClick={logout}>Déconnexion</button>
        )}
      </div>
    </nav>
  )
}
