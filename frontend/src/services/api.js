// ── TuniTrail API Service ────────────────────────────────────────────────
// All calls go through this module. Token is stored in memory (not localStorage).

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token management (in-memory, not localStorage) ──────────────────────
let _token = null

export function setToken(token) { _token = token }
export function getToken() { return _token }
export function clearToken() { _token = null }

// ── Core request helper ──────────────────────────────────────────────────
async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (_token) headers['Authorization'] = `Bearer ${_token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let errMsg = `API error: ${res.status}`
    try {
      const body = await res.json()
      errMsg = body.error || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Users ────────────────────────────────────────────────────────────────
export const usersApi = {
  getMe: () => request('/users/me'),
  updateMe: (data) => request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getAll: () => request('/users'),
}

// ── Events ───────────────────────────────────────────────────────────────
export const eventsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/events${qs ? '?' + qs : ''}`)
  },
  getById: (id) => request(`/events/${id}`),
  create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  changeStatus: (id, status) => request(`/events/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleFeatured: (id) => request(`/events/${id}/featured`, { method: 'PATCH' }),
}

// ── Products ─────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/products${qs ? '?' + qs : ''}`)
  },
  getById: (id) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),
}

// ── Cart ─────────────────────────────────────────────────────────────────
export const cartApi = {
  get: () => request('/cart'),
  add: (product_id) => request('/cart', { method: 'POST', body: JSON.stringify({ product_id }) }),
  updateQty: (id, quantity) => request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' }),
}

// ── Wishlist ─────────────────────────────────────────────────────────────
export const wishlistApi = {
  get: () => request('/wishlist'),
  toggle: (product_id) => request('/wishlist', { method: 'POST', body: JSON.stringify({ product_id }) }),
}

// ── Orders ───────────────────────────────────────────────────────────────
export const ordersApi = {
  getMine: () => request('/orders'),
  create: (items, total) => request('/orders', { method: 'POST', body: JSON.stringify({ items, total }) }),
}

// ── Reservations ─────────────────────────────────────────────────────────
export const reservationsApi = {
  getMine: () => request('/reservations'),
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/reservations/all${qs ? '?' + qs : ''}`)
  },
  create: (data) => request('/reservations', { method: 'POST', body: JSON.stringify(data) }),
  verifyQR: (qr_payload) => request('/reservations/verify-qr', { method: 'POST', body: JSON.stringify({ qr_payload }) }),
}

// ── Org Requests ─────────────────────────────────────────────────────────
export const orgRequestsApi = {
  submit: (data) => request('/org-requests', { method: 'POST', body: JSON.stringify(data) }),
  getMine: () => request('/org-requests/mine'),
  getAll: () => request('/org-requests'),
  approve: (id) => request(`/org-requests/${id}/approve`, { method: 'PATCH' }),
  reject: (id, reason) => request(`/org-requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
}

// ── Reviews ──────────────────────────────────────────────────────────────
export const reviewsApi = {
  getForEvent: (eventId) => request(`/reviews/event/${eventId}`),
  create: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Community ────────────────────────────────────────────────────────────
export const communityApi = {
  getPosts: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/community/posts${qs ? '?' + qs : ''}`)
  },
  createPost: (data) => request('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
  likePost: (id) => request(`/community/posts/${id}/like`, { method: 'POST' }),
  addComment: (id, content) => request(`/community/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  getChat: () => request('/community/chat'),
  sendChat: (message) => request('/community/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}

// ── Destinations ─────────────────────────────────────────────────────────
export const destinationsApi = {
  getAll: () => request('/destinations'),
}
