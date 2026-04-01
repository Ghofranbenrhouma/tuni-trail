/**
 * EventCheckoutModal
 * Flux : Panier événements → Paiement → QR Code + PDF
 * Utilisé depuis DashboardUser > uCart
 */
import { useState } from 'react'
import { useReservations } from '../context/ReservationsContext'
import { useEventCart } from '../context/EventCartContext'

/* ── PDF helper ─────────────────────────────────────────────────────── */
async function downloadAllTicketsPDF(reservations, events) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = 210, H = 297
  const margin = 18

  reservations.forEach((res, idx) => {
    if (idx > 0) doc.addPage()
    const ev = events.find(e => e.id === res.eventId) || {}

    // Background
    doc.setFillColor(11, 14, 9)
    doc.rect(0, 0, W, H, 'F')

    // Border
    doc.setDrawColor(125, 184, 83)
    doc.setLineWidth(1)
    doc.roundedRect(margin - 4, margin - 4, W - (margin - 4) * 2, H - (margin - 4) * 2, 6, 6, 'S')

    // Logo
    doc.setFontSize(24)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text('TuniTrail', margin, margin + 16)

    doc.setFontSize(8)
    doc.setTextColor(120, 130, 100)
    doc.setFont('helvetica', 'normal')
    doc.text('BILLET ÉLECTRONIQUE OFFICIEL', margin, margin + 24)

    // Divider
    doc.setDrawColor(50, 65, 40)
    doc.setLineWidth(0.4)
    doc.line(margin, margin + 28, W - margin, margin + 28)

    // Event title
    doc.setFontSize(16)
    doc.setTextColor(240, 234, 216)
    doc.setFont('helvetica', 'bold')
    doc.text(res.eventTitle || '—', margin, margin + 42)

    // Info rows
    const rows = [
      ['📅 Date', res.eventDate || ev.date || '—'],
      ['📍 Lieu', res.eventLoc || ev.loc || '—'],
      ['💰 Montant', res.price || '—'],
      ['🔖 Référence', res.id],
      ['✅ Statut', 'CONFIRMÉ'],
    ]
    let y = margin + 54
    rows.forEach(([label, value]) => {
      doc.setFontSize(9)
      doc.setTextColor(120, 130, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(label, margin, y)
      doc.setTextColor(240, 234, 216)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), margin + 46, y)
      y += 9
    })

    // Divider 2
    doc.setDrawColor(50, 65, 40)
    doc.line(margin, y + 4, W - margin, y + 4)
    y += 16

    // QR section title
    doc.setFontSize(11)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text("QR CODE D'ACCÈS", W / 2, y, { align: 'center' })
    y += 6
    doc.setFontSize(7.5)
    doc.setTextColor(100, 110, 85)
    doc.setFont('helvetica', 'normal')
    doc.text("Présentez ce code à l'organisateur à l'entrée de l'événement.", W / 2, y, { align: 'center' })
    y += 10

    // QR code image
    if (res.qrDataURL) {
      const qrSize = 64
      const qrX = (W - qrSize) / 2
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(qrX - 3, y - 2, qrSize + 6, qrSize + 6, 4, 4, 'F')
      doc.addImage(res.qrDataURL, 'PNG', qrX, y, qrSize, qrSize)
      y += qrSize + 10
    }

    // Reservation ID
    doc.setFontSize(12)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text(res.id, W / 2, y, { align: 'center' })
    y += 8

    // Warning
    doc.setFontSize(7)
    doc.setTextColor(70, 80, 58)
    doc.setFont('helvetica', 'italic')
    doc.text('Billet strictement personnel — ne pas partager — valable une seule fois.', W / 2, y, { align: 'center' })

    // Footer
    doc.setDrawColor(50, 65, 40)
    doc.line(margin, H - margin + 2, W - margin, H - margin + 2)
    doc.setFontSize(7)
    doc.setTextColor(70, 80, 58)
    doc.setFont('helvetica', 'normal')
    doc.text("TuniTrail — Plateforme d'aventure en Tunisie", W / 2, H - margin + 9, { align: 'center' })
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, W / 2, H - margin + 15, { align: 'center' })
  })

  const suffix = reservations.length > 1 ? `x${reservations.length}` : reservations[0]?.id
  doc.save(`TuniTrail-Billets-${suffix}.pdf`)
}

