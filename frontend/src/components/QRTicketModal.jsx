/**
 * QRTicketModal — affiche le QR code après réservation/commande
 * et permet de télécharger le billet en PDF.
 *
 * Props:
 *  reservation  – objet réservation (id, eventTitle, eventDate, eventLoc, price, qrDataURL, qrPayload)
 *  onClose      – fonction de fermeture
 */
export default function QRTicketModal({ reservation, onClose }) {
  if (!reservation) return null

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const W = 210

    // ── Fond sombre ──────────────────────────────────────────────
    doc.setFillColor(11, 14, 9)
    doc.rect(0, 0, W, 297, 'F')

    // ── Bordure verte ────────────────────────────────────────────
    doc.setDrawColor(125, 184, 83)
    doc.setLineWidth(1)
    doc.roundedRect(12, 12, 186, 273, 6, 6, 'S')

    // ── En-tête ──────────────────────────────────────────────────
    doc.setFontSize(26)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text('TuniTrail', 22, 36)

    doc.setFontSize(8)
    doc.setTextColor(120, 130, 100)
    doc.setFont('helvetica', 'normal')
    doc.text('BILLET ÉLECTRONIQUE OFFICIEL', 22, 44)

    // Trait séparateur
    doc.setDrawColor(50, 65, 40)
    doc.setLineWidth(0.5)
    doc.line(22, 48, 188, 48)

    // ── Titre événement ──────────────────────────────────────────
    doc.setFontSize(17)
    doc.setTextColor(240, 234, 216)
    doc.setFont('helvetica', 'bold')
    const title = reservation.eventTitle || reservation.name || '—'
    doc.text(title, 22, 62)

    // ── Infos ────────────────────────────────────────────────────
    const rows = [
      ['Date', reservation.eventDate || reservation.date || '—'],
      ['Lieu', reservation.eventLoc || reservation.loc || '—'],
      ['Référence', reservation.id],
      ['Prix', reservation.price || '—'],
      ['Statut', 'CONFIRMÉ ✓'],
    ]
    let y = 74
    rows.forEach(([label, value]) => {
      doc.setFontSize(9)
      doc.setTextColor(120, 130, 100)
      doc.setFont('helvetica', 'normal')
      doc.text(label, 22, y)

      doc.setTextColor(240, 234, 216)
      doc.setFont('helvetica', 'bold')
      doc.text(String(value), 68, y)
      y += 9
    })

    // Trait séparateur 2
    doc.setDrawColor(50, 65, 40)
    doc.line(22, y + 2, 188, y + 2)
    y += 14

    // ── QR Code ──────────────────────────────────────────────────
    doc.setFontSize(11)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text("QR CODE D'ACCÈS", W / 2, y, { align: 'center' })
    y += 6

    doc.setFontSize(7.5)
    doc.setTextColor(100, 110, 85)
    doc.setFont('helvetica', 'normal')
    doc.text("Présentez ce code à l'organisateur à l'entrée de l'événement.", W / 2, y, { align: 'center' })
    y += 8

    if (reservation.qrDataURL) {
      // Fond blanc sous le QR
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(W / 2 - 35, y, 70, 70, 3, 3, 'F')
      doc.addImage(reservation.qrDataURL, 'PNG', W / 2 - 33, y + 2, 66, 66)
    }
    y += 76

    // ── Référence texte sous QR ──────────────────────────────────
    doc.setFontSize(12)
    doc.setTextColor(125, 184, 83)
    doc.setFont('helvetica', 'bold')
    doc.text(reservation.id, W / 2, y, { align: 'center' })
    y += 8

    // ── Avertissement ────────────────────────────────────────────
    doc.setFontSize(7)
    doc.setTextColor(70, 80, 58)
    doc.setFont('helvetica', 'italic')
    doc.text('Billet strictement personnel — ne pas partager — valable une seule fois.', W / 2, y, { align: 'center' })

    // ── Pied de page ─────────────────────────────────────────────
    doc.setDrawColor(50, 65, 40)
    doc.line(22, 272, 188, 272)
    doc.setFontSize(7)
    doc.setTextColor(70, 80, 58)
    doc.setFont('helvetica', 'normal')
    doc.text('TuniTrail — Plateforme d\'aventure en Tunisie', W / 2, 279, { align: 'center' })
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, W / 2, 284, { align: 'center' })

    doc.save(`TuniTrail-Billet-${reservation.id}.pdf`)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.80)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn .18s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--ink2)',
          border: '1px solid rgba(125,184,83,.3)',
          borderRadius: 'var(--r2)',
          padding: '32px 28px',
          maxWidth: 360,
          width: '92%',
          textAlign: 'center',
          boxShadow: '0 24px 80px rgba(0,0,0,.7), 0 0 0 1px rgba(125,184,83,.12)',
          animation: 'slideUp .22s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 20 }}>🎫</span>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--fg)' }}>Votre billet</span>
        </div>

        <div style={{ fontSize: '.82rem', color: 'var(--lime2)', fontWeight: 600, marginBottom: 4 }}>
          {reservation.eventTitle || reservation.name}
        </div>
        <div style={{ fontSize: '.75rem', color: 'var(--fg3)', marginBottom: 20 }}>
          📅 {reservation.eventDate || reservation.date} &nbsp;·&nbsp; 📍 {reservation.eventLoc || reservation.loc}
        </div>

        {/* QR Code */}
        <div
          style={{
            display: 'inline-block',
            background: '#fff',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
            boxShadow: '0 8px 32px rgba(125,184,83,.25)',
            border: '2px solid rgba(125,184,83,.3)',
          }}
        >
          {reservation.qrDataURL
            ? <img src={reservation.qrDataURL} alt="QR Code" style={{ width: 170, height: 170, display: 'block' }} />
            : (
              <div style={{ width: 170, height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 12 }}>
                Chargement…
              </div>
            )
          }
        </div>

        {/* Référence */}
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontSize: '.75rem', color: 'var(--fg3)' }}>Référence : </span>
          <span style={{ fontSize: '.78rem', color: 'var(--lime2)', fontWeight: 700, letterSpacing: '0.05em' }}>
            {reservation.id}
          </span>
        </div>

        <div
          style={{
            fontSize: '.72rem',
            color: 'rgba(240,234,216,.3)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          ✅ Réservation confirmée<br />
          Présentez ce QR à l'organisateur à l'entrée
        </div>

        {/* Bouton PDF */}
        <button
          onClick={downloadPDF}
          style={{
            width: '100%',
            padding: '11px',
            borderRadius: 'var(--r)',
            background: 'rgba(125,184,83,.12)',
            border: '1.5px solid rgba(125,184,83,.4)',
            color: 'var(--lime)',
            fontWeight: 700,
            fontSize: '.85rem',
            cursor: 'pointer',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'background .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(125,184,83,.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(125,184,83,.12)'}
        >
          ⬇️ Télécharger le billet PDF
        </button>

        {/* Fermer */}
        <button
          className="btn-prime"
          onClick={onClose}
          style={{ width: '100%' }}
        >
          Fermer
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  )
}
