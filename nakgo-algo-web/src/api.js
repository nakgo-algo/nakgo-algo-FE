const API_BASE = '/api'

function getToken() {
  return localStorage.getItem('accessToken')
}

function setToken(token) {
  localStorage.setItem('accessToken', token)
}

function clearToken() {
  localStorage.removeItem('accessToken')
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    clearToken()
    throw { status: 401, message: 'Unauthorized' }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.message || 'Error' }
  }

  if (res.status === 204) return null
  return res.json()
}

async function uploadRequest(path, formData) {
  const headers = {}
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (res.status === 401) {
    clearToken()
    throw { status: 401, message: 'Unauthorized' }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw { status: res.status, message: body.message || 'Error' }
  }

  if (res.status === 204) return null
  return res.json()
}

const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => uploadRequest(path, formData),
  setToken,
  getToken,
  clearToken,
}

export default api
