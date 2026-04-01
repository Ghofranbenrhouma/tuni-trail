import { useState } from 'react'
import EventCard from '../components/EventCard'
import Marquee from '../components/Marquee'
import { EVENTS, STORE_PRODUCTS } from '../utils/data'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const CATS = ['Tous', 'Camping', 'Trek', 'Bivouac', 'Rando', 'Escalade', 'Kayak']

const FEATURES = [
  { icon: '🗺', cls: 'g', title: 'Itinéraires vérifiés', desc: 'Chaque parcours est inspecté par nos guides certifiés pour garantir sécurité et authenticité.', n: '01' },
  { icon: '🔒', cls: 'a', title: 'Paiement sécurisé', desc: 'Transactions protégées, remboursement garanti jusqu\'à 48h avant le départ.', n: '02' },
  { icon: '🌿', cls: 'b', title: 'Éco-responsable', desc: 'Partenaires engagés dans la préservation de l\'environnement naturel tunisien.', n: '03', wide: true },
  { icon: '📍', cls: 'g', title: 'Guides locaux', desc: 'Des experts qui connaissent chaque sentier, chaque nuit étoilée.', n: '04' },
]

const TESTIMONIALS = [
  { stars: 5, quote: 'Une expérience magique au cœur de la nature tunisienne. Organisation parfaite, guides passionnés.', name: 'Amira B.', role: 'Aventurière', badge: 'Camping Zaghouan', av: { bg: 'rgba(125,184,83,.15)', c: 'var(--lime2)' } },
  { stars: 4, quote: 'Trek Ichkeul était sublime. Je n\'aurais jamais trouvé ce lieu sans TuniTrail. Merci !', name: 'Karim L.', role: 'Randonneur', badge: 'Trek Ichkeul', av: { bg: 'rgba(201,138,26,.15)', c: 'var(--amber)' } },
  { stars: 5, quote: 'Bivouac sous les étoiles de Tataouine — une nuit inoubliable. Je recommande à 100%.', name: 'Sara M.', role: 'Photographe', badge: 'Bivouac Ksar', av: { bg: 'rgba(100,148,216,.15)', c: '#a0b8d8' } },
]

const FEATURED_PRODUCTS = STORE_PRODUCTS.filter(p => p.badge === 'Bestseller').slice(0, 4)

