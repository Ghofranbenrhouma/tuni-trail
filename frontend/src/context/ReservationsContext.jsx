import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { reservationsApi } from '../services/api'

const ReservationsContext = createContext(null)

/* ── QR helpers (unchanged — same encoding format) ───────────────────── */
export function buildQRPayload({ userId, reservationId, eventId, eventTitle, userName }) {
  const payload = {
    app: 'TuniTrail',
    uid: userId,
    uname: userName || 'Participant',
    rid: reservationId,
    eid: eventId,
    title: eventTitle,
    ts: Date.now(),
  }
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
}

export function decodeQRPayload(raw) {
  try {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(raw.trim()))))
    if (decoded.app !== 'TuniTrail') return null
    return decoded
  } catch {
    try {
      const decoded = JSON.parse(atob(raw.trim()))
      if (decoded.app !== 'TuniTrail') return null
      return decoded
    } catch { return null }
  }
}

/* ── QR verification now hits the backend ────────────────────────────── */
export async function verifyQRCode(rawData) {
  try {
    const result = await reservationsApi.verifyQR(rawData)
    return result
  } catch (err) {
    return { valid: false, reason: err.message || 'Erreur de vérification' }
  }
}

/* ── QR image generation ─────────────────────────────────────────────── */
export async function generateQRDataURL(text) {
  try {
    const QRModule = await import('qrcode')
    const QRCode = QRModule.default || QRModule
    const toDataURL = QRCode.toDataURL || (QRCode.default && QRCode.default.toDataURL)
    if (typeof toDataURL === 'function') {
      return await toDataURL(text, {
        width: 220, margin: 2,
        color: { dark: '#0b0e09', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
    }
    if (typeof QRCode.toCanvas === 'function') {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, text, { width: 220, margin: 2, color: { dark: '#0b0e09', light: '#ffffff' }, errorCorrectionLevel: 'M' })
      return canvas.toDataURL('image/png')
    }
    return await generateQRFallback(text)
  } catch { return await generateQRFallback(text) }
}

async function generateQRFallback(text) {
  try {
    const response = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}&bgcolor=FFFFFF&color=0B0E09&margin=8`
    )
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch { return generatePlaceholderQR(text) }
}

function generatePlaceholderQR(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 220; canvas.height = 220
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 220, 220)
  ctx.fillStyle = '#0b0e09'
  let hash = 0
  for (let i = 0; i < text.length; i++) { hash = ((hash << 5) - hash) + text.charCodeAt(i); hash = hash & hash }
  const size = 10, margin = 20, gridSize = Math.floor((220 - margin * 2) / size)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (((hash * (x + 1) * (y + 1) + x * 31 + y * 17) >>> 0) % 3 === 0)
        ctx.fillRect(margin + x * size, margin + y * size, size - 1, size - 1)
    }
  }
  const drawFinder = (ox, oy) => {
    ctx.fillStyle = '#0b0e09'; ctx.fillRect(ox, oy, 7 * size, 7 * size)
    ctx.fillStyle = '#ffffff'; ctx.fillRect(ox + size, oy + size, 5 * size, 5 * size)
    ctx.fillStyle = '#0b0e09'; ctx.fillRect(ox + 2 * size, oy + 2 * size, 3 * size, 3 * size)
  }
  drawFinder(margin, margin)
  drawFinder(margin + (gridSize - 7) * size, margin)
  drawFinder(margin, margin + (gridSize - 7) * size)
  return canvas.toDataURL('image/png')
}

/* ── Normalize DB row → UI reservation shape ─────────────────────────── */
function normalize(row) {
  return {
    id: row.ref_code || row.id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    eventLoc: row.event_loc,
    eventCls: row.event_cls,
    price: row.price,
    optionLabel: row.option_label,
    status: row.status,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—',
    qrPayload: row.qr_payload,
    qrDataURL: null, // generated on demand
  }
}

export function ReservationsProvider({ children }) {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])

  const load = useCallback(async () => {
    if (!user) { setReservations([]); return }
    try {
      const rows = await reservationsApi.getMine()
      setReservations((rows || []).map(normalize))
    } catch { setReservations([]) }
  }, [user?.id])

  useEffect(() => { load() }, [load])

  const reserveEvent = async (event) => {
    const qrPayload = buildQRPayload({
      userId: user.id,
      userName: user.name || user.email || 'Participant',
      reservationId: 'TMP',   // will be overwritten by backend ref_code
      eventId: event.id,
      eventTitle: event.title,
    })

    let qrDataURL
    try { qrDataURL = await generateQRDataURL(qrPayload) }
    catch { qrDataURL = generatePlaceholderQR(qrPayload) }

    try {
      const row = await reservationsApi.create({
        event_id: event.id,
        event_title: event.title,
        event_date: event.date,
        event_loc: event.loc,
        event_cls: event.cls,
        price: event.price,
        option_label: event.optionLabel || 'Standard',
        ticket_count: event.ticketCount || 1,
        qr_payload: qrPayload,
      })
      const reservation = { ...normalize(row), qrDataURL }
      setReservations(prev => [reservation, ...prev])
      return reservation
    } catch (err) {
      throw err
    }
  }

  const hasReserved = (eventId) => reservations.some(r => r.eventId == eventId)

  return (
    <ReservationsContext.Provider value={{ reservations, reserveEvent, hasReserved, reload: load }}>
      {children}
    </ReservationsContext.Provider>
  )
}

export function useReservations() { return useContext(ReservationsContext) }
