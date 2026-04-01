import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
  })

  const saveSession = useCallback((res) => {
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify({ email: res.email, name: res.name }))
    setToken(res.token)
    setUser({ email: res.email, name: res.name })
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    setToken(null)
    setUser(null)
  }, [])

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ token, user, saveSession, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
