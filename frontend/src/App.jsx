import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { OrdersProvider } from './context/OrdersContext'
import { ReservationsProvider } from './context/ReservationsContext'
import { EventCartProvider } from './context/EventCartContext'
import { useToast } from './hooks/useToast'
import Navbar from './components/Navbar'
import Modal from './components/Modal'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Landing from './pages/Landing'
import Store from './pages/Store'
import Destinations from './pages/Destinations'
import Community from './pages/Community'
import DashboardUser from './pages/DashboardUser'
import DashboardOrg from './pages/DashboardOrg'
import DashboardAdmin from './pages/DashboardAdmin'

function AppInner() {
  const { user, loading } = useAuth()
  const { toasts, toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [view, setView] = useState('landing')

  const handleGoLanding = () => setView('landing')
  const handleGoStore = () => setView('store')
  const handleGoDestinations = () => setView('destinations')
  const handleGoCommunity = () => setView('community')

  // Redirect after login/logout
  useEffect(() => {
    if (loading) return
    if (user && view === 'landing') {
      if (user.role === 'admin') setView('admin')
      else if (user.role === 'org') setView('org')
      else setView('user')
    }
    if (!user && (view === 'user' || view === 'org' || view === 'admin')) {
      setView('landing')
    }
  }, [user, loading])

  // Show a minimal loader while rehydrating session from backend
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg, #0b0e09)', color: 'var(--fg, #f0ead8)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🏕️</div>
          <div style={{ opacity: 0.5, fontSize: '0.85rem' }}>Chargement…</div>
        </div>
      </div>
    )
  }

  const showNav = view === 'landing' || view === 'store' || view === 'destinations' || view === 'community'

  return (
    <>
      {showNav && (
        <Navbar
          onOpenModal={(type) => setModalOpen(type)}
          onOpenCart={() => setCartOpen(true)}
          onGoLanding={handleGoLanding}
          onGoStore={handleGoStore}
          onGoDestinations={handleGoDestinations}
          onGoCommunity={handleGoCommunity}
          currentView={view}
        />
      )}
      {view === 'landing'      && <Landing onOpenModal={(type) => setModalOpen(type)} onToast={toast} onGoStore={handleGoStore} />}
      {view === 'store'        && <Store onToast={toast} />}
      {view === 'destinations' && <Destinations />}
      {view === 'community'    && <Community />}
      {view === 'user'         && <DashboardUser onToast={toast} onOpenCart={() => setCartOpen(true)} />}
      {view === 'org'          && <DashboardOrg onToast={toast} />}
      {view === 'admin'        && <DashboardAdmin onToast={toast} />}

      <Modal open={!!modalOpen} initialView={modalOpen || 'login'} onClose={() => setModalOpen(false)} onToast={toast} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onToast={toast} />
      <Toast toasts={toasts} />
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <OrdersProvider>
            <ReservationsProvider>
              <EventCartProvider>
                <AppInner />
              </EventCartProvider>
            </ReservationsProvider>
          </OrdersProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
