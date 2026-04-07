import { useState, useMemo, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { productsApi } from '../services/api'
import { STORE_PRODUCTS, STORE_CATEGORIES } from '../utils/data'
import ProductDrawer from '../components/ProductDrawer'

function StarRating({ rating }) {
  const full = Math.round(parseFloat(rating))
  return (
    <span style={{ color: 'var(--amber)', fontSize: '.8rem' }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

// Normalize API product row to UI shape
function normalizeProduct(p) {
  // If it's already in UI format (from static data), return as-is
  if (p.cat !== undefined) return p
  return {
    id: p.id,
    name: p.name,
    cat: p.category,
    desc: p.description || '',
    price: p.price,
    priceNum: p.price_num || 0,
    icon: p.icon || '🎒',
    cls: p.css_class || 'th-z',
    badge: p.badge || null,
    badgeCls: p.badge_cls || '',
    rating: p.rating || '4.5',
    rev: p.reviews_count || 0,
  }
}

export default function Store({ onToast, embedded }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const [activeCat, setActiveCat] = useState('Tous')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popular')
  const [addedIds, setAddedIds] = useState(new Set())
  const [selected, setSelected] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [products, setProducts] = useState(STORE_PRODUCTS.map(normalizeProduct))
  const [categories, setCategories] = useState(STORE_CATEGORIES)

  // Load products from API
  useEffect(() => {
    productsApi.getAll()
      .then(rows => { if (rows && rows.length > 0) setProducts(rows.map(normalizeProduct)) })
      .catch(() => {})
    productsApi.getCategories()
      .then(cats => { if (cats && cats.length > 0) setCategories(cats) })
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let list = products
    if (activeCat !== 'Tous') list = list.filter(p => p.cat === activeCat || p.category === activeCat)
    if (search.trim()) list = list.filter(p =>
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.desc || p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.cat || p.category || '').toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'price-asc') list = [...list].sort((a, b) => (a.priceNum||a.price_num||0) - (b.priceNum||b.price_num||0))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => (b.priceNum||b.price_num||0) - (a.priceNum||a.price_num||0))
    else if (sort === 'rating') list = [...list].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
    else list = [...list].sort((a, b) => (b.rev||b.reviews_count||0) - (a.rev||a.reviews_count||0))
    return list
  }, [products, activeCat, search, sort])

  const handleAdd = (product, e) => {
    e.stopPropagation()
    if (!user) { onToast && onToast('⚠️ Connectez-vous pour ajouter au panier'); return }
    addItem(product)
    setAddedIds(prev => new Set([...prev, product.id]))
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n }), 1800)
    onToast && onToast(`✓ ${product.name} ajouté au panier`)
  }

  const openDetail = (product) => {
    setSelected(product)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="store-page">
        {/* HEADER */}
        <div className="store-header">
          <div>
            <h1 className="store-title"><span style={{ fontSize: '1.6rem' }}>🏕</span> Boutique Équipement</h1>
            <p className="store-subtitle">Tout l'équipement pour vos aventures en Tunisie · {products.length} produits</p>
          </div>
          <div className="store-controls">
            <div className="store-search-wrap">
              <span className="store-search-icon">🔍</span>
              <input
                className="store-search"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--fg3)', cursor: 'pointer', fontSize: '.85rem' }}>✕</button>
              )}
            </div>
            <select className="store-sort" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="popular">Plus populaires</option>
              <option value="rating">Meilleures notes</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="store-cats">
          {categories.map(cat => (
            <button
              key={cat}
              className={`store-cat-btn${activeCat === cat ? ' active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="store-count">
          {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
          {activeCat !== 'Tous' ? ` dans "${activeCat}"` : ''}
          {search ? ` · recherche "${search}"` : ''}
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="store-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ marginBottom: 12 }}>Aucun produit trouvé</div>
            <button className="store-cat-btn active" onClick={() => { setSearch(''); setActiveCat('Tous') }}>
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="store-grid">
            {filtered.map(product => (
              <div key={product.id} className="prod-card" onClick={() => openDetail(product)} style={{ cursor: 'pointer' }}>
                <div className={`prod-img ${product.cls || product.css_class || 'th-z'}`}>
                  <span className="prod-icon">{product.icon || '🎒'}</span>
                  {(product.badge) && <span className={`prod-badge ${product.badgeCls || product.badge_cls || ''}`}>{product.badge}</span>}
                  <div className="prod-view-hint">Voir détails →</div>
                </div>
                <div className="prod-body">
                  <div className="prod-cat-tag">{product.cat || product.category}</div>
                  <div className="prod-name">{product.name}</div>
                  <div className="prod-desc">{product.desc || product.description}</div>
                  <div className="prod-rating-row">
                    <StarRating rating={product.rating} />
                    <span className="prod-rev">{product.rating} ({product.rev || product.reviews_count || 0})</span>
                  </div>
                  <div className="prod-foot">
                    <div className="prod-price">{product.price}</div>
                    <button
                      className={`btn-add-prod${addedIds.has(product.id) ? ' added' : ''}`}
                      onClick={(e) => handleAdd(product, e)}
                    >
                      {addedIds.has(product.id) ? '✓' : '🛒'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT DRAWER */}
      <ProductDrawer
        product={selected}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onToast={onToast}
      />
    </>
  )
}