function StoreLandingPreview({ onGoStore, onToast }) {
  const { addItem } = useCart()
  const { user } = useAuth()
  const [addedIds, setAddedIds] = useState(new Set())

  const handleAdd = (product, e) => {
    e.stopPropagation()
    if (!user) { onToast && onToast('⚠️ Connectez-vous pour ajouter au panier'); return }
    addItem(product)
    setAddedIds(prev => new Set([...prev, product.id]))
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(product.id); return n }), 1800)
    onToast && onToast(`✓ ${product.name} ajouté au panier`)
  }

  return (
    <section className="sec" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(125,184,83,.04) 50%, transparent 100%)' }}>
      <div className="sec-head">
        <div>
          <div className="sec-ey">🏕 Boutique équipement</div>
          <h2 className="sec-h">Équipez-vous pour l'aventure</h2>
          <p className="sec-sub">Tentes, sacs de couchage, réchauds et plus — tout pour vos sorties en Tunisie</p>
        </div>
        <button className="btn-ghost" onClick={onGoStore} style={{ whiteSpace: 'nowrap' }}>
          Voir tout →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginTop: 24 }}>
        {FEATURED_PRODUCTS.map(product => (
          <div key={product.id} className="prod-card" style={{ cursor: 'default' }}>
            <div className={`prod-img ${product.cls}`}>
              <span className="prod-icon">{product.icon}</span>
              <span className={`prod-badge ${product.badgeCls}`}>{product.badge}</span>
            </div>
            <div className="prod-body">
              <div className="prod-cat-tag">{product.cat}</div>
              <div className="prod-name">{product.name}</div>
              <div className="prod-desc">{product.desc}</div>
              <div className="prod-foot">
                <div className="prod-price">{product.price}</div>
                <button
                  className={`btn-add-prod${addedIds.has(product.id) ? ' added' : ''}`}
                  onClick={(e) => handleAdd(product, e)}
                >
                  {addedIds.has(product.id) ? '✓ Ajouté' : '🛒 Ajouter'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button className="btn-hero2" onClick={onGoStore}>
          Explorer toute la boutique — {STORE_PRODUCTS.length} produits
        </button>
      </div>
    </section>
  )
}

export default function Landing({ onOpenModal, onToast, onGoStore }) {
  const [activecat, setActiveCat] = useState('Tous')

  const filtered = activecat === 'Tous' ? EVENTS : EVENTS.filter(e => e.cat === activecat)

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-media">
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0e2208 0%, #1a3a0a 35%, #0b1a06 70%, #102008 100%)' }} />
        </div>
        <div className="hero-overlay" />
        <div className="hero-overlay2" />

        <div className="hero-body">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Plateforme N°1 du tourisme nature en Tunisie
          </div>
          <h1 className="hero-h">
            Explorez la<br /><em>Tunisie sauvage</em>
          </h1>
          <p className="hero-sub">
            Campings, treks, bivouacs et aventures nature organisés par des experts locaux passionnés.
          </p>
          <div className="hero-acts">
            <button className="btn-hero" onClick={() => document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Découvrir les aventures
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="btn-hero2" onClick={() => onOpenModal('register')}>
              Devenir organisateur
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">4.9★</div>
            <div className="hero-stat-lbl">Note moyenne</div>
          </div>
          <div className="hero-stat-div" />
          <div>
            <div className="hero-stat-num">12k+</div>
            <div className="hero-stat-lbl">Aventuriers</div>
          </div>
          <div className="hero-stat-div" />
          <div>
            <div className="hero-stat-num">340+</div>
            <div className="hero-stat-lbl">Aventures</div>
          </div>
        </div>
      </section>

      <Marquee />

      {/* EVENTS */}
      <section id="events-section" className="sec">
        <div className="sec-lbl">
          <div className="sec-lbl-line" />
          <span className="sec-lbl-text">Aventures disponibles</span>
        </div>
        <h2 className="sec-h">Explorez nos <em>expériences</em></h2>
        <p className="sec-sub" style={{ marginBottom: 36 }}>
          Des aventures authentiques sélectionnées dans les plus beaux sites naturels de Tunisie.
        </p>

        <div className="cat-row">
          {CATS.map(cat => (
            <button
              key={cat}
              className={`cat-pill${activecat === cat ? ' active' : ''}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ev-grid">
          {filtered.map(ev => (
            <EventCard key={ev.id} event={ev} onToast={onToast} />
          ))}
        </div>
      </section>

      {/* FEATURES BENTO */}
      <section className="sec-full" style={{ background: 'var(--ink2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto' }}>
          <div className="sec-lbl">
            <div className="sec-lbl-line" />
            <span className="sec-lbl-text">Pourquoi TuniTrail</span>
          </div>
          <h2 className="sec-h" style={{ marginBottom: 36 }}>La plateforme <em>de confiance</em></h2>
          <div className="bento">
            {FEATURES.map((f, i) => (
              <div key={i} className={`ben${f.wide ? ' wide' : ''}`}>
                <div className={`ben-icon ${f.cls}`}>
                  <span style={{ fontSize: 22 }}>{f.icon}</span>
                </div>
                <div className="ben-title">{f.title}</div>
                <div className="ben-desc">{f.desc}</div>
                <div className="ben-num">{f.n}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec">
        <div className="sec-lbl">
          <div className="sec-lbl-line" />
          <span className="sec-lbl-text">Avis aventuriers</span>
        </div>
        <h2 className="sec-h">Ce qu'ils <em>disent</em></h2>
        <div className="test-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="test-card">
              <div className="test-stars">{'★'.repeat(t.stars)}</div>
              <p className="test-quote">"{t.quote}"</p>
              <div className="test-user">
                <div className="test-av" style={{ background: t.av.bg, color: t.av.c }}>
                  {t.name.split(' ').map(x => x[0]).join('')}
                </div>
                <div>
                  <div className="test-name">{t.name}</div>
                  <div className="test-role">{t.role}</div>
                </div>
              </div>
              <div className="test-badge">{t.badge}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STORE PREVIEW */}
      <StoreLandingPreview onGoStore={onGoStore} onToast={onToast} />

      {/* CTA */}
      <div className="cta-strip">
        <div>
          <h2 className="cta-h">Prêt pour votre prochaine <em>aventure</em> ?</h2>
          <p className="cta-sub">Rejoignez 12 000+ aventuriers qui explorent la Tunisie avec TuniTrail.</p>
        </div>
        <button className="btn-cta" onClick={() => onOpenModal('register')}>
          Commencer l'aventure
        </button>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">TuniTrail</div>
            <p className="footer-desc">La plateforme de référence pour le tourisme nature et l'aventure en Tunisie.</p>
          </div>
          {[
            { title: 'Explorer', links: ['Campings', 'Treks', 'Bivouacs', 'Escalade'] },
            { title: 'Organisateurs', links: ['Créer un événement', 'Tableau de bord', 'Scanner QR', 'Statistiques'] },
            { title: 'Support', links: ['À propos', 'Contact', 'FAQ', 'Conditions'] },
          ].map((col, i) => (
            <div key={i}>
              <div className="footer-col-title">{col.title}</div>
              {col.links.map(l => <span key={l} className="footer-link">{l}</span>)}
            </div>
          ))}
        </div>
        <div className="footer-bot">
          <span>© 2026 TuniTrail. Tous droits réservés.</span>
          <span>Fait avec ♥ en Tunisie</span>
        </div>
      </footer>
    </>
  )
}
