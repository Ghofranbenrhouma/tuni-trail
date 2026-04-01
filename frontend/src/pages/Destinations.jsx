import { useState } from 'react'

const DESTINATIONS = [
  {
    id: 1,
    name: 'Zaghouan',
    fullName: 'Camping Zaghouan',
    type: 'Camping',
    altitude: '1 295m',
    difficulty: 'Modéré',
    diffClass: 'diff-mod',
    duration: '2 jours',
    rating: 4.8,
    reviews: 124,
    lat: 36.40,
    lng: 10.14,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop',
    description: 'Au pied du majestueux Jebel Zaghouan, découvrez un camping d\'exception avec des panoramas à couper le souffle sur la campagne tunisienne.',
    highlights: ['Vue panoramique', 'Source thermale', 'Sentiers balisés'],
    season: 'Mars - Nov',
    emoji: '🏔️',
    gradient: 'linear-gradient(135deg, #102008, #2f5420)'
  },
  {
    id: 2,
    name: 'Tataouine',
    fullName: 'Bivouac Tataouine',
    type: 'Bivouac',
    altitude: '860m',
    difficulty: 'Difficile',
    diffClass: 'diff-hard',
    duration: '3 jours',
    rating: 4.9,
    reviews: 89,
    lat: 32.93,
    lng: 10.45,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop',
    description: 'Vivez l\'aventure ultime dans les paysages désertiques de Tataouine, entre dunes de sable et ksour millénaires.',
    highlights: ['Nuits étoilées', 'Ksour berbères', 'Dunes dorées'],
    season: 'Oct - Avr',
    emoji: '🏜️',
    gradient: 'linear-gradient(135deg, #241008, #6b2e12)'
  },
  {
    id: 3,
    name: 'Ichkeul',
    fullName: 'Trek Ichkeul',
    type: 'Trek',
    altitude: '511m',
    difficulty: 'Facile',
    diffClass: 'diff-easy',
    duration: '1 jour',
    rating: 4.7,
    reviews: 203,
    lat: 37.16,
    lng: 9.67,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
    description: 'Parc national classé UNESCO, Ichkeul offre une biodiversité exceptionnelle avec son lac et ses zones humides.',
    highlights: ['Site UNESCO', 'Ornithologie', 'Lac naturel'],
    season: 'Toute l\'année',
    emoji: '🦅',
    gradient: 'linear-gradient(135deg, #0b1c2e, #163a5a)'
  },
  {
    id: 4,
    name: 'Tozeur',
    fullName: 'Camping Tozeur',
    type: 'Camping',
    altitude: '385m',
    difficulty: 'Facile',
    diffClass: 'diff-easy',
    duration: '2 jours',
    rating: 4.6,
    reviews: 167,
    lat: 33.92,
    lng: 8.13,
    image: 'https://images.unsplash.com/photo-1542401886-65d6c61db217?w=600&h=400&fit=crop',
    description: 'Oasis luxuriante aux portes du Sahara, Tozeur séduit par ses palmeraies, son architecture unique et ses couchers de soleil légendaires.',
    highlights: ['Palmeraie', 'Oasis de montagne', 'Architecture'],
    season: 'Oct - Mai',
    emoji: '🌴',
    gradient: 'linear-gradient(135deg, #1a1508, #4a3c16)'
  },
  {
    id: 5,
    name: 'Tabarka',
    fullName: 'Rando Tabarka',
    type: 'Randonnée',
    altitude: '600m',
    difficulty: 'Modéré',
    diffClass: 'diff-mod',
    duration: '1 jour',
    rating: 4.8,
    reviews: 142,
    lat: 36.95,
    lng: 8.76,
    image: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop',
    description: 'Entre mer et montagne, Tabarka offre des sentiers de randonnée à travers des forêts de chênes-lièges et des falaises côtières spectaculaires.',
    highlights: ['Forêts de chênes', 'Côte sauvage', 'Plongée'],
    season: 'Avr - Oct',
    emoji: '🌊',
    gradient: 'linear-gradient(135deg, #0c1c14, #224a30)'
  },
  {
    id: 6,
    name: 'Djerba',
    fullName: 'Kayak Djerba',
    type: 'Kayak',
    altitude: '3m',
    difficulty: 'Facile',
    diffClass: 'diff-easy',
    duration: '1 jour',
    rating: 4.5,
    reviews: 231,
    lat: 33.81,
    lng: 10.94,
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop',
    description: 'L\'île des rêves vous accueille pour des excursions en kayak le long de côtes turquoise et de plages de sable fin immaculées.',
    highlights: ['Eaux turquoise', 'Plages vierges', 'Culture locale'],
    season: 'Mai - Oct',
    emoji: '🏖️',
    gradient: 'linear-gradient(135deg, #160c24, #3c1e5c)'
  },
  {
    id: 7,
    name: 'Jebel Boubaker',
    fullName: 'Escalade Jebel Boubaker',
    type: 'Escalade',
    altitude: '2 000m',
    difficulty: 'Difficile',
    diffClass: 'diff-hard',
    duration: '2 jours',
    rating: 4.9,
    reviews: 56,
    lat: 35.89,
    lng: 9.94,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
    description: 'Le point culminant de la dorsale tunisienne offre aux grimpeurs confirmés un défi exaltant avec des voies d\'escalade techniques.',
    highlights: ['Sommet tunisien', 'Voies techniques', 'Vue 360°'],
    season: 'Avr - Nov',
    emoji: '🧗',
    gradient: 'linear-gradient(135deg, #201a08, #5a4018)'
  },
  {
    id: 8,
    name: 'Douz',
    fullName: 'Bivouac Douz',
    type: 'Bivouac',
    altitude: '480m',
    difficulty: 'Modéré',
    diffClass: 'diff-mod',
    duration: '3 jours',
    rating: 4.7,
    reviews: 178,
    lat: 33.46,
    lng: 8.97,
    image: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&h=400&fit=crop&q=80',
    description: 'Porte du Sahara, Douz est le point de départ idéal pour des expéditions dans le Grand Erg Oriental et des nuits inoubliables sous les étoiles.',
    highlights: ['Porte du Sahara', 'Méharées', 'Festival'],
    season: 'Oct - Avr',
    emoji: '🐪',
    gradient: 'linear-gradient(135deg, #2a1a0e, #3a2814)'
  }
]

