import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Modal({ open, initialView, onClose, onToast }) {
  const [view, setView] = useState('login')       // login | register | orgForm
  const [roleTab, setRoleTab] = useState('user')
  const [err, setErr] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', role: 'user',
    // Org-specific fields
    description: '', phone: '', orgEmail: '',
    document: null, documentName: '',
    eventHistory: '',
  })
  const { login, register, submitOrgRequest } = useAuth()

  // Sync view with initialView when modal opens
  useEffect(() => {
    if (open && initialView) {
      setView(initialView)
      setErr('')
    }
  }, [open, initialView])

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr('') }

  const handleLogin = () => {
    const res = login(form.email, form.password)
    if (res.error) { setErr(res.error); return }
    onClose(); onToast && onToast('Bienvenue sur TuniTrail !')
  }

  const handleRegister = () => {
    if (!form.firstName || !form.email || !form.password) { setErr('Veuillez remplir tous les champs'); return }
    if (form.role === 'org') {
      // Go to org application form (step 2)
      set('orgEmail', form.email)
      setView('orgForm')
      return
    }
    const res = register({ name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, password: form.password, role: 'user' })
    if (res.error) { setErr(res.error); return }
    onClose(); onToast && onToast('Compte créé ! Bienvenue sur TuniTrail 🎉')
  }

  const handleFileSelect = (file) => {
    if (!file) return
    if (file.type !== 'application/pdf') { setErr('Seuls les fichiers PDF sont acceptés'); return }
    if (file.size > 5 * 1024 * 1024) { setErr('Le fichier ne doit pas dépasser 5 Mo'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      setForm(f => ({ ...f, document: e.target.result, documentName: file.name }))
      setErr('')
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const handleOrgSubmit = () => {
    if (!form.firstName || !form.lastName) { setErr('Nom et prénom sont obligatoires'); return }
    if (!form.description) { setErr('Veuillez décrire votre activité'); return }
    if (!form.phone) { setErr('Le numéro de téléphone est obligatoire'); return }
    if (!form.orgEmail) { setErr("L'email est obligatoire"); return }
    if (!form.document) { setErr('Veuillez fournir un document justificatif (PDF)'); return }

    setSubmitting(true)
    setTimeout(() => {
      // 1) Create the account with role 'pending_org'
      const regRes = register({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: 'pending_org',
      })
      if (regRes.error) { setErr(regRes.error); setSubmitting(false); return }

      // 2) Store the org request details
      submitOrgRequest({
        userId: regRes.user.id,
        userEmail: form.email,
        userName: `${form.firstName} ${form.lastName}`.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        description: form.description,
        phone: form.phone,
        email: form.orgEmail,
        document: form.document,
        documentName: form.documentName,
        eventHistory: form.eventHistory,
      })

      setSubmitting(false)
      onClose()
      onToast && onToast('✅ Demande envoyée ! Un administrateur examinera votre candidature.')
    }, 800)
  }

  const handleDemo = (role) => {
    login('', '', role); onClose()
    onToast && onToast(`Bienvenue ${role === 'org' ? 'Tribus Aventure' : 'Ahmed'} !`)
  }

  if (!open) return null

  return (
    <div className="modal-bg open" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`modal-box${view === 'orgForm' ? ' modal-box-wide' : ''}`}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ═══ LOGIN ═══ */}
        {view === 'login' && (
          <>
            <div className="modal-ey">Espace membre</div>
            <h2 className="modal-h">Connexion</h2>
            <p className="modal-sub">Accédez à votre espace personnel TuniTrail</p>

            <div className="role-tabs">
              <button className={`role-tab${roleTab === 'user' ? ' active' : ''}`} onClick={() => setRoleTab('user')}>Aventurier</button>
              <button className={`role-tab${roleTab === 'org' ? ' active' : ''}`} onClick={() => setRoleTab('org')}>Organisateur</button>
            </div>

            <label className="m-lbl">Email</label>
            <input className="m-inp" type="email" placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <label className="m-lbl">Mot de passe</label>
            <input className="m-inp" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />

            {err && <div style={{ color: 'var(--ember)', fontSize: '.8rem', marginBottom: 8 }}>⚠ {err}</div>}

            <button className="btn-mfull" onClick={handleLogin}>Se connecter</button>

            <div className="social-divider"><span>ou continuer avec</span></div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-social" onClick={() => handleDemo('user')}>
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="btn-social" onClick={() => handleDemo('org')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>

            <p className="modal-sw">Pas encore membre ?{' '}<a onClick={() => { setView('register'); setErr('') }}>S'inscrire</a></p>
          </>
        )}

        {/* ═══ REGISTER STEP 1 ═══ */}
        {view === 'register' && (
          <>
            <div className="modal-ey">Rejoindre TuniTrail</div>
            <h2 className="modal-h">Créer un compte</h2>
            <p className="modal-sub">Rejoignez la communauté des aventuriers tunisiens</p>

            <div className="m-row">
              <div>
                <label className="m-lbl">Prénom *</label>
                <input className="m-inp" placeholder="Ahmed" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div>
                <label className="m-lbl">Nom</label>
                <input className="m-inp" placeholder="Ben Ali" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>
            <label className="m-lbl">Email *</label>
            <input className="m-inp" type="email" placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            <label className="m-lbl">Mot de passe *</label>
            <input className="m-inp" type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            <label className="m-lbl">Vous êtes</label>
            <select className="m-sel" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="user">Aventurier / Randonneur</option>
              <option value="org">Organisateur d'événements</option>
            </select>

            {form.role === 'org' && (
              <div className="org-notice">
                <span className="org-notice-icon">ℹ️</span>
                <span>En tant qu'organisateur, vous devrez compléter un formulaire de candidature qui sera examiné par un administrateur.</span>
              </div>
            )}

            {err && <div style={{ color: 'var(--ember)', fontSize: '.8rem', marginBottom: 8 }}>⚠ {err}</div>}

            <button className="btn-mfull" onClick={handleRegister}>
              {form.role === 'org' ? 'Continuer → Formulaire organisateur' : 'Créer mon compte'}
            </button>

            <p className="modal-sw">Déjà membre ?{' '}<a onClick={() => { setView('login'); setErr('') }}>Se connecter</a></p>
          </>
        )}

        {/* ═══ ORG APPLICATION FORM (STEP 2) ═══ */}
        {view === 'orgForm' && (
          <>
            <div className="modal-ey" style={{ color: 'var(--amber)' }}>Devenir Organisateur</div>
            <h2 className="modal-h">Formulaire de candidature</h2>
            <p className="modal-sub">Complétez votre profil organisateur. Votre demande sera examinée par un administrateur.</p>

            {/* Steps indicator */}
            <div className="org-steps">
              <div className="org-step done"><div className="org-step-num">✓</div><span>Inscription</span></div>
              <div className="org-step-line active" />
              <div className="org-step active"><div className="org-step-num">2</div><span>Candidature</span></div>
              <div className="org-step-line" />
              <div className="org-step"><div className="org-step-num">3</div><span>Validation</span></div>
            </div>

            <div className="org-form-scroll">
              {/* Nom & Prénom */}
              <div className="m-row">
                <div>
                  <label className="m-lbl">Nom *</label>
                  <input className="m-inp" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Votre nom" />
                </div>
                <div>
                  <label className="m-lbl">Prénom *</label>
                  <input className="m-inp" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Votre prénom" />
                </div>
              </div>

              {/* Description */}
              <label className="m-lbl">Description / Motivation *</label>
              <textarea
                className="m-inp m-textarea"
                placeholder="Décrivez votre activité, votre expérience dans l'organisation d'événements outdoor..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />

              {/* Téléphone & Email */}
              <div className="m-row">
                <div>
                  <label className="m-lbl">Numéro de téléphone *</label>
                  <input className="m-inp" type="tel" placeholder="+216 xx xxx xxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="m-lbl">Email de contact *</label>
                  <input className="m-inp" type="email" placeholder="contact@org.tn" value={form.orgEmail} onChange={e => set('orgEmail', e.target.value)} />
                </div>
              </div>

              {/* Upload PDF */}
              <label className="m-lbl">Document justificatif (PDF) *</label>
              <div
                className={`upload-zone${dragOver ? ' drag-over' : ''}${form.document ? ' has-file' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input ref={fileRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e.target.files[0])} />
                {form.document ? (
                  <div className="upload-done">
                    <div className="upload-done-icon">📄</div>
                    <div className="upload-done-name">{form.documentName}</div>
                    <div className="upload-done-check">✓ Fichier chargé</div>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="upload-text"><strong>Glissez votre fichier ici</strong> ou cliquez pour parcourir</div>
                    <div className="upload-hint">CIN ou Registre de commerce · PDF uniquement · Max 5 Mo</div>
                  </>
                )}
              </div>

              {/* Historique événements */}
              <label className="m-lbl">Historique d'événements <span style={{ opacity: 0.4 }}>(optionnel)</span></label>
              <textarea
                className="m-inp m-textarea"
                placeholder="Listez vos événements passés, nombre de participants, etc."
                value={form.eventHistory}
                onChange={e => set('eventHistory', e.target.value)}
                style={{ minHeight: 60 }}
              />
            </div>

            {err && <div style={{ color: 'var(--ember)', fontSize: '.8rem', marginBottom: 8, marginTop: 4 }}>⚠ {err}</div>}

            <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
              <button
                className="btn-mfull"
                style={{ background: 'transparent', border: '1px solid var(--border2)', color: 'rgba(240,234,216,.5)', flex: '0 0 100px', padding: '14px 0', fontSize: '.82rem' }}
                onClick={() => { setView('register'); setErr('') }}
              >
                ← Retour
              </button>
              <button className="btn-mfull" onClick={handleOrgSubmit} disabled={submitting} style={{ opacity: submitting ? 0.6 : 1, flex: 1 }}>
                {submitting ? '⏳ Envoi en cours...' : '📤 Soumettre ma candidature'}
              </button>
            </div>

            <p style={{ fontSize: '.72rem', color: 'rgba(240,234,216,.22)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
              Votre demande sera examinée sous 24 à 48h. Vous recevrez une notification par email.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
