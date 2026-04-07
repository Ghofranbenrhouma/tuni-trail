import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useOrders } from '../context/OrdersContext'
import { useReservations } from '../context/ReservationsContext'
import { useEventCart } from '../context/EventCartContext'
import { useAuth } from '../context/AuthContext'
import EventCard from '../components/EventCard'
import Store from './Store'
import EventDetailPage from './EventDetailPage'
import QRTicketModal from '../components/QRTicketModal'
import EventCheckoutModal from '../components/EventCheckoutModal'
import { EVENTS } from '../utils/data'

const TABS = [
  { id: 'uExplore', label: 'Explorer', icon: '🗺' },
  { id: 'uStore', label: 'Boutique', icon: '🏕' },
  { id: 'uCart', label: 'Mon panier', icon: '🛒' },
  { id: 'uReservations', label: 'Mes Réservations', icon: '🎫' },
  { id: 'uOrders', label: 'Commandes', icon: '📦' },
  { id: 'uWishlist', label: 'Souhaits', icon: '♥' },
  { id: 'uProfile', label: 'Mon Profil', icon: '👤' },
]

const ALL_ACTIVITIES = [
  'Randonnée', 'Camping', 'VTT', 'Escalade', 'Kayak',
  'Plongée', 'Observation oiseaux', 'Photographie', 'Trail running',
  'Parapente', 'Spéléologie', 'Trekking', 'Surf', 'Pêche',
  'Équitation', 'Ski nautique',
]

