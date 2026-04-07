import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { reservationsApi, eventsApi } from '../services/api'
import { EVENTS, BOOKINGS_TABLE, EVLIST } from '../utils/data'

/* ── Simulated data ── */
const REPORTED_REVIEWS = [
  { id:'rp1', user:'Karim L.', event:'Trek Ichkeul', text:'Arnaque totale, guide absent 2h...', date:'28 Mar', reason:'Langage inapproprié', status:'pending' },
  { id:'rp2', user:'Nour S.', event:'Camping Zaghouan', text:'Prix excessif pour la qualité minable', date:'25 Mar', reason:'Contenu trompeur', status:'pending' },
  { id:'rp3', user:'Ali M.', event:'Ksar Hadada', text:'Super expérience, je recommande !!! PROMO -50% sur mon lien bit.ly/xxx', date:'22 Mar', reason:'Spam / Publicité', status:'pending' },
  { id:'rp4', user:'Fatma C.', event:'Cap Bon', text:'Personne ne parlait français...', date:'20 Mar', reason:'Discrimination', status:'reviewed' },
]

const REPORTED_EVENTS = [
  { id:'re1', event:'Randonnée nocturne Hammamet', org:'InconnuTrek', reason:'Organisateur non vérifié', date:'30 Mar', status:'pending' },
  { id:'re2', event:'Plongée Tabarka Extrême', org:'DiveForce', reason:'Sécurité douteuse', date:'27 Mar', status:'pending' },
]

const ACTIVITY_LOG = [
  { id:1, type:'reservation', text:'Ahmed Ben Ali a réservé Camping Zaghouan', time:'Il y a 12 min', icon:'🎫' },
  { id:2, type:'org', text:'Nouvelle demande organisateur de Leila M.', time:'Il y a 34 min', icon:'📋' },
  { id:3, type:'user', text:'Mohamed T. s\'est inscrit', time:'Il y a 1h', icon:'👤' },
  { id:4, type:'event', text:'Trek Ichkeul mis à jour par NatureVoyage', time:'Il y a 2h', icon:'🗺' },
  { id:5, type:'moderation', text:'Avis signalé sur Ksar Hadada', time:'Il y a 3h', icon:'🛡' },
  { id:6, type:'reservation', text:'Sara M. a réservé Cap Bon — Randonnée', time:'Il y a 4h', icon:'🎫' },
]

const REVENUE_DATA = [
  { l:'Lu', v:1200 },{ l:'Ma', v:1800 },{ l:'Me', v:1450 },{ l:'Je', v:2200 },{ l:'Ve', v:2800 },{ l:'Sa', v:3400 },{ l:'Di', v:4100 },
]

const TABS = [
  { id:'aOverview', label:"Vue d'ensemble", icon:'📊' },
  { id:'aEvents', label:'Événements', icon:'🗺' },
  { id:'aReservations', label:'Réservations', icon:'🎫' },
  { id:'aOrgs', label:'Organisateurs', icon:'🏢' },
  { id:'aUsers', label:'Utilisateurs', icon:'👥' },
  { id:'aModeration', label:'Modération', icon:'🛡' },
  { id:'aSettings', label:'Paramètres', icon:'⚙️' },
]

