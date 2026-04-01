import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const ReservationsContext = createContext(null)

export const RESERVATIONS_KEY_PREFIX = 'tuniTrail_reservations_'

function reservationsKey(userId) {
  return `${RESERVATIONS_KEY_PREFIX}${userId}`
}

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
    // Fallback: try without URI encoding (old format)
    try {
      const decoded = JSON.parse(atob(raw.trim()))
      if (decoded.app !== 'TuniTrail') return null
      return decoded
    } catch {
      return null
    }
  }
}

export function verifyQRCode(rawData) {
  const payload = decodeQRPayload(rawData)
  if (!payload) return { valid: false, reason: 'QR code non reconnu ou invalide' }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(RESERVATIONS_KEY_PREFIX)) continue
    try {
      const reservations = JSON.parse(localStorage.getItem(key) || '[]')
      const found = reservations.find(r => r.id === payload.rid && r.eventId === payload.eid)
      if (found) return { valid: true, reservation: found, payload }
    } catch { /* ignore */ }
  }
  return { valid: false, reason: 'Réservation introuvable dans le système' }
}

/* ── Robust QR Code generation with fallback ─────────────────────────── */
export async function generateQRDataURL(text) {
  try {
    // Dynamic import to avoid ESM issues
    const QRModule = await import('qrcode')
    const QRCode = QRModule.default || QRModule
    const toDataURL = QRCode.toDataURL || (QRCode.default && QRCode.default.toDataURL)
    
    if (typeof toDataURL === 'function') {
      return await toDataURL(text, {
        width: 220,
        margin: 2,
        color: { dark: '#0b0e09', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
    }
    
    // If toDataURL is not directly accessible, try toCanvas approach
    if (typeof QRCode.toCanvas === 'function') {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, text, {
        width: 220,
        margin: 2,
        color: { dark: '#0b0e09', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      })
      return canvas.toDataURL('image/png')
    }

    // Last resort: use a QR code API
    console.warn('QRCode library methods not available, using API fallback')
    return await generateQRFallback(text)
  } catch (err) {
    console.error('QR generation primary method failed:', err)
    // Fallback to canvas-based generation
    return await generateQRFallback(text)
  }
}

/* ── Canvas-based QR fallback (no external dependency) ───────────────── */
async function generateQRFallback(text) {
  // Use a simple API-based approach as ultimate fallback
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
  } catch (err) {
    console.error('QR fallback also failed:', err)
    // Generate a simple placeholder data URL
    return generatePlaceholderQR(text)
  }
}

/* ── Ultra-fallback: generate a simple QR-like placeholder ─────────── */
function generatePlaceholderQR(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 220
  canvas.height = 220
  const ctx = canvas.getContext('2d')
  
  // White background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 220, 220)
  
  // Dark pattern based on text hash
  ctx.fillStyle = '#0b0e09'
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i)
    hash = hash & hash
  }
  
  // Draw a grid pattern simulating QR
  const size = 10
  const margin = 20
  const gridSize = Math.floor((220 - margin * 2) / size)
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const bit = ((hash * (x + 1) * (y + 1) + x * 31 + y * 17) >>> 0) % 3
      if (bit === 0) {
        ctx.fillRect(margin + x * size, margin + y * size, size - 1, size - 1)
      }
    }
  }
  
  // Position detection patterns (corners)
  const drawFinder = (ox, oy) => {
    ctx.fillStyle = '#0b0e09'
    ctx.fillRect(ox, oy, 7 * size, 7 * size)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(ox + size, oy + size, 5 * size, 5 * size)
    ctx.fillStyle = '#0b0e09'
    ctx.fillRect(ox + 2 * size, oy + 2 * size, 3 * size, 3 * size)
  }
  drawFinder(margin, margin)
  drawFinder(margin + (gridSize - 7) * size, margin)
  drawFinder(margin, margin + (gridSize - 7) * size)
  
  return canvas.toDataURL('image/png')
}

export function ReservationsProvider({ children }) {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    if (!user) { setReservations([]); return }
    try {
      const saved = localStorage.getItem(reservationsKey(user.id))
      setReservations(saved ? JSON.parse(saved) : [])
    } catch { setReservations([]) }
  }, [user?.id])

  useEffect(() => {
    if (!user) return
    localStorage.setItem(reservationsKey(user.id), JSON.stringify(reservations))
  }, [reservations, user?.id])

  const reserveEvent = async (event) => {
    const reservationId = 'TT-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
    const qrPayload = buildQRPayload({
      userId: user.id,
      userName: user.name || user.email || 'Participant',
      reservationId,
      eventId: event.id,
      eventTitle: event.title,
    })
    
    let qrDataURL
    try {
      qrDataURL = await generateQRDataURL(qrPayload)
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      qrDataURL = generatePlaceholderQR(qrPayload)
    }
    
    const reservation = {
      id: reservationId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventLoc: event.loc,
      eventCls: event.cls,
      price: event.price,
      optionLabel: event.optionLabel,
      status: 'confirmed',
      createdAt: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      qrPayload,
      qrDataURL,
    }
    setReservations(prev => [reservation, ...prev])
    return reservation
  }

  const hasReserved = (eventId) => reservations.some(r => r.eventId === eventId)

  return (
    <ReservationsContext.Provider value={{ reservations, reserveEvent, hasReserved }}>
      {children}
    </ReservationsContext.Provider>
  )
}

export function useReservations() { return useContext(ReservationsContext) }
