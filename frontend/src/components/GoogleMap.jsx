import { useEffect, useRef, useState } from 'react'

const GOOGLE_MAPS_API_KEY = '' // Add your API key here for production

let mapsPromise = null

function loadGoogleMaps() {
  if (mapsPromise) return mapsPromise
  if (window.google?.maps) return Promise.resolve(window.google.maps)

  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&language=fr&region=TN`
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.google.maps)
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return mapsPromise
}

export default function GoogleMap({ lat, lng, label, zoom = 13, height = 280 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) return

        const position = { lat, lng }

        const map = new maps.Map(mapRef.current, {
          center: position,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a2e10' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#0b0e09' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#8a9a78' }] },
            {
              featureType: 'administrative',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#2f5420' }],
            },
            {
              featureType: 'administrative.land_parcel',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6b8a5a' }],
            },
            {
              featureType: 'landscape.natural',
              elementType: 'geometry',
              stylers: [{ color: '#1e3414' }],
            },
            {
              featureType: 'poi',
              elementType: 'geometry',
              stylers: [{ color: '#243d18' }],
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#7db853' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry.fill',
              stylers: [{ color: '#1e3414' }],
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#6b8a5a' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#2a4a1a' }],
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#1a2e10' }],
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#8a9a78' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{ color: '#3a5a28' }],
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#2a4a1a' }],
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{ color: '#243d18' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0b1c2e' }],
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#4a7a9a' }],
            },
          ],
        })

        mapInstanceRef.current = map

        // Custom marker
        const marker = new maps.Marker({
          position,
          map,
          title: label,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#7DB853',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        })

        // Pulsing circle around marker
        new maps.Circle({
          center: position,
          radius: 500,
          map,
          fillColor: '#7DB853',
          fillOpacity: 0.08,
          strokeColor: '#7DB853',
          strokeOpacity: 0.25,
          strokeWeight: 1.5,
        })

        // Info window
        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="font-family:'DM Sans',sans-serif;padding:6px 2px;">
              <div style="font-weight:700;font-size:13px;color:#1a2e10;margin-bottom:3px;">📍 ${label}</div>
              <div style="font-size:11px;color:#555;">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</div>
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        // Open info window by default
        infoWindow.open(map, marker)

        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [lat, lng, label, zoom])

  if (error) {
    return (
      <div className="gmap-fallback" style={{ height }}>
        <div className="gmap-fallback-inner">
          <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
          <div style={{ fontWeight: 700, color: 'var(--cream)', marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: '.8rem', color: 'rgba(240,234,216,.4)', marginBottom: 12 }}>
            {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
          </div>
          <a
            href={`https://www.google.com/maps?q=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gmap-link-btn"
          >
            Ouvrir dans Google Maps ↗
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="gmap-container" style={{ height }}>
      {!loaded && (
        <div className="gmap-loading">
          <div className="gmap-loading-spinner" />
          <span>Chargement de la carte...</span>
        </div>
      )}
      <div ref={mapRef} className="gmap-canvas" style={{ height: '100%', width: '100%', opacity: loaded ? 1 : 0, transition: 'opacity .5s' }} />
      <div className="gmap-overlay-bottom">
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gmap-open-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Ouvrir dans Maps
        </a>
        <span className="gmap-coords">{lat.toFixed(4)}°N, {lng.toFixed(4)}°E</span>
      </div>
    </div>
  )
}
