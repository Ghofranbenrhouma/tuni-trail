import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useReservations } from '../context/ReservationsContext'
import { useWishlist } from '../context/WishlistContext'
import { EVENTS, EVENTS_DETAIL } from '../utils/data'
import { reviewsApi } from '../services/api'
import { diffClass } from '../utils/helpers'
import GoogleMap from '../components/GoogleMap'

/* ── PDF Download helper ─────────────────────────────────────────────── */
async function downloadTicketPDF(reservation, event, option) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const W = 210, H = 297
  const margin = 20

  // Background
  doc.setFillColor(11, 14, 9)
  doc.rect(0, 0, W, H, 'F')

  // Green accent border
  doc.setDrawColor(125, 184, 83)
  doc.setLineWidth(1.2)
  doc.roundedRect(margin - 5, margin - 5, W - (margin - 5) * 2, H - (margin - 5) * 2, 6, 6, 'S')

  // Header logo text
  doc.setFontSize(24)
  doc.setTextColor(125, 184, 83)
  doc.setFont('helvetica', 'bold')
  doc.text('TuniTrail', margin, margin + 18)

  doc.setFontSize(9)
  doc.setTextColor(160, 160, 140)
  doc.setFont('helvetica', 'normal')
  doc.text('BILLET ÉLECTRONIQUE OFFICIEL', margin, margin + 26)

  // Divider
  doc.setDrawColor(125, 184, 83)
  doc.setLineWidth(0.4)
  doc.line(margin, margin + 30, W - margin, margin + 30)

  // Event title
  doc.setFontSize(18)
  doc.setTextColor(240, 234, 216)
  doc.setFont('helvetica', 'bold')
  doc.text(event.title, margin, margin + 44)

  // Event info grid
  const info = [
    ['📅 Date', event.date || '—'],
    ['📍 Lieu', event.loc || '—'],
    ['⏱ Durée', event.dur || '—'],
    ['🎫 Option', option?.label || reservation.optionLabel || 'Standard'],
    ['💰 Montant', (option?.price ? `${option.price} DT` : reservation.price) || '—'],
    ['🔖 Référence', reservation.id],
  ]

  doc.setFontSize(10)
  let y = margin + 56
  info.forEach(([label, value]) => {
    doc.setTextColor(150, 150, 130)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin, y)
    doc.setTextColor(240, 234, 216)
    doc.setFont('helvetica', 'bold')
    doc.text(String(value), margin + 48, y)
    y += 9
  })

  // Divider
  doc.setDrawColor(60, 70, 50)
  doc.line(margin, y + 4, W - margin, y + 4)
  y += 14

  // QR Code section
  doc.setFontSize(11)
  doc.setTextColor(125, 184, 83)
  doc.setFont('helvetica', 'bold')
  doc.text('QR CODE D\'ACCÈS', margin, y)

  doc.setFontSize(8)
  doc.setTextColor(120, 120, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('Présentez ce code à l\'entrée de l\'événement', margin, y + 6)

  // QR code image (centered)
  if (reservation.qrDataURL) {
    const qrSize = 60
    const qrX = (W - qrSize) / 2
    doc.addImage(reservation.qrDataURL, 'PNG', qrX, y + 12, qrSize, qrSize)

    // White frame around QR
    doc.setDrawColor(240, 234, 216)
    doc.setLineWidth(0.5)
    doc.roundedRect(qrX - 2, y + 10, qrSize + 4, qrSize + 4, 3, 3, 'S')
  }

  y += 80

  // Reservation ID below QR
  doc.setFontSize(12)
  doc.setTextColor(125, 184, 83)
  doc.setFont('helvetica', 'bold')
  doc.text(reservation.id, W / 2, y, { align: 'center' })

  // Warning
  y += 12
  doc.setFontSize(7.5)
  doc.setTextColor(100, 100, 90)
  doc.setFont('helvetica', 'italic')
  doc.text('Ce billet est strictement personnel et non transférable. Ne le partagez pas.', W / 2, y, { align: 'center' })

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(80, 90, 70)
  doc.setFont('helvetica', 'normal')
  doc.text(`Réservé le ${reservation.createdAt} · TuniTrail © ${new Date().getFullYear()}`, W / 2, H - margin + 5, { align: 'center' })

  doc.save(`TuniTrail-Billet-${reservation.id}.pdf`)
}

