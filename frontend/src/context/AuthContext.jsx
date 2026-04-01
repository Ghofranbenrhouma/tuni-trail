import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'tuniTrail_users'
const SESSION_KEY = 'tuniTrail_session'
const ORG_REQUESTS_KEY = 'tuniTrail_orgRequests'

const ADMIN_ACCOUNT = {
  id: 'admin-001',
  email: 'admin@tunitrail.com',
  password: 'admin123',
  name: 'Admin TuniTrail',
  role: 'admin',
  avatar: 'AT',
}

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    if (!users.find(u => u.email === ADMIN_ACCOUNT.email)) {
      users.push({ ...ADMIN_ACCOUNT })
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
    return users
  } catch { return [{ ...ADMIN_ACCOUNT }] }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getOrgRequests() {
  try { return JSON.parse(localStorage.getItem(ORG_REQUESTS_KEY) || '[]') }
  catch { return [] }
}
function saveOrgRequests(requests) {
  localStorage.setItem(ORG_REQUESTS_KEY, JSON.stringify(requests))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [orgRequests, setOrgRequests] = useState([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch { }
    getUsers()
    setOrgRequests(getOrgRequests())
  }, [])

  const register = (data) => {
    const users = getUsers()
    if (users.find(u => u.email === data.email)) return { error: 'Email déjà utilisé' }
    const newUser = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password,
      name: data.name || 'Aventurier',
      role: data.role || 'user',
      avatar: (data.name || 'A').slice(0, 2).toUpperCase(),
    }
    saveUsers([...users, newUser])
    const { password: _, ...safe } = newUser
    setUser(safe)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
    return { success: true, user: safe }
  }

  const login = (email, password, role) => {
    if (!email && !password) {
      const demo = {
        id: role === 'org' ? 'demo-org' : 'demo-user',
        email: role === 'org' ? 'org@demo.com' : 'user@demo.com',
        name: role === 'org' ? 'Tribus Aventure' : 'Ahmed Ben Ali',
        role, avatar: role === 'org' ? 'TA' : 'AB',
      }
      setUser(demo)
      localStorage.setItem(SESSION_KEY, JSON.stringify(demo))
      return { success: true }
    }
    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { error: 'Email ou mot de passe incorrect' }
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe))
    return { success: true }
  }

  const logout = () => { setUser(null); localStorage.removeItem(SESSION_KEY) }

  const updateProfile = (updates) => {
    if (!user) return
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates }
      saveUsers(users)
    }
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))
  }

  /* ── Org request management ──────────────────────── */

  const submitOrgRequest = (requestData) => {
    const requests = getOrgRequests()
    const existing = requests.find(r => r.userId === requestData.userId && r.status === 'pending')
    if (existing) return { error: 'Vous avez déjà une demande en attente' }

    const newRequest = {
      id: 'REQ-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      rejectionReason: null,
      reviewedAt: null,
      ...requestData,
    }
    const updated = [...requests, newRequest]
    saveOrgRequests(updated)
    setOrgRequests(updated)
    return { success: true }
  }

  const approveOrgRequest = (requestId) => {
    const requests = getOrgRequests()
    const idx = requests.findIndex(r => r.id === requestId)
    if (idx === -1) return

    requests[idx].status = 'approved'
    requests[idx].reviewedAt = new Date().toISOString()
    saveOrgRequests(requests)
    setOrgRequests([...requests])

    // Upgrade user role to 'org'
    const users = getUsers()
    const userIdx = users.findIndex(u => u.id === requests[idx].userId)
    if (userIdx !== -1) {
      users[userIdx].role = 'org'
      saveUsers(users)
    }
  }

  const rejectOrgRequest = (requestId, reason) => {
    const requests = getOrgRequests()
    const idx = requests.findIndex(r => r.id === requestId)
    if (idx === -1) return

    requests[idx].status = 'rejected'
    requests[idx].rejectionReason = reason
    requests[idx].reviewedAt = new Date().toISOString()
    saveOrgRequests(requests)
    setOrgRequests([...requests])

    // Revert user role back to 'user'
    const users = getUsers()
    const userIdx = users.findIndex(u => u.id === requests[idx].userId)
    if (userIdx !== -1) {
      users[userIdx].role = 'user'
      saveUsers(users)
    }
  }

  const getMyOrgRequest = () => {
    if (!user) return null
    const requests = getOrgRequests()
    const mine = requests.filter(r => r.userId === user.id)
    return mine.length > 0 ? mine[mine.length - 1] : null
  }

  const getAllUsers = () => {
    return getUsers().map(({ password, ...safe }) => safe)
  }

  const refreshOrgRequests = () => {
    setOrgRequests(getOrgRequests())
  }

  return (
    <AuthContext.Provider value={{
      user, login, logout, register, updateProfile,
      orgRequests, submitOrgRequest, approveOrgRequest, rejectOrgRequest,
      getMyOrgRequest, getAllUsers, refreshOrgRequests,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
