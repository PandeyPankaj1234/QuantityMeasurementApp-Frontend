import axios from 'axios'

// All URLs are relative — Vite proxy (vite.config.js) forwards them to http://localhost:8082
// /auth/**           → http://localhost:8082/auth/**
// /api/v1/**         → http://localhost:8082/api/v1/**
// /oauth2/**         → http://localhost:8082/oauth2/**

const QUANTITY_URL = '/api/v1/quantities'

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email, password) =>
    axios.post('/auth/login', { email, password }),

  register: (name, email, password) =>
    axios.post('/auth/register', { name, email, password }),

  // Navigates browser to Google OAuth — proxied through Vite to Spring Boot
  googleLogin: () => {
    window.location.href = '/oauth2/authorization/google'
  },
}

// ─── Quantity API ─────────────────────────────────────────────────────────────

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

const quantityBody = (value1, unit1, value2, unit2, type) => ({
  thisQuantityDTO: { value: value1, unit: unit1, measurementType: type },
  thatQuantityDTO: { value: value2, unit: unit2, measurementType: type },
})

export const quantityApi = {
  compare: (v1, u1, v2, u2, type) =>
    axios.post(`${QUANTITY_URL}/compare`, quantityBody(v1, u1, v2, u2, type), { headers: getHeaders() }),

  convert: (v1, u1, v2, u2, type) =>
    axios.post(`${QUANTITY_URL}/convert`, quantityBody(v1, u1, v2, u2, type), { headers: getHeaders() }),

  add: (v1, u1, v2, u2, type) =>
    axios.post(`${QUANTITY_URL}/add`, quantityBody(v1, u1, v2, u2, type), { headers: getHeaders() }),

  subtract: (v1, u1, v2, u2, type) =>
    axios.post(`${QUANTITY_URL}/subtract`, quantityBody(v1, u1, v2, u2, type), { headers: getHeaders() }),

  divide: (v1, u1, v2, u2, type) =>
    axios.post(`${QUANTITY_URL}/divide`, quantityBody(v1, u1, v2, u2, type), { headers: getHeaders() }),

  getHistory: (operation) =>
    axios.get(`${QUANTITY_URL}/history/operation/${operation}`, { headers: getHeaders() }),
}