/* ── Payment confirmation modal ─────────────────────────────────────── */
function PaymentModal({ event, option, onClose, onConfirm }) {
  const [step, setStep] = useState('pay') // 'pay' | 'success'
  const [reservation, setReservation] = useState(null)
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paying, setPaying] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePay = async () => {
    if (!cardNum || !expiry || !cvv) return
    setPaying(true)
    setError(null)
    try {
      const result = await onConfirm(event, option)
      setReservation(result)
      setStep('success')
    } catch (err) {
      console.error('Payment error:', err)
      setError('Erreur lors du paiement. Veuillez réessayer.')
    } finally {
      setPaying(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!reservation) return
    setDlLoading(true)
    try {
      await downloadTicketPDF(reservation, event, option)
    } finally {
      setDlLoading(false)
    }
  }

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.82)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--ink2)', border: '1px solid var(--border2)',
          borderRadius: 'var(--r3)', padding: '32px 28px',
          maxWidth: 440, width: '100%', maxHeight: '90vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {step === 'pay' ? (
          <>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)', marginBottom: 4, fontFamily: "'Playfair Display', serif" }}>
              Paiement sécurisé
            </div>
            <div style={{ fontSize: '.82rem', color: 'rgba(240,234,216,.45)', marginBottom: 24 }}>
              {event.title} — {option.label}
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(224,92,92,.08)', border: '1px solid rgba(224,92,92,.25)',
                borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 16,
                fontSize: '.82rem', color: '#e05c5c', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Summary */}
            <div style={{ background: 'rgba(125,184,83,.07)', border: '1px solid rgba(125,184,83,.18)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '.85rem', color: 'rgba(240,234,216,.6)' }}>
                <span>{option.desc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', color: 'var(--cream)', fontFamily: "'Playfair Display', serif" }}>
                <span>Total</span>
                <span style={{ color: 'var(--lime)' }}>{option.price} DT</span>
              </div>
            </div>

            {/* Card fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: '.75rem', color: 'rgba(240,234,216,.45)', display: 'block', marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                  Numéro de carte
                </label>
                <input
                  className="pf-inp"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={e => setCardNum(fmtCard(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '.75rem', color: 'rgba(240,234,216,.45)', display: 'block', marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' }}>Expiration</label>
                  <input
                    className="pf-inp"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={e => setExpiry(fmtExp(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '.75rem', color: 'rgba(240,234,216,.45)', display: 'block', marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase' }}>CVV</label>
                  <input
                    className="pf-inp"
                    placeholder="123"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    type="password"
                  />
                </div>
              </div>
            </div>

            <button
              className="btn-prime"
              style={{ width: '100%', padding: '13px', fontSize: '.9rem', opacity: paying ? 0.7 : 1 }}
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? '⏳ Génération du billet…' : `💳 Payer ${option.price} DT`}
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(240,234,216,.35)', fontSize: '.8rem', cursor: 'pointer', padding: 6 }}
            >
              Annuler
            </button>
          </>
        ) : (
          /* ── Success + Real QR + PDF Download ── */
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--lime)', fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
                Réservation confirmée !
              </div>
              <div style={{ fontSize: '.82rem', color: 'rgba(240,234,216,.5)' }}>
                {event.title}
              </div>
            </div>

            {/* QR Code — real scannable PNG */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.4)', marginBottom: 10, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                📱 Scannez avec votre téléphone
              </div>
              <div
                style={{
                  background: '#fff', borderRadius: 14, padding: 14,
                  boxShadow: '0 8px 40px rgba(125,184,83,.25)',
                  border: '3px solid rgba(125,184,83,.3)',
                }}
              >
                {reservation?.qrDataURL ? (
                  <img
                    src={reservation.qrDataURL}
                    alt="QR Code billet"
                    style={{ width: 180, height: 180, display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 12 }}>
                    Chargement…
                  </div>
                )}
              </div>

              {/* Reservation ID */}
              <div style={{ marginTop: 12, fontSize: '.85rem', color: 'var(--lime2)', fontWeight: 800, letterSpacing: '.08em' }}>
                {reservation?.id}
              </div>
              <div style={{ fontSize: '.68rem', color: 'rgba(240,234,216,.3)', marginTop: 4, textAlign: 'center', maxWidth: 260 }}>
                Ce QR code est unique et personnel. L'organisateur le scannera à l'entrée pour valider votre billet.
              </div>
            </div>

            {/* Event summary */}
            <div style={{ background: 'rgba(125,184,83,.07)', border: '1px solid rgba(125,184,83,.15)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 20, fontSize: '.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'rgba(240,234,216,.5)' }}>
                <span>📅 Date</span><span style={{ color: 'var(--cream)' }}>{event.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'rgba(240,234,216,.5)' }}>
                <span>📍 Lieu</span><span style={{ color: 'var(--cream)' }}>{event.loc}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(240,234,216,.5)' }}>
                <span>💰 Montant</span><span style={{ color: 'var(--lime)', fontWeight: 700 }}>{option.price} DT</span>
              </div>
            </div>

            {/* PDF Download button */}
            <button
              onClick={handleDownloadPDF}
              disabled={dlLoading}
              style={{
                width: '100%', padding: '13px', borderRadius: 'var(--r)',
                background: dlLoading ? 'rgba(125,184,83,.15)' : 'rgba(125,184,83,.18)',
                border: '1.5px solid rgba(125,184,83,.45)',
                color: dlLoading ? 'rgba(125,184,83,.5)' : 'var(--lime)',
                fontWeight: 700, fontSize: '.9rem', cursor: dlLoading ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginBottom: 10, transition: 'all .2s',
              }}
            >
              {dlLoading ? '⏳ Génération PDF…' : '⬇️ Télécharger mon billet PDF'}
            </button>

            <button className="btn-prime" style={{ width: '100%' }} onClick={onClose}>
              ✓ Voir mes réservations
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Main EventDetailPage ────────────────────────────────────────────── */
export default function EventDetailPage({ eventId, onBack, onToast, onGoReservations }) {
  const event = EVENTS.find(e => e.id === eventId)
  const detail = EVENTS_DETAIL[eventId]
  const { user } = useAuth()
  const { reserveEvent, hasReserved } = useReservations()
  const { toggle, has } = useWishlist()

  const [selectedOption, setSelectedOption] = useState(detail?.options?.[0] || null)
  const [ticketCount, setTicketCount] = useState(1)
  const [showPayment, setShowPayment] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  const maxTickets = detail?.maxPeople || 20
  const availableSpots = maxTickets
  const unitPrice = selectedOption?.price || 0
  const totalPrice = unitPrice * ticketCount

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (!eventId) return
    reviewsApi.getForEvent(eventId)
      .then(rows => setReviews(rows || []))
      .catch(() => {})
  }, [eventId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { onToast('⚠️ Connectez-vous pour laisser un avis'); return }
    try {
      await reviewsApi.create({
        event_id: eventId,
        rating: newRating,
        comment: newComment,
      })
      // Reload reviews from backend
      const rows = await reviewsApi.getForEvent(eventId)
      setReviews(rows || [])
      setNewComment('')
      setNewRating(5)
      onToast('✅ Votre avis a été publié !')
    } catch (err) {
      onToast(`⚠️ Erreur: ${err.message}`)
    }
  }

  if (!event || !detail) return null

  const alreadyReserved = hasReserved(event.id)
  const liked = has(event.id)

  const handleReserveClick = () => {
    if (!user) { onToast('⚠️ Connectez-vous pour réserver'); return }
    if (alreadyReserved) { onToast('ℹ️ Vous avez déjà réservé cet événement'); return }
    setShowPayment(true)
  }

  const handleConfirmPayment = async (ev, option) => {
    const reservation = await reserveEvent({ ...ev, price: `${totalPrice} DT`, optionLabel: option.label, ticketCount })
    onToast(`🎉 ${ev.title} réservé avec succès ! (${ticketCount} billet${ticketCount > 1 ? 's' : ''})`)
    return reservation
  }

  const handlePaymentClose = () => {
    setShowPayment(false)
    if (alreadyReserved && onGoReservations) onGoReservations()
  }

  const handleWish = () => {
    if (!user) { onToast('⚠️ Connectez-vous pour ajouter aux souhaits'); return }
    toggle(event)
    onToast(liked ? '💔 Retiré des souhaits' : `♥ ${event.title} ajouté aux souhaits`)
  }

  return (
    <>
      {showPayment && selectedOption && (
        <PaymentModal
          event={event}
          option={{ ...selectedOption, price: totalPrice, unitPrice, ticketCount }}
          onClose={handlePaymentClose}
          onConfirm={handleConfirmPayment}
        />
      )}

      <div className="edp-root">
        {/* Back button */}
        <button className="edp-back" onClick={onBack}>
          ← Retour aux événements
        </button>

        {/* Hero image gallery */}
        <div className="edp-gallery">
          <div className={`edp-main-img ${detail.images[activeImg]}`} />
          <div className="edp-thumbs">
            {detail.images.map((cls, i) => (
              <div
                key={i}
                className={`edp-thumb ${cls}${activeImg === i ? ' active' : ''}`}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="edp-layout">
          {/* Left column */}
          <div className="edp-left">
            {/* Header */}
            <div className="edp-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span className={`ev-badge-diff ${diffClass(event.diff)}`} style={{ position: 'static' }}>{event.diff}</span>
                <span className="ev-cat" style={{ margin: 0 }}>{event.cat}</span>
              </div>
              <h1 className="edp-title">{event.title}</h1>
              <div className="edp-meta-row">
                <span>📍 {event.loc}</span>
                <span>📅 {event.date}</span>
                <span>⏱ {event.dur}</span>
                <span>👥 Max {detail.maxPeople} pers.</span>
                <span>🧒 Âge min. {detail.minAge} ans</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
                <div className="ev-org">
                  <div className="ev-av">{event.org?.[0]}</div>
                  <span style={{ color: 'rgba(240,234,216,.55)', fontSize: '.82rem' }}>{event.org}</span>
                </div>
                <div className="ev-rating">
                  <span>★</span>{event.rating} <span style={{ color: 'rgba(240,234,216,.35)' }}>({event.rev} avis)</span>
                </div>
                <button
                  onClick={handleWish}
                  style={{
                    marginLeft: 'auto', background: 'none', border: '1px solid var(--border2)',
                    borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                    color: liked ? '#e05c5c' : 'rgba(240,234,216,.4)', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .2s',
                  }}
                >
                  {liked ? '♥' : '♡'}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="edp-section">
              <div className="edp-section-title">Description</div>
              {detail.description.split('\n\n').map((p, i) => (
                <p key={i} style={{ color: 'rgba(240,234,216,.65)', fontSize: '.9rem', lineHeight: 1.8, marginBottom: 14 }}>{p}</p>
              ))}
            </div>

            {/* Programme */}
            <div className="edp-section">
              <div className="edp-section-title">Programme</div>
              <div className="edp-program">
                {detail.program.map((step, i) => (
                  <div key={i} className="edp-prog-item">
                    <div className="edp-prog-dot" />
                    <div>
                      <div className="edp-prog-time">{step.time}</div>
                      <div className="edp-prog-desc">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Google Map */}
            <div className="edp-section">
              <div className="edp-section-title">Localisation</div>
              <GoogleMap
                lat={detail.lat}
                lng={detail.lng}
                label={detail.mapLabel}
                zoom={13}
                height={320}
              />
            </div>

            {/* Avis / Reviews */}
            <div className="edp-section">
              <div className="edp-section-title">Avis des participants</div>
              
              {/* Formulaire d'avis */}
              <div className="edp-review-form-wrapper">
                <div style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: 12, fontSize: '.95rem' }}>Laisser un avis</div>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '.8rem', color: 'rgba(240,234,216,.5)', marginBottom: 6 }}>Note</div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.4rem',
                            color: star <= newRating ? '#e8b84a' : 'rgba(240,234,216,.15)',
                            transition: 'color .2s'
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: '.8rem', color: 'rgba(240,234,216,.5)', marginBottom: 6 }}>Commentaire (optionnel)</div>
                    <textarea
                      className="pf-inp"
                      placeholder="Partagez votre expérience..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      style={{ width: '100%', minHeight: 80, resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" className="btn-prime" style={{ padding: '10px 20px', fontSize: '.85rem' }}>
                    Publier l'avis
                  </button>
                </form>
              </div>

              {/* Liste des avis */}
              <div className="edp-reviews-list">
                {reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'rgba(240,234,216,.3)', fontSize: '.9rem' }}>
                    Aucun avis pour le moment. Soyez le premier !
                  </div>
                ) : (
                  reviews.map(rev => (
                    <div key={rev.id} className="edp-review-item">
                      <div className="edp-review-header">
                        <div className="edp-review-author">
                          <div className="edp-review-avatar">{rev.avatar}</div>
                          <div>
                            <div className="edp-review-name">{rev.userName}</div>
                            <div className="edp-review-date">{rev.date}</div>
                          </div>
                        </div>
                        <div className="edp-review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < rev.rating ? '#e8b84a' : 'rgba(240,234,216,.15)' }}>★</span>
                          ))}
                        </div>
                      </div>
                      {rev.comment && <div className="edp-review-text">{rev.comment}</div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right sticky booking panel */}
          <div className="edp-right">
            <div className="edp-booking-card">
              {/* Price header */}
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, color: 'var(--cream)' }}>
                    {unitPrice}
                  </span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 700, color: 'var(--lime)' }}>
                    DT
                  </span>
                </div>
                <span style={{ fontSize: '.82rem', color: 'rgba(240,234,216,.4)', fontWeight: 500 }}>par personne</span>
              </div>
              <div style={{ fontSize: '.78rem', color: 'rgba(240,234,216,.35)', marginBottom: 20 }}>
                {availableSpots} places disponibles
              </div>

              {/* Option selector (if multiple options) */}
              {detail.options.length > 1 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 8, letterSpacing: '.02em' }}>Type de billet</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {detail.options.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => { setSelectedOption(opt); setTicketCount(1) }}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: 'var(--r)',
                          border: selectedOption?.id === opt.id ? '1.5px solid var(--lime)' : '1px solid var(--border2)',
                          background: selectedOption?.id === opt.id ? 'rgba(125,184,83,.08)' : 'transparent',
                          color: selectedOption?.id === opt.id ? 'var(--lime)' : 'rgba(240,234,216,.5)',
                          fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ticket count */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 14 }}>Nombre de billets</div>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--mist)', border: '1px solid var(--border2)',
                  borderRadius: 'var(--r2)', padding: '6px 8px',
                }}>
                  <button
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                    style={{
                      width: 40, height: 40, borderRadius: 'var(--r)',
                      border: '1px solid var(--border2)', background: 'var(--ink2)',
                      color: ticketCount <= 1 ? 'rgba(240,234,216,.15)' : 'var(--cream)',
                      fontSize: '1.2rem', fontWeight: 700, cursor: ticketCount <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .2s',
                    }}
                  >
                    −
                  </button>
                  <span style={{
                    fontFamily: "'Playfair Display', serif", fontSize: '1.6rem',
                    fontWeight: 900, color: 'var(--cream)', minWidth: 50, textAlign: 'center',
                  }}>
                    {ticketCount}
                  </span>
                  <button
                    onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
                    disabled={ticketCount >= maxTickets}
                    style={{
                      width: 40, height: 40, borderRadius: 'var(--r)',
                      border: '1px solid var(--border2)', background: 'var(--ink2)',
                      color: ticketCount >= maxTickets ? 'rgba(240,234,216,.15)' : 'var(--cream)',
                      fontSize: '1.2rem', fontWeight: 700, cursor: ticketCount >= maxTickets ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .2s',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Price breakdown */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'rgba(240,234,216,.5)', marginBottom: 6 }}>
                  <span>Prix unitaire</span>
                  <span style={{ fontWeight: 600, color: 'rgba(240,234,216,.7)' }}>{unitPrice} DT</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', color: 'rgba(240,234,216,.5)', marginBottom: 12 }}>
                  <span>Quantité</span>
                  <span style={{ fontWeight: 600, color: 'rgba(240,234,216,.7)' }}>{ticketCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--cream)' }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 900, color: 'var(--lime)' }}>
                    {totalPrice} DT
                  </span>
                </div>
              </div>

              {alreadyReserved ? (
                <div style={{
                  width: '100%', padding: '13px', borderRadius: 'var(--r)',
                  background: 'rgba(125,184,83,.1)', border: '1px solid rgba(125,184,83,.25)',
                  color: 'var(--lime2)', textAlign: 'center', fontWeight: 700, fontSize: '.88rem',
                }}>
                  ✓ Déjà réservé
                </div>
              ) : (
                <button
                  className="btn-prime"
                  style={{ width: '100%', padding: '14px', fontSize: '.92rem', marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={handleReserveClick}
                >
                  🎫 Réserver maintenant
                </button>
              )}

              {/* Trust badges */}
              <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.74rem', color: 'rgba(240,234,216,.35)' }}>
                  <span style={{ color: 'var(--lime)', fontSize: '.8rem' }}>🔒</span>
                  <span>Paiement sécurisé</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.74rem', color: 'rgba(240,234,216,.35)' }}>
                  <span style={{ color: 'var(--lime)', fontSize: '.8rem' }}>🎫</span>
                  <span>QR Code généré instantanément</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.74rem', color: 'rgba(240,234,216,.35)' }}>
                  <span style={{ color: 'var(--lime)', fontSize: '.8rem' }}>🔄</span>
                  <span>Annulation gratuite jusqu'à 48h avant</span>
                </div>
              </div>
            </div>

            {/* Quick info card */}
            <div className="edp-info-card">
              <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.85rem', marginBottom: 12 }}>Infos pratiques</div>
              <div className="edp-info-row"><span>📅</span><span>{event.date}</span></div>
              <div className="edp-info-row"><span>⏱</span><span>{event.dur}</span></div>
              <div className="edp-info-row"><span>👥</span><span>Max {detail.maxPeople} participants</span></div>
              <div className="edp-info-row"><span>🧒</span><span>À partir de {detail.minAge} ans</span></div>
              <div className="edp-info-row"><span>⚡</span><span>Difficulté : {event.diff}</span></div>
              <div className="edp-info-row"><span>🏢</span><span>{event.org}</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