export default function DashboardAdmin({ onToast }) {
  const [activeTab, setActiveTab] = useState('aOverview')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [docPreview, setDocPreview] = useState(null)
  // Events
  const [evFilter, setEvFilter] = useState('all')
  const [evSearch, setEvSearch] = useState('')
  const [evStatuses, setEvStatuses] = useState({})
  const [evFeatured, setEvFeatured] = useState({})
  // Reservations
  const [resFilter, setResFilter] = useState('all')
  const [resSearch, setResSearch] = useState('')
  // Users
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  // Moderation
  const [reportedReviews, setReportedReviews] = useState(REPORTED_REVIEWS)
  const [reportedEvents, setReportedEvents] = useState(REPORTED_EVENTS)
  const [modTab, setModTab] = useState('reviews')
  // Orgs sub-tab
  const [orgSubTab, setOrgSubTab] = useState('requests')

  const { user, logout, orgRequests, approveOrgRequest, rejectOrgRequest, getAllUsers, refreshOrgRequests, loadOrgRequests } = useAuth()

  // API-loaded data
  const [allUsers, setAllUsers]             = useState([])
  const [allReservations, setAllReservations] = useState([])
  const [apiEvents, setApiEvents]           = useState([])
  const [dataLoaded, setDataLoaded]         = useState(false)

  // Load real data from backend on mount
  useEffect(() => {
    loadOrgRequests()
    getAllUsers().then(u => setAllUsers(u || []))
    reservationsApi.getAll().then(r => setAllReservations(r || [])).catch(() => {})
    eventsApi.getAll().then(e => setApiEvents(e || [])).catch(() => {})
    setDataLoaded(true)
  }, [])

  // Reload reservations when tab changes to reservations
  useEffect(() => {
    if (activeTab === 'aReservations') {
      reservationsApi.getAll({ status: resFilter !== 'all' ? resFilter : undefined, search: resSearch || undefined })
        .then(r => setAllReservations(r || [])).catch(() => {})
    }
    if (activeTab === 'aUsers') {
      getAllUsers().then(u => setAllUsers(u || []))
    }
  }, [activeTab])

  const initials = user?.avatar || 'AT'
  const pendingCount  = orgRequests.filter(r => r.status === 'pending').length
  const approvedCount = orgRequests.filter(r => r.status === 'approved').length
  const rejectedCount = orgRequests.filter(r => r.status === 'rejected').length

  const modPendingCount = reportedReviews.filter(r => r.status === 'pending').length + reportedEvents.filter(r => r.status === 'pending').length

  const totalRevenue = useMemo(() => {
    let sum = 0
    allReservations.forEach(r => { const n = parseFloat(r.price); if (!isNaN(n)) sum += n })
    return sum
  }, [allReservations])

  const displayEvents = apiEvents.length > 0 ? apiEvents : EVENTS

  const titles = {
    aOverview: "Vue d'ensemble", aEvents: 'Gestion des événements', aReservations: 'Suivi des réservations',
    aOrgs: 'Organisateurs', aUsers: 'Gestion des utilisateurs', aModeration: 'Modération', aSettings: 'Paramètres',
  }

  const handleApprove = async (requestId) => {
    await approveOrgRequest(requestId)
    await refreshOrgRequests()
    getAllUsers().then(u => setAllUsers(u || []))
    onToast?.('✅ Demande approuvée !'); setSelectedRequest(null)
  }
  const handleOpenReject = (request) => { setRejectModal(request); setRejectReason('') }
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) return
    await rejectOrgRequest(rejectModal.id, rejectReason)
    await refreshOrgRequests()
    onToast?.('📧 Demande refusée.'); setRejectModal(null); setSelectedRequest(null)
  }

  const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }

  const statusBadge = (status) => {
    const map = { pending:{ cls:'sb-wait', label:'En attente' }, approved:{ cls:'sb-ok', label:'Approuvée' }, rejected:{ cls:'sb-cancel', label:'Refusée' }, confirmed:{ cls:'sb-ok', label:'Confirmé' }, published:{ cls:'sb-ok', label:'Publié' }, draft:{ cls:'sb-draft', label:'Brouillon' }, suspended:{ cls:'sb-cancel', label:'Suspendu' }, reviewed:{ cls:'sb-ok', label:'Traité' } }
    const s = map[status] || map.pending
    return <span className={`sb ${s.cls}`}><span className="sb-dot" />{s.label}</span>
  }

  const roleBadge = (role) => {
    const map = { admin:{ bg:'rgba(201,138,26,.12)', color:'var(--amber)', label:'Admin' }, org:{ bg:'rgba(125,184,83,.12)', color:'var(--lime)', label:'Organisateur' }, pending_org:{ bg:'rgba(201,138,26,.12)', color:'var(--amber)', label:'En attente' }, user:{ bg:'var(--mist)', color:'rgba(240,234,216,.5)', label:'Aventurier' } }
    const r = map[role] || map.user
    return <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:100, background:r.bg, fontSize:'.65rem', fontWeight:600, color:r.color, letterSpacing:'.04em', textTransform:'uppercase' }}>{r.label}</span>
  }

  const maxBar = Math.max(...REVENUE_DATA.map(d => d.v))

  // Filtered events
  const filteredEvents = displayEvents.filter(ev => {
    const st = evStatuses[ev.id] || ev.status || 'published'
    if (evFilter !== 'all' && st !== evFilter) return false
    if (evSearch && !ev.title?.toLowerCase().includes(evSearch.toLowerCase()) && !(ev.loc||ev.location||'').toLowerCase().includes(evSearch.toLowerCase())) return false
    return true
  })

  // Filtered reservations
  const filteredRes = allReservations.filter(r => {
    if (resFilter !== 'all' && r.status !== resFilter) return false
    if (resSearch && !(r.event_title||r.event_title || r.eventTitle||'').toLowerCase().includes(resSearch.toLowerCase()) && !(r.ref_code||r.id||'').toLowerCase().includes(resSearch.toLowerCase())) return false
    return true
  })

  // Filtered users
  const filteredUsers = allUsers.filter(u => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false
    if (userSearch && !u.name?.toLowerCase().includes(userSearch.toLowerCase()) && !u.email?.toLowerCase().includes(userSearch.toLowerCase())) return false
    return true
  })

  const toggleEvStatus = async (id) => {
    const current = evStatuses[id] || 'published'
    const newStatus = current === 'published' ? 'suspended' : 'published'
    setEvStatuses(prev => ({ ...prev, [id]: newStatus }))
    try { await eventsApi.changeStatus(id, newStatus) } catch {}
    onToast?.(`Statut mis à jour`)
  }

  const toggleFeatured = async (id) => {
    setEvFeatured(prev => ({ ...prev, [id]: !prev[id] }))
    try { await eventsApi.toggleFeatured(id) } catch {}
    onToast?.(evFeatured[id] ? 'Retiré de la une' : '⭐ Mis en avant')
  }

  const handleReviewAction = (id, action) => {
    setReportedReviews(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'reviewed' : 'deleted' } : r))
    onToast?.(action === 'approve' ? '✅ Avis approuvé' : '🗑 Avis supprimé')
  }

  const handleEventReportAction = (id, action) => {
    setReportedEvents(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'reviewed' : 'removed' } : r))
    onToast?.(action === 'approve' ? '✅ Événement approuvé' : '🗑 Événement retiré')
  }

  const usersByRole = { admin: allUsers.filter(u => u.role === 'admin').length, org: allUsers.filter(u => u.role === 'org').length, user: allUsers.filter(u => u.role === 'user' || u.role === 'pending_org').length }

  return (
    <>
      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="modal-bg open" onClick={e => { if (e.target === e.currentTarget) setRejectModal(null) }}>
          <div className="modal-box" style={{ width: 460 }}>
            <button className="modal-close" onClick={() => setRejectModal(null)}>✕</button>
            <div className="modal-ey" style={{ color:'var(--ember)' }}>Refuser la demande</div>
            <h2 className="modal-h">Motif du refus</h2>
            <p className="modal-sub">Email envoyé à <strong style={{ color:'var(--cream)' }}>{rejectModal.email}</strong></p>
            <label className="m-lbl">Motif du refus *</label>
            <textarea className="m-inp m-textarea" placeholder="Expliquez la raison du refus..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ minHeight: 100 }} />
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-mfull" style={{ background:'var(--ember)', flex:1 }} onClick={handleConfirmReject} disabled={!rejectReason.trim()}>📧 Refuser</button>
              <button className="btn-mfull" style={{ background:'transparent', border:'1px solid var(--border2)', color:'rgba(240,234,216,.5)' }} onClick={() => setRejectModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      {docPreview && (
        <div className="modal-bg open" onClick={e => { if (e.target === e.currentTarget) setDocPreview(null) }}>
          <div className="modal-box" style={{ width:700, maxHeight:'85vh', padding:24 }}>
            <button className="modal-close" onClick={() => setDocPreview(null)}>✕</button>
            <div className="modal-ey">Document justificatif</div>
            <h2 className="modal-h" style={{ fontSize:'1.2rem', marginBottom:16 }}>{docPreview.name}</h2>
            <div style={{ width:'100%', height:'60vh', borderRadius:'var(--r)', overflow:'hidden', border:'1px solid var(--border2)' }}>
              <iframe src={docPreview.data} style={{ width:'100%', height:'100%', border:'none' }} title="Doc" />
            </div>
          </div>
        </div>
      )}

      <div id="vDashAdmin" style={{ display:'flex', minHeight:'100vh' }}>
        {/* SIDEBAR */}
        <aside className="org-sidebar">
          <div className="org-logo">
            <div className="nav-logo-mark"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#0B0E09" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l4-8 4 4 3-6 4 10" /><path d="M3 20h18" /></svg></div>
            <span className="org-logo-text">TuniTrail</span>
          </div>
          <div className="org-profile">
            <div className="org-av" style={{ background:'rgba(201,138,26,.18)', borderColor:'rgba(201,138,26,.3)', color:'var(--amber)' }}>{initials}</div>
            <div className="org-name">{user?.name || 'Admin'}</div>
            <div className="org-role">
              <span className="org-role-text">Administrateur</span>
              <span className="org-verified" style={{ background:'rgba(201,138,26,.1)', borderColor:'rgba(201,138,26,.2)', color:'var(--amber)' }}>Admin</span>
            </div>
          </div>
          <nav className="org-nav">
            <div className="org-nav-sec">Administration</div>
            {TABS.map(tab => (
              <div key={tab.id} className={`org-item${activeTab === tab.id ? ' active' : ''}`} onClick={() => { setActiveTab(tab.id); setSelectedRequest(null) }}>
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === 'aOrgs' && pendingCount > 0 && <span className="org-badge">{pendingCount}</span>}
                {tab.id === 'aModeration' && modPendingCount > 0 && <span className="org-badge" style={{ background:'#c94040' }}>{modPendingCount}</span>}
              </div>
            ))}
            <div className="org-nav-sec" style={{ marginTop:12 }}>Compte</div>
            <div className="org-item" onClick={logout}><span>🚪</span> Déconnexion</div>
          </nav>
        </aside>

        {/* MAIN */}
        <main className="org-main">
          <div className="org-topbar">
            <span className="org-page-title">{titles[activeTab]}</span>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {pendingCount > 0 && <div className="admin-pending-pill"><span className="admin-pending-dot" />{pendingCount} demande{pendingCount > 1 ? 's' : ''}</div>}
            </div>
          </div>

          <div className="org-content">

            {/* ═══ OVERVIEW ═══ */}
            {activeTab === 'aOverview' && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
                  {[
                    { lbl:'Revenus totaux', val:`${totalRevenue || '4 520'} DT`, bar:'var(--lime)', ico:'💰', ibg:'rgba(125,184,83,.08)', chg:'+18%', up:true },
                    { lbl:'Réservations', val: allReservations.length || 62, bar:'#6496d8', ico:'🎫', ibg:'rgba(100,150,216,.08)', chg:'+12%', up:true },
                    { lbl:'Événements actifs', val: EVENTS.length, bar:'var(--amber)', ico:'🗺', ibg:'rgba(201,138,26,.08)', chg:'+2', up:true },
                    { lbl:'Utilisateurs', val: allUsers.length, bar:'#a87ed8', ico:'👥', ibg:'rgba(168,126,216,.08)', chg:'+8%', up:true },
                  ].map((k,i) => (
                    <div key={i} className="kpi">
                      <div className="kpi-bar" style={{ background:k.bar }} />
                      <div className="kpi-ico" style={{ background:k.ibg }}><span style={{ fontSize:16 }}>{k.ico}</span></div>
                      <div className="kpi-lbl">{k.lbl}</div>
                      <div className="kpi-val">{k.val}</div>
                      <div className="kpi-chg"><span className={k.up ? 'up' : 'dn'}>{k.up ? '▲' : '▼'} {k.chg}</span></div>
                    </div>
                  ))}
                </div>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
                  {[
                    { lbl:'Taux conversion', val:'68%', bar:'var(--lime)', ico:'📈', ibg:'rgba(125,184,83,.08)' },
                    { lbl:'Organisateurs', val: approvedCount || 3, bar:'var(--amber)', ico:'🏢', ibg:'rgba(201,138,26,.08)' },
                    { lbl:'Note moyenne', val:'4.8', bar:'#e8b84a', ico:'⭐', ibg:'rgba(232,184,74,.08)' },
                    { lbl:'Signalements', val: modPendingCount, bar:'#c94040', ico:'🛡', ibg:'rgba(201,64,64,.08)' },
                  ].map((k,i) => (
                    <div key={i} className="kpi">
                      <div className="kpi-bar" style={{ background:k.bar }} />
                      <div className="kpi-ico" style={{ background:k.ibg }}><span style={{ fontSize:16 }}>{k.ico}</span></div>
                      <div className="kpi-lbl">{k.lbl}</div>
                      <div className="kpi-val">{k.val}</div>
                    </div>
                  ))}
                </div>

                <div className="ch-grid2">
                  {/* Revenue chart */}
                  <div className="ch-card">
                    <div className="ch-head"><div><div className="ch-title">Revenus — 7 derniers jours</div><div className="ch-sub">Total: {REVENUE_DATA.reduce((a,b)=>a+b.v,0).toLocaleString()} DT</div></div></div>
                    <div className="bar-ch">
                      {REVENUE_DATA.map((d,i) => (
                        <div key={i} className="bar-w">
                          <div className="bar-vl">{d.v}</div>
                          <div className="bar" style={{ height:`${(d.v/maxBar)*100}%`, background: i === REVENUE_DATA.length-1 ? 'var(--lime)' : 'rgba(125,184,83,.18)' }} />
                          <div className="bar-lbl">{d.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Categories donut */}
                  <div className="ch-card">
                    <div className="ch-head"><div className="ch-title">Par catégorie</div></div>
                    <div className="donut-w">
                      <svg viewBox="0 0 36 36" className="donut-svg" width="116" height="116">
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(125,184,83,.18)" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--lime)" strokeWidth="3.5" strokeDasharray="33 67" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--amber)" strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="-33" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#6496d8" strokeWidth="3.5" strokeDasharray="17 83" strokeDashoffset="-58" />
                        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--ember)" strokeWidth="3.5" strokeDasharray="15 85" strokeDashoffset="-75" />
                      </svg>
                      <div className="donut-mid"><div className="donut-v">{EVENTS.length}</div><div className="donut-l">événements</div></div>
                    </div>
                    {[['Camping','var(--lime)','2'],['Trek / Rando','var(--amber)','2'],['Bivouac','#6496d8','1'],['Escalade','var(--ember)','1']].map(([n,c,v],i)=>(
                      <div key={i} className="leg-item"><div className="leg-dot" style={{ background:c }} /><span className="leg-lbl">{n}</span><span className="leg-val">{v}</span></div>
                    ))}
                  </div>
                </div>

                {/* Activity timeline */}
                <div className="ch-card">
                  <div className="ch-head"><div className="ch-title">Activité récente</div></div>
                  <div className="adm-timeline">
                    {ACTIVITY_LOG.map(a => (
                      <div key={a.id} className="adm-tl-item">
                        <div className="adm-tl-icon">{a.icon}</div>
                        <div style={{ flex:1 }}>
                          <div className="adm-tl-text">{a.text}</div>
                          <div className="adm-tl-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ EVENTS ═══ */}
            {activeTab === 'aEvents' && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                  {[
                    { lbl:'Total événements', val:EVENTS.length, bar:'var(--lime)', ico:'🗺' },
                    { lbl:'Publiés', val:Object.values(evStatuses).filter(s=>s==='published').length, bar:'#6496d8', ico:'✅' },
                    { lbl:'Suspendus', val:Object.values(evStatuses).filter(s=>s==='suspended').length, bar:'var(--ember)', ico:'⏸' },
                  ].map((k,i) => (
                    <div key={i} className="kpi"><div className="kpi-bar" style={{ background:k.bar }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val">{k.val}</div></div>
                  ))}
                </div>

                <div className="ch-card">
                  <div className="ch-head" style={{ flexWrap:'wrap', gap:10 }}>
                    <div className="ch-title">Tous les événements</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <input className="adm-search" placeholder="🔍 Rechercher..." value={evSearch} onChange={e=>setEvSearch(e.target.value)} />
                      {['all','published','suspended'].map(f=>(
                        <button key={f} className={`adm-filter-btn${evFilter===f?' active':''}`} onClick={()=>setEvFilter(f)}>
                          {f==='all'?'Tous':f==='published'?'Publiés':'Suspendus'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="t-wrap">
                    <table className="dt">
                      <thead><tr><th>Événement</th><th>Catégorie</th><th>Lieu</th><th>Date</th><th>Prix</th><th>Diff.</th><th>Organisateur</th><th>Statut</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredEvents.map(ev => (
                          <tr key={ev.id}>
                            <td className="td-main">
                              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div className={`adm-ev-thumb ${ev.cls}`} />
                                <div style={{ maxWidth:180 }}>
                                  <div style={{ fontWeight:600, fontSize:'.82rem', lineHeight:1.3 }}>{ev.title}</div>
                                  {evFeatured[ev.id] && <span style={{ fontSize:'.6rem', color:'var(--amber)' }}>⭐ En avant</span>}
                                </div>
                              </div>
                            </td>
                            <td><span className="adm-cat-tag">{ev.category || ev.cat}</span></td>
                            <td>{ev.location || ev.loc}</td>
                            <td>{ev.date}</td>
                            <td style={{ fontWeight:700, color:'var(--lime)' }}>{ev.price}</td>
                            <td>{statusBadge(ev.diff === 'Facile' ? 'published' : ev.diff === 'Modéré' ? 'pending' : 'suspended')}</td>
                            <td style={{ fontSize:'.78rem' }}>{ev.organizer || ev.org}</td>
                            <td></td>
                            <td>{statusBadge(evStatuses[ev.id] || ev.status || "published")}</td>
                            <td>
                              <div style={{ display:'flex', gap:4 }}>
                                <button className="adm-action-btn" title={(evStatuses[ev.id]||ev.status||'published')==='published'?'Suspendre':'Publier'} onClick={()=>toggleEvStatus(ev.id)}>
                                  {(evStatuses[ev.id]||ev.status||'published')==='published'?'⏸':'▶'}
                                </button>
                                <button className={`adm-action-btn${evFeatured[ev.id]?' featured':''}`} title="Mettre en avant" onClick={()=>toggleFeatured(ev.id)}>⭐</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredEvents.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(240,234,216,.3)' }}>Aucun événement trouvé</div>}
                </div>
              </>
            )}

            {/* ═══ RESERVATIONS ═══ */}
            {activeTab === 'aReservations' && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
                  {[
                    { lbl:'Total réservations', val:allReservations.length || BOOKINGS_TABLE.length, bar:'var(--lime)', ico:'🎫' },
                    { lbl:'Revenus', val:`${totalRevenue || 748} DT`, bar:'var(--amber)', ico:'💰' },
                    { lbl:'Confirmées', val:allReservations.filter(r=>r.status==='confirmed').length || BOOKINGS_TABLE.filter(r=>r.st==='confirmed').length, bar:'#6496d8', ico:'✅' },
                    { lbl:'Taux confirmation', val:'92%', bar:'var(--lime)', ico:'📈' },
                  ].map((k,i) => (
                    <div key={i} className="kpi"><div className="kpi-bar" style={{ background:k.bar }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val">{k.val}</div></div>
                  ))}
                </div>

                <div className="ch-card">
                  <div className="ch-head" style={{ flexWrap:'wrap', gap:10 }}>
                    <div className="ch-title">Toutes les réservations</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <input className="adm-search" placeholder="🔍 Rechercher ref, événement..." value={resSearch} onChange={e=>setResSearch(e.target.value)} />
                      {['all','confirmed','pending','cancelled'].map(f=>(
                        <button key={f} className={`adm-filter-btn${resFilter===f?' active':''}`} onClick={()=>setResFilter(f)}>
                          {f==='all'?'Tous':f==='confirmed'?'Confirmées':f==='pending'?'En attente':'Annulées'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="t-wrap">
                    <table className="dt">
                      <thead><tr><th>Référence</th><th>Client</th><th>Événement</th><th>Date</th><th>Type</th><th>Qté</th><th>Total</th><th>Statut</th></tr></thead>
                      <tbody>
                        {filteredRes.map((r,i) => (
                          <tr key={r.id || r.ref || i}>
                            <td style={{ fontFamily:'monospace', fontSize:'.75rem', color:'var(--lime2)' }}>{r.id || r.ref}</td>
                            <td className="td-main">{r.userName || r.name || '—'}</td>
                            <td>{r.event_title || r.eventTitle || r.ev}</td>
                            <td>{r.eventDate || r.date}</td>
                            <td>{r.optionLabel || r.tkt || 'Standard'}</td>
                            <td style={{ textAlign:'center' }}>{r.ticketCount || r.qty || 1}</td>
                            <td style={{ fontWeight:700, color:'var(--lime)' }}>{r.price || r.total}</td>
                            <td>{statusBadge(r.status || r.st)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ═══ ORGANISATEURS ═══ */}
            {activeTab === 'aOrgs' && !selectedRequest && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                  {[
                    { lbl:'En attente', val:pendingCount, bar:'var(--amber)', ico:'⏳' },
                    { lbl:'Approuvées', val:approvedCount, bar:'var(--lime)', ico:'✅' },
                    { lbl:'Refusées', val:rejectedCount, bar:'var(--ember)', ico:'❌' },
                  ].map((k,i) => (
                    <div key={i} className="kpi"><div className="kpi-bar" style={{ background:k.bar }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val">{k.val}</div></div>
                  ))}
                </div>

                <div className="adm-subtabs">
                  {[['requests','📋 Demandes'],['active','🏢 Actifs']].map(([id,label])=>(
                    <button key={id} className={`adm-subtab${orgSubTab===id?' active':''}`} onClick={()=>setOrgSubTab(id)}>{label}</button>
                  ))}
                </div>

                {orgSubTab === 'requests' && (
                  <div className="ch-card">
                    {orgRequests.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(240,234,216,.3)' }}><div style={{ fontSize:48, marginBottom:14 }}>📋</div>Aucune demande reçue</div>
                    ) : (
                      <div className="t-wrap">
                        <table className="dt">
                          <thead><tr><th>Candidat</th><th>Email</th><th>Tél.</th><th>Date</th><th>Doc</th><th>Statut</th><th>Actions</th></tr></thead>
                          <tbody>
                            {orgRequests.slice().reverse().map(req => (
                              <tr key={req.id}>
                                <td className="td-main" style={{ cursor:'pointer' }} onClick={()=>setSelectedRequest(req)}>
                                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <div className="admin-req-avatar" style={{ width:28, height:28, fontSize:'.6rem' }}>{(req.firstName?.[0]||'')+(req.lastName?.[0]||'')}</div>
                                    {req.firstName} {req.lastName}
                                  </div>
                                </td>
                                <td>{req.email}</td>
                                <td>{req.phone}</td>
                                <td>{formatDate(req.createdAt)}</td>
                                <td>{req.document ? <button className="abtn abtn-g" style={{ padding:'4px 10px', fontSize:'.72rem' }} onClick={()=>setDocPreview({ data:req.document, name:req.documentName })}>📄 Voir</button> : '—'}</td>
                                <td>{statusBadge(req.status)}</td>
                                <td>
                                  {req.status === 'pending' ? (
                                    <div style={{ display:'flex', gap:5 }}>
                                      <button className="abtn abtn-p" style={{ padding:'5px 10px', fontSize:'.72rem' }} onClick={()=>handleApprove(req.id)}>✓</button>
                                      <button className="abtn abtn-d" style={{ padding:'5px 10px', fontSize:'.72rem' }} onClick={()=>handleOpenReject(req)}>✕</button>
                                    </div>
                                  ) : <button className="abtn abtn-g" style={{ padding:'5px 10px', fontSize:'.72rem' }} onClick={()=>setSelectedRequest(req)}>Détails</button>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {orgSubTab === 'active' && (
                  <div className="ch-card">
                    <div className="ch-head"><div className="ch-title">Organisateurs actifs</div></div>
                    {allUsers.filter(u=>u.role==='org').length === 0 ? (
                      <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(240,234,216,.3)' }}>Aucun organisateur actif</div>
                    ) : (
                      <div className="t-wrap">
                        <table className="dt">
                          <thead><tr><th>Organisateur</th><th>Email</th><th>Statut</th><th>ID</th></tr></thead>
                          <tbody>
                            {allUsers.filter(u=>u.role==='org').map(u=>(
                              <tr key={u.id}>
                                <td className="td-main"><div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="admin-req-avatar" style={{ width:28, height:28, fontSize:'.6rem', background:'rgba(125,184,83,.15)', color:'var(--lime)' }}>{u.avatar||u.name?.slice(0,2)}</div>{u.name}</div></td>
                                <td>{u.email}</td>
                                <td>{statusBadge('approved')}</td>
                                <td style={{ fontFamily:'monospace', fontSize:'.72rem', color:'rgba(240,234,216,.25)' }}>{u.id}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ORG REQUEST DETAIL */}
            {activeTab === 'aOrgs' && selectedRequest && (
              <div>
                <button className="abtn abtn-g" style={{ marginBottom:16 }} onClick={()=>setSelectedRequest(null)}>← Retour</button>
                <div className="ch-card">
                  <div className="ch-head">
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div className="admin-detail-avatar">{(selectedRequest.firstName?.[0]||'')+(selectedRequest.lastName?.[0]||'')}</div>
                      <div><div className="ch-title">{selectedRequest.firstName} {selectedRequest.lastName}</div><div style={{ fontSize:'.72rem', color:'rgba(240,234,216,.3)' }}>{selectedRequest.id}</div></div>
                    </div>
                    {statusBadge(selectedRequest.status)}
                  </div>
                  <div className="admin-detail-grid">
                    {[['Email',selectedRequest.email],['Téléphone',selectedRequest.phone],['Date de demande',formatDate(selectedRequest.createdAt)],selectedRequest.reviewedAt?['Traitement',formatDate(selectedRequest.reviewedAt)]:null].filter(Boolean).map(([l,v])=>(
                      <div key={l} className="admin-detail-field"><div className="admin-detail-label">{l}</div><div className="admin-detail-value">{v}</div></div>
                    ))}
                  </div>
                  <div style={{ marginTop:16 }}><div className="admin-detail-label">Motivation</div><div className="admin-detail-text">{selectedRequest.description||'—'}</div></div>
                  {selectedRequest.rejectionReason && <div style={{ marginTop:16, background:'rgba(168,78,21,.08)', border:'1px solid rgba(168,78,21,.2)', borderRadius:'var(--r)', padding:14 }}><div className="admin-detail-label" style={{ color:'var(--ember)' }}>Motif du refus</div><div className="admin-detail-text">{selectedRequest.rejectionReason}</div></div>}
                  {selectedRequest.document && <div style={{ marginTop:16 }}><div className="admin-detail-label">Document</div><div className="admin-doc-card" onClick={()=>setDocPreview({ data:selectedRequest.document, name:selectedRequest.documentName })}><span style={{ fontSize:24 }}>📄</span><div style={{ flex:1 }}><div style={{ fontWeight:600, color:'var(--cream)', fontSize:'.85rem' }}>{selectedRequest.documentName}</div></div><span style={{ color:'var(--lime)', fontSize:'.8rem' }}>Ouvrir →</span></div></div>}
                  {selectedRequest.status === 'pending' && (
                    <div style={{ display:'flex', gap:10, marginTop:20 }}>
                      <button className="abtn abtn-p" style={{ flex:1, padding:12 }} onClick={()=>handleApprove(selectedRequest.id)}>✅ Accepter</button>
                      <button className="abtn abtn-d" style={{ flex:1, padding:12 }} onClick={()=>handleOpenReject(selectedRequest)}>❌ Refuser</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ USERS ═══ */}
            {activeTab === 'aUsers' && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
                  {[
                    { lbl:'Total', val:allUsers.length, bar:'#a87ed8', ico:'👥' },
                    { lbl:'Aventuriers', val:usersByRole.user, bar:'var(--lime)', ico:'🏕' },
                    { lbl:'Organisateurs', val:usersByRole.org, bar:'var(--amber)', ico:'🏢' },
                    { lbl:'Admins', val:usersByRole.admin, bar:'#c94040', ico:'🛡' },
                  ].map((k,i) => (
                    <div key={i} className="kpi"><div className="kpi-bar" style={{ background:k.bar }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val">{k.val}</div></div>
                  ))}
                </div>

                <div className="ch-card">
                  <div className="ch-head" style={{ flexWrap:'wrap', gap:10 }}>
                    <div className="ch-title">Tous les utilisateurs ({filteredUsers.length})</div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <input className="adm-search" placeholder="🔍 Rechercher nom, email..." value={userSearch} onChange={e=>setUserSearch(e.target.value)} />
                      {['all','user','org','admin'].map(f=>(
                        <button key={f} className={`adm-filter-btn${userRoleFilter===f?' active':''}`} onClick={()=>setUserRoleFilter(f)}>
                          {f==='all'?'Tous':f==='user'?'Aventuriers':f==='org'?'Orgs':'Admins'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="t-wrap">
                    <table className="dt">
                      <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>ID</th><th>Actions</th></tr></thead>
                      <tbody>
                        {filteredUsers.map(u => (
                          <tr key={u.id}>
                            <td className="td-main"><div style={{ display:'flex', alignItems:'center', gap:8 }}><div className="admin-req-avatar" style={{ width:28, height:28, fontSize:'.6rem' }}>{u.avatar||u.name?.slice(0,2).toUpperCase()||'??'}</div>{u.name}</div></td>
                            <td>{u.email}</td>
                            <td>{roleBadge(u.role)}</td>
                            <td style={{ fontFamily:'monospace', fontSize:'.72rem', color:'rgba(240,234,216,.25)' }}>{u.id}</td>
                            <td>
                              <div style={{ display:'flex', gap:4 }}>
                                <button className="adm-action-btn" title="Voir profil">👁</button>
                                {u.role !== 'admin' && <button className="adm-action-btn" title="Suspendre" style={{ color:'var(--ember)' }}>⏸</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredUsers.length === 0 && <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(240,234,216,.3)' }}>Aucun utilisateur trouvé</div>}
                </div>
              </>
            )}

            {/* ═══ MODERATION ═══ */}
            {activeTab === 'aModeration' && (
              <>
                <div className="kpi-row" style={{ gridTemplateColumns:'repeat(3,1fr)' }}>
                  {[
                    { lbl:'Avis signalés', val:reportedReviews.filter(r=>r.status==='pending').length, bar:'#c94040', ico:'💬' },
                    { lbl:'Événements signalés', val:reportedEvents.filter(r=>r.status==='pending').length, bar:'var(--amber)', ico:'🗺' },
                    { lbl:'Traités ce mois', val:reportedReviews.filter(r=>r.status!=='pending').length + reportedEvents.filter(r=>r.status!=='pending').length, bar:'var(--lime)', ico:'✅' },
                  ].map((k,i) => (
                    <div key={i} className="kpi"><div className="kpi-bar" style={{ background:k.bar }} /><div className="kpi-lbl">{k.lbl}</div><div className="kpi-val">{k.val}</div></div>
                  ))}
                </div>

                <div className="adm-subtabs">
                  {[['reviews','💬 Avis signalés'],['events','🗺 Événements signalés']].map(([id,label])=>(
                    <button key={id} className={`adm-subtab${modTab===id?' active':''}`} onClick={()=>setModTab(id)}>{label}</button>
                  ))}
                </div>

                {modTab === 'reviews' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {reportedReviews.map(r => (
                      <div key={r.ref_code || r.id} className="adm-report-card">
                        <div className="adm-report-header">
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                              <span style={{ fontWeight:700, color:'var(--cream)' }}>{r.user}</span>
                              <span style={{ fontSize:'.72rem', color:'rgba(240,234,216,.3)' }}>sur {r.event}</span>
                            </div>
                            <div className="adm-report-reason">🚩 {r.reason}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:'.72rem', color:'rgba(240,234,216,.25)' }}>{r.date}</span>
                            {statusBadge(r.status)}
                          </div>
                        </div>
                        <div className="adm-report-content">"{r.text}"</div>
                        {r.status === 'pending' && (
                          <div className="adm-report-actions">
                            <button className="abtn abtn-p" style={{ padding:'6px 14px', fontSize:'.78rem' }} onClick={()=>handleReviewAction(r.id,'approve')}>✓ Approuver</button>
                            <button className="abtn abtn-d" style={{ padding:'6px 14px', fontSize:'.78rem' }} onClick={()=>handleReviewAction(r.id,'delete')}>🗑 Supprimer</button>
                            <button className="abtn abtn-g" style={{ padding:'6px 14px', fontSize:'.78rem' }}>⚠️ Avertir</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {modTab === 'events' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {reportedEvents.map(r => (
                      <div key={r.ref_code || r.id} className="adm-report-card">
                        <div className="adm-report-header">
                          <div>
                            <div style={{ fontWeight:700, color:'var(--cream)', marginBottom:4 }}>{r.event}</div>
                            <div style={{ fontSize:'.78rem', color:'rgba(240,234,216,.4)' }}>Par {r.org}</div>
                            <div className="adm-report-reason">🚩 {r.reason}</div>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:'.72rem', color:'rgba(240,234,216,.25)' }}>{r.date}</span>
                            {statusBadge(r.status)}
                          </div>
                        </div>
                        {r.status === 'pending' && (
                          <div className="adm-report-actions">
                            <button className="abtn abtn-p" style={{ padding:'6px 14px', fontSize:'.78rem' }} onClick={()=>handleEventReportAction(r.id,'approve')}>✓ Approuver</button>
                            <button className="abtn abtn-d" style={{ padding:'6px 14px', fontSize:'.78rem' }} onClick={()=>handleEventReportAction(r.id,'remove')}>🗑 Retirer</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ═══ SETTINGS ═══ */}
            {activeTab === 'aSettings' && (
              <>
                <div className="fsec">
                  <div className="fsec-title">Notifications</div>
                  {[
                    { name:'Notifications nouvelles demandes', sub:'Alerte quand une demande organisateur est soumise' },
                    { name:'Email de bienvenue', sub:'Envoyer un email aux organisateurs approuvés' },
                    { name:'Alertes réservations', sub:'Notification pour chaque nouvelle réservation' },
                  ].map((t,i) => (
                    <div key={i} className="tog-row"><div><div className="tog-name">{t.name}</div><div className="tog-sub">{t.sub}</div></div><ToggleSwitch defaultOn={i<2} /></div>
                  ))}
                </div>
                <div className="fsec">
                  <div className="fsec-title">Modération</div>
                  {[
                    { name:'Auto-modération des avis', sub:'Filtrer automatiquement le contenu offensant' },
                    { name:'Validation événements', sub:'Approuver manuellement tout nouvel événement' },
                    { name:'Auto-refus après 30 jours', sub:'Refuser les demandes sans réponse' },
                  ].map((t,i) => (
                    <div key={i} className="tog-row"><div><div className="tog-name">{t.name}</div><div className="tog-sub">{t.sub}</div></div><ToggleSwitch defaultOn={i===0} /></div>
                  ))}
                </div>
                <div className="fsec">
                  <div className="fsec-title">Système</div>
                  {[
                    { name:'Mode maintenance', sub:'Désactiver temporairement l\'accès public' },
                    { name:'Logs d\'activité', sub:'Enregistrer toutes les actions admin' },
                  ].map((t,i) => (
                    <div key={i} className="tog-row"><div><div className="tog-name">{t.name}</div><div className="tog-sub">{t.sub}</div></div><ToggleSwitch defaultOn={i===1} /></div>
                  ))}
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </>
  )
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return <div className={`t-sw${on ? ' on' : ''}`} onClick={() => setOn(v => !v)}><div className="th" style={{ left: on ? 19 : 2 }} /></div>
}