const FILTER_TYPES = ['Tous', 'Camping', 'Bivouac', 'Trek', 'Randonnée', 'Kayak', 'Escalade']

export default function Destinations() {
  const [selectedDest, setSelectedDest] = useState(null)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const [hoveredCard, setHoveredCard] = useState(null)

  const filtered = activeFilter === 'Tous'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.type === activeFilter)

  const renderStars = (rating) => {
    const full = Math.floor(rating)
    const half = rating % 1 >= 0.5
    let stars = ''
    for (let i = 0; i < full; i++) stars += '★'
    if (half) stars += '★'
    return stars
  }

  return (
    <div className="dest-root">
      {/* Hero */}
      <div className="dest-hero">
        <div className="dest-hero-bg" />
        <div className="dest-hero-content">
          <div className="dest-hero-text">
            <div className="dest-hero-badge">
              <span className="dest-hero-badge-dot" />
              <span>8 destinations</span>
            </div>
            <h1 className="dest-hero-title">
              Explorez la <em>Tunisie</em> sauvage
            </h1>
            <p className="dest-hero-sub">
              Des montagnes du nord aux dunes du Sahara, découvrez les plus beaux sites naturels pour votre prochaine aventure en plein air.
            </p>
          </div>
          <div className="dest-hero-stats">
            <div className="dest-stat">
              <span className="dest-stat-num">8</span>
              <span className="dest-stat-lbl">Destinations</span>
            </div>
            <div className="dest-stat-div" />
            <div className="dest-stat">
              <span className="dest-stat-num">1.2k</span>
              <span className="dest-stat-lbl">Aventuriers</span>
            </div>
            <div className="dest-stat-div" />
            <div className="dest-stat">
              <span className="dest-stat-num">4.7</span>
              <span className="dest-stat-lbl">Note moyenne</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="dest-filters-wrap">
        <div className="dest-filters">
          {FILTER_TYPES.map(type => (
            <button
              key={type}
              className={`dest-filter-btn${activeFilter === type ? ' active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              {type}
            </button>
          ))}
          <div className="dest-filter-count">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dest-content">
        {/* Grid */}
        <div className="dest-grid">
          {filtered.map(dest => (
            <div
              key={dest.id}
              className={`dest-card${selectedDest?.id === dest.id ? ' selected' : ''}`}
              onClick={() => setSelectedDest(selectedDest?.id === dest.id ? null : dest)}
              onMouseEnter={() => setHoveredCard(dest.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Card Image */}
              <div className="dest-card-img">
                <img src={dest.image} alt={dest.name} loading="lazy" />
                <div className="dest-card-img-overlay" />

                {/* Difficulty Badge */}
                <div className={`dest-card-diff ${dest.diffClass}`}>
                  {dest.difficulty}
                </div>

                {/* Type Badge */}
                <div className="dest-card-type">
                  <span>{dest.emoji}</span> {dest.type}
                </div>

                {/* Rating */}
                <div className="dest-card-rating-float">
                  <span className="dest-card-star">★</span> {dest.rating}
                </div>
              </div>

              {/* Card Body */}
              <div className="dest-card-body">
                <div className="dest-card-name">{dest.fullName}</div>
                <p className="dest-card-desc">{dest.description}</p>

                {/* Meta Row */}
                <div className="dest-card-meta">
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17l4-8 4 4 3-6 4 10"/><path d="M3 20h18"/>
                    </svg>
                    {dest.altitude}
                  </span>
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {dest.duration}
                  </span>
                  <span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {dest.season}
                  </span>
                </div>

                {/* Highlights */}
                <div className="dest-card-highlights">
                  {dest.highlights.map((h, i) => (
                    <span key={i} className="dest-highlight-tag">
                      {h}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="dest-card-foot">
                  <div className="dest-card-reviews">
                    <span className="dest-card-stars">{renderStars(dest.rating)}</span>
                    <span className="dest-card-review-count">{dest.reviews} avis</span>
                  </div>
                  <button className="dest-card-explore-btn">
                    Explorer
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel (slides up when a card is selected) */}
      {selectedDest && (
        <div className="dest-detail-panel">
          <div className="dest-detail-inner">
            <button className="dest-detail-close" onClick={() => setSelectedDest(null)}>✕</button>

            <div className="dest-detail-grid">
              {/* Left: Image */}
              <div className="dest-detail-img">
                <img src={selectedDest.image} alt={selectedDest.name} />
                <div className="dest-detail-img-overlay" />
                <div className="dest-detail-img-info">
                  <span className="dest-detail-emoji">{selectedDest.emoji}</span>
                  <span className="dest-detail-type-badge">{selectedDest.type}</span>
                </div>
              </div>

              {/* Right: Info */}
              <div className="dest-detail-info">
                <div className={`dest-detail-diff ${selectedDest.diffClass}`}>{selectedDest.difficulty}</div>
                <h2 className="dest-detail-name">{selectedDest.fullName}</h2>
                <p className="dest-detail-desc">{selectedDest.description}</p>

                {/* Stats grid */}
                <div className="dest-detail-stats">
                  <div className="dest-detail-stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 17l4-8 4 4 3-6 4 10"/><path d="M3 20h18"/>
                    </svg>
                    <div>
                      <div className="dest-detail-stat-val">{selectedDest.altitude}</div>
                      <div className="dest-detail-stat-lbl">Altitude</div>
                    </div>
                  </div>
                  <div className="dest-detail-stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <div>
                      <div className="dest-detail-stat-val">{selectedDest.duration}</div>
                      <div className="dest-detail-stat-lbl">Durée</div>
                    </div>
                  </div>
                  <div className="dest-detail-stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <div>
                      <div className="dest-detail-stat-val">{selectedDest.rating}/5</div>
                      <div className="dest-detail-stat-lbl">{selectedDest.reviews} avis</div>
                    </div>
                  </div>
                  <div className="dest-detail-stat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <div>
                      <div className="dest-detail-stat-val">{selectedDest.season}</div>
                      <div className="dest-detail-stat-lbl">Saison idéale</div>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="dest-detail-highlights">
                  <div className="dest-detail-highlights-title">Points forts</div>
                  <div className="dest-detail-highlights-list">
                    {selectedDest.highlights.map((h, i) => (
                      <div key={i} className="dest-detail-highlight-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {h}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coordinates */}
                <div className="dest-detail-coords">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {selectedDest.lat.toFixed(2)}°N, {selectedDest.lng.toFixed(2)}°E
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