/* ── Main Modal ─────────────────────────────────────────────────────── */
export default function EventCheckoutModal({ onClose, onToast }) {
  const { eventItems, eventCartTotal, clearEventCart } = useEventCart()
  const { reserveEvent } = useReservations()

  const [step, setStep] = useState('cart')   // 'cart' | 'pay' | 'processing' | 'success'
  const [reservations, setReservations] = useState([])
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paying, setPaying] = useState(false)
  const [dlLoading, setDlLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const total = eventCartTotal
  const frais = 5

  const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  const handlePay = async () => {
    if (!cardNum || !expiry || !cvv) {
      onToast && onToast('⚠️ Remplissez tous les champs de paiement')
      return
    }
    setPaying(true)
    setError(null)
    setStep('processing')
    
    try {
      // Simulate a small payment delay for UX
      await new Promise(resolve => setTimeout(resolve, 800))
      setProgress(20)
      
      // Generate a reservation + QR for each event
      const results = []
      for (let i = 0; i < eventItems.length; i++) {
        const item = eventItems[i]
        setProgress(20 + Math.round(((i + 1) / eventItems.length) * 60))
        const res = await reserveEvent(item)
        results.push(res)
      }
      
      setProgress(90)
      await new Promise(resolve => setTimeout(resolve, 300))
      setProgress(100)
      
      setReservations(results)
      clearEventCart()
      
      await new Promise(resolve => setTimeout(resolve, 400))
      setStep('success')
      onToast && onToast(`🎉 ${results.length} billet(s) confirmé(s) !`)
    } catch (err) {
      console.error('Payment/QR generation error:', err)
      setError(`Erreur lors du traitement : ${err.message || 'Veuillez réessayer'}`)
      setStep('pay')
      onToast && onToast('❌ Erreur lors du paiement. Veuillez réessayer.')
    } finally {
      setPaying(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDlLoading(true)
    try {
      await downloadAllTicketsPDF(reservations, eventItems)
      onToast && onToast('✅ PDF téléchargé avec succès !')
    } catch (err) {
      console.error('PDF download error:', err)
      onToast && onToast('❌ Erreur lors du téléchargement PDF')
    } finally {
      setDlLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(8px)',
      }}
      onClick={step !== 'success' && step !== 'processing' ? onClose : undefined}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(22,28,18,1) 0%, rgba(14,18,12,1) 100%)',
          border: '1px solid rgba(125,184,83,.2)',
          borderRadius: 20,
          padding: '36px 30px',
          maxWidth: 500, width: '100%',
          maxHeight: '94vh', overflowY: 'auto',
          animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)',
          boxShadow: '0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(125,184,83,.08), inset 0 1px 0 rgba(255,255,255,.03)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── STEP 1 : Récapitulatif panier ── */}
        {step === 'cart' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'rgba(125,184,83,.12)', border: '1px solid rgba(125,184,83,.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
              }}>🛒</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--fg)', fontFamily: "'Playfair Display', serif" }}>
                  Récapitulatif de commande
                </div>
                <div style={{ fontSize: '.78rem', color: 'rgba(240,234,216,.4)' }}>
                  Vérifiez vos billets avant de procéder
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(125,184,83,.2), transparent)', margin: '18px 0' }} />

            {/* Event items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {eventItems.map((item, idx) => (
                <div key={item.id} style={{
                  background: 'rgba(125,184,83,.04)',
                  border: '1px solid rgba(125,184,83,.12)',
                  borderRadius: 14,
                  padding: '14px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  animation: `fadeInUp .3s ${idx * 0.05}s both`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'rgba(125,184,83,.1)', border: '1px solid rgba(125,184,83,.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem'
                    }}>🎫</div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.88rem', marginBottom: 3 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '.73rem', color: 'rgba(240,234,216,.4)' }}>
                        📅 {item.date} &nbsp;·&nbsp; 📍 {item.loc}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--lime)', fontFamily: "'Playfair Display', serif", fontSize: '1rem', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(125,184,83,.08) 0%, rgba(125,184,83,.03) 100%)',
              border: '1px solid rgba(125,184,83,.18)',
              borderRadius: 14, padding: '16px 18px', marginBottom: 24
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.82rem', color: 'rgba(240,234,216,.5)' }}>
                <span>Sous-total ({eventItems.length} billet{eventItems.length > 1 ? 's' : ''})</span>
                <span>{total.toFixed(0)} DT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '.82rem', color: 'rgba(240,234,216,.5)' }}>
                <span>Frais de service</span>
                <span>{frais} DT</span>
              </div>
              <div style={{ height: 1, background: 'rgba(125,184,83,.15)', margin: '8px 0 10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', color: 'var(--cream)', fontFamily: "'Playfair Display', serif" }}>
                <span>Total</span>
                <span style={{ color: 'var(--lime)' }}>{(total + frais).toFixed(0)} DT</span>
              </div>
            </div>

            <button className="btn-prime" style={{
              width: '100%', padding: '14px', fontSize: '.92rem',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }} onClick={() => setStep('pay')}>
              💳 Procéder au paiement
            </button>
            <button onClick={onClose} style={{
              width: '100%', marginTop: 10, background: 'none', border: 'none',
              color: 'rgba(240,234,216,.35)', fontSize: '.8rem', cursor: 'pointer', padding: 8
            }}>
              Retour au panier
            </button>
          </>
        )}

        {/* ── STEP 2 : Paiement ── */}
        {step === 'pay' && (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: 'linear-gradient(135deg, rgba(125,184,83,.15), rgba(125,184,83,.05))',
                border: '1px solid rgba(125,184,83,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
              }}>🔒</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--fg)', fontFamily: "'Playfair Display', serif" }}>
                  Paiement sécurisé
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(240,234,216,.4)' }}>
                  {eventItems.length} billet{eventItems.length > 1 ? 's' : ''} · Montant total :
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(125,184,83,.2), transparent)', margin: '18px 0' }} />

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(224,92,92,.08)', border: '1px solid rgba(224,92,92,.25)',
                borderRadius: 12, padding: '12px 14px', marginBottom: 16,
                fontSize: '.82rem', color: '#e05c5c', display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ fontSize: '1rem' }}>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Tickets summary */}
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(125,184,83,.08) 0%, rgba(125,184,83,.03) 100%)',
              border: '1px solid rgba(125,184,83,.2)',
              borderRadius: 14,
              padding: '16px',
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                {eventItems.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(125,184,83,.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                      <span style={{ fontSize: '1.1rem' }}>🎫</span>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.88rem' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'rgba(240,234,216,.35)', marginTop: 2 }}>
                          📅 {item.date} · 📍 {item.loc}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 800,
                      color: 'var(--lime)',
                      fontSize: '0.95rem',
                      fontFamily: "'Playfair Display', serif",
                      whiteSpace: 'nowrap',
                      marginLeft: 12
                    }}>
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: 12,
                borderTop: '2px solid rgba(125,184,83,.15)',
              }}>
                <span style={{ fontWeight: 700, color: 'rgba(240,234,216,.7)', fontSize: '.95rem' }}>
                  Total à payer
                </span>
                <span style={{
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  color: 'var(--lime)',
                  fontFamily: "'Playfair Display', serif",
                  letterSpacing: '0.02em'
                }}>
                  {(total + frais).toFixed(0)} DT
                </span>
              </div>
            </div>

            {/* Card fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{
                  fontSize: '.7rem',
                  color: 'rgba(240,234,216,.5)',
                  display: 'block',
                  marginBottom: 8,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  fontWeight: 600
                }}>
                  Numéro de carte
                </label>
                <input
                  className="pf-inp"
                  placeholder="1234 5678 9012 3456"
                  value={cardNum}
                  onChange={e => setCardNum(fmtCard(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    fontSize: '.9rem',
                    letterSpacing: '0.08em',
                    borderRadius: 12,
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
                <div>
                  <label style={{
                    fontSize: '.7rem',
                    color: 'rgba(240,234,216,.5)',
                    display: 'block',
                    marginBottom: 8,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>Expiration</label>
                  <input
                    className="pf-inp"
                    placeholder="MM/AA"
                    value={expiry}
                    onChange={e => setExpiry(fmtExp(e.target.value))}
                    style={{ width: '100%', padding: '13px 16px', fontSize: '.9rem', borderRadius: 12 }}
                  />
                </div>
                <div>
                  <label style={{
                    fontSize: '.7rem',
                    color: 'rgba(240,234,216,.5)',
                    display: 'block',
                    marginBottom: 8,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    fontWeight: 600
                  }}>CVV</label>
                  <input
                    className="pf-inp"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    type="password"
                    style={{ width: '100%', padding: '13px 16px', fontSize: '.9rem', letterSpacing: '0.2em', borderRadius: 12 }}
                  />
                </div>
              </div>
            </div>

            {/* SSL Security */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 22,
              padding: '12px 14px',
              background: 'rgba(125,184,83,.06)',
              border: '1px solid rgba(125,184,83,.12)',
              borderRadius: 12,
              fontSize: '.75rem',
              color: 'rgba(240,234,216,.5)'
            }}>
              <span style={{ fontSize: '1rem' }}>🔐</span>
              <span>Paiement crypté SSL — Vos données sont sécurisées</span>
            </div>

            <button
              className="btn-prime"
              style={{
                width: '100%', padding: '15px', fontSize: '.95rem',
                opacity: paying ? 0.7 : 1, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? '⏳ Traitement en cours…' : `💳 Payer ${(total + frais).toFixed(0)} DT`}
            </button>
            <button
              onClick={() => { setStep('cart'); setError(null) }}
              style={{
                width: '100%', marginTop: 10, background: 'none', border: 'none',
                color: 'rgba(240,234,216,.35)', fontSize: '.8rem', cursor: 'pointer', padding: 8
              }}
            >
              ← Retour au récapitulatif
            </button>
          </>
        )}

        {/* ── STEP 2.5 : Processing animation ── */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(125,184,83,.08)', border: '2px solid rgba(125,184,83,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', animation: 'pulse 1.5s ease-in-out infinite',
            }}>
              <span style={{ fontSize: '2rem', animation: 'spin 2s linear infinite' }}>⚙️</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--cream)', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
              Traitement en cours…
            </div>
            <div style={{ fontSize: '.82rem', color: 'rgba(240,234,216,.4)', marginBottom: 24 }}>
              Génération de vos billets QR
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '80%', margin: '0 auto', height: 6, borderRadius: 6,
              background: 'rgba(125,184,83,.1)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 6,
                background: 'linear-gradient(90deg, var(--lime), #a4d65e)',
                width: `${progress}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.3)', marginTop: 8 }}>
              {progress < 30 ? '💳 Vérification du paiement…' :
               progress < 80 ? '🎫 Génération des QR codes…' :
               progress < 100 ? '✅ Finalisation…' : '🎉 Terminé !'}
            </div>
          </div>
        )}

        {/* ── STEP 3 : Succès + QR codes ── */}
        {step === 'success' && (
          <>
            {/* Success header with confetti effect */}
            <div style={{ textAlign: 'center', marginBottom: 24, position: 'relative' }}>
              <div style={{
                width: 70, height: 70, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(125,184,83,.15), rgba(125,184,83,.05))',
                border: '2px solid rgba(125,184,83,.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', animation: 'bounceIn .5s ease',
              }}>
                <span style={{ fontSize: '2rem' }}>🎉</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--lime)', fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>
                Paiement confirmé !
              </div>
              <div style={{ fontSize: '.82rem', color: 'rgba(240,234,216,.5)' }}>
                {reservations.length} billet{reservations.length > 1 ? 's' : ''} généré{reservations.length > 1 ? 's' : ''} avec succès
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(125,184,83,.2), transparent)', margin: '0 0 20px' }} />

            {/* QR codes */}
            {reservations.map((res, idx) => (
              <div key={res.id} style={{
                background: 'linear-gradient(135deg, rgba(125,184,83,.06) 0%, rgba(125,184,83,.02) 100%)',
                border: '1px solid rgba(125,184,83,.18)',
                borderRadius: 16,
                padding: '22px',
                marginBottom: 14,
                textAlign: 'center',
                animation: `fadeInUp .4s ${idx * 0.1}s both`,
              }}>
                <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '.92rem', marginBottom: 4 }}>
                  {res.eventTitle}
                </div>
                <div style={{ fontSize: '.75rem', color: 'rgba(240,234,216,.45)', marginBottom: 16 }}>
                  📅 {res.eventDate} &nbsp;·&nbsp; 📍 {res.eventLoc}
                </div>

                {/* QR Code with glow effect */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  <div style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: 14,
                    boxShadow: '0 8px 40px rgba(125,184,83,.3), 0 0 60px rgba(125,184,83,.08)',
                    border: '3px solid rgba(125,184,83,.25)',
                    position: 'relative',
                  }}>
                    {res.qrDataURL ? (
                      <img src={res.qrDataURL} alt="QR Code" style={{ width: 160, height: 160, display: 'block' }} />
                    ) : (
                      <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>
                        Chargement…
                      </div>
                    )}
                    {/* Scan indicator */}
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      background: 'var(--lime)', color: '#0b0e09',
                      borderRadius: '50%', width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '.7rem', fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(125,184,83,.4)',
                    }}>✓</div>
                  </div>
                </div>

                {/* Scan instruction */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(125,184,83,.08)', border: '1px solid rgba(125,184,83,.15)',
                  borderRadius: 20, padding: '5px 14px', marginBottom: 10,
                  fontSize: '.72rem', color: 'var(--lime)',
                }}>
                  📱 Scannez avec votre téléphone
                </div>

                {/* Reservation ID */}
                <div style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--lime2)', letterSpacing: '.08em', marginBottom: 4 }}>
                  {res.id}
                </div>
                <div style={{ fontSize: '.66rem', color: 'rgba(240,234,216,.25)', lineHeight: 1.5 }}>
                  L'organisateur validera votre billet à l'entrée
                </div>
              </div>
            ))}

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {/* PDF Download */}
              <button
                onClick={handleDownloadPDF}
                disabled={dlLoading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: dlLoading ? 'rgba(125,184,83,.06)' : 'rgba(125,184,83,.12)',
                  border: '1.5px solid rgba(125,184,83,.35)',
                  color: dlLoading ? 'rgba(125,184,83,.4)' : 'var(--lime)',
                  fontWeight: 700, fontSize: '.9rem',
                  cursor: dlLoading ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all .2s',
                }}
              >
                {dlLoading ? '⏳ Génération PDF…' : `⬇️ Télécharger ${reservations.length > 1 ? 'mes billets' : 'mon billet'} PDF`}
              </button>

              <button className="btn-prime" style={{ width: '100%', borderRadius: 12, padding: '14px' }} onClick={onClose}>
                ✓ Voir mes réservations
              </button>
            </div>

            <div style={{ marginTop: 14, fontSize: '.72rem', color: 'rgba(240,234,216,.22)', textAlign: 'center', lineHeight: 1.6 }}>
              Vos billets sont aussi accessibles dans "Mes Réservations"
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes fadeInUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes bounceIn { 0% { transform: scale(0.3); opacity: 0 } 50% { transform: scale(1.05) } 70% { transform: scale(0.95) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.05); opacity: .8 } }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
