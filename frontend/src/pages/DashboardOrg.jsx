import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { eventsApi } from '../services/api'
import { EVLIST, REVS, BOOKINGS_TABLE, BARD } from '../utils/data'
import { statusClass, statusLabel } from '../utils/helpers'
import { verifyQRCode } from '../context/ReservationsContext'  // now async → hits /api/reservations/verify-qr

const TABS = [
  { id: 'oOverview', label: "Vue d'ensemble", icon: '📊' },
  { id: 'oEvents', label: 'Mes Événements', icon: '🏕' },
  { id: 'oCreate', label: 'Créer Événement', icon: '➕' },
  { id: 'oBookings', label: 'Réservations', icon: '📋' },
  { id: 'oScanner', label: 'Scanner QR Code', icon: '📷' },
  { id: 'oAnalytics', label: 'Statistiques & BI', icon: '📈' },
  { id: 'oReviews', label: 'Avis Clients', icon: '⭐' },
  { id: 'oProfile', label: 'Profil', icon: '👤' },
  { id: 'oSettings', label: 'Paramètres', icon: '⚙️' },
]

const KPI = [
  { lbl: 'Revenus totaux', val: '4 851 DT', chg: '+18%', up: true, bar: 'var(--lime)', ico: '💰', ibg: 'rgba(125,184,83,.08)' },
  { lbl: 'Réservations', val: '59', chg: '+12%', up: true, bar: 'var(--amber)', ico: '🎫', ibg: 'rgba(201,138,26,.08)' },
  { lbl: 'Événements actifs', val: '3', chg: '→ stable', up: null, bar: '#6496d8', ico: '🏕', ibg: 'rgba(100,150,216,.08)' },
  { lbl: 'Note moyenne', val: '4.87★', chg: '+0.2', up: true, bar: 'var(--ember)', ico: '⭐', ibg: 'rgba(168,78,21,.08)' },
]