function OrgRequestStatusBanner() {
  const { user, getMyOrgRequest } = useAuth()
  const [req, setReq] = useState(null)

  useEffect(() => {
    if (user && user.role === 'pending_org') {
      getMyOrgRequest().then(r => setReq(r)).catch(() => {})
    }
  }, [user?.id, user?.role])

  if (!user || user.role !== 'pending_org') return null
  if (!req) return null

  if (req.status === 'pending') {
    return (
      <div className="org-status-banner pending">
        <div className="org-status-icon">⏳</div>
        <div className="org-status-body">
          <div className="org-status-title">Demande organisateur en cours d'examen</div>
          <div className="org-status-text">Votre candidature a été soumise le {req.created_at ? new Date(req.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}. Un administrateur l'examinera sous 24 à 48h.</div>
        </div>
      </div>
    )
  }

  if (req.status === 'rejected') {
    return (
      <div className="org-status-banner rejected">
        <div className="org-status-icon">❌</div>
        <div className="org-status-body">
          <div className="org-status-title">Demande organisateur refusée</div>
          <div className="org-status-text">Motif : {req.rejectionReason || 'Non spécifié'}</div>
          <div className="org-status-hint">Vous pouvez soumettre une nouvelle demande en vous réinscrivant en tant qu'organisateur.</div>
        </div>
      </div>
    )
  }

  return null
}

export default function DashboardUser({ onToast, onOpenCart }) {
  const [activeTab, setActiveTab] = useState('uExplore')
  const [detailEventId, setDetailEventId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [qrReservation, setQrReservation] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)

  // Store cart (products)
  const { items, removeItem, updateQty, total, count, clearCart } = useCart()
  // Event cart
  const { eventItems, removeEventItem, eventCartTotal, eventCartCount } = useEventCart()

  const { items: wishItems, toggle: toggleWish } = useWishlist()
  const { orders, placeOrder } = useOrders()
  const { reservations } = useReservations()
  const { user, logout, updateProfile } = useAuth()

  const initials = user?.avatar || user?.name?.slice(0, 2).toUpperCase() || 'AB'
  const displayName = user?.name || 'Aventurier'

  // ── Edit profile state ──
  const [editMode, setEditMode] = useState(false)
  const [profileForm, setProfileForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', bio: '', activities: [],
  })
  const [profileSaving, setProfileSaving] = useState(false)

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ')
      setProfileForm({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        activities: user.activities || [],
      })
    }
  }, [user])

  const handleField = (f, v) => setProfileForm(p => ({ ...p, [f]: v }))

  const toggleAct = (a) => setProfileForm(p => ({
    ...p,
    activities: p.activities.includes(a) ? p.activities.filter(x => x !== a) : [...p.activities, a],
  }))

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    const fullName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') || 'Aventurier'
    await updateProfile({
      name: fullName, email: profileForm.email, phone: profileForm.phone,
      bio: profileForm.bio, activities: profileForm.activities,
      avatar: fullName.slice(0, 2).toUpperCase(),
    })
    setProfileSaving(false); setEditMode(false); onToast('✅ Profil mis à jour !')
  }

  const handleCancelEdit = () => {
    if (user) {
      const parts = (user.name || '').split(' ')
      setProfileForm({ firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '', email: user.email || '', phone: user.phone || '', bio: user.bio || '', activities: user.activities || [] })
    }
    setEditMode(false)
  }

  const totalCartCount = count + eventCartCount

  const handleCheckout = async () => {
    const order = await placeOrder(items, total + 5)
    await clearCart()
    onToast(`🎉 Commande #${order.id} confirmée !`)
    setActiveTab('uOrders')
  }

  const handleViewDetail = (eventId) => setDetailEventId(eventId)
  const handleBackFromDetail = () => setDetailEventId(null)

  const handleGoReservations = () => {
    setDetailEventId(null)
    setActiveTab('uReservations')
  }

  const handleCheckoutClose = () => {
    setShowCheckout(false)
    setActiveTab('uReservations')
  }

  const titles = {
    uExplore: detailEventId ? "Détail de l'événement" : 'Explorer les événements',
    uStore: 'Boutique équipement camping',
    uCart: 'Mon panier',
    uReservations: 'Mes Réservations',
    uOrders: 'Mes Commandes',
    uWishlist: 'Ma Liste de Souhaits',
    uProfile: 'Mon Profil',
  }

  return (
    <>
      {qrReservation && <QRTicketModal reservation={qrReservation} onClose={() => setQrReservation(null)} />}
      {showCheckout && <EventCheckoutModal onClose={handleCheckoutClose} onToast={onToast} />}

      <div id="vDashUser" style={{ display: 'flex', minHeight: '100vh' }}>
        {/* SIDEBAR */}
        <aside className="usr-sidebar">
          <div className="usr-logo">
            <div className="nav-logo-mark">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B0E09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l4-8 4 4 3-6 4 10" /><path d="M3 20h18" />
              </svg>
            </div>
            <span className="usr-logo-text">TuniTrail</span>
          </div>

          <div className="usr-profile">
            <div className="usr-av">{initials}</div>
            <div className="usr-name">{displayName}</div>
            <span className="usr-role-badge">Aventurier</span>
          </div>

          <nav className="usr-nav">
            <div className="usr-nav-sec">Navigation</div>
            {TABS.map(tab => (
              <div
                key={tab.id}
                className={`usr-item${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setDetailEventId(null) }}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'uCart' && totalCartCount > 0 && <span className="usr-badge">{totalCartCount}</span>}
                {tab.id === 'uReservations' && reservations.length > 0 && <span className="usr-badge" style={{ background: 'rgba(125,184,83,.2)', color: 'var(--lime)' }}>{reservations.length}</span>}
              </div>
            ))}
            <div className="usr-nav-sec" style={{ marginTop: 12 }}>Compte</div>
            <div className="usr-item" onClick={logout}><span>🚪</span> Déconnexion</div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="usr-main">
          <div style={{ flex: 1 }}>
            <div className="usr-topbar">
              <span className="usr-page-title">{titles[activeTab]}</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="icon-btn" onClick={() => { setActiveTab('uCart'); setDetailEventId(null) }} style={{ position: 'relative' }}>
                  🛒
                  {totalCartCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -6, right: -6,
                      background: 'var(--lime)', color: '#0b0e09',
                      borderRadius: '50%', width: 18, height: 18,
                      fontSize: '.65rem', fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {totalCartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="usr-content">

              <OrgRequestStatusBanner />

              {/* EXPLORE */}
              {activeTab === 'uExplore' && detailEventId && (
                <EventDetailPage
                  eventId={detailEventId}
                  onBack={handleBackFromDetail}
                  onToast={onToast}
                  onGoReservations={handleGoReservations}
                />
              )}

              {activeTab === 'uExplore' && !detailEventId && (
                <div>
                  {/* Search Bar */}
                  <div className="ev-search-wrap">
                    <div className="ev-search-bar">
                      <svg className="ev-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        id="event-search-input"
                        type="text"
                        className="ev-search-input"
                        placeholder="Rechercher un événement, lieu, catégorie..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button className="ev-search-clear" onClick={() => setSearchQuery('')} aria-label="Effacer la recherche">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      )}
                    </div>
                    {searchQuery && (
                      <div className="ev-search-count">
                        {EVENTS.filter(ev => {
                          const q = searchQuery.toLowerCase()
                          return ev.title.toLowerCase().includes(q) || ev.loc.toLowerCase().includes(q) || ev.cat.toLowerCase().includes(q) || ev.org.toLowerCase().includes(q) || ev.diff.toLowerCase().includes(q)
                        }).length} résultat{EVENTS.filter(ev => {
                          const q = searchQuery.toLowerCase()
                          return ev.title.toLowerCase().includes(q) || ev.loc.toLowerCase().includes(q) || ev.cat.toLowerCase().includes(q) || ev.org.toLowerCase().includes(q) || ev.diff.toLowerCase().includes(q)
                        }).length > 1 ? 's' : ''} trouvé{EVENTS.filter(ev => {
                          const q = searchQuery.toLowerCase()
                          return ev.title.toLowerCase().includes(q) || ev.loc.toLowerCase().includes(q) || ev.cat.toLowerCase().includes(q) || ev.org.toLowerCase().includes(q) || ev.diff.toLowerCase().includes(q)
                        }).length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  <div className="usr-ev-grid">
                    {EVENTS.filter(ev => {
                      if (!searchQuery) return true
                      const q = searchQuery.toLowerCase()
                      return ev.title.toLowerCase().includes(q) || ev.loc.toLowerCase().includes(q) || ev.cat.toLowerCase().includes(q) || ev.org.toLowerCase().includes(q) || ev.diff.toLowerCase().includes(q)
                    }).map(ev => (
                      <EventCard
                        key={ev.id}
                        event={ev}
                        onToast={onToast}
                        onViewDetail={handleViewDetail}
                        onGoCart={() => setActiveTab('uCart')}
                      />
                    ))}
                    {searchQuery && EVENTS.filter(ev => {
                      const q = searchQuery.toLowerCase()
                      return ev.title.toLowerCase().includes(q) || ev.loc.toLowerCase().includes(q) || ev.cat.toLowerCase().includes(q) || ev.org.toLowerCase().includes(q) || ev.diff.toLowerCase().includes(q)
                    }).length === 0 && (
                      <div className="ev-search-empty">
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--cream)' }}>Aucun événement trouvé</div>
                        <div style={{ fontSize: '.85rem', color: 'rgba(240,234,216,.35)' }}>Essayez avec d'autres mots-clés comme "Camping", "Zaghouan" ou "Trek"</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STORE (embedded) */}
              {activeTab === 'uStore' && <Store onToast={onToast} embedded />}

              {/* CART */}
              {activeTab === 'uCart' && (
                <div>
                  {/* ── Section événements ── */}
                  {eventItems.length > 0 && (
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: '1rem' }}>🎫</span>
                        <span style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.95rem' }}>Billets événements</span>
                        <span style={{ background: 'rgba(125,184,83,.15)', color: 'var(--lime)', fontSize: '.72rem', fontWeight: 700, borderRadius: 20, padding: '2px 9px' }}>
                          {eventItems.length}
                        </span>
                      </div>

                      {eventItems.map(item => (
                        <div key={item.id} className="bk-card">
                          <div className={`bk-thumb ${item.cls || 'th-z'}`} />
                          <div className="bk-info">
                            <div className="bk-title">🎫 {item.title}</div>
                            <div className="bk-meta">📅 {item.date} · 📍 {item.loc}</div>
                            <div style={{ fontSize: '.75rem', color: 'rgba(125,184,83,.7)', marginTop: 4, fontWeight: 600 }}>
                              Billet QR inclus · Téléchargeable en PDF
                            </div>
                          </div>
                          <div className="bk-right">
                            <div className="bk-price">{item.price}</div>
                            <button
                              style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: '.8rem' }}
                              onClick={() => removeEventItem(item.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Event cart total + checkout */}
                      <div style={{ background: 'var(--ink2)', border: '1px solid rgba(125,184,83,.2)', borderRadius: 'var(--r2)', padding: 20, marginTop: 12 }}>
                        <div style={{ fontSize: '.8rem', color: 'rgba(240,234,216,.5)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Sous-total billets</span><span>{eventCartTotal.toFixed(0)} DT</span>
                        </div>
                        <div style={{ fontSize: '.8rem', color: 'rgba(240,234,216,.5)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                          <span>Frais de service</span><span>5 DT</span>
                        </div>
                        <div className="cart-total-row main" style={{ marginBottom: 14 }}>
                          <span>Total événements</span>
                          <span>{(eventCartTotal + 5).toFixed(0)} DT</span>
                        </div>
                        <button
                          className="btn-prime"
                          style={{ width: '100%', padding: '13px', fontSize: '.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                          onClick={() => setShowCheckout(true)}
                        >
                          💳 Payer & obtenir mes billets QR
                        </button>
                        <div style={{ marginTop: 10, fontSize: '.72rem', color: 'rgba(240,234,216,.28)', textAlign: 'center' }}>
                          Paiement sécurisé · QR code + PDF inclus · Annulation 48h
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Section produits boutique ── */}
                  {items.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: '1rem' }}>🏕</span>
                        <span style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.95rem' }}>Équipements boutique</span>
                        <span style={{ background: 'rgba(201,138,26,.15)', color: 'var(--amber)', fontSize: '.72rem', fontWeight: 700, borderRadius: 20, padding: '2px 9px' }}>
                          {count}
                        </span>
                      </div>

                      {items.map(item => (
                        <div key={item.id} className="bk-card">
                          <div className={`bk-thumb ${item.cls || 'th-z'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.icon && <span style={{ fontSize: 26 }}>{item.icon}</span>}
                          </div>
                          <div className="bk-info">
                            <div className="bk-title">{item.name || item.title}</div>
                            <div className="bk-meta">🏷 {item.cat}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                              <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                              <span className="qty-n">{item.qty}</span>
                              <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                            </div>
                          </div>
                          <div className="bk-right">
                            <div className="bk-price">{item.price}</div>
                            <button
                              style={{ marginTop: 8, background: 'none', border: 'none', color: 'var(--ember)', cursor: 'pointer', fontSize: '.8rem' }}
                              onClick={() => removeItem(item.id)}
                            >
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}

                      <div style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 20, marginTop: 12 }}>
                        <div className="cart-total-row"><span>Sous-total</span><span>{total.toFixed(0)} DT</span></div>
                        <div className="cart-total-row"><span>Frais de service</span><span>5 DT</span></div>
                        <div className="cart-total-row main"><span>Total</span><span>{(total + 5).toFixed(0)} DT</span></div>
                        <button className="btn-checkout" onClick={handleCheckout} style={{ marginTop: 14 }}>🎉 Confirmer la commande</button>
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {eventItems.length === 0 && items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,234,216,.3)' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>🎒</div>
                      <div style={{ marginBottom: 16 }}>Votre panier est vide</div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        <button className="btn-prime" onClick={() => setActiveTab('uExplore')}>🗺 Explorer les événements</button>
                        <button className="btn-ghost" onClick={() => setActiveTab('uStore')}>🏕 Aller à la boutique</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* RESERVATIONS */}
              {activeTab === 'uReservations' && (
                <div>
                  {reservations.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,234,216,.3)' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>🎫</div>
                      <div style={{ marginBottom: 16 }}>Aucune réservation pour l'instant</div>
                      <button className="btn-prime" onClick={() => setActiveTab('uExplore')}>Explorer les aventures</button>
                    </div>
                  ) : (
                    reservations.map(res => (
                      <div key={res.id} className="bk-card" style={{ alignItems: 'center' }}>
                        <div className={`bk-thumb ${res.eventCls || 'th-z'}`} />
                        <div className="bk-info">
                          <div className="bk-title">{res.eventTitle}</div>
                          <div className="bk-meta">📅 {res.eventDate} · 📍 {res.eventLoc}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--fg3)', marginTop: 4 }}>{res.id}</div>
                        </div>
                        <div className="bk-right" style={{ alignItems: 'flex-end', gap: 8 }}>
                          <div className="bk-price">{res.price}</div>
                          <span className={`sb ${res.status === 'confirmed' ? 'sb-ok' : 'sb-wait'}`}>
                            <span className="sb-dot" />
                            {res.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                          </span>
                          <button
                            className="btn-ghost"
                            style={{ fontSize: '.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
                            onClick={() => setQrReservation(res)}
                          >
                            🎟 Billet
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ORDERS */}
              {activeTab === 'uOrders' && (
                <div>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,234,216,.3)' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
                      <div style={{ marginBottom: 16 }}>Aucune commande pour l'instant</div>
                      <button className="btn-prime" onClick={() => setActiveTab('uExplore')}>Explorer les aventures</button>
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div>
                            <div className="order-ref">#{order.id}</div>
                            <div className="order-date">📅 {order.date}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="order-total">{order.total} DT</div>
                            <span className="sb sb-ok"><span className="sb-dot" />Confirmée</span>
                          </div>
                        </div>
                        <div className="order-items-list">
                          {order.items.map((item, i) => (
                            <div key={i} className="order-item-row">
                              <span style={{ fontSize: '1rem' }}>{item.icon || '📦'}</span>
                              <span className="order-item-name">{item.name || item.title}</span>
                              <span className="order-item-qty">x{item.qty}</span>
                              <span className="order-item-price">{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* WISHLIST */}
              {activeTab === 'uWishlist' && (
                <div>
                  {wishItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(240,234,216,.3)' }}>
                      <div style={{ fontSize: 48, marginBottom: 14 }}>♡</div>
                      <div style={{ marginBottom: 16 }}>Aucun article dans vos souhaits</div>
                      <button className="btn-prime" onClick={() => setActiveTab('uExplore')}>Explorer les aventures</button>
                    </div>
                  ) : (
                    <div className="usr-ev-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                      {wishItems.map(ev => (
                        <EventCard key={ev.id} event={ev} onToast={onToast} onViewDetail={handleViewDetail} onGoCart={() => setActiveTab('uCart')} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROFILE */}
              {activeTab === 'uProfile' && (
                <div>
                  {/* Header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 20 }}>
                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:800, color:'var(--cream)', margin:0 }}>
                      {editMode ? 'Modifier le profil' : 'Mon Profil'}
                    </h2>
                    {!editMode && (
                      <button className="btn-ghost" onClick={() => setEditMode(true)} style={{ display:'flex', alignItems:'center', gap:6 }}>
                        ✏️ Modifier le compte
                      </button>
                    )}
                  </div>

                  {/* ── VIEW MODE ── */}
                  {!editMode && (
                    <div className="pf-sec">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', color: '#0b0e09' }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--cream)', fontSize: '1.1rem' }}>{displayName}</div>
                          <div style={{ color: 'rgba(240,234,216,.4)', fontSize: '.82rem' }}>{user?.email}</div>
                          <span className="usr-role-badge" style={{ marginTop:6 }}>Aventurier</span>
                        </div>
                      </div>
                      {user?.phone && (
                        <div style={{ marginBottom:16, fontSize:'.88rem', color:'rgba(240,234,216,.55)' }}>📞 +216 {user.phone}</div>
                      )}
                      {user?.bio && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:'.72rem', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(240,234,216,.25)', fontWeight:600, marginBottom:6 }}>À propos</div>
                          <div style={{ fontSize:'.88rem', color:'rgba(240,234,216,.55)', lineHeight:1.7 }}>{user.bio}</div>
                        </div>
                      )}
                      {user?.activities?.length > 0 && (
                        <div style={{ marginBottom:16 }}>
                          <div style={{ fontSize:'.72rem', letterSpacing:'.08em', textTransform:'uppercase', color:'rgba(240,234,216,.25)', fontWeight:600, marginBottom:8 }}>Activités favorites</div>
                          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                            {user.activities.map(a => (
                              <span key={a} style={{ padding:'5px 14px', borderRadius:100, background:'rgba(125,184,83,.12)', border:'1px solid rgba(125,184,83,.25)', color:'var(--lime)', fontSize:'.78rem', fontWeight:600 }}>{a}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, margin:'20px 0' }}>
                        {[
                          ['🎫', reservations.length, 'Réservations'],
                          ['📦', orders.length, 'Commandes'],
                          ['♥', wishItems.length, 'Souhaits'],
                        ].map(([ico, val, lbl]) => (
                          <div key={lbl} style={{ background: 'var(--ink2)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{ico}</div>
                            <div style={{ fontWeight: 800, color: 'var(--lime)', fontSize: '1.2rem' }}>{val}</div>
                            <div style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.28)' }}>{lbl}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border2)', borderRadius: 'var(--r)', color: 'var(--fg3)', cursor: 'pointer', fontSize: '.85rem', padding: '10px 18px' }}>
                        🚪 Se déconnecter
                      </button>
                    </div>
                  )}

                  {/* ── EDIT MODE ── */}
                  {editMode && (
                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                      {/* Avatar */}
                      <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
                        <div style={{ position:'relative' }}>
                          <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'1.8rem', color:'#0b0e09' }}>
                            {profileForm.firstName ? (profileForm.firstName[0] + (profileForm.lastName?.[0] || '')).toUpperCase() : initials}
                          </div>
                          <div style={{ position:'absolute', bottom:-2, right:-2, width:28, height:28, borderRadius:'50%', background:'var(--ink2)', border:'2px solid var(--lime)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.75rem' }}>✏️</div>
                        </div>
                      </div>

                      {/* Personal info */}
                      <div className="pf-sec">
                        <div className="pf-sec-title">Informations personnelles</div>
                        <div className="pf-grid2">
                          <div>
                            <label className="pf-lbl">Prénom</label>
                            <input className="pf-inp" type="text" placeholder="Votre prénom" value={profileForm.firstName} onChange={e => handleField('firstName', e.target.value)} />
                          </div>
                          <div>
                            <label className="pf-lbl">Nom</label>
                            <input className="pf-inp" type="text" placeholder="Votre nom" value={profileForm.lastName} onChange={e => handleField('lastName', e.target.value)} />
                          </div>
                        </div>
                        <label className="pf-lbl">Email</label>
                        <input className="pf-inp" type="email" placeholder="votre@email.com" value={profileForm.email} onChange={e => handleField('email', e.target.value)} />
                        <label className="pf-lbl">Numéro de téléphone</label>
                        <div style={{ display:'flex', gap:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'0 12px', background:'var(--mist)', border:'1px solid var(--border2)', borderRight:'none', borderRadius:'var(--r) 0 0 var(--r)', fontSize:'.85rem', color:'rgba(240,234,216,.5)', whiteSpace:'nowrap' }}>
                            <span style={{ fontSize:'1.1rem' }}>🇹🇳</span>
                            <span>+216</span>
                          </div>
                          <input className="pf-inp" type="tel" placeholder="XX XXX XXX" value={profileForm.phone} onChange={e => handleField('phone', e.target.value)} style={{ borderRadius:'0 var(--r) var(--r) 0', marginBottom:0 }} />
                        </div>
                        <div style={{ fontSize:'.72rem', color:'rgba(240,234,216,.25)', marginTop:6, marginBottom:14 }}>Votre numéro ne sera utilisé que pour les notifications de réservation.</div>
                      </div>

                      {/* Bio */}
                      <div className="pf-sec">
                        <div className="pf-sec-title">À propos de moi</div>
                        <textarea className="pf-inp" placeholder="Parlez-nous de vous, de vos aventures préférées..." rows={4} value={profileForm.bio} onChange={e => handleField('bio', e.target.value)} style={{ resize:'vertical', minHeight:88 }} />
                      </div>

                      {/* Activities */}
                      <div className="pf-sec">
                        <div className="pf-sec-title">Activités favorites</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {ALL_ACTIVITIES.map(act => (
                            <button
                              key={act}
                              onClick={() => toggleAct(act)}
                              style={{
                                padding:'6px 16px', borderRadius:100, cursor:'pointer', fontSize:'.78rem', fontWeight:600, transition:'all .2s',
                                background: profileForm.activities.includes(act) ? 'var(--lime)' : 'transparent',
                                color: profileForm.activities.includes(act) ? '#0b0e09' : 'rgba(240,234,216,.45)',
                                border: profileForm.activities.includes(act) ? '1px solid var(--lime)' : '1px solid var(--border2)',
                              }}
                            >
                              {act}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:12, marginTop:6 }}>
                        <button className="btn-ghost" onClick={handleCancelEdit}>Annuler</button>
                        <button className="btn-prime" onClick={handleSaveProfile} disabled={profileSaving} style={{ display:'flex', alignItems:'center', gap:8, opacity: profileSaving ? .7 : 1 }}>
                          {profileSaving ? '⏳ Enregistrement...' : '💾 Enregistrer les modifications'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  )
}
