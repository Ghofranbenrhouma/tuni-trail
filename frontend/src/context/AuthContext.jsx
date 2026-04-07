import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, usersApi, orgRequestsApi, setToken, clearToken } from '../services/api'

const AuthContext = createContext(null)

// ── Tiny session persistence: only token + user stored in sessionStorage ─
// sessionStorage is cleared when browser tab is closed — much safer than localStorage.
// We do NOT store passwords, full user lists, or org request data there.
const SESSION_TOKEN_KEY = 'tt_token'
const SESSION_USER_KEY  = 'tt_user'

function readSession() {
  try {
    const token = sessionStorage.getItem(SESSION_TOKEN_KEY)
    const user  = JSON.parse(sessionStorage.getItem(SESSION_USER_KEY) || 'null')
    return { token, user }
  } catch { return { token: null, user: null } }
}

function writeSession(token, user) {
  try {
    if (token && user) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token)
      sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY)
      sessionStorage.removeItem(SESSION_USER_KEY)
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null)
  const [orgRequests, setOrgRequests] = useState([])
  const [loading, setLoading]         = useState(true)

  // Rehydrate session on first mount
  useEffect(() => {
    const { token, user: savedUser } = readSession()
    if (token && savedUser) {
      setToken(token)
      setUser(savedUser)
      // Refresh user from backend in background
      usersApi.getMe()
        .then(fresh => { setUser(fresh); writeSession(token, fresh) })
        .catch(() => { /* token may be expired — clear */ clearSession() })
    }
    setLoading(false)
  }, [])

  const clearSession = () => {
    clearToken()
    setUser(null)
    setOrgRequests([])
    writeSession(null, null)
  }

  // ── Register ─────────────────────────────────────────────────────────
  const register = async (data) => {
    try {
      const res = await authApi.register(data)
      setToken(res.token)
      setUser(res.user)
      writeSession(res.token, res.user)
      return { success: true, user: res.user }
    } catch (err) {
      return { error: err.message || 'Erreur lors de l\'inscription' }
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────
  const login = async (email, password, role) => {
    try {
      const payload = (!email && !password && role) ? { role } : { email, password }
      const res = await authApi.login(payload)
      setToken(res.token)
      setUser(res.user)
      writeSession(res.token, res.user)
      return { success: true }
    } catch (err) {
      return { error: err.message || 'Email ou mot de passe incorrect' }
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = () => clearSession()

  // ── Update profile ───────────────────────────────────────────────────
  const updateProfile = async (updates) => {
    try {
      const updated = await usersApi.updateMe(updates)
      setUser(updated)
      const { token } = readSession()
      writeSession(token, updated)
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  // ── Org requests (loaded lazily when admin/user needs them) ───────────
  const loadOrgRequests = useCallback(async () => {
    try {
      const data = await orgRequestsApi.getAll()
      setOrgRequests(data || [])
    } catch {}
  }, [])

  const refreshOrgRequests = loadOrgRequests

  const submitOrgRequest = async (requestData) => {
    try {
      const res = await orgRequestsApi.submit(requestData)
      return { success: true, data: res }
    } catch (err) {
      return { error: err.message }
    }
  }

  const approveOrgRequest = async (requestId) => {
    try {
      await orgRequestsApi.approve(requestId)
      await loadOrgRequests()
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  const rejectOrgRequest = async (requestId, reason) => {
    try {
      await orgRequestsApi.reject(requestId, reason)
      await loadOrgRequests()
      return { success: true }
    } catch (err) {
      return { error: err.message }
    }
  }

  const getMyOrgRequest = async () => {
    try {
      return await orgRequestsApi.getMine()
    } catch { return null }
  }

  const getAllUsers = async () => {
    try {
      return await usersApi.getAll()
    } catch { return [] }
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, register, updateProfile,
      orgRequests, submitOrgRequest, approveOrgRequest, rejectOrgRequest,
      getMyOrgRequest, getAllUsers, refreshOrgRequests, loadOrgRequests,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