export default function DashboardOrg({ onToast }) {
  const [activeTab, setActiveTab] = useState('oOverview')
  const [barPeriod, setBarPeriod] = useState('7j')
  const { logout } = useAuth()

  const titles = { oOverview: "Vue d'ensemble", oEvents: 'Mes Événements', oCreate: 'Créer Événement', oBookings: 'Réservations', oScanner: 'Scanner QR Code', oAnalytics: 'Statistiques & BI', oReviews: 'Avis Clients', oProfile: 'Profil', oSettings: 'Paramètres' }

  const barData = BARD[barPeriod]
  const maxBar = Math.max(...barData.map(x => x.v))

  return (
    <div id="vDashOrg" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside className="org-sidebar">
        <div className="org-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B0E09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l4-8 4 4 3-6 4 10"/><path d="M3 20h18"/>
            </svg>
          </div>
          <span className="org-logo-text">TuniTrail</span>
        </div>
        <div className="org-profile">
          <div className="org-av">TA</div>
          <div className="org-name">Tribus Aventure</div>
          <div className="org-role">
            <span className="org-role-text">Organisateur</span>
            <span className="org-verified">Vérifié</span>
          </div>
        </div>
        <nav className="org-nav">
          <div className="org-nav-sec">Tableau de bord</div>
          {TABS.map(tab => (
            <div
              key={tab.id}
              className={`org-item${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </div>
          ))}
          <div className="org-nav-sec" style={{ marginTop: 12 }}>Compte</div>
          <div className="org-item" onClick={logout}><span>🚪</span> Déconnexion</div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="org-main">
        <div className="org-topbar">
          <span className="org-page-title">{titles[activeTab]}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="abtn abtn-g" onClick={() => setActiveTab('oCreate')}>+ Nouvel événement</button>
          </div>
        </div>

        <div className="org-content">

          {/* OVERVIEW */}
          {activeTab === 'oOverview' && (
            <>
              <div className="kpi-row">
                {KPI.map((k, i) => (
                  <div key={i} className="kpi">
                    <div className="kpi-bar" style={{ background: k.bar }} />
                    <div className="kpi-ico" style={{ background: k.ibg }}>
                      <span style={{ fontSize: 16 }}>{k.ico}</span>
                    </div>
                    <div className="kpi-lbl">{k.lbl}</div>
                    <div className="kpi-val">{k.val}</div>
                    <div className={`kpi-chg ${k.up === true ? 'up' : k.up === false ? 'dn' : ''}`}>
                      {k.up === true ? '↑' : k.up === false ? '↓' : '→'} {k.chg} vs mois dernier
                    </div>
                  </div>
                ))}
              </div>

              <div className="ch-grid2">
                {/* BAR CHART */}
                <div className="ch-card">
                  <div className="ch-head">
                    <div>
                      <div className="ch-title">Revenus</div>
                      <div className="ch-sub">Évolution des ventes</div>
                    </div>
                    <div className="period-row">
                      {['7j', '30j', '90j'].map(p => (
                        <button key={p} className={`prd-btn${barPeriod === p ? ' active' : ''}`} onClick={() => setBarPeriod(p)}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="bar-ch">
                    {barData.map((x, i) => (
                      <div key={i} className="bar-w">
                        <div className="bar-vl">{x.v >= 1000 ? (x.v / 1000).toFixed(1) + 'k' : x.v}</div>
                        <div className={`bar${i === barData.length - 1 ? ' hi' : ''}`} style={{ height: Math.max(5, (x.v / maxBar) * 130) + 'px' }} />
                        <div className="bar-lbl">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DONUT */}
                <div className="ch-card">
                  <div className="ch-head"><div className="ch-title">Types d'événements</div></div>
                  <div className="donut-w">
                    <svg className="donut-svg" width="116" height="116" viewBox="0 0 116 116">
                      <circle cx="58" cy="58" r="42" fill="none" stroke="var(--mist2)" strokeWidth="12"/>
                      <circle cx="58" cy="58" r="42" fill="none" stroke="var(--lime)" strokeWidth="12" strokeDasharray="158 106" strokeLinecap="round"/>
                      <circle cx="58" cy="58" r="42" fill="none" stroke="var(--amber)" strokeWidth="12" strokeDasharray="60 204" strokeDashoffset="-158" strokeLinecap="round"/>
                      <circle cx="58" cy="58" r="42" fill="none" stroke="#6496d8" strokeWidth="12" strokeDasharray="46 218" strokeDashoffset="-218" strokeLinecap="round"/>
                    </svg>
                    <div className="donut-mid"><div className="donut-v">59</div><div className="donut-l">réservations</div></div>
                  </div>
                  {[['Camping', 'var(--lime)', '34'], ['Trek', 'var(--amber)', '18'], ['Bivouac', '#6496d8', '7']].map(([l, c, v]) => (
                    <div key={l} className="leg-item">
                      <div className="leg-dot" style={{ background: c }} />
                      <span className="leg-lbl">{l}</span>
                      <span className="leg-val">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RECENT BOOKINGS TABLE */}
              <div className="ch-card">
                <div className="ch-head"><div className="ch-title">Dernières réservations</div></div>
                <div className="t-wrap">
                  <table className="dt">
                    <thead>
                      <tr><th>Réf</th><th>Client</th><th>Événement</th><th>Date</th><th>Total</th><th>Statut</th></tr>
                    </thead>
                    <tbody>
                      {BOOKINGS_TABLE.map((b, i) => (
                        <tr key={i}>
                          <td style={{ fontFamily: 'monospace', fontSize: '.72rem' }}>{b.ref}</td>
                          <td className="td-main">{b.name}</td>
                          <td>{b.ev}</td>
                          <td>{b.date}</td>
                          <td className="td-main">{b.total}</td>
                          <td><span className={`sb ${statusClass(b.st)}`}><span className="sb-dot"/>{statusLabel(b.st)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* EVENTS LIST */}
          {activeTab === 'oEvents' && (
            <div>
              {EVLIST.map((e, i) => (
                <div key={i} className="ev-list-item">
                  <div className={`el-thumb ${e.cls}`} />
                  <div className="el-body">
                    <div className="el-title">{e.title}</div>
                    <div className="el-meta"><span>{e.date}</span><span>· {e.loc}</span></div>
                    <div className="el-prog" style={{ marginTop: 7 }}>
                      <div className="el-prog-fill" style={{ width: Math.round(e.sold / e.cap * 100) + '%' }} />
                    </div>
                  </div>
                  <div className="el-right">
                    <span className={`sb ${e.st === 'published' ? 'sb-ok' : 'sb-draft'}`}>{e.st === 'published' ? 'Publié' : 'Brouillon'}</span>
                    <div className="el-rev">{e.rev > 0 ? e.rev + ' DT' : '—'}</div>
                    <div style={{ fontSize: '.7rem', color: 'rgba(240,234,216,.28)' }}>{e.sold}/{e.cap} places</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginLeft: 6 }}>
                    <button className="abtn abtn-g" style={{ padding: '6px 9px' }} onClick={() => onToast('Modifier')}>✏</button>
                    <button className="abtn abtn-d" style={{ padding: '6px 9px' }} onClick={() => onToast('Supprimé')}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CREATE EVENT */}
          {activeTab === 'oCreate' && (
            <CreateEventPanel onToast={onToast} onCreated={() => setActiveTab('oEvents')} />
          )}

          {/* BOOKINGS */}
          {activeTab === 'oBookings' && (
            <div className="ch-card">
              <div className="t-wrap">
                <table className="dt">
                  <thead>
                    <tr><th>Réf</th><th>Client</th><th>Événement</th><th>Date</th><th>Billet</th><th>Qté</th><th>Total</th><th>Statut</th></tr>
                  </thead>
                  <tbody>
                    {BOOKINGS_TABLE.map((b, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: '.72rem' }}>{b.ref}</td>
                        <td className="td-main">{b.name}</td>
                        <td>{b.ev}</td>
                        <td>{b.date}</td>
                        <td>{b.tkt}</td>
                        <td>{b.qty}</td>
                        <td className="td-main">{b.total}</td>
                        <td><span className={`sb ${statusClass(b.st)}`}><span className="sb-dot"/>{statusLabel(b.st)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SCANNER */}
          {activeTab === 'oScanner' && (
            <ScannerPanel onToast={onToast} />
          )}

          {/* ANALYTICS */}
          {activeTab === 'oAnalytics' && (
            <div>
              <div className="ch-grid2" style={{ marginBottom: 14 }}>
                <div className="ch-card">
                  <div className="ch-head"><div className="ch-title">Revenus mensuels</div></div>
                  <div className="bar-ch">
                    {BARD['90j'].map((x, i) => (
                      <div key={i} className="bar-w">
                        <div className="bar-vl">{(x.v / 1000).toFixed(1)}k</div>
                        <div className="bar" style={{ height: Math.max(5, (x.v / 12000) * 130) + 'px' }} />
                        <div className="bar-lbl">{x.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="ch-card">
                  <div className="ch-head"><div className="ch-title">Top Destinations</div></div>
                  {[['Zaghouan', 60, 'var(--lime)'], ['Bizerte', 38, 'var(--amber)'], ['Tataouine', 22, '#6496d8']].map(([n, v, c]) => (
                    <div key={n} className="hb">
                      <div className="hb-head"><span className="hb-name">{n}</span><span className="hb-val">{v}%</span></div>
                      <div className="hb-track"><div className="hb-fill" style={{ width: v + '%', background: c }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'oReviews' && (
            <div>
              {REVS.map((r, i) => (
                <div key={i} className="ch-card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: r.c, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 600, color: r.tc }}>
                        {r.name.split(' ').map(x => x[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontSize: '.875rem', fontWeight: 600, color: 'var(--cream)' }}>{r.name}</div>
                        <div style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.32)' }}>{r.ev} · {r.d}</div>
                      </div>
                    </div>
                    <div style={{ color: 'var(--amber)', fontSize: '.85rem' }}>{'★'.repeat(r.r)}{'☆'.repeat(5 - r.r)}</div>
                  </div>
                  <p style={{ fontSize: '.875rem', color: 'rgba(240,234,216,.58)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>{r.q}</p>
                  <button className="abtn abtn-g" style={{ padding: '6px 14px', fontSize: '.77rem' }} onClick={() => onToast('Ouvrir réponse')}>Répondre</button>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === 'oProfile' && (
            <div>
              <div className="fsec">
                <div className="fsec-title">Profil organisateur</div>
                <div className="fg"><label className="fl">Nom de l'organisation</label><input className="fi" defaultValue="Tribus Aventure" /></div>
                <div className="fg2">
                  <div className="fg"><label className="fl">Email</label><input className="fi" defaultValue="contact@tribusaventure.tn" /></div>
                  <div className="fg"><label className="fl">Téléphone</label><input className="fi" defaultValue="+216 xx xxx xxx" /></div>
                </div>
                <div className="fg"><label className="fl">Description</label><textarea className="fi fi-ta" defaultValue="Organisateur spécialisé en aventure nature en Tunisie." /></div>
                <button className="abtn abtn-p" onClick={() => onToast('Profil mis à jour !')}>Sauvegarder</button>
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'oSettings' && (
            <div className="fsec">
              <div className="fsec-title">Paramètres du compte</div>
              {[
                { name: 'Notifications email', sub: 'Recevoir les alertes de réservation par email' },
                { name: 'Notifications SMS', sub: 'Alertes réservation par SMS' },
                { name: 'Mode maintenance', sub: "Masquer temporairement vos événements de l'affichage public" },
              ].map((t, i) => (
                <div key={i} className="tog-row">
                  <div>
                    <div className="tog-name">{t.name}</div>
                    <div className="tog-sub">{t.sub}</div>
                  </div>
                  <ToggleSwitch defaultOn={i < 2} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className={`t-sw${on ? ' on' : ''}`} onClick={() => setOn(v => !v)}>
      <div className="th" style={{ left: on ? 19 : 2 }} />
    </div>
  )
}

function CreateEventPanel({ onToast, onCreated }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Camping', difficulty: 'Facile',
    duration: '', date: '', location: '', price: '', capacity: '',
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (status) => {
    if (!form.title || !form.date || !form.location) {
      onToast('⚠️ Titre, date et lieu sont obligatoires')
      return
    }
    setSaving(true)
    try {
      await eventsApi.create({
        ...form,
        price: form.price ? `${form.price} DT` : '0 DT',
        price_num: parseFloat(form.price) || 0,
        capacity: parseInt(form.capacity) || 0,
        status,
      })
      onToast(status === 'published' ? '✅ Événement publié !' : '💾 Brouillon sauvegardé')
      onCreated && onCreated()
    } catch (err) {
      onToast(`⚠️ Erreur: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="fsec">
        <div className="fsec-title">Informations générales</div>
        <div className="fg"><label className="fl">Titre de l'événement *</label><input className="fi" placeholder="ex: Camping Zaghouan — Nuit étoilée" value={form.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="fg"><label className="fl">Description</label><textarea className="fi fi-ta" placeholder="Décrivez votre aventure..." value={form.description} onChange={e => set('description', e.target.value)} /></div>
        <div className="fg3">
          <div className="fg"><label className="fl">Catégorie</label>
            <select className="fi" value={form.category} onChange={e => set('category', e.target.value)}>
              <option>Camping</option><option>Trek</option><option>Bivouac</option><option>Escalade</option><option>Kayak</option>
            </select>
          </div>
          <div className="fg"><label className="fl">Difficulté</label>
            <select className="fi" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              <option>Facile</option><option>Modéré</option><option>Difficile</option>
            </select>
          </div>
          <div className="fg"><label className="fl">Durée</label><input className="fi" placeholder="ex: 2 jours" value={form.duration} onChange={e => set('duration', e.target.value)} /></div>
        </div>
        <div className="fg2">
          <div className="fg"><label className="fl">Date *</label><input className="fi" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
          <div className="fg"><label className="fl">Lieu *</label><input className="fi" placeholder="ex: Zaghouan" value={form.location} onChange={e => set('location', e.target.value)} /></div>
        </div>
      </div>

      <div className="fsec">
        <div className="fsec-title">Tarification & Capacité</div>
        <div className="fg2">
          <div className="fg"><label className="fl">Prix (DT)</label><input className="fi" type="number" placeholder="89" value={form.price} onChange={e => set('price', e.target.value)} /></div>
          <div className="fg"><label className="fl">Capacité max</label><input className="fi" type="number" placeholder="40" value={form.capacity} onChange={e => set('capacity', e.target.value)} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="abtn abtn-p" onClick={() => handleSubmit('published')} disabled={saving}>
          {saving ? '⏳...' : 'Publier l\'événement'}
        </button>
        <button className="abtn abtn-g" onClick={() => handleSubmit('draft')} disabled={saving}>
          Sauvegarder brouillon
        </button>
      </div>
    </div>
  )
}

function ScannerPanel({ onToast }) {
  const [val, setVal] = useState('')
  const [res, setRes] = useState(null)
  const [camActive, setCamActive] = useState(false)
  const [camError, setCamError] = useState(null)
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)
  const SCANNER_ID = 'tunitrail-qr-reader'

  /* ── Camera scanner lifecycle ─────────────────────── */
  useEffect(() => {
    if (!camActive) return

    let scanner = null
    let mounted = true

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (!mounted) return
      scanner = new Html5Qrcode(SCANNER_ID)
      html5QrRef.current = scanner

      scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (!mounted) return
          handleVerify(decodedText)
          stopCamera(scanner)
        },
        () => { /* ignore scan errors */ }
      ).catch(err => {
        if (!mounted) return
        setCamError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
        setCamActive(false)
        console.error(err)
      })
    }).catch(() => {
      setCamError('Librairie scanner non disponible.')
      setCamActive(false)
    })

    return () => {
      mounted = false
      if (scanner) stopCamera(scanner)
    }
  }, [camActive])

  const stopCamera = (scanner) => {
    try {
      scanner?.stop().then(() => scanner.clear()).catch(() => {})
    } catch { /* ignore */ }
    setCamActive(false)
  }

  const handleStopCamera = () => {
    if (html5QrRef.current) stopCamera(html5QrRef.current)
    else setCamActive(false)
  }

  /* ── Verify a raw QR string ───────────────────────── */
  const handleVerify = async (raw) => {
    const text = raw || val
    if (!text.trim()) return

    const result = await verifyQRCode(text.trim())

    if (result.valid) {
      const { reservation, payload } = result
      setRes({
        ok: true,
        msg: 'Billet valide — Entrée accordée ✓',
        det: `${payload?.title || reservation?.event_title || ''} · ${reservation?.option_label || reservation?.optionLabel || 'Standard'}`,
        extra: [
          { label: 'Référence', value: reservation?.ref_code || reservation?.id || '—' },
          { label: 'Participant', value: payload?.uname || reservation?.user_name || '—' },
          { label: 'Date', value: reservation?.event_date || reservation?.eventDate || '—' },
          { label: 'Lieu', value: reservation?.event_loc || reservation?.eventLoc || '—' },
          { label: 'Montant', value: reservation?.price || '—' },
        ],
      })
      onToast('✓ Accès accordé !')
    } else {
      setRes({ ok: false, msg: 'Billet invalide ou non reconnu', det: result.reason })
      onToast('✕ Billet refusé')
    }
    setVal('')
  }

  const handleReset = () => { setRes(null); setVal('') }

  return (
    <div className="scanner-shell">
      <div className="scan-ev-lbl">Vérification des billets</div>
      <div className="scan-ev-name">Scanner QR Code · TuniTrail</div>

      {/* Camera viewfinder or placeholder */}
      <div className="scan-frame" style={{ position: 'relative', overflow: 'hidden', minHeight: 240 }}>
        {!camActive && (
          <>
            <div className="scan-beam" />
            <div className="sc-c sc-tl" /><div className="sc-c sc-tr" />
            <div className="sc-c sc-bl" /><div className="sc-c sc-br" />
            <span style={{ fontSize: 48 }}>📷</span>
          </>
        )}
        {/* html5-qrcode mounts its video here */}
        <div
          id={SCANNER_ID}
          style={{
            display: camActive ? 'block' : 'none',
            width: '100%', borderRadius: 8,
          }}
        />
      </div>

      {camError && (
        <div style={{ fontSize: '.78rem', color: 'var(--ember)', textAlign: 'center', marginBottom: 8 }}>
          ⚠️ {camError}
        </div>
      )}

      {/* Camera toggle */}
      {!res && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {!camActive ? (
            <button
              className="btn-scan"
              style={{ flex: 1, background: 'rgba(125,184,83,.18)', border: '1.5px solid rgba(125,184,83,.4)' }}
              onClick={() => { setCamError(null); setCamActive(true) }}
            >
              📷 Activer la caméra
            </button>
          ) : (
            <button
              className="btn-scan"
              style={{ flex: 1, background: 'rgba(224,92,92,.15)', border: '1.5px solid rgba(224,92,92,.4)', color: 'var(--ember)' }}
              onClick={handleStopCamera}
            >
              ⏹ Arrêter la caméra
            </button>
          )}
        </div>
      )}

      {/* Manual input */}
      {!res && !camActive && (
        <>
          <div style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.3)', textAlign: 'center', margin: '0 0 8px', letterSpacing: '.04em' }}>
            — ou saisir manuellement —
          </div>
          <input
            className="scan-inp"
            placeholder="Coller ou saisir le code QR billet…"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />
          <button className="btn-scan" onClick={() => handleVerify()} disabled={!val.trim()}>
            🔍 Vérifier le billet
          </button>
        </>
      )}

      {/* Result */}
      {res && (
        <div
          className={`scan-res${res.ok ? ' res-ok' : ' res-err'}`}
          style={{ display: 'block', marginTop: 16 }}
        >
          <div style={{ fontSize: 28, marginBottom: 6 }}>{res.ok ? '✅' : '❌'}</div>
          <div style={{ fontWeight: 700, color: res.ok ? 'var(--lime)' : 'var(--ember)', fontSize: '1rem', marginBottom: 4 }}>
            {res.msg}
          </div>
          <div style={{ fontSize: '.78rem', color: 'rgba(240,234,216,.5)', marginBottom: res.extra ? 12 : 0 }}>
            {res.det}
          </div>

          {/* Reservation details card */}
          {res.ok && res.extra && (
            <div style={{
              background: 'rgba(125,184,83,.08)', border: '1px solid rgba(125,184,83,.2)',
              borderRadius: 10, padding: '12px 14px', marginTop: 8, textAlign: 'left',
            }}>
              {res.extra.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.78rem' }}>
                  <span style={{ color: 'rgba(240,234,216,.4)' }}>{label}</span>
                  <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleReset}
            style={{
              marginTop: 14, width: '100%', padding: '10px',
              background: 'rgba(255,255,255,.06)', border: '1px solid var(--border2)',
              borderRadius: 'var(--r)', color: 'rgba(240,234,216,.6)',
              cursor: 'pointer', fontSize: '.85rem', fontWeight: 600,
            }}
          >
            🔄 Scanner un autre billet
          </button>
        </div>
      )}
    </div>
  )
}
